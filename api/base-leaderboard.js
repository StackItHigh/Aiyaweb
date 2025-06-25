// Enhanced Base69 Oracle - Multi-source divine signal detection
async function getBaseBuySignals() {
  try {
    let allTokens = [];
    
    // PHASE 1: Get new pairs from DEXScreener-style trending (GeckoTerminal new pools)
    console.log('Oracle Phase 1: Scanning fresh dimensional entities...');
    const newPairs = await scanFreshPairs();
    
    // PHASE 2: Get trending pools from GeckoTerminal
    console.log('Oracle Phase 2: Analyzing established signals...');
    const trendingPools = await scanTrendingPools();
    
    // PHASE 3: Combine and deduplicate
    allTokens = [...newPairs, ...trendingPools];
    console.log(`Oracle collected ${allTokens.length} entities from dimensions`);
    
    // Remove duplicates by token address
    const uniqueTokens = allTokens.filter((token, index, self) => 
      index === self.findIndex(t => t.tokenAddress === token.tokenAddress && t.tokenAddress !== '')
    );
    
    console.log(`Oracle filtered to ${uniqueTokens.length} unique entities`);
    
    // Apply Oracle scoring and select the sacred 69
    const scoredTokens = uniqueTokens.map(token => ({
      ...token,
      score: calculateOracleScore(token)
    }));
    
    // Sort by Oracle score and return exactly 69
    const finalTokens = scoredTokens
      .sort((a, b) => b.score - a.score)
      .slice(0, 69);
    
    console.log(`The Oracle reveals ${finalTokens.length} sacred tokens`);
    
    return finalTokens;
    
  } catch (error) {
    console.error('Oracle connection disrupted:', error);
    return [];
  }
}

// Scan for fresh pairs (new launches)
async function scanFreshPairs() {
  try {
    let freshTokens = [];
    let page = 1;
    
    // Get recently created pools (new pairs)
    while (freshTokens.length < 1500 && page <= 10) {
      console.log(`Scanning fresh dimension page ${page}...`);
      
      const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/base/new_pools?page=${page}`);
      const data = await response.json();
      
      if (!data.data || data.data.length === 0) break;
      
      const pageTokens = data.data
        .map(pool => processPoolData(pool))
        .filter(token => filterFreshPairs(token));
      
      freshTokens = freshTokens.concat(pageTokens);
      page++;
    }
    
    console.log(`Fresh pairs collected: ${freshTokens.length} (Base69 gates: $30K+ volume + 10%+ liquidity ratio)`);
    return freshTokens;
    
  } catch (error) {
    console.error('Fresh pair scanning error:', error);
    return [];
  }
}

// Scan trending pools
async function scanTrendingPools() {
  try {
    let trendingTokens = [];
    let page = 1;
    
    // Get trending pools for established signals
    while (trendingTokens.length < 1500 && page <= 10) {
      console.log(`Scanning trending dimension page ${page}...`);
      
      const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/base/trending_pools?page=${page}`);
      const data = await response.json();
      
      if (!data.data || data.data.length === 0) break;
      
      const pageTokens = data.data
        .map(pool => processPoolData(pool))
        .filter(token => filterTrendingPairs(token));
      
      trendingTokens = trendingTokens.concat(pageTokens);
      page++;
    }
    
    console.log(`Trending pairs collected: ${trendingTokens.length} (Base69 gates: $30K+ volume + 10%+ liquidity ratio)`);
    return trendingTokens;
    
  } catch (error) {
    console.error('Trending pair scanning error:', error);
    return [];
  }
}

// Process pool data into standardized token format
function processPoolData(pool) {
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
    Math.floor((Date.now() - new Date(poolCreatedAt).getTime()) / (1000 * 60 * 60)) : 999;
  
  // Calculate market cap estimate
  const marketCap = parseFloat(attributes.market_cap_usd) || (price * 1000000000);
  const fdv = parseFloat(attributes.fdv_usd) || marketCap;
  const liquidity = parseFloat(attributes.reserve_in_usd) || 0;
  
  // Enhanced logo detection
  let logoUrl = getTokenLogo(attributes, symbol, tokenAddress);
  
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
    logoUrl,
    tokenAddress,
    poolCreatedAt
  };
}

