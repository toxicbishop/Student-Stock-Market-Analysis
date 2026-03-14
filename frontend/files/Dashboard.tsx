import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, PortfolioOut } from '../api'
import { useUser } from '../UserContext'
import clsx from 'clsx'

export function Dashboard() {
  const { userId, userName } = useUser()
  const navigate = useNavigate()
  const [portfolio, setPortfolio] = useState<PortfolioOut | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    api.portfolio.get(userId)
      .then(setPortfolio)
      .catch(() => setError('Could not load portfolio. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [userId])

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="px-4 pt-12 pb-28 space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <p className="label-xs mb-1">{greeting}</p>
        <h1 className="text-2xl font-semibold">{userName}</h1>
      </div>

      {/* Total portfolio card */}
      {loading ? (
        <div className="card h-32 animate-pulse" />
      ) : error ? (
        <div className="card border-loss/30 bg-loss/5 text-center py-8">
          <p className="text-loss text-sm">{error}</p>
          <p className="text-muted text-xs mt-1">Start with <code className="font-mono">docker compose up</code></p>
        </div>
      ) : portfolio ? (
        <>
          <div className="card relative overflow-hidden scanlines">
            <p className="label-xs mb-2">Portfolio value</p>
            <p className="text-4xl font-mono font-semibold tracking-tight">
              ₹{(portfolio.virtual_cash + portfolio.total_current_value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className={clsx(
                'text-sm font-mono font-medium',
                portfolio.total_pnl >= 0 ? 'text-profit' : 'text-loss'
              )}>
                {portfolio.total_pnl >= 0 ? '+' : ''}₹{portfolio.total_pnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              <span className={clsx(
                'text-xs px-2 py-0.5 rounded-full font-mono',
                portfolio.total_pnl_pct >= 0
                  ? 'bg-profit/10 text-profit'
                  : 'bg-loss/10 text-loss'
              )}>
                {portfolio.total_pnl_pct >= 0 ? '+' : ''}{portfolio.total_pnl_pct.toFixed(2)}%
              </span>
            </div>
            {/* decorative chart line */}
            <svg className="absolute bottom-0 right-0 opacity-10" width="120" height="50" viewBox="0 0 120 50">
              <polyline points="0,40 20,30 40,35 60,15 80,20 100,10 120,5"
                fill="none" stroke="#7F77DD" strokeWidth="2" />
            </svg>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card-sm">
              <p className="label-xs mb-1">Cash</p>
              <p className="font-mono font-medium text-base">
                ₹{portfolio.virtual_cash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="card-sm">
              <p className="label-xs mb-1">Invested</p>
              <p className="font-mono font-medium text-base">
                ₹{portfolio.total_invested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Holdings */}
          <div>
            <p className="label-xs mb-3">Your holdings</p>
            {portfolio.holdings.length === 0 ? (
              <div className="card text-center py-8 border-dashed">
                <p className="text-muted text-sm">No holdings yet</p>
                <p className="text-xs text-muted mt-1">Search any NSE stock to make your first trade</p>
                <button
                  className="mt-4 px-5 py-2 bg-brand/10 text-brand text-sm rounded-xl border border-brand/20"
                  onClick={() => navigate('/trade')}
                >
                  Start trading
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {portfolio.holdings.map(h => (
                  <button
                    key={h.ticker}
                    onClick={() => navigate(`/trade?ticker=${h.ticker}`)}
                    className="card w-full text-left flex items-center justify-between
                               hover:border-brand/40 transition-colors active:scale-[0.98]"
                  >
                    <div>
                      <p className="font-mono font-semibold">{h.ticker}</p>
                      <p className="text-xs text-muted mt-0.5">{h.quantity} shares · avg ₹{h.avg_buy_price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-medium">₹{(h.current_price * h.quantity).toFixed(0)}</p>
                      <p className={clsx('text-xs font-mono', h.pnl >= 0 ? 'text-profit' : 'text-loss')}>
                        {h.pnl >= 0 ? '+' : ''}{h.pnl_pct.toFixed(2)}%
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
