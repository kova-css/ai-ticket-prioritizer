
import React from 'react';

interface BarChartData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartData[];
  title: string;
  onBarClick?: (label: string) => void;
  activeLabel?: string | null;
}

export const BarChart: React.FC<BarChartProps> = ({ data, title, onBarClick, activeLabel }) => {
  if (!data.length) return null;

  const maxValue = Math.max(...data.map(d => d.value), 0);

  return (
    <div className="bg-gray-800 p-4 rounded-lg h-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-300 mb-4 text-center">{title}</h3>
      <div className="flex-grow flex justify-around items-end h-32 gap-2">
        {data.map(({ label, value }) => (
          <div 
            key={label}
            className="flex flex-col items-center flex-1 w-full"
            title={`${label}: ${value}`}
          >
            <div 
              className={`w-full max-w-[40px] rounded-t-md transition-all duration-300 ${onBarClick ? 'cursor-pointer' : ''} ${activeLabel === label ? 'bg-emerald-500' : activeLabel ? 'bg-gray-600 hover:bg-gray-500' : 'bg-green-600 hover:bg-green-500'}`}
              style={{ height: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%` }}
              onClick={() => onBarClick?.(label)}
            />
            <p className="text-xs text-gray-400 mt-2 text-center break-words w-full px-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
