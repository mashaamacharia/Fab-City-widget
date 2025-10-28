# Fab City Chat Interface - Deployment Strategy

## 🎯 **Recommended: Separate Deployments**

### **Why Separate?**
- ✅ **Better Performance**: Static files served from CDN
- ✅ **Lower Costs**: Static hosting is cheaper
- ✅ **Better Scaling**: API and frontend scale independently
- ✅ **Easier Updates**: Update frontend without affecting API

## 🚀 **Deployment Plan**

### **1. API Server Deployment**

**Files to Deploy:**
```
server/
├── index.js          # API server
├── package.json      # Dependencies
└── .env              # Environment variables
```

**Environment Variables:**
```env
N8N_WEBHOOK_URL=https://automations.manymangoes.com.au/webhook/6b51b51f-4928-48fd-b5fd-b39c34f523d1/chat
PORT=3001
```

**Services:**
- **Render**: Web Service (Node.js)
- **Railway**: Node.js service
- **Heroku**: Node.js dyno
- **DigitalOcean**: App Platform

### **2. Frontend Deployment**

**Files to Deploy:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── favicon.ico
```

**Services:**
- **Render**: Static Site
- **Netlify**: Static site hosting
- **Vercel**: Static deployment
- **GitHub Pages**: Free static hosting

## 🔧 **Configuration Changes Needed**

### **Update API URL in Frontend**

**Current (Local):**
```javascript
const apiUrl = 'http://localhost:3001';
```

**Production (Update to your API server URL):**
```javascript
const apiUrl = 'https://your-api-server.onrender.com';
```

## 📋 **Step-by-Step Deployment**

### **Step 1: Deploy API Server**

1. **Create new repository** for API server
2. **Copy files**: `server/index.js`, `package.json`
3. **Deploy to Render/Railway/Heroku**
4. **Set environment variables**
5. **Get API server URL**

### **Step 2: Update Frontend**

1. **Update API URL** in `src/components/ChatWidget.jsx`
2. **Build frontend**: `npm run build`
3. **Deploy `dist/` folder** to static hosting

### **Step 3: Test Integration**

1. **Test API server**: `https://your-api.onrender.com/health`
2. **Test frontend**: `https://your-frontend.netlify.app`
3. **Test chat functionality**

## 💰 **Cost Comparison**

### **Separate Deployments**
- **API Server**: $7-25/month (Render, Railway, Heroku)
- **Static Site**: $0-10/month (Netlify, Vercel, Render Static)
- **Total**: $7-35/month

### **Combined Deployment**
- **Full Stack**: $25-50/month (Render, Railway, Heroku)
- **Total**: $25-50/month

## 🎯 **Recommended Services**

### **For API Server**
1. **Render** (Recommended)
   - Easy setup
   - Good free tier
   - Automatic deployments

2. **Railway**
   - Very easy setup
   - Good pricing
   - Great for Node.js

### **For Frontend**
1. **Render Static Site** (Recommended)
   - Same platform as API
   - Easy to manage
   - Good performance

2. **Netlify**
   - Excellent for static sites
   - Great CDN
   - Easy deployments

## 🔄 **Update Process**

### **API Updates**
1. Update `server/index.js`
2. Deploy to API server
3. No frontend changes needed

### **Frontend Updates**
1. Update `src/components/ChatWidget.jsx`
2. Run `npm run build`
3. Deploy `dist/` folder
4. No API changes needed

## 🚀 **Next Steps**

1. **Choose your services** (Render recommended)
2. **Deploy API server first**
3. **Update frontend API URL**
4. **Deploy frontend**
5. **Test everything works**

This approach gives you the best performance, lowest costs, and easiest maintenance!
