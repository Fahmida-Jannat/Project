import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'balance';
  subtitle?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, type, subtitle }) => {
  // Determine the correct icon and text color based on the card type
  let Icon = Wallet;
  let colorClass = 'text-blue'; 

  if (type === 'income') {
    Icon = TrendingUp;
    colorClass = 'text-green'; // e.g., #2ecc71
  } else if (type === 'expense') {
    Icon = TrendingDown;
    colorClass = 'text-red'; // e.g., #e74c3c
  }

  
  const subtitleMap: Record<string, string> = {
    'all': 'All Time',
    'week': 'This Week',
    'month': 'This Month',
    'year': 'This Year'
  };
  
  const displaySubtitle = subtitle ? subtitleMap[subtitle] || subtitle : '';

  return (
    <div className={`glass-panel summary-card ${type}`}>
      <div className="summary-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 className="summary-title" style={{ fontSize: '1rem', color: '#8fa7b7', margin: 0 }}>
          {title}
        </h3>
        <div className={`icon-wrapper ${colorClass}`}>
          <Icon size={22} />
        </div>
      </div>
      
      <h2 className={`summary-amount ${colorClass}`} style={{ fontSize: '2rem', margin: '10px 0' }}>
        ৳ {amount.toLocaleString('en-IN')}
      </h2>
      
      {displaySubtitle && (
        <p className="summary-subtitle" style={{ fontSize: '0.85rem', color: '#8fa7b7', margin: 0 }}>
          {displaySubtitle}
        </p>
      )}
    </div>
  );
};

export default SummaryCard;