import React from 'react';
import { MapPin, Hotel, Wheat, Flower } from 'lucide-react';

const FilterSidebar = ({ activeFilter, onFilterChange, destinations }) => {
  const getCategoryCount = (category) => {
    if (category === 'all') return destinations.length;
    return destinations.filter(d => d.category === category).length;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <h3 className="text-lg font-bold text-slate-900">Filter Locations</h3>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => onFilterChange('all')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${
            activeFilter === 'all'
              ? 'bg-teal-500 text-white'
              : 'bg-gray-50 text-slate-700 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" strokeWidth={2} />
            <span>All</span>
          </div>
          <span className="text-sm">{getCategoryCount('all')}</span>
        </button>

        <button
          onClick={() => onFilterChange('hotel')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${
            activeFilter === 'hotel'
              ? 'bg-teal-500 text-white'
              : 'bg-gray-50 text-slate-700 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <Hotel className="w-5 h-5" strokeWidth={2} />
            <span>Hotels</span>
          </div>
          <span className="text-sm">{getCategoryCount('hotel')}</span>
        </button>

        <button
          onClick={() => onFilterChange('agri farm')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${
            activeFilter === 'agri farm'
              ? 'bg-teal-500 text-white'
              : 'bg-gray-50 text-slate-700 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <Wheat className="w-5 h-5" strokeWidth={2} />
            <span>Farms</span>
          </div>
          <span className="text-sm">{getCategoryCount('agri farm')}</span>
        </button>

        <button
          onClick={() => onFilterChange('tourist spot')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${
            activeFilter === 'tourist spot'
              ? 'bg-teal-500 text-white'
              : 'bg-gray-50 text-slate-700 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <Flower className="w-5 h-5" strokeWidth={2} />
            <span>Tourist Spots</span>
          </div>
          <span className="text-sm">{getCategoryCount('tourist spot')}</span>
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;
