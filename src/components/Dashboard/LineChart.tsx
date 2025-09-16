import React from 'react';

interface ChartData {
  day: string;
  values: number[];
}

interface ChartColor {
  label: string;
  bg: string;
  stroke?: string;
}

interface LineChartProps {
  title: string;
  data: ChartData[];
  colors: ChartColor[];
  loading?: boolean;
  showLines?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({ 
  title, 
  data, 
  colors, 
  loading = false,
  showLines = true 
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-black/10 shadow-md animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Calculate max value from data
  const maxValue = Math.max(
    ...data.flatMap(item => item.values),
    10
  );

  // Round up to nearest 10, 100, or 1000
  let roundedMax;
  if (maxValue <= 100) {
    roundedMax = Math.ceil(maxValue / 10) * 10;
  } else if (maxValue <= 1000) {
    roundedMax = Math.ceil(maxValue / 100) * 100;
  } else {
    roundedMax = Math.ceil(maxValue / 1000) * 1000;
  }

  const getHeight = (value: number) => {
    return Math.max((value / roundedMax) * 150, 1);
  };

  // Calculate positions for line chart with responsive spacing
  const getLinePoints = (dataIndex: number) => {
    const spacing = 100 / (data.length + 1);
    return data.map((item, idx) => {
      const x = spacing * (idx + 1);
      const y = 150 - getHeight(item.values[dataIndex]);
      return `${x}%,${y}`;
    }).join(' ');
  };

  const lineColors = [
    '#3a6b22', // Dark green
    '#8fb366', // Light green
    '#192215'  // Very dark green
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-black/10 shadow-md">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 sm:mb-6">
        <h3 className="text-[#20130b] text-base sm:text-lg font-semibold">{title}</h3>
        <div className="flex gap-2 text-xs">
          <span className="text-[#575757] font-medium">Daily</span>
          <span className="text-[#3a6b22] font-bold">Weekly</span>
          <span className="text-[#575757] font-medium">Monthly</span>
        </div>
      </div>
      
      <div className="relative">
        {/* Y-axis labels */}
        <div className="flex flex-col gap-3 sm:gap-5">
          {[roundedMax, roundedMax*0.75, roundedMax*0.5, roundedMax*0.25, 0].map((val) => (
            <div key={val} className="flex items-center gap-2 sm:gap-4">
              <span className="text-[#8d8d8d] text-[10px] sm:text-xs w-8 sm:w-10 flex-shrink-0 text-right">
                {Math.round(val)}
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          ))}
        </div>
        
        {/* Chart area */}
        <div className="absolute bottom-0 left-10 sm:left-14 right-0" style={{ height: '150px' }}>
          {showLines ? (
            // Line chart with responsive SVG and smooth curves
            <svg className="w-full h-full" viewBox="0 0 100 150" preserveAspectRatio="none">
              {/* Draw smooth curved lines */}
              {colors.map((color, idx) => {
                const spacing = 100 / (data.length + 1);
                const points = data.map((item, dayIdx) => {
                  const x = spacing * (dayIdx + 1);
                  const y = 150 - getHeight(item.values[idx]);
                  return { x, y };
                });
                
                // Create smooth curve path using cubic bezier
                let pathData = '';
                if (points.length > 0) {
                  pathData = `M ${points[0].x},${points[0].y}`;
                  
                  for (let i = 1; i < points.length; i++) {
                    const prevPoint = points[i - 1];
                    const currPoint = points[i];
                    const nextPoint = points[i + 1];
                    const prevPrevPoint = points[i - 2];
                    
                    // Calculate control points for smooth curves
                    let cp1x, cp1y, cp2x, cp2y;
                    
                    if (i === 1) {
                      // First segment
                      cp1x = prevPoint.x + (currPoint.x - prevPoint.x) * 0.3;
                      cp1y = prevPoint.y;
                      cp2x = currPoint.x - (currPoint.x - prevPoint.x) * 0.3;
                      cp2y = currPoint.y;
                    } else if (i === points.length - 1) {
                      // Last segment
                      cp1x = prevPoint.x + (currPoint.x - prevPoint.x) * 0.3;
                      cp1y = prevPoint.y;
                      cp2x = currPoint.x - (currPoint.x - prevPoint.x) * 0.3;
                      cp2y = currPoint.y;
                    } else {
                      // Middle segments - create smooth transitions
                      const tension = 0.3;
                      const prevAngle = Math.atan2(currPoint.y - prevPoint.y, currPoint.x - prevPoint.x);
                      const nextAngle = Math.atan2(nextPoint.y - currPoint.y, nextPoint.x - currPoint.x);
                      const avgAngle = (prevAngle + nextAngle) / 2;
                      
                      const cp1Distance = Math.hypot(currPoint.x - prevPoint.x, currPoint.y - prevPoint.y) * tension;
                      const cp2Distance = Math.hypot(nextPoint.x - currPoint.x, nextPoint.y - currPoint.y) * tension;
                      
                      cp1x = prevPoint.x + (currPoint.x - prevPoint.x) * (1 - tension);
                      cp1y = prevPoint.y + (currPoint.y - prevPoint.y) * (1 - tension);
                      cp2x = currPoint.x - (currPoint.x - prevPoint.x) * tension;
                      cp2y = currPoint.y - (currPoint.y - prevPoint.y) * tension;
                    }
                    
                    pathData += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${currPoint.x},${currPoint.y}`;
                  }
                }
                
                // Get the stroke color from the color object
                const strokeColor = color.bg === 'bg-[#8fb366]' ? '#8fb366' :
                                   color.bg === 'bg-[#ff0000]' ? '#ff0000' :
                                   color.bg === 'bg-[#ffbd00]' ? '#ffbd00' :
                                   color.bg === 'bg-[#3a6b22]' ? '#3a6b22' :
                                   color.bg === 'bg-[#192215]' ? '#192215' :
                                   lineColors[idx];
                
                return (
                  <path
                    key={idx}
                    d={pathData}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    className="transition-all duration-500"
                  />
                );
              })}
            </svg>
          ) : (
            // Bar chart - responsive with flex
            <div className="flex items-end h-full w-full">
              {data.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end relative h-full">
                  <div className="w-full flex items-end justify-center gap-[2px] sm:gap-1 h-full px-1">
                    {item.values.map((value, vIdx) => (
                      <div
                        key={vIdx}
                        className={`w-full max-w-[8px] sm:max-w-[10px] rounded-full transition-all duration-500 ${
                          vIdx === 0 ? 'bg-[#3a6b22]' : 
                          vIdx === 1 ? 'bg-[#8fb366]' : 
                          'bg-[#192215]'
                        }`}
                        style={{ height: `${getHeight(value)}px` }}
                      />
                    ))}
                  </div>
                  <p className="text-[#8d8d8d] text-[10px] sm:text-xs absolute -bottom-6 whitespace-nowrap">
                    {item.day}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* X-axis labels for line chart */}
        {showLines && (
          <div className="absolute bottom-0 left-10 sm:left-14 right-0 flex justify-between" style={{ top: '165px' }}>
            {data.map((item, idx) => (
              <span key={idx} className="text-[#8d8d8d] text-[10px] sm:text-xs">
                {item.day}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-8 sm:mt-10">
        {colors.map((color, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full ${color.bg}`} />
            <span className="text-[#192215] text-[10px] sm:text-xs font-medium">{color.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LineChart;