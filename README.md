# UW–Madison Interactive Campus Events Map

A one-hour hackathon MVP for an interactive campus events map combining React/TypeScript frontend with Node.js/Express backend.

## Project Structure

```
Claude-Hacks/
├── frontend/          # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   └── ...
│   └── package.json
├── backend/           # Node.js + Express backend
│   ├── src/
│   │   └── server.ts
│   └── package.json
└── claude.md          # Project specification
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Claude API key (optional - will use mock mode without it)
- Bright Data API key (optional - will use mock mode without it)

### Installation

1. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add your API keys (optional)
   ```

### Running the Application

1. **Start the backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend (in a new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser to the URL shown by Vite (typically http://localhost:5173)

## Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Maps:** Leaflet + react-leaflet
- **Styling:** CSS

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Database:** SQLite (better-sqlite3) with in-memory fallback
- **AI:** Claude API via @anthropic-ai/sdk
- **Web Scraping:** Bright Data MCP server

## Features

- Interactive map of UW-Madison campus
- Event markers with popups showing details
- Filter events by category (sports, academic, social, arts, food, other)
- Keyword search functionality
- Automated event scraping and extraction
- AI-powered event categorization
- Mock mode for development without API keys

## API Endpoints

- `GET /api/events` - Retrieve all events
- `POST /api/events/scrape` - Scrape and extract events from a URL
- `POST /api/events/categorize` - Categorize an event

## Development Guidelines

See `claude.md` for detailed:
- Architecture overview
- Event data model
- Coding standards
- Prompt templates
- Error handling requirements

## License

ISC
