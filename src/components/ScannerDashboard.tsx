'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCcw, 
  Activity,
  ArrowUpRight,
  Wallet,
  ShieldAlert,
  Calculator,
  Zap,
  Wifi,
  Target
} from 'lucide-react';
import { scanMarket, TradeSignal } from '@/app/actions/scanner';

function AnimatedNumber({ value, suffix = "" }: { value: number, suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = displayValue;
    const end = Math.round(value);
    if (start === end) return;

    const duration = 1000; 
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutQuad = (t: number) => t * (2 - t);
      const current = Math.round(start + (end - start) * easeOutQuad(progress));
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{displayValue}{suffix}</span>;
}

export default function ScannerDashboard() {
  const [isScanning, setIsScanning] = useState(false);
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const [balance, setBalance] = useState<string>("1000");
  const [riskPercent, setRiskPercent] = useState<string>("2.0");

  const numBalance = useMemo(() => {
    const val = parseFloat(balance);
    return isNaN(val) ? 0 : val;
  }, [balance]);

  const numRiskPercent = useMemo(() => {
    const val = parseFloat(riskPercent);
    return isNaN(val) ? 0 : Math.min(100, val);
  }, [riskPercent]);

  const handleScan = useCallback(async () => {
    if (isScanning) return;
    setIsScanning(true);
    try {
      const results = await scanMarket();
      if (results && results.length > 0) {
        setSignals(results);
        setLastUpdate(new Date());
      }
    } catch (err: any) {
      console.error("Scanner Error:", err);
    } finally {
      setIsScanning(false);
    }
  }, [isScanning]);

  useEffect(() => {
    setMounted(true);
    handleScan();
    const interval = setInterval(handleScan, 30000); 
    return () => clearInterval(interval);
  }, [handleScan]);

  const calculatePosition = (entry: number, sl: number) => {
    if (entry <= 0 || sl <= 0 || entry <= sl) {
      return { positionSize: "0.00", riskAmount: "0.00", slPercent: "0.0" };
    }
    const riskAmountDollars = numBalance * (numRiskPercent / 100);
    const stopLossPercent = (entry - sl) / entry;
    if (stopLossPercent <= 0) return { positionSize: "0.00", riskAmount: "0.00", slPercent: "0.0" };
    
    let positionSize = riskAmountDollars / stopLossPercent;
    if (positionSize > numBalance) positionSize = numBalance;
    
    return {
      positionSize: positionSize.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      riskAmount: (positionSize * stopLossPercent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      slPercent: (stopLossPercent * 100).toFixed(2)
    };
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 min-h-screen pb-24">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-amber-500 animate-spin' : 'bg-emerald-500 animate-pulse'}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
              {isScanning ? 'Syncing...' : 'Sniper Engine Live'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 opacity-50">
            <Wifi className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Refresh 30s</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
            {mounted && lastUpdate ? `UPDATE: ${lastUpdate.toLocaleTimeString()}` : 'CONNECTING...'}
          </span>
        </div>
      </div>

      <div className="bg-card/40 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-2xl shadow-2xl relative overflow-hidden ring-1 ring-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <Zap className="w-7 h-7 text-primary fill-primary animate-pulse" />
              <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                Sniper<span className="text-primary not-italic">Terminal</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-[9px] font-black text-primary tracking-widest py-0.5 px-2 uppercase">Protocol V3.5</Badge>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-[9px] font-black text-emerald-500 tracking-widest py-0.5 px-2 uppercase">Aggressive Mode</Badge>
            </div>
          </div>
          
          <Button 
            onClick={handleScan}
            disabled={isScanning}
            size="lg"
            className="rounded-2xl shadow-xl shadow-primary/20 font-black bg-primary hover:bg-primary/90 transition-all active:scale-95 h-14 px-10 border-b-4 border-primary-foreground/20"
          >
            <RefreshCcw className={`w-5 h-5 mr-3 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'SCANNING...' : 'REFRESH'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-white/10 relative z-10">
          <div className="space-y-3">
            <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-primary" /> CAPITAL DISPONIBLE (USD)
            </Label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-2xl">$</span>
              <Input 
                type="text" 
                inputMode="decimal"
                value={balance} 
                onChange={(e) => setBalance(e.target.value)}
                className="bg-black/60 border-white/10 pl-10 font-mono font-black text-3xl focus:border-primary h-16 rounded-2xl relative text-white shadow-inner"
              />
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> RIESGO POR OPERACIÓN (%)
            </Label>
            <div className="relative group">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500 font-black text-2xl">%</span>
              <Input 
                type="text" 
                inputMode="decimal"
                value={riskPercent} 
                onChange={(e) => setRiskPercent(e.target.value)}
                className="bg-black/60 border-white/10 pr-10 font-mono font-black text-3xl text-rose-500 focus:border-rose-500 h-16 rounded-2xl relative shadow-inner"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {isScanning && signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 bg-card/20 rounded-[3rem] border-2 border-white/5 border-dashed">
            <Activity className="w-16 h-16 text-primary animate-pulse opacity-40" />
            <div className="text-center space-y-2">
              <p className="text-xs font-black text-white uppercase tracking-[0.5em] animate-pulse">Analizando Binance...</p>
              <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Protocolo Sniper Agresivo V3.5</p>
            </div>
          </div>
        ) : (
          signals.map((signal) => {
            const riskInfo = calculatePosition(signal.entryPrice, signal.stopLoss);
            const isReliable = signal.status === 'passed';
            const statusColor = isReliable ? 'text-emerald-500' : 'text-rose-500';
            const cardRing = isReliable ? 'ring-emerald-500/50 shadow-emerald-500/10' : 'ring-rose-500/20';
            const scoreBg = isReliable ? 'bg-emerald-500/10' : 'bg-rose-500/5';
            
            return (
              <Card key={signal.symbol} className={`overflow-hidden border-none transition-all duration-300 ring-2 ${cardRing} rounded-[2rem] shadow-2xl bg-card/60 backdrop-blur-md`}>
                <CardContent className="p-0">
                  <div className="p-6 flex flex-col lg:flex-row lg:items-center gap-8">
                    <div className="flex items-center gap-5 min-w-[200px]">
                      <div className="relative shrink-0">
                        {isReliable && <div className="absolute inset-0 bg-emerald-500 blur-xl animate-pulse opacity-40 rounded-full" />}
                        <Avatar className="w-16 h-16 border-2 border-white/10 relative z-10 bg-black shadow-2xl">
                          <AvatarImage src={signal.image} />
                          <AvatarFallback className="bg-muted font-black text-white">{signal.symbol[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black tracking-tighter text-white uppercase leading-none">{signal.name}</span>
                          <span className="text-[10px] font-black px-2 py-0.5 bg-white/10 rounded-md text-muted-foreground">{signal.symbol}</span>
                        </div>
                        <div className="text-3xl font-mono font-black text-primary tracking-tighter">
                          ${signal.entryPrice < 1 ? signal.entryPrice.toFixed(6) : signal.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                        </div>
                      </div>
                    </div>

                    <div className={`flex-1 space-y-3 ${scoreBg} p-5 rounded-3xl border border-white/5`}>
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2">
                          <Target className={`w-5 h-5 ${statusColor}`} />
                          <p className={`text-xs font-black uppercase tracking-widest ${statusColor}`}>
                            CONFIANZA SNIPER
                          </p>
                        </div>
                        <span className={`text-3xl font-black font-mono ${statusColor} ${isReliable ? 'animate-pulse' : ''}`}>
                          <AnimatedNumber value={signal.readinessScore} suffix="%" />
                        </span>
                      </div>
                      <Progress 
                        value={signal.readinessScore} 
                        className={`h-4 bg-black/40 rounded-full ${isReliable ? '[&>div]:bg-emerald-500' : '[&>div]:bg-rose-500'}`} 
                      />
                    </div>

                    <div className="flex items-center justify-around lg:justify-end gap-10 lg:min-w-[220px]">
                      <div className="text-center">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 opacity-50">FUERZA (ADX)</p>
                        <span className={`font-mono text-2xl font-black leading-none ${signal.adx > 15 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          <AnimatedNumber value={signal.adx} />
                        </span>
                      </div>
                      <div className="text-center border-l border-white/10 pl-10">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 opacity-50">TENDENCIA</p>
                        <Badge variant="outline" className={`font-black text-[10px] py-1 px-3 border-none rounded-lg ${signal.entryPrice > signal.ema200 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {signal.entryPrice > signal.ema200 ? 'ALCISTA' : 'BAJISTA'}
                        </Badge>
                      </div>
                    </div>

                    <div className="lg:text-right flex items-center lg:block justify-between border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
                      {isReliable ? (
                        <div className="space-y-2">
                          <Badge className="bg-emerald-500 text-white border-none px-6 py-3 rounded-xl font-black text-sm shadow-xl shadow-emerald-500/30 animate-bounce cursor-pointer">
                            ENTRAR YA
                          </Badge>
                          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Protocolo Validado</p>
                        </div>
                      ) : (
                        <div className="flex flex-col lg:items-end gap-1.5">
                          <Badge variant="outline" className="text-[10px] font-black text-rose-500 border-rose-500/30 bg-rose-500/10 py-1.5 px-4 rounded-lg uppercase">
                            {signal.reason}
                          </Badge>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Esperar Señal</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/5 border-t border-white/10">
                    <div className="p-5 flex flex-col gap-1.5 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                      <span className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> TAKE PROFIT (4%)
                      </span>
                      <span className="text-2xl font-mono font-black text-emerald-400 tracking-tighter">
                        ${signal.takeProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </span>
                    </div>
                    <div className="p-5 flex flex-col gap-1.5 bg-rose-500/5 hover:bg-rose-500/10 transition-colors">
                      <span className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> STOP LOSS (2%)
                      </span>
                      <span className="text-2xl font-mono font-black text-rose-400 tracking-tighter">
                        ${signal.stopLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </span>
                    </div>
                    <div className="p-5 flex flex-col gap-1.5 bg-primary/10 hover:bg-primary/20 transition-colors relative">
                      <div className="absolute top-2 right-2">
                        <Calculator className="w-4 h-4 text-primary opacity-30" />
                      </div>
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">
                        POSICIÓN (RIESGO)
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-mono font-black text-primary tracking-tighter">
                          ${riskInfo.positionSize}
                        </span>
                        <div className="text-[10px] font-black text-muted-foreground flex flex-col">
                          <span>Risk:</span>
                          <span className="text-rose-400">-${riskInfo.riskAmount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <div className="py-16 border-t border-white/10 text-center space-y-6">
        <div className="bg-black/40 border border-white/10 p-8 rounded-[2.5rem] max-w-2xl mx-auto backdrop-blur-xl">
          <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed tracking-[0.2em]">
            PROTOCOLO SNIPER V3.5 (AGRESIVO): Confianza basada en EMA 200, ADX {'>'} 15, RSI {'>'} 35 y Volumen {'>'} 1.2x. 
            Protección: Stop Loss 2% | Trailing Stop activo al +0.5% profit.
            Actualización: <span className="text-primary font-black">Cada 30 segundos</span>.
          </p>
        </div>
      </div>
    </div>
  );
}