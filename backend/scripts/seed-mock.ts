import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase, insertEvents, deleteAllEvents, getStats } from '../src/db/database';
import { Event, EventCategory } from '../src/types';

// Load environment variables
dotenv.config();

// Pre-defined coordinates for UW-Madison locations
const LOCATION_COORDS: Record<string, { lat: number; lng: number }> = {
  'Camp Randall Stadium': { lat: 43.0700, lng: -89.4124 },
  'Chemistry Building': { lat: 43.0721, lng: -89.4012 },
  'Memorial Union': { lat: 43.0766, lng: -89.3985 },
  'Computer Sciences Building': { lat: 43.0717, lng: -89.4068 },
  'Capitol Square': { lat: 43.0747, lng: -89.3842 },
  'Elvehjem Museum of Art': { lat: 43.0762, lng: -89.4018 },
  'Kohl Center': { lat: 43.0708, lng: -89.3998 },
  'Union South': { lat: 43.0713, lng: -89.3977 },
  'Engineering Hall': { lat: 43.0713, lng: -89.4109 },
  'Bascom Hill': { lat: 43.0751, lng: -89.4036 },
  'Vilas Hall': { lat: 43.0759, lng: -89.4063 },
  'Science Hall': { lat: 43.0752, lng: -89.4017 },
  'UW Field House': { lat: 43.0701, lng: -89.4121 },
  'Discovery Building': { lat: 43.0731, lng: -89.4091 },
  'Mills Hall': { lat: 43.0758, lng: -89.4053 },
  'Library Mall': { lat: 43.0748, lng: -89.4000 },
  'Bascom Hall': { lat: 43.0751, lng: -89.4036 }
};

