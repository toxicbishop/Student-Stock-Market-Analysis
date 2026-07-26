import React from 'react';
import { Link } from 'react-router-dom';
import { Holding } from '../types';
import { formatCurrency } from '../utils';
import { TrendingUp, Briefcase, PieChart as PieIcon, BarChart3, ArrowRight, BookOpen, Target } from 'lucide-react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  Title
);

interface PortfolioProps {
  holdings: Holding[];
  virtualBalance: number;
}

const Portfolio: React.FC<PortfolioProps> = ({ holdings, virtualBalance }) => {
  const totalValue = holdings.reduce((acc, h) => acc + (h.quantity * h.avg_buy_price), 0);
  const portfolioValue = totalValue + virtualBalance;

  // Chart Data
  const pieData = {
    labels: ['Available Cash', ...holdings.map(h => h.ticker)],
    datasets: [
      {
        data: [virtualBalance, ...holdings.map(h => h.quantity * h.avg_buy_price)],
        backgroundColor: ['#3b9dff', '#5cb2ff', '#7bc4ff', '#9ad3ff', '#b9e2ff', '#d9f1ff'],
        borderColor: [
          'rgba(9, 132, 227, 1)',
          'rgba(0, 206, 201, 1)',
          'rgba(108, 92, 231, 1)',
          'rgba(253, 121, 168, 1)',
          'rgba(255, 118, 117, 1)',
          'rgba(250, 177, 160, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: holdings.map(h => h.ticker),
    datasets: [
      {
        label: 'Market Value (₹)',
        data: holdings.map(h => h.quantity * h.avg_buy_price),
        backgroundColor: '#3b9dff99',
        borderColor: '#3b9dff',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#8f9bad',
          font: { size: 10, weight: 'bold' },
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#101722', titleColor: '#f4f7fb', bodyColor: '#8f9bad', borderColor: 'rgba(151,169,192,.16)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(151,169,192,.08)' }, ticks: { color: '#8f9bad', font: { size: 10 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#8f9bad', font: { size: 10 } },
      },
    },
  };

  const pieOptions = {
    ...chartOptions,
    scales: undefined,
  };

  return (
    <div className="space-y-6">
      <header className="lab-page-header">
        <div><p className="text-brand-primary text-sm font-semibold">Portfolio</p><h1 className="lab-page-title mt-2">Your practice portfolio</h1><p className="lab-page-subtitle">Build judgement with every virtual trade.</p></div>
        <p className="text-xs text-muted hidden sm:block">Market data may be delayed</p>
      </header>
      <section className="app-panel overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_.8fr_.8fr] divide-y lg:divide-y-0 lg:divide-x divide-border">
          <div className="p-6 sm:p-8 bg-[linear-gradient(120deg,rgba(59,157,255,.18),transparent_58%)] relative overflow-hidden">
            <p className="metric-label mb-3">Virtual portfolio value</p>
            <h3 className="text-3xl sm:text-4xl font-bold text-main tabular-nums">{formatCurrency(portfolioValue)}</h3>
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mt-4">
            <TrendingUp className="w-3.5 h-3.5" />
              <span>+4.2% total return</span><span className="text-muted font-medium ml-1">this session</span>
            </div>
          </div>
          <div className="p-6 sm:p-8 flex flex-col justify-center">
            <p className="metric-label mb-2">Available cash</p>
            <h3 className="text-2xl font-bold text-main tabular-nums">{formatCurrency(virtualBalance)}</h3>
            <p className="text-xs text-muted mt-2">Ready for your next position</p>
          </div>
          <div className="p-6 sm:p-8 flex flex-col justify-center">
            <p className="metric-label mb-2">Active holdings</p>
            <h3 className="text-2xl font-bold text-main">{holdings.length} {holdings.length === 1 ? 'stock' : 'stocks'}</h3>
            <p className="text-xs text-muted mt-2">Diversify with intent</p>
          </div>
        </div>
      </section>

      {holdings.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[.85fr_1.15fr] gap-6">
          <div className="app-panel p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <PieIcon className="w-4.5 h-4.5 text-brand-primary" />
              <h2 className="text-base font-bold text-main">Asset Allocation</h2>
            </div>
            <div className="h-75 relative">
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>
          <div className="app-panel p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-4.5 h-4.5 text-brand-primary" />
              <h2 className="text-base font-bold text-main">Holdings Value</h2>
            </div>
            <div className="h-75 relative">
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      <div className="app-panel overflow-hidden">
        <div className="px-5 sm:px-7 py-5 border-b border-border flex items-center justify-between gap-3 bg-surface-raised">
          <div className="flex items-center gap-3">
          <Briefcase className="w-4.5 h-4.5 text-brand-primary" />
          <h2 className="text-base font-bold text-main">Current Holdings</h2>
          </div>
          <span className="text-xs text-muted">Live learning portfolio</span>
        </div>
        
        {holdings.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-[1.15fr_.85fr] min-h-65">
            <div className="p-6 sm:p-8 flex flex-col justify-center">
              <div className="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-5"><Target className="w-5 h-5" /></div>
              <h3 className="text-xl font-bold">Make your first practice trade.</h3>
              <p className="text-sm text-muted leading-relaxed max-w-md mt-2">Choose a company, decide how much virtual money to use, then review what happened. Your first position starts the portfolio.</p>
              <div className="flex flex-wrap gap-3 mt-6"><Link to="/trade" className="btn-primary inline-flex items-center gap-2">Explore the market <ArrowRight className="w-4 h-4" /></Link><Link to="/learn" className="px-4 py-3 rounded-lg text-sm font-semibold text-brand-primary hover:bg-brand-primary/10 transition-colors inline-flex items-center gap-2"><BookOpen className="w-4 h-4" /> Learn the basics</Link></div>
            </div>
            <div className="p-6 sm:p-8 bg-surface-raised border-t md:border-t-0 md:border-l border-border flex flex-col justify-center">
              <p className="metric-label">Your first goal</p>
              <p className="text-lg font-semibold mt-3">Build a 3-stock practice portfolio.</p>
              <p className="text-sm text-muted mt-2 leading-relaxed">Spread your virtual money across different sectors before deciding which positions deserve more research.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-muted uppercase tracking-widest border-b border-border">
                    <th className="px-6 py-4 font-bold">Ticker</th><th className="px-6 py-4 font-bold">Quantity</th><th className="px-6 py-4 font-bold">Avg Price</th><th className="px-6 py-4 font-bold">Market Value</th><th className="px-6 py-4 font-bold">P&amp;L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {holdings.map((holding) => (
                    <tr key={holding.id} className="hover:bg-surface-hover transition-colors duration-200">
                      <td className="px-6 py-4 text-sm font-bold text-main">{holding.ticker}</td><td className="px-6 py-4 text-sm font-medium text-muted">{holding.quantity.toFixed(4)}</td><td className="px-6 py-4 text-sm font-medium text-muted">{formatCurrency(holding.avg_buy_price)}</td><td className="px-6 py-4 text-sm font-bold text-main">{formatCurrency(holding.quantity * holding.avg_buy_price)}</td><td className="px-6 py-4">
                        <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          +2.4%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-border">
              {holdings.map((holding) => (
                <div key={holding.id} className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-main text-base">{holding.ticker}</h4>
                      <p className="text-[10px] text-muted font-bold uppercase tracking-wider mt-0.5">
                        {holding.quantity.toFixed(4)} Shares
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-main">{formatCurrency(holding.quantity * holding.avg_buy_price)}</p>
                      <span className="text-[10px] font-bold text-emerald-500 flex items-center justify-end gap-1 mt-0.5">
                        <TrendingUp className="w-2.5 h-2.5" />
                        +2.4%
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Avg Buy Price</p>
                      <p className="text-xs text-muted font-medium mt-1">{formatCurrency(holding.avg_buy_price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Market Price</p>
                      <p className="text-xs text-muted font-medium mt-1">{formatCurrency(holding.avg_buy_price * 1.024)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
