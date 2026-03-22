import React from 'react';
import { Trade } from '../types';
import { formatCurrency } from '../utils';
import { History, AlertCircle, Sparkles } from 'lucide-react';

interface TradeHistoryProps {
  trades: Trade[];
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ trades }) => {
  return (
    <div className="card-base overflow-hidden">
      <div className="px-8 py-5 border-b border-border flex items-center gap-3 bg-surface-hover">
        <History className="w-4.5 h-4.5 text-brand-primary" />
        <h2 className="text-base font-bold text-main">Trade History</h2>
      </div>

      {trades.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-muted text-sm font-medium">No trades executed yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {trades.map((trade) => (
            <div key={trade.id} className="p-5 lg:p-8 hover:bg-surface-hover transition-colors duration-200">
              <div className="flex justify-between items-start mb-4 lg:mb-5">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    trade.action === 'BUY' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}>
                    {trade.action}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm lg:text-base text-main">{trade.ticker}</h4>
                    <span className="text-[10px] lg:text-[11px] text-muted font-medium">
                      {new Date(trade.executed_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs lg:text-sm font-bold text-main">{formatCurrency(trade.total_value)}</p>
                  <p className="text-[10px] lg:text-[11px] text-muted font-medium">{trade.quantity.toFixed(4)} shares</p>
                </div>
              </div>

              {trade.ai_analysis ? (
                <div className="mt-4 lg:mt-5 p-4 lg:p-5 bg-surface-hover rounded-xl border border-border space-y-3">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-3.5 h-3.5 text-brand-primary shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.1em] mb-1.5">AI Analysis</p>
                      <p className="text-xs lg:text-sm text-muted leading-relaxed italic">
                        "{trade.ai_analysis}"
                      </p>
                    </div>
                  </div>
                  {trade.mistake_flags && trade.mistake_flags !== 'None' && (
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.1em]">
                        Risk Flag: {trade.mistake_flags}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4 lg:mt-5 p-3 lg:p-4 bg-surface-hover rounded-xl border border-dashed border-border">
                  <p className="text-[10px] text-muted uppercase tracking-widest text-center font-bold">Analysis Processing</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TradeHistory;
