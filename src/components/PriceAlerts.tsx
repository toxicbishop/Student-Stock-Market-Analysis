import React, { useState } from 'react';
import { Bell, Trash2, Plus, X, ArrowUp, ArrowDown } from 'lucide-react';
import { PriceAlert, Stock } from '../types';
import { cn, formatCurrency } from '../utils';
import { motion } from 'motion/react';

interface PriceAlertsProps {
  alerts: PriceAlert[];
  stocks: Stock[];
  onAddAlert: (ticker: string, targetPrice: number, condition: 'ABOVE' | 'BELOW') => void;
  onDeleteAlert: (alertId: string) => void;
  onClose: () => void;
}

const PriceAlerts: React.FC<PriceAlertsProps> = ({ alerts, stocks, onAddAlert, onDeleteAlert, onClose }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [ticker, setTicker] = useState(stocks[0]?.ticker || '');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');

  const handleAdd = () => {
    if (ticker && targetPrice) {
      onAddAlert(ticker, parseFloat(targetPrice), condition);
      setShowAdd(false);
      setTargetPrice('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Price alerts">
      <motion.div initial={{ opacity: 0, scale: .97, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .97, y: 10 }} className="w-full max-w-md bg-alert-dark border border-border rounded-xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center bg-surface-raised">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-brand-primary" />
            <h2 className="text-xl font-bold text-alert-light">Price Alerts</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {alerts.length === 0 && !showAdd && (
            <div className="py-12 text-center">
              <p className="text-muted text-sm">No price alerts set. Stay ahead of the market!</p>
            </div>
          )}

          {alerts.map((alert) => (
            <div key={alert.id} className="p-4 bg-surface-raised border border-border rounded-lg flex justify-between items-center group">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                  alert.condition === 'ABOVE' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                )}>
                  {alert.condition === 'ABOVE' ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-alert-light">{alert.ticker}</h4>
                  <p className="text-xs text-muted">
                    {alert.condition === 'ABOVE' ? 'Above' : 'Below'} {formatCurrency(alert.targetPrice)}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => onDeleteAlert(alert.id)}
                className="p-2 text-muted hover:text-alert-danger transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {showAdd && (
            <div className="p-5 bg-surface-raised border border-brand-primary/20 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Stock</label>
                  <select 
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    className="w-full bg-surface border border-border rounded-lg py-2 px-3 text-sm text-alert-light focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  >
                    {stocks.map(s => <option key={s.ticker} value={s.ticker}>{s.ticker}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Condition</label>
                  <select 
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as 'ABOVE' | 'BELOW')}
                    className="w-full bg-surface border border-border rounded-lg py-2 px-3 text-sm text-alert-light focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  >
                    <option value="ABOVE">Above</option>
                    <option value="BELOW">Below</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Target Price (₹)</label>
                <input 
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="Enter price..."
                  className="w-full bg-surface border border-border rounded-lg py-2 px-3 text-sm text-alert-light focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-2 rounded-lg text-xs font-bold text-muted hover:bg-surface-hover transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAdd}
                  className="flex-1 py-2 rounded-lg text-xs font-bold bg-brand-primary text-[#06111f] hover:opacity-90 transition-colors"
                >
                  Set Alert
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 bg-surface-raised border-t border-border">
          {!showAdd && (
            <button 
              onClick={() => setShowAdd(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/20 hover:bg-brand-primary/15 transition-all font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              Add New Alert
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PriceAlerts;
