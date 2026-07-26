import React from 'react';
import { TrendingUp, TrendingDown, Bell, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Stock } from '../types';
import { cn, formatCurrency } from '../utils';

interface StockCardProps {
  stock: Stock;
  onClick: (stock: Stock) => void;
  onAlertClick?: (stock: Stock) => void;
}

const StockCard: React.FC<StockCardProps> = ({ stock, onClick, onAlertClick }) => {
  const isPositive = stock.change >= 0;
  const chartData = stock.trend.map((val) => ({ value: val }));

  return (
    <motion.div
      whileHover={{ y: -3 }} whileTap={{ scale: 0.99 }}
      className="app-panel p-5 cursor-pointer group relative overflow-hidden transition-colors hover:bg-surface-raised"
      onClick={() => onClick(stock)}
    >
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onAlertClick?.(stock);
        }}
        aria-label={`Create alert for ${stock.ticker}`}
        className="absolute top-4 right-4 p-2 bg-surface-hover hover:bg-brand-primary/15 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
      >
        <Bell className="w-3.5 h-3.5 text-muted group-hover:text-brand-primary" />
      </button>

      <div className="flex justify-between items-start mb-5 pr-8">
        <div>
          <div className="flex items-center gap-2"><h3 className="text-base font-bold text-main">{stock.ticker}</h3><ArrowUpRight className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" /></div>
          <p className="text-[11px] text-muted font-medium mt-0.5 truncate max-w-[160px]">{stock.name}</p>
        </div>
        <div className="text-right">
          <p className="text-base font-semibold text-main">{formatCurrency(stock.price)}</p>
          <div className={cn(
            "flex items-center justify-end gap-1 text-[11px] font-bold mt-0.5",
            isPositive ? "text-emerald-500" : "text-rose-500"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{isPositive ? '+' : ''}{stock.change.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <div className="h-14 w-full opacity-55 group-hover:opacity-100 transition-opacity duration-300 border-t border-border pt-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={isPositive ? "#34d399" : "#fb7185"}
              strokeWidth={1.5} 
              dot={false} 
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default StockCard;
