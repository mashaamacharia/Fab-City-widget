# Deploying to Render - Complete Guide

## 🎯 What We Fixed

The "Cannot GET /" error occurred because your server wasn't configured to serve the built static files. This has been fixed!

## ✅ Changes Made

1. **Updated `server/index.js`**:
   - Added static file serving from `dist/` directory
   - Added catch-all route for SPA (Single Page Application) support
   - Proper path handling for ES modules

2. **Created `render.yaml`**:
   - Automatic configuration for Render deployment
   - Correct build and start commands
   - Environment variable setup

## 🚀 Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Fix Render deployment configuration"
   git push origin main
   ```

2. **In Render Dashboard**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and configure everything

3. **Review & Deploy**:
   - Render will use the settings from `render.yaml`
   - Click "Create Web Service"
   - Wait for deployment to complete

### Option 2: Manual Configuration

If you prefer manual setup or already created the service:

1. **Go to your Render service dashboard**

2. **Update Build Command**:
   ```
   npm install && npm run build
   ```

3. **Update Start Command**:
   ```
   node server/index.js
   ```

4. **Set Environment Variables**:
   - Key: `N8N_WEBHOOK_URL`
   - Value: `https://automations.manymangoes.com.au/webhook/6b51b51f-4928-48fd-b5fd-b39c34f523d1/chat`

5. **Redeploy**:
   - Click "Manual Deploy" → "Clear build cache & deploy"

## 🔍 Verify Deployment

After deployment completes:

1. **Check Build Logs**:
   - Should show successful `npm run build`
   - Should create `dist/` directory

2. **Check Server Logs**:
   - Should see: `🚀 Server running on port: 10000`
   - Should see: `📁 Serving static files from: ...`

3. **Test the Application**:
   - Visit your Render URL (e.g., `https://your-app.onrender.com`)
   - Should see your chat widget interface
   - Try sending a message to test API connectivity

## 🐛 Troubleshooting

### Still getting "Cannot GET /"?

**Check Build Output**:
```bash
# In Render logs, verify you see:
> vite build
✓ built in XXXms
```

**Check dist/ Directory**:
- The build should create a `dist/` folder with `index.html`
- If missing, the build failed

**Solution**:
1. Clear build cache in Render
2. Redeploy

### API Not Working?

**Check Environment Variables**:
- Verify `N8N_WEBHOOK_URL` is set correctly
- Check server logs for the webhook URL being used

### CORS Errors?

Your server already has CORS enabled, but if you see CORS errors:

**Update server/index.js**:
```javascript
app.use(cors({
  origin: ['https://your-app.onrender.com', 'https://your-domain.com'],
  credentials: true
}));
```

### Port Issues?

Render automatically sets the `PORT` environment variable. Your server already handles this:
```javascript
const PORT = process.env.PORT || 3001;
```

## 📊 Expected Render Configuration

After setup, your Render service should show:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `node server/index.js`
- **Environment**: Node
- **Auto-Deploy**: Yes (on git push)

## 🔐 Environment Variables

Set these in Render Dashboard → Environment:

| Key | Value | Required |
|-----|-------|----------|
| `N8N_WEBHOOK_URL` | Your n8n webhook URL | Yes |
| `NODE_VERSION` | 18.18.0 or higher | Optional |

## 📝 After Deployment

1. **Test the Widget**:
   - Open the Render URL
   - Test chat functionality
   - Verify messages reach n8n

2. **Update Widget URLs** (if embedding):
   - Update your `fabcity-widget.js` API URL to point to Render
   - Or use the embed version with correct API configuration

3. **Monitor Logs**:
   - Check for any errors
   - Verify webhook communication

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Render service created/updated
- [ ] Build completed successfully
- [ ] Application loads at Render URL
- [ ] Chat widget appears
- [ ] Messages send successfully
- [ ] Responses received from n8n

## 🆘 Need Help?

If you're still having issues:

1. **Check Render Logs**:
   - Build logs for build errors
   - Runtime logs for server errors

2. **Verify Files**:
   - Ensure `dist/` folder exists after build
   - Check `server/index.js` has latest changes

3. **Test Locally**:
   ```bash
   npm run build
   npm start
   # Visit http://localhost:3001
   ```

If it works locally but not on Render, it's likely a configuration issue in Render dashboard.

---

**Your app should now be live! 🚀**

