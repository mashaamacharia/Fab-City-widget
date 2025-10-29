# 🚀 Fab City Widget - Complete Deployment Guide

## Overview

This guide walks you through deploying the Fab City AI Chat Widget for multiple client websites with domain-based routing in n8n.

## 📋 Prerequisites

- Node.js 18+ installed
- n8n instance running
- CDN or web hosting for widget files
- API server accessible from client websites

## 🔧 Part 1: Build the Widget

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create or update `.env` file:

```env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id/chat
PORT=3001
```

### 3. Build Everything

```bash
# Build the embeddable widget
npm run build:embed

# Or build everything (main app + embed widget)
npm run build:all
```

This creates:
- `dist-embed/fabcity-widget.js` - The widget script
- `dist-embed/fabcity-widget.css` - The widget styles

## 📤 Part 2: Deploy Widget Files

### Option A: Upload to CDN (Recommended)

Upload both files to your CDN:

```
https://cdn.fabcity.com/widget/fabcity-widget.js
https://cdn.fabcity.com/widget/fabcity-widget.css
```

Examples:
- **Cloudflare**: Upload via dashboard or R2
- **AWS S3 + CloudFront**: Upload to S3, serve via CloudFront
- **Netlify**: Drop files or deploy via CLI
- **Vercel**: Deploy as static files

### Option B: Self-Host

1. Copy files to your web server:
```bash
scp dist-embed/* user@your-server.com:/var/www/widget/
```

2. Serve with NGINX:
```nginx
location /widget/ {
    alias /var/www/widget/;
    add_header Access-Control-Allow-Origin *;
    add_header Cache-Control "public, max-age=31536000";
}
```

## 🖥️ Part 3: Deploy API Server

### Option A: Production Server

1. Clone to server:
```bash
git clone your-repo
cd FabCity
npm install --production
```

2. Set environment variables:
```bash
export N8N_WEBHOOK_URL="https://your-n8n.com/webhook/..."
export PORT=3001
```

3. Run with PM2:
```bash
npm install -g pm2
pm2 start server/index.js --name fabcity-api
pm2 save
pm2 startup
```

### Option B: Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY server ./server
EXPOSE 3001
CMD ["node", "server/index.js"]
```

Build and run:
```bash
docker build -t fabcity-api .
docker run -d -p 3001:3001 \
  -e N8N_WEBHOOK_URL="https://your-n8n.com/webhook/..." \
  --name fabcity-api \
  fabcity-api
```

### Option C: Cloud Platforms

**Heroku:**
```bash
heroku create fabcity-api
heroku config:set N8N_WEBHOOK_URL="https://..."
git push heroku main
```

**Railway:**
```bash
railway init
railway up
```

**Render:**
- Connect GitHub repo
- Set build command: `npm install`
- Set start command: `node server/index.js`
- Add environment variables

## 🔄 Part 4: Configure n8n Workflow

### 1. Create Webhook Trigger

- **Webhook URL:** `/webhook/your-id/chat`
- **Method:** POST
- **Response:** Immediately (Webhook Response node)

### 2. Add IF Node for Domain Routing

```
Webhook Trigger
    ↓
IF Node: Route by Domain
    ├─ Condition 1: {{ $json.domain }} contains "learn.fabcity"
    │   ↓
    │  Learn AI Agent Node
    │   ↓
    │  Respond to Webhook
    │
    ├─ Condition 2: {{ $json.domain }} contains "network.fabcity"
    │   ↓
    │  Network AI Agent Node
    │   ↓
    │  Respond to Webhook
    │
    └─ ELSE
        ↓
       Default AI Agent Node
        ↓
       Respond to Webhook
