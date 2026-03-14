import { Link, useLocation } from 'react-router-dom'
import { LogOut, Home, TrendingUp, Users, Trophy, LifeBuoy, Moon, Sun } from 'lucide-react'

interface Props {
  onLogout: () => void
  darkMode: boolean
  onToggleDarkMode: () => void
}

export function Sidebar({ onLogout, darkMode, onToggleDarkMode }: Props) {
  const location = useLocation()

  const navItems = [
    { label: 'Home',  path: '/',            icon: Home },
    { label: 'Trade', path: '/trade',       icon: TrendingUp },
    { label: 'Group', path: '/group',       icon: Users },
    { label: 'Rank',  path: '/leaderboard', icon: Trophy },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <aside className="w-[240px] bg-background-light shrink-0 flex-col justify-between py-8 px-4 border-r border-border hidden md:flex">
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <div className="flex flex-col px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
              T
            </div>
            <h1 className="text-xl font-bold tracking-tight text-text-main">TradeLab</h1>
          </div>
          <p className="text-text-muted text-sm font-medium mt-1">{greeting}</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <Link 
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-surface text-text-main font-semibold shadow-sm' 
                    : 'text-text-muted hover:text-text-main hover:bg-surface/50 font-medium'
                }`}
              >
                <Icon size={24} className={isActive ? 'text-primary' : ''} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="px-4 space-y-2">
        <button 
          onClick={onToggleDarkMode}
          className="flex items-center gap-3 text-text-muted hover:text-text-main font-medium transition-colors w-full py-2 group"
        >
          {darkMode ? (
            <>
              <Sun size={20} className="group-hover:rotate-45 transition-transform" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={20} className="group-hover:-rotate-12 transition-transform" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
        <button className="flex items-center gap-3 text-text-muted hover:text-text-main font-medium transition-colors w-full py-2">
          <LifeBuoy size={20} />
          <span>Support</span>
        </button>
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 text-text-muted hover:text-loss transition-colors py-2 font-medium w-full"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
