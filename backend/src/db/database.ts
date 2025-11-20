import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Event, EventRow, GeocodeCache, Coordinates } from '../types';

const DB_PATH = process.env.DATABASE_PATH || './events.db';

// Initialize database connection
export const db = new Database(DB_PATH);

// Enable foreign keys and WAL mode for better performance
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initializeDatabase(): void {
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  console.log('✅ Database initialized');
}

// Convert EventRow (from DB) to Event (for API)
function rowToEvent(row: EventRow): Event {
  return {
    ...row,
    tags: row.tags ? JSON.parse(row.tags) : []
  };
}

// Convert Event to EventRow (for DB insertion)
function eventToRow(event: Event): Omit<EventRow, 'created_at'> {
  return {
    ...event,
    tags: JSON.stringify(event.tags)
  };
}

// Insert a new event
export function insertEvent(event: Event): void {
  const stmt = db.prepare(`
    INSERT INTO events (
      id, name, description, start_time, end_time, category, tags,
      organization, location_name, location_address, latitude, longitude,
      link, source_url, scraped_at
    ) VALUES (
      @id, @name, @description, @start_time, @end_time, @category, @tags,
      @organization, @location_name, @location_address, @latitude, @longitude,
      @link, @source_url, @scraped_at
    )
  `);

  const row = eventToRow(event);
  stmt.run(row);
}

// Insert multiple events in a transaction
export function insertEvents(events: Event[]): void {
  const insert = db.prepare(`
    INSERT INTO events (
      id, name, description, start_time, end_time, category, tags,
      organization, location_name, location_address, latitude, longitude,
      link, source_url, scraped_at
    ) VALUES (
      @id, @name, @description, @start_time, @end_time, @category, @tags,
      @organization, @location_name, @location_address, @latitude, @longitude,
      @link, @source_url, @scraped_at
    )
  `);

  const insertMany = db.transaction((events: Event[]) => {
    for (const event of events) {
      const row = eventToRow(event);
      insert.run(row);
    }
  });

  insertMany(events);
}

// Get all events with optional filtering
export function getEvents(filters?: {
  category?: string;
  search?: string;
}): Event[] {
  let query = 'SELECT * FROM events';
  const conditions: string[] = [];
  const params: any = {};

  if (filters?.category) {
    conditions.push('category = @category');
    params.category = filters.category;
  }

  if (filters?.search) {
    conditions.push(`(
      name LIKE @search OR
      description LIKE @search OR
      location_name LIKE @search OR
      organization LIKE @search
    )`);
    params.search = `%${filters.search}%`;
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY start_time ASC';

  const stmt = db.prepare(query);
  const rows = stmt.all(params) as EventRow[];
  return rows.map(rowToEvent);
}

// Get event by ID
export function getEventById(id: string): Event | null {
  const stmt = db.prepare('SELECT * FROM events WHERE id = ?');
  const row = stmt.get(id) as EventRow | undefined;
  return row ? rowToEvent(row) : null;
}

// Delete all events (for re-scraping)
export function deleteAllEvents(): void {
  db.prepare('DELETE FROM events').run();
}

// Get statistics
export function getStats(): {
  totalEvents: number;
  eventsByCategory: Record<string, number>;
  lastScraped: string | null;
} {
  const total = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };

  const byCategory = db.prepare(`
    SELECT category, COUNT(*) as count
    FROM events
    GROUP BY category
  `).all() as { category: string; count: number }[];

  const lastScraped = db.prepare(`
    SELECT scraped_at
    FROM events
    ORDER BY scraped_at DESC
    LIMIT 1
  `).get() as { scraped_at: string } | undefined;

  const eventsByCategory: Record<string, number> = {};
  byCategory.forEach(item => {
    eventsByCategory[item.category] = item.count;
  });

  return {
    totalEvents: total.count,
    eventsByCategory,
    lastScraped: lastScraped?.scraped_at || null
  };
}

// Geocode cache functions
export function getCachedGeocode(locationKey: string): Coordinates | null {
  const stmt = db.prepare('SELECT latitude, longitude FROM geocode_cache WHERE location_key = ?');
  const result = stmt.get(locationKey) as { latitude: number; longitude: number } | undefined;
  return result ? { lat: result.latitude, lng: result.longitude } : null;
}

export function cacheGeocode(locationKey: string, coords: Coordinates): void {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO geocode_cache (location_key, latitude, longitude)
    VALUES (?, ?, ?)
  `);
  stmt.run(locationKey, coords.lat, coords.lng);
}

// Close database connection
export function closeDatabase(): void {
  db.close();
}
