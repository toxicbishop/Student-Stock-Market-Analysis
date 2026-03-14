import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Search, 
  ArrowLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react'
import { cn } from '../lib/utils'
import { stockService } from '../services/api'

const RSIGauge = ({ value }) => {
  const getStatus = (v) => {
    if (v < 50) return { label: 'Good Entry', color: 'text-profit', bg: 'bg-profit' }
    if (v < 70) return { label: 'Neutral', color: 'text-warning', bg: 'bg-warning' }
    return { label: 'Caution', color: 'text-loss', bg: 'bg-loss' }
  }

  const status = getStatus(value)

  return (
    <div className="bg-secondary/50 border border-secondary p-5 rounded-3xl mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 uppercase tracking-tighter", status.color)}>
            {status.label}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-tertiary uppercase font-bold tracking-widest">RSI Index</span>
          <div className="font-bold text-lg">{value}</div>
        </div>
      </div>
      
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
        <div className="absolute inset-0 flex">
            <div className="h-full w-1/2 bg-profit/40" />
            <div className="h-full w-[20%] bg-warning/40" />
            <div className="h-full w-[30%] bg-loss/40" />
        </div>
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000"
          style={{ left: `${value}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-[9px] text-tertiary font-medium uppercase tracking-tighter">
        <span>0 - Oversold</span>
        <span>50 - Pivot</span>
        <span>100 - Overbought</span>
      </div>
    </div>
  )
}

const Trade = ({ onTradeExecuted }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedStock, setSelectedStock] = useState(null)
  const [stockData, setStockData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (query.length > 1) {
      const fetchResults = async () => {
        try {
          const res = await stockService.searchStocks(query)
          setResults(res.data)
        } catch (e) {
          console.error(e)
        }
      }
      const timer = setTimeout(fetchResults, 300)
      return () => clearTimeout(timer)
    } else {
      setResults([])
    }
  }, [query])

  const selectStock = async (ticker) => {
    setIsLoading(true)
    setSelectedStock(ticker)
    try {
      const res = await stockService.getQuote(ticker)
      setStockData(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuy = () => {
    // Simulate trade execution
    const tradeResult = {
      ticker: selectedStock,
      action: 'BUY',
      qty: qty,
      score: stockData.rsi > 70 ? 45 : 85,
      rsi: stockData.rsi
    }
    onTradeExecuted(tradeResult)
  }

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto h-[60vh] flex-center">
        <div className="w-12 h-12 border-4 border-ai/20 border-t-ai rounded-full animate-spin" />
      </div>
    )
  }

  if (selectedStock && stockData) {
    return (
      <div className="max-w-md mx-auto pt-6 px-6 pb-24 animate-in fade-in zoom-in-95 duration-300">
        <button 
          onClick={() => setSelectedStock(null)}
          className="flex items-center gap-2 text-tertiary mb-6 hover:text-primary transition-colors"
        >
          <ArrowLeft size={18} /> <span className="text-xs font-bold uppercase tracking-wider">Back</span>
        </button>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter uppercase">{stockData.ticker}</h1>
            <p className="text-tertiary text-xs">{stockData.name}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold tracking-tight">₹{stockData.price.toLocaleString()}</h2>
            <p className={cn("text-xs font-bold", stockData.change >= 0 ? "text-profit" : "text-loss")}>
              {stockData.change >= 0 ? '+' : ''}{stockData.change} ({stockData.change_pct}%)
            </p>
          </div>
        </div>

        {/* Basic Chart Simulation */}
        <div className="h-40 w-full bg-black/40 border border-primary rounded-3xl mb-8 flex items-end p-4 gap-1">
            {[40, 60, 45, 70, 85, 65, 90, 80, 75, 95].map((h, i) => (
                <div key={i} className="flex-1 bg-profit/40 rounded-t-sm" style={{ height: `${h}%` }} />
            ))}
        </div>

        <RSIGauge value={stockData.rsi} />

        <div className="space-y-6">
          <div className="flex justify-between items-center py-4 border-b border-primary">
            <span className="text-tertiary text-xs font-bold uppercase tracking-wider">Quantity</span>
            <div className="flex items-center gap-4">
              <button onClick={() => setQty(m => Math.max(1, m-1))} className="w-8 h-8 rounded-full border border-primary flex-center text-secondary">-</button>
              <span className="font-bold w-4 text-center">{qty}</span>
              <button onClick={() => setQty(m => m+1)} className="w-8 h-8 rounded-full border border-primary flex-center text-secondary">+</button>
            </div>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-tertiary text-xs font-bold uppercase tracking-wider">Total Est.</span>
            <span className="font-bold text-xl tracking-tight">₹{(stockData.price * qty).toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button 
              onClick={handleBuy}
              className="bg-profit text-white font-bold py-4 rounded-2xl active:scale-95 transition-all shadow-lg shadow-profit/20"
            >
              Buy
            </button>
            <button className="bg-secondary text-primary font-bold py-4 rounded-2xl border border-primary active:scale-95 transition-all">
              Sell
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto pt-10 px-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold mb-6 tracking-tight">Search Markets</h2>
      
      <div className="relative mb-8 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary group-focus-within:text-ai transition-colors" size={20} />
        <input 
          autoFocus
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="RELIANCE, TCS, INFY..."
          className="w-full bg-secondary/50 border border-primary rounded-2xl py-5 pl-12 pr-4 outline-none focus:border-ai/50 focus:bg-secondary transition-all"
        />
      </div>

      <div className="space-y-2">
        {results.map((stock) => (
          <button 
            key={stock.ticker}
            onClick={() => selectStock(stock.ticker)}
            className="w-full flex items-center justify-between p-5 bg-secondary/30 rounded-2xl border border-transparent hover:border-primary hover:bg-secondary/50 active:scale-[0.98] transition-all text-left"
          >
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center border border-primary font-bold">
                 {stock.ticker.slice(0, 1)}
               </div>
               <div>
                 <div className="font-bold">{stock.ticker}</div>
                 <div className="text-[10px] text-tertiary">{stock.name}</div>
               </div>
            </div>
            <ChevronRight size={18} className="text-tertiary" />
          </button>
        ))}

        {query.length > 0 && results.length === 0 && (
           <p className="text-center text-tertiary text-xs py-8 italic italic">No stocks found matching "{query}"</p>
        )}

        {query.length === 0 && (
          <div className="pt-12 text-center">
            <div className="inline-flex gap-2 p-4 bg-warning/10 rounded-2xl border border-warning/20 mb-6">
              <ShieldAlert size={20} className="text-warning" />
              <p className="text-xs text-warning leading-relaxed font-medium">Remember: AI Autopsy is watching your entries.<br/>Don't buy at the peak.</p>
            </div>
            <p className="text-xs text-tertiary font-medium uppercase tracking-widest opacity-50">Trending Today</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Trade
