// Event model matching database schema
export interface Event {
  id: string;
  name: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  category: EventCategory;
  tags: string[];
  organization: string | null;
  location_name: string | null;
  location_address: string | null;
  latitude: number | null;
  longitude: number | null;
  link: string | null;
  source_url: string;
  scraped_at: string;
  created_at?: string;
}

// Event categories
export type EventCategory = 'sports' | 'academic' | 'social' | 'arts' | 'food' | 'other';

// Raw event extracted from Claude (before geocoding and categorization)
export interface RawEvent {
  name: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  tags: string[];
  organization: string | null;
  location: {
    name: string | null;
    address: string | null;
  } | null;
  link: string | null;
}

// Event source configuration
export interface EventSource {
  name: string;
  url: string;
  type: EventCategory;
  enabled: boolean;
}

// Geocode cache entry
export interface GeocodeCache {
  location_key: string;
  latitude: number;
  longitude: number;
  cached_at: string;
}

// Claude API response for categorization
export interface CategoryResponse {
  category: EventCategory;
  confidence: number;
}

// Coordinates
export interface Coordinates {
  lat: number;
  lng: number;
}

// Database row (tags stored as JSON string)
export interface EventRow {
  id: string;
  name: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  category: EventCategory;
  tags: string; // JSON string
  organization: string | null;
  location_name: string | null;
  location_address: string | null;
  latitude: number | null;
  longitude: number | null;
  link: string | null;
  source_url: string;
  scraped_at: string;
  created_at: string;
}
