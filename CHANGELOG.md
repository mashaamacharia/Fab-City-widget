# Changelog

## [2.0.0] - Latest Update

### 🎨 Major Design Overhaul

**Changed from side modal to full-page ChatGPT-style interface**

#### Added
- ✨ Full-page centered chat experience (like ChatGPT)
- 🔮 Suggested question prompts for new users
- 💼 Professional header design without excessive emojis
- 📱 Improved responsive layout for all screen sizes
- 🎯 Centrally placed input area
- 🌟 Welcome screen with Fab City branding
- 📝 SuggestionChip component for interactive prompts

#### Changed
- 🔄 Removed demo landing page - now standalone widget
- 🎨 Updated message styling for better readability
- 💬 Changed from emoji-heavy to professional tone
- 📐 Content now centered with max-width constraint
- 🎭 Updated animations for full-page experience

#### Removed
- ❌ Demo page content
- ❌ Side modal design
- ❌ Small chat window on desktop
- ❌ Initial AI greeting message (replaced with welcome screen)

---

## [1.0.0] - Initial Release

### Features
- 💬 Floating chat widget
- 🎨 Fab City branded colors
- 📝 Markdown support in messages
- 🖼️ Rich media preview modal
- ⚡ Loading indicators
- 🔌 n8n webhook integration
- 📱 Responsive design
- 🎭 Framer Motion animations

### Components
- ChatWidget.jsx - Main chat component
- Message.jsx - Message bubbles
- LoadingIndicator.jsx - Bouncing dots
- RichPreviewModal.jsx - Media previews

### Backend
- Express server
- n8n webhook proxy
- CORS support
- Error handling

