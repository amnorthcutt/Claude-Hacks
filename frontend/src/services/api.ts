import { Event } from '../types/index';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Fetch all events with optional filters
export async function fetchEvents(filters?: {
  category?: string;
  search?: string;
}): Promise<Event[]> {
  const params = new URLSearchParams();

  if (filters?.category) {
    params.append('category', filters.category);
  }

  if (filters?.search) {
    params.append('search', filters.search);
  }

  const url = `${API_BASE_URL}/api/events${params.toString() ? '?' + params.toString() : ''}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`);
  }

  return response.json();
}

// Fetch statistics
export async function fetchStats(): Promise<{
  totalEvents: number;
  eventsByCategory: Record<string, number>;
  lastScraped: string | null;
}> {
  const response = await fetch(`${API_BASE_URL}/api/stats`);

  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }

  return response.json();
}
