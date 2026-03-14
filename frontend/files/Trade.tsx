import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, StockQuote, AutopsyResponse } from '../api'
import { RSIGauge } from '../components/RSIGauge'
import { AutopsySheet } from '../components/AutopsySheet'
import { useUser } from '../UserContext'
import clsx from 'clsx'

export function Trade() {
  const { userId } = useUser()
  const [params]   = useSearchParams()

  const [query,    setQuery]   = useState(params.get('ticker') ?? '')
  const [results,  setResults] = useState<{ ticker: string; name: string }[]>([])
  const [quote,    setQuote]   = useState<StockQuote | null>(null)
  const [qty,      setQty]     = useState(1)
  const [action,   setAction]  = useState<'BUY' | 'SELL'>('BUY')
  const [loading,  setLoading] = useState(false)
  const [quoteLoading, setQL]  = useState(false)
  const [error,    setError]   = useState<string | null>(null)
  const [autopsy,  setAutopsy] = useState<AutopsyResponse | null>(null)
  const [tradedTicker, setTradedTicker] = useState('')

  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Auto-load if ticker in URL
  useEffect(() => {
    const t = params.get('ticker')
    if (t) loadQuote(t)
  }, [])

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
    } catch {
      setError(`Could not load ${ticker}. Try RELIANCE, TCS, or INFY.`)
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
      // Trigger AI Autopsy
      const ap = await api.ai.autopsy({
        ticker:        quote.ticker,
        action,
        entry_price:   quote.price,
        current_price: quote.price,
        rsi:           quote.rsi ?? 50,
        volume_trend:  quote.volume_trend ?? 'unknown',
        quantity:      qty,
      })
      setTradedTicker(quote.ticker)
      setAutopsy(ap)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Trade failed')
    } finally {
      setLoading(false)
    }
  }

  const totalCost = quote ? (quote.price * qty).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '—'

  return (
    <div className="px-4 pt-12 pb-28 space-y-4 animate-fade-in">
      <h1 className="text-2xl font-semibold">Trade</h1>

      {/* Search */}
      <div className="relative">
        <input
          className="input pr-10"
          placeholder="Search NSE stocks... (e.g. RELIANCE)"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && query && loadQuote(query)}
        />
        {quoteLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2
                          w-4 h-4 border-2 border-brand border-t-transparent
                          rounded-full animate-spin" />
        )}
        {/* Dropdown */}
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border
                          rounded-xl overflow-hidden z-20 shadow-xl">
            {results.map(r => (
              <button
                key={r.ticker}
                onClick={() => loadQuote(r.ticker)}
                className="w-full px-4 py-3 text-left flex items-center justify-between
                           hover:bg-surface transition-colors border-b border-border last:border-0"
              >
                <span className="font-mono font-medium text-sm">{r.ticker}</span>
                <span className="text-xs text-muted">{r.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-loss/30 bg-loss/5 px-4 py-3">
          <p className="text-loss text-sm">{error}</p>
        </div>
      )}

      {/* Quote card */}
      {quote && (
        <div className="space-y-3 animate-fade-in">
          <div className="card space-y-4">
            {/* Price header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono font-bold text-xl">{quote.ticker}</p>
                <p className="text-xs text-muted mt-0.5">{quote.name}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-2xl font-semibold">₹{quote.price.toFixed(2)}</p>
                <p className={clsx(
                  'text-sm font-mono mt-0.5',
                  quote.change >= 0 ? 'text-profit' : 'text-loss'
                )}>
                  {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.change_pct.toFixed(2)}%)
                </p>
              </div>
            </div>

            {/* RSI Gauge */}
            <RSIGauge rsi={quote.rsi} />

            {/* 52W range */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-surface rounded-xl p-3">
                <p className="label-xs mb-1">52W Low</p>
                <p className="font-mono text-sm font-medium">₹{quote.low_52w.toFixed(2)}</p>
              </div>
              <div className="bg-surface rounded-xl p-3">
                <p className="label-xs mb-1">52W High</p>
                <p className="font-mono text-sm font-medium">₹{quote.high_52w.toFixed(2)}</p>
              </div>
            </div>

            {/* Volume trend */}
            {quote.volume_trend && (
              <div className="flex items-center gap-2">
                <span className="label-xs">Volume trend</span>
                <span className={clsx(
                  'text-xs px-2 py-0.5 rounded-full font-mono',
                  quote.volume_trend === 'up'
                    ? 'bg-profit/10 text-profit'
                    : 'bg-loss/10 text-loss'
                )}>
                  {quote.volume_trend === 'up' ? 'Rising' : 'Falling'}
                </span>
              </div>
            )}
          </div>

          {/* Trade controls */}
          <div className="card space-y-4">
            {/* Buy / Sell toggle */}
            <div className="flex gap-2 p-1 bg-surface rounded-xl">
              <button
                onClick={() => setAction('BUY')}
                className={clsx('tab-pill', action === 'BUY' && 'active')}
              >
                Buy
              </button>
              <button
                onClick={() => setAction('SELL')}
                className={clsx(
                  'tab-pill',
                  action === 'SELL' && '!bg-loss/20 !text-loss'
                )}
              >
                Sell
              </button>
            </div>

            {/* Quantity */}
            <div>
              <p className="label-xs mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 bg-surface border border-border rounded-xl
                             text-lg font-medium hover:border-brand transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="input text-center w-20 flex-none"
                />
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-10 h-10 bg-surface border border-border rounded-xl
                             text-lg font-medium hover:border-brand transition-colors"
                >
                  +
                </button>
                <div className="flex-1 text-right">
                  <p className="label-xs">Total</p>
                  <p className="font-mono font-semibold text-base">₹{totalCost}</p>
                </div>
              </div>
            </div>

            {/* RSI warning before buy */}
            {action === 'BUY' && quote.rsi && quote.rsi > 70 && (
              <div className="rounded-xl border border-warning/30 bg-warning/5 px-4 py-3">
                <p className="text-warning text-xs font-medium">
                  RSI {quote.rsi.toFixed(0)} — Overbought zone. High risk entry.
                </p>
              </div>
            )}

            {/* Execute button */}
            <button
              className={action === 'BUY' ? 'btn-primary' : 'btn-danger'}
              onClick={executeTrade}
              disabled={loading}
            >
              {loading
                ? 'Executing...'
                : `${action} ${qty} share${qty > 1 ? 's' : ''} · ₹${totalCost}`}
            </button>
          </div>
        </div>
      )}

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
