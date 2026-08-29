export type TimestampValue = Date | number | string | { toDate: () => Date } | null;

export interface Stock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  trend: number[];
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  /** Mirrors UserUpdateRequest optional fields */
  bio?: string;
  college?: string;
  profile_photo?: string;
  virtual_cash: number;
  createdAt: TimestampValue;
}

/**
 * Mirrors backend HoldingSchema — includes live market valuation fields
 * returned by GET /portfolio/{user_id}.
 */
export interface Holding {
  ticker: string;
  quantity: number;
  avg_buy_price: number;
  /** Live market price fetched server-side from Yahoo Finance */
  current_price: number;
  /** Unrealised P&L in ₹ */
  pnl: number;
  /** Unrealised P&L as a percentage */
  pnl_pct: number;
}

/**
 * Mirrors the trade history shape returned by GET /portfolio/history/{user_id}.
 */
export interface Trade {
  id: string;
  portfolio_id: string;
  ticker: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total_value: number;
  rsi_at_trade?: number | null;
  volume_trend?: string | null;
  ai_analysis?: string | null;
  mistake_flags?: string | null;
  mistakeFlags?: object[];
  executed_at: string;
}

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  virtualCorpus: number;
  createdBy: string;
  createdAt: TimestampValue;
}

export interface PriceAlert {
  id: string;
  ticker: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  isActive: boolean;
  createdAt: TimestampValue;
}
