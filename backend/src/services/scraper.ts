import axios, { AxiosError } from 'axios';
import { DELAYS } from '../config/sources';

// Browser-like headers to avoid blocking
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Cache-Control': 'max-age=0'
};

// Sleep utility
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch HTML from a URL with retry logic
export async function fetchHTML(url: string, maxRetries = 3): Promise<string | null> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🌐 Fetching ${url} (attempt ${attempt}/${maxRetries})...`);

      const response = await axios.get(url, {
        headers: BROWSER_HEADERS,
        timeout: 15000, // 15 second timeout
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400
      });

      console.log(`✅ Successfully fetched ${url} (${response.data.length} bytes)`);
      return response.data;

    } catch (error) {
      lastError = error as Error;
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        console.error(`❌ HTTP ${axiosError.response.status} from ${url}`);

        // Don't retry on 4xx errors (client errors)
        if (axiosError.response.status >= 400 && axiosError.response.status < 500) {
          console.error(`   Client error - skipping retries`);
          break;
        }
      } else if (axiosError.code === 'ECONNABORTED') {
        console.error(`❌ Timeout fetching ${url}`);
      } else {
        console.error(`❌ Error fetching ${url}: ${axiosError.message}`);
      }

      // Exponential backoff before retry
      if (attempt < maxRetries) {
        const delay = DELAYS.RETRY_BASE * Math.pow(2, attempt - 1);
        console.log(`   Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  console.error(`💥 Failed to fetch ${url} after ${maxRetries} attempts`);
  return null;
}

// Fetch HTML from multiple URLs with delays between requests
export async function fetchMultipleHTML(urls: string[]): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const html = await fetchHTML(url);

    if (html) {
      results.set(url, html);
    }

    // Add delay between sources (except after the last one)
    if (i < urls.length - 1) {
      console.log(`⏳ Waiting ${DELAYS.BETWEEN_SOURCES}ms before next source...`);
      await sleep(DELAYS.BETWEEN_SOURCES);
    }
  }

  return results;
}
