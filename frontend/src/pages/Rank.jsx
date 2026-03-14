import React from 'react'
import { Trophy, TrendingUp, TrendingDown, Crown } from 'lucide-react'
import { cn } from '../lib/utils'

const Rank = () => {
  const students = [
    { rank: 1, name: "Arjun K.", college: "KSIT", gain: 18.4, isYou: false },
    { rank: 2, name: "Sneha M.", college: "PESIT", gain: 14.1, isYou: false },
    { rank: 3, name: "You", college: "KSIT", gain: 8.4, isYou: true },
    { rank: 4, name: "Rahul T.", college: "RVCE", gain: -2.1, isYou: false },
    { rank: 5, name: "Priya S.", college: "BMSCE", gain: -4.8, isYou: false },
  ]

  return (
    <div className="max-w-md mx-auto pt-8 px-6 pb-24 animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-warning to-red-400 rounded-[24px] flex-center mx-auto mb-4 border-2 border-white/10 shadow-xl shadow-warning/20">
          <Trophy size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
        <p className="text-tertiary text-xs mt-1">This week's top students · Ends in 2 days</p>
      </div>

      <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl border border-secondary mb-8">
        <button className="flex-1 py-3 text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/10 rounded-xl">Students</button>
        <button className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-tertiary hover:text-primary transition-colors">Colleges</button>
      </div>

      <div className="space-y-4">
        {students.map((user) => (
          <div 
            key={user.rank}
            className={cn(
               "flex items-center justify-between p-4 px-5 rounded-[24px] transition-all",
               user.isYou ? "bg-ai/10 border border-ai/20 shadow-lg shadow-ai/5" : "bg-secondary/30 border border-transparent"
            )}
          >
            <div className="flex items-center gap-5">
              <div className={cn(
                "w-8 h-8 rounded-full flex-center text-xs font-bold",
                user.rank === 1 ? "bg-warning/20 text-warning" : "text-tertiary"
              )}>
                {user.rank === 1 ? <Crown size={14} /> : user.rank}
              </div>
              <div>
                <h4 className={cn("text-sm font-bold", user.isYou && "text-ai")}>{user.name}</h4>
                <p className="text-[10px] text-tertiary font-medium uppercase tracking-tighter">{user.college}</p>
              </div>
            </div>
            <div className="text-right">
               <div className={cn(
                 "text-sm font-bold flex items-center gap-1 justify-end",
                 user.gain > 0 ? "text-profit" : "text-loss"
               )}>
                 {user.gain > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                 {user.gain > 0 ? '+' : ''}{user.gain}%
               </div>
               {user.isYou && <div className="text-[9px] text-ai font-bold uppercase tracking-widest mt-0.5">Rank 3 Overall</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-white/[0.02] border border-white/5 p-6 rounded-[32px] text-center italic italic">
          <p className="text-xs text-tertiary leading-relaxed">
            "Your rank is based on trade consistency and AI score, <span className="text-primary font-bold">not just absolute profit.</span> Risk less to climb faster."
          </p>
      </div>
    </div>
  )
}

export default Rank
