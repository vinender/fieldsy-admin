import React from 'react';

interface TimePeriodToggleProps {
  periods: string[];
  activePeriod: string;
  onPeriodChange: (period: string) => void;
}

const TimePeriodToggle: React.FC<TimePeriodToggleProps> = ({ 
  periods, 
  activePeriod, 
  onPeriodChange 
}) => {
  return (
    <div className="bg-[#f8f1d7] border border-black/3 rounded-full p-1 inline-flex gap-1">
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onPeriodChange(period)}
          className={`px-2 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
            activePeriod === period
              ? 'bg-[#8fb366] text-white font-bold'
              : 'text-[#192215] hover:bg-white/50'
          }`}
        >
          {period}
        </button>
      ))}
    </div>
  );
};

export default TimePeriodToggle;