```

### 3. Configure AI Agent Nodes

For each AI agent:

**OpenAI Chat Model:**
- Model: gpt-4 or gpt-3.5-turbo
- System Message: (Your custom instructions)
- Messages: `{{ $json.message }}`

**Memory Buffer:**
- Session ID: `{{ $json.sessionId }}`
- Context Window: 10 messages

**Response:**
- Field Name: `output`
- Value: `{{ $json.output }}` (from AI response)

### 4. Add Webhook Response Node

After each agent, respond with:

```json
{
  "output": "{{ $json.output }}"
}
```

Or structure as array:
```json
[
  {
    "output": "{{ $json.output }}"
  }
]
```

## 🌐 Part 5: Configure CORS

Update `server/index.js` for production domains:

```javascript
const allowedOrigins = [
  'https://learn.fabcity.com',
  'https://network.fabcity.com',
  'https://fabcity.com',
  'http://localhost:3000'  // For testing
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

## 📝 Part 6: Client Integration

### Share with Clients

Send clients the embed code with your production URLs:

```html
<!-- Fab City AI Chat Widget -->
<script>
  window.FabCityConfig = {
    apiUrl: 'https://api.fabcity.com'  // Your production API URL
  };
</script>
<link rel="stylesheet" href="https://cdn.fabcity.com/widget/fabcity-widget.css">
<script src="https://cdn.fabcity.com/widget/fabcity-widget.js"></script>
```

### Integration Instructions

Provide clients with:
1. `EMBED_WIDGET.md` - Simple embed guide
2. `CLIENT_INTEGRATION_GUIDE.md` - Detailed technical docs

## ✅ Part 7: Testing Checklist

### Local Testing

```bash
# Terminal 1: Start API server
npm run server

# Terminal 2: Build widget
npm run build:embed

# Open embed-example.html in browser
```

### Production Testing

- [ ] Widget loads on test page
- [ ] Chat button appears in bottom-right
- [ ] Can send and receive messages
- [ ] Browser console shows domain and sessionId
- [ ] Server logs show correct data flow
- [ ] n8n receives all three fields (message, sessionId, domain)
- [ ] Correct AI agent responds based on domain
- [ ] Session persists across multiple messages
- [ ] Works on mobile devices
- [ ] CORS allows requests from client domains

### Test Each Domain

For each client site:
1. Add widget code to test page
2. Send test message
3. Verify in n8n logs: domain is correct
4. Confirm correct AI agent responds
5. Test conversation memory (ask follow-up)

## 📊 Part 8: Monitoring

### Server Logs

Monitor API server:
```bash
pm2 logs fabcity-api
```

Look for:
```
📨 Sending to n8n - Domain: learn.fabcity.com, Session: session_xxx
✅ Received from n8n - Domain: learn.fabcity.com, Session: session_xxx
```

### n8n Execution Logs

Check webhook receives:
```json
{
  "message": "...",
  "sessionId": "session_xxx",
  "domain": "learn.fabcity.com"
}
```

### Error Tracking

Set up alerts for:
- API server errors
- n8n webhook failures
- CORS rejections
- Invalid domains

## 🔒 Part 9: Security

### Domain Whitelist

Add validation in n8n (Function node before routing):

```javascript
const allowedDomains = [
  'learn.fabcity.com',
  'network.fabcity.com',
  'fabcity.com'
];

const domain = $json.domain;
const isAllowed = allowedDomains.some(d => domain.includes(d));

if (!isAllowed) {
  throw new Error(`Unauthorized domain: ${domain}`);
}

return $input.all();
```

### Rate Limiting

Add to API server:

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

app.use('/api/chat', limiter);
```

### Environment Variables

Never commit sensitive data. Use:
- `.env` file locally (in `.gitignore`)
- Environment variables on server
- Secrets manager in production

## 📦 Part 10: Updates and Maintenance

### Update Widget

1. Make changes to `src/components/ChatWidget.jsx`
2. Rebuild: `npm run build:embed`
3. Upload new files to CDN
4. Widget auto-updates on client sites (cached files expire)

### Force Update

Add version to filename:
```javascript
// vite.embed.config.js
fileName: () => `fabcity-widget.v2.js`
```

Update client embed code to new version.

### Rollback

Keep previous versions on CDN:
```
fabcity-widget.v1.js
fabcity-widget.v2.js
fabcity-widget.js (latest)
```

## 🎉 Success!

You now have:
- ✅ Embeddable AI chat widget
- ✅ Domain-based routing to different AI agents
- ✅ Session memory across conversations
- ✅ Production-ready API server
- ✅ n8n workflow configured
- ✅ Client integration ready

## 📚 Documentation Reference

- `EMBED_WIDGET.md` - Quick client embed guide
- `CLIENT_INTEGRATION_GUIDE.md` - Detailed integration docs
- `SESSION_ID_FIX_GUIDE.md` - Technical implementation details
- `embed-example.html` - Working example

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Widget doesn't load | Check CDN URLs, verify CORS |
| Chat doesn't send | Check API URL in config, verify server is running |
| Wrong AI responds | Check domain value in n8n, verify IF conditions |
| No conversation memory | Verify sessionId in n8n AI node configuration |
| CORS errors | Add client domain to allowedOrigins |

---

**Ready to deploy?** Start with Part 1 and work through each section!

