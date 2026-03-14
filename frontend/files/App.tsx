import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { UserProvider, useUser } from './UserContext'
import { BottomNav } from './components/BottomNav'
import { Dashboard }   from './pages/Dashboard'
import { Trade }       from './pages/Trade'
import { Group }       from './pages/Group'
import { Leaderboard } from './pages/Leaderboard'
import { api } from './api'

function Onboarding({ onDone }: { onDone: (name: string) => void }) {
  const [name, setName]       = useState('')
  const [college, setCollege] = useState('')
  const [loading, setLoading] = useState(false)

  async function start() {
    if (!name.trim()) return
    setLoading(true)
    // Seed demo users so portfolio exists
    await api.demo.seed().catch(() => {})
    setLoading(false)
    onDone(name.trim())
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-brand/20 border border-brand/30
                          flex items-center justify-center mx-auto">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <polyline points="4,24 12,14 18,18 28,8"
                stroke="#7F77DD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="22,8 28,8 28,14"
                stroke="#7F77DD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">TradeLab</h1>
            <p className="text-muted text-sm mt-1">Learn to invest. Risk-free.</p>
          </div>
        </div>

        {/* Perks */}
        <div className="space-y-2">
          {[
            ['₹10,000', 'virtual cash to start with'],
            ['AI Mentor', 'explains every trade you make'],
            ['Group Mode', 'invest with your friends'],
          ].map(([bold, rest]) => (
            <div key={bold} className="flex items-center gap-3 px-4 py-3 bg-card rounded-xl border border-border">
              <div className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
              <p className="text-sm">
                <span className="font-semibold text-white">{bold}</span>
                {' '}<span className="text-muted">{rest}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="space-y-3">
          <input
            className="input"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && start()}
          />
          <input
            className="input"
            placeholder="College (optional)"
            value={college}
            onChange={e => setCollege(e.target.value)}
          />
          <button className="btn-primary" onClick={start} disabled={loading || !name.trim()}>
            {loading ? 'Setting up...' : 'Start Trading →'}
          </button>
        </div>

        <p className="text-center text-xs text-muted">
          No real money. No risk. Pure learning.
        </p>
      </div>
    </div>
  )
}

function AppInner() {
  const { setUser } = useUser()
  const [ready, setReady] = useState(!!localStorage.getItem('tl_user'))

  useEffect(() => {
    const saved = localStorage.getItem('tl_user')
    if (saved) {
      const { name } = JSON.parse(saved)
      setUser('demo-user-1', name)
    }
  }, [])

  function handleOnboard(name: string) {
    localStorage.setItem('tl_user', JSON.stringify({ name }))
    setUser('demo-user-1', name)
    setReady(true)
  }

  if (!ready) return <Onboarding onDone={handleOnboard} />

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Routes>
          <Route path="/"            element={<Dashboard />} />
          <Route path="/trade"       element={<Trade />} />
          <Route path="/group"       element={<Group />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <UserProvider>
      <AppInner />
    </UserProvider>
  )
}
