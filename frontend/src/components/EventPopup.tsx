import React from 'react';
import { Event } from '../types';

interface EventPopupProps {
  event: Event;
}

export function EventPopup({ event }: EventPopupProps) {
  // Format date/time
  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return null;
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="event-popup">
      <h3 className="event-title">{event.name}</h3>

      {event.start_time && (
        <div className="event-time">
          <strong>📅 </strong>
          {formatDateTime(event.start_time)}
          {event.end_time && ` - ${formatDateTime(event.end_time)}`}
        </div>
      )}

      {event.location_name && (
        <div className="event-location">
          <strong>📍 </strong>
          {event.location_name}
          {event.location_address && <div className="event-address">{event.location_address}</div>}
        </div>
      )}

      {event.organization && (
        <div className="event-org">
          <strong>🏢 </strong>
          {event.organization}
        </div>
      )}

      {event.description && (
        <div className="event-description">
          {event.description.substring(0, 200)}
          {event.description.length > 200 && '...'}
        </div>
      )}

      {event.tags && event.tags.length > 0 && (
        <div className="event-tags">
          {event.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="event-tag">{tag}</span>
          ))}
        </div>
      )}

      {event.link && (
        <div className="event-link">
          <a href={event.link} target="_blank" rel="noopener noreferrer">
            View Details →
          </a>
        </div>
      )}
    </div>
  );
}
