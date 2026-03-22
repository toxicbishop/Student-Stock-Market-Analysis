import React from 'react';
import { Holding } from '../types';
import { formatCurrency } from '../utils';
import { TrendingUp, TrendingDown, Briefcase, PieChart as PieIcon, BarChart3 } from 'lucide-react';
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
        backgroundColor: [
          'rgba(9, 132, 227, 0.6)',
          'rgba(0, 206, 201, 0.6)',
          'rgba(108, 92, 231, 0.6)',
          'rgba(253, 121, 168, 0.6)',
          'rgba(255, 118, 117, 0.6)',
          'rgba(250, 177, 160, 0.6)',
        ],
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
        backgroundColor: 'rgba(0, 206, 201, 0.5)',
        borderColor: 'rgba(0, 206, 201, 1)',
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
          color: '#A4B0BE',
          font: { size: 10, weight: 'bold' as any },
          padding: 20,
          usePointStyle: true,
        },
      },
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

  const pieOptions = {
    ...chartOptions,
    scales: undefined,
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card-base p-8 border-brand-primary/20 bg-brand-primary/5">
          <p className="text-[10px] text-muted uppercase tracking-[0.1em] font-bold mb-2">Portfolio Value</p>
          <h3 className="text-3xl font-bold text-main">{formatCurrency(portfolioValue)}</h3>
          <div className="flex items-center gap-1.5 text-emerald-500 text-[11px] font-bold mt-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+4.2% Total Return</span>
          </div>
        </div>
        <div className="card-base p-8">
          <p className="text-[10px] text-muted uppercase tracking-[0.1em] font-bold mb-2">Available Cash</p>
          <h3 className="text-3xl font-bold text-main">{formatCurrency(virtualBalance)}</h3>
        </div>
        <div className="card-base p-8">
          <p className="text-[10px] text-muted uppercase tracking-[0.1em] font-bold mb-2">Active Holdings</p>
          <h3 className="text-3xl font-bold text-main">{holdings.length} Stocks</h3>
        </div>
      </div>

      {holdings.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-base p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-8">
              <PieIcon className="w-4.5 h-4.5 text-brand-primary" />
              <h2 className="text-base font-bold text-main">Asset Allocation</h2>
            </div>
            <div className="h-[300px] relative">
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>
          <div className="card-base p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-8">
              <BarChart3 className="w-4.5 h-4.5 text-brand-primary" />
              <h2 className="text-base font-bold text-main">Holdings Value</h2>
            </div>
            <div className="h-[300px] relative">
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      <div className="card-base overflow-hidden">
        <div className="px-8 py-5 border-b border-border flex items-center gap-3 bg-surface-hover">
          <Briefcase className="w-4.5 h-4.5 text-brand-primary" />
          <h2 className="text-base font-bold text-main">Current Holdings</h2>
        </div>
        
        {holdings.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-muted text-sm font-medium">No active holdings. Start trading to build your portfolio.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-muted uppercase tracking-widest border-b border-border">
                    <th className="px-8 py-4 font-bold">Ticker</th>
                    <th className="px-8 py-4 font-bold">Quantity</th>
                    <th className="px-8 py-4 font-bold">Avg Price</th>
                    <th className="px-8 py-4 font-bold">Market Value</th>
                    <th className="px-8 py-4 font-bold">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {holdings.map((holding) => (
                    <tr key={holding.id} className="hover:bg-surface-hover transition-colors duration-200">
                      <td className="px-8 py-5 text-sm font-bold text-main">{holding.ticker}</td>
                      <td className="px-8 py-5 text-sm font-medium text-muted">{holding.quantity.toFixed(4)}</td>
                      <td className="px-8 py-5 text-sm font-medium text-muted">{formatCurrency(holding.avg_buy_price)}</td>
                      <td className="px-8 py-5 text-sm font-bold text-main">{formatCurrency(holding.quantity * holding.avg_buy_price)}</td>
                      <td className="px-8 py-5">
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
