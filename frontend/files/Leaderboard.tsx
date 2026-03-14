import { useUser } from '../UserContext'
import clsx from 'clsx'

// Demo leaderboard — replace with real API in post-hackathon version
const DEMO_STUDENTS = [
  { name: 'Arjun K.',  college: 'KSIT',  pct: 18.4, trades: 24 },
  { name: 'Sneha M.',  college: 'RVCE',  pct: 14.1, trades: 19 },
  { name: 'Pranav',   college: 'KSIT',  pct:  8.4, trades: 12 },
  { name: 'Rahul T.', college: 'PES',   pct: -2.1, trades: 15 },
  { name: 'Priya S.', college: 'BMS',   pct: -4.8, trades:  9 },
  { name: 'Karan D.', college: 'MSRIT', pct: -6.2, trades: 11 },
]

const DEMO_COLLEGES = [
  { name: 'KSIT',   students: 42, avgPct: 11.2 },
  { name: 'RVCE',   students: 38, avgPct:  7.4 },
  { name: 'PES',    students: 31, avgPct:  2.1 },
  { name: 'BMS',    students: 27, avgPct: -1.4 },
  { name: 'MSRIT',  students: 22, avgPct: -3.8 },
]

export function Leaderboard() {
  const { userName } = useUser()

  return (
    <div className="px-4 pt-12 pb-28 space-y-5 animate-fade-in">
      <div>
        <p className="label-xs mb-1">This week</p>
        <h1 className="text-2xl font-semibold">Rankings</h1>
      </div>

      {/* Top 3 podium */}
      <div className="flex items-end justify-center gap-3 py-4">
        {/* 2nd */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-card border-2 border-muted
                          flex items-center justify-center font-semibold text-muted">
            {DEMO_STUDENTS[1].name[0]}
          </div>
          <div className="bg-card border border-border rounded-xl px-3 py-2 text-center w-24 h-16 flex flex-col justify-end">
            <p className="text-xs font-medium text-white truncate">{DEMO_STUDENTS[1].name}</p>
            <p className="text-xs text-profit font-mono">+{DEMO_STUDENTS[1].pct}%</p>
          </div>
          <span className="text-muted font-mono text-xs">2nd</span>
        </div>
        {/* 1st */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-warning/20 border-2 border-warning
                          flex items-center justify-center font-bold text-warning text-lg">
            {DEMO_STUDENTS[0].name[0]}
          </div>
          <div className="bg-card border border-warning/30 rounded-xl px-3 py-2 text-center w-28 h-20 flex flex-col justify-end">
            <p className="text-sm font-semibold text-white truncate">{DEMO_STUDENTS[0].name}</p>
            <p className="text-sm text-profit font-mono font-semibold">+{DEMO_STUDENTS[0].pct}%</p>
          </div>
          <span className="text-warning font-mono text-xs font-semibold">1st</span>
        </div>
        {/* 3rd */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-brand/20 border-2 border-brand
                          flex items-center justify-center font-semibold text-brand">
            {userName[0]}
          </div>
          <div className="bg-card border border-brand/30 rounded-xl px-3 py-2 text-center w-24 h-14 flex flex-col justify-end">
            <p className="text-xs font-semibold text-white truncate">You</p>
            <p className="text-xs text-profit font-mono">+{DEMO_STUDENTS[2].pct}%</p>
          </div>
          <span className="text-brand font-mono text-xs">3rd</span>
        </div>
      </div>

      {/* Tab */}
      <div className="flex gap-2 p-1 bg-card rounded-xl border border-border">
        <div className="tab-pill active text-center text-sm py-2">Students</div>
        <div className="tab-pill text-center text-sm py-2 text-muted">Colleges</div>
      </div>

      {/* Student list */}
      <div className="space-y-2">
        {DEMO_STUDENTS.map((s, i) => {
          const isYou = s.name === userName || s.name === 'Pranav'
          return (
            <div key={s.name} className={clsx(
              'card flex items-center gap-3',
              isYou && 'border-brand/40 bg-brand/5'
            )}>
              <span className={clsx(
                'font-mono text-sm font-semibold w-6 text-center',
                i === 0 ? 'text-warning' :
                i === 1 ? 'text-muted' :
                i === 2 ? 'text-brand' : 'text-muted'
              )}>
                {i + 1}
              </span>
              <div className="w-8 h-8 rounded-full bg-surface border border-border
                              flex items-center justify-center text-xs font-semibold text-muted">
                {s.name[0]}
              </div>
              <div className="flex-1">
                <p className={clsx('text-sm font-medium', isYou && 'text-brand')}>
                  {isYou ? `${s.name} (you)` : s.name}
                </p>
                <p className="text-xs text-muted">{s.college} · {s.trades} trades</p>
              </div>
              <div className="text-right">
                <p className={clsx('font-mono text-sm font-semibold',
                  s.pct >= 0 ? 'text-profit' : 'text-loss'
                )}>
                  {s.pct >= 0 ? '+' : ''}{s.pct}%
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs text-muted">Resets every Sunday midnight · 5 colleges competing</p>
    </div>
  )
}
