import Parser from 'rss-parser';
import axios from 'axios';
import { supabaseAdmin as supabase } from './supabaseClient'; 
import { scrapeOriginalURL } from './cfp.scrape.original.url';

type CFPItem = {
  title: string;
  link: string;
  pubDate: string;
  isoDate?: string;
};

const parser = new Parser({
  maxRedirects: 3,
  customFields: {
    item: ['isoDate']
  }
});

async function fetchRawFeed() {
  try {
    console.log('Fetching CFP feed...');
    const response = await axios.get('https://citizenfreepress.com/feed', {
      timeout: 5000, // 5 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    console.log('Feed fetched successfully');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching feed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
    }
    throw error;
  }
}

export async function fetchCFPFeed() {
  try {
    // Step 1: Fetch the raw feed
    const rawFeed = await fetchRawFeed();

    // Step 2: Parse the feed
    console.log('Parsing feed...');
    const feed = await parser.parseString(rawFeed);
    const items = feed.items.slice(0, 20) as CFPItem[];
    console.log(`Parsed ${items.length} items`);

    // Step 3: Process each item
    const processedItems: CFPItem[] = [];
    for (const item of items) {
      try {
        console.log(`Processing item: ${item.title}`);
        
        // First check if the article already exists
        const { data: existingArticle, error: lookupError } = await supabase
          .from('articles')
          .select('url, original_url')
          .eq('url', item.link)
          .single();
        
        if (lookupError && lookupError.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('Error checking for existing article:', lookupError);
          continue;
        }
    
        // If article exists and has an original_url, skip it
        if (existingArticle?.original_url) {
          console.log(`Skipping existing article: ${item.title}`);
          continue;
        }
    
        // Only proceed with scraping and upserting if:
        // 1. Article doesn't exist, or
        // 2. Article exists but needs original_url
        const originalUrl = await scrapeOriginalURL(item.link);

        // Create a properly mapped article object
        const articleData = {
          title: item.title,
          url: item.link,
          original_url: originalUrl,
          source: 'Citizen Free Press',
          timestamp: item.isoDate || item.pubDate,
          category: 'CFP',
          is_cfp: true,
        };

        console.log('Processing article:', JSON.stringify(articleData, null, 2));

        // Single upsert operation
        const { error } = await supabase
          .from('articles')
          .upsert(articleData, {
            onConflict: 'url'
          });

        if (error) {
          console.error('Upsert error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            data: articleData
          });
          continue;
        }

        processedItems.push(item);

      } catch (itemError) {
        console.error(`Error processing item ${item.title}:`, itemError);
        // Continue with next item
        continue;
      }
    }

    return processedItems;
  } catch (error) {
    console.error('Fatal error in fetchCFPFeed:', error);
    return [];
  }
}
