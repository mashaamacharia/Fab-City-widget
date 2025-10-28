# Frontend Deployment Guide

## 🎯 **Deploy the Chat Interface**

### **Files to Deploy**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── favicon.ico
```

## 🔧 **Before Deployment - Update API URL**

### **Step 1: Update API URL**

**File**: `src/components/ChatWidget.jsx`
**Line**: Around line 18

**Change from:**
```javascript
const apiUrl = 'http://localhost:3001';
```

**Change to:**
```javascript
const apiUrl = 'https://your-api-server.onrender.com';
```

**Replace `your-api-server.onrender.com` with your actual API server URL**

### **Step 2: Rebuild**
```bash
npm run build
```

## 🚀 **Deployment Options**

### **Option 1: Render Static Site (Recommended)**

1. **Go to**: [render.com](https://render.com)
2. **Create**: New Static Site
3. **Connect**: Your GitHub repository
4. **Build Command**: `npm run build`
5. **Publish Directory**: `dist`
6. **Deploy**: Automatic deployment

### **Option 2: Netlify**

1. **Go to**: [netlify.com](https://netlify.com)
2. **Drag & Drop**: The `dist` folder
3. **Or Connect**: GitHub repository
4. **Build Command**: `npm run build`
5. **Publish Directory**: `dist`

### **Option 3: Vercel**

1. **Go to**: [vercel.com](https://vercel.com)
2. **Import**: Your GitHub repository
3. **Framework**: Vite
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`

## 🔗 **Update API URL in Production**

### **Method 1: Environment Variable (Recommended)**

**Update `src/components/ChatWidget.jsx`:**
```javascript
const apiUrl = process.env.VITE_API_URL || 'http://localhost:3001';
```

**Set environment variable in your hosting service:**
- **Render**: Environment Variables section
- **Netlify**: Site Settings > Environment Variables
- **Vercel**: Project Settings > Environment Variables

**Variable**: `VITE_API_URL`
**Value**: `https://your-api-server.onrender.com`

### **Method 2: Direct Update**

**Update `src/components/ChatWidget.jsx`:**
```javascript
const apiUrl = 'https://your-api-server.onrender.com';
```

## 🧪 **Testing After Deployment**

### **1. Check Frontend**
- Visit your deployed URL
- Chat interface should load
- Check browser console for errors

### **2. Check API Connection**
- Open browser developer tools
- Send a test message
- Check Network tab for API calls
- Should see calls to your API server

### **3. Test Chat Functionality**
- Send a message
- Should receive AI response
- Check if iframe previews work

## 🔄 **Updating the Frontend**

### **When you make changes:**

1. **Update code** in `src/components/ChatWidget.jsx`
2. **Run build**: `npm run build`
3. **Deploy**: Your hosting service will auto-deploy
4. **Test**: Check the live site

### **Manual deployment:**
1. **Build**: `npm run build`
2. **Upload**: `dist` folder to your hosting service
3. **Test**: Check the live site

## 📋 **Deployment Checklist**

- [ ] API server deployed and working
- [ ] API URL updated in frontend code
- [ ] Frontend built (`npm run build`)
- [ ] Frontend deployed to static hosting
- [ ] Test chat functionality
- [ ] Test iframe previews
- [ ] Check browser console for errors

## 🎯 **Recommended Flow**

1. **Deploy API server first** (see API_DEPLOYMENT.md)
2. **Get API server URL**
3. **Update frontend API URL**
4. **Build frontend** (`npm run build`)
5. **Deploy frontend** to static hosting
6. **Test everything works**

This gives you the best performance and easiest maintenance!
