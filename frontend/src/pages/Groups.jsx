import React from 'react'
import { Users, Clock, Plus, Share2 } from 'lucide-react'
import { cn } from '../lib/utils'

const Groups = () => {
  const demoGroup = {
    name: "KSIT Investment Club",
    members: 3,
    corpus: 30840,
    gains: 840,
    gainsPct: 2.8,
    inviteCode: "TL-X7K2",
    proposal: {
      ticker: "TCS",
      action: "BUY",
      qty: 3,
      rationale: "Strong Q4 results expected",
      proposer: "Pranav",
      timeLeft: "23h",
      yesVotes: 1,
      totalVotes: 3
    }
  }

  return (
    <div className="max-w-md mx-auto pt-8 px-6 pb-24 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Investment Clubs</h2>
        <button className="w-10 h-10 bg-ai rounded-2xl flex-center text-black active:scale-95 transition-all">
          <Plus size={20} className="stroke-[3px]" />
        </button>
      </div>

      <div className="bg-secondary/40 border border-secondary p-6 rounded-[32px] mb-8 relative group cursor-pointer hover:bg-secondary/60 transition-all overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold tracking-tight">{demoGroup.name}</h3>
            <p className="text-tertiary text-xs">{demoGroup.members} members · Majority vote</p>
          </div>
          <button className="text-tertiary hover:text-ai transition-colors">
            <Share2 size={16} />
          </button>
        </div>

        <div className="bg-black/40 rounded-2xl p-4 border border-primary mb-6">
          <p className="text-[10px] text-tertiary uppercase tracking-widest font-bold mb-1">Club Corpus</p>
          <div className="text-2xl font-bold tracking-tight">₹{demoGroup.corpus.toLocaleString()}</div>
          <p className="text-profit text-[10px] font-bold">+{demoGroup.gainsPct}% profit</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-bold text-tertiary uppercase tracking-wider">Open Proposal</h4>
            <div className="flex items-center gap-1 text-warning animate-pulse">
               <Clock size={10} />
               <span className="text-[10px] font-bold uppercase tracking-widest">{demoGroup.proposal.timeLeft} left</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 relative group/item">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-sm font-bold tracking-tight uppercase">{demoGroup.proposal.action} {demoGroup.proposal.ticker}</div>
                <div className="text-[10px] text-tertiary mt-0.5">{demoGroup.proposal.qty} shares proposed</div>
              </div>
              <span className="text-[10px] text-tertiary italic">by {demoGroup.proposal.proposer}</span>
            </div>
            
            <p className="text-[11px] text-secondary leading-relaxed mb-4 italic italic">
              "{demoGroup.proposal.rationale}"
            </p>

            <div className="flex justify-between items-center mb-4">
               <div className="flex items-center gap-2">
                 <div className="flex -space-x-1.5">
                    {[1,2,3].map(i => (
                      <div key={i} className={cn(
                        "w-5 h-5 rounded-full border-2 border-[#0F0F11] flex-center text-[7px] font-bold",
                        i === 1 ? "bg-ai text-white" : "bg-tertiary/20 text-tertiary"
                      )}>
                        {i === 1 ? 'P' : '?'}
                      </div>
                    ))}
                 </div>
                 <span className="text-[10px] text-tertiary font-bold tracking-tighter">1 / 3 VOTES</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <button className="bg-profit/10 hover:bg-profit/20 border border-profit/20 text-profit font-bold py-2 rounded-xl text-xs transition-all active:scale-95">Yes</button>
               <button className="bg-loss-red/10 hover:bg-loss-red/20 border border-loss-red/20 text-loss-red font-bold py-2 rounded-xl text-xs transition-all active:scale-95">No</button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <span className="text-[10px] text-tertiary font-bold uppercase tracking-widest">ID:</span>
             <code className="text-primary text-[11px] font-bold tracking-wider ">{demoGroup.inviteCode}</code>
           </div>
           <button className="text-[10px] text-ai font-bold uppercase tracking-widest">Withdraw units →</button>
        </div>
      </div>
      
      <div className="text-center py-10 opacity-30">
         <Users size={32} className="mx-auto mb-3" />
         <p className="text-xs font-medium">Join more clubs or create <br/> a private one for your hostel.</p>
      </div>
    </div>
  )
}

export default Groups
