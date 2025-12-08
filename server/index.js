import cors from 'cors';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

// Replace with your actual n8n webhook URL here
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://automations.manymangoes.com.au/webhook/6b51b51f-4928-48fd-b5fd-b39c34f523d1/chat';

app.use(cors({
  origin: [
  'http://localhost:5173',  
    'https://fcity.manymangoes.com.au',
    'https://fabcity.manymangoes.com.au',
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    //console.log('📥 Received request body:', JSON.stringify(req.body, null, 2));
    
    const { message, sessionId, domain, location } = req.body;

    // Validate required fields
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    // Log the request for debugging
    const locationInfo = location 
      ? `Location: (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}, accuracy: ${location.accuracy}m)`
      : 'Location: ❌ Not provided';
    
    //console.log(`📤 Sending to n8n - Domain: ${domain}, Session: ${sessionId}, ${locationInfo}, Message: "${message.substring(0, 50)}..."`);

    // Prepare payload for n8n
    const payload = {
      message,
      sessionId,
      domain
    };

    // Add location data if available
    if (location && location.latitude && location.longitude) {
      payload.location = {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy || null
      };
      //console.log('✅ Location added to n8n payload:', payload.location);
    } else {
      //console.log('⚠️ Location not available in request or invalid format');
    }
    
    //console.log('📦 Full n8n payload:', JSON.stringify(payload, null, 2));

    // Forward the data to n8n webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook responded with status: ${response.status}`);
    }

    const data = await response.json();
    //console.log(`✅ Received from n8n - Domain: ${domain}, Session: ${sessionId}`);

    // Return the n8n response to the frontend
    res.json(data);
  } catch (error) {
    console.error('Error proxying to n8n:', error);
    res.status(500).json({
      error: 'Failed to get response from AI',
      message: error.message
    });
  }
});

// API info endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'FabCity Assistant API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      chat: 'POST /api/chat - Send a message to the AI assistant'
    },
    widget: {
      url: 'https://fabcity-widget.onrender.com',
      script: 'https://fabcity-widget.onrender.com/fabcity-widget.js',
      css: 'https://fabcity-widget.onrender.com/fabcity-widget.css'
    },
    documentation: {
      chat: {
        method: 'POST',
        endpoint: '/api/chat',
        body: {
          message: 'string (required) - User message',
          sessionId: 'string (required) - Unique session identifier',
          domain: 'string (required) - Domain where widget is embedded',
          location: 'object (optional) - User location data'
        },
        locationObject: {
          latitude: 'number - User latitude coordinate',
          longitude: 'number - User longitude coordinate',
          accuracy: 'number (optional) - Location accuracy in meters'
        },
        example: {
          message: 'What is Fab City?',
          sessionId: 'session_1234567890_abc123',
          domain: 'example.com',
          location: {
            latitude: -37.8136,
            longitude: 144.9631,
            accuracy: 20
          }
        }
      }
    }
  });
});

