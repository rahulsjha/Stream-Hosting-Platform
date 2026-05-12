#!/bin/bash

# Setup script for SIL Frontend React

echo "🎬 SIL Frontend React Setup"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo ""
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ .env.local created. Update it with your backend URL if needed."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start development server, run:"
echo "  npm start"
echo ""
echo "The app will open at http://localhost:3000"
