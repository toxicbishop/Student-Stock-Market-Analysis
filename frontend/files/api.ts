const BASE = '/api'

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail ?? 'Request failed')
  }
  return res.json()
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface StockQuote {
  ticker: string
  name: string
  price: number
  change: number
  change_pct: number
  volume: number
  rsi: number | null
  volume_trend: string | null
  high_52w: number
  low_52w: number
}

export interface MistakeFlag {
  flag: string
  severity: string
  lesson: string
  fix: string
}

export interface AutopsyResponse {
  rule_based: MistakeFlag
  ai_explanation: string
  score: number
}

export interface HoldingOut {
  ticker: string
  quantity: number
  avg_buy_price: number
  current_price: number
  pnl: number
  pnl_pct: number
}

export interface PortfolioOut {
  user_id: string
  virtual_cash: number
  holdings: HoldingOut[]
  total_invested: number
  total_current_value: number
  total_pnl: number
  total_pnl_pct: number
}

export interface TradeOut {
  id: string
  ticker: string
  action: string
  quantity: number
  price: number
  total_value: number
  ai_analysis: string | null
  mistake_flags: string | null
  executed_at: string
}

export interface ProposalOut {
  id: string
  group_id: string
  proposed_by: string
  ticker: string
  action: string
  quantity: number
  price_at_proposal: number
  rationale: string | null
  status: string
  expires_at: string
  created_at: string
  yes_votes: number
  no_votes: number
  total_members: number
}

export interface GroupDetail {
  id: string
  name: string
  invite_code: string
  vote_mode: string
  virtual_corpus: number
  member_count: number
  members: { user_id: string; units: number; contribution: number }[]
  holdings: { ticker: string; quantity: number; avg_buy_price: number }[]
}

// ── Stock ─────────────────────────────────────────────────────────────────────

export const api = {
  stocks: {
    quote: (ticker: string) =>
      req<StockQuote>(`/stocks/quote/${ticker}`),
    search: (q: string) =>
      req<{ ticker: string; name: string }[]>(`/stocks/search?q=${q}`),
    leaderboard: () =>
      req<{ ticker: string; trades: number; change_pct: number }[]>(
        '/stocks/leaderboard-stocks'
      ),
  },

  // ── AI ────────────────────────────────────────────────────────────────────
  ai: {
    autopsy: (body: {
      ticker: string; action: string; entry_price: number
      current_price: number; rsi: number; volume_trend: string; quantity: number
    }) => req<AutopsyResponse>('/ai/autopsy', { method: 'POST', body: JSON.stringify(body) }),
  },

  // ── Portfolio ─────────────────────────────────────────────────────────────
  portfolio: {
    get: (userId: string) => req<PortfolioOut>(`/portfolio/${userId}`),
    buy: (userId: string, ticker: string, quantity: number) =>
      req<TradeOut>('/portfolio/buy', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, ticker, quantity }),
      }),
    sell: (userId: string, ticker: string, quantity: number) =>
      req<TradeOut>('/portfolio/sell', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, ticker, quantity }),
      }),
    trades: (userId: string) =>
      req<TradeOut[]>(`/portfolio/${userId}/trades`),
  },

  // ── Groups ────────────────────────────────────────────────────────────────
  groups: {
    create: (name: string, createdBy: string, contribution: number) =>
      req<{ id: string; invite_code: string }>('/groups/create', {
        method: 'POST',
        body: JSON.stringify({ name, created_by: createdBy, initial_contribution: contribution }),
      }),
    join: (userId: string, inviteCode: string, contribution: number) =>
      req('/groups/join', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, invite_code: inviteCode, contribution }),
      }),
    get: (groupId: string) => req<GroupDetail>(`/groups/${groupId}`),
    proposals: (groupId: string) => req<ProposalOut[]>(`/groups/${groupId}/proposals`),
    propose: (body: {
      group_id: string; proposed_by: string; ticker: string
      action: string; quantity: number; rationale?: string
    }) => req<ProposalOut>('/groups/propose', { method: 'POST', body: JSON.stringify(body) }),
    vote: (proposalId: string, voterId: string, vote: string) =>
      req('/groups/vote', {
        method: 'POST',
        body: JSON.stringify({ proposal_id: proposalId, voter_id: voterId, vote }),
      }),
  },

  // ── Demo ──────────────────────────────────────────────────────────────────
  demo: {
    seed: () => req('/demo/seed', { method: 'POST' }),
  },
}
