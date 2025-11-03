# Fab City AI Assistant n8n Workflow Documentation

## Overview
The Fab City v1 workflow is an n8n automation that powers the AI assistant chat functionality for the Fab City widget. It handles incoming chat messages, processes them through an AI model, and returns context-aware responses based on the user's location and domain.

## Workflow Components

### 1. Webhook Trigger
- **Purpose**: Entry point for the chat widget
- **Endpoint**: Receives POST requests from the widget's backend
- **Input Data**:
  - `message`: User's chat message
  - `sessionId`: Unique session identifier
  - `domain`: Website where widget is embedded
  - `location`: (Optional) User's geographical coordinates

### 2. AI Integration
- **Model**: OpenAI GPT or similar LLM
- **Configuration Required**:
  - API Key setup
  - System prompt configuration
  - Temperature and other model parameters

### 3. Context Management
- Tracks conversation history by `sessionId`
- Maintains domain-specific knowledge base
- Incorporates location data for regional recommendations

## Setup Instructions

### Prerequisites
1. n8n instance running (cloud or self-hosted)
2. OpenAI API key or equivalent AI service credentials
3. Access to the webhook URL

### Configuration Steps

1. **Import the Workflow**
   - Open n8n dashboard
   - Click "Import from File"
   - Select `Fab City v1.json`

2. **Configure Credentials**
   ```
   - Go to Credentials → Add New
   - Select OpenAI API
   - Enter your API key
   ```

3. **Set Environment Variables**
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `WEBHOOK_SECRET`: Secret for webhook security (if used)
   - Add any other required API keys or credentials

4. **Update Webhook Settings**
   - Copy the generated webhook URL
   - Update the backend API configuration with this URL
   - Test the webhook endpoint is accessible

5. **Configure AI Node**
   - Adjust model parameters as needed:
     - Temperature: 0.7 (recommended)
     - Max tokens: 500
     - System prompt: Update based on use case

### Domain-Specific Configuration

The workflow supports different responses based on the domain. Configure these in the "Switch" node:

1. learn.fabcity.com
   - Educational content focus
   - Course-related responses

2. network.fabcity.com
   - Community and networking focus
   - Event information

3. Default domain
   - General Fab City information
   - Basic assistance

## Location-Based Features

The workflow processes location data to provide:
- Local Fab City initiatives
- Nearby maker spaces
- Regional sustainability projects
- Local event recommendations

To configure location features:
1. Ensure location data processing is enabled
2. Update geographical database connections if used
3. Set radius for "nearby" recommendations

## Maintenance and Monitoring

### Regular Tasks
1. Review and update AI prompts
2. Monitor API usage and costs
3. Check error logs
4. Update knowledge base content

### Error Handling
- Failed requests are logged
- Session timeouts are managed
- API rate limits are respected

### Performance Optimization
- Cache frequently requested information
- Optimize prompt lengths
- Monitor response times

## Troubleshooting

Common issues and solutions:

1. **Webhook Not Receiving Data**
   - Check webhook URL in backend configuration
   - Verify network access and firewalls
   - Confirm correct data format in POST requests

2. **AI Responses Too Slow**
   - Check API rate limits
   - Optimize prompt length
   - Review caching strategy

3. **Location Features Not Working**
   - Verify location data format
   - Check geographical database connection
   - Confirm location processing is enabled

## Security Considerations

1. API Key Protection
   - Use environment variables
   - Regular key rotation
   - Access control monitoring

2. Data Privacy
   - Location data handling
   - Session data management
   - GDPR compliance measures

## Support and Resources

- Report issues: [GitHub Issues](https://github.com/mashaamacharia/Fab-City-widget/issues)
- Documentation: [Project Wiki](https://github.com/mashaamacharia/Fab-City-widget/wiki)
- Updates: Check repository for latest workflow versions

## Version History

- v1.0.0: Initial release
  - Basic chat functionality
  - Location support
  - Domain-specific responses

Remember to regularly check for updates and improvements to the workflow configuration.