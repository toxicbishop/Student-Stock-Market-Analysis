import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { UserProvider, useUser } from './UserContext'
import { Sidebar } from './components/Sidebar'
import { Dashboard }   from './pages/Dashboard'
import { Trade }       from './pages/Trade'
import { Group }       from './pages/Group'
import { Leaderboard } from './pages/Leaderboard'
import Profile         from './pages/Profile'
import { AuthPage }    from './pages/Auth'
import { Menu, Home, TrendingUp, Users, Trophy, User } from 'lucide-react'

function MobileNav() {
  const location = useLocation()
  const navItems = [
    { label: 'Home',    path: '/',            icon: Home },
    { label: 'Trade',   path: '/trade',       icon: TrendingUp },
    { label: 'Group',   path: '/group',       icon: Users },
    { label: 'Rank',    path: '/leaderboard', icon: Trophy },
    { label: 'Profile', path: '/profile',     icon: User },
  ]

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[400px] h-[72px] bg-surface/90 backdrop-blur-xl border border-border rounded-2xl shadow-2xl z-50 flex items-center justify-around px-4">
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

interface ShellProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
}

function Shell({ darkMode, toggleDarkMode, onLogout }: ShellProps) {
  const { user } = useUser()
  const location = useLocation()

  return (
    <div className="bg-background-light h-screen flex overflow-hidden font-display antialiased">
      <Sidebar 
        onLogout={onLogout} 
        darkMode={darkMode} 
        onToggleDarkMode={toggleDarkMode} 
      />
      
      <main className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden relative">
        <header className="h-[88px] shrink-0 flex items-center justify-between px-6 md:px-12 w-full max-w-6xl mx-auto sticky top-0 bg-background-light/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-text-main p-2 -ml-2 rounded-lg hover:bg-surface-subtle">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold tracking-tight text-text-main">
              {location.pathname === '/' ? `Good afternoon, ${user?.name || 'Investor'}` : ''}
              {location.pathname === '/profile' ? 'Your Profile' : ''}
              {location.pathname === '/trade' ? 'Market Desk' : ''}
              {location.pathname === '/group' ? 'Social Trading' : ''}
              {location.pathname === '/leaderboard' ? 'Wall of Fame' : ''}
            </h2>
          </div>
        </header>

        <div className="flex-1">
          <Routes>
            <Route path="/"            element={<Dashboard />} />
            <Route path="/trade"       element={<Trade />} />
            <Route path="/group"       element={<Group />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile"     element={<Profile />} />
            <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        <MobileNav />
      </main>
    </div>
  )
}

function AppInner() {
  const { user, logout } = useUser()
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('tl_theme')
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('tl_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('tl_theme', 'light')
    }
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode((prev: boolean) => !prev);

  // If no user is logged in, show AuthPage
  if (!user) return <AuthPage />

  return (
    <BrowserRouter>
      <Shell 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
        onLogout={logout} 
      />
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
