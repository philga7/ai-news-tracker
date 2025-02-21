import { scrapeOriginalURL } from '../src/lib/cfp.scrape.original.url';
import { format } from 'date-fns';
import axios from 'axios';
import Parser from 'rss-parser';

interface CFPItem {
  title: string;
  link: string;
  pubDate: string;
  isoDate?: string;
}

async function testCFPFeed() {
  console.log('🔍 Starting CFP feed inspection...');
  const parser = new Parser<CFPItem>();

  try {
    // Fetch feed items directly
    console.log('\nFetching feed items...');
    const response = await axios.get('https://citizenfreepress.com/feed', {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const feed = await parser.parseString(response.data);
    // Filter out any items that don't have required fields
    const items = feed.items
      .filter((item): item is CFPItem => 
        typeof item.link === 'string' && 
        typeof item.pubDate === 'string' &&
        typeof item.title === 'string'
      )
      .slice(0, 20);
    console.log(`✅ Retrieved ${items.length} items from feed\n`);

    // Display details for each item
    for (const [index, item] of items.entries()) {
      console.log(`📰 Item ${index + 1}:`);
      console.log(`Title: ${item.title}`);
      console.log(`CFP URL: ${item.link}`);
      
      try {
        const originalUrl = await scrapeOriginalURL(item.link);
        console.log(`Original Source URL: ${originalUrl}`);
        
        if (originalUrl) {
          const url = new URL(originalUrl);
          const domain = url.hostname.replace('www.', '');
          console.log(`Source Domain: ${domain}`);
        }
      } catch (e) {
        console.log('⚠️ Could not fetch original URL:', e.message);
      }

      console.log(`Published: ${format(new Date(item.pubDate), 'MMM d, yyyy h:mm a')}`);
      console.log('───────────────────\n');

      // Rate limiting protection
      if (index < items.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

  } catch (error) {
    console.error('❌ Error during feed inspection:', error);
  }
}

// Run the inspection
testCFPFeed();
