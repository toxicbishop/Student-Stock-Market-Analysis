import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Circle, GraduationCap, ShieldCheck, TrendingUp } from 'lucide-react';

const lessons = [
  { title: 'Start with paper money', time: '4 min', complete: true, body: 'Paper trading lets you test an idea with virtual money before you risk savings. Treat each order as a small experiment: write down why you are buying, when you will exit, and what would prove you wrong.' },
  { title: 'Read a stock quote', time: '6 min', complete: true, body: 'A quote tells you the current price, daily move, and recent trend. Price alone is not a recommendation. Compare the move with the company, its sector, and the broader market before you act.' },
  { title: 'Build a balanced portfolio', time: '7 min', complete: false, body: 'Diversification means your outcome is not tied to a single company. Begin with a small number of positions across different sectors. Review concentration before adding to a position.' },
  { title: 'Set a trade thesis', time: '5 min', complete: false, body: 'A trade thesis is a short, testable reason for an order. State the catalyst, the downside you accept, and the condition that would make you exit. This makes reflection useful after the trade.' },
];

const LearningCenter: React.FC = () => {
  const [active, setActive] = useState(0);
  const lesson = lessons[active];
  return <div className="lab-page">
    <header className="lab-page-header">
      <div><div className="flex items-center gap-2 text-brand-primary text-sm font-semibold"><GraduationCap className="w-4 h-4" /> Learning lab</div><h1 className="lab-page-title mt-2">Learn before you trade.</h1><p className="lab-page-subtitle">Short lessons designed for your first market decisions.</p></div>
      <div className="text-right"><p className="text-2xl font-bold text-main">2 / 4</p><p className="text-xs text-muted">lessons completed</p></div>
    </header>
    <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-5">
      <aside className="lab-surface overflow-hidden" aria-label="Lessons">
        <div className="lab-surface-header"><span className="font-semibold text-sm">Curriculum</span><BookOpen className="w-4 h-4 text-muted" /></div>
        <div className="p-2">{lessons.map((item, index) => <button key={item.title} onClick={() => setActive(index)} className={`w-full text-left p-3 rounded-lg transition-colors ${active === index ? 'bg-brand-primary/10 text-main' : 'text-muted hover:bg-surface-raised hover:text-main'}`}>
          <div className="flex gap-3"><span className="mt-0.5">{item.complete ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4" />}</span><span><span className="block text-sm font-semibold">{item.title}</span><span className="block text-xs mt-1 opacity-75">{item.time}</span></span></div>
        </button>)}</div>
      </aside>
      <article className="lab-surface p-6 md:p-10 min-h-[440px] flex flex-col">
        <div className="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-8"><TrendingUp className="w-5 h-5" /></div>
        <p className="metric-label">Lesson {active + 1}</p><h2 className="text-3xl font-bold tracking-tight mt-3">{lesson.title}</h2><p className="text-lg text-muted leading-relaxed max-w-2xl mt-6">{lesson.body}</p>
        <div className="mt-auto pt-10 border-t border-border flex items-center justify-between gap-4"><div className="flex items-center gap-2 text-xs text-muted"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Educational content, not investment advice</div><button className="btn-primary whitespace-nowrap" onClick={() => setActive(Math.min(active + 1, lessons.length - 1))}>{active === lessons.length - 1 ? 'Review lesson' : 'Next lesson'}</button></div>
      </article>
    </div>
  </div>;
};

export default LearningCenter;
