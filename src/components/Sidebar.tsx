import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Users, Trophy, Settings, LogOut, BookOpen } from 'lucide-react';
import { cn } from '../utils';

interface SidebarProps {
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSignOut }) => {
  const location = useLocation();
  const activeTab = location.pathname;

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/trade', icon: TrendingUp, label: 'Market' },
    { path: '/learn', icon: BookOpen, label: 'Learning' },
    { path: '/group', icon: Users, label: 'Groups' },
    { path: '/rank', icon: Trophy, label: 'Rank' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden sm:flex w-[76px] lg:w-60 h-screen flex-col border-r border-border bg-surface shrink-0 transition-all duration-300">
        <div className="p-5 lg:p-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-primary/15 rounded-lg flex items-center justify-center shrink-0 border border-brand-primary/20">
              <TrendingUp className="text-brand-primary w-5 h-5" />
            </div>
            <div className="hidden lg:block"><h1 className="text-lg font-bold tracking-tight text-main leading-none">TradeLab</h1><p className="text-[10px] text-muted mt-1">Campus market lab</p></div>
          </div>
        </div>

        <nav className="flex-1 px-3 lg:px-3 space-y-1.5 mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "w-full flex items-center justify-center lg:justify-start gap-3 px-3 lg:px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm border border-transparent",
                activeTab === item.path 
                  ? "bg-brand-primary/10 text-brand-primary border-brand-primary/15"
                  : "text-muted hover:bg-surface-hover hover:text-main"
              )}
              title={item.label}
            >
              <item.icon className={cn(
                "w-5 h-5 lg:w-4.5 lg:h-4.5 transition-colors",
                activeTab === item.path ? "text-brand-primary" : "text-muted group-hover:text-main"
              )} />
              <span className="font-semibold hidden lg:block">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-3 lg:p-3 space-y-1 border-t border-border">
          <Link 
            to="/settings"
            className={cn(
              "w-full flex items-center justify-center lg:justify-start gap-3 px-3 lg:px-3 py-2.5 rounded-lg transition-all text-sm",
              activeTab === '/settings' 
                ? "bg-brand-primary/10 text-brand-primary" 
                : "text-muted hover:bg-surface-hover hover:text-main"
            )}
            title="Settings"
          >
            <Settings className={cn(
              "w-5 h-5 lg:w-4.5 lg:h-4.5",
              activeTab === '/settings' ? "text-brand-primary" : "text-muted"
            )} />
            <span className="font-semibold hidden lg:block">Settings</span>
          </Link>
          <button 
            onClick={onSignOut}
            className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 lg:px-3 py-2.5 rounded-lg text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 lg:w-4.5 lg:h-4.5" />
            <span className="font-semibold hidden lg:block">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-surface/95 backdrop-blur-lg border-t border-border flex items-center justify-around px-2 z-50 pb-[env(safe-area-inset-bottom)]">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 min-w-12 px-2 py-1.5 rounded-lg transition-all",
              activeTab === item.path ? "text-brand-primary bg-brand-primary/10" : "text-muted"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
