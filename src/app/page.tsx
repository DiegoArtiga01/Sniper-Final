
import ScannerDashboard from '@/components/ScannerDashboard';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        <ScannerDashboard />
      </div>
      
      <Toaster />

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto px-4 py-12 text-center text-muted-foreground text-sm">
        <div className="flex flex-col items-center gap-4">
          <p className="max-w-md">
            Trading cryptocurrencies involves high risk. This scanner is an analysis tool and does not constitute financial advice. Always perform your own due diligence.
          </p>
          <div className="flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
            <span className="font-headline font-bold uppercase tracking-tighter">Binance API v3</span>
            <span className="w-1 h-1 bg-muted-foreground rounded-full" />
            <span className="font-headline font-bold uppercase tracking-tighter">GenAI Refined</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
