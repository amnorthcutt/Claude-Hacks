#!/bin/bash

echo "Setting up UW-Madison Campus Events Map..."
echo ""

# Backend setup
echo "1. Setting up backend..."
cd backend

# Create .env file
echo "   Creating .env file..."
echo "   ⚠️  Please add your Anthropic API key to backend/.env"
cat > .env << 'ENVEOF'
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY_HERE
PORT=3001
DATABASE_PATH=./events.db
NOMINATIM_USER_AGENT=UW-Events-Map
ENVEOF

echo "   ✅ Created backend/.env template"
echo "   📝 Edit backend/.env and replace YOUR_ANTHROPIC_API_KEY_HERE with your actual key"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "   📦 Installing backend dependencies..."
    npm install
fi

echo "   🌱 Seeding database with mock events..."
npm run seed:mock

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "To start the servers:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend"
echo "    npm run dev"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend"
echo "    npm install  # if you haven't already"
echo "    npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser!"
