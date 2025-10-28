@echo off
echo 🚀 Starting Fab City AI Chat Widget...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  No .env file found. Creating default .env...
    echo N8N_WEBHOOK_URL=https://your-n8n-instance/webhook/fabcity-chat > .env
    echo ✅ .env file created. Please update it with your n8n webhook URL.
    echo.
)

echo 🎯 Starting servers...
echo.
echo Frontend will run on: http://localhost:5173
echo Backend API will run on: http://localhost:3001
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start both servers
start /B npm run server
start /B npm run dev

REM Keep the window open
pause

