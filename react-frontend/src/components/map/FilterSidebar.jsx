import React from 'react';
import { MapPin, Hotel, Wheat, Flower, UtensilsCrossed, Mountain, TreePine, Landmark, Palmtree, Waves } from 'lucide-react';

const FilterSidebar = ({ activeFilter, onFilterChange, destinations }) => {
  const getCategoryCount = (category) => {
    if (category === 'all') return destinations.length;
    return destinations.filter(d => d.category === category).length;
  };

  // Map category names to icons
  const getCategoryIcon = (category) => {
    const lowerCategory = category?.toLowerCase() || '';
    switch (lowerCategory) {
      case 'hotels & resorts':
      case 'hotel':
        return <Hotel className="w-5 h-5" strokeWidth={2} />;
      case 'agricultural farms':
      case 'agri farm':
        return <Wheat className="w-5 h-5" strokeWidth={2} />;
      case 'tourist spot':
        return <Flower className="w-5 h-5" strokeWidth={2} />;
      case 'restaurants':
        return <UtensilsCrossed className="w-5 h-5" strokeWidth={2} />;
      case 'mountains':
        return <Mountain className="w-5 h-5" strokeWidth={2} />;
      case 'nature parks':
        return <TreePine className="w-5 h-5" strokeWidth={2} />;
      case 'historical sites':
        return <Landmark className="w-5 h-5" strokeWidth={2} />;
      case 'attractions':
        return <Palmtree className="w-5 h-5" strokeWidth={2} />;
      case 'beaches':
        return <Waves className="w-5 h-5" strokeWidth={2} />;
      default:
        return <MapPin className="w-5 h-5" strokeWidth={2} />;
    }
  };

  // Get unique categories from destinations
  const uniqueCategories = [...new Set(destinations.map(d => d.category))].sort();

  return (
    <div className="bg-white rounded-2xl border flex flex-col max-h-[calc(100vh-200px)]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <h3 className="text-lg font-bold text-slate-900">Filter Locations</h3>
      </div>

      <div className="space-y-2 p-4 overflow-y-auto flex-1 scrollbar-hide">
        <button
          onClick={() => onFilterChange('all')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${
            activeFilter === 'all'
              ? 'bg-teal-500 text-white shadow-md'
              : 'bg-gray-50 text-slate-700 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" strokeWidth={2} />
            <span>All</span>
          </div>
          <span className={`text-sm font-semibold ${activeFilter === 'all' ? 'text-white' : 'text-teal-600'}`}>
            {getCategoryCount('all')}
          </span>
        </button>

        {uniqueCategories.map((category) => (
          <button
            key={category}
            onClick={() => onFilterChange(category)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${
              activeFilter === category
                ? 'bg-teal-500 text-white shadow-md'
                : 'bg-gray-50 text-slate-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2">
              {getCategoryIcon(category)}
              <span className="capitalize">{category}</span>
            </div>
            <span className={`text-sm font-semibold ${activeFilter === category ? 'text-white' : 'text-teal-600'}`}>
              {getCategoryCount(category)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterSidebar;