// Mock events data - realistic UW-Madison events
const MOCK_EVENTS = [
  {
    name: 'Badgers vs Michigan - Football Game',
    description: 'Join us at Camp Randall Stadium for an exciting Big Ten matchup as the Wisconsin Badgers take on Michigan. Gates open 2 hours before kickoff. Student section seating available.',
    start_time: '2024-11-23T14:00:00-06:00',
    end_time: '2024-11-23T17:00:00-06:00',
    category: 'sports' as EventCategory,
    tags: ['football', 'athletics', 'big-ten'],
    organization: 'UW Athletics',
    location: { name: 'Camp Randall Stadium', address: '1440 Monroe St, Madison, WI' },
    link: 'https://uwbadgers.com/sports/football'
  },
  {
    name: 'Organic Chemistry Study Session',
    description: 'Free peer-led study session for CHEM 343 students. Review reaction mechanisms, stereochemistry, and prepare for upcoming exams. All students welcome.',
    start_time: '2024-11-21T18:00:00-06:00',
    end_time: '2024-11-21T20:00:00-06:00',
    category: 'academic' as EventCategory,
    tags: ['study-session', 'chemistry', 'stem'],
    organization: 'Chemistry Learning Center',
    location: { name: 'Chemistry Building', address: '1101 University Ave, Madison, WI' },
    link: 'https://today.wisc.edu'
  },
  {
    name: 'Memorial Union Terrace Live Music',
    description: 'Enjoy live acoustic music on the Terrace featuring local Madison artists. Grab a Babcock ice cream and relax by the lake. Free admission.',
    start_time: '2024-11-20T19:00:00-06:00',
    end_time: '2024-11-20T22:00:00-06:00',
    category: 'social' as EventCategory,
    tags: ['music', 'terrace', 'free'],
    organization: 'Wisconsin Union',
    location: { name: 'Memorial Union', address: '800 Langdon St, Madison, WI' },
    link: 'https://union.wisc.edu/events'
  },
  {
    name: 'Guest Lecture: AI and Society',
    description: 'Distinguished professor Dr. Sarah Chen discusses the ethical implications of artificial intelligence in modern society. Q&A session to follow.',
    start_time: '2024-11-22T16:00:00-06:00',
    end_time: '2024-11-22T17:30:00-06:00',
    category: 'academic' as EventCategory,
    tags: ['lecture', 'ai', 'ethics', 'computer-science'],
    organization: 'Computer Sciences Department',
    location: { name: 'Computer Sciences Building', address: '1210 W Dayton St, Madison, WI' },
    link: 'https://today.wisc.edu'
  },
  {
    name: 'Farmers Market on the Square',
    description: 'Fresh local produce, artisan cheeses, baked goods, and crafts from Wisconsin farmers and vendors. Saturdays through October.',
    start_time: '2024-11-23T08:00:00-06:00',
    end_time: '2024-11-23T14:00:00-06:00',
    category: 'food' as EventCategory,
    tags: ['farmers-market', 'local-food', 'community'],
    organization: 'Dane County Farmers Market',
    location: { name: 'Capitol Square', address: 'Capitol Square, Madison, WI' },
    link: 'https://www.visitmadison.com'
  },
  {
    name: 'Art History Symposium',
    description: 'Annual symposium featuring presentations by graduate students on topics ranging from Renaissance art to contemporary installations.',
    start_time: '2024-11-25T13:00:00-06:00',
    end_time: '2024-11-25T17:00:00-06:00',
    category: 'arts' as EventCategory,
    tags: ['art-history', 'symposium', 'graduate-research'],
    organization: 'Art History Department',
    location: { name: 'Elvehjem Museum of Art', address: '800 University Ave, Madison, WI' },
    link: 'https://today.wisc.edu'
  },
  {
    name: 'Badgers Hockey vs Minnesota',
    description: 'Rivalry night at the Kohl Center! Watch the Badgers hockey team battle Minnesota in this classic Big Ten matchup. Student rush tickets available.',
    start_time: '2024-11-24T19:00:00-06:00',
    end_time: '2024-11-24T21:30:00-06:00',
    category: 'sports' as EventCategory,
    tags: ['hockey', 'athletics', 'rivalry'],
    organization: 'UW Athletics',
    location: { name: 'Kohl Center', address: '601 W Dayton St, Madison, WI' },
    link: 'https://uwbadgers.com/sports/hockey'
  },
  {
    name: 'International Food Festival',
    description: 'Celebrate cultural diversity through food! Sample cuisines from around the world prepared by international student organizations. All proceeds support study abroad scholarships.',
    start_time: '2024-11-26T17:00:00-06:00',
    end_time: '2024-11-26T21:00:00-06:00',
    category: 'food' as EventCategory,
    tags: ['international', 'food-festival', 'cultural'],
    organization: 'International Student Services',
    location: { name: 'Union South', address: '1308 W Dayton St, Madison, WI' },
    link: 'https://union.wisc.edu'
  },
  {
    name: 'Career Fair - Engineering & Tech',
    description: 'Connect with top employers in engineering and technology. Bring resumes and dress professionally. Open to all majors interested in technical careers.',
    start_time: '2024-11-27T10:00:00-06:00',
    end_time: '2024-11-27T15:00:00-06:00',
    category: 'academic' as EventCategory,
    tags: ['career-fair', 'engineering', 'recruitment'],
    organization: 'College of Engineering',
    location: { name: 'Kohl Center', address: '601 W Dayton St, Madison, WI' },
    link: 'https://today.wisc.edu'
  },
  {
    name: 'Open Mic Night',
    description: 'Showcase your talent! Poetry, music, comedy, and more. Sign up at the door or just come to watch. Supportive audience guaranteed.',
    start_time: '2024-11-21T20:00:00-06:00',
    end_time: '2024-11-21T23:00:00-06:00',
    category: 'arts' as EventCategory,
    tags: ['open-mic', 'performance', 'student-life'],
    organization: 'Union South',
    location: { name: 'Union South', address: '1308 W Dayton St, Madison, WI' },
    link: 'https://union.wisc.edu'
  },
  {
    name: 'Swing Dance Social',
    description: 'Learn swing dancing or practice your moves! Beginner lesson from 7-8pm, social dancing 8-10pm. No partner required. All skill levels welcome.',
    start_time: '2024-11-22T19:00:00-06:00',
    end_time: '2024-11-22T22:00:00-06:00',
    category: 'social' as EventCategory,
    tags: ['dance', 'social', 'swing-dancing'],
    organization: 'Madison Swing Dance',
    location: { name: 'Memorial Union', address: '800 Langdon St, Madison, WI' },
    link: 'https://union.wisc.edu'
  },
  {
    name: 'Women in STEM Panel',
    description: 'Hear from successful women in science, technology, engineering, and mathematics about their career journeys, challenges, and advice for students.',
    start_time: '2024-11-25T18:00:00-06:00',
    end_time: '2024-11-25T20:00:00-06:00',
    category: 'academic' as EventCategory,
    tags: ['stem', 'panel', 'diversity', 'women-in-stem'],
    organization: 'Society of Women Engineers',
    location: { name: 'Engineering Hall', address: '1415 Engineering Dr, Madison, WI' },
    link: 'https://today.wisc.edu'
  },
  {
    name: 'Free Yoga on Bascom Hill',
    description: 'Start your day with outdoor yoga! Bring a mat or towel. All levels welcome. Weather permitting.',
    start_time: '2024-11-21T07:00:00-06:00',
    end_time: '2024-11-21T08:00:00-06:00',
    category: 'social' as EventCategory,
    tags: ['yoga', 'wellness', 'outdoor', 'free'],
    organization: 'RecWell',
    location: { name: 'Bascom Hill', address: 'Bascom Hill, Madison, WI' },
    link: 'https://today.wisc.edu'
  },
  {
    name: 'Documentary Film Screening: Climate Change',
    description: 'Award-winning documentary followed by panel discussion with environmental scientists. Free popcorn provided.',
    start_time: '2024-11-23T18:00:00-06:00',
    end_time: '2024-11-23T20:30:00-06:00',
    category: 'arts' as EventCategory,
    tags: ['film', 'documentary', 'environment', 'discussion'],
    organization: 'Environmental Studies',
    location: { name: 'Vilas Hall', address: '821 University Ave, Madison, WI' },
    link: 'https://today.wisc.edu'
  },
  {
    name: 'Pizza with Professors',
    description: 'Informal gathering where students can chat with faculty outside the classroom. Free pizza! Great opportunity to build connections.',
    start_time: '2024-11-26T12:00:00-06:00',
    end_time: '2024-11-26T13:30:00-06:00',
    category: 'food' as EventCategory,
    tags: ['pizza', 'networking', 'faculty', 'free-food'],
    organization: 'Letters & Science',
    location: { name: 'Science Hall', address: '550 N Park St, Madison, WI' },
    link: 'https://today.wisc.edu'
  },
  {
    name: 'Volleyball Senior Night',
    description: 'Celebrate our senior players as the Badgers volleyball team takes on Illinois. Arrive early for senior recognition ceremony.',
    start_time: '2024-11-22T18:00:00-06:00',
    end_time: '2024-11-22T20:00:00-06:00',
    category: 'sports' as EventCategory,
    tags: ['volleyball', 'athletics', 'senior-night'],
    organization: 'UW Athletics',
    location: { name: 'UW Field House', address: '1440 Monroe St, Madison, WI' },
    link: 'https://uwbadgers.com/sports/volleyball'
  },
  {
    name: 'Student Research Symposium',
    description: 'Undergraduate students present their research across all disciplines. Poster session and oral presentations. Open to the public.',
    start_time: '2024-11-27T14:00:00-06:00',
    end_time: '2024-11-27T18:00:00-06:00',
    category: 'academic' as EventCategory,
    tags: ['research', 'undergraduate', 'poster-session'],
    organization: 'Office of Undergraduate Research',
    location: { name: 'Discovery Building', address: '330 N Orchard St, Madison, WI' },
    link: 'https://today.wisc.edu'
  },
  {
    name: 'Jazz Ensemble Concert',
    description: 'UW Jazz Ensemble performs classic and contemporary jazz pieces. Featuring student soloists and special guest artist.',
    start_time: '2024-11-24T15:00:00-06:00',
    end_time: '2024-11-24T17:00:00-06:00',
    category: 'arts' as EventCategory,
    tags: ['jazz', 'music', 'concert', 'performance'],
    organization: 'Mead Witter School of Music',
    location: { name: 'Mills Hall', address: '1025 W Johnson St, Madison, WI' },
    link: 'https://today.wisc.edu'
  },
  {
    name: 'Homecoming Block Party',
    description: 'Annual homecoming celebration with food trucks, live music, games, and Bucky appearances. Free for students with ID.',
    start_time: '2024-11-23T12:00:00-06:00',
    end_time: '2024-11-23T16:00:00-06:00',
    category: 'social' as EventCategory,
    tags: ['homecoming', 'block-party', 'celebration', 'free'],
    organization: 'Wisconsin Alumni Association',
    location: { name: 'Library Mall', address: 'Library Mall, Madison, WI' },
    link: 'https://union.wisc.edu'
  },
  {
    name: 'Graduate School Information Session',
    description: 'Learn about graduate programs, application process, funding opportunities, and hear from current grad students. Q&A session included.',
    start_time: '2024-11-25T17:00:00-06:00',
    end_time: '2024-11-25T18:30:00-06:00',
    category: 'academic' as EventCategory,
    tags: ['graduate-school', 'info-session', 'advising'],
    organization: 'Graduate School',
    location: { name: 'Bascom Hall', address: '500 Lincoln Dr, Madison, WI' },
    link: 'https://today.wisc.edu'
  },
  {
    name: 'Badgers Basketball Home Opener',
    description: 'Season opener for Wisconsin basketball at the Kohl Center. Be there for player introductions and halftime entertainment.',
    start_time: '2024-11-26T19:00:00-06:00',
    end_time: '2024-11-26T21:00:00-06:00',
    category: 'sports' as EventCategory,
    tags: ['basketball', 'athletics', 'home-opener'],
    organization: 'UW Athletics',
    location: { name: 'Kohl Center', address: '601 W Dayton St, Madison, WI' },
    link: 'https://uwbadgers.com/sports/basketball'
  },
  {
    name: 'Thanksgiving Dinner at Memorial Union',
    description: 'Traditional Thanksgiving meal for students staying on campus over break. Free with student ID. Vegetarian options available.',
    start_time: '2024-11-28T16:00:00-06:00',
    end_time: '2024-11-28T19:00:00-06:00',
    category: 'food' as EventCategory,
    tags: ['thanksgiving', 'free-food', 'community-meal'],
    organization: 'Wisconsin Union',
    location: { name: 'Memorial Union', address: '800 Langdon St, Madison, WI' },
    link: 'https://union.wisc.edu'
  },
  {
    name: 'Improv Comedy Show',
    description: 'Student improv troupe performs interactive comedy. Audience participation encouraged! Hilarious entertainment guaranteed.',
    start_time: '2024-11-22T21:00:00-06:00',
    end_time: '2024-11-22T22:30:00-06:00',
    category: 'arts' as EventCategory,
    tags: ['comedy', 'improv', 'performance', 'student-theater'],
    organization: 'UW Comedy Club',
    location: { name: 'Union South', address: '1308 W Dayton St, Madison, WI' },
    link: 'https://union.wisc.edu'
  },
  {
    name: 'Sustainability Fair',
    description: 'Learn about sustainable living, renewable energy, and environmental initiatives on campus. Interactive exhibits and workshops.',
    start_time: '2024-11-21T11:00:00-06:00',
    end_time: '2024-11-21T15:00:00-06:00',
    category: 'academic' as EventCategory,
    tags: ['sustainability', 'environment', 'fair', 'green-living'],
    organization: 'Office of Sustainability',
    location: { name: 'Union South', address: '1308 W Dayton St, Madison, WI' },
    link: 'https://today.wisc.edu'
  },
  {
    name: 'Salsa Dancing Night',
    description: 'Learn salsa dancing from experienced instructors. Beginner-friendly lesson followed by social dancing. No partner necessary!',
    start_time: '2024-11-23T20:00:00-06:00',
    end_time: '2024-11-23T23:00:00-06:00',
    category: 'social' as EventCategory,
    tags: ['dance', 'salsa', 'latin-dance', 'social'],
    organization: 'Latin Dance Club',
    location: { name: 'Memorial Union', address: '800 Langdon St, Madison, WI' },
    link: 'https://union.wisc.edu'
  }
];

