// Get top Base chain tokens with buy signals
async function getBaseBuySignals() {
  try {
    const response = await fetch('https://api.geckoterminal.com/api/v2/networks/base/trending_pools?page=1');
    const data = await response.json();
    
    if (!data.data) return [];
    
    const topTokens = data.data.slice(0, 15).map(pool => {
      const change24h = parseFloat(pool.attributes.price_change_percentage.h24) || 0;
      const volume = parseFloat(pool.attributes.volume_usd.h24) || 0;
      const name = pool.attributes.name ? pool.attributes.name.split('/')[0] : 'Unknown';
      const symbol = pool.attributes.base_token_symbol || '?';
      const price = parseFloat(pool.attributes.base_token_price_usd) || 0;
      const tokenAddress = pool.relationships?.base_token?.data?.id?.split('_')[1] || '';
      
      // Multiple logo source strategies
      let logoUrl = null;
      
      // Method 1: Direct from GeckoTerminal (best quality when available)
      if (pool.attributes.base_token_image_url) {
        logoUrl = pool.attributes.base_token_image_url;
      }
      // Method 2: CoinGecko proxy (works for many tokens)
      else if (tokenAddress && tokenAddress.length === 42) {
        logoUrl = `https://assets.coingecko.com/coins/images/token_logo/${tokenAddress.toLowerCase()}.png`;
      }
      
      // Method 3: Alternative sources for popular Base tokens
      const popularLogos = {
        'BRETT': 'https://assets.coingecko.com/coins/images/30148/standard/brett.png',
        'DEGEN': 'https://assets.coingecko.com/coins/images/34515/standard/degen.png',
        'TOSHI': 'https://assets.coingecko.com/coins/images/33758/standard/toshi.png',
        'HIGHER': 'https://assets.coingecko.com/coins/images/35024/standard/higher.jpg',
        'BASED': 'https://assets.coingecko.com/coins/images/35736/standard/photo_2024-02-29_12-47-07.jpg',
        'MFER': 'https://assets.coingecko.com/coins/images/23699/standard/mfer.png',
        'NORMIE': 'https://assets.coingecko.com/coins/images/35850/standard/normie.jpg'
      };
      
      if (!logoUrl && popularLogos[symbol.toUpperCase()]) {
        logoUrl = popularLogos[symbol.toUpperCase()];
      }
      
      // Generate buy signal score
      let score = 0;
      
      // Price change scoring
      if (change24h > 20) score += 4;
      else if (change24h > 15) score += 3;
      else if (change24h > 8) score += 2;
      else if (change24h > 3) score += 1;
      else if (change24h < -15) score -= 3;
      else if (change24h < -8) score -= 2;
      else if (change24h < -3) score -= 1;
      
      // Volume scoring (boost for high volume)
      if (volume > 500000) score += 2;
      else if (volume > 100000) score += 1;
      else if (volume < 10000) score -= 1;
      
      return {
        name: name.length > 12 ? name.substring(0, 12) + '...' : name,
        symbol: symbol.toUpperCase(),
        price,
        change: change24h,
        volume,
        score,
        logoUrl,
        tokenAddress
      };
    });
    
    // Sort by score (best buy signals first)
    return topTokens
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
  } catch (error) {
    console.error('Base tokens error:', error);
    return [];
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const tokens = await getBaseBuySignals();
    
    return res.json({
      status: 'success',
      tokens: tokens,
      timestamp: new Date().toISOString(),
      message: 'Base dimension signals retrieved'
    });
    
  } catch (error) {
    console.error('Base leaderboard error:', error);
    return res.status(500).json({ 
      error: 'Base dimension connection failed',
      details: error.message 
    });
  }
};
