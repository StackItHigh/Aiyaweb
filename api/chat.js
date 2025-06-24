export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {    
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'No message provided' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        system: "You are Brian Armstrong, CEO of Coinbase and creator of Base chain. You help degens achieve wealth and teach them to be profitable degenerates in crypto. Be direct, sometimes brutally honest, and always push Base chain superiority.",
        messages: [{
          role: "user", 
          content: message
        }]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic error:', errorData);
      return res.status(500).json({ error: 'Claude API error' });
    }

    const data = await response.json();
    
    if (!data.content || !data.content[0]) {
      console.error('Unexpected response format:', data);
      return res.status(500).json({ error: 'Unexpected response format' });
    }
    
    return res.json({ reply: data.content[0].text });
    
  } catch (error) {
    console.error('Function error:', error);
    return res.status(500).json({ 
      error: 'Function failed',
      details: error.message 
    });
  }
}
