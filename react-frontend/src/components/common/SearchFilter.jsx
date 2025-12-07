import React from 'react';
import CategoryDropdown from './CategoryDropdown';

const SearchFilter = ({ 
  searchQuery, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange, 
  categories,
  placeholder = "Search...",
  showFilter = true 
}) => {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 shadow-sm w-full">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-purple-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
            />
          </div>
        </div>

        {/* Category Filter */}
        {showFilter && categories && (
          <div className="lg:w-64">
            <CategoryDropdown
              selectedCategory={selectedCategory}
              onCategoryChange={onCategoryChange}
              categories={categories}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;
