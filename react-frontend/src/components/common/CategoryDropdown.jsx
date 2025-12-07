import React, { useState, useEffect, useRef } from 'react';

const CategoryDropdown = ({ 
  selectedCategory, 
  onCategoryChange, 
  categories = [],
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Helper function to check if icon is an image file path
  const isImageIcon = (icon) => {
    if (!icon) return false;
    return icon.includes('/') || icon.includes('\\') || 
           icon.endsWith('.png') || icon.endsWith('.jpg') || 
           icon.endsWith('.jpeg') || icon.endsWith('.gif') || 
           icon.endsWith('.webp') || icon.endsWith('.svg');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSelectedCategory = () => {
    if (selectedCategory === 'all') return null;
    return categories.find(c => c.id === parseInt(selectedCategory) || c.value === parseInt(selectedCategory));
  };

  const selectedCat = getSelectedCategory();

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[48px] px-4 bg-white border-2 border-purple-200 rounded-xl font-medium text-slate-900 hover:border-purple-400 transition-all cursor-pointer flex items-center justify-between"
      >
        {selectedCat ? (
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {isImageIcon(selectedCat.icon) ? (
              <img 
                src={selectedCat.icon.startsWith('http') ? selectedCat.icon : `http://localhost:8000/storage/${selectedCat.icon}`}
                alt={selectedCat.name || selectedCat.label}
                className="w-5 h-5 object-cover rounded"
              />
            ) : (
              <span className="text-base">{selectedCat.icon}</span>
            )}
            <span className="truncate">{selectedCat.name || selectedCat.label}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>All Categories</span>
          </div>
        )}
        <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-purple-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          <div
            onClick={() => {
              onCategoryChange('all');
              setIsOpen(false);
            }}
            className="px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-sm font-medium text-slate-900">All Categories</span>
          </div>
          {categories.map((cat) => {
            const catId = cat.id || cat.value;
            const catName = cat.name || cat.label;
            const catIcon = cat.icon;
            
            return (
              <div
                key={catId}
                onClick={() => {
                  onCategoryChange(catId);
                  setIsOpen(false);
                }}
                className="px-4 py-3 hover:bg-purple-50 cursor-pointer flex items-center gap-2 transition-colors"
              >
                {isImageIcon(catIcon) ? (
                  <img 
                    src={catIcon.startsWith('http') ? catIcon : `http://localhost:8000/storage/${catIcon}`}
                    alt={catName}
                    className="w-6 h-6 object-cover rounded"
                  />
                ) : (
                  <span className="text-lg">{catIcon}</span>
                )}
                <span className="text-sm text-slate-900">{catName}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
