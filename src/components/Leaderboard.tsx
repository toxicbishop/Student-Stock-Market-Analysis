import React from 'react';
import { Trophy, Medal, BarChart3 } from 'lucide-react';
import { cn, formatCompactNumber } from '../utils';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend
);

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  change: string;
  photoURL?: string;
}

const Leaderboard: React.FC = () => {
  const topThree: LeaderboardEntry[] = [
    { rank: 2, name: 'Neha R.', points: 14200, change: '+1.23%', photoURL: 'https://i.pravatar.cc/150?u=neha' },
    { rank: 1, name: 'Arjun K.', points: 15400, change: '+2.15%', photoURL: 'https://i.pravatar.cc/150?u=arjun' },
    { rank: 3, name: 'Vikram S.', points: 13500, change: '+1.69%', photoURL: 'https://i.pravatar.cc/150?u=vikram' },
  ];

  const others: LeaderboardEntry[] = [
    { rank: 4, name: 'Priya M.', points: 12350, change: '+2.00%', photoURL: 'https://i.pravatar.cc/150?u=priya' },
    { rank: 5, name: 'Rohit K.', points: 11439, change: '+1.23%', photoURL: 'https://i.pravatar.cc/150?u=rohit' },
    { rank: 6, name: 'Phavar J.', points: 10915, change: '+1.05%', photoURL: 'https://i.pravatar.cc/150?u=phavar' },
    { rank: 7, name: 'Bent R.', points: 9500, change: '+1.02%', photoURL: 'https://i.pravatar.cc/150?u=bent' },
    { rank: 8, name: 'Jom G.', points: 8901, change: '+0.87%', photoURL: 'https://i.pravatar.cc/150?u=jom' },
  ];

  const allEntries = [...topThree, ...others].sort((a, b) => b.points - a.points);

  const barData = {
    labels: allEntries.map(e => e.name),
    datasets: [
      {
        label: 'Points',
        data: allEntries.map(e => e.points),
        backgroundColor: allEntries.map(e => 
          e.rank === 1 ? 'rgba(234, 179, 8, 0.6)' : 
          e.rank === 2 ? 'rgba(148, 163, 184, 0.6)' : 
          e.rank === 3 ? 'rgba(180, 83, 9, 0.6)' : 
          'rgba(9, 132, 227, 0.4)'
        ),
        borderColor: allEntries.map(e => 
          e.rank === 1 ? 'rgba(234, 179, 8, 1)' : 
          e.rank === 2 ? 'rgba(148, 163, 184, 1)' : 
          e.rank === 3 ? 'rgba(180, 83, 9, 1)' : 
          'rgba(9, 132, 227, 1)'
        ),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1E272E',
        titleColor: '#F5F6FA',
        bodyColor: '#A4B0BE',
        borderColor: 'rgba(245, 246, 250, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(245, 246, 250, 0.05)' },
        ticks: { color: '#A4B0BE', font: { size: 10 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#A4B0BE', font: { size: 10 } },
      },
    },
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-12 sm:mb-20 gap-10 sm:gap-12 px-4 sm:px-12">
        {topThree.map((entry) => (
          <div 
            key={entry.name}
            className={cn(
              "flex flex-col items-center",
              entry.rank === 1 ? "sm:order-2 sm:scale-110 sm:-translate-y-6" : entry.rank === 2 ? "sm:order-1" : "sm:order-3"
            )}
          >
            <div className="relative mb-4 sm:mb-6">
              <div className={cn(
                "w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 border-2",
                entry.rank === 1 ? "border-yellow-500" : 
                entry.rank === 2 ? "border-slate-400" : 
                "border-amber-700"
              )}>
                <img 
                  src={entry.photoURL} 
                  alt={entry.name} 
                  className="w-full h-full rounded-full grayscale-[20%] hover:grayscale-0 transition-all duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className={cn(
                "absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold shadow-xl border-2 border-slate-900",
                entry.rank === 1 ? "bg-yellow-500 text-black" : 
                entry.rank === 2 ? "bg-slate-400 text-black" : 
                "bg-amber-700 text-white"
              )}>
                {entry.rank}
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-sm sm:text-base text-main">{entry.name}</h3>
              <p className="text-[10px] text-muted uppercase tracking-[0.1em] font-bold mt-1">{formatCompactNumber(entry.points)} PTS</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card-base p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 className="w-4.5 h-4.5 text-brand-primary" />
          <h2 className="text-base font-bold text-main">Points Distribution</h2>
        </div>
        <div className="h-[250px] sm:h-[300px] relative">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      <div className="card-base overflow-hidden">
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-border flex justify-between items-center bg-surface-hover">
          <h2 className="text-sm sm:text-base font-bold text-main">Global Ranking</h2>
          <div className="flex gap-2">
            <button className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-[9px] sm:text-[10px] font-bold border border-brand-primary/20">Friends</button>
            <button className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold text-muted hover:text-main transition-colors">Global</button>
          </div>
        </div>
        <div className="divide-y divide-border">
          {others.map((entry) => (
            <div key={entry.name} className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 hover:bg-surface-hover transition-colors duration-200 group">
              <span className="w-4 sm:w-6 text-[10px] sm:text-xs font-bold text-muted group-hover:text-muted/80 transition-colors">{entry.rank}</span>
              <img 
                src={entry.photoURL} 
                alt={entry.name} 
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-border grayscale-[30%] group-hover:grayscale-0 transition-all duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1">
                <h4 className="font-bold text-xs sm:text-sm text-main">{entry.name}</h4>
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm font-bold text-main">{entry.points.toLocaleString()}</p>
                <p className="text-[10px] sm:text-[11px] font-bold text-emerald-500">{entry.change}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 sm:mt-10 p-5 sm:p-8 card-base border-brand-primary/20 flex items-center gap-4 sm:gap-6 bg-brand-primary/5">
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 border-brand-primary p-0.5 sm:p-1">
          <img 
            src="https://i.pravatar.cc/150?u=me" 
            alt="Me" 
            className="w-full h-full rounded-full"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm sm:text-base text-main">Your Standing</h4>
          <div className="w-full h-1.5 sm:h-2 bg-surface-hover rounded-full mt-2 sm:mt-3 overflow-hidden">
            <div className="w-3/4 h-full bg-brand-primary" />
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-xl sm:text-2xl text-main">#45</p>
          <p className="text-[10px] sm:text-[11px] font-bold text-emerald-500">+3.2%</p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
