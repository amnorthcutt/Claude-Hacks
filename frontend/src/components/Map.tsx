import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { Event } from '../types/index';
import { EventMarker } from './EventMarker';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  events: Event[];
}

// UW-Madison campus center
const CAMPUS_CENTER: LatLngExpression = [43.0731, -89.4012];
const DEFAULT_ZOOM = 14;

export function Map({ events }: MapProps) {
  return (
    <MapContainer
      center={CAMPUS_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {events.map(event => (
        <EventMarker key={event.id} event={event} />
      ))}
    </MapContainer>
  );
}
