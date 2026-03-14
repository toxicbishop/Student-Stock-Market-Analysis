import { useState, useEffect } from 'react'
import { api, GroupDetail, ProposalOut } from '../api'
import { useUser } from '../UserContext'
import clsx from 'clsx'

type View = 'home' | 'create' | 'join' | 'detail'

export function Group() {
  const { userId, userName, groupId, setGroupId } = useUser()
  const [view, setView]       = useState<View>(groupId ? 'detail' : 'home')
  const [group, setGroup]     = useState<GroupDetail | null>(null)
  const [proposals, setProps] = useState<ProposalOut[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  // Create form
  const [groupName, setGroupName] = useState('')
  const [contribution, setContrib] = useState(10000)

  // Join form
  const [inviteCode, setInviteCode] = useState('')

  // Proposal form
  const [showPropose, setShowPropose] = useState(false)
  const [propTicker,  setPropTicker]  = useState('')
  const [propAction,  setPropAction]  = useState<'BUY'|'SELL'>('BUY')
  const [propQty,     setPropQty]     = useState(1)
  const [propNote,    setPropNote]    = useState('')

  useEffect(() => {
    if (groupId) loadGroup(groupId)
  }, [groupId])

  async function loadGroup(id: string) {
    setLoading(true)
    try {
      const [g, p] = await Promise.all([api.groups.get(id), api.groups.proposals(id)])
      setGroup(g)
      setProps(p)
      setView('detail')
    } catch {
      setError('Could not load group.')
    } finally {
      setLoading(false)
    }
  }

  async function createGroup() {
    if (!groupName.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.groups.create(groupName, userId, contribution)
      setGroupId(res.id)
      await loadGroup(res.id)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  async function joinGroup() {
    if (!inviteCode.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.groups.join(userId, inviteCode.toUpperCase(), contribution) as { group_id: string }
      setGroupId(res.group_id)
      await loadGroup(res.group_id)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid invite code')
    } finally {
      setLoading(false)
    }
  }

  async function submitProposal() {
    if (!groupId || !propTicker.trim()) return
    setLoading(true)
    setError(null)
    try {
      await api.groups.propose({
        group_id: groupId, proposed_by: userId,
        ticker: propTicker.toUpperCase(), action: propAction,
        quantity: propQty, rationale: propNote,
      })
      setShowPropose(false)
      setPropTicker(''); setPropNote(''); setPropQty(1)
      await loadGroup(groupId)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Proposal failed')
    } finally {
      setLoading(false)
    }
  }

  async function castVote(proposalId: string, vote: string) {
    if (!groupId) return
    try {
      await api.groups.vote(proposalId, userId, vote)
      await loadGroup(groupId)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Vote failed')
    }
  }

  function timeLeft(expiresAt: string) {
    const diff = new Date(expiresAt).getTime() - Date.now()
    if (diff <= 0) return 'Expired'
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  // ── Views ──────────────────────────────────────────────────────────────────

  if (view === 'home') return (
    <div className="px-4 pt-12 pb-28 space-y-5 animate-fade-in">
      <h1 className="text-2xl font-semibold">Group Portfolio</h1>
      <p className="text-sm text-muted leading-relaxed">
        Invest together with friends. Propose trades, vote as a group,
        and split profits by contribution — like a real investment club.
      </p>
      {error && <div className="rounded-xl border border-loss/30 bg-loss/5 px-4 py-3">
        <p className="text-loss text-sm">{error}</p></div>}
      <button className="btn-primary" onClick={() => setView('create')}>Create a club</button>
      <button className="btn-ghost"   onClick={() => setView('join')}>Join with invite code</button>
    </div>
  )

  if (view === 'create') return (
    <div className="px-4 pt-12 pb-28 space-y-4 animate-fade-in">
      <button className="label-xs flex items-center gap-1 text-muted mb-2"
        onClick={() => setView('home')}>← Back</button>
      <h1 className="text-2xl font-semibold">Create a club</h1>
      {error && <div className="rounded-xl border border-loss/30 bg-loss/5 px-4 py-3">
        <p className="text-loss text-sm">{error}</p></div>}
      <div className="space-y-3">
        <div>
          <p className="label-xs mb-2">Club name</p>
          <input className="input" placeholder="e.g. KSIT Investment Club"
            value={groupName} onChange={e => setGroupName(e.target.value)} />
        </div>
        <div>
          <p className="label-xs mb-2">Your contribution (₹)</p>
          <input className="input" type="number" value={contribution}
            onChange={e => setContrib(Number(e.target.value))} />
        </div>
        <button className="btn-primary" onClick={createGroup} disabled={loading}>
          {loading ? 'Creating...' : 'Create Club'}
        </button>
      </div>
    </div>
  )

  if (view === 'join') return (
    <div className="px-4 pt-12 pb-28 space-y-4 animate-fade-in">
      <button className="label-xs flex items-center gap-1 text-muted mb-2"
        onClick={() => setView('home')}>← Back</button>
      <h1 className="text-2xl font-semibold">Join a club</h1>
      {error && <div className="rounded-xl border border-loss/30 bg-loss/5 px-4 py-3">
        <p className="text-loss text-sm">{error}</p></div>}
      <div className="space-y-3">
        <div>
          <p className="label-xs mb-2">Invite code</p>
          <input className="input font-mono tracking-widest uppercase"
            placeholder="TL-XXXXXX"
            value={inviteCode} onChange={e => setInviteCode(e.target.value)} />
        </div>
        <div>
          <p className="label-xs mb-2">Your contribution (₹)</p>
          <input className="input" type="number" value={contribution}
            onChange={e => setContrib(Number(e.target.value))} />
        </div>
        <button className="btn-primary" onClick={joinGroup} disabled={loading}>
          {loading ? 'Joining...' : 'Join Club'}
        </button>
      </div>
    </div>
  )

  // ── Detail view ────────────────────────────────────────────────────────────
  return (
    <div className="px-4 pt-12 pb-28 space-y-4 animate-fade-in">
      {loading && !group ? (
        <div className="space-y-3">
          <div className="card h-24 animate-pulse" />
          <div className="card h-32 animate-pulse" />
        </div>
      ) : group ? (
        <>
          {/* Club header */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-lg">{group.name}</h2>
                <p className="text-xs text-muted mt-0.5">{group.member_count} members · {group.vote_mode} vote</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xl font-semibold">
                  ₹{group.virtual_corpus.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted">corpus</p>
              </div>
            </div>
            <div className="bg-surface rounded-xl px-3 py-2 flex items-center justify-between">
              <span className="label-xs">Invite code</span>
              <span className="font-mono text-sm font-semibold text-brand tracking-widest">
                {group.invite_code}
              </span>
            </div>
          </div>

          {/* Holdings */}
          {group.holdings.length > 0 && (
            <div>
              <p className="label-xs mb-2">Group holdings</p>
              <div className="space-y-2">
                {group.holdings.map(h => (
                  <div key={h.ticker} className="card-sm flex items-center justify-between">
                    <div>
                      <p className="font-mono font-semibold text-sm">{h.ticker}</p>
                      <p className="text-xs text-muted">{h.quantity} shares</p>
                    </div>
                    <p className="font-mono text-sm">avg ₹{h.avg_buy_price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Proposals */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="label-xs">Proposals</p>
              <button
                onClick={() => setShowPropose(!showPropose)}
                className="text-xs px-3 py-1.5 bg-brand/10 text-brand rounded-lg border border-brand/20"
              >
                + Propose
              </button>
            </div>

            {/* Propose form */}
            {showPropose && (
              <div className="card mb-3 space-y-3 border-brand/30 animate-fade-in">
                <p className="text-sm font-medium">New proposal</p>
                {error && <p className="text-loss text-xs">{error}</p>}
                <input className="input text-sm" placeholder="Ticker (e.g. TCS)"
                  value={propTicker} onChange={e => setPropTicker(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={() => setPropAction('BUY')}
                    className={clsx('flex-1 py-2 rounded-xl text-sm font-medium transition-all',
                      propAction === 'BUY' ? 'bg-profit/20 text-profit' : 'bg-surface text-muted')}>
                    Buy
                  </button>
                  <button onClick={() => setPropAction('SELL')}
                    className={clsx('flex-1 py-2 rounded-xl text-sm font-medium transition-all',
                      propAction === 'SELL' ? 'bg-loss/20 text-loss' : 'bg-surface text-muted')}>
                    Sell
                  </button>
                </div>
                <input className="input text-sm" placeholder="Quantity" type="number"
                  value={propQty} onChange={e => setPropQty(Number(e.target.value))} />
                <input className="input text-sm" placeholder="Why? (rationale)"
                  value={propNote} onChange={e => setPropNote(e.target.value)} />
                <button className="btn-primary text-sm py-3" onClick={submitProposal} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            )}

            {proposals.length === 0 ? (
              <div className="card text-center py-6 border-dashed">
                <p className="text-muted text-sm">No proposals yet</p>
                <p className="text-xs text-muted mt-1">Be the first to suggest a trade for the group</p>
              </div>
            ) : (
              <div className="space-y-3">
                {proposals.map(p => (
                  <div key={p.id} className={clsx('card space-y-3',
                    p.status === 'executed' && 'border-profit/30',
                    p.status === 'rejected' && 'border-loss/30 opacity-60',
                    p.status === 'expired'  && 'opacity-50',
                  )}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold">{p.ticker}</span>
                          <span className={clsx(
                            'text-xs px-2 py-0.5 rounded-full font-mono',
                            p.action === 'BUY' ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'
                          )}>{p.action}</span>
                          <span className="text-xs text-muted font-mono">{p.quantity} shares</span>
                        </div>
                        {p.rationale && (
                          <p className="text-xs text-muted mt-1 italic">"{p.rationale}"</p>
                        )}
                        <p className="text-xs text-muted mt-0.5">
                          by {p.proposed_by === userId ? userName : p.proposed_by.replace('demo-user-', 'User ')}
                        </p>
                      </div>
                      <div className="text-right">
                        {p.status === 'open' ? (
                          <span className={clsx(
                            'text-xs font-mono px-2 py-1 rounded-lg',
                            parseInt(timeLeft(p.expires_at)) < 2
                              ? 'bg-loss/20 text-loss animate-pulse-slow'
                              : 'bg-warning/10 text-warning'
                          )}>
                            {timeLeft(p.expires_at)}
                          </span>
                        ) : (
                          <span className={clsx('text-xs font-mono capitalize',
                            p.status === 'executed' ? 'text-profit' :
                            p.status === 'rejected' ? 'text-loss' : 'text-muted'
                          )}>{p.status}</span>
                        )}
                      </div>
                    </div>

                    {/* Vote progress */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-muted">
                        <span>{p.yes_votes} yes · {p.no_votes} no</span>
                        <span>{p.total_members} members</span>
                      </div>
                      <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                        <div className="h-full bg-profit rounded-full transition-all"
                          style={{ width: `${(p.yes_votes / Math.max(p.total_members, 1)) * 100}%` }} />
                      </div>
                    </div>

                    {/* Vote buttons */}
                    {p.status === 'open' && p.proposed_by !== userId && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => castVote(p.id, 'yes')}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                                     bg-profit/10 text-profit border border-profit/20
                                     active:scale-95 transition-transform">
                          Vote Yes
                        </button>
                        <button
                          onClick={() => castVote(p.id, 'no')}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                                     bg-loss/10 text-loss border border-loss/20
                                     active:scale-95 transition-transform">
                          Vote No
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
