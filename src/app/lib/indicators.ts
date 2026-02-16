
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period || period <= 0) return prices.length > 0 ? prices[prices.length - 1] : 0;
  const sum = prices.slice(prices.length - period).reduce((a, b) => a + b, 0);
  return sum / period;
}

export function calculateEMA(prices: number[], period: number): number {
  if (prices.length === 0) return 0;
  if (prices.length < period) return prices[prices.length - 1];
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] - ema) * k + ema;
  }
  return ema;
}

export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length <= period) return 50;
  
  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  return isNaN(rsi) ? 50 : rsi;
}

export function calculateADX(ohlc: {high: number, low: number, close: number}[], period: number = 14): number {
  // Reducimos el requisito mínimo para que siempre haya datos
  if (ohlc.length < 5) return 0;
  
  const effectivePeriod = Math.min(period, ohlc.length - 1);

  let plusDM = [];
  let minusDM = [];
  let tr = [];

  for (let i = 1; i < ohlc.length; i++) {
    const upMove = ohlc[i].high - ohlc[i-1].high;
    const downMove = ohlc[i-1].low - ohlc[i].low;

    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
    
    tr.push(Math.max(
      ohlc[i].high - ohlc[i].low,
      Math.abs(ohlc[i].high - ohlc[i-1].close),
      Math.abs(ohlc[i].low - ohlc[i-1].close)
    ));
  }

  const smoothedTR = calculateEMA(tr, effectivePeriod);
  const smoothedPlusDM = calculateEMA(plusDM, effectivePeriod);
  const smoothedMinusDM = calculateEMA(minusDM, effectivePeriod);

  if (smoothedTR === 0) return 0;

  const plusDI = 100 * (smoothedPlusDM / smoothedTR);
  const minusDI = 100 * (smoothedMinusDM / smoothedTR);
  
  const denominator = plusDI + minusDI;
  if (denominator === 0) return 0;

  const dx = 100 * Math.abs(plusDI - minusDI) / denominator;
  
  return isNaN(dx) ? 0 : dx;
}
