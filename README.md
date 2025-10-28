# Fab City AI Chat Widget

A modern, production-ready AI chat widget built with React, TailwindCSS, and Framer Motion for the Fab City website.

![Fab City Colors](https://img.shields.io/badge/Green-3EB489-3EB489) ![Fab City Colors](https://img.shields.io/badge/Yellow-FFA62B-FFA62B) ![Fab City Colors](https://img.shields.io/badge/Blue-1C5D99-1C5D99)

## ✨ Features

- 💬 **ChatGPT-style Interface** - Full-page centered chat experience
- 🎨 **Professional Design** - Clean, modern UI with Fab City branding
- 🔮 **Smart Suggestions** - Suggested prompts for new users
- 📝 **Markdown Support** - Full markdown rendering with links, lists, and formatting
- 🖼️ **Rich Media Previews** - In-widget previews for PDFs, images, videos, and web pages
- 🎭 **Smooth Animations** - Framer Motion powered transitions and micro-interactions
- 📱 **Fully Responsive** - Perfect experience from mobile to desktop
- 🔄 **Auto-scroll** - Automatically scrolls to the latest message
- ⚡ **Loading States** - Beautiful animated loading indicators with brand colors
- 🔌 **Easy Integration** - Drop-in component for any React app

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure n8n webhook URL:**
   
   Create a `.env` file in the root directory:
   ```env
   N8N_WEBHOOK_URL=https://your-n8n-instance/webhook/fabcity-chat
   ```

3. **Run the application:**

   **Windows:**
   ```bash
   start.bat
   ```

   **Mac/Linux:**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

## 🌐 Deployment

### Two-Part Deployment

This project consists of two deployable parts:

1. **Main API Application** (for handling chat requests)
2. **Embeddable Widget** (for clients to add to their websites)

### Quick Deployment Guide

#### Part 1: Deploy Main API to Render ✅

**[Complete Guide](RENDER_DEPLOYMENT.md)**

```bash
# Push to GitHub
git push origin main

# In Render Dashboard:
# - Create Web Service from GitHub repo
# - Build Command: npm install && npm run build
# - Start Command: node server/index.js
```

Your API will be live at: `https://your-app.onrender.com`

#### Part 2: Deploy Widget for Clients 📦

**[Quick Start Guide](WIDGET_QUICKSTART.md)** | **[Detailed Guide](WIDGET_DEPLOYMENT_GUIDE.md)**

```bash
# 1. Update widget.config.js with your Render URL
# 2. Build the widget
npm run build:embed

# 3. Deploy to hosting (Netlify example)
netlify deploy --dir=dist-embed --prod
```

Your widget will be at: `https://your-widget.netlify.app`

#### Give to Clients

Share `client-integration.html` or this simple code snippet:

```html
<link rel="stylesheet" href="[YOUR-WIDGET-URL]/fabcity-widget.css">
<script src="[YOUR-WIDGET-URL]/fabcity-widget.js"></script>
```

**📚 All Deployment Docs:**
- 📋 **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** - Start here for complete overview
- 🚀 **[WIDGET_QUICKSTART.md](WIDGET_QUICKSTART.md)** - Fast widget deployment (15 min)
- 📖 **[WIDGET_DEPLOYMENT_GUIDE.md](WIDGET_DEPLOYMENT_GUIDE.md)** - Detailed widget guide
- 🔧 **[RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)** - Fix Render deployment issues
- 👥 **[client-integration.html](client-integration.html)** - Beautiful client-facing guide

   **Or manually (2 terminals):**
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run dev
   ```

4. **Open your browser:**
   ```
   http://localhost:5173
   ```

5. **Click the floating chat button** (bottom-right) to open the chat!

## 🏗️ Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   React     │─────▶│  /api/chat  │─────▶│     n8n     │
│  Frontend   │      │  (Express)  │      │   Webhook   │
└─────────────┘      └─────────────┘      └─────────────┘
```

### How it works:

1. User types a message in the chat widget
2. Frontend sends POST request to `/api/chat` with the message
3. Express server proxies the request to the n8n webhook
4. n8n processes the message and returns AI response
5. Response is forwarded back to the frontend
6. Chat widget displays the AI response with animations

## 📁 Project Structure

```
fabcity-chat-widget/
├── src/
│   ├── components/
│   │   ├── ChatWidget.jsx       # Main chat component (full-page)
│   │   ├── Message.jsx          # Message bubble component
│   │   ├── LoadingIndicator.jsx # Animated loading dots
│   │   ├── RichPreviewModal.jsx # Media preview modal
│   │   └── SuggestionChip.jsx   # Suggested question chips
│   ├── App.jsx                  # Widget wrapper
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles + Tailwind
├── server/
│   └── index.js                 # Express API server (n8n proxy)
├── Documentation/
│   ├── README.md                # This file
│   ├── SETUP.md                 # Setup guide
│   ├── QUICKSTART.md            # Quick start (3 steps)
│   ├── INTEGRATION_GUIDE.md     # Integration instructions
│   └── PROJECT_OVERVIEW.md      # Detailed breakdown
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🎨 Customization

### Suggested Questions

Edit `src/components/ChatWidget.jsx`:

```jsx
const SUGGESTIONS = [
  "Your question 1",
  "Your question 2",
  "Your question 3",
  "Your question 4"
];
```

### Brand Colors

Edit `tailwind.config.js`:

```js
colors: {
  'fabcity-green': '#3EB489',
  'fabcity-yellow': '#FFA62B',
  'fabcity-blue': '#1C5D99',
}
```

### Header Text

Edit `src/components/ChatWidget.jsx`:

```jsx
<h1>Your Custom Title</h1>
<p>Your custom subtitle</p>
```

### Welcome Message

```jsx
<h2>Your Welcome Title</h2>
<p>Your welcome description</p>
```

## 🔧 Configuration

### Backend API

Edit `server/index.js` to customize:
- n8n webhook URL
- Request/response formatting
- Error handling
- CORS settings

### Frontend

Edit `src/components/ChatWidget.jsx` to customize:
- Initial greeting message
- Chat window dimensions
- Animation timings
- Input validation

## 📦 Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` folder.

## 🔌 n8n Webhook Setup

Your n8n webhook should:

1. Accept POST requests with JSON body:
   ```json
   {
     "message": "user's question here"
   }
   ```

2. Return JSON response:
   ```json
   {
     "response": "AI's answer here"
   }
   ```
   Or:
   ```json
   {
     "message": "AI's answer here"
   }
   ```

## 🎯 API Endpoints

### POST `/api/chat`

**Request:**
```json
{
  "message": "What is Fab City?"
}
```

**Response:**
```json
{
  "response": "Fab City is a global initiative..."
}
```

## 🌟 Key Features Explained

### Rich Preview Modal

When users click on links in AI messages:
- **PDFs:** Rendered inline with download option
- **Images:** Full-screen lightbox view
- **Videos:** Built-in video player
- **Web Pages:** Sandboxed iframe preview

### Loading Indicator

Three bouncing dots animated in sequence using Fab City brand colors (green, yellow, blue).

### Auto-scroll

Automatically scrolls to the latest message when:
- New message is sent
- AI response is received
- Loading indicator appears

### Error Handling

Displays user-friendly error messages when:
- API request fails
- n8n webhook is unreachable
- Network issues occur

## 📱 Responsive Design

- **Mobile:** Full-screen modal overlay
- **Desktop:** Fixed-size chat window (440x650px)
- **Tablet:** Adaptive sizing

## 🎭 Animations

- **Chat Icon:** Pulsing ring animation when idle
- **Modal:** Scale + fade entrance/exit
- **Messages:** Slide up + fade in
- **Loading:** Bouncing dots with staggered delay

## 🔒 Security

- CORS enabled for cross-origin requests
- Iframe sandboxing for web previews
- Input validation and sanitization
- Error message sanitization

## 📄 License

MIT License - feel free to use this in your projects!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for Fab City**

Powered by: React • Vite • TailwindCSS • Framer Motion • Express • n8n