// Enhanced logo detection
function getTokenLogo(attributes, symbol, tokenAddress) {
  let logoUrl = null;
  
  // Method 1: GeckoTerminal direct
  if (attributes.base_token_image_url && 
      attributes.base_token_image_url.startsWith('http') && 
      !attributes.base_token_image_url.includes('missing.png')) {
    logoUrl = attributes.base_token_image_url;
  }
  
  // Method 2: DEXScreener CDN
  if (!logoUrl && tokenAddress && tokenAddress.length === 42) {
    logoUrl = `https://dd.dexscreener.com/ds-data/tokens/base/${tokenAddress.toLowerCase()}.png`;
  }
  
  // Method 3: Popular Base tokens
  const popularLogos = {
    'BRETT': 'https://assets.coingecko.com/coins/images/30148/standard/brett.png',
    'DEGEN': 'https://assets.coingecko.com/coins/images/34515/standard/degen.png',
    'TOSHI': 'https://assets.coingecko.com/coins/images/31064/standard/toshi.jpg',
    'HIGHER': 'https://assets.coingecko.com/coins/images/35738/standard/higher.png'
  };
  
  if (!logoUrl && popularLogos[symbol.toUpperCase()]) {
    logoUrl = popularLogos[symbol.toUpperCase()];
  }
  
  return logoUrl;
}

// Filter fresh pairs (new launches) - Base69 Gates: $30K volume + 10% liquidity ratio
function filterFreshPairs(token) {
  const liquidityRatio = token.marketCap > 0 ? (token.liquidity / token.marketCap) * 100 : 0;
  
  return (
    token.price > 0 && 
    token.price < 1000000 && 
    token.volume1h >= 30000 && // BASE69 VOLUME GATE: $30K minimum in 1 hour
    liquidityRatio >= 10 && // BASE69 LIQUIDITY GATE: 10% minimum liquidity ratio
    token.tokenAge < 72 && // Less than 3 days old
    (
      // Very new with strong activity
      (token.tokenAge < 6 && token.transactions1h > 5) ||
      // Explosive new pairs
      (token.tokenAge < 24 && token.change1h > 15) ||
      // High volume new pairs
      (token.tokenAge < 24 && token.volume1h > 50000) ||
      // Strong 5m signals with volume
      (token.change5m > 20)
    )
  );
}

// Filter trending pairs - Base69 Gates: $30K volume + 10% liquidity ratio
function filterTrendingPairs(token) {
  const liquidityRatio = token.marketCap > 0 ? (token.liquidity / token.marketCap) * 100 : 0;
  
  return (
    token.price > 0 && 
    token.price < 1000000 && 
    token.volume1h >= 30000 && // BASE69 VOLUME GATE: $30K minimum in 1 hour
    liquidityRatio >= 10 && // BASE69 LIQUIDITY GATE: 10% minimum liquidity ratio
    (
      // High activity established tokens
      (token.volume1h > 50000 && token.transactions1h > 10) ||
      // Strong momentum tokens with volume
      (token.change1h > 20) ||
      // Explosive 5m moves with volume
      (token.change5m > 15) ||
      // Very high volume regardless of performance
      (token.volume1h > 100000)
    )
  );
}

