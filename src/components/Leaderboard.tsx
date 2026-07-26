import React, { useState } from 'react';
import { Trophy, TrendingUp } from 'lucide-react';

const entries = [
  { rank: 1, name: 'Arjun K.', value: '₹15,400', change: '+2.15%' },
  { rank: 2, name: 'Neha R.', value: '₹14,200', change: '+1.23%' },
  { rank: 3, name: 'Vikram S.', value: '₹13,500', change: '+1.69%' },
  { rank: 4, name: 'Priya M.', value: '₹12,350', change: '+2.00%' },
  { rank: 5, name: 'Rohit K.', value: '₹11,439', change: '+1.23%' },
  { rank: 6, name: 'Farhan J.', value: '₹10,915', change: '+1.05%' },
];

const Leaderboard: React.FC = () => {
  const [scope, setScope] = useState<'Campus' | 'Global'>('Campus');
  return <div className="lab-page">
    <header className="lab-page-header"><div><div className="flex items-center gap-2 text-brand-primary text-sm font-semibold"><Trophy className="w-4 h-4" /> Rankings</div><h1 className="lab-page-title mt-2">Learn with your cohort.</h1><p className="lab-page-subtitle">Rankings reflect paper-trading portfolio performance.</p></div><div className="flex gap-1 bg-surface-raised border border-border rounded-lg p-1" role="tablist" aria-label="Ranking scope">{(['Campus', 'Global'] as const).map(item => <button key={item} role="tab" aria-selected={scope === item} className="lab-tab" onClick={() => setScope(item)}>{item}</button>)}</div></header>
    <section className="grid grid-cols-1 md:grid-cols-[1.4fr_.6fr] gap-5">
      <div className="lab-surface overflow-hidden"><div className="lab-surface-header"><div><h2 className="font-semibold">{scope} leaderboard</h2><p className="text-xs text-muted mt-1">Portfolio value this week</p></div><span className="text-xs text-muted">Updated today</span></div><div className="hidden md:grid grid-cols-[56px_minmax(0,1.3fr)_minmax(0,1fr)_auto] gap-4 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-muted"><span>Rank</span><span>Trader</span><span>Portfolio</span><span>Week</span></div>{entries.map(entry => <div className="lab-row" key={entry.rank}><span className={`font-bold ${entry.rank <= 3 ? 'text-brand-primary' : 'text-muted'}`}>#{entry.rank}</span><span><span className="block text-sm font-semibold text-main">{entry.name}</span><span className="block text-xs text-muted mt-1">Student investor</span></span><span className="lab-hide-mobile text-sm font-semibold text-main">{entry.value}</span><span className="text-sm font-semibold text-emerald-400">{entry.change}</span></div>)}</div>
      <aside className="lab-surface p-6 flex flex-col"><p className="metric-label">Your standing</p><p className="text-5xl font-bold tracking-tighter mt-4">#45</p><p className="text-sm text-muted mt-2">of 128 students in your campus lab</p><div className="mt-8 p-4 rounded-lg bg-brand-primary/10 border border-brand-primary/15"><TrendingUp className="w-5 h-5 text-brand-primary" /><p className="font-semibold text-sm text-main mt-3">You moved up 3 places.</p><p className="text-xs text-muted mt-1">Review your last trade to keep improving.</p></div></aside>
    </section>
  </div>;
};
export default Leaderboard;
