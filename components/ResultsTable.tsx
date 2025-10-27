
import React from 'react';
import type { RankedTicket } from '../types';

type SortConfig = {
  key: keyof RankedTicket | string;
  direction: 'ascending' | 'descending';
} | null;

const SortIcon: React.FC<{ direction?: 'ascending' | 'descending' }> = ({ direction }) => {
  if (!direction) {
    return <svg className="w-4 h-4 inline-block ml-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>;
  }
  return direction === 'ascending' ? 
    <svg className="w-4 h-4 inline-block ml-1 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg> : 
    <svg className="w-4 h-4 inline-block ml-1 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;
};

interface ScoreBadgeProps {
  score: number;
  type?: 'priority' | 'default';
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, type = 'default' }) => {
    let colors = 'bg-green-900/50 text-green-300 border-green-700';

    if (type === 'priority') {
        if (score >= 16) {
            colors = 'bg-red-900/50 text-red-300 border-red-700';
        } else if (score >= 10) {
            colors = 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
        }
    } else { // 'default' for urgency/severity on a 1-10 scale
        if (score >= 8) {
            colors = 'bg-red-900/50 text-red-300 border-red-700';
        } else if (score >= 5) {
            colors = 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
        }
    }
    
    return <span className={`px-2 py-1 text-sm font-mono font-semibold rounded-full border ${colors}`}>{score.toFixed(1)}</span>;
};

interface ResultsTableProps {
  data: RankedTicket[];
  headers: string[];
  sortConfig: SortConfig;
  onSort: (key: keyof RankedTicket | string) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ data, headers, sortConfig, onSort }) => {

  const formatHeader = (header: string) => {
    return header.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  }

  return (
    <div className="overflow-x-auto bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700/30">
          <tr>
            {headers.map(key => (
              <th key={key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <button onClick={() => onSort(key)} className="flex items-center transition-colors hover:text-gray-200">
                  {formatHeader(key)}
                  <SortIcon direction={sortConfig?.key === key ? sortConfig.direction : undefined} />
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-gray-700/50 transition-colors">
                {headers.map(headerKey => (
                   <td key={`${item.id || index}-${headerKey}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {headerKey === 'urgency' || headerKey === 'severity' || headerKey === 'priorityScore' ? (
                       <ScoreBadge
                          score={Number(item[headerKey])}
                          type={headerKey === 'priorityScore' ? 'priority' : 'default'}
                        />
                    ) : headerKey === 'tags' && Array.isArray(item[headerKey]) ? (
                       <div className="flex flex-wrap gap-1">
                        {(item[headerKey] as string[]).map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 text-xs font-medium bg-gray-600 text-gray-200 rounded-full">{tag}</span>
                        ))}
                      </div>
                    ) : (
                      String(item[headerKey] ?? '')
                    )}
                   </td>
                ))}
              </tr>
            ))
          ) : (
             <tr>
                <td colSpan={headers.length || 1} className="text-center py-10 text-gray-500">
                    No tickets match your current filters.
                </td>
             </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
