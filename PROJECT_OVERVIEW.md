# 🌍 Fab City AI Chat Widget - Project Overview

## 📊 What Was Built

A production-ready, modern AI chat widget with the following features:

### ✅ Core Features Implemented

- ✨ **Floating Chat Icon** - Bottom-right corner with idle animation (pulsing ring)
- 💬 **Chat Modal** - Centered, responsive dialog with blur overlay
- 🎨 **Brand Colors** - Green (#3EB489), Yellow (#FFA62B), Blue (#1C5D99)
- 📝 **Markdown Support** - Bold, lists, links via react-markdown + remark-gfm
- 🖼️ **Rich Previews** - PDF, image, video, and web page modals
- ⚡ **Loading Animation** - Three bouncing dots in brand colors
- 🔄 **Auto-scroll** - Automatic scroll to latest message
- ⌨️ **Keyboard Support** - Enter to send messages
- 🎭 **Smooth Animations** - Framer Motion throughout
- 📱 **Responsive** - Mobile and desktop optimized
- 🔌 **API Integration** - Backend proxy to n8n webhook

## 📁 Project Structure

```
FabCity/
│
├── 📄 Configuration Files
│   ├── package.json              # Dependencies and scripts
│   ├── vite.config.js           # Vite configuration
│   ├── tailwind.config.js       # TailwindCSS + brand colors
│   ├── postcss.config.js        # PostCSS configuration
│   └── .gitignore               # Git ignore rules
│
├── 🚀 Startup Scripts
│   ├── start.bat                # Windows startup script
│   └── start.sh                 # Linux/Mac startup script
│
├── 📖 Documentation
│   ├── README.md                # Full documentation
│   ├── SETUP.md                 # Setup guide
│   └── PROJECT_OVERVIEW.md      # This file
│
├── 🌐 Frontend (React + Vite)
│   ├── index.html               # HTML entry point
│   └── src/
│       ├── main.jsx             # React entry point
│       ├── App.jsx              # Main app + demo page
│       ├── index.css            # Global styles
│       └── components/
│           ├── ChatWidget.jsx   # Main chat component
│           ├── Message.jsx      # Message bubbles
│           ├── LoadingIndicator.jsx   # Bouncing dots
│           └── RichPreviewModal.jsx   # Media previews
│
└── 🔧 Backend (Express API)
    └── server/
        └── index.js             # API server + n8n proxy

```

## 🎨 Component Breakdown

### 1. ChatWidget.jsx (Main Component)
**What it does:**
- Manages chat state (messages, loading, errors)
- Handles floating button and modal visibility
- Sends messages to /api/chat endpoint
- Auto-scrolls to latest messages
- Implements overlay click-to-close

**Key Features:**
- Animated floating button with pulsing ring
- Centered modal with blur backdrop
- Header with gradient background
- Scrollable message area
- Input field with send button
- Footer with branding

### 2. Message.jsx
**What it does:**
- Renders individual messages (user or AI)
- Supports markdown formatting
- Makes links clickable with preview

**Styling:**
- User: Right-aligned, yellow background, white text
- AI: Left-aligned, white background, gray text
- Rounded corners with subtle shadows
- Timestamp display

### 3. LoadingIndicator.jsx
**What it does:**
- Shows typing indicator while waiting for AI response
- Three bouncing dots animated in sequence
- Uses Fab City brand colors (green, yellow, blue)

### 4. RichPreviewModal.jsx
**What it does:**
- Detects file type from URL extension
- Renders appropriate preview:
  - **PDF**: Inline viewer with download button
  - **Image**: Full-screen lightbox
  - **Video**: Built-in video player
  - **Web**: Sandboxed iframe with "open in new tab" option
- Click outside to close

### 5. App.jsx
**What it does:**
- Demo landing page showcasing the widget
- Beautiful hero section with feature cards
- Integrates ChatWidget component

### 6. server/index.js (Backend)
**What it does:**
- Express server on port 3001
- POST /api/chat endpoint
- Proxies requests to n8n webhook
- Handles errors gracefully
- Returns AI responses to frontend

## 🎯 User Flow

1. **User visits website** → Sees floating chat icon with pulsing animation
2. **Clicks chat icon** → Modal opens with scale + fade animation
3. **Types message** → Hits Enter or clicks Send
4. **Message sent** → User message appears (right, yellow)
5. **Loading state** → Three bouncing dots appear
6. **AI responds** → AI message appears (left, white) with markdown
7. **Clicks link** → Preview modal opens with content
8. **Clicks outside modal** → Modal closes smoothly
9. **Clicks outside chat** → Chat widget closes

## 🎨 Design System

### Colors
```css
Fab City Green: #3EB489  /* Primary, buttons, accents */
Fab City Yellow: #FFA62B /* User messages, highlights */
Fab City Blue: #1C5D99   /* Gradients, links */
```

### Typography
- Font: System fonts (-apple-system, Segoe UI, Roboto)
- Sizes: Responsive with Tailwind classes

### Spacing
- Padding: 1rem to 1.5rem for comfort
- Margins: 1rem between messages
- Rounded corners: rounded-xl, rounded-2xl

### Shadows
- Cards: shadow-md
- Modal: shadow-2xl
- Floating button: shadow-2xl

## 🚀 API Integration

### Request Format
```javascript
POST /api/chat
Content-Type: application/json

{
  "message": "What is Fab City?"
}
```

### Response Format (from n8n)
```javascript
{
  "response": "Fab City is a global initiative..."
}
// OR
{
  "message": "Fab City is a global initiative..."
}
```

## 📦 Dependencies

### Frontend
- `react` - UI library
- `react-dom` - React rendering
- `framer-motion` - Animations
- `react-markdown` - Markdown rendering
- `remark-gfm` - GitHub flavored markdown
- `lucide-react` - Icons
- `tailwindcss` - Styling

### Backend
- `express` - Web server
- `cors` - Cross-origin requests

### Dev Tools
- `vite` - Build tool
- `@vitejs/plugin-react` - React support

## 🎭 Animation Details

### Chat Icon
- **Idle**: Pulsing ring that grows and fades
- **Hover**: Scales up to 1.1x
- **Click**: Scales down to 0.95x

### Modal
- **Open**: Scale from 0.8 to 1, fade in
- **Close**: Scale to 0.8, fade out
- **Backdrop**: Fade blur overlay

### Messages
- **Appear**: Slide up + fade in
- **Duration**: 0.3s smooth transition

### Loading Dots
- **Animation**: Bounce up/down
- **Delay**: Staggered by 0.15s per dot
- **Duration**: 0.6s per cycle

## 🔐 Security Features

- **CORS**: Enabled for cross-origin requests
- **Input Validation**: Checks for empty messages
- **Error Handling**: Graceful error messages
- **Iframe Sandboxing**: Restricted permissions for web previews
- **Environment Variables**: Sensitive URLs in .env

## 📱 Responsive Breakpoints

- **Mobile** (< 768px): Full-screen modal
- **Desktop** (≥ 768px): Fixed-size modal (440x650px)

## 🎯 Next Steps (Optional Enhancements)

- [ ] Add message persistence (localStorage)
- [ ] Add typing indicator from AI
- [ ] Add voice input support
- [ ] Add file upload capability
- [ ] Add conversation history
- [ ] Add user authentication
- [ ] Add analytics tracking
- [ ] Add multi-language support
- [ ] Add dark mode
- [ ] Add chat export feature

## 💻 Development Commands

```bash
# Install dependencies
npm install

# Start development (frontend only)
npm run dev

# Start backend API
npm run server

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Customization Points

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  'fabcity-green': '#YOUR_COLOR',
  'fabcity-yellow': '#YOUR_COLOR',
  'fabcity-blue': '#YOUR_COLOR',
}
```

### Change Modal Size
Edit `src/components/ChatWidget.jsx`:
```javascript
className="md:w-[440px] md:h-[650px]"
```

### Change Initial Message
Edit `src/components/ChatWidget.jsx`:
```javascript
const [messages, setMessages] = useState([
  {
    text: "Your custom greeting!",
    sender: 'ai',
    timestamp: new Date(),
  },
]);
```

### Change n8n URL
Edit `.env`:
```
N8N_WEBHOOK_URL=your-new-url
```

## 🏆 Quality Checklist

✅ Modern, clean UI design  
✅ Responsive on all devices  
✅ Smooth animations throughout  
✅ Markdown support  
✅ Rich media previews  
✅ Error handling  
✅ Loading states  
✅ Auto-scroll  
✅ Keyboard shortcuts  
✅ Brand consistency  
✅ Production-ready code  
✅ Well-documented  
✅ Easy to customize  

## 🙏 Credits

Built with modern web technologies for the Fab City initiative.

**Tech Stack:**
- React 18
- Vite 5
- TailwindCSS 3
- Framer Motion 10
- Express 4
- React Markdown 9

---

**Ready to launch! 🚀**

For setup instructions, see [SETUP.md](SETUP.md)  
For full documentation, see [README.md](README.md)

