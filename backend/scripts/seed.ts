import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase, insertEvents, deleteAllEvents, getStats } from '../src/db/database';
import { fetchHTML } from '../src/services/scraper';
import { extractEvents, categorizeEvent } from '../src/services/claude';
import { geocodeLocation } from '../src/services/geocoder';
import { EVENT_SOURCES, DELAYS, CAMPUS_CENTER } from '../src/config/sources';
import { Event, RawEvent } from '../src/types';

// Load environment variables
dotenv.config();

// Sleep utility
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function seedDatabase() {
  console.log('\n🌱 Starting event scraping and seeding process...\n');
  console.log('=' .repeat(60));

  // Initialize database
  initializeDatabase();

  // Clear existing events
  console.log('\n🗑️  Clearing existing events...');
  deleteAllEvents();

  const allEvents: Event[] = [];
  let successfulSources = 0;
  let failedSources = 0;

  // Process each event source
  for (let i = 0; i < EVENT_SOURCES.length; i++) {
    const source = EVENT_SOURCES[i];

    if (!source.enabled) {
      console.log(`\n⏭️  Skipping disabled source: ${source.name}`);
      continue;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📡 Source ${i + 1}/${EVENT_SOURCES.length}: ${source.name}`);
    console.log(`   URL: ${source.url}`);
    console.log(`${'='.repeat(60)}`);

    try {
      // Step 1: Fetch HTML
      const html = await fetchHTML(source.url);

      if (!html) {
        console.log(`❌ Failed to fetch HTML from ${source.name}`);
        failedSources++;
        continue;
      }

      // Step 2: Extract events using Claude
      const rawEvents = await extractEvents(html, source.url);

      if (rawEvents.length === 0) {
        console.log(`⚠️  No events extracted from ${source.name}`);
        failedSources++;
        continue;
      }

      console.log(`\n📋 Processing ${rawEvents.length} events from ${source.name}...`);

      // Step 3: Process each extracted event
      for (let j = 0; j < rawEvents.length; j++) {
        const rawEvent = rawEvents[j];
        console.log(`\n   Event ${j + 1}/${rawEvents.length}: "${rawEvent.name}"`);

        try {
          // Categorize event
          console.log(`   🏷️  Categorizing...`);
          const category = await categorizeEvent(rawEvent);
          console.log(`   ✅ Category: ${category}`);

          // Geocode location
          let latitude: number | null = null;
          let longitude: number | null = null;

          if (rawEvent.location?.name) {
            console.log(`   📍 Geocoding "${rawEvent.location.name}"...`);
            const coords = await geocodeLocation(
              rawEvent.location.name,
              rawEvent.location.address
            );

            if (coords) {
              latitude = coords.lat;
              longitude = coords.lng;
              console.log(`   ✅ Coordinates: (${latitude}, ${longitude})`);
            } else {
              console.log(`   ⚠️  Geocoding failed, will use null coordinates`);
            }
          }

          // Create full event object
          const event: Event = {
            id: uuidv4(),
            name: rawEvent.name,
            description: rawEvent.description,
            start_time: rawEvent.start_time,
            end_time: rawEvent.end_time,
            category,
            tags: rawEvent.tags || [],
            organization: rawEvent.organization,
            location_name: rawEvent.location?.name || null,
            location_address: rawEvent.location?.address || null,
            latitude,
            longitude,
            link: rawEvent.link,
            source_url: source.url,
            scraped_at: new Date().toISOString()
          };

          allEvents.push(event);
          console.log(`   ✅ Event processed successfully`);

        } catch (error: any) {
          console.error(`   ❌ Error processing event "${rawEvent.name}":`, error.message);
          continue;
        }
      }

      successfulSources++;
      console.log(`\n✅ Completed ${source.name}: ${rawEvents.length} events processed`);

    } catch (error: any) {
      console.error(`\n❌ Error processing source ${source.name}:`, error.message);
      failedSources++;
    }

    // Delay before next source (except for the last one)
    if (i < EVENT_SOURCES.length - 1) {
      console.log(`\n⏳ Waiting ${DELAYS.BETWEEN_SOURCES / 1000} seconds before next source...`);
      await sleep(DELAYS.BETWEEN_SOURCES);
    }
  }

  // Insert all events into database
  console.log(`\n${'='.repeat(60)}`);
  console.log('💾 Saving events to database...');
  console.log(`${'='.repeat(60)}`);

  if (allEvents.length > 0) {
    insertEvents(allEvents);
    console.log(`✅ Saved ${allEvents.length} events to database`);
  } else {
    console.log('⚠️  No events to save');
  }

  // Display statistics
  const stats = getStats();
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 FINAL STATISTICS');
  console.log(`${'='.repeat(60)}`);
  console.log(`Total events: ${stats.totalEvents}`);
  console.log(`Successful sources: ${successfulSources}/${EVENT_SOURCES.length}`);
  console.log(`Failed sources: ${failedSources}/${EVENT_SOURCES.length}`);
  console.log(`\nEvents by category:`);
  Object.entries(stats.eventsByCategory).forEach(([category, count]) => {
    console.log(`  - ${category}: ${count}`);
  });
  console.log(`\n✅ Seeding complete!\n`);

  process.exit(0);
}

// Run the seeding process
seedDatabase().catch(error => {
  console.error('\n💥 Fatal error during seeding:', error);
  process.exit(1);
});
