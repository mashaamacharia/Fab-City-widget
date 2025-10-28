# Fab City AI Chat Widget - Production Deployment Guide

## Overview

The Fab City AI Chat Widget is ready for production deployment. This guide provides instructions for deploying the widget on different tech stacks and platforms.

## 📦 Production Files

After building (`npm run build:embed`), you have two main files:
- `fabcity-widget.js` - The widget's JavaScript bundle
- `fabcity-widget.css` - The widget's styles

## 🚀 Deployment Steps

### 1. Host the Widget Files

First, upload the widget files to your preferred hosting solution:

**Option A: CDN (Recommended)**
```bash
# Example paths after uploading to your CDN
https://cdn.yourdomain.com/fabcity-widget.js
https://cdn.yourdomain.com/fabcity-widget.css
```

**Option B: Static Hosting**
```bash
# Example with static file hosting
https://static.yourdomain.com/widget/fabcity-widget.js
https://static.yourdomain.com/widget/fabcity-widget.css
```

### 2. Configure Your API Server

Ensure your API server is properly configured:
```javascript
const API_URL = 'https://api.yourdomain.com';  // Your production API endpoint
```

## 🔧 Integration Instructions by Platform

### Basic HTML Website
```html
<!-- Add before closing </body> tag -->
<script>
  window.FabCityConfig = {
    apiUrl: 'https://api.yourdomain.com'
  };
</script>
<link rel="stylesheet" href="https://cdn.yourdomain.com/fabcity-widget.css">
<script src="https://cdn.yourdomain.com/fabcity-widget.js"></script>
```

### WordPress

**Option 1: Theme Integration**
Add to `footer.php`:
```php
<?php
// Add before closing </body> tag
?>
<script>
  window.FabCityConfig = {
    apiUrl: '<?php echo esc_url(get_option('fabcity_api_url')); ?>'
  };
</script>
<link rel="stylesheet" href="<?php echo esc_url('https://cdn.yourdomain.com/fabcity-widget.css'); ?>">
<script src="<?php echo esc_url('https://cdn.yourdomain.com/fabcity-widget.js'); ?>"></script>
```

**Option 2: Plugin Integration**
```php
add_action('wp_footer', function() {
  ?>
  <script>
    window.FabCityConfig = {
      apiUrl: '<?php echo esc_url(get_option('fabcity_api_url')); ?>'
    };
  </script>
  <link rel="stylesheet" href="<?php echo esc_url('https://cdn.yourdomain.com/fabcity-widget.css'); ?>">
  <script src="<?php echo esc_url('https://cdn.yourdomain.com/fabcity-widget.js'); ?>"></script>
  <?php
});
```

### React/Next.js

**Option 1: App-wide Integration (`_app.js` or `layout.js`)**
```jsx
// pages/_app.js or app/layout.js
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Configure widget
    window.FabCityConfig = {
      apiUrl: process.env.NEXT_PUBLIC_FABCITY_API_URL
    };

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.yourdomain.com/fabcity-widget.css';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://cdn.yourdomain.com/fabcity-widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      link.remove();
      script.remove();
    };
  }, []);

  return <Component {...pageProps} />;
}
```

**Option 2: Component Integration**
```jsx
// components/FabCityWidget.jsx
import { useEffect } from 'react';

export default function FabCityWidget() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.FabCityConfig = {
      apiUrl: process.env.NEXT_PUBLIC_FABCITY_API_URL
    };

    // Load resources
    Promise.all([
      loadStyle('https://cdn.yourdomain.com/fabcity-widget.css'),
      loadScript('https://cdn.yourdomain.com/fabcity-widget.js')
    ]).catch(console.error);
  }, []);

  return null;
}

function loadStyle(src) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = src;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}
```

### Vue/Nuxt

```vue
<!-- plugins/fabcity-widget.client.js -->
export default defineNuxtPlugin(() => {
  onMounted(() => {
    // Configure
    window.FabCityConfig = {
      apiUrl: process.env.FABCITY_API_URL
    };

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.yourdomain.com/fabcity-widget.css';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://cdn.yourdomain.com/fabcity-widget.js';
    script.async = true;
    document.body.appendChild(script);
  });
});
```

### Angular

```typescript
// app.component.ts
import { Component, OnInit } from '@angular/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit {
  ngOnInit() {
    // Configure
    (window as any).FabCityConfig = {
      apiUrl: environment.fabcityApiUrl
    };

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.yourdomain.com/fabcity-widget.css';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://cdn.yourdomain.com/fabcity-widget.js';
    script.async = true;
    document.body.appendChild(script);
  }
}
```

### Shopify

Add to theme settings:

```liquid
<!-- layout/theme.liquid -->
{% if settings.enable_fabcity_chat %}
  <script>
    window.FabCityConfig = {
      apiUrl: '{{ settings.fabcity_api_url }}'
    };
  </script>
  <link rel="stylesheet" href="https://cdn.yourdomain.com/fabcity-widget.css">
  <script src="https://cdn.yourdomain.com/fabcity-widget.js"></script>
{% endif %}
```

### Wix

Add in Settings → Custom Code → "Body - end":

```html
<script>
  window.FabCityConfig = {
    apiUrl: 'https://api.yourdomain.com'
  };
</script>
<link rel="stylesheet" href="https://cdn.yourdomain.com/fabcity-widget.css">
<script src="https://cdn.yourdomain.com/fabcity-widget.js"></script>
```

## 🔒 Security Considerations

### 1. CORS Configuration

Configure your API server to allow requests from client domains:

```javascript
const allowedDomains = [
  'https://client1.com',
  'https://client2.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedDomains.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
```

### 2. Rate Limiting

Add rate limiting to your API:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP
});

app.use('/api/chat', limiter);
```

## 📝 Configuration Options

The `FabCityConfig` object supports these options:

```javascript
window.FabCityConfig = {
  apiUrl: 'https://api.yourdomain.com',  // Required: Your API endpoint
  // Add more config options as needed
};
```

## ✅ Integration Checklist

1. **Build the Widget**
   ```bash
   npm run build:embed
   ```

2. **Upload Files**
   - Upload `fabcity-widget.js` and `fabcity-widget.css` to CDN/hosting

3. **Configure API**
   - Set up production API server
   - Configure CORS
   - Add rate limiting
   - Set up monitoring

4. **Test Integration**
   - Test on development site
   - Verify API connectivity
   - Check CORS configuration
   - Test chat functionality
   - Verify domain routing

5. **Monitor Production**
   - Set up error tracking
   - Monitor API performance
   - Track usage metrics

## 🔍 Troubleshooting

### Widget Not Loading
- Check if JS/CSS files are accessible
- Verify API URL configuration
- Check browser console for errors
- Verify CORS settings

### Chat Not Working
- Check API connectivity
- Verify domain is allowed in CORS
- Check rate limiting settings
- Monitor server logs

### Domain Routing Issues
- Verify domain is being sent correctly
- Check n8n workflow configuration
- Test domain routing logic

## 📞 Support

For integration support:
1. Check browser console (F12)
2. Review server logs
3. Check n8n execution logs
4. Verify configuration settings

---

**Ready to Deploy?** Follow this guide step by step and reach out if you need assistance! 🚀