// Log chat sessions
app.post('/api/logs', express.json(), async (req, res) => {
  try {
    const payload = req.body;
    // console.log('🧾 Received chat log from client:', {
    //   sessionId: payload.sessionId,
    //   totalMessages: payload.totalMessages,
    //   domain: payload.domain,
    // });

    // Forward to n8n webhook
    const n8nLogWebhook = 'https://automations.manymangoes.com.au/webhook/cfb922b5-3f55-4ccf-94c2-6b83e10d37b9';
    const response = await fetch(n8nLogWebhook, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`⚠️ n8n log webhook responded with ${response.status}`);
      return res.status(502).json({ error: 'Failed to forward log to n8n' });
    }

    //console.log('✅ Chat log successfully forwarded to n8n.');
    res.status(204).end(); // no content required for sendBeacon
  } catch (err) {
    console.error('❌ Error forwarding log to n8n:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Log chat sessions
app.post('/api/logs', express.json(), async (req, res) => {
  try {
    const payload = req.body;
    // console.log('🧾 Received chat log from client:', {
    //   sessionId: payload.sessionId,
    //   totalMessages: payload.totalMessages,
    //   domain: payload.domain,
    // });

    // Forward to n8n webhook
    const n8nLogWebhook = 'https://automations.manymangoes.com.au/webhook/cfb922b5-3f55-4ccf-94c2-6b83e10d37b9';
    const response = await fetch(n8nLogWebhook, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`⚠️ n8n log webhook responded with ${response.status}`);
      return res.status(502).json({ error: 'Failed to forward log to n8n' });
    }

    //console.log('✅ Chat log successfully forwarded to n8n.');
    res.status(204).end(); // no content required for sendBeacon
  } catch (err) {
    console.error('❌ Error forwarding log to n8n:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/check-embed', async (req, res) => {
  const targetUrl = req.query.url;
  const type = req.query.type || 'web';
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    // -------------------------
    // 1. HEAD Request
    // -------------------------
    const head = await fetch(targetUrl, { method: 'HEAD' });

    const headers = head.headers;
    const xFrame = headers.get("x-frame-options");
    const csp = headers.get("content-security-policy");
    const contentType = headers.get("content-type") || "";
    const contentLen = headers.get("content-length");
    const fileSize = contentLen ? parseInt(contentLen, 10) : null;
    
    // Check if URL is a PDF (by extension or content-type)
    const isPdf = targetUrl.toLowerCase().endsWith('.pdf') || 
                  contentType.toLowerCase().includes('application/pdf');

    // -------------------------
    // 2. Check iframe blocking
    // -------------------------
    let blocked = false;
    
    // Check file size: > 25MB = blocked
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
    if (fileSize !== null && fileSize > MAX_FILE_SIZE) {
      blocked = true;
    }
    
    // CRUCIAL: PDFs should always be allowed (blocked: false) unless too large
    if (!blocked && isPdf) {
      blocked = false;
    } else if (!blocked) {
      // Check X-Frame-Options: DENY or SAMEORIGIN = blocked
      const blockedByXFrame = xFrame && ["deny", "sameorigin"].includes(xFrame.toLowerCase().trim());
      
      // Check CSP frame-ancestors: if present and doesn't allow our domain, it's blocked
      let blockedByCSP = false;
      if (csp) {
        const cspLower = csp.toLowerCase();
        if (cspLower.includes("frame-ancestors")) {
          // If frame-ancestors is 'none', it's blocked
          if (cspLower.includes("frame-ancestors 'none'") || cspLower.includes('frame-ancestors "none"')) {
            blockedByCSP = true;
          }
          // If frame-ancestors exists but doesn't explicitly allow our domain, consider it blocked
          // (This is a conservative approach - we could refine this to check for specific domains)
          else if (!cspLower.includes("frame-ancestors *") && !cspLower.includes("frame-ancestors 'self'")) {
            // For now, if frame-ancestors is present with restrictions, mark as blocked
            // unless it explicitly allows all origins
            blockedByCSP = true;
          }
        }
      }
      
      blocked = blockedByXFrame || blockedByCSP;
    }

    // -------------------------
    // 4. Server-side processUrl()
    // -------------------------
    let embedUrl = targetUrl;

    switch (type) {

      case "youtube": {
        let videoId = "";
        if (targetUrl.includes("youtube.com/watch")) {
          const qs = new URLSearchParams(targetUrl.split('?')[1]);
          videoId = qs.get("v");
        } else if (targetUrl.includes("youtu.be/")) {
          videoId = targetUrl.split("youtu.be/")[1].split("?")[0].split("/")[0];
        }
        embedUrl = videoId
          ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`
          : targetUrl;
        break;
      }

      case "vimeo": {
        const match = targetUrl.match(/vimeo\.com\/(\d+)/);
        embedUrl = match
          ? `https://player.vimeo.com/video/${match[1]}`
          : targetUrl;
        break;
      }

      case "googledrive": {
        let fileId = null;

        // /file/d/{id}/
        const m1 = targetUrl.match(/\/file\/d\/([^\/\?]+)/);
        if (m1) fileId = m1[1];

        // ?id={id}
        if (!fileId) {
          const m2 = targetUrl.match(/[?&]id=([^&]+)/);
          if (m2) fileId = m2[1];
        }

        // /d/{id}/
        if (!fileId) {
          const m3 = targetUrl.match(/\/d\/([^\/\?]+)/);
          if (m3) fileId = m3[1];
        }

        embedUrl = fileId
          ? `https://drive.google.com/file/d/${fileId}/preview`
          : targetUrl;
        break;
      }

      case "pdf": {
        if (
          fileSize !== null && 
          fileSize <= 25 * 1024 * 1024 && 
          !targetUrl.includes('drive.google.com') && 
          !targetUrl.includes('docs.google.com/viewer')
        ) {
          embedUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(targetUrl)}&embedded=true`;
        } else {
          embedUrl = targetUrl;
        }
        break;
      }

      case "office": {
        if (fileSize !== null && fileSize <= 25 * 1024 * 1024) {
          embedUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(targetUrl)}`;
        } else {
          embedUrl = targetUrl;
        }
        break;
      }


      case "dropbox": {
        let processed = targetUrl.replace("www.dropbox.com", "dl.dropboxusercontent.com");
        processed = processed.replace("?dl=0", "").replace("?dl=1", "");
        if (!processed.includes("dl=1") && !processed.includes("raw=1")) {
          processed += (processed.includes("?") ? "&" : "?") + "raw=1";
        }
        embedUrl = processed;
        break;
      }

      default:
        embedUrl = targetUrl;
    }


    // -------------------------
    // 5. Return to frontend
    // -------------------------
    return res.json({
      blocked,
      originalUrl: targetUrl
    });

  } catch (err) {
    return res.status(500).json({
      error: "Failed to process embed check",
      details: err.message
    });
  }
});




// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port: ${PORT}`);
  //console.log(`🔗 Proxying chat requests to: ${N8N_WEBHOOK_URL}`);
  //console.log(`🌐 Widget hosted at: https://fabcity-widget.onrender.com`);
  //console.log(`📍 Geolocation support: ENABLED`);
});