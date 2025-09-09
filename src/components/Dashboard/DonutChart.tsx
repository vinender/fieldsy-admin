import React from 'react';

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  total: number;
  segments: Segment[];
  loading?: boolean;
}

const DonutChart: React.FC<DonutChartProps> = ({ total, segments, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-black/10 shadow-md animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
        <div className="w-44 h-44 mx-auto mb-6 bg-gray-200 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Calculate percentages for the donut chart
  const calculateStrokeDasharray = (value: number) => {
    const percentage = (value / total) * 100;
    const circumference = 2 * Math.PI * 70; // radius = 70
    return `${(percentage / 100) * circumference} ${circumference}`;
  };

  let cumulativeOffset = 0;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-black/10 shadow-md md:col-span-2 xl:col-span-1">
      <h3 className="text-[#20130b] text-base sm:text-lg font-semibold mb-4 sm:mb-6">User Distribution</h3>
      
      {/* Donut visualization */}
      <div className="relative w-44 h-44 mx-auto mb-6">
        <svg className="w-full h-full transform -rotate-90">
          {segments.map((segment, idx) => {
            const strokeDasharray = calculateStrokeDasharray(segment.value);
            const offset = cumulativeOffset;
            cumulativeOffset += (segment.value / total) * 2 * Math.PI * 70;
            
            return (
              <circle
                key={idx}
                cx="88"
                cy="88"
                r="70"
                fill="none"
                stroke={segment.color === 'bg-[#3a6b22]' ? '#3a6b22' : '#8fb366'}
                strokeWidth="28"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={-offset}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[#192215] text-xl font-semibold">{total.toLocaleString()}</p>
          <p className="text-[#8d8d8d] text-sm">Total</p>
        </div>
      </div>
      
      {/* Legend */}
      <div className="space-y-2">
        {segments.map((segment, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${segment.color}`} />
              <span className="text-[#8d8d8d] text-xs font-medium">{segment.label}</span>
            </div>
            <span className="text-[#192215] text-sm font-bold">{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;