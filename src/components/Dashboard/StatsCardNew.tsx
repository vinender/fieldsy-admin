import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  iconBgColor?: string;
  loading?: boolean;
}

const StatsCardNew: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  iconBgColor = 'bg-[#f8f1d7]',
  loading = false
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-black/10 shadow-md flex-1 animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="w-16 h-16 bg-gray-200 rounded-3xl"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  const isPositive = change && change > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-black/10 shadow-md flex-1 min-w-0">
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0 flex-1">
          <p className="text-[#8d8d8d] text-xs sm:text-sm font-medium mb-2 truncate">{title}</p>
          <p className="text-[#192215] text-xl sm:text-2xl font-bold truncate">{value}</p>
        </div>
        <div className={`${iconBgColor} p-3 sm:p-4 rounded-3xl flex-shrink-0 ml-3`}>
          <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#192215]" />
        </div>
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1 sm:gap-2">
          <TrendIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${isPositive ? 'text-[#3a6b22]' : 'text-red-500'}`} />
          <p className="text-xs sm:text-sm">
            <span className={`font-medium ${isPositive ? 'text-[#3a6b22]' : 'text-red-500'}`}>
              {Math.abs(change)}%
            </span>
            <span className="text-[#8d8d8d]"> from yesterday</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default StatsCardNew;