# ⚡ Quick Start Guide

## 🚀 Get Running in 3 Steps

### Step 1️⃣: Install
```bash
npm install
```

### Step 2️⃣: Configure
Create a `.env` file:
```env
N8N_WEBHOOK_URL=https://your-n8n-instance/webhook/fabcity-chat
```

### Step 3️⃣: Run
**Windows:**
```bash
start.bat
```

**Mac/Linux:**
```bash
chmod +x start.sh
./start.sh
```

**OR manually (2 terminals):**
```bash
# Terminal 1
npm run server

# Terminal 2
npm run dev
```

### 🎉 Done!
Open: **http://localhost:5173**

---

## 🎨 What You'll See

### Closed State
- **Floating chat button** (bottom-right) with pulsing ring animation
- Gradient green-to-blue background
- Click to open

### Open State (Full-Page Chat)
- **Professional header**: "Fab City AI Assistant"
- **Welcome screen** with suggested questions
- **Centrally placed content** (max-width 1024px)
- **Input area** at bottom center
- Type and hit **Enter** or click **Send**
- AI responds with **markdown formatting**
- Click **links** to preview PDFs, images, videos, or websites

### Features
✅ ChatGPT-style full-page interface  
✅ Suggested prompts for new users  
✅ Fully responsive (mobile to desktop)  
✅ Professional, clean design  
✅ Rich media previews  
✅ Smooth animations throughout

---

## 🎯 Test Without n8n

To test without connecting to n8n, edit `server/index.js`:

```javascript
// Around line 20, replace the fetch block with:
const data = {
  response: "Hello! This is a **test response** from Fab City AI. [Click here](https://fabcity.org) to learn more!"
};
res.json(data);
```

---

## 📚 Need More Info?

- **Full Docs**: [README.md](README.md)
- **Setup Guide**: [SETUP.md](SETUP.md)
- **Project Overview**: [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)

---

## 🛠️ Troubleshooting

**Port already in use?**
```bash
# Kill process on port 3001 (Windows)
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Kill process on port 3001 (Mac/Linux)
lsof -ti:3001 | xargs kill -9
```

**Dependencies not installing?**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Chat not connecting to n8n?**
1. Check your `.env` file has the correct webhook URL
2. Test the webhook directly with curl:
```bash
curl -X POST https://your-n8n-instance/webhook/fabcity-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

---

**Happy Chatting! 💬🌍**

