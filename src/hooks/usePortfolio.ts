import { useState, useCallback, useEffect } from 'react';
import { User } from 'firebase/auth';
import { getAuthHeaders } from '../lib/api';
import { UserProfile, Holding, Trade, Stock } from '../types';

interface PortfolioSummary {
  virtual_cash: number;
  total_invested: number;
  total_current_value: number;
  total_pnl: number;
  total_pnl_pct: number;
}

export function usePortfolio(user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary>({
    virtual_cash: 0,
    total_invested: 0,
    total_current_value: 0,
    total_pnl: 0,
    total_pnl_pct: 0,
  });

  const fetchPortfolioData = useCallback(async (uid: string) => {
    try {
      const headers = await getAuthHeaders();

      // 1. Portfolio summary (holdings + valuation)
      const resSummary = await fetch(`/api/portfolio/${uid}`, { headers });
      if (resSummary.ok) {
        const data = await resSummary.json();
        setProfile({
          uid,
          name: user?.displayName || 'Trader',
          email: user?.email || '',
          photoURL: user?.photoURL || undefined,
          virtual_cash: data.virtual_cash,
          createdAt: Date.now(),
        });
        setHoldings(data.holdings || []);
        setSummary({
          virtual_cash: data.virtual_cash,
          total_invested: data.total_invested,
          total_current_value: data.total_current_value,
          total_pnl: data.total_pnl,
          total_pnl_pct: data.total_pnl_pct,
        });
      }

      // 2. Trade history
      const resHistory = await fetch(`/api/portfolio/history/${uid}`, { headers });
      if (resHistory.ok) {
        const history = await resHistory.json();
        setTrades(Array.isArray(history) ? history : []);
      }
    } catch (e) {
      console.error('Failed to sync portfolio data:', e);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPortfolioData(user.uid);
    } else {
      setProfile(null);
      setHoldings([]);
      setTrades([]);
      setSummary({
        virtual_cash: 0,
        total_invested: 0,
        total_current_value: 0,
        total_pnl: 0,
        total_pnl_pct: 0,
      });
    }
  }, [user, fetchPortfolioData]);

  const handleTrade = async (
    action: 'BUY' | 'SELL',
    amount: number,
    selectedStock: Stock | null
  ) => {
    if (!user || !selectedStock || !profile) return;

    const quantity = amount / selectedStock.price;

    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/portfolio/trade', {
        method: 'POST',
        headers,
        // userId is intentionally omitted — derived server-side from the token.
        body: JSON.stringify({
          ticker: selectedStock.ticker,
          quantity,
          action,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || error.error || 'Trade failed');
      }

      await fetchPortfolioData(user.uid);
    } catch (error: unknown) {
      console.error('Trade failed:', error);
      throw error;
    }
  };

  /**
   * Updates the user's profile via PATCH /api/users/{uid}.
   * Accepts any subset of the UserUpdateRequest fields.
   */
  const handleUpdateProfile = async (data: {
    name?: string;
    bio?: string;
    college?: string;
    profile_photo?: string;
  }) => {
    if (!user) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/users/${user.uid}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      await fetchPortfolioData(user.uid);
    } catch (error: unknown) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  /**
   * Resets the portfolio via the backend endpoint.
   * All data lives in SQLite — no Firestore writes needed.
   */
  const handleResetPortfolio = async (
    onSuccess?: (notification: { ticker: string; price: number; condition: string }) => void
  ) => {
    if (!user) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/portfolio/reset', {
        method: 'POST',
        headers,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Reset failed');
      }
      const data = await res.json();
      await fetchPortfolioData(user.uid);
      onSuccess?.({ ticker: 'PORTFOLIO', price: data.virtual_cash, condition: 'RESET' });
    } catch (error: unknown) {
      console.error('Portfolio reset failed:', error);
      throw error;
    }
  };

  return {
    profile,
    holdings,
    trades,
    summary,
    fetchPortfolioData,
    handleTrade,
    handleUpdateProfile,
    handleResetPortfolio,
  };
}
