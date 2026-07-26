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
  bio?: string;
  college?: string;
  virtual_cash: number;
  createdAt: TimestampValue;
}

export interface Holding {
  id: string;
  ticker: string;
  quantity: number;
  avg_buy_price: number;
  last_updated: TimestampValue;
}

export interface Trade {
  id: string;
  ticker: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total_value: number;
  ai_analysis?: string;
  mistake_flags?: string;
  executed_at: TimestampValue;
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
