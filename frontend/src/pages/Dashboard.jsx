import React from 'react'
import { TrendingUp, BrainCircuit } from 'lucide-react'
import { cn } from '../lib/utils'

const Dashboard = ({ user }) => (
  <div className="max-w-md mx-auto pt-8 px-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="mb-8">
      <p className="text-tertiary text-xs uppercase tracking-widest font-bold mb-1">Portfolio Balance</p>
      <h1 className="text-4xl font-bold tracking-tight">₹{user.portfolioValue.toLocaleString()}</h1>
      <p className="text-profit text-xs font-bold flex items-center gap-1 mt-1">
        <TrendingUp size={12} /> +₹{user.allTimeGains} (8.4%) all time profit
      </p>
    </div>

    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] font-bold text-tertiary uppercase tracking-wider">Your Holdings</h3>
        <button className="text-[10px] text-ai font-bold uppercase tracking-wider">See Report</button>
      </div>

      <div className="space-y-3">
        {user.holdings.map(stock => (
          <div key={stock.ticker} className="bg-secondary/50 border border-secondary p-4 rounded-3xl flex justify-between items-center group active:scale-[0.98] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black/40 rounded-2xl flex items-center justify-center border border-primary text-sm font-bold">
                {stock.ticker.slice(0, 1)}
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-tight uppercase">{stock.ticker}</h4>
                <p className="text-[10px] text-tertiary font-medium">{stock.shares} shares held</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">₹{stock.value.toLocaleString()}</p>
              <p className={cn("text-[10px] font-bold", stock.change > 0 ? "text-profit" : "text-loss")}>
                {stock.change > 0 ? '+' : ''}{stock.change}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>

    <div className="bg-secondary/40 border border-secondary p-6 rounded-[32px] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 text-ai/10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
        <BrainCircuit size={80} />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-ai text-[10px] uppercase font-bold tracking-widest italic flex items-center gap-1">
          <BrainCircuit size={12} /> Daily Strategy
        </span>
      </div>
      <p className="text-[13px] text-secondary leading-relaxed pr-8">
        Your cash reserves are at <span className="text-primary font-bold">₹{user.cash.toLocaleString()}</span>. 
        Recent data shows <span className="text-profit font-bold underline">HDFCBANK</span> is entering a low-RSI bounce zone. 
        Consider a fresh entry today.
      </p>
      
      <div className="mt-6 flex items-center justify-between">
        <div className="flex -space-x-2">
           {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-secondary flex-center text-[8px] font-bold text-tertiary">S{i}</div>)}
           <div className="pl-3 text-[10px] text-tertiary font-medium italic">52 others reading this</div>
        </div>
        <button className="text-[10px] text-ai font-bold uppercase tracking-wider">Analyze →</button>
      </div>
    </div>
  </div>
)

export default Dashboard
