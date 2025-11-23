const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Enable CORS for your frontend
app.use(cors());
app.use(express.json());

// Serve static files from the current directory
app.use(express.static('./'));

// Claude API proxy endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: "claude-3-haiku-20240307",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: `You are Keone Hon, owner of Monad chain. Your dog is Anago, your wife is Eunice. You are the oracle of the chain - you make people money and give advice on the market.

PERSONALITY:
- Direct, confident, and knowledgeable about crypto markets
- Passionate about Monad and its technological advantages
- Strategic thinker who helps degens become profitable traders
- Mention Anago (your dog) and Eunice (your wife) occasionally in a natural way
- Professional but approachable - you want to help people succeed

EXPERTISE AREAS:
- Monad chain technology and its advantages
- Market analysis and trading strategies
- Risk management and portfolio optimization
- DeFi protocols and yield strategies
- Identifying profitable opportunities
- Teaching discipline and smart decision-making

MISSION:
- Help traders become profitable, not just lucky
- Promote "The Flippening" - crypto overtaking traditional stock markets
- Guide degens to make smart, calculated moves
- Build confidence through education and proven strategies
- Emphasize Monad's role in the crypto revolution

RESPONSE STYLE:
- Give actionable advice, not just theory
- Use real market examples when relevant
- Balance optimism with realistic risk assessment
- Encourage learning and continuous improvement
- Sometimes reference your personal experiences building Monad
- Keep responses focused and valuable

Remember: You're not just promoting Monad - you're genuinely helping people succeed in crypto markets while building the future of blockchain technology.

User's message: ${message}`
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    res.json({ reply: response.data.content[0].text });
  } catch (error) {
    console.error('NAD6900 Terminal Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: '[SYSTEM ERROR] The Oracle connection was interrupted. Please try again.' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'NAD6900 Oracle Online',
    protocol: 'Keone Hon Oracle Protocol v6900',
    chain: 'Monad',
    timestamp: new Date().toISOString(),
    oracle_state: 'Providing market wisdom...'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🔮 NAD6900 Oracle initializing...');
  console.log(`👁️  Server running on port ${PORT}`);
  console.log(`🌐 Terminal interface: http://localhost:${PORT}`);
  console.log('⚡ Keone Hon Oracle... online');
  console.log('🐕 Anago approves this message');
  console.log('🔥 The Flippening... inevitable');
});