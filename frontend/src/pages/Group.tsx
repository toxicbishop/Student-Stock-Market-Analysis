import { useState, useEffect } from 'react'
import { api, GroupDetail, ProposalOut } from '../api'
import { useUser } from '../UserContext'
import { Users, Plus, ArrowUpRight, ArrowDownRight, MessageSquare, Clock, Check, X, Shield, TrendingUp } from 'lucide-react'
import clsx from 'clsx'

type View = 'feed' | 'create' | 'join' | 'detail'

export function Group() {
  const { user, groupId, setGroupId } = useUser()
  const [view, setView]       = useState<View>('feed')
  const [group, setGroup]     = useState<GroupDetail | null>(null)
  const [proposals, setProps] = useState<ProposalOut[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  // Form states
  const [groupName, setGroupName] = useState('')
  const [contribution, setContrib] = useState(10000)
  const [inviteCode, setInviteCode] = useState('')

  useEffect(() => {
    if (groupId) loadGroup(groupId)
  }, [groupId])

  async function loadGroup(id: string) {
    setLoading(true)
    try {
      const [g, p] = await Promise.all([api.groups.get(id), api.groups.proposals(id)])
      setGroup(g)
      setProps(p)
    } catch {
      setError('Could not load group.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!groupName.trim()) return
    setLoading(true)
    try {
      const res = await api.groups.create(groupName, user?.id || '', contribution)
      setGroupId(res.id)
      await loadGroup(res.id)
      setView('detail')
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }

  const handleJoin = async () => {
    if (!inviteCode.trim()) return
    setLoading(true)
    try {
      const res = await api.groups.join(user?.id || '', inviteCode.toUpperCase(), contribution) as any
      setGroupId(res.group_id)
      await loadGroup(res.group_id)
      setView('detail')
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div className="flex-1 h-full overflow-y-auto overflow-x-hidden pt-8 px-6 md:px-12 animate-fade-in">
      <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-24">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-[32px] font-extrabold text-text-main tracking-tight leading-none">Social & Pods</h2>
            <p className="text-text-muted text-lg font-medium">Connect with friends and invest as a collective.</p>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={() => setView('join')}
               className="h-14 px-6 bg-surface border border-border rounded-full font-bold text-sm text-text-main shadow-soft hover:shadow-soft-hover transition-all"
             >
               Join via Code
             </button>
             <button 
               onClick={() => setView('create')}
               className="flex items-center justify-center gap-2 h-14 px-8 bg-primary hover:bg-primary/90 text-white rounded-full font-bold text-sm shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
             >
               <Plus size={20} />
               Create Pod
             </button>
          </div>
        </header>

        {/* Create/Join Modals Overlay */}
        {(view === 'create' || view === 'join') && (
          <div className="fixed inset-0 bg-background-light/80 backdrop-blur-md z-100 flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-surface w-full max-w-md rounded-[32px] shadow-2xl p-10 relative">
              <button onClick={() => setView('feed')} className="absolute top-6 right-6 text-text-muted hover:text-text-main">
                <X size={24} />
              </button>
              
              <h3 className="text-3xl font-extrabold text-text-main mb-2 tracking-tight">
                {view === 'create' ? 'Start a New Pod' : 'Join a Pod'}
              </h3>
              <p className="text-text-muted font-medium mb-8">
                {view === 'create' ? 'Name your club and set your initial seed capital.' : 'Enter the club invite code and contribution.'}
              </p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">
                    {view === 'create' ? 'Pod Name' : 'Invite Code'}
                  </label>
                  <input 
                    className="w-full h-14 px-5 bg-background-light border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all text-lg font-bold placeholder:text-text-muted/40"
                    placeholder={view === 'create' ? "e.g. KSIT Tech Bulls" : "TL-XXXXXX"}
                    value={view === 'create' ? groupName : inviteCode}
                    onChange={e => view === 'create' ? setGroupName(e.target.value) : setInviteCode(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Your Contribution (₹)</label>
                  <input 
                    type="number"
                    className="w-full h-14 px-5 bg-background-light border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all text-lg font-bold"
                    value={contribution}
                    onChange={e => setContrib(Number(e.target.value))}
                  />
                </div>
                
                {error && <p className="text-loss text-sm font-bold text-center px-4 py-2 bg-loss/10 rounded-xl">{error}</p>}

                <button 
                  onClick={view === 'create' ? handleCreate : handleJoin}
                  disabled={loading}
                  className="w-full h-14 bg-primary text-white font-extrabold rounded-full shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : (view === 'create' ? 'Launch Pod' : 'Enter Pod')}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column: Activity & Detail */}
          <div className="w-full lg:w-3/5 flex flex-col gap-6">
            {groupId && group && view === 'detail' ? (
              <div className="space-y-8 animate-fade-in">
                 {/* Live Status Card */}
                 <div className="bg-surface rounded-3xl p-8 shadow-card border border-primary/10 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 opacity-10">
                      <Users size={120} />
                   </div>
                   <div className="flex justify-between items-start mb-8 relative z-10">
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                         <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                         <span className="text-xs font-bold text-primary uppercase tracking-widest">Live Group Session</span>
                       </div>
                       <h3 className="text-3xl font-extrabold text-text-main tracking-tight">{group.name}</h3>
                     </div>
                     <div className="text-right">
                        <div className="text-sm font-bold text-text-muted uppercase tracking-widest mb-1">Group Corpus</div>
                        <div className="text-3xl font-extrabold text-text-main font-mono">₹{group.virtual_corpus.toLocaleString()}</div>
                     </div>
                   </div>
                   <div className="bg-background-light rounded-2xl p-4 flex items-center justify-between border border-border-subtle relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface rounded-xl shadow-sm flex items-center justify-center text-primary font-bold">#</div>
                        <div>
                          <p className="text-xs text-text-muted font-bold uppercase tracking-wider leading-none">Invite Link</p>
                          <p className="text-lg font-extrabold text-text-main tracking-widest mt-1">{group.invite_code}</p>
                        </div>
                      </div>
                      <button className="px-5 py-2.5 bg-background-light text-text-main font-bold text-xs rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95">Copy</button>
                   </div>
                 </div>

                 {/* Proposals / Voting Section */}
                 <section>
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="text-2xl font-extrabold text-text-main">Trade Proposals</h3>
                       <button className="flex items-center gap-2 text-sm font-bold text-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-all">
                          <Plus size={18} /> New Suggestion
                       </button>
                    </div>
                    
                    {proposals.length === 0 ? (
                      <div className="bg-surface rounded-3xl p-12 shadow-soft border-2 border-dashed border-border-subtle flex flex-col items-center text-center">
                         <MessageSquare size={48} className="text-text-muted mb-4" />
                         <p className="text-text-muted font-bold">No active proposals yet.</p>
                         <p className="text-sm text-text-muted mt-1 opacity-70">Initiate a group vote by proposing a stock from the Trade tab.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {proposals.map(p => (
                          <div key={p.id} className="bg-surface p-6 rounded-3xl shadow-card border border-border-subtle group hover:shadow-soft-hover transition-all">
                             <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                   <div className={clsx(
                                     "w-12 h-12 rounded-2xl flex items-center justify-center",
                                     p.action === 'BUY' ? "bg-primary/10 text-primary" : "bg-loss/10 text-loss"
                                   )}>
                                      {p.action === 'BUY' ? <TrendingUp size={24} /> : <TrendingUp size={24} className="rotate-180" />}
                                   </div>
                                   <div>
                                      <h4 className="text-xl font-extrabold text-text-main group-hover:text-primary transition-colors">{p.ticker}</h4>
                                      <p className="text-xs text-text-muted font-bold uppercase tracking-widest">{p.action} ORDER PROPOSAL</p>
                                   </div>
                                </div>
                                <div className="bg-warning/10 text-warning px-3 py-1.5 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 uppercase tracking-wider">
                                   <Clock size={14} /> 2H 14M REMAINING
                                </div>
                             </div>

                             <div className="bg-background-light p-4 rounded-2xl mb-6 italic text-sm text-text-main font-medium leading-relaxed border-l-4 border-primary/40">
                                "{p.rationale || 'No rationale provided'}"
                             </div>

                             <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-text-muted">
                                   <span>Consensus Progress</span>
                                   <span>{p.yes_votes} Yes / {p.total_members} Members</span>
                                </div>
                                <div className="h-2 bg-background-light rounded-full overflow-hidden border border-gray-100/50">
                                   <div 
                                     className="h-full bg-primary rounded-full transition-all duration-1000" 
                                     style={{ width: `${(p.yes_votes / p.total_members) * 100}%` }} 
                                   />
                                </div>
                             </div>

                             {p.status === 'open' && (
                               <div className="flex gap-3 mt-8">
                                  <button className="flex-1 h-14 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 font-extrabold transition-all flex items-center justify-center gap-2 group/vote">
                                      <Check size={20} className="group-hover/vote:scale-125 transition-transform" /> Support
                                  </button>
                                  <button className="flex-1 h-14 rounded-2xl bg-loss/10 text-loss hover:bg-loss/20 font-extrabold transition-all flex items-center justify-center gap-2 group/vote">
                                      <X size={20} className="group-hover/vote:scale-125 transition-transform" /> Veto
                                  </button>
                               </div>
                             )}
                          </div>
                        ))}
                      </div>
                    )}
                 </section>
              </div>
            ) : (
              <section className="bg-surface rounded-3xl shadow-card p-8 border border-border-subtle">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-extrabold text-text-main">Market Activity Feed</h3>
                  <button className="text-sm font-bold text-primary hover:underline">Global View</button>
                </div>
                <div className="flex flex-col gap-1">
                  {[
                    { user: 'Priya', action: 'bought', target: 'RELIANCE', value: '₹5,000', time: '2h ago', icon: ArrowUpRight, color: 'text-primary' },
                    { user: 'Rahul', action: 'joined the', target: 'Tech Bulls', value: 'pod', time: '4h ago', icon: MessageSquare, color: 'text-accent-blue' },
                    { user: 'Amit', action: 'sold', target: 'HDFCBANK', value: '10 units', time: 'Yesterday', icon: ArrowDownRight, color: 'text-loss' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-5 rounded-2xl hover:bg-surface-subtle transition-all cursor-pointer group border-b border-border-subtle last:border-0">
                       <div className="w-12 h-12 rounded-full bg-background-light flex items-center justify-center font-bold text-text-muted border border-border-subtle shrink-0 shadow-sm transition-transform group-hover:rotate-6">
                          {item.user[0]}
                       </div>
                       <div className="flex flex-col gap-1 flex-1">
                          <p className="text-[15px] font-medium text-text-main leading-snug">
                            <span className="font-extrabold">{item.user}</span> {item.action} <span className="font-extrabold">{item.value}</span> of <span className="px-1.5 py-0.5 bg-background-light rounded font-bold text-xs border border-gray-100">{item.target}</span>
                          </p>
                          <span className="text-text-muted text-xs font-bold uppercase tracking-wider">{item.time}</span>
                       </div>
                       <item.icon size={20} className={clsx("opacity-20 group-hover:opacity-100 transition-all", item.color)} />
                    </div>
                  ))}
                </div>
                <button className="w-full mt-8 py-4 rounded-2xl text-text-main font-bold text-sm hover:bg-surface-subtle transition-all border border-border-subtle shadow-sm border-dashed">
                  View Older Activity
                </button>
              </section>
            )}
          </div>

          {/* Right Column: Mini Pod Cards */}
          <div className="w-full lg:w-2/5 flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-extrabold text-text-main">Active Pods</h3>
              <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">LIVE</span>
            </div>
            
            <div className="flex flex-col gap-4">
              {groupId && group ? (
                 <div 
                   onClick={() => setView('detail')}
                   className="bg-surface p-6 rounded-[28px] shadow-card border border-primary/20 cursor-pointer overflow-hidden relative group transition-all hover:scale-[1.02]"
                 >
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-125 duration-500" />
                   <div className="flex justify-between items-start mb-6 relative z-10">
                      <div>
                        <h4 className="text-xl font-extrabold text-text-main tracking-tight leading-none mb-1">{group.name}</h4>
                        <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Active Investing Club</p>
                      </div>
                      <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1">
                         <TrendingUp size={14} /> 12.4%
                      </div>
                   </div>
                   <div className="flex items-end justify-between relative z-10">
                      <div>
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mb-1">Club Value</p>
                        <p className="text-2xl font-black text-text-main font-mono">₹{group.virtual_corpus.toLocaleString()}</p>
                      </div>
                        <div className="flex -space-x-3">
                           {[1,2,3].map(i => (
                             <div key={i} className="w-10 h-10 rounded-full border-4 border-surface bg-background-light flex items-center justify-center text-xs font-bold text-text-muted shadow-sm uppercase">
                                {i === 1 ? (user?.name?.[0] || 'U') : 'U'}
                             </div>
                           ))}
                        </div>
                   </div>
                 </div>
              ) : (
                <div 
                  onClick={() => setView('create')}
                  className="bg-surface/50 border-2 border-dashed border-border-subtle p-10 rounded-[32px] flex flex-col items-center text-center gap-4 hover:bg-surface hover:border-primary/40 cursor-pointer transition-all group"
                >
                  <div className="w-16 h-16 bg-background-light rounded-full flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
                    <Shield size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-text-main">No Pods Found</h4>
                    <p className="text-sm text-text-muted font-medium mt-1">Pods let you vote on trades with friends and split the profit.</p>
                  </div>
                  <button className="mt-2 text-primary font-bold text-sm tracking-widest uppercase flex items-center gap-2">
                    Establish First Pod <Plus size={16} />
                  </button>
                </div>
              )}

              {/* Invitation Teaser */}
              <div className="bg-surface p-8 rounded-[32px] shadow-soft border border-border-subtle flex flex-col items-center text-center gap-3">
                 <div className="w-14 h-14 bg-accent-blue/5 rounded-full flex items-center justify-center text-accent-blue font-bold">
                    <Users size={28} />
                 </div>
                 <h4 className="text-lg font-extrabold text-text-main leading-tight">Elite Circle</h4>
                 <p className="text-sm text-text-muted font-medium mb-4">Invest with the top 1% of traders in your college network.</p>
                 <button className="w-full py-3 bg-background-light border border-border rounded-2xl font-bold text-text-main hover:bg-surface hover:shadow-soft transition-all">
                    Send Invites
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
