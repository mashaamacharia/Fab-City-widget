# Fab City Chat Widget - Integration Guide

## Overview

The Fab City Chat Widget is a beautiful, eye-catching floating button that opens a full-page AI chatbot experience. The widget features:

- ✨ **Pulsing and glowing animations** using Fab City brand colors (Blue, Red, Green)
- 🎨 **Brand-consistent design** with gradient effects
- 📱 **Responsive** - works on mobile and desktop
- 🚀 **Easy integration** - can be embedded on any page

## Features

### Widget Button
- Fixed position in bottom-right corner
- Pulsing ring animation with Fab City colors
- Glowing effect that pulses continuously
- Rotating gradient background
- Hover tooltip on desktop
- Smooth scale animations on interaction

### Full-Page Chat
- Opens in a modal overlay when widget is clicked
- Full ChatGPT-style interface
- All original chatbot features preserved
- Close button to return to the page

## Usage

### Basic Integration

The widget is now the default mode. Simply import and use:

```jsx
import ChatWidgetContainer from './components/ChatWidgetContainer';

function App() {
  return <ChatWidgetContainer isWidgetMode={true} />;
}
```

### Full-Page Mode

To use the chatbot as a full-page (without widget button):

```jsx
import ChatWidgetContainer from './components/ChatWidgetContainer';

function App() {
  return <ChatWidgetContainer isWidgetMode={false} />;
}
```

## Widget Customization

### Position

The widget button is positioned using Tailwind classes in `ChatWidgetButton.jsx`:

- Mobile: `bottom-6 right-6`
- Desktop: `md:bottom-8 md:right-8`

To change position, modify the `className` in `ChatWidgetButton.jsx`:

```jsx
className="fixed bottom-6 right-6 z-50 group md:bottom-8 md:right-8"
```

### Colors

Widget colors are defined in `src/index.css` using Fab City brand colors:

- **Blue**: `#1E40AF` (Primary)
- **Red**: `#DC2626` (Secondary)
- **Green**: `#16A34A` (Accent)

To customize colors, edit the CSS variables in `src/index.css`:

```css
.fabcity-widget-button {
  background: linear-gradient(135deg, #1E40AF 0%, #1E40AF 45%, #DC2626 45%, #DC2626 90%, #16A34A 90%, #16A34A 100%);
}
```

### Animation Speed

Adjust animation speeds in `src/index.css`:

- **Pulse ring**: `animation: pulse-ring 2.5s ...` (change `2.5s`)
- **Glow ring**: `animation: glow-ring 2.2s ...` (change `2.2s`)
- **Inner glow**: `animation: inner-glow 2.5s ...` (change `2.5s`)

## Embedding on External Pages

To embed the widget on external pages:

1. Build the project: `npm run build`
2. Include the built files in your page
3. Initialize the widget component

Example HTML integration:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="path/to/dist/index.css">
</head>
<body>
  <div id="fabcity-widget-root"></div>
  <script type="module" src="path/to/dist/main.js"></script>
</body>
</html>
```

## Component Structure

```
ChatWidgetContainer
├── ChatWidgetButton (floating button)
└── ChatInterface (full-page chat, shown in modal)
    ├── Header
    ├── Messages Area
    ├── Input Area
    └── Rich Preview Modal
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled

## Accessibility

- Widget button includes `aria-label` for screen readers
- Keyboard accessible (Enter/Space to activate)
- Focus states visible
- Tooltip provides context on hover

## Performance

- Animations use CSS transforms for GPU acceleration
- Lazy loading of chat interface when opened
- Optimized animations with `will-change` hints
- Minimal bundle size impact

## Troubleshooting

### Widget not visible
- Check z-index conflicts (widget uses `z-50`)
- Ensure no parent elements have `overflow: hidden`
- Verify CSS is loaded correctly

### Animations not working
- Check browser support for CSS animations
- Verify Tailwind CSS is properly configured
- Check console for CSS errors

### Chat not opening
- Verify React is properly initialized
- Check for JavaScript errors in console
- Ensure `ChatWidgetContainer` is properly imported

## Next Steps

- Customize widget position per page
- Add analytics tracking
- Configure widget appearance per domain
- Add widget state persistence

