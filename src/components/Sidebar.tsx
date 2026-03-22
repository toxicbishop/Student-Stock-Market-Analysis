import React from 'react';
import { Home, TrendingUp, Users, Trophy, Settings, LogOut, BookOpen } from 'lucide-react';
import { cn } from '../utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onSignOut }) => {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Dashboard' },
    { id: 'trade', icon: TrendingUp, label: 'Market' },
    { id: 'learn', icon: BookOpen, label: 'Learning' },
    { id: 'group', icon: Users, label: 'Groups' },
    { id: 'rank', icon: Trophy, label: 'Rank' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden sm:flex w-20 lg:w-64 h-screen flex-col border-r border-border bg-surface shrink-0 transition-all duration-300">
        <div className="p-6 lg:p-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp className="text-brand-primary w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-main hidden lg:block">TradeLab</h1>
          </div>
        </div>

        <nav className="flex-1 px-3 lg:px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center justify-center lg:justify-start gap-3.5 px-3 lg:px-4 py-2.5 rounded-lg transition-all duration-200 group text-sm",
                activeTab === item.id 
                  ? "bg-brand-primary/10 text-brand-primary" 
                  : "text-muted hover:bg-surface-hover hover:text-main"
              )}
              title={item.label}
            >
              <item.icon className={cn(
                "w-5 h-5 lg:w-4.5 lg:h-4.5 transition-colors",
                activeTab === item.id ? "text-brand-primary" : "text-muted group-hover:text-main"
              )} />
              <span className="font-semibold hidden lg:block">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 lg:p-4 space-y-1 border-t border-border">
          <button 
            onClick={() => onTabChange('settings')}
            className={cn(
              "w-full flex items-center justify-center lg:justify-start gap-3.5 px-3 lg:px-4 py-2.5 rounded-lg transition-all text-sm",
              activeTab === 'settings' 
                ? "bg-brand-primary/10 text-brand-primary" 
                : "text-muted hover:bg-surface-hover hover:text-main"
            )}
            title="Settings"
          >
            <Settings className={cn(
              "w-5 h-5 lg:w-4.5 lg:h-4.5",
              activeTab === 'settings' ? "text-brand-primary" : "text-muted"
            )} />
            <span className="font-semibold hidden lg:block">Settings</span>
          </button>
          <button 
            onClick={onSignOut}
            className="w-full flex items-center justify-center lg:justify-start gap-3.5 px-3 lg:px-4 py-2.5 rounded-lg text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 lg:w-4.5 lg:h-4.5" />
            <span className="font-semibold hidden lg:block">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-lg border-t border-border flex items-center justify-around px-2 z-50">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all",
              activeTab === item.id ? "text-brand-primary" : "text-muted"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
