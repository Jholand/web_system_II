import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

const ViewToggle = ({ view, onViewChange }) => {
  return (
    <div className="inline-flex items-center bg-white border-2 border-teal-300 rounded-lg shadow-sm overflow-hidden relative z-10">
      <button
        type="button"
        onClick={() => onViewChange('card')}
        className={`
          flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-100 cursor-pointer
          ${view === 'card' 
            ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white' 
            : 'bg-white text-gray-700 hover:bg-teal-50'
          }
        `}
        title="Card View"
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="hidden sm:inline">Cards</span>
      </button>
      <div className="w-px h-6 bg-teal-300" />
      <button
        type="button"
        onClick={() => onViewChange('table')}
        className={`
          flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-100 cursor-pointer
          ${view === 'table' 
            ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white' 
            : 'bg-white text-gray-700 hover:bg-teal-50'
          }
        `}
        title="Table View"
      >
        <List className="w-4 h-4" />
        <span className="hidden sm:inline">Table</span>
      </button>
    </div>
  );
};

export default ViewToggle;
