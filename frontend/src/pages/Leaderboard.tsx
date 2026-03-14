import { useEffect, useState } from 'react'
import { api, LeaderboardEntry } from '../api'
import { Trophy, TrendingUp, TrendingDown, Users, Globe, ChevronRight, Award } from 'lucide-react'
import clsx from 'clsx'

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState<'friends' | 'global'>('global')

  useEffect(() => {
    loadLeaderboard()
  }, [])

  async function loadLeaderboard() {
    setLoading(true)
    try {
      const data = await api.stocks.leaderboard()
      setEntries(data)
    } finally {
      setLoading(false)
    }
  }

  const winners = entries.slice(0, 3)
  const rest = entries.slice(3)

  return (
    <div className="flex-1 flex flex-col min-h-screen relative pb-24 animate-fade-in px-6 md:px-12">
      <div className="max-w-4xl w-full mx-auto py-8 flex flex-col flex-1">
        
        {/* Page Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-4xl font-extrabold tracking-tight text-text-main">Wall of Fame</h2>
            <p className="text-text-muted font-medium">Outperform your peers and climb to the top.</p>
          </div>
          <div className="flex p-1 bg-surface rounded-2xl shadow-soft border border-border-subtle w-full md:w-auto self-start">
            <button 
              onClick={() => setTab('friends')}
              className={clsx(
                "flex-1 md:w-32 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2",
                tab === 'friends' ? "bg-primary/10 text-primary shadow-sm" : "text-text-muted hover:text-text-main"
              )}
            >
              <Users size={14} /> Friends
            </button>
            <button 
              onClick={() => setTab('global')}
              className={clsx(
                "flex-1 md:w-32 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2",
                tab === 'global' ? "bg-primary/10 text-primary shadow-sm" : "text-text-muted hover:text-text-main"
              )}
            >
              <Globe size={14} /> Global
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-text-muted">
            <Trophy size={48} className="animate-bounce" />
            <p className="font-bold tracking-widest uppercase text-xs">Calibrating Ranks...</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            <div className="flex justify-center items-end gap-3 sm:gap-8 mb-16 mt-8">
              {/* 2nd Place */}
              {winners[1] && (
                <div className="flex flex-col items-center pb-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
                  <div className="relative mb-4 group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[6px] border-[#C0C0C0] shadow-xl bg-surface flex items-center justify-center text-3xl font-black text-text-muted overflow-hidden">
                       {winners[1].user_name[0]}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#C0C0C0] rounded-full flex items-center justify-center text-white text-sm font-black border-4 border-background-light">2</div>
                  </div>
                  <span className="font-extrabold text-text-main text-sm sm:text-base">{winners[1].user_name}</span>
                  <span className="text-primary font-black text-sm">+{winners[1].total_pnl_pct.toFixed(1)}%</span>
                </div>
              )}

              {/* 1st Place */}
              {winners[0] && (
                <div className="flex flex-col items-center pb-10 animate-slide-up">
                  <div className="relative mb-4 group">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-8 border-[#FFD700] shadow-2xl bg-surface flex items-center justify-center text-5xl font-black text-primary overflow-hidden">
                       {winners[0].user_name[0]}
                    </div>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[#FFD700] drop-shadow-lg">
                      <Award size={40} fill="currentColor" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center text-white text-lg font-black border-4 border-background-light">1</div>
                  </div>
                  <span className="font-black text-text-main text-base sm:text-xl drop-shadow-sm">{winners[0].user_name}</span>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full mt-1">
                     <TrendingUp size={16} className="text-primary" />
                     <span className="text-primary font-black text-base">{winners[0].total_pnl_pct.toFixed(1)}%</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {winners[2] && (
                <div className="flex flex-col items-center pb-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
                  <div className="relative mb-4 group">
                    <div className="w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-full border-[6px] border-[#CD7F32] shadow-lg bg-surface flex items-center justify-center text-2xl font-black text-text-muted overflow-hidden">
                       {winners[2].user_name[0]}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#CD7F32] rounded-full flex items-center justify-center text-white text-xs font-black border-4 border-background-light">3</div>
                  </div>
                  <span className="font-extrabold text-text-main text-sm sm:text-base">{winners[2].user_name}</span>
                  <span className="text-primary font-black text-sm">+{winners[2].total_pnl_pct.toFixed(1)}%</span>
                </div>
              )}
            </div>

            {/* List View */}
            <div className="bg-surface rounded-[32px] shadow-card overflow-hidden border border-border-subtle flex-1">
              <ul className="divide-y divide-border-subtle">
                {rest.map((entry, i) => (
                  <li 
                    key={entry.user_id} 
                    className="flex items-center px-6 py-5 hover:bg-surface-subtle/50 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="w-10 text-text-muted font-black text-sm tracking-tighter">#{i + 4}</div>
                    <div className="w-12 h-12 rounded-2xl bg-background-light border border-border-subtle flex items-center justify-center font-bold text-text-muted mr-5 shadow-sm transition-transform group-hover:scale-110">
                      {entry.user_name[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-extrabold text-text-main group-hover:text-primary transition-colors text-lg">{entry.user_name}</h3>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{tab === 'friends' ? 'College Peer' : 'Global Trader'}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className={clsx(
                        "font-black px-3 py-1.5 rounded-xl text-sm flex items-center gap-1.5",
                        entry.total_pnl >= 0 ? "bg-primary/10 text-primary" : "bg-loss/10 text-loss"
                      )}>
                        {entry.total_pnl >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {Math.abs(entry.total_pnl_pct).toFixed(1)}%
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-200 ml-4 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </li>
                ))}
              </ul>
              
              <div className="p-8 text-center border-t border-gray-50 bg-gray-50/30">
                <button className="text-primary font-black text-sm uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all">Load More Talent</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sticky User Summary Banner */}
      {!loading && (
        <div className="fixed bottom-0 md:bottom-8 left-0 md:left-1/2 md:-translate-x-1/2 right-0 md:w-full md:max-w-xl bg-text-main/95 backdrop-blur-xl border-t md:border border-white/10 shadow-2xl z-60 p-5 md:rounded-3xl animate-slide-up">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
                    {entries[0]?.user_name[1] || 'Y'}
                 </div>
                 <div>
                    <div className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-0.5">Your Current Standing</div>
                    <div className="flex items-center gap-2">
                       <span className="text-2xl font-black text-white">#127</span>
                       <span className="text-xs font-black bg-primary text-white px-2 py-0.5 rounded-lg tracking-tight">+4.2%</span>
                    </div>
                 </div>
              </div>
              <div className="text-right hidden sm:flex flex-col items-end">
                 <div className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1.5">Elite Level Progress</div>
                 <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(16,193,108,0.5)]" style={{ width: '45%' }}></div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
