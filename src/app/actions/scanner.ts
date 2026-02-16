'use server';

import { getMarketData, getOHLC, MarketTicker } from '@/app/lib/market-api';
import { calculateEMA, calculateRSI, calculateADX, calculateSMA } from '@/app/lib/indicators';

export interface TradeSignal {
  symbol: string;
  name: string;
  image: string;
  entryPrice: number;
  priceChangePercent: number;
  volume: string;
  rsi: number;
  sma: number;
  ema200: number;
  adx: number;
  analysis: string;
  status: 'passed' | 'failed';
  reason?: string;
  readinessScore: number;
  stopLoss: number;
  takeProfit: number;
}

const EXCLUDED_SYMBOLS = [
  'usdt', 'usdc', 'dai', 'busd', 'tusd', 'fdusd', 'pyusd', 'usdd', 'frax', 
  'steth', 'weth', 'wbtc', 'paxg', 'xaut', 'ustc', 'eusd', 'ldo', 'ton', 'eur', 'gbp'
];

export async function scanMarket(): Promise<TradeSignal[]> {
  try {
    const marketData = await getMarketData(50); 
    
    if (!marketData || marketData.length === 0) {
      return [];
    }

    const filteredCoins = marketData.filter(coin => 
      !EXCLUDED_SYMBOLS.includes(coin.symbol.toLowerCase()) && 
      !coin.name.toLowerCase().includes('usd') &&
      !coin.name.toLowerCase().includes('tether') &&
      !coin.name.toLowerCase().includes('wrapped')
    );

    const signalPromises = filteredCoins.map(async (coin) => {
      try {
        const ohlc = await getOHLC(coin.symbol, '1h', 210);
        const currentPrice = coin.current_price;
        
        if (!ohlc || ohlc.length < 10) {
          return createDefaultSignal(coin, 'Sincronizando...');
        }

        const closePrices = ohlc.map(k => k.close);
        const volumes = ohlc.map(k => k.volume);
        
        const ema200 = calculateEMA(closePrices, 200);
        const ema50 = calculateEMA(closePrices, 50);
        const rsi = calculateRSI(closePrices, 14);
        const adxValue = calculateADX(ohlc, 14);
        
        const avgVolume20 = calculateSMA(volumes, 20);
        const currentVolume = volumes[volumes.length - 1];
        
        // PARÁMETRO AGRESIVO: Volumen 1.2x
        const hasVolumeSpike = currentVolume >= avgVolume20 * 1.2;

        let score = 0;
        const isAboveEMA200 = currentPrice > ema200;
        const isAboveEMA50 = currentPrice > ema50;
        
        // PARÁMETRO AGRESIVO: ADX > 15
        const isStrongTrend = adxValue > 15;

        // PUNTUACIÓN DINÁMICA AGRESIVA
        if (isAboveEMA200) score += 25;
        if (isAboveEMA50) score += 15;
        if (adxValue > 15) score += 20;
        if (adxValue > 25) score += 10; // Bonus por fuerza extra
        if (hasVolumeSpike) score += 20;
        
        // PARÁMETRO AGRESIVO: RSI > 35
        if (rsi > 35 && rsi < 65) score += 10;

        let status: 'passed' | 'failed' = 'failed';
        let reason = 'Esperar Señal';

        // PROTOCOLO SNIPER AGRESIVO
        if (isAboveEMA200 && isStrongTrend && hasVolumeSpike && rsi < 65) {
          status = 'passed';
          reason = '¡SNIPER LOCK!';
        } else {
          if (!isAboveEMA200) reason = 'Bajo EMA 200';
          else if (!isStrongTrend) reason = 'ADX Bajo (<15)';
          else if (!hasVolumeSpike) reason = 'Falta Volumen (1.2x)';
          else reason = 'Ajustando RSI';
        }

        const stopLoss = currentPrice * 0.98; // 2% SL fijo
        const takeProfit = currentPrice * 1.04; // 4% TP objetivo

        return {
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          image: coin.image,
          entryPrice: currentPrice,
          priceChangePercent: coin.price_change_percentage_24h,
          volume: `${(coin.total_volume / 1000000).toFixed(1)}M`,
          rsi,
          sma: ema200, 
          ema200,
          adx: adxValue,
          analysis: `RSI: ${rsi.toFixed(0)} | ADX: ${adxValue.toFixed(0)}`,
          readinessScore: Math.min(100, Math.max(5, score)),
          status,
          reason,
          stopLoss,
          takeProfit
        };

      } catch (error) {
        return createDefaultSignal(coin, 'Error de Conexión');
      }
    });

    const results = await Promise.all(signalPromises);
    return (results.filter(Boolean) as TradeSignal[]).sort((a, b) => b.readinessScore - a.readinessScore);
  } catch (globalError) {
    console.error("Critical Scanner Error:", globalError);
    return [];
  }
}

function createDefaultSignal(coin: MarketTicker, reason: string): TradeSignal {
  const baseScore = Math.max(5, Math.min(20, Math.abs(coin.price_change_percentage_24h) * 2));
  return {
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    image: coin.image,
    entryPrice: coin.current_price,
    priceChangePercent: coin.price_change_percentage_24h,
    volume: `${(coin.total_volume / 1000000).toFixed(1)}M`,
    rsi: 50,
    sma: 0,
    ema200: 0,
    adx: 0,
    analysis: 'Iniciando...',
    readinessScore: isNaN(baseScore) ? 5 : baseScore,
    status: 'failed',
    reason,
    stopLoss: coin.current_price * 0.98,
    takeProfit: coin.current_price * 1.04
  };
}