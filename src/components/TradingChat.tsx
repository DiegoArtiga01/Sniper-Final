'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, BrainCircuit, Loader2, Bot } from 'lucide-react';
import { tradingChat } from '@/ai/flows/trading-chat-flow';
import { TradeSignal } from '@/app/actions/scanner';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface TradingChatProps {
  balance: number;
  signals: TradeSignal[];
}

export default function TradingChat({ balance, signals }: TradingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: '¡Hola! Soy tu analista Gemini 3.0. ¿Qué capital vamos a gestionar hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI
    const updatedMessages = [...messages, { role: 'user', content: userMessage }] as Message[];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Prepare compact signal data for the AI
      const marketContext = signals.slice(0, 15).map(s => ({
        symbol: s.symbol,
        entryPrice: s.entryPrice,
        rsi: s.rsi,
        adx: s.adx,
        status: s.status,
        reason: s.reason || ''
      }));

      const result = await tradingChat({
        message: userMessage,
        history: messages, // Send history BEFORE current message
        activeBalance: balance,
        signals: marketContext
      });

      setMessages(prev => [...prev, { role: 'model', content: result.reply }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: 'Socio, el enlace con el satélite Gemini 3.0 ha fallado. Revisa tu conexión o el capital ingresado e intenta de nuevo.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="w-14 h-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 animate-in zoom-in-50"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      ) : (
        <Card className="w-[350px] sm:w-[400px] h-[500px] flex flex-col shadow-2xl border-primary/20 bg-card/95 backdrop-blur-xl animate-in slide-in-from-bottom-10">
          <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-black tracking-tighter uppercase">Gemini 3.0 Sniper</CardTitle>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Terminal Activa</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10' 
                        : 'bg-white/5 text-muted-foreground rounded-tl-none border border-white/5'
                    }`}>
                      {m.role === 'model' && <Bot className="w-3 h-3 mb-1 opacity-50 text-primary" />}
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
                      <Loader2 className="w-3 h-3 text-primary animate-spin" />
                      <span className="text-[10px] font-bold text-muted-foreground animate-pulse">ANALIZANDO...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-4 border-t border-white/5 bg-background/50">
            <div className="flex w-full items-center gap-2">
              <Input
                placeholder="Pregunta a la IA sobre el mercado..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="bg-background/50 border-white/10 text-xs h-10 focus:ring-primary"
              />
              <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()} className="h-10 w-10 shrink-0 shadow-lg">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
