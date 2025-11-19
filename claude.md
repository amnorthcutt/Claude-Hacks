# UW–Madison Interactive Campus Events Map

> A one-hour hackathon MVP for an interactive campus events map

---

## Project Overview

This repository contains a demo-quality prototype designed for speed and clarity, combining interactive map visualization with automated event extraction and categorization.

### User Features

- **View** a scrollable map of campus (Leaflet + OpenStreetMap)
- **See** pins representing events
- **Click** pins to open event details (title, time, location, description, source URL)
- **Filter** events by category (sports, academic, social, arts, food, other)
- **Search** events using local keyword search

### System Capabilities

- Scrape event pages using the **Bright Data MCP server**
- Extract structured event data using the **Claude API**
- Categorize events using the **Claude API**
- Store events in a lightweight in-memory or SQLite store

---

## Architecture Overview

### Frontend

**Technology Stack:**
- React + TypeScript (Vite)
- Leaflet (react-leaflet) for maps
- Simple filter bar and search box
- Lightweight, readable components

### Backend

**Technology Stack:**
- Node.js + Express
- Event storage: in-memory or SQLite
- Must support mock mode when API keys are not present

**API Endpoints:**
```
GET  /api/events
POST /api/events/scrape
POST /api/events/categorize
```

### Claude API

**Used for:**
- Event extraction from scraped HTML/text
- Event categorization into predefined categories
- Optional URL discovery for event sources

### Bright Data MCP

**Used to:**
- Fetch HTML content from event pages
- Provide raw page text for Claude extraction

---

## Event Data Model

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "start_time": "string|null",
  "end_time": "string|null",
  "category": "sports|academic|social|arts|food|other",
  "location": {
    "name": "string",
    "address": "string",
    "lat": "number|null",
    "lng": "number|null"
  },
  "source_url": "string",
  "scraped_at": "string"
}
```

---

## Required Prompt Templates

### Event Extraction Prompt

```
You are a JSON extractor. Given this raw text or HTML from a UW–Madison campus
events page, return a single JSON object with keys: title, description, start_time
(ISO8601 or null), end_time (ISO8601 or null), location {name,address,lat,lng},
source_url. If a field is missing, return null. Output only JSON.
```

### Event Categorization Prompt

```
You are an event taxonomy model. Given an event title and description, return one
category from: sports, academic, social, arts, food, other. Also return a numeric
confidence from 0 to 1. Output only JSON.
```

---

## Coding Standards

### General

- Prioritize clarity and simplicity
- Keep files short and focused
- Use functional React components
- Use TypeScript strictly
- Favor direct, readable logic over abstractions

### Formatting

- **Indentation:** 2 spaces
- **Semicolons:** Required
- **Quotes:** Single quotes
- **Line width:** 100 characters maximum

### React Guidelines

- Place components in `src/components/`
- Use basic state management (`useState`, `useEffect`)
- Validate `lat`/`lng` before placing pins
- If missing coordinates, use a fallback near central campus

### Backend Guidelines

- All routes can remain in a single `server.ts` for the MVP
- Always include `try/catch` blocks
- Validate input and handle missing env vars
- Provide mock-mode behavior for Claude and Bright Data

### Error Handling

- The system **must not crash** due to missing credentials
- Enter mock mode automatically when needed
- Log errors but avoid verbose stack traces for the demo

---

## Development Rules

- Always keep the project compatible with a **one-hour hackathon sprint**
- When generating code, provide **full file content** rather than diffs
- When modifying multiple files, **label each clearly**
- Ask questions if requirements are unclear
- Avoid unnecessary dependencies or architectural complexity

---

## Developer Notes

### Possible Seed Event Sources

- [UW–Madison Events Calendar](https://events.wisc.edu/)
- Wisconsin Union events
- Badger Athletics calendar
- Student organizations and campus groups

### Mock Mode

The system **must run** even with zero external connectivity by using:
- Mock data
- Mock API responses

---

## Summary

This repository implements a fast, demo-ready prototype combining:

1. Interactive map visualization
2. Scraping via Bright Data MCP
3. Automated event extraction and categorization using Claude API

**Claude Code should follow this document consistently to maintain architecture, style, and project goals.**
