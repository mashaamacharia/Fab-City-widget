# 🎨 Visual Design Guide - Fab City AI Chat Widget

## 📱 User Interface Overview

### 1. Closed State - Floating Button

```
┌─────────────────────────────────────┐
│                                     │
│     Your Website Content            │
│                                     │
│                                     │
│                                     │
│                          ┌────┐     │
│                          │ 💬 │◄─── Pulsing ring animation
│                          └────┘     │
│                                     │
└─────────────────────────────────────┘
     Bottom-right corner
     Gradient: Green → Blue
```

---

### 2. Open State - Full-Page Chat

```
┌─────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────┐   │
│  │ ✨ Fab City AI Assistant                 │   │◄─ Professional Header
│  │    Your guide to urban innovation        │   │   (No emoji overload)
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │           [Centered Content]             │   │
│  │         (max-width: 1024px)              │   │
│  │                                          │   │
│  │  ┌────────────────────────────────┐     │   │
│  │  │   ✨                            │     │   │
│  │  │   Welcome to Fab City AI       │     │   │◄─ Welcome Screen
│  │  │                                │     │   │   (When no messages)
│  │  │   Your intelligent assistant... │     │   │
│  │  │                                │     │   │
│  │  │   Suggested questions:         │     │   │
│  │  │   ┌──────────┐ ┌──────────┐   │     │   │◄─ Suggestion Chips
│  │  │   │ Question │ │ Question │   │     │   │   (Clickable)
│  │  │   └──────────┘ └──────────┘   │     │   │
│  │  │   ┌──────────┐ ┌──────────┐   │     │   │
│  │  │   │ Question │ │ Question │   │     │   │
│  │  │   └──────────┘ └──────────┘   │     │   │
│  │  └────────────────────────────────┘     │   │
│  │                                          │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ [Type here...]              [Send 📤]    │   │◄─ Input Area
│  │ Powered by Fab City AI • Press Enter     │   │   (Centered at bottom)
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

---

### 3. Chat View - With Messages

```
┌─────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────┐   │
│  │ ✨ Fab City AI Assistant                 │   │
│  │    Your guide to urban innovation        │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │           [Centered Content]             │   │
│  │                                          │   │
│  │  ┌─────────────────────────────────┐    │   │
│  │  │ AI: Hello! I'm here to help... │    │   │◄─ AI Message
│  │  └─────────────────────────────────┘    │   │   (Left, gray bg)
│  │                                          │   │
│  │         ┌──────────────────────────────┐│   │
│  │         │ User: What is Fab City?      ││   │◄─ User Message
│  │         └──────────────────────────────┘│   │   (Right, yellow bg)
│  │                                          │   │
│  │  ┌─────────────────────────────────┐    │   │
│  │  │ AI: Fab City is a global...    │    │   │
│  │  │                                 │    │   │
│  │  │ [Learn more →]                  │    │   │◄─ Clickable Link
│  │  └─────────────────────────────────┘    │   │
│  │                                          │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ [Ask me anything...]        [Send 📤]    │   │
│  │ Powered by Fab City AI • Press Enter     │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

---

## 🎨 Color Palette

### Brand Colors
```
┌───────────────────┐
│  Fab City Green   │  #3EB489
│   ████████████    │  • Primary actions
└───────────────────┘  • Send button
                       • Header gradient

┌───────────────────┐
│  Fab City Yellow  │  #FFA62B
│   ████████████    │  • User messages
└───────────────────┘  • Highlights
                       • Pulsing ring

┌───────────────────┐
│  Fab City Blue    │  #1C5D99
│   ████████████    │  • Links
└───────────────────┘  • Header gradient
                       • Accents
```

### UI Colors
```
White      #FFFFFF  • AI message background
Gray 100   #F3F4F6  • AI message alt background
Gray 900   #111827  • Text color
Border     #E5E7EB  • Borders and dividers
```

---

## 📐 Layout Specifications

### Desktop (≥768px)
- **Container**: Centered, max-width 1024px
- **Suggestions**: 2-column grid
- **Messages**: Max-width 75%
- **Header**: Full-width, sticky
- **Input**: Full-width, centered

