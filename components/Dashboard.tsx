
import React from 'react';

interface DashboardProps {
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
  searchQuery: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSearchChange, onClearFilters, searchQuery }) => {
  
  const isFilterActive = !!searchQuery;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg mb-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-100">Dashboard & Filters</h2>
        {isFilterActive && (
            <button
                onClick={onClearFilters}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 transition-all duration-200"
            >
             Clear Filters
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Search */}
        <div>
          <label htmlFor="search-tickets" className="block text-sm font-medium text-gray-300 mb-2">Search Tickets</label>
          <input 
            type="text"
            id="search-tickets"
            placeholder="Filter by summary, description, etc..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
        </div>
      </div>
    </div>
  );
};
