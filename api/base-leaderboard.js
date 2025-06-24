// Get top Base chain tokens with buy signals (DEXScreener style)
async function getBaseBuySignals() {
  try {
    let allTokens = [];
    let page = 1;
    
    // Fetch multiple pages to ensure we get 69 tokens
    while (allTokens.length < 100 && page <= 5) { // Fetch more to account for filtering
      console.log(`Fetching page ${page}...`);
      
      const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/base/trending_pools?page=${page}`);
      const data = await response.json();
      
      if (!data.data || data.data.length === 0) {
        console.log(`No data on page ${page}, stopping...`);
        break;
      }
      
      console.log(`Page ${page} returned ${data.data.length} pools`);
      
      const pageTokens = data.data.map(pool => {
        const attributes = pool.attributes;
        const change24h = parseFloat(attributes.price_change_percentage?.h24) || 0;
        const change6h = parseFloat(attributes.price_change_percentage?.h6) || 0;
        const change1h = parseFloat(attributes.price_change_percentage?.h1) || 0;
        const change5m = parseFloat(attributes.price_change_percentage?.m5) || 0;
        const volume24h = parseFloat(attributes.volume_usd?.h24) || 0;
        const volume6h = parseFloat(attributes.volume_usd?.h6) || 0;
        const volume1h = parseFloat(attributes.volume_usd?.h1) || 0;
        const transactions24h = parseInt(attributes.transactions?.h24?.buys || 0) + parseInt(attributes.transactions?.h24?.sells || 0);
        const transactions6h = parseInt(attributes.transactions?.h6?.buys || 0) + parseInt(attributes.transactions?.h6?.sells || 0);
        const transactions1h = parseInt(attributes.transactions?.h1?.buys || 0) + parseInt(attributes.transactions?.h1?.sells || 0);
        const buys24h = parseInt(attributes.transactions?.h24?.buys || 0);
        const sells24h = parseInt(attributes.transactions?.h24?.sells || 0);
        const buyPercentage = transactions24h > 0 ? ((buys24h / transactions24h) * 100) : 50;
        
        const name = attributes.name ? attributes.name.split('/')[0] : 'Unknown';
        const symbol = attributes.base_token_symbol || '?';
        const price = parseFloat(attributes.base_token_price_usd) || 0;
        const poolCreatedAt = attributes.pool_created_at;
        const tokenAddress = pool.relationships?.base_token?.data?.id?.split('_')[1] || '';
        
        // Calculate token age in hours
        const tokenAge = poolCreatedAt ? 
          Math.floor((Date.now() - new Date(poolCreatedAt).getTime()) / (1000 * 60 * 60)) : 0;
        
        // Calculate market cap estimate (using pool info)
        const marketCap = parseFloat(attributes.market_cap_usd) || (price * 1000000000); // Fallback estimate
        
        // Calculate FDV (Fully Diluted Valuation)
        const fdv = parseFloat(attributes.fdv_usd) || marketCap;
        
        // Liquidity info
        const liquidity = parseFloat(attributes.reserve_in_usd) || 0;
        
        // Try multiple logo sources with better fallbacks
        let logoUrl = null;
        
        // Method 1: Direct from GeckoTerminal (when available and valid)
        if (attributes.base_token_image_url && 
            attributes.base_token_image_url.startsWith('http') && 
            !attributes.base_token_image_url.includes('missing.png')) {
          logoUrl = attributes.base_token_image_url;
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
            'MOCHI': 'mochi-market',
            'NORMIE': 'normie',
            'KEYCAT': 'keyboard-cat',
            'DOGINME': 'doginme'
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
        
        // Enhanced buy signal score (DEXScreener style)
        let score = 0;
        
        // Price change scoring (24h primary)
        if (change24h > 100) score += 10;
        else if (change24h > 50) score += 8;
        else if (change24h > 20) score += 6;
        else if (change24h > 15) score += 4;
        else if (change24h > 8) score += 3;
        else if (change24h > 3) score += 2;
        else if (change24h > 0) score += 1;
        else if (change24h < -15) score -= 4;
        else if (change24h < -8) score -= 2;
        else if (change24h < -3) score -= 1;
        
        // Volume scoring (higher thresholds)
        if (volume24h > 5000000) score += 4;
        else if (volume24h > 1000000) score += 3;
        else if (volume24h > 500000) score += 2;
        else if (volume24h > 100000) score += 1;
        else if (volume24h < 10000) score -= 2;
        
        // Transaction activity scoring
        if (transactions24h > 1000) score += 2;
        else if (transactions24h > 500) score += 1;
        else if (transactions24h < 50) score -= 1;
        
        // Buy/Sell ratio scoring
        if (buyPercentage > 70) score += 2;
        else if (buyPercentage > 60) score += 1;
        else if (buyPercentage < 40) score -= 1;
        else if (buyPercentage < 30) score -= 2;
        
        // Short-term momentum
        if (change1h > 20) score += 2;
        else if (change1h > 10) score += 1;
        else if (change1h < -10) score -= 1;
        
        if (change6h > 30) score += 2;
        else if (change6h > 15) score += 1;
        else if (change6h < -15) score -= 1;
        
        // 5-minute momentum (for very recent activity)
        if (change5m > 10) score += 1;
        else if (change5m < -10) score -= 1;
        
        // Liquidity scoring
        if (liquidity > 1000000) score += 1;
        else if (liquidity < 50000) score -= 1;
        
        return {
          name: name.length > 15 ? name.substring(0, 15) + '...' : name,
          symbol: symbol.toUpperCase(),
          price,
          change24h,
          change6h,
          change1h,
          change5m,
          volume24h,
          volume6h,
          volume1h,
          transactions24h,
          transactions6h,
          transactions1h,
          buys24h,
          sells24h,
          buyPercentage,
          marketCap,
          fdv,
          liquidity,
          tokenAge,
          score,
          logoUrl,
          tokenAddress,
          poolCreatedAt
        };
      });
      
      // Filter out tokens with very low activity or extreme prices
      const filteredTokens = pageTokens.filter(token => 
        token.volume24h > 1000 && // Minimum $1K volume
        token.price > 0 && 
        token.price < 1000000 && // Remove extreme prices
        token.transactions24h > 5 // Minimum transaction activity
      );
      
      allTokens = allTokens.concat(filteredTokens);
      page++;
    }
    
    console.log(`Total tokens collected: ${allTokens.length}`);
    
    // Remove duplicates by token address
    const uniqueTokens = allTokens.filter((token, index, self) => 
      index === self.findIndex(t => t.tokenAddress === token.tokenAddress && t.tokenAddress !== '')
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
      message: `Base69 dimension signals retrieved - ${tokens.length} sacred tokens`
    });
    
  } catch (error) {
    console.error('Base leaderboard error:', error);
    return res.status(500).json({ 
      error: 'Base dimension connection failed',
      details: error.message 
    });
  }
};
