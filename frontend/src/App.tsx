import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { SearchBox } from './components/SearchBox';
import { Map } from './components/Map';
import { fetchEvents } from './services/api';
import { Event, EventCategory } from './types';
import './App.css';

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events on mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Filter events when category or search changes
  useEffect(() => {
    filterEvents();
  }, [events, selectedCategory, searchQuery]);

  async function loadEvents() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEvents();
      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  }

  function filterEvents() {
    let filtered = events;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location_name?.toLowerCase().includes(query) ||
        event.organization?.toLowerCase().includes(query)
      );
    }

    setFilteredEvents(filtered);
  }

  return (
    <div className="app">
      <Header />

      <div className="controls">
        <FilterBar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <SearchBox
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {loading && (
        <div className="loading">
          <p>🔄 Loading events...</p>
        </div>
      )}

      {error && (
        <div className="error">
          <p>❌ {error}</p>
          <button onClick={loadEvents}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="stats">
            Showing {filteredEvents.length} of {events.length} events
          </div>

          <div className="map-container">
            <Map events={filteredEvents} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
