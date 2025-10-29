#!/bin/bash

echo "🚀 Starting Fab City AI Chat Widget..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ .env file created. Please update it with your n8n webhook URL."
    else
        echo "N8N_WEBHOOK_URL=https://your-n8n-instance/webhook/fabcity-chat" > .env
        echo "✅ .env file created. Please update it with your n8n webhook URL."
    fi
    echo ""
fi

echo "🎯 Starting servers..."
echo ""
echo "Frontend will run on: http://localhost:5173"
echo "Backend API will run on: http://localhost:3001"
echo ""

# Start both servers concurrently
npm run server & npm run dev

