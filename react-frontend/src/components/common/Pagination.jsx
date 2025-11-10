import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange 
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-white border-t border-slate-200 px-4 py-4 rounded-b-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Items per page and showing info */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value={6}>6</option>
              <option value={9}>9</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
          </div>
          <span className="text-slate-600">
            Showing <span className="font-semibold text-slate-900">{startItem}</span> to{' '}
            <span className="font-semibold text-slate-900">{endItem}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalItems}</span> results
          </span>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2">
          {/* Previous button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded-lg font-medium transition-all ${
              currentPage === 1
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`min-w-[40px] px-3 py-2 rounded-lg font-semibold transition-all ${
                page === currentPage
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                  : page === '...'
                  ? 'bg-transparent text-slate-400 cursor-default'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded-lg font-medium transition-all ${
              currentPage === totalPages
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