async function seedMockData() {
  console.log('\n🌱 Starting mock data seeding process...\n');
  console.log('=' .repeat(60));

  // Initialize database
  initializeDatabase();

  // Clear existing events
  console.log('\n🗑️  Clearing existing events...');
  deleteAllEvents();

  const allEvents: Event[] = [];
  const now = new Date().toISOString();

  console.log(`\n📋 Processing ${MOCK_EVENTS.length} mock events...\n`);

  for (let i = 0; i < MOCK_EVENTS.length; i++) {
    const mockEvent = MOCK_EVENTS[i];
    console.log(`Event ${i + 1}/${MOCK_EVENTS.length}: "${mockEvent.name}"`);

    try {
      // Get pre-defined coordinates for this location
      const coords = LOCATION_COORDS[mockEvent.location.name];
      const latitude = coords?.lat || 43.0731;
      const longitude = coords?.lng || -89.4012;

      console.log(`  📍 Location: ${mockEvent.location.name} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);

      // Create full event object
      const event: Event = {
        id: uuidv4(),
        name: mockEvent.name,
        description: mockEvent.description,
        start_time: mockEvent.start_time,
        end_time: mockEvent.end_time,
        category: mockEvent.category,
        tags: mockEvent.tags,
        organization: mockEvent.organization,
        location_name: mockEvent.location.name,
        location_address: mockEvent.location.address,
        latitude,
        longitude,
        link: 'https://today.wisc.edu',
        source_url: 'https://today.wisc.edu',
        scraped_at: now
      };

      allEvents.push(event);
      console.log(`  ✅ Event processed\n`);

    } catch (error: any) {
      console.error(`  ❌ Error processing event:`, error.message, '\n');
      continue;
    }
  }

  // Insert all events into database
  console.log(`${'='.repeat(60)}`);
  console.log('💾 Saving events to database...');
  console.log(`${'='.repeat(60)}\n`);

  if (allEvents.length > 0) {
    insertEvents(allEvents);
    console.log(`✅ Saved ${allEvents.length} events to database`);
  }

  // Display statistics
  const stats = getStats();
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 FINAL STATISTICS');
  console.log(`${'='.repeat(60)}`);
  console.log(`Total events: ${stats.totalEvents}`);
  console.log(`\nEvents by category:`);
  Object.entries(stats.eventsByCategory).forEach(([category, count]) => {
    console.log(`  - ${category}: ${count}`);
  });
  console.log(`\n✅ Mock data seeding complete!\n`);

  process.exit(0);
}

// Run the seeding process
seedMockData().catch(error => {
  console.error('\n💥 Fatal error during seeding:', error);
  process.exit(1);
});
