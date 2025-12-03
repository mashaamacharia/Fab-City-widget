import cors from 'cors';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

// Replace with your actual n8n webhook URL here
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://automations.manymangoes.com.au/webhook/6b51b51f-4928-48fd-b5fd-b39c34f523d1/chat';

app.use(cors({
  origin: [
  // 'http://localhost:5173',  
    'https://www.fabcity.info',
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