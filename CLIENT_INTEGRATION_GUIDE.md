# Fab City AI Chat Widget - Client Integration Guide

## 📋 Overview

This guide shows you how to embed the Fab City AI Chat Widget on your website. The widget automatically detects which domain it's on and routes conversations to the appropriate AI agent.

## 🚀 Quick Start (3 Lines of Code)

Add this code just before the closing `</body>` tag on your website:

```html
<!-- Configure the widget -->
<script>
  window.FabCityConfig = {
    apiUrl: 'https://your-api-server.com'  // Replace with actual API URL
  };
</script>

<!-- Load widget CSS -->
<link rel="stylesheet" href="https://your-cdn.com/fabcity-widget.css">

<!-- Load widget JavaScript -->
<script src="https://your-cdn.com/fabcity-widget.js"></script>
```

That's it! The chat widget will appear in the bottom-right corner of your page.

## 📦 What Gets Sent to Your Webhook

When a user sends a message, your n8n webhook receives:

```json
{
  "message": "User's question here",
  "sessionId": "session_1728483920123_k2j9d8f7a",
  "domain": "learn.fabcity.com"
}
```

### Field Descriptions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `message` | String | The user's question/message | "What is Fab City?" |
| `sessionId` | String | Unique conversation identifier | "session_1728483920123_k2j9d8f7a" |
| `domain` | String | Hostname where widget is embedded | "learn.fabcity.com" or "network.fabcity.com" |

## 🎯 n8n Workflow Configuration

### Step 1: Receive Webhook Data

Your webhook node will automatically receive all three fields:
- `{{ $json.message }}`
- `{{ $json.sessionId }}`
- `{{ $json.domain }}`

### Step 2: Route Based on Domain (IF Node)

Configure an IF node to route to different AI agents:

```
IF Node Configuration:
├─ Condition 1: {{ $json.domain }} contains "learn.fabcity"
│  └─ Route to: Learn AI Agent
│
├─ Condition 2: {{ $json.domain }} contains "network.fabcity"
│  └─ Route to: Network AI Agent
│
└─ Else:
   └─ Route to: Default AI Agent
```

#### Example IF Node Setup

**Condition Type:** String
- **Value 1:** `{{ $json.domain }}`
- **Operation:** Contains
- **Value 2:** `learn.fabcity`

**True Branch:** Connect to your "Learn Fab City" AI Agent
**False Branch:** Check for other domains or use default agent

### Step 3: Configure AI Agent with Memory

In your AI Agent node:
- **Session ID:** `{{ $json.sessionId }}`
- **User Message:** `{{ $json.message }}`
- **Context:** Use domain-specific knowledge base

### Step 4: Return Response

Your webhook response should be in one of these formats:

**Option 1: Array (most common)**
```json
[
  {
    "output": "AI response here..."
  }
]
```

**Option 2: Object**
```json
{
  "response": "AI response here..."
}
```

## 🎨 Customization Options

### Basic Configuration

```html
<script>
  window.FabCityConfig = {
    apiUrl: 'https://api.fabcity.com',
    // Add more options as needed
  };
</script>
```

### Advanced Integration

For WordPress, add to your theme's `footer.php`:
```php
<!-- Fab City AI Widget -->
<script>
  window.FabCityConfig = {
    apiUrl: '<?php echo get_option('fabcity_api_url'); ?>'
  };
</script>
<link rel="stylesheet" href="https://cdn.fabcity.com/widget/fabcity-widget.css">
<script src="https://cdn.fabcity.com/widget/fabcity-widget.js"></script>
```

For React/Next.js websites:
```jsx
// Add to _app.js or layout.js
useEffect(() => {
  // Configure
  window.FabCityConfig = {
    apiUrl: process.env.NEXT_PUBLIC_FABCITY_API_URL
  };

  // Load CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.fabcity.com/widget/fabcity-widget.css';
  document.head.appendChild(link);

  // Load JS
  const script = document.createElement('script');
  script.src = 'https://cdn.fabcity.com/widget/fabcity-widget.js';
  document.body.appendChild(script);
}, []);
```

## 🔧 Domain-Based Routing Examples

### Example 1: Two Different Sites

**Scenario:** You have `learn.fabcity.com` and `network.fabcity.com`

**n8n Workflow:**
```
Webhook Trigger
  ↓
IF: domain contains "learn"
  ├─ TRUE → OpenAI (Learn Knowledge Base)
  └─ FALSE → IF: domain contains "network"
              ├─ TRUE → OpenAI (Network Knowledge Base)
              └─ FALSE → Default Agent
```

### Example 2: Multi-Language Support

**Scenario:** Route based on subdomain language

```
IF: domain contains "es."
  ├─ TRUE → Spanish AI Agent
  └─ FALSE → IF: domain contains "fr."
              ├─ TRUE → French AI Agent
              └─ FALSE → English AI Agent
```

### Example 3: Client-Specific Agents

**Scenario:** Different clients get different agents

```
IF: domain equals "client1.com"
  ├─ TRUE → Client 1 Custom Agent
  └─ FALSE → IF: domain equals "client2.com"
              ├─ TRUE → Client 2 Custom Agent
              └─ FALSE → Generic Agent
```

## 📊 Testing the Integration

### 1. Test Locally

Use the provided `embed-example.html`:
```bash
npm run build:embed
# Open embed-example.html in your browser
```

### 2. Check Browser Console

Open Developer Tools (F12) and look for:
```
🌐 Widget initialized on domain: localhost
🔑 Session ID: session_1728483920123_k2j9d8f7a
```

### 3. Verify Server Logs

Your server should show:
```
📨 Sending to n8n - Domain: localhost, Session: session_xxx, Message: "..."
✅ Received from n8n - Domain: localhost, Session: session_xxx
```

### 4. Check n8n Execution Logs

In n8n, verify you see:
```json
{
  "message": "Test message",
  "sessionId": "session_1728483920123_k2j9d8f7a",
  "domain": "localhost"
}
```

## 🔒 Security Considerations

### CORS Configuration

Your API server should allow requests from client domains:

```javascript
// In server/index.js
const allowedDomains = [
  'https://learn.fabcity.com',
  'https://network.fabcity.com',
  'http://localhost'  // For testing
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedDomains.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
```

### Domain Validation in n8n

Add a validation step in n8n:

```
Webhook → Validate Domain → Route to AI Agent
```

**Validation Node (Function):**
```javascript
const allowedDomains = [
  'learn.fabcity.com',
  'network.fabcity.com'
];

const domain = $json.domain;

if (!allowedDomains.some(d => domain.includes(d))) {
  throw new Error('Unauthorized domain');
}

return $input.all();
```

## 📈 Deployment Checklist

- [ ] Build the embed widget: `npm run build:embed`
- [ ] Upload `dist-embed/fabcity-widget.js` to your CDN
- [ ] Upload `dist-embed/fabcity-widget.css` to your CDN
- [ ] Update API URL in production environment
- [ ] Configure CORS for allowed domains
- [ ] Set up n8n IF nodes for domain routing
- [ ] Test on all client websites
- [ ] Monitor n8n execution logs
- [ ] Set up error tracking

## 🛠️ Build Commands

```bash
# Development
npm run dev              # Start development server

# Build standalone app
npm run build            # Build main application

# Build embeddable widget
npm run build:embed      # Build widget for embedding

# Build everything
npm run build:all        # Build both versions

# Start API server
npm run server           # Start backend on port 3001
```

## 📁 File Structure

After building, you'll have:

```
dist-embed/
├── fabcity-widget.js    # Embeddable script (include in <script> tag)
└── fabcity-widget.css   # Widget styles (include in <link> tag)
```

## 🚨 Troubleshooting

### Widget doesn't appear
- Check browser console for errors
- Verify script and CSS URLs are correct
- Check that API URL in config is accessible

### Domain not being sent
- Open browser console and check for domain logs
- Verify `window.location.hostname` is accessible
- Check server logs to see what's received

### CORS errors
- Add client domain to CORS whitelist
- Check API server CORS configuration
- Verify API URL uses HTTPS in production

### Session not persisting
- Check that sessionId is being generated
- Verify n8n is using sessionId for memory
- Check browser console for session logs

### Wrong AI agent responding
- Verify domain value in n8n logs
- Check IF node conditions (use "contains" not "equals")
- Test domain matching logic

## 📞 Support

For integration support, check:
1. Browser Developer Console (F12)
2. Server logs for API requests
3. n8n execution logs for webhook data
4. SESSION_ID_FIX_GUIDE.md for additional details

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Chat button appears in bottom-right corner
- ✅ Browser console shows domain and session ID
- ✅ Server logs show all three fields being sent
- ✅ n8n receives message, sessionId, and domain
- ✅ Correct AI agent responds based on domain
- ✅ Conversation memory persists across messages

---

**Ready to Deploy?** Build the widget with `npm run build:embed` and share the files with your clients!

