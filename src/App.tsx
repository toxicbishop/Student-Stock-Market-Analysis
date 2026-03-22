import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  increment,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { auth, db, signInWithGoogle, logout, handleFirestoreError, OperationType, RecaptchaVerifier, signInWithPhoneNumber } from './firebase';
import { Stock, UserProfile, Holding, Trade, PriceAlert } from './types';
import Sidebar from './components/Sidebar';
import StockCard from './components/StockCard';
import TradePanel from './components/TradePanel';
import Leaderboard from './components/Leaderboard';
import Portfolio from './components/Portfolio';
import TradeHistory from './components/TradeHistory';
import LearningCenter from './components/LearningCenter';
import PriceAlerts from './components/PriceAlerts';
import Settings from './components/Settings';
import { analyzeTrade } from './services/aiService';
import { TrendingUp, Search, Bell, User as UserIcon, LogIn, Users, BookOpen, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from './utils';

const App: React.FC = () => {
  console.log("TradeLab App Component executing!");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [showAlerts, setShowAlerts] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ ticker: string, price: number, condition: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    const handleAlert = (e: any) => {
      setNotification(e.detail);
      setTimeout(() => setNotification(null), 5000);
    };
    window.addEventListener('price-alert', handleAlert as any);
    return () => window.removeEventListener('price-alert', handleAlert as any);
  }, []);

  const fetchPortfolioData = async (uid: string) => {
    try {
      // 1. Profile & Holdings Summary
      const resSummary = await fetch(`/api/portfolio/${uid}`);
      if (resSummary.ok) {
        const data = await resSummary.json();
        setProfile({
          uid,
          name: auth.currentUser?.displayName || 'Trader',
          email: auth.currentUser?.email || '',
          virtual_cash: data.virtual_cash,
          createdAt: Date.now()
        });
        setHoldings(data.holdings);
      }

      // 2. Trade History
      const resHistory = await fetch(`/api/portfolio/history/${uid}`);
      if (resHistory.ok) {
        const history = await resHistory.json();
        setTrades(history);
      }
    } catch (e) {
      console.error("Failed to sync portfolio data:", e);
    }
  };

  const handleTrade = async (action: 'BUY' | 'SELL', amount: number) => {
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
          action
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Trade failed");
      }

      await fetchPortfolioData(user.uid);
      setSelectedStock(null);
      
    } catch (error: any) {
      console.error("Trade failed:", error);
    }
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchPortfolioData(firebaseUser.uid);
      } else {
        setProfile(null);
        setHoldings([]);
        setTrades([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddAlert = async (ticker: string, targetPrice: number, condition: 'ABOVE' | 'BELOW') => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'priceAlerts'), {
        ticker,
        targetPrice,
        condition,
        isActive: true,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/priceAlerts`);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'priceAlerts', alertId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/priceAlerts/${alertId}`);
    }
  };

  const handleUpdateProfile = async (data: { name: string, bio: string }) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/users/${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update profile");
      await fetchPortfolioData(user.uid);
    } catch (error: any) {
      console.error("Profile update failed:", error);
      throw error;
    }
  };

  const handleResetPortfolio = async () => {
    if (!user) return;
    try {
      // 1. Reset balance
      await updateDoc(doc(db, 'users', user.uid), {
        virtualBalance: 100000
      });

      // 2. Clear holdings
      const holdingsSnap = await getDocs(collection(db, 'users', user.uid, 'holdings'));
      const deletePromises = holdingsSnap.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // 3. Clear trades
      const tradesSnap = await getDocs(collection(db, 'users', user.uid, 'trades'));
      const deleteTradesPromises = tradesSnap.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteTradesPromises);

      // 4. Clear alerts
      const alertsSnap = await getDocs(collection(db, 'users', user.uid, 'priceAlerts'));
      const deleteAlertsPromises = alertsSnap.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteAlertsPromises);

      setNotification({ ticker: 'PORTFOLIO', price: 100000, condition: 'RESET' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      throw error;
    }
  };

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authMethod, setAuthMethod] = useState<'google' | 'phone'>('google');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const setupRecaptcha = (buttonId: string) => {
    try {
      return new RecaptchaVerifier(auth, buttonId, {
        'size': 'invisible',
        'callback': () => {
          console.log('Recaptcha resolved');
        }
      });
    } catch (e) {
      console.error("Recaptcha error:", e);
      return null;
    }
  };

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSigningIn) return;
    setAuthError(null);
    try {
      setIsSigningIn(true);
      const appVerifier = setupRecaptcha('sign-in-button');
      if (!appVerifier) throw new Error("Recaptcha failed");

      // Format phone number if it doesn't have a plus
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
    } catch (error: any) {
      console.error("Phone sign-in error:", error);
      setAuthError(error.message || "Failed to send verification code");
      // Reset captcha
      if ((window as any).recaptchaWidgetId !== undefined) {
        window.location.reload(); 
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSigningIn || !confirmationResult) return;
    setAuthError(null);
    try {
      setIsSigningIn(true);
      await confirmationResult.confirm(verificationCode);
    } catch (error: any) {
      console.error("OTP verification error:", error);
      setAuthError("Invalid verification code. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignIn = async () => {
    if (isSigningIn) return;
    setAuthError(null);
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        console.warn("Sign-in popup closed before completion.");
      } else {
        console.error("Sign-in error:", error);
        setAuthError("Google sign-in failed. Please try again.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg-main">
        <div className="flex flex-col items-center gap-6">
          <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted text-sm font-medium tracking-wide">Syncing market data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg-main p-6">
        <div className="card-base p-8 sm:p-10 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <TrendingUp className="text-brand-primary w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold mb-3 tracking-tight">TradeLab</h1>
          <p className="text-muted mb-8 text-sm leading-relaxed px-4">
            Practice stock market trading with virtual currency. Learn market dynamics risk-free.
          </p>

          <div className="space-y-4">
            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-2 px-3 rounded-lg mb-4">
                {authError}
              </div>
            )}

            {authMethod === 'google' ? (
              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className={`btn-primary w-full flex items-center justify-center gap-3 py-3 ${isSigningIn ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isSigningIn ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                {isSigningIn ? 'Connecting...' : 'Continue with Google'}
              </button>
            ) : (
              <div className="space-y-4 text-left">
                {!confirmationResult ? (
                  <form onSubmit={handlePhoneSignIn} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Phone Number</label>
                      <input 
                        type="tel" 
                        placeholder="+91 99999 99999"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-surface-hover border border-border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-brand-primary/50 text-sm"
                        required
                      />
                    </div>
                    <button
                      id="sign-in-button"
                      type="submit"
                      disabled={isSigningIn}
                      className="btn-primary w-full py-2.5 text-sm font-bold tracking-wide"
                    >
                      {isSigningIn ? 'Sending Code...' : 'Get OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleOTPVerify} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Verification Code</label>
                      <input 
                        type="text" 
                        placeholder="Enter 6-digit OTP"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full bg-surface-hover border border-border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-brand-primary/50 text-sm text-center tracking-[0.5em] font-bold"
                        maxLength={6}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSigningIn}
                      className="btn-primary w-full py-2.5 text-sm font-bold tracking-wide"
                    >
                      {isSigningIn ? 'Verifying...' : 'Verify & Continue'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setConfirmationResult(null)}
                      className="w-full text-center text-xs text-muted hover:text-main transition-colors"
                    >
                      Change phone number
                    </button>
                  </form>
                )}
              </div>
            )}

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-tighter"><span className="bg-bg-main px-2 text-slate-500 font-bold">OR</span></div>
            </div>

            <button
              onClick={() => {
                setAuthMethod(authMethod === 'google' ? 'phone' : 'google');
                setAuthError(null);
                setConfirmationResult(null);
              }}
              className="w-full py-2.5 rounded-lg border border-border hover:bg-surface-hover transition-all text-xs font-bold text-muted flex items-center justify-center gap-2"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign in with {authMethod === 'google' ? 'Phone' : 'Google'}
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-white/5">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold opacity-60">
              Electrohack 3.0 Entry
            </p>
          </div>
        </div>
      </div>
    );
  }

  const standardTransition: any = { duration: 0.3, ease: "easeOut" };

  return (
    <div className="flex flex-col sm:flex-row h-screen bg-bg-main overflow-hidden text-main">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onSignOut={logout} 
      />

      <main className="flex-1 overflow-y-auto relative pb-20 sm:pb-0">
        <header className="sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-4 lg:py-5 flex justify-between items-center bg-bg-main/90 backdrop-blur-md border-b border-border">
          {isMobileSearchOpen ? (
            <div className="flex-1 flex items-center gap-3 sm:hidden">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Search stocks..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all text-sm placeholder:text-muted"
                />
              </div>
              <button 
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-muted uppercase tracking-wider"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 sm:hidden">
                <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-brand-primary w-5 h-5" />
                </div>
                <h1 className="text-lg font-bold tracking-tight text-main">TradeLab</h1>
              </div>

              <div className="relative w-64 lg:w-80 hidden sm:block">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input 
                  type="text" 
                  placeholder="Search stocks..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all text-sm placeholder:text-muted"
                />
              </div>
              
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
                <button 
                  onClick={() => setIsMobileSearchOpen(true)}
                  className="p-2 hover:bg-surface-hover rounded-lg transition-colors sm:hidden"
                >
                  <Search className="w-5 h-5 text-muted" />
                </button>
                <button 
                  onClick={toggleTheme}
                  className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                  title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                  {theme === 'light' ? <Moon className="w-5 h-5 text-muted" /> : <Sun className="w-5 h-5 text-muted" />}
                </button>
                <button 
                  onClick={() => setShowAlerts(true)}
                  className="relative p-2 hover:bg-surface-hover rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5 text-muted" />
                  {alerts.length > 0 && (
                    <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-brand-primary rounded-full" />
                  )}
                </button>
                <div className="flex items-center gap-3 lg:gap-4 pl-3 lg:pl-5 border-l border-border">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-main">{profile?.name}</p>
                    <p className="text-[10px] text-brand-primary font-bold uppercase tracking-wider">Verified Account</p>
                  </div>
                  <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border border-brand-primary/30 p-0.5">
                    <img 
                      src={profile?.photoURL || 'https://i.pravatar.cc/150'} 
                      alt="" 
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={standardTransition}
                className="space-y-12"
              >
                <Portfolio holdings={holdings} virtualBalance={profile?.virtual_cash || 0} />
                <TradeHistory trades={trades} />
              </motion.div>
            )}

            {activeTab === 'learn' && (
              <motion.div
                key="learn"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={standardTransition}
              >
                <LearningCenter />
              </motion.div>
            )}

            {activeTab === 'trade' && (
              <motion.div
                key="trade"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={standardTransition}
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold">Market Overview</h2>
                  <p className="text-sm text-slate-400 mt-1">Select a stock to begin trading.</p>
                </div>
                
                {stocks.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="card-base h-48 animate-pulse bg-slate-800/50" />
                    ))}
                  </div>
                ) : (
                  <>
                    {stocks.filter(s => 
                      s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      s.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length === 0 ? (
                      <div className="py-20 text-center card-base">
                        <Search className="w-12 h-12 text-muted mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-bold text-main">No results found</h3>
                        <p className="text-muted text-sm mt-1">No stocks match "{searchQuery}"</p>
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="mt-6 text-brand-primary font-bold text-sm hover:underline"
                        >
                          Clear search
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stocks
                          .filter(s => 
                            s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.name.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((stock, index) => (
                            <motion.div
                              key={stock.ticker}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ ...standardTransition, delay: index * 0.05 }}
                            >
                              <StockCard stock={stock} onClick={setSelectedStock} />
                            </motion.div>
                          ))}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {activeTab === 'rank' && (
              <motion.div
                key="rank"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={standardTransition}
              >
                <Leaderboard />
              </motion.div>
            )}

            {activeTab === 'group' && (
              <motion.div
                key="group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={standardTransition}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Campus Groups</h3>
                <p className="text-slate-400 max-w-sm mb-8 text-sm leading-relaxed">
                  Collaborative trading groups for educational institutions. This feature is currently in development.
                </p>
                <button className="btn-primary">
                  Notify Me
                </button>
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={standardTransition}
              >
                <Settings 
                  profile={profile} 
                  onUpdateProfile={handleUpdateProfile} 
                  onResetPortfolio={handleResetPortfolio} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <TradePanel 
          stock={selectedStock} 
          user={profile} 
          onClose={() => setSelectedStock(null)} 
          onTrade={handleTrade}
        />
        <AnimatePresence>
          {showAlerts && (
            <PriceAlerts 
              alerts={alerts}
              stocks={stocks}
              onAddAlert={handleAddAlert}
              onDeleteAlert={handleDeleteAlert}
              onClose={() => setShowAlerts(false)}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 20 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] bg-alert-accent text-alert-dark px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/20"
            >
              <Bell className="w-5 h-5 animate-bounce" />
              <div>
                <p className="font-bold text-sm">Price Alert Triggered!</p>
                <p className="text-xs opacity-80">{notification.ticker} is {notification.condition === 'ABOVE' ? 'above' : 'below'} {formatCurrency(notification.price)}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
