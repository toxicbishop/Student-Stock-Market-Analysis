import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, StockQuote, AutopsyResponse } from '../api'
import { RSIGauge } from '../components/RSIGauge'
import { AutopsySheet } from '../components/AutopsySheet'
import { useUser } from '../UserContext'
import { Search, X, TrendingUp, TrendingDown, ArrowRight, Loader2 } from 'lucide-react'
import clsx from 'clsx'

const TRENDING_TICKERS = ['RELIANCE', 'TATAMOTORS', 'HDFCBANK', 'INFY', 'TCS', 'ICICIBANK', 'ITC', 'SBIN', 'BHARTIARTL']

export function Trade() {
  const { userId } = useUser()
  const [params]   = useSearchParams()

  const [query,    setQuery]   = useState(params.get('ticker') ?? '')
  const [results,  setResults] = useState<{ ticker: string; name: string }[]>([])
  const [quote,    setQuote]   = useState<StockQuote | null>(null)
  const [qty,      setQty]     = useState(1)
  const [amount,   setAmount]  = useState<string>('')
  const [action,   setAction]  = useState<'BUY' | 'SELL'>('BUY')
  const [loading,  setLoading] = useState(false)
  const [quoteLoading, setQL]  = useState(false)
  const [error,    setError]   = useState<string | null>(null)
  const [autopsy,  setAutopsy] = useState<AutopsyResponse | null>(null)
  const [tradedTicker, setTradedTicker] = useState('')
  const [trending, setTrending] = useState<StockQuote[]>([])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const t = params.get('ticker')
    if (t) loadQuote(t)
    loadTrending()
  }, [])

  async function loadTrending() {
    try {
      const quotes = await Promise.all(TRENDING_TICKERS.map(t => api.stocks.quote(t).catch(() => null)))
      setTrending(quotes.filter(q => q !== null) as StockQuote[])
    } catch {}
  }

  function handleSearch(val: string) {
    setQuery(val)
    clearTimeout(debounceRef.current)
    if (!val.trim()) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      const res = await api.stocks.search(val)
      setResults(res)
    }, 250)
  }

  async function loadQuote(ticker: string) {
    setQL(true)
    setResults([])
    setQuery(ticker)
    setError(null)
    try {
      const q = await api.stocks.quote(ticker)
      setQuote(q)
      setAmount(q.price.toFixed(0))
      setQty(1)
    } catch {
      setError(`Could not load ${ticker}.`)
      setQuote(null)
    } finally {
      setQL(false)
    }
  }

  async function executeTrade() {
    if (!quote) return
    setLoading(true)
    setError(null)
    try {
      if (action === 'BUY') {
        await api.portfolio.buy(userId, quote.ticker, qty)
      } else {
        await api.portfolio.sell(userId, quote.ticker, qty)
      }
      const ap = await api.ai.autopsy({
        ticker: quote.ticker, action, entry_price: quote.price,
        current_price: quote.price, rsi: quote.rsi ?? 50,
        volume_trend: quote.volume_trend ?? 'unknown', quantity: qty,
      })
      setTradedTicker(quote.ticker)
      setAutopsy(ap)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Trade failed')
    } finally {
      setLoading(false)
    }
  }

  const handleAmountChange = (val: string) => {
    setAmount(val)
    if (quote) {
      const calculatedQty = Math.max(1, Math.floor(Number(val) / quote.price))
      setQty(calculatedQty)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background-light animate-fade-in relative transition-all">
      {/* Search Header */}
      <header className="pt-8 px-6 md:px-12 pb-4 flex justify-center z-10 w-full max-w-6xl mx-auto">
        <div className="w-full max-w-[800px] relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
            <Search size={24} />
          </div>
          <input 
            className="w-full h-[64px] pl-14 pr-6 bg-surface border-none rounded-2xl shadow-soft text-text-main text-xl font-medium placeholder:text-text-muted/60 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all"
            placeholder="Search NSE stocks... (e.g. RELIANCE)"
            value={query}
            onChange={e => handleSearch(e.target.value)}
          />
          {quoteLoading && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-primary animate-spin">
              <Loader2 size={24} />
            </div>
          )}
          
          {/* Dropdown Results */}
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-surface border border-border rounded-xl overflow-hidden z-60 shadow-2xl animate-fade-in">
              {results.map(r => (
                <button
                  key={r.ticker}
                  onClick={() => loadQuote(r.ticker)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-background-light transition-colors border-b border-border-subtle last:border-0"
                >
                  <div className="flex items-center gap-4">
                     <span className="font-extrabold text-lg text-text-main">{r.ticker}</span>
                     <span className="text-sm text-text-muted font-medium">{r.name}</span>
                  </div>
                  <ArrowRight size={18} className="text-primary opacity-0 group-hover/btn:opacity-100" />
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Grid Content */}
      <div className={clsx(
        "flex-1 overflow-y-auto px-6 md:px-12 pb-24 transition-all duration-300",
        quote ? "pr-[400px] md:pr-[450px]" : ""
      )}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[32px] font-extrabold text-text-main tracking-tight mb-8 mt-4">Trending Today</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trending.map(s => (
              <div 
                key={s.ticker}
                onClick={() => loadQuote(s.ticker)}
                className={clsx(
                  "bg-surface p-6 rounded-xl shadow-soft hover:shadow-soft-hover cursor-pointer border transition-all relative overflow-hidden group",
                  quote?.ticker === s.ticker ? "border-primary shadow-soft-hover" : "border-transparent"
                )}
              >
                {quote?.ticker === s.ticker && <div className="absolute inset-0 bg-primary/5 pointer-events-none" />}
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <h3 className="text-xl font-extrabold text-text-main group-hover:text-primary transition-colors">{s.ticker}</h3>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">{s.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-text-main">₹{s.price.toFixed(2)}</p>
                    <p className={clsx(
                      "text-sm font-bold flex items-center justify-end gap-0.5 mt-1",
                      s.change >= 0 ? "text-primary" : "text-loss"
                    )}>
                      {s.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {Math.abs(s.change_pct).toFixed(2)}%
                    </p>
                  </div>
                </div>
                {/* Sparkline simulation */}
                <div className="h-10 w-full flex items-end relative z-10 opacity-30 group-hover:opacity-100 transition-opacity">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 30">
                    <path 
                      className={s.change >= 0 ? "text-primary" : "text-loss"} 
                      d={s.change >= 0 
                        ? "M0,25 Q10,15 20,20 T40,10 T60,18 T80,5 T100,2" 
                        : "M0,5 Q20,10 40,5 T70,20 T100,25"} 
                      fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide-Out Order Panel */}
      <aside className={clsx(
        "fixed top-0 right-0 w-[400px] h-full bg-surface shadow-panel z-50 flex flex-col border-l border-border transition-transform duration-300 ease-spring",
        quote ? "translate-x-0" : "translate-x-full"
      )}>
        {quote && (
          <>
            <div className="px-8 py-8 flex justify-between items-center bg-border-subtle/50 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-extrabold text-xl">
                  {quote.ticker[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-text-main tracking-tight">{quote.ticker}</h2>
                  <p className="text-sm text-text-muted font-bold tracking-wide uppercase">₹{quote.price.toFixed(2)} / Share</p>
                </div>
              </div>
              <button 
                onClick={() => setQuote(null)}
                className="text-text-muted hover:text-text-main transition-colors p-2 rounded-full hover:bg-background-light shadow-sm"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 px-8 py-10 flex flex-col overflow-y-auto">
              <RSIGauge rsi={quote.rsi} />
              
              <div className="flex bg-background-light p-1 rounded-2xl mb-10 mt-8">
                <button 
                  onClick={() => setAction('BUY')}
                  className={clsx(
                    "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                    action === 'BUY' ? "bg-surface text-text-main shadow-md" : "text-text-muted hover:text-text-main"
                  )}
                >
                  Buy
                </button>
                <button 
                  onClick={() => setAction('SELL')}
                  className={clsx(
                    "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                    action === 'SELL' ? "bg-loss/10 text-loss" : "text-text-muted hover:text-text-main"
                  )}
                >
                  Sell
                </button>
              </div>

              <div className="flex-1 flex flex-col justify-center items-center mb-12">
                <label className="text-text-muted text-xs font-bold uppercase tracking-widest mb-6">Invest Amount</label>
                <div className="flex items-center justify-center w-full">
                  <span className="text-[48px] font-extrabold text-text-muted/30 mr-2">₹</span>
                  <input 
                    className="text-[56px] font-extrabold text-text-main bg-transparent border-none focus:ring-0 text-center w-full p-0 placeholder:text-text-muted/20"
                    placeholder="0"
                    type="number"
                    value={amount}
                    onChange={e => handleAmountChange(e.target.value)}
                  />
                </div>
                <div className="mt-8 flex gap-3 flex-wrap justify-center">
                  {[500, 1000, 5000].map(v => (
                    <button 
                      key={v}
                      onClick={() => handleAmountChange(v.toString())}
                      className="px-5 py-2 rounded-full border border-border text-sm font-bold text-text-main hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all shadow-sm"
                    >
                      + ₹{v.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-border-subtle flex flex-col gap-6">
                <div className="bg-border-subtle rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted font-medium">Estimated Shares</span>
                    <span className="font-extrabold text-text-main">{qty} Unit{qty > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted font-medium">Order Subtotal</span>
                    <span className="font-extrabold text-text-main">₹{(quote.price * qty).toLocaleString()}</span>
                  </div>
                </div>

                <button 
                  onClick={executeTrade}
                  disabled={loading}
                  className={clsx(
                    "w-full h-[64px] rounded-full font-extrabold text-lg shadow-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98]",
                    action === 'BUY' 
                      ? "bg-primary text-white shadow-primary/30" 
                      : "bg-loss text-white shadow-loss/30"
                  )}
                >
                  {loading ? <Loader2 className="animate-spin" /> : (
                    <>
                      <span>{action} {quote.ticker}</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Autopsy sheet */}
      <AutopsySheet
        autopsy={autopsy}
        ticker={tradedTicker}
        action={action}
        onClose={() => setAutopsy(null)}
      />
    </div>
  )
}
