# Session ID Fix - Guide

## Problem
The application was sending messages to the n8n webhook without a session ID, which prevented the AI model from maintaining conversation context across multiple messages.

## What Was Fixed

### 1. Frontend Changes (`src/components/ChatWidget.jsx`)
- ✅ Added `sessionId` state to track the conversation session
- ✅ Added `domain` state to capture the website hostname
- ✅ Generate a unique session ID when the component mounts
- ✅ Automatically detect and capture the domain (hostname)
- ✅ Send `message`, `sessionId`, and `domain` to the backend API
- ✅ Support for configurable API URL (for embedding on client sites)

### 2. Backend Changes (`server/index.js`)
- ✅ Extract `sessionId` and `domain` from the request body
- ✅ Validate that both `sessionId` and `domain` are present
- ✅ Forward `message`, `sessionId`, and `domain` to the n8n webhook
- ✅ Added logging to track session flow and domain for debugging

### 3. Embeddable Widget
- ✅ Created `src/embed.jsx` for standalone widget deployment
- ✅ Added build configuration (`vite.embed.config.js`)
- ✅ Widget can be embedded on any website with 3 lines of code
- ✅ Automatic domain detection for multi-site routing

## How It Works

1. **Session & Domain Generation**: When a user opens the chat:
   - A unique session ID is generated: `session_[timestamp]_[random_string]`
   - The domain is captured: `window.location.hostname`
   
   Example:
   ```
   sessionId: session_1728483920123_k2j9d8f7a
   domain: learn.fabcity.com
   ```

2. **Data Flow**:
   ```
   User Message → Frontend (adds sessionId + domain) → Backend API → n8n Webhook
   ```

3. **Webhook Payload**: Your n8n webhook now receives:
   ```json
   {
     "message": "User's question here",
     "sessionId": "session_1728483920123_k2j9d8f7a",
     "domain": "learn.fabcity.com"
   }
   ```

4. **Domain-Based Routing**: In n8n, use an IF node to route based on domain:
   ```
   IF {{ $json.domain }} contains "learn.fabcity" 
     → Route to Learn AI Agent
   ELSE IF {{ $json.domain }} contains "network.fabcity"
     → Route to Network AI Agent
   ```

## n8n Workflow Configuration

### Step 1: Update Webhook Node
Make sure your webhook node is set to receive the data. The incoming data will have three fields:
- `message` - The user's message
- `sessionId` - The unique session identifier
- `domain` - The hostname where the widget is embedded

### Step 2: Configure AI Chat Memory Node
If you're using a Chat Memory node or similar:

1. **Memory Key/Session ID Field**: Set it to use `{{ $json.sessionId }}`
2. **Message Field**: Set it to use `{{ $json.message }}`

Example configuration:
```
Memory Configuration:
- Session ID: {{ $json.sessionId }}
- User Message: {{ $json.message }}
```

### Step 3: AI Model Node
Configure your AI model node (OpenAI, Claude, etc.) to:
1. Use the `sessionId` to retrieve conversation history
2. Include the new message from `{{ $json.message }}`
3. Store the response back with the same `sessionId`

### Step 4: Response Node
The frontend now supports multiple n8n response formats:

**Option 1: Array format** (most common with n8n "Respond to Webhook" node)
```json
[
  {
    "output": "AI's answer here"
  }
]
```

**Option 2: Object format**
```json
{
  "response": "AI's answer here",
  "sessionId": "session_1728483920123_k2j9d8f7a"
}
```

**Option 3: Alternative object format**
```json
{
  "message": "AI's answer here"
}
```

**Option 4: Simple output format**
```json
{
  "output": "AI's answer here"
}
```

The frontend will automatically detect and use the correct field! ✨

## Common n8n Workflow Patterns

### Pattern 1: Using OpenAI with Memory
```
Webhook → 
  Extract sessionId & message → 
  OpenAI Chat (with sessionId as conversation ID) → 
  Respond to Webhook
```

### Pattern 2: Using Custom Memory Store
```
Webhook → 
  Get chat history (using sessionId) → 
  AI Model (with history + new message) → 
  Store new exchange (with sessionId) → 
  Respond to Webhook
```

### Pattern 3: Using n8n AI Agent
```
Webhook → 
  AI Agent (configure session ID as {{ $json.sessionId }}) → 
  Respond to Webhook
```

## Testing

### 1. Check Server Logs
When you send a message, you should see:
```
📨 Sending to n8n - Session: session_1728483920123_k2j9d8f7a, Message: "What is Fab City and how does it work?..."
✅ Received from n8n - Session: session_1728483920123_k2j9d8f7a
```

### 2. Verify in n8n
In your n8n workflow execution logs, verify that both fields are received:
- `message`: Contains the user's question
- `sessionId`: Contains the session identifier (starts with "session_")

### 3. Test Conversation Memory
1. Ask a question: "What is Fab City?"
2. Follow up with: "Tell me more about it"
   - The AI should understand "it" refers to Fab City from the previous message
   - This only works if the sessionId is properly configured!

## Troubleshooting

### Issue: "Sorry, I couldn't process that" error
**Symptoms**: The chat displays "Sorry, I couldn't process that" even though n8n is responding.

**Solution**: Check your browser console (F12) to see what format n8n is returning. The frontend now handles multiple formats automatically:
- Array format: `[{ "output": "..." }]` ✅
- Object format: `{ "response": "..." }` ✅
- Alternative: `{ "message": "..." }` ✅
- Simple: `{ "output": "..." }` ✅

If you see the response in console logs but still get the error, the field name might be different. Check the n8n response structure.

### Issue: AI doesn't remember previous messages
**Solution**: Check that your n8n AI node is using `{{ $json.sessionId }}` to maintain conversation context.

### Issue: Error "Session ID is required"
**Solution**: The frontend might not have generated a sessionId. Refresh the page to regenerate it.

### Issue: Session ID not showing in n8n logs
**Solution**: Check the webhook URL is correct and that the backend is forwarding the data properly.

### Debugging Tips
1. Check browser console for sessionId value
2. Check server logs for the outgoing request
3. Check n8n execution logs for incoming data
4. Verify AI model is configured to use sessionId for memory

## Session ID Format
- **Format**: `session_[timestamp]_[random_string]`
- **Lifetime**: Persists for the entire browser session
- **Uniqueness**: New session ID generated on page refresh
- **Length**: Approximately 30-35 characters

## Additional Notes

- Each browser tab/window will have its own session ID
- Refreshing the page creates a new session (conversation starts fresh)
- Session IDs are generated client-side for immediate availability
- No server-side session storage is needed (stateless design)

## Need to Customize?

### Change Session Duration
To persist sessions across page refreshes, store sessionId in localStorage:

```javascript
// In ChatWidget.jsx, replace the session generation with:
useEffect(() => {
  let storedSessionId = localStorage.getItem('chatSessionId');
  
  if (!storedSessionId) {
    storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chatSessionId', storedSessionId);
  }
  
  setSessionId(storedSessionId);
}, []);
```

### Add User Identification
To include user info, update the payload:

```javascript
// Frontend
body: JSON.stringify({ 
  message: userMessage.text,
  sessionId: sessionId,
  userId: currentUser.id  // Add this
})

// Backend
const { message, sessionId, userId } = req.body;
body: JSON.stringify({ message, sessionId, userId })
```

---

**Status**: ✅ Session ID implementation complete and ready to use!

