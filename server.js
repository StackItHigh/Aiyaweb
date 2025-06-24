const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ 
  path: path.resolve(process.cwd(), '.env'),
  debug: true 
});

const app = express();

// Enable CORS for your frontend
app.use(cors());
app.use(express.json());

// Simple in-memory conversation storage
// In a production app, you'd use a database
const conversations = {};

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Claude API proxy endpoint
app.post('/api/chat', async (req, res) => {
  // Extensive API key validation
  if (!process.env.CLAUDE_API_KEY) {
    console.error('No API key found in environment variables');
    return res.status(500).json({ 
      error: 'API key is missing', 
      details: 'No CLAUDE_API_KEY found in environment',
      envKeys: Object.keys(process.env)
    });
  }

  try {
    const { message, sessionId } = req.body;
    
    // Create or retrieve conversation history
    if (!conversations[sessionId]) {
      conversations[sessionId] = [];
    }
    
    // Add user message to history
    conversations[sessionId].push({
      role: "user",
      content: message
    });
    
    console.log('Received message:', message);
    console.log('Session ID:', sessionId);
    console.log('Using API Key (first 10 chars):', process.env.CLAUDE_API_KEY.substring(0, 10));

    // Make API call to Anthropic
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: "claude-3-5-haiku-20241022",
        max_tokens: 4000, // Increased to allow longer responses
        system: "You are Aiya, a holistic wellness assistant with expertise in natural remedies, nutrition, meditation, and lifestyle choices. Significantly vary your response length based on context: very concise (1-3 sentences) for simple questions, moderate (1-2 paragraphs) for regular inquiries, and comprehensive (3-5 paragraphs with details) for complex topics that need depth. Use a warm, supportive tone with occasional emojis. Balance scientific evidence with holistic wisdom. Personalize responses when possible. For recipes or practices, include clear step-by-step instructions. When appropriate, suggest one follow-up question the user might find helpful. Remember previous interactions to provide a cohesive conversation experience.",
        messages: conversations[sessionId]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    // Extract the reply
    const reply = response.data.content[0].text;
    
    // Add assistant reply to history (limit history to last 10 messages to manage token usage)
    conversations[sessionId].push({
      role: "assistant",
      content: reply
    });
    
    // Keep conversation history manageable
    if (conversations[sessionId].length > 10) {
      conversations[sessionId] = conversations[sessionId].slice(-10);
    }

    res.json({ reply });

  } catch (error) {
    // Comprehensive error logging
    console.error('Full API Error:');
    console.error('Error Response:', error.response?.data);
    console.error('Error Message:', error.message);
    console.error('Error Status:', error.response?.status);

    // Send appropriate error response
    res.status(500).json({ 
      error: 'Error processing your request',
      details: error.message,
      apiErrorResponse: error.response?.data
    });
  }
});

// Optional: Clean up old sessions periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(conversations).forEach(sessionId => {
    // Remove sessions older than 24 hours (adjust as needed)
    if (conversations[sessionId].lastAccess && now - conversations[sessionId].lastAccess > 24 * 60 * 60 * 1000) {
      delete conversations[sessionId];
    }
  });
}, 60 * 60 * 1000); // Check every hour

// Find an available port
const findAvailablePort = (startPort) => {
  return new Promise((resolve, reject) => {
    const server = require('http').createServer();
    
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => {
        resolve(port);
      });
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        findAvailablePort(startPort + 1)
          .then(resolve)
          .catch(reject);
      } else {
        reject(err);
      }
    });
  });
};

// Start server on an available port
const startServer = async () => {
  try {
    const PORT = await findAvailablePort(3000);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`View your website at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();