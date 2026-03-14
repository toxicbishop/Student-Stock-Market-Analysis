import React, { useState } from 'react'
import { 
  Home, 
  Search, 
  Users, 
  Trophy,
  BrainCircuit,
  TrendingUp,
  X,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react'
import { cn } from './lib/utils'

// Pages
import Dashboard from './pages/Dashboard'
import Trade from './pages/Trade'
import Groups from './pages/Groups'
import Rank from './pages/Rank'

// --- Global Components ---

const BottomNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'trade', label: 'Trade', icon: Search },
    { id: 'group', label: 'Group', icon: Users },
    { id: 'rank', label: 'Rank', icon: Trophy },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/80 border-t border-white/5 backdrop-blur-2xl z-50">
      <div className="flex justify-around items-center h-20 max-w-md mx-auto px-4 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all duration-300 w-16",
              activeTab === tab.id ? "text-ai scale-110" : "text-tertiary hover:text-secondary"
            )}
          >
            <div className={cn(
               "p-2 rounded-xl transition-all",
               activeTab === tab.id ? "bg-ai/10 shadow-[0_0_15px_rgba(127,119,221,0.2)]" : "bg-transparent"
            )}>
              <tab.icon size={20} className={activeTab === tab.id ? "stroke-[2.5px]" : "stroke-[2px] opacity-70"} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

const AutopsySheet = ({ trade, isOpen, onClose }) => {
  if (!isOpen || !trade) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-end justify-center animate-in fade-in duration-300">
      <div 
        className="w-full max-w-lg bg-secondary rounded-t-[40px] p-8 pb-14 animate-slide-up border-t border-white/10 relative shadow-2xl shadow-ai/10"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-tertiary hover:text-primary transition-colors p-2"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center">
          <div className="w-12 h-1.5 bg-white/10 rounded-full mb-8" />
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-ai text-[11px] uppercase tracking-[0.2em] font-black italic flex items-center gap-1.5">
              <BrainCircuit size={14} className="animate-pulse" /> AI Autopsy
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2 tracking-tight">Post-Trade Analysis</h2>
          <p className="text-tertiary text-[11px] font-bold uppercase tracking-widest mb-10">{trade.ticker} · {trade.action} · {trade.qty} shares</p>

          <div className="w-full bg-black/40 rounded-[32px] p-8 border border-white/5 mb-8 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent pointer-events-none" />
            <div className="text-6xl font-black italic text-warning tracking-tighter mb-2 group-hover:scale-110 transition-transform duration-700">
              {trade.score}<span className="text-2xl text-tertiary font-medium opacity-50 not-italic ml-1">/100</span>
            </div>
            <div className="text-[10px] text-tertiary uppercase tracking-widest font-black mb-6">Trade Quality Score</div>
            
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-warning transition-all duration-[1500ms] ease-out shadow-[0_0_10px_rgba(186,117,23,0.5)]" 
                style={{ width: `${trade.score}%` }} 
              />
            </div>
            <p className="mt-4 text-[11px] font-bold text-tertiary uppercase tracking-wider">
               Status: <span className="text-warning">Fair Entry</span>
            </p>
          </div>

          <div className="w-full space-y-5">
            <div className="bg-white/[0.03] border-l-4 border-loss-red p-5 rounded-r-2xl border border-white/5">
              <h4 className="text-loss-red text-[11px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                <ShieldAlert size={14} /> The Mistake: Overbought Entry
              </h4>
              <p className="text-secondary text-[13px] leading-relaxed font-medium">
                RSI was <span className="text-primary font-bold">{trade.rsi}</span> when you entered. The market was already exhausted — you bought at the peak of momentum.
              </p>
            </div>

            <div className="bg-ai/5 border border-ai/20 p-6 rounded-[24px] relative overflow-hidden group">
              <div className="absolute -top-2 -right-2 p-4 text-ai/5 pointer-events-none group-hover:scale-125 transition-transform duration-700">
                <BrainCircuit size={80} />
              </div>
              <h4 className="text-ai text-[11px] font-black uppercase tracking-[0.2em] mb-3">AI Mentor's Voice</h4>
              <p className="text-secondary text-[13px] leading-relaxed italic italic font-medium pr-10">
                "Numbers don't lie. RSI {trade.rsi} is territory where most pros are selling, not buying. You chased the green candle. Next time, wait for a cooldown below RSI 55."
              </p>
            </div>

            <div className="text-tertiary text-[12px] bg-white/5 p-4 rounded-2xl flex gap-3 items-center border border-white/5">
               <AlertTriangle size={18} className="text-warning shrink-0" />
               <span className="font-medium"><strong>Strategy Fix:</strong> Look for 50%+ volume confirmation next time.</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-white text-black font-black uppercase tracking-widest py-5 rounded-2xl mt-10 active:scale-95 transition-all shadow-xl hover:shadow-white/5"
          >
            I've Learned. Close
          </button>
        </div>
      </div>
    </div>
  )
}

const App = () => {
  const [activeTab, setActiveTab] = useState('home')
  const [isAutopsyOpen, setIsAutopsyOpen] = useState(false)
  const [lastTrade, setLastTrade] = useState(null)
  
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

  const handleTradeExecuted = (trade) => {
    setLastTrade(trade)
    setTimeout(() => {
      setIsAutopsyOpen(true)
    }, 500) // Rule #01: Slide up within 2s
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-ai/30 selection:text-white">
      {/* Top Header */}
      <div className="h-16 flex items-center justify-between px-6 sticky top-0 bg-black/70 backdrop-blur-2xl z-40 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-ai rounded-xl flex items-center justify-center shadow-lg shadow-ai/20 transform rotate-6 hover:rotate-0 transition-transform cursor-pointer">
            <TrendingUp size={16} className="text-black stroke-[3px]" />
          </div>
          <span className="font-black text-base tracking-tighter uppercase italic">Trade<span className="text-ai">Lab</span></span>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Quick Stats */}
           <div className="hidden sm:flex flex-col items-end">
             <span className="text-[10px] text-tertiary font-black uppercase tracking-widest">Available</span>
             <span className="text-xs font-bold font-mono">₹{user.cash.toLocaleString()}</span>
           </div>
           <div className="w-10 h-10 rounded-2xl bg-secondary border border-white/5 flex items-center justify-center overflow-hidden hover:border-ai/50 transition-colors cursor-pointer group">
            <div className="text-xs font-black text-secondary group-hover:text-primary transition-colors">P</div>
          </div>
        </div>
      </div>

      <main className="pb-32 bg-gradient-to-b from-black via-black to-bg-secondary/20">
        {activeTab === 'home' && <Dashboard user={user} />}
        {activeTab === 'trade' && <Trade onTradeExecuted={handleTradeExecuted} />}
        {activeTab === 'group' && <Groups />}
        {activeTab === 'rank' && <Rank />}
      </main>

      <AutopsySheet 
        trade={lastTrade} 
        isOpen={isAutopsyOpen} 
        onClose={() => setIsAutopsyOpen(false)} 
      />

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Global Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-ai/5 blur-[120px] rounded-full" />
         <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[35%] bg-profit/5 blur-[100px] rounded-full" />
      </div>
    </div>
  )
}

export default App
