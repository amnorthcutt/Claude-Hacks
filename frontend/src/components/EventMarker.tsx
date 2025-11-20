import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { Event, CATEGORY_COLORS } from '../types/index';
import { EventPopup } from './EventPopup';

interface EventMarkerProps {
  event: Event;
}

// Create custom marker icon based on category color
function createMarkerIcon(color: string): Icon {
  const svg = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 8.437 12.5 28.125 12.5 28.125S25 20.937 25 12.5C25 5.596 19.404 0 12.5 0z"
            fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="12.5" cy="12.5" r="5" fill="#fff"/>
    </svg>
  `;

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });
}

export function EventMarker({ event }: EventMarkerProps) {
  // Use event coordinates or skip if null
  if (!event.latitude || !event.longitude) {
    return null;
  }

  const position: LatLngExpression = [event.latitude, event.longitude];
  const categoryConfig = CATEGORY_COLORS[event.category];
  const icon = createMarkerIcon(categoryConfig.color);

  return (
    <Marker position={position} icon={icon}>
      <Popup>
        <EventPopup event={event} />
      </Popup>
    </Marker>
  );
}
