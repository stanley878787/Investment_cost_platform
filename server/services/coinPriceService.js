// services/coinPriceService.js
const axios = require('axios');

const coinIdMap = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'DOGE': 'dogecoin',
    'BNB': 'binancecoin',
    
  };

/**
 * 從 CoinGecko 抓取指定幣種的美金價格
 * @param {string} coinSymbol - 例如 "bitcoin", "ethereum"
 * @returns {Promise<number>} - 回傳該幣種的 USD 價格
 */
  

async function fetchCoinPrice(coinSymbol) {
    // 1. 先對應到 CoinGecko 的 id
    const geckoId = coinIdMap[coinSymbol.toUpperCase()] || coinSymbol.toLowerCase();
    // 假設使用者輸入 "DOGE"，則 geckoId = "dogecoin"
  
    // 2. 呼叫 CoinGecko API
    const url = 'https://api.coingecko.com/api/v3/simple/price';
    const params = {
      ids: geckoId,
      vs_currencies: 'usd'
    };
    const response = await axios.get(url, { params });
  
    // 3. 分析回傳
    const data = response.data[geckoId];
    if (!data || data.usd == null) {
      throw new Error(`Coin ${coinSymbol} (mapped to ${geckoId}) not found in CoinGecko`);
    }
    return data.usd;
}

module.exports = {
  fetchCoinPrice
};
