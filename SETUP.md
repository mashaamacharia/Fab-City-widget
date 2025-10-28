# Setup Guide - Fab City AI Chat Widget

## Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure n8n Webhook

1. Create a `.env` file in the root directory
2. Add your n8n webhook URL:

```env
N8N_WEBHOOK_URL=https://your-n8n-instance/webhook/fabcity-chat
```

### Step 3: Start the Application

**Option A - Automatic (Recommended for Windows):**
```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

**Option B - Manual (Two Terminals):**

Terminal 1 - Backend API:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm run dev
```

### Step 4: Open in Browser

Navigate to: `http://localhost:5173`

---

## n8n Webhook Configuration

Your n8n workflow should be configured to:

### Accept POST Requests

The webhook receives:
```json
{
  "message": "User's question here"
}
```

### Return JSON Response

The webhook should return:
```json
{
  "response": "AI's answer here"
}
```

Or alternatively:
```json
{
  "message": "AI's answer here"
}
```

---

## Example n8n Workflow

Here's a basic n8n workflow structure:

1. **Webhook Node** - Receives the POST request
2. **HTTP Request Node** - Calls your AI service (OpenAI, Claude, etc.)
3. **Function Node** - Formats the response
4. **Respond to Webhook Node** - Sends response back

---

## Testing Without n8n

For testing, you can modify `server/index.js` to return mock responses:

```javascript
// Comment out the fetch to n8n and return mock data
const data = {
  response: "This is a test response from Fab City AI!"
};
res.json(data);
```

---

## Troubleshooting

### Port Already in Use

If port 3001 or 5173 is already in use:

**Backend (3001):**
Edit `server/index.js` and change the PORT constant.

**Frontend (5173):**
Edit `vite.config.js` and add:
```javascript
server: {
  port: 3000, // Your preferred port
}
```

### CORS Issues

If you encounter CORS errors, ensure the backend has CORS enabled (already configured in `server/index.js`).

### n8n Connection Failed

1. Verify your n8n webhook URL is correct
2. Check if your n8n instance is accessible
3. Test the webhook directly with Postman or curl:

```bash
curl -X POST https://your-n8n-instance/webhook/fabcity-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

---

## Production Deployment

### Build for Production

```bash
npm run build
```

### Deploy Backend

The Express server (`server/index.js`) can be deployed to:
- Heroku
- Railway
- Vercel (Serverless Functions)
- AWS Lambda
- Your own VPS

### Deploy Frontend

The built frontend (`dist/` folder) can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

### Environment Variables

Set `N8N_WEBHOOK_URL` in your production environment.

---

## Support

For issues, check the README.md or open a GitHub issue.

**Happy Chatting! 🌍🤖**

