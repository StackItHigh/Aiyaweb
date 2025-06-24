export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    try {
      const { message } = req.body;
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: "claude-3-sonnet-20240229",
          max_tokens: 1500,
          messages: [
            {
              role: "system",
              content: "You are Brian Armstrong, CEO of Coinbase and creator of Base chain. Help degens achieve wealth and teach them to be profitable degenerates in crypto. Be direct, sometimes brutally honest, and always push Base chain superiority."
            },
            {
              role: "user", 
              content: message
            }
          ]
        })
      });
  
      const data = await response.json();
      res.json({ reply: data.content[0].text });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'BASE69 terminal connection failed' });
    }
  }