// Enhanced Oracle scoring algorithm
function calculateOracleScore(token) {
  let score = 0;
  
  // AGE BONUS: Prioritize fresh launches
  if (token.tokenAge < 1) score += 12;      // Ultra fresh
  else if (token.tokenAge < 3) score += 10; // Very fresh  
  else if (token.tokenAge < 6) score += 8;  // Fresh
  else if (token.tokenAge < 12) score += 6; // Recent
  else if (token.tokenAge < 24) score += 4; // New
  else if (token.tokenAge < 72) score += 2; // Young
  
  // PRIMARY: 1-hour price action (most important)
  if (token.change1h > 100) score += 20;     // Moonshot territory
  else if (token.change1h > 50) score += 18; // Explosive
  else if (token.change1h > 30) score += 15; // Very strong
  else if (token.change1h > 20) score += 12; // Strong
  else if (token.change1h > 15) score += 10; // Good
  else if (token.change1h > 10) score += 8;  // Moderate
  else if (token.change1h > 5) score += 6;   // Small gain
  else if (token.change1h > 0) score += 3;   // Minimal gain
  else if (token.change1h < -20) score -= 8; // Heavy decline
  else if (token.change1h < -10) score -= 5; // Moderate decline
  else if (token.change1h < -5) score -= 2;  // Small decline
  
  // SECONDARY: 1-hour volume (liquidity indicator)
  if (token.volume1h > 1000000) score += 10; // Massive volume
  else if (token.volume1h > 500000) score += 8; // Very high volume
  else if (token.volume1h > 200000) score += 6; // High volume
  else if (token.volume1h > 100000) score += 5; // Good volume
  else if (token.volume1h > 50000) score += 4;  // Decent volume
  else if (token.volume1h > 25000) score += 3;  // Moderate volume
  else if (token.volume1h > 10000) score += 2;  // Low volume
  else if (token.volume1h > 1000) score += 1;   // Minimal volume
  else if (token.volume1h < 100) score -= 3;    // Very low volume
  
  // 5-MINUTE MOMENTUM: Real-time explosive detection
  if (token.change5m > 50) score += 8;       // Explosive 5m
  else if (token.change5m > 25) score += 6;  // Very strong 5m
  else if (token.change5m > 15) score += 4;  // Strong 5m
  else if (token.change5m > 10) score += 3;  // Good 5m
  else if (token.change5m > 5) score += 2;   // Small 5m gain
  else if (token.change5m < -25) score -= 4; // Heavy 5m dump
  else if (token.change5m < -15) score -= 3; // Moderate 5m dump
  else if (token.change5m < -10) score -= 2; // Small 5m dump
  
  // 1-HOUR TRANSACTION ACTIVITY
  if (token.transactions1h > 500) score += 6;  // Very active
  else if (token.transactions1h > 200) score += 5; // Active
  else if (token.transactions1h > 100) score += 4; // Moderate activity
  else if (token.transactions1h > 50) score += 3;  // Some activity
  else if (token.transactions1h > 20) score += 2;  // Low activity
  else if (token.transactions1h > 5) score += 1;   // Minimal activity
  else if (token.transactions1h < 2) score -= 3;   // Very low activity
  
  // BUY/SELL PRESSURE
  if (token.buyPercentage > 80) score += 4;     // Massive buy pressure
  else if (token.buyPercentage > 70) score += 3; // Strong buy pressure
  else if (token.buyPercentage > 60) score += 2; // Good buy pressure
  else if (token.buyPercentage > 55) score += 1; // Slight buy pressure
  else if (token.buyPercentage < 30) score -= 3; // Heavy sell pressure
  else if (token.buyPercentage < 40) score -= 2; // Moderate sell pressure
  else if (token.buyPercentage < 45) score -= 1; // Slight sell pressure
  
  // 24-HOUR CONTEXT (reduced weight)
  if (token.change24h > 200) score += 6;      // Massive daily gain
  else if (token.change24h > 100) score += 4; // Large daily gain
  else if (token.change24h > 50) score += 3;  // Good daily gain
  else if (token.change24h > 20) score += 2;  // Moderate daily gain
  else if (token.change24h > 10) score += 1;  // Small daily gain
  else if (token.change24h < -50) score -= 4; // Heavy daily decline
  else if (token.change24h < -30) score -= 3; // Moderate daily decline
  else if (token.change24h < -15) score -= 2; // Small daily decline
  
  // LIQUIDITY SCORING
  if (token.liquidity > 5000000) score += 3;    // Excellent liquidity
  else if (token.liquidity > 1000000) score += 2; // Good liquidity
  else if (token.liquidity > 500000) score += 1;  // Decent liquidity
  else if (token.liquidity > 100000) score += 0;  // Minimal liquidity
  else if (token.liquidity < 10000) score -= 2;   // Poor liquidity
  
  // MARKET CAP BONUS (smaller = more potential)
  if (token.marketCap < 100000) score += 3;      // Micro cap
  else if (token.marketCap < 500000) score += 2;  // Very small cap
  else if (token.marketCap < 1000000) score += 1; // Small cap
  else if (token.marketCap > 100000000) score -= 2; // Large cap penalty
  
  return score;
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
    
    console.log(`B69 Oracle returning ${tokens.length} tokens to terminal`);
    
    return res.json({
      status: 'success',
      tokens: tokens,
      count: tokens.length,
      timestamp: new Date().toISOString(),
      message: `Base69 Oracle active - ${tokens.length} entities selected (gates: $30K+ volume, 10%+ liquidity ratio)`
    });
    
  } catch (error) {
    console.error('Base69 Oracle error:', error);
    return res.status(500).json({ 
      error: 'Oracle dimensional scan disrupted',
      details: error.message 
    });
  }
};
