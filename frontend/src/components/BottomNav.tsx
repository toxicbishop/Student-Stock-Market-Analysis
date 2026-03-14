import { useLocation, useNavigate } from 'react-router-dom'

const TABS = [
  { path: '/',           label: 'Home',  icon: HomeIcon  },
  { path: '/trade',      label: 'Trade', icon: TradeIcon },
  { path: '/group',      label: 'Group', icon: GroupIcon },
  { path: '/leaderboard',label: 'Rank',  icon: RankIcon  },
]

export function BottomNav() {
  const { pathname } = useLocation()
  const navigate     = useNavigate()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px]
                    bg-card/95 backdrop-blur border-t border-border
                    flex items-center px-2 py-2 z-30">
      {TABS.map(({ path, label, icon: Icon }) => {
        const active = pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl
                        transition-all duration-200 ${active ? 'text-brand' : 'text-muted'}`}
          >
            <Icon active={active} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#7F77DD' : '#6B6B8A'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function TradeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#7F77DD' : '#6B6B8A'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}

function GroupIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#7F77DD' : '#6B6B8A'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function RankIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#7F77DD' : '#6B6B8A'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4"  />
      <line x1="6"  y1="20" x2="6"  y2="14" />
    </svg>
  )
}
