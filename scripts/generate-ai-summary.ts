import { pipeline } from '@xenova/transformers';
import { supabaseAdmin } from '../src/lib/supabaseClient'; // Import your Supabase client
import { chromium } from 'playwright';

// Helper function for browser setup
async function createBrowserPage() {
  const browser = await chromium.launch({ 
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--window-size=1920,1080'
    ]
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    geolocation: { longitude: -122.4194, latitude: 37.7749 }, // Add location
    locale: 'en-US',
    timezoneId: 'America/Los_Angeles',
    permissions: ['geolocation'],
    // Add common browser characteristics
    hasTouch: false,
    isMobile: false,
    deviceScaleFactor: 1,
  });

  // Add random delay between actions
  context.setDefaultTimeout(30000);
  context.setDefaultNavigationTimeout(30000);

  const page = await context.newPage();

  // Add random mouse movements
  await page.mouse.move(Math.random() * 500, Math.random() * 500);

  return { browser, page };
}

async function fetchArticleContent(url: string): Promise<{ content: string; isSpecialCase: boolean}> {
  // Check for special URLs
  if (url.includes('twitter.com') || url.includes('x.com')) {
    return {
      content: await fetchTweetContent(url),
      isSpecialCase: true
    };
  }

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return {
      content: await fetchYouTubeContent(url),
      isSpecialCase: true
    };
  }

  // Add archive site detection
  const isArchived = url.match(/archive\.(is|org|ph|today|fo|md|vn)/i) !== null;

  if (isArchived) {
    return await fetchArchivedContent(url);
  }
  
  // Add MSN check at the beginning
  if (url.includes('msn.com')) {
    return {
      content: `This is an MSN-based domain that can't be summarized at ${url}`,
      isSpecialCase: true
    };
  }

  if (url.includes('cnn.com')) {

    const { browser, page } = await createBrowserPage();
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 10000 
    }).catch(() => {
      console.log('Networkidle not achieved, proceeding with content extraction anyway');
    });
    console.log(`Fetching article content from ${url}...`);
    
    await browser.close();

    const cnnContent = await page.evaluate(() => {
      // CNN-specific selectors
      const selectors = [
        '.article__content', // Main article content
        '.article-body__content', // Alternative content container
        '.body-text', // Individual paragraphs
        '[data-type="article-body"]', // Article body container
        '.zn-body__paragraph', // CNN paragraphs
        '.l-container' // Generic container
      ];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          // Combine all matching elements' text
          return Array.from(elements)
            .map(el => el.textContent)
            .join(' ')
            .trim();
        }
      }
      return null;
    });
  
    if (cnnContent) {
      return {
        content: cnnContent.replace(/\s+/g, ' ').trim(),
        isSpecialCase: false
      };
    }
  }

  if (url.includes('espn.com')) {
    const { browser, page } = await createBrowserPage();
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 10000 
    }).catch(() => {
      console.log('Networkidle not achieved, proceeding with content extraction anyway');
    });
    console.log(`Fetching ESPN article content from ${url}...`);
    
    const espnContent = await page.evaluate(() => {
      const articleBody = document.querySelector('.article-body');
      return articleBody ? articleBody.textContent : null;
    });
  
    await browser.close();
  
    if (espnContent) {
      return {
        content: espnContent.replace(/\s+/g, ' ').trim(),
        isSpecialCase: false
      };
    }
  }

  // First, check the URL itself for live blog indicators
  const liveBlogUrlPatterns = [
    '/live/',
    '/live-',
    'live-updates',
    'live-blog',
    'live-coverage',
    'liveblog',
    'live-stream',
    'breaking-news',
    'breaking-live',
    'updates-live'
  ];

  // Check if any of the patterns exist in the URL
  const isLiveFromUrl = liveBlogUrlPatterns.some(pattern => 
    url.toLowerCase().includes(pattern.toLowerCase())
  );

  if (isLiveFromUrl) {
    return {
      content: `This article is part of a live blog at ${url}`,
      isSpecialCase: true
    };
  }

  try {
    const { browser, page } = await createBrowserPage();
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 10000 
    }).catch(() => {
      console.log('Networkidle not achieved, proceeding with content extraction anyway');
    });
    console.log(`Fetching article content from ${url}...`);

    // Check if it's a live blog by looking for common live blog indicators
    const isLiveBlog = await page.evaluate(() => {
      const liveBlogIndicators = [
        '.live-blog',
        '[data-component="live-blog"]',
        '.live-updates',
        '.live-coverage',
        'article[data-type="live"]',
        '#live-blog',
        '.live-blog-posts',
        '.live-blog-wrapper',
        '[data-is-live="true"]',
        '.stream-live'
      ];

      // Check for text content indicating live coverage
      const bodyText = document.body.textContent?.toLowerCase() || '';
      const textIndicators = [
        'live updates',
        'live coverage',
        'live blog',
        'breaking news updates',
        'follow live',
        'live streaming coverage'
      ];

      return liveBlogIndicators.some(selector => document.querySelector(selector) !== null) ||
             textIndicators.some(indicator => bodyText.includes(indicator));
    });

    if (isLiveBlog) {
      return {
        content: `This article is part of a live blog at ${url}`,
        isSpecialCase: true
      };
    }

    // Regular article content fetching
    const content = await page.evaluate(() => {
      const selectors = [
        'article',
        'main',
        '.content',
        '.post-content',
        '.entry-content'
      ];
      
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          return element.textContent;
        }
      }
      
      // Fallback to body content if no specific container found
      return document.body.textContent;
    });

    await browser.close();

    return {
      content: content?.replace(/\s+/g, ' ').trim() || '',
      isSpecialCase: false
    };
  } catch (error) {
    console.error('Error fetching article content:', error);
    return { content: '', isSpecialCase: false };
  }
}

