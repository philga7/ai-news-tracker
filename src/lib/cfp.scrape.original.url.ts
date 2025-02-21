import axios from 'axios';
import { Agent } from 'https';

const httpsAgent = new Agent({
  rejectUnauthorized: false, // Warning: Only use this for scraping known sites
  timeout: 30000,
});

/**
 * Scrapes the actual third-party URL from Citizen Free Press article pages.
 * @param {string} pageURL - URL of the CFP article page.
 * @returns {Promise<string>} - Resolved original article URL.
 */
export async function scrapeOriginalURL(pageURL: string): Promise<string> {
    // Basic URL validation
    try {
        new URL(pageURL);
    } catch {
        return pageURL; // Return invalid URL immediately
    }

    try {
      const response = await axios.get(pageURL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0',
        },
        timeout: 30000, // 10 second timeout
        maxRedirects: 5, // Handle up to 5 redirects
        httpsAgent,
        validateStatus: (status) => status < 500, // Accept all responses except 500+ errors
      });
      
      if (response.status === 403) {
        console.warn(`Access forbidden for ${pageURL}, falling back to original URL`);
        return pageURL;
      }

      if (response.status !== 200) {
        console.warn(`Unexpected status ${response.status} for ${pageURL}`);
        return pageURL;
      }
      
      const data = await response.data;
      
      // Enhanced regex pattern to find external links
      const patterns = [
        /href="(https?:\/\/(?!citizenfreepress\.com)[^"]+)"/i,
        /canonical.*?href="([^"]+)"/i,
        /og:url.*?content="([^"]+)"/i
      ];

      for (const pattern of patterns) {
        const match = data.match(pattern);
        if (match && match[1]) {
          try {
            const url = new URL(match[1]);
            if (!url.hostname.includes('citizenfreepress.com')) {
              return match[1];
            }
          } catch {
            continue;
          }
        }
      }
  
      return pageURL; // Fallback to original link if no external link found
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorCode = error.code || 'UNKNOWN';
        const errorMessage = error.message || 'Unknown error';
        console.warn(`Axios error scraping ${pageURL}: ${errorCode} - ${errorMessage}`);
      } else {
        console.error(`Unexpected error while scraping ${pageURL}:`, error);
      }
      return pageURL;
    }
}