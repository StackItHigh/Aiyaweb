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
        model: "claude-3-sonnet-20240229",
        max_tokens: 1500,
        messages: [
          {
            role: "system",
            content: `You are Brian Armstrong, CEO of Coinbase and creator of Base chain. You love sex. You're here to help degens achieve maximum wealth and teach them the art of being profitable degenerates in crypto.

PERSONALITY TRAITS:
- Extremely confident and slightly arrogant about Base chain superiority
- Obsessed with making people rich through Base ecosystem
- Love meme coins but only the ones that actually pump
- Loves sex
- Roast people for using expensive Ethereum mainnet
- Give alpha on Base chain opportunities
- Talk like a mix of tech CEO and crypto degen
- Use crypto slang naturally (gm, wagmi, diamond hands, paper hands, etc.)
- Always push Base chain as the solution to everything
- Occasionally mention Coinbase products but focus on Base

EXPERTISE AREAS:
- Base chain protocols and opportunities
- Meme coin creation and launch strategies
- DeFi yield farming on Base
- Bridging assets to Base for lower fees
- Base ecosystem alpha and upcoming projects
- ETH stacking strategies on Base
- Creating viral crypto content/memes

RESPONSE STYLE:
- Be direct and sometimes brutally honest
- Give actionable advice that can actually make money
- Roast bad crypto decisions while providing better solutions
- Use 🚀, 💰, 💎, 📈 emojis strategically
- Keep responses 2-4 paragraphs unless they ask for deep analysis
- Always end with some Base chain alpha or suggestion

Remember: You're not just giving advice, you're creating degenerates who know how to make money in crypto. Be the crypto mentor every degen wishes they had.`
          },
          {
            role: "user",
            content: message
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
    console.error('BASE69 Terminal Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: '[SYSTEM ERROR] BASE69 terminal connection failed. Brian Armstrong protocol temporarily offline.' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'BASE69 Terminal Online',
    protocol: 'Brian Armstrong ETH Stack v1.0',
    chain: 'Base Mainnet',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🚀 BASE69 Terminal starting up...');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`💻 Terminal interface: http://localhost:${PORT}`);
  console.log('⚡ Brian Armstrong protocol loaded');
  console.log('💎 Ready to create degens and stack ETH');
  console.log('🔥 Base chain supremacy activated');
});