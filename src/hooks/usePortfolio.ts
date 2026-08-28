import { useState, useCallback, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  doc, 
  collection, 
  getDocs, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, Holding, Trade, Stock } from '../types';

export function usePortfolio(user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);

  const fetchPortfolioData = useCallback(async (uid: string) => {
    try {
      // 1. Profile & Holdings Summary
      const resSummary = await fetch(`/api/portfolio/${uid}`);
      if (resSummary.ok) {
        const data = await resSummary.json();
        setProfile({
          uid,
          name: user?.displayName || 'Trader',
          email: user?.email || '',
          virtual_cash: data.virtual_cash,
          createdAt: Date.now(),
        });
        setHoldings(data.holdings || []);
      }

      // 2. Trade History
      const resHistory = await fetch(`/api/portfolio/history/${uid}`);
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
      const res = await fetch('/api/portfolio/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          ticker: selectedStock.ticker,
          quantity,
          action,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Trade failed');
      }

      await fetchPortfolioData(user.uid);
    } catch (error: unknown) {
      console.error('Trade failed:', error);
      throw error;
    }
  };

  const handleUpdateProfile = async (data: { name: string; bio: string }) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/users/${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      await fetchPortfolioData(user.uid);
    } catch (error: unknown) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const handleResetPortfolio = async (onSuccess?: (notification: { ticker: string; price: number; condition: string }) => void) => {
    if (!user) return;
    try {
      // 1. Reset balance
      await updateDoc(doc(db, 'users', user.uid), {
        virtualBalance: 100000,
      });

      // 2. Clear holdings
      const holdingsSnap = await getDocs(collection(db, 'users', user.uid, 'holdings'));
      await Promise.all(holdingsSnap.docs.map((d) => deleteDoc(d.ref)));

      // 3. Clear trades
      const tradesSnap = await getDocs(collection(db, 'users', user.uid, 'trades'));
      await Promise.all(tradesSnap.docs.map((d) => deleteDoc(d.ref)));

      // 4. Clear alerts
      const alertsSnap = await getDocs(collection(db, 'users', user.uid, 'priceAlerts'));
      await Promise.all(alertsSnap.docs.map((d) => deleteDoc(d.ref)));

      await fetchPortfolioData(user.uid);
      onSuccess?.({ ticker: 'PORTFOLIO', price: 100000, condition: 'RESET' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      throw error;
    }
  };

  return {
    profile,
    holdings,
    trades,
    fetchPortfolioData,
    handleTrade,
    handleUpdateProfile,
    handleResetPortfolio,
  };
}
