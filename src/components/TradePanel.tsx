import React, { useState } from 'react';
import { X, ArrowRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Stock, UserProfile } from '../types';
import { cn, formatCurrency } from '../utils';

interface TradePanelProps {
  stock: Stock | null;
  user: UserProfile | null;
  onClose: () => void;
  onTrade: (action: 'BUY' | 'SELL', amount: number) => void;
}

const TradePanel: React.FC<TradePanelProps> = ({ stock, user, onClose, onTrade }) => {
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState<string>('1000');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!stock) return null;

  const numericAmount = parseFloat(amount) || 0;
  const estimatedShares = numericAmount / stock.price;

  const quickAmounts = [500, 1000, 5000];

  const handleExecute = async () => {
    setIsProcessing(true);
    // Simulate network delay for better UX feedback
    await new Promise(resolve => setTimeout(resolve, 800));
    onTrade(action, numericAmount);
    setIsProcessing(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 sm:bg-black/40 sm:backdrop-blur-sm">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="fixed right-0 top-0 w-full sm:w-[450px] h-screen bg-bg-main border-l border-border p-6 sm:p-10 flex flex-col shadow-2xl overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-10 sm:mb-12">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-lg sm:text-xl">
                {stock.ticker[0]}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-main">{stock.ticker}</h2>
                <p className="text-xs sm:text-sm text-muted font-medium">{formatCurrency(stock.price)}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-lg transition-colors">
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-muted" />
            </button>
          </div>

          <div className="flex p-1 bg-surface-hover rounded-xl mb-8 sm:mb-10">
            <button
              onClick={() => setAction('BUY')}
              className={cn(
                "flex-1 py-2.5 sm:py-3 rounded-lg text-sm font-bold transition-all",
                action === 'BUY' ? "bg-alert-accent text-alert-dark shadow-sm" : "text-muted hover:text-main"
              )}
            >
              Buy
            </button>
            <button
              onClick={() => setAction('SELL')}
              className={cn(
                "flex-1 py-2.5 sm:py-3 rounded-lg text-sm font-bold transition-all",
                action === 'SELL' ? "bg-alert-accent text-alert-dark shadow-sm" : "text-muted hover:text-main"
              )}
            >
              Sell
            </button>
          </div>

          <div className="flex-1">
            <div className="relative mb-8 sm:mb-10">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl font-bold text-muted/30">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent border-none text-4xl sm:text-5xl font-bold text-center focus:outline-none focus:ring-0 placeholder:text-muted/20 text-main"
                placeholder="0"
              />
              <p className="text-center text-[10px] text-muted mt-4 uppercase tracking-widest font-bold">Investment Amount</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-10 sm:mb-12">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className="px-4 py-2 rounded-full border border-border hover:bg-surface-hover transition-colors text-[11px] font-bold text-muted"
                >
                  + ₹{amt}
                </button>
              ))}
            </div>

            <div className="space-y-4 bg-surface-hover p-5 sm:p-6 rounded-xl border border-border">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted font-medium">Estimated Shares</span>
                <span className="text-sm font-bold text-main">{estimatedShares.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted font-medium">Available Cash</span>
                <span className="text-sm font-bold text-main">{formatCurrency(user?.virtual_cash || 0)}</span>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-8">
            <div className="flex items-start gap-3 p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/10 mb-6 sm:mb-8">
              <Info className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted leading-relaxed font-medium">
                This is a paper trading simulation. No real capital is at risk. Your virtual balance will be updated instantly.
              </p>
            </div>
            
            <button
              onClick={handleExecute}
              disabled={isProcessing || numericAmount <= 0 || (action === 'BUY' && numericAmount > (user?.virtual_cash || 0))}
              className={cn(
                "btn-primary w-full flex items-center justify-center gap-2 text-base py-3.5 sm:py-4",
                (isProcessing || numericAmount <= 0 || (action === 'BUY' && numericAmount > (user?.virtual_cash || 0))) && "opacity-50 cursor-not-allowed"
              )}
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Execute {action === 'BUY' ? 'Purchase' : 'Sale'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TradePanel;
