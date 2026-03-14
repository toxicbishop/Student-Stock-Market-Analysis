import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, PortfolioOut } from '../api'
import { useUser } from '../UserContext'
import { Wallet, PieChart, TrendingUp, BarChart2, ArrowRight } from 'lucide-react'

export function Dashboard() {
  const { userId } = useUser()
  const navigate = useNavigate()
  const [portfolio, setPortfolio] = useState<PortfolioOut | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    api.portfolio.get(userId)
      .then(setPortfolio)
      .catch(() => setError('Could not load portfolio.'))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return (
    <div className="flex-1 px-6 md:px-12 pb-12 w-full max-w-6xl mx-auto flex flex-col gap-8 animate-pulse">
      <div className="h-24 bg-surface-subtle rounded-3xl w-1/2" />
      <div className="h-[240px] bg-border-subtle rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-40 bg-surface-subtle rounded-3xl" />
        <div className="h-40 bg-surface-subtle rounded-3xl" />
      </div>
    </div>
  )

  const totalValue = portfolio ? portfolio.virtual_cash + portfolio.total_current_value : 0
  const pnlCount = portfolio ? portfolio.total_pnl : 0
  const pnlPct = portfolio ? portfolio.total_pnl_pct : 0

  return (
    <div className="flex-1 px-6 md:px-12 pb-24 w-full max-w-6xl mx-auto flex flex-col gap-8 animate-fade-in">
      {/* Hero Section */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-text-muted font-semibold tracking-wide uppercase text-[11px]">Total Portfolio Value</p>
          <div className="flex items-baseline gap-4 flex-wrap">
            <h1 className="text-[48px] font-extrabold tracking-tight text-text-main leading-none">
              ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h1>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm ${
              pnlCount >= 0 ? 'bg-primary/10 text-primary' : 'bg-loss/10 text-loss'
            }`}>
              <TrendingUp size={16} />
              <span>{pnlCount >= 0 ? '+' : ''}₹{Math.abs(pnlCount).toLocaleString('en-IN')} ({pnlPct.toFixed(2)}%)</span>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-[240px] w-full chart-container mt-4 cursor-crosshair">
          <div className="scrubber-line" style={{ left: '65%' }}></div>
          <div className="data-point" style={{ left: '65%', top: '30%' }}></div>
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 240">
            <defs>
              <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#10c16c" stopOpacity="0.15"></stop>
                <stop offset="100%" stopColor="#10c16c" stopOpacity="0"></stop>
              </linearGradient>
            </defs>
            <path d="M0,240 L0,180 C100,180 150,140 250,160 C350,180 400,100 500,120 C600,140 700,60 800,80 L800,240 Z" fill="url(#chart-fill)"></path>
            <path d="M0,180 C100,180 150,140 250,160 C350,180 400,100 500,120 C600,140 700,60 800,80" fill="none" stroke="#10c16c" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" className="drop-shadow-lg"></path>
            <line stroke="#E2E8F0" strokeDasharray="6 6" strokeWidth="1" x1="0" x2="800" y1="180" y2="180"></line>
          </svg>
        </div>

        {/* Timeframes */}
        <div className="flex items-center gap-1 border-b border-border-subtle pb-4">
          {['1D', '1W', '1M', '3M', 'ALL'].map(tf => (
            <button 
              key={tf}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                tf === 'ALL' ? 'bg-text-main text-white shadow-md' : 'text-text-muted hover:bg-black/5'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </section>

      {/* Balances Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface rounded-3xl p-8 shadow-card flex flex-col justify-between min-h-[160px] group hover:shadow-soft-hover transition-all">
          <div className="flex items-center gap-4 text-text-muted mb-4 font-bold">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Wallet size={24} />
            </div>
            <span className="text-lg">Buying Power</span>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-text-main">
              ₹{portfolio?.virtual_cash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h3>
            <p className="text-sm text-text-muted mt-2 font-medium">Available to trade instantly</p>
          </div>
        </div>

        <div className="bg-surface rounded-3xl p-8 shadow-card flex flex-col justify-between min-h-[160px] group hover:shadow-soft-hover transition-all border-none">
          <div className="flex items-center gap-4 text-text-muted mb-4 font-bold">
            <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue">
              <PieChart size={24} />
            </div>
            <span className="text-lg">Invested Value</span>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-text-main">
              ₹{portfolio?.total_current_value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h3>
            <p className="text-sm text-text-muted mt-2 font-medium">Market value of all holdings</p>
          </div>
        </div>
      </section>

      {/* Holdings Section */}
      <section className="mt-4 flex flex-col gap-6">
        <h3 className="text-2xl font-extrabold text-text-main">Your Holdings</h3>
        
        {portfolio?.holdings.length === 0 ? (
          <div className="bg-surface rounded-3xl p-12 shadow-card flex flex-col items-center justify-center text-center border border-border-subtle">
            <div className="w-20 h-20 bg-background-light rounded-full flex items-center justify-center mb-6 text-text-muted">
              <BarChart2 size={40} />
            </div>
            <h4 className="text-2xl font-bold text-text-main mb-3">No holdings yet</h4>
            <p className="text-text-muted text-lg max-w-md mx-auto mb-8 font-medium italic">
              "Every billionaire started with a single trade." - AI Mentor
            </p>
            <button 
              onClick={() => navigate('/trade')}
              className="bg-primary hover:bg-primary/90 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              <span>Start Trading</span>
              <ArrowRight size={20} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolio?.holdings.map(h => (
              <div 
                key={h.ticker}
                onClick={() => navigate(`/trade?ticker=${h.ticker}`)}
                className="bg-surface p-6 rounded-xl shadow-soft hover:shadow-soft-hover cursor-pointer border border-transparent hover:border-primary/20 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-subtle rounded-2xl flex items-center justify-center font-bold text-lg text-text-main">
                    {h.ticker[0]}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lg text-text-main">{h.ticker}</h4>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-wider">{h.quantity} Shares</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-lg text-text-main">₹{(h.current_price * h.quantity).toLocaleString()}</p>
                  <p className={`text-sm font-bold flex items-center justify-end gap-1 ${h.pnl >= 0 ? 'text-primary' : 'text-loss'}`}>
                    <TrendingUp size={14} className={h.pnl < 0 ? 'rotate-180' : ''} />
                    {h.pnl_pct.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
