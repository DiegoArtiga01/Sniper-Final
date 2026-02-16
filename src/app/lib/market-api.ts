const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const BINANCE_BASE_URL = 'https://api.binance.com/api/v3';

export interface MarketTicker {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap_rank: number;
}

export interface MarketKline {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function getMarketData(limit: number = 20): Promise<MarketTicker[]> {
  try {
    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`,
      { 
        cache: 'no-store',
        next: { revalidate: 0 }
      }
    );
    
    if (!response.ok) {
      if (response.status === 429) {
        console.warn("CoinGecko Rate Limit reached. Retrying shortly...");
      }
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error("Fetch MarketData Error:", error);
    return [];
  }
}

export async function getOHLC(symbol: string, interval: string = '1h', limit: number = 250): Promise<MarketKline[]> {
  try {
    const cleanSymbol = symbol.toUpperCase().replace('USDT', '');
    const binanceSymbol = `${cleanSymbol}USDT`;
    
    const response = await fetch(
      `${BINANCE_BASE_URL}/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    return data.map((d: any) => ({
      time: d[0],
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
      volume: parseFloat(d[5]),
    }));
  } catch (error) {
    console.error(`Fetch OHLC Error for ${symbol}:`, error);
    return [];
  }
}
