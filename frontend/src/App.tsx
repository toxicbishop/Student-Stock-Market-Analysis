import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { UserProvider, useUser } from './UserContext'
import { Sidebar } from './components/Sidebar'
import { Dashboard }   from './pages/Dashboard'
import { Trade }       from './pages/Trade'
import { Group }       from './pages/Group'
import { Leaderboard } from './pages/Leaderboard'
import { api } from './api'
import { Menu, LogOut, Home, TrendingUp, Users, Trophy } from 'lucide-react'

function MobileNav() {
  const location = useLocation()
  const navItems = [
    { label: 'Home',  path: '/',            icon: Home },
    { label: 'Trade', path: '/trade',       icon: TrendingUp },
    { label: 'Group', path: '/group',       icon: Users },
    { label: 'Rank',  path: '/leaderboard', icon: Trophy },
  ]

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[400px] h-[72px] bg-surface/90 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl z-50 flex items-center justify-around px-4">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path
        const Icon = item.icon
        return (
          <Link 
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-all ${
              isActive ? 'text-primary scale-110' : 'text-text-muted opacity-60'
            }`}
          >
            <Icon size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}

function Onboarding({ onDone }: { onDone: (name: string) => void }) {
  const [name, setName]       = useState('')
  const [college, setCollege] = useState('')
  const [loading, setLoading] = useState(false)

  async function start() {
    if (!name.trim()) return
    setLoading(true)
    await api.demo.seed().catch(() => {})
    setLoading(false)
    onDone(name.trim())
  }

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center mx-auto text-white text-3xl font-bold">
            T
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text-main">TradeLab</h1>
            <p className="text-text-muted text-sm mt-1">Smart investing for students.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">Your Details</label>
            <input
              className="w-full h-[56px] px-4 bg-surface border-none rounded-xl shadow-soft focus:ring-2 focus:ring-primary/20 transition-all text-text-main placeholder:text-text-muted"
              placeholder="Display Name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && start()}
            />
            <input
              className="w-full h-[56px] px-4 bg-surface border-none rounded-xl shadow-soft focus:ring-2 focus:ring-primary/20 transition-all text-text-main placeholder:text-text-muted"
              placeholder="College Name"
              value={college}
              onChange={e => setCollege(e.target.value)}
            />
          </div>
          
          <button 
            className="w-full h-[56px] bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]" 
            onClick={start} 
            disabled={loading || !name.trim()}
          >
            {loading ? 'Processing...' : 'Start Investing'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-surface rounded-xl shadow-soft border border-gray-50 flex flex-col items-center text-center gap-1">
            <span className="text-primary font-bold">₹10K</span>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider leading-none">Capital</span>
          </div>
          <div className="p-4 bg-surface rounded-xl shadow-soft border border-gray-50 flex flex-col items-center text-center gap-1">
            <span className="text-accent-blue font-bold">FREE</span>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider leading-none">Learning</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Shell() {
  const { userName } = useUser()
  const location = useLocation()
  const { handleLogout, darkMode, toggleDarkMode } = (window as any)._appActions || {}

  return (
    <div className="bg-background-light h-screen flex overflow-hidden">
      <Sidebar 
        onLogout={handleLogout} 
        darkMode={darkMode} 
        onToggleDarkMode={toggleDarkMode} 
      />
      
      <main className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden relative">
        <header className="h-[88px] shrink-0 flex items-center justify-between px-6 md:px-12 w-full max-w-6xl mx-auto sticky top-0 bg-background-light/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-text-main p-2 -ml-2 rounded-lg hover:bg-black/5">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold tracking-tight text-text-main">
              {location.pathname === '/' ? `Good afternoon, ${userName}` : ''}
            </h2>
          </div>
        </header>

        <div className="flex-1">
          <Routes>
            <Route path="/"            element={<Dashboard />} />
            <Route path="/trade"       element={<Trade />} />
            <Route path="/group"       element={<Group />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </div>

        <MobileNav />
      </main>
    </div>
  )
}

function AppInner() {
  const { setUser } = useUser()
  const [ready, setReady] = useState(!!localStorage.getItem('tl_user'))
  const [darkMode, setDarkMode] = useState(localStorage.getItem('tl_theme') === 'dark')

  useEffect(() => {
    const saved = localStorage.getItem('tl_user')
    if (saved) {
      const { name } = JSON.parse(saved)
      setUser('demo-user-1', name)
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('tl_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('tl_theme', 'light')
    }
  }, [darkMode])

  function handleOnboard(name: string) {
    localStorage.setItem('tl_user', JSON.stringify({ name }))
    setUser('demo-user-1', name)
    setReady(true)
  }

  function handleLogout() {
    localStorage.removeItem('tl_user')
    localStorage.removeItem('tl_group_id')
    setReady(false)
  }

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Inject handleLogout and darkMode actions so Shell can access them
  (window as any)._appActions = { handleLogout, darkMode, toggleDarkMode };

  if (!ready) return <Onboarding onDone={handleOnboard} />

  return (
    <BrowserRouter>
      <Shell />
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
