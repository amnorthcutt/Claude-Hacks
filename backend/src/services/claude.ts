import Anthropic from '@anthropic-ai/sdk';
import { RawEvent, EventCategory, CategoryResponse } from '../types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const MODEL = 'claude-sonnet-4-5-20250929';

// Sleep utility for rate limiting
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Extract events from HTML using Claude
export async function extractEvents(html: string, sourceUrl: string): Promise<RawEvent[]> {
  try {
    console.log(`🤖 Extracting events from ${sourceUrl} using Claude...`);

    // Truncate HTML if too long (Claude has context limits)
    const truncatedHTML = html.length > 100000 ? html.substring(0, 100000) : html;

    const prompt = `You are a JSON extractor. Given this raw HTML from a UW-Madison area events page, extract ALL events you can find.

For each event, return a JSON object with these fields:
- name: Event title/name (required)
- description: Full event description (or null)
- start_time: ISO8601 datetime or null if not found
- end_time: ISO8601 datetime or null if not found
- tags: Array of relevant tags like ["concert", "free", "student"] (or empty array)
- organization: Hosting organization name or null
- location: Object with {name, address} or null if not found
- link: Direct URL to event details (or null)

Return ONLY a JSON array of event objects. No markdown, no explanations.

HTML:
${truncatedHTML}`;

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract text from response
    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => block.type === 'text' ? block.text : '')
      .join('');

    // Parse JSON response
    let events: RawEvent[] = [];
    try {
      // Remove markdown code blocks if present
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      events = JSON.parse(cleanedText);

      if (!Array.isArray(events)) {
        console.error('❌ Claude response is not an array');
        return [];
      }

      console.log(`✅ Extracted ${events.length} events from ${sourceUrl}`);
      return events;

    } catch (parseError) {
      console.error(`❌ Failed to parse Claude response as JSON:`, parseError);
      console.error('Response text:', responseText.substring(0, 500));
      return [];
    }

  } catch (error: any) {
    console.error(`❌ Claude API error for ${sourceUrl}:`, error.message);

    // Handle rate limiting
    if (error.status === 429) {
      console.log('⏳ Rate limited, waiting 5 seconds...');
      await sleep(5000);
    }

    return [];
  }
}

// Categorize an event using Claude
export async function categorizeEvent(event: RawEvent): Promise<EventCategory> {
  try {
    const prompt = `You are an event taxonomy model. Given this event, return the single best category.

Event name: ${event.name}
Description: ${event.description || 'None'}
Tags: ${event.tags.join(', ') || 'None'}

Return ONLY a JSON object:
{
  "category": "sports|academic|social|arts|food|other",
  "confidence": 0.85
}`;

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract text from response
    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => block.type === 'text' ? block.text : '')
      .join('');

    // Parse JSON response
    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const result: CategoryResponse = JSON.parse(cleanedText);
    return result.category;

  } catch (error: any) {
    console.error(`❌ Failed to categorize event "${event.name}":`, error.message);

    // Fallback to 'other' category
    return 'other';
  }
}

// Batch categorize events (with rate limiting)
export async function categorizeEvents(events: RawEvent[]): Promise<EventCategory[]> {
  const categories: EventCategory[] = [];

  for (let i = 0; i < events.length; i++) {
    const category = await categorizeEvent(events[i]);
    categories.push(category);

    // Small delay between categorization requests
    if (i < events.length - 1) {
      await sleep(500);
    }
  }

  return categories;
}
