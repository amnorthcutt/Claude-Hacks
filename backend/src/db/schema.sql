-- Events table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_time TEXT,
  end_time TEXT,
  category TEXT CHECK(category IN ('sports', 'academic', 'social', 'arts', 'food', 'other')),
  tags TEXT, -- JSON array stored as text
  organization TEXT,
  location_name TEXT,
  location_address TEXT,
  latitude REAL,
  longitude REAL,
  link TEXT,
  source_url TEXT, -- The website we scraped from
  scraped_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast category filtering
CREATE INDEX IF NOT EXISTS idx_category ON events(category);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_start_time ON events(start_time);

-- Geocoding cache table to avoid repeated API calls
CREATE TABLE IF NOT EXISTS geocode_cache (
  location_key TEXT PRIMARY KEY,
  latitude REAL,
  longitude REAL,
  cached_at TEXT DEFAULT CURRENT_TIMESTAMP
);
