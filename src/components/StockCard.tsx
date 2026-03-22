import React from 'react';
import { TrendingUp, TrendingDown, Bell } from 'lucide-react';
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
    <div 
      className="card-base card-hover p-6 cursor-pointer group relative"
      onClick={() => onClick(stock)}
    >
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onAlertClick?.(stock);
        }}
        className="absolute top-4 right-4 p-2 bg-surface-hover hover:bg-alert-accent/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-10"
      >
        <Bell className="w-3.5 h-3.5 text-muted group-hover:text-alert-accent" />
      </button>

      <div className="flex justify-between items-start mb-6 pr-8">
        <div>
          <h3 className="text-base font-bold text-main">{stock.ticker}</h3>
          <p className="text-[11px] text-muted font-medium uppercase tracking-wider mt-0.5">{stock.name}</p>
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

      <div className="h-12 w-full opacity-40 group-hover:opacity-100 transition-opacity duration-300">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={isPositive ? "#10b981" : "#ff7675"} 
              strokeWidth={1.5} 
              dot={false} 
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockCard;
