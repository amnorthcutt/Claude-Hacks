import { EventSource } from '../types';

// Event source websites to scrape
export const EVENT_SOURCES: EventSource[] = [
  {
    name: 'UW Today',
    url: 'https://today.wisc.edu/',
    type: 'academic',
    enabled: true
  },
  {
    name: 'Wisconsin Union',
    url: 'https://union.wisc.edu/events-and-activities',
    type: 'social',
    enabled: true
  },
  {
    name: 'Visit Madison',
    url: 'https://www.visitmadison.com/events/',
    type: 'social',
    enabled: true
  },
  {
    name: 'Isthmus',
    url: 'https://isthmus.com/search/event/calendar-of-events/#page=1',
    type: 'arts',
    enabled: true
  },
  {
    name: 'Eventbrite UW',
    url: 'https://www.eventbrite.com/d/wi--madison/uw-madison/',
    type: 'other',
    enabled: true
  },
  {
    name: 'UW Badgers',
    url: 'https://uwbadgers.com/calendar',
    type: 'sports',
    enabled: true
  }
];

// UW-Madison campus center coordinates (fallback)
export const CAMPUS_CENTER = {
  lat: 43.0731,
  lng: -89.4012
};

// Rate limiting delays (in milliseconds)
export const DELAYS = {
  BETWEEN_SOURCES: 2000,  // 2 seconds between scraping different sources
  BETWEEN_REQUESTS: 1000, // 1 second between geocoding requests
  RETRY_BASE: 2000        // Base delay for retries (exponential backoff)
};
