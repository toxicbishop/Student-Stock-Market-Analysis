import React, { useState } from 'react'
import { 
  Home, 
  Search, 
  Users, 
  Trophy,
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronUp,
  X
} from 'lucide-react'
import { cn } from './lib/utils'

// --- Components ---

const BottomNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'trade', label: 'Trade', icon: Search },
    { id: 'group', label: 'Group', icon: Users },
    { id: 'rank', label: 'Rank', icon: Trophy },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-secondary border-t border-secondary backdrop-blur-xl z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-200",
              activeTab === tab.id ? "text-ai" : "text-tertiary"
            )}
          >
            <tab.icon size={20} variant={activeTab === tab.id ? 'fill' : 'outline'} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

const AutopsySheet = ({ trade, isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end justify-center animate-in fade-in duration-300">
      <div 
        className="w-full max-w-md bg-secondary rounded-t-[32px] p-6 pb-12 animate-slide-up border-t border-primary relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-tertiary hover:text-primary p-2"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center">
          <div className="w-12 h-1.5 bg-tertiary/20 rounded-full mb-6" />
          
          <span className="text-ai text-[10px] uppercase tracking-widest font-bold mb-1 italic flex items-center gap-1">
            <BrainCircuit size={12} /> AI Autopsy
          </span>
          <h2 className="text-xl font-bold mb-1">Trade Analysis</h2>
          <p className="text-tertiary text-xs mb-8">{trade.ticker} · {trade.action} · {trade.qty} shares</p>

          <div className="w-full bg-black/40 rounded-2xl p-6 border border-primary mb-6 text-center">
            <div className="text-4xl font-bold text-warning mb-1">{trade.score}</div>
            <div className="text-[10px] text-tertiary uppercase tracking-wider mb-4">Trade Score / 100</div>
            <div className="w-full h-1 bg-tertiary/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-warning transition-all duration-1000" 
                style={{ width: `${trade.score}%` }} 
              />
            </div>
          </div>

          <div className="w-full space-y-4">
            <div className="bg-black/20 border-l-4 border-loss-red p-4 rounded-r-xl">
              <h4 className="text-loss-red text-[11px] font-bold uppercase mb-1">Overbought Entry</h4>
              <p className="text-secondary text-xs leading-relaxed">
                RSI was {trade.rsi} when you entered. Volume also falling — weak confirmation for a buy.
              </p>
            </div>

            <div className="bg-black/20 border border-ai/30 p-4 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 text-ai/20">
                <BrainCircuit size={40} />
              </div>
              <h4 className="text-ai text-[11px] font-bold uppercase mb-2">AI Mentor</h4>
              <p className="text-secondary text-xs leading-relaxed italic pr-8">
                "RSI of {trade.rsi} signals the stock is near overbought. With volume declining, buyers are losing momentum. Next time, wait for RSI to cool below 55 before entering."
              </p>
            </div>

            <div className="text-tertiary text-[11px] bg-white/5 p-3 rounded-lg flex gap-2 items-start">
               <AlertTriangle size={14} className="text-warning shrink-0" />
               <span><strong>Fix:</strong> Wait for RSI pullback to 45–55 before entering trending stocks.</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-ai text-white font-bold py-4 rounded-2xl mt-8 active:scale-95 transition-all"
          >
            Got it, Teacher
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Main Pages ---

const Dashboard = ({ user }) => (
  <div className="max-w-md mx-auto pt-8 px-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="mb-8">
      <p className="text-tertiary text-xs">Good morning, {user.name}</p>
      <h1 className="text-4xl font-bold tracking-tight">₹{user.portfolioValue.toLocaleString()}</h1>
      <p className="text-profit text-xs font-semibold flex items-center gap-1 mt-1">
        <TrendingUp size={12} /> +₹{user.allTimeGains} (8.4%) all time
      </p>
    </div>

    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] font-bold text-tertiary uppercase tracking-wider">Top Holdings</h3>
        <button className="text-[10px] text-ai font-bold uppercase tracking-wider">View All</button>
      </div>

      <div className="space-y-3">
        {user.holdings.map(stock => (
          <div key={stock.ticker} className="bg-secondary/50 border border-secondary p-4 rounded-2xl flex justify-between items-center group active:scale-[0.98] transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center border border-primary text-xs font-bold">
                {stock.ticker.slice(0, 2)}
              </div>
              <div>
                <h4 className="text-sm font-bold">{stock.ticker}</h4>
                <p className="text-[10px] text-tertiary">{stock.shares} shares</p>
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

    <div className="bg-ai/10 border border-ai/20 p-5 rounded-3xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 text-ai/20 pointer-events-none">
        <BrainCircuit size={60} />
      </div>
      <h3 className="text-ai text-[10px] font-bold uppercase tracking-widest mb-1 italic italic">Daily Insight</h3>
      <p className="text-sm text-secondary leading-relaxed pr-10">
        You're holding too much cash (₹{user.cash.toLocaleString()}). The market is bullish today — consider a low-RSI entry on INFOSYS.
      </p>
    </div>
  </div>
)

const App = () => {
  const [activeTab, setActiveTab] = useState('home')
  const [isAutopsyOpen, setIsAutopsyOpen] = useState(false)
  
  const user = {
    name: 'Pranav',
    portfolioValue: 10840,
    allTimeGains: 840,
    cash: 1802,
    holdings: [
      { ticker: 'RELIANCE', shares: 5, value: 14238, change: 2.4 },
      { ticker: 'INFY', shares: 3, value: 4620, change: -0.8 }
    ]
  }

  const demoTrade = {
    ticker: 'RELIANCE',
    action: 'BUY',
    qty: 2,
    score: 62,
    rsi: 74
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-ai/30">
      {/* Quick Access Top Bar */}
      <div className="h-14 flex items-center justify-between px-6 sticky top-0 bg-black/80 backdrop-blur-md z-40 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-ai rounded-md flex items-center justify-center">
            <TrendingUp size={14} className="text-black stroke-[3px]" />
          </div>
          <span className="font-bold text-sm tracking-tighter uppercase">Trade<span className="text-ai">Lab</span></span>
        </div>
        <div className="w-8 h-8 rounded-full bg-secondary border border-primary flex items-center justify-center overflow-hidden">
          <div className="text-[10px] font-bold">P</div>
        </div>
      </div>

      <main className="pb-20">
        {activeTab === 'home' && <Dashboard user={user} />}
        {activeTab === 'trade' && (
          <div className="max-w-md mx-auto p-12 text-center space-y-4">
             <Search size={48} className="mx-auto text-tertiary opacity-20" />
             <h2 className="text-xl font-bold">Market Access</h2>
             <p className="text-tertiary text-sm italic">"Don't trade the FOMO. Search a stock to see its RSI."</p>
             <button 
              onClick={() => setIsAutopsyOpen(true)}
              className="mt-8 text-ai text-sm font-bold border-b border-ai pb-1"
             >
                Test AI Autopsy Trigger
             </button>
          </div>
        )}
        {activeTab === 'group' && (
           <div className="max-w-md mx-auto p-12 text-center space-y-4">
              <Users size={48} className="mx-auto text-tertiary opacity-20" />
              <h2 className="text-xl font-bold">Your Club</h2>
              <p className="text-tertiary text-sm">Create a group portfolio and vote on trades with friends.</p>
           </div>
        )}
        {activeTab === 'rank' && (
           <div className="max-w-md mx-auto p-12 text-center space-y-4">
              <Trophy size={48} className="mx-auto text-tertiary opacity-20" />
              <h2 className="text-xl font-bold">Leaderboard</h2>
              <p className="text-tertiary text-sm">Compete with students across India.</p>
           </div>
        )}
      </main>

      <AutopsySheet 
        trade={demoTrade} 
        isOpen={isAutopsyOpen} 
        onClose={() => setIsAutopsyOpen(false)} 
      />

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}

export default App
