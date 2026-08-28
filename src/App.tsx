import React from 'react';
import { Routes, Route, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Search, Bell, Users, Sun, Moon } from 'lucide-react';
import { formatCurrency } from './utils';

import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { useStocks } from './hooks/useStocks';
import { usePortfolio } from './hooks/usePortfolio';
import { usePriceAlerts } from './hooks/usePriceAlerts';

import Sidebar from './components/Sidebar';
import StockCard from './components/StockCard';
import TradePanel from './components/TradePanel';
import Leaderboard from './components/Leaderboard';
import Portfolio from './components/Portfolio';
import TradeHistory from './components/TradeHistory';
import LearningCenter from './components/LearningCenter';
import PriceAlerts from './components/PriceAlerts';
import Settings from './components/Settings';
import LoginView from './components/LoginView';

const standardTransition = { duration: 0.3, ease: "easeOut" as const };

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const {
    user,
    loading,
    isSigningIn,
    authMethod,
    setAuthMethod,
    phoneNumber,
    setPhoneNumber,
    verificationCode,
    setVerificationCode,
    confirmationResult,
    setConfirmationResult,
    authError,
    handleSignIn,
    handlePhoneSignIn,
    handleOTPVerify,
    logout,
  } = useAuth();

  const {
    stocks,
    selectedStock,
    setSelectedStock,
    searchQuery,
    setSearchQuery,
    isMobileSearchOpen,
    setIsMobileSearchOpen,
    filteredStocks,
  } = useStocks();

  const {
    profile,
    holdings,
    trades,
    handleTrade,
    handleUpdateProfile,
    handleResetPortfolio,
  } = usePortfolio(user);

  const {
    alerts,
    showAlerts,
    setShowAlerts,
    notification,
    handleAddAlert,
    handleDeleteAlert,
    triggerToastNotification,
  } = usePriceAlerts(user);

  if (loading) {
    return (
      <div className="min-h-dvh w-full flex items-center justify-center bg-bg-main">
        <div className="flex flex-col items-center gap-6">
          <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted text-sm font-medium tracking-wide">Syncing market data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginView
        authMethod={authMethod}
        setAuthMethod={setAuthMethod}
        isSigningIn={isSigningIn}
        authError={authError}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        verificationCode={verificationCode}
        setVerificationCode={setVerificationCode}
        confirmationResult={confirmationResult}
        setConfirmationResult={setConfirmationResult}
        onGoogleSignIn={handleSignIn}
        onPhoneSignIn={handlePhoneSignIn}
        onOTPVerify={handleOTPVerify}
      />
    );
  }

  return (
    <div className="flex flex-col sm:flex-row min-h-dvh bg-bg-main overflow-hidden text-main">
      <Sidebar onSignOut={logout} />

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
                    <p className="text-xs font-semibold text-main">{profile?.name || 'Trader'}</p>
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

        <div className="max-w-none mx-auto">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={standardTransition}
                    className="lab-page space-y-6"
                  >
                    <Portfolio holdings={holdings} virtualBalance={profile?.virtual_cash || 0} />
                    <TradeHistory trades={trades} />
                  </motion.div>
                }
              />

              <Route
                path="/learn"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={standardTransition}
                  >
                    <LearningCenter />
                  </motion.div>
                }
              />

              <Route
                path="/trade"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={standardTransition}
                  >
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold">Market Overview</h2>
                      <p className="text-sm text-muted mt-1">Search the Indian market and practise with virtual money.</p>
                    </div>

                    {stocks.length === 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="app-panel h-44 animate-pulse bg-surface-raised" />
                        ))}
                      </div>
                    ) : filteredStocks.length === 0 ? (
                      <div className="py-20 text-center card-base">
                        <Search className="w-12 h-12 text-muted mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-bold text-main">No results found</h3>
                        <p className="text-muted text-sm mt-1">No stocks match &quot;{searchQuery}&quot;</p>
                        <button
                          onClick={() => setSearchQuery('')}
                          className="mt-6 text-brand-primary font-bold text-sm hover:underline"
                        >
                          Clear search
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStocks.map((stock, index) => (
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
                  </motion.div>
                }
              />

              <Route
                path="/rank"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={standardTransition}
                  >
                    <Leaderboard />
                  </motion.div>
                }
              />

              <Route
                path="/group"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={standardTransition}
                    className="flex flex-col items-center justify-center py-24 text-center"
                  >
                    <div className="w-16 h-16 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-6 border border-brand-primary/15">
                      <Users className="w-8 h-8 text-brand-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Campus Groups</h3>
                    <p className="text-muted max-w-sm mb-8 text-sm leading-relaxed">
                      Collaborative trading groups for educational institutions. This feature is currently in development.
                    </p>
                    <button className="btn-primary">Notify Me</button>
                  </motion.div>
                }
              />

              <Route
                path="/settings"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={standardTransition}
                  >
                    <Settings
                      profile={profile}
                      onUpdateProfile={handleUpdateProfile}
                      onResetPortfolio={() => handleResetPortfolio(triggerToastNotification)}
                    />
                  </motion.div>
                }
              />
            </Routes>
          </AnimatePresence>
        </div>

        <TradePanel
          stock={selectedStock}
          user={profile}
          onClose={() => setSelectedStock(null)}
          onTrade={async (action, amount) => {
            await handleTrade(action, amount, selectedStock);
            setSelectedStock(null);
          }}
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
              className="fixed top-0 left-1/2 -translate-x-1/2 z-100 bg-brand-primary text-[#06111f] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/20"
            >
              <Bell className="w-5 h-5 animate-bounce" />
              <div>
                <p className="font-bold text-sm">Price Alert Triggered!</p>
                <p className="text-xs opacity-80">
                  {notification.ticker} is {notification.condition === 'ABOVE' ? 'above' : 'below'}{' '}
                  {formatCurrency(notification.price)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