async function fetchTweetContent(url: string): Promise<string> {
  try {
    const { browser, page } = await createBrowserPage();
    
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Simple content extraction without any console.log or complex logic
    const tweetText = await page.evaluate(() => {
      const selectors = [
        '[data-testid="tweetText"]',
        'article[data-testid="tweet"] div[lang]',
        '.css-901oao.r-18jsvk2.r-37j5jr.r-a023e6.r-16dba41.r-rjixqe.r-bcqeeo.r-bnwqim.r-qvutc0', // Common tweet text class
      ];

      let content = '';
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          content = element.textContent.trim().replace(/\s+/g, ' ');
          break;
        }
      }
      return content;
    });

    await browser.close();

    if (!tweetText) {
      return `Unable to extract tweet content from ${url}`;
    }

    return tweetText;

  } catch (error) {
    console.error('Error fetching tweet:', error);
    return `Unable to fetch tweet from ${url}`;
  }
}

async function fetchYouTubeContent(url: string): Promise<string> {
  try {
    const { browser, page } = await createBrowserPage();
    await page.goto(url);
    
    // Get video title using multiple potential selectors
    const content = await page.evaluate(() => {
      const selectors = [
        'h1.ytd-video-primary-info-renderer', // New YouTube layout
        '#container h1.ytd-video-primary-info-renderer', // Alternative selector
        'h1.title.style-scope.ytd-video-primary-info-renderer', // Full class path
        '#video-title', // Fallback for older layout
        'title' // Last resort - page title
      ];
      
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element?.textContent) {
          return element.textContent.trim();
        }
      }
      return 'Unable to fetch video title';
    });

    await browser.close();
    return `Video: ${content}`.trim();    
  } catch (error) {
    console.error('Error fetching YouTube content:', error);
    return '';
  }
}

async function fetchArchivedContent(url: string): Promise<{ content: string; isSpecialCase: boolean }> {
  try {
    const { browser, page } = await createBrowserPage();
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 10000 // Increase timeout for archive sites
    }).catch(() => {
      console.log('Networkidle not achieved, proceeding with content extraction anyway');
    });

    await browser.close();

    // Archive.is specific selectors
    const content = await page.evaluate(() => {
      // Try archive.is specific content first
      const archiveContent = document.querySelector('#CONTENT');
      if (archiveContent) {
        return archiveContent.textContent;
      }

      // Fallback selectors for archived content
      const selectors = [
        '#article-content',
        '#content-container',
        '#site-content',
        'article',
        'main',
        '.content',
        '.post-content',
        '.entry-content'
      ];
      
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          return element.textContent;
        }
      }
      
      return document.body.textContent;
    });

    return {
      content: content?.replace(/\s+/g, ' ').trim() || '',
      isSpecialCase: false
    };
  } catch (error) {
    console.error('Error fetching archived content:', error);
    return { content: '', isSpecialCase: false };
  }
}

async function generateSummaries() {
  console.log('Starting summary generation process...');

  // Initialize summarizer once
  const summarizer = await pipeline(
    'summarization',
    'Xenova/bart-large-cnn'
  );

  // Fetch the latest article without a summary from correct table
  const { data: articles, error } = await supabaseAdmin
    .from('articles') // Assuming your table name is `cfp_articles`
    .select('*')
    .or('summary.is.null,summary.eq.\'\'') // This will match both NULL and empty string
    .order('timestamp', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching articles:', error);
    return;
  }

  if (!articles?.length) {
    console.log('No articles found without summaries.');
    return;
  }

  console.log(`Processing ${articles.length} articles...`);

  for (const article of articles) {
    try {
      // Check for existing summary
      const { data: existingSummary } = await supabaseAdmin
        .from('articles')
        .select('summary')
        .eq('original_url', article.original_url)
        .not('summary', 'is', null)
        .not('summary', 'eq', '')
        .limit(1);

      let summary: string;

      if (existingSummary?.[0]?.summary) {
        summary = existingSummary[0].summary;
        console.log(`Using existing summary for ${article.title}`);
      } else {
        const { content, isSpecialCase } = await fetchArticleContent(article.original_url);
        
        if (!content) {
          console.log(`No content could be fetched from URL: ${article.original_url}`);
          continue;
        }

        if (isSpecialCase) {
          summary = content;
        } else {
          const result = await summarizer(content, {
            max_length: 150,
            min_length: 30,
            do_sample: false
          });

          summary = result[0].summary_text.trim();
        }
        console.log(`Generated new summary for ${article.title}`);
      }

      // Update ALL articles with the same original_url
      const { error: updateError } = await supabaseAdmin
        .from('articles')
        .update({ summary })
        .eq('original_url', article.original_url);

      if (updateError) {
        console.error(`Error updating summary for ${article.title}:`, updateError);
      }
    } catch (err) {
      console.error(`Error processing article ${article.title}:`, err);
    }
  }

  console.log('Summary generation process complete');
  process.exit(0);
}

// Run the process
generateSummaries();
