// Get top Base chain tokens with buy signals
async function getBaseBuySignals() {
  try {
    let allTokens = [];
    let page = 1;
    
    // Fetch multiple pages to ensure we get 69 tokens
    while (allTokens.length < 69 && page <= 3) {
      console.log(`Fetching page ${page}...`);
      
      const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/base/trending_pools?page=${page}`);
      const data = await response.json();
      
      if (!data.data || data.data.length === 0) {
        console.log(`No data on page ${page}, stopping...`);
        break;
      }
      
      console.log(`Page ${page} returned ${data.data.length} pools`);
      
      const pageTokens = data.data.map(pool => {
        const change24h = parseFloat(pool.attributes.price_change_percentage.h24) || 0;
        const change6h = parseFloat(pool.attributes.price_change_percentage.h6) || 0;
        const change1h = parseFloat(pool.attributes.price_change_percentage.h1) || 0;
        const volume = parseFloat(pool.attributes.volume_usd.h24) || 0;
        const name = pool.attributes.name ? pool.attributes.name.split('/')[0] : 'Unknown';
        const symbol = pool.attributes.base_token_symbol || '?';
        const price = parseFloat(pool.attributes.base_token_price_usd) || 0;
        const tokenAddress = pool.relationships?.base_token?.data?.id?.split('_')[1] || '';
        
        // Try multiple logo sources with better fallbacks
        let logoUrl = null;
        
        // Method 1: Direct from GeckoTerminal (when available and valid)
        if (pool.attributes.base_token_image_url && 
            pool.attributes.base_token_image_url.startsWith('http') && 
            !pool.attributes.base_token_image_url.includes('missing.png')) {
          logoUrl = pool.attributes.base_token_image_url;
        }
        
        // Method 2: Try DEXScreener's CDN with the token address
        if (!logoUrl && tokenAddress && tokenAddress.length === 42) {
          logoUrl = `https://dd.dexscreener.com/ds-data/tokens/base/${tokenAddress.toLowerCase()}.png`;
        }
        
        // Method 3: CoinGecko API for popular tokens (by symbol)
        if (!logoUrl) {
          const coinGeckoIds = {
            'BRETT': 'brett',
            'DEGEN': 'degen-base', 
            'TOSHI': 'toshi',
            'HIGHER': 'higher',
            'MFER': 'mfercoin',
            'BASED': 'based-money',
            'BALD': 'bald',
            'DINO': 'dinotoken',
            'MOCHI': 'mochi-market'
          };
          
          if (coinGeckoIds[symbol.toUpperCase()]) {
            logoUrl = `https://assets.coingecko.com/coins/images/large/${coinGeckoIds[symbol.toUpperCase()]}.png`;
          }
        }
        
        // Enhanced logo fallbacks for popular Base tokens
        if (symbol.toUpperCase() === 'BRETT') {
          logoUrl = 'https://assets.coingecko.com/coins/images/30148/standard/brett.png';
        } else if (symbol.toUpperCase() === 'DEGEN') {
          logoUrl = 'https://assets.coingecko.com/coins/images/34515/standard/degen.png';
        } else if (symbol.toUpperCase() === 'TOSHI') {
          logoUrl = 'https://assets.coingecko.com/coins/images/31064/standard/toshi.jpg';
        } else if (symbol.toUpperCase() === 'HIGHER') {
          logoUrl = 'https://assets.coingecko.com/coins/images/35738/standard/higher.png';
        }
        
        // Generate buy signal score
        let score = 0;
        
        // Price change scoring (enhanced)
        if (change24h > 50) score += 6;
        else if (change24h > 20) score += 4;
        else if (change24h > 15) score += 3;
        else if (change24h > 8) score += 2;
        else if (change24h > 3) score += 1;
        else if (change24h < -15) score -= 3;
        else if (change24h < -8) score -= 2;
        else if (change24h < -3) score -= 1;
        
        // Volume scoring (boost for high volume)
        if (volume > 1000000) score += 3;
        else if (volume > 500000) score += 2;
        else if (volume > 100000) score += 1;
        else if (volume < 10000) score -= 1;
        
        // 1h and 6h momentum scoring
        if (change1h > 10) score += 1;
        if (change6h > 15) score += 1;
        if (change1h < -10) score -= 1;
        if (change6h < -15) score -= 1;
        
        return {
          name: name.length > 12 ? name.substring(0, 12) + '...' : name,
          symbol: symbol.toUpperCase(),
          price,
          change24h,
          change6h,
          change1h,
          volume,
          score,
          logoUrl,
          tokenAddress
        };
      });
      
      allTokens = allTokens.concat(pageTokens);
      page++;
    }
    
    console.log(`Total tokens collected: ${allTokens.length}`);
    
    // Remove duplicates by token address
    const uniqueTokens = allTokens.filter((token, index, self) => 
      index === self.findIndex(t => t.tokenAddress === token.tokenAddress)
    );
    
    console.log(`Unique tokens after deduplication: ${uniqueTokens.length}`);
    
    // Sort by score (best buy signals first) and return exactly 69
    const finalTokens = uniqueTokens
      .sort((a, b) => b.score - a.score)
      .slice(0, 69);
    
    console.log(`Final tokens being returned: ${finalTokens.length}`);
    
    return finalTokens;
    
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
    
    console.log(`API returning ${tokens.length} tokens to frontend`);
    
    return res.json({
      status: 'success',
      tokens: tokens,
      count: tokens.length,
      timestamp: new Date().toISOString(),
      message: `Base69 dimension signals retrieved - ${tokens.length} tokens`
    });
    
  } catch (error) {
    console.error('Base leaderboard error:', error);
    return res.status(500).json({ 
      error: 'Base dimension connection failed',
      details: error.message 
    });
  }
};