### Mobile (<768px)
- **Container**: Full-width with padding
- **Suggestions**: 1-column grid
- **Messages**: Max-width 85%
- **Everything**: Responsive stacking

---

## 🎭 Animations

### Floating Button
```
Idle State:
┌─────┐
│ 💬  │ ← Button
└─────┘
  ⭕ ← Pulsing ring (grows & fades)
      Duration: 2s
      Repeat: Infinite
```

### Modal Open/Close
```
Open:
  Opacity: 0 → 1
  Duration: 300ms
  Easing: ease-out

Close:
  Opacity: 1 → 0
  Duration: 300ms
  Easing: ease-in
```

### Message Entry
```
Message appears:
  Opacity: 0 → 1
  Y position: +10px → 0
  Scale: 0.95 → 1
  Duration: 300ms
```

### Loading Dots
```
● ● ●  (Fab City colors)
↕ ↕ ↕  (Bounce animation)
Green → Yellow → Blue
Delay: 0.15s each
```

---

## 💬 Message Styling

### User Message
```
┌──────────────────────────────┐
│  What is Fab City?           │  • Right-aligned
│                         2:30 │  • Yellow background (#FFA62B)
└──────────────────────────────┘  • White text
                                  • Shadow: md
                                  • Rounded: 2xl
```

### AI Message
```
┌──────────────────────────────┐
│  Fab City is a global        │  • Left-aligned
│  initiative for sustainable  │  • Gray background (#F3F4F6)
│  urban development.          │  • Dark text (#111827)
│  2:30                        │  • Border: gray-200
└──────────────────────────────┘  • Rounded: 2xl
```

---

## 🔘 Button Styles

### Send Button
```
┌─────┐
│ 📤  │  • Green background (#3EB489)
└─────┘  • White icon
         • Rounded: xl
         • Shadow: sm
         • Hover: opacity 90%
```

### Suggestion Chip
```
┌────────────────────────────┐
│  Your suggested question   │  • White background
└────────────────────────────┘  • Gray border
                                • Rounded: xl
                                • Hover: green border
                                • Shadow: sm
```

---

## 📱 Responsive Grid

### Suggestions Layout

**Desktop (≥768px):**
```
┌──────────────┐ ┌──────────────┐
│  Question 1  │ │  Question 2  │
└──────────────┘ └──────────────┘
┌──────────────┐ ┌──────────────┐
│  Question 3  │ │  Question 4  │
└──────────────┘ └──────────────┘
```

**Mobile (<768px):**
```
┌─────────────────────────────┐
│       Question 1            │
└─────────────────────────────┘
┌─────────────────────────────┐
│       Question 2            │
└─────────────────────────────┘
┌─────────────────────────────┐
│       Question 3            │
└─────────────────────────────┘
┌─────────────────────────────┐
│       Question 4            │
└─────────────────────────────┘
```

---

## 🎯 Typography

### Header
- **Title**: text-xl (20px), font-semibold
- **Subtitle**: text-sm (14px), text-gray-500

### Welcome
- **Title**: text-3xl (30px), font-bold
- **Description**: text-lg (18px), text-gray-600

### Messages
- **Text**: text-sm (14px), leading-relaxed
- **Timestamp**: text-xs (12px), text-gray-400

### Input
- **Placeholder**: text-gray-400
- **Text**: text-gray-900

---

## 🔄 State Indicators

### Loading
```
● ● ●  Bouncing dots
Green, Yellow, Blue
Animated sequence
```

### Error
```
⚠️ Error message
Red background (#FEE2E2)
Red text (#DC2626)
```

### Empty State
```
✨ Welcome Icon
Large, centered
Brand gradient background
```

---

## 🎨 Complete Flow

1. **User arrives** → Sees floating button
2. **Clicks button** → Full-page opens (fade in)
3. **Sees welcome** → Title, description, suggestions
4. **Clicks suggestion** → Fills input
5. **Sends message** → User message appears (slide up)
6. **Loading** → Bouncing dots
7. **AI responds** → AI message appears (slide up)
8. **Clicks link** → Preview modal opens
9. **Continues chat** → Messages stack, auto-scroll

---

**Clean. Professional. ChatGPT-style. 🚀**

