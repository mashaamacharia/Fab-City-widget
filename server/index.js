import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Replace with your actual n8n webhook URL
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://automations.manymangoes.com.au/webhook/6b51b51f-4928-48fd-b5fd-b39c34f523d1/chat';

app.use(cors());
app.use(express.json());

// ❌ REMOVED - Static files now served by Render Static Site
// app.use(express.static(path.join(__dirname, '../dist-embed')));

app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId, domain } = req.body;

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
    console.log(`📨 Sending to n8n - Domain: ${domain}, Session: ${sessionId}, Message: "${message.substring(0, 50)}..."`);

    // Forward the message, sessionId, and domain to n8n webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, sessionId, domain }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Received from n8n - Domain: ${domain}, Session: ${sessionId}`);

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
          domain: 'string (required) - Domain where widget is embedded'
        },
        example: {
          message: 'What is Fab City?',
          sessionId: 'session_1234567890_abc123',
          domain: 'example.com'
        }
      }
    }
  });
});

// Health check endpoint (useful for monitoring)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port: ${PORT}`);
  console.log(`📡 Proxying chat requests to: ${N8N_WEBHOOK_URL}`);
  console.log(`🌐 Widget hosted at: https://fabcity-widget.onrender.com`);
});