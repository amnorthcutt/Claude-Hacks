// Event type matching backend
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

// Category configuration
export interface CategoryConfig {
  label: string;
  color: string;
}

// Map of categories to their visual configuration
export const CATEGORY_COLORS: Record<EventCategory, CategoryConfig> = {
  sports: { label: 'Sports', color: '#EF4444' },
  academic: { label: 'Academic', color: '#3B82F6' },
  social: { label: 'Social', color: '#10B981' },
  arts: { label: 'Arts', color: '#A855F7' },
  food: { label: 'Food', color: '#F59E0B' },
  other: { label: 'Other', color: '#6B7280' }
};
