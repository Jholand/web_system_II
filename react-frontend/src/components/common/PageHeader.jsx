import React from 'react';

/**
 * Unified Page Header Component
 * Consistent header design across all pages
 */
const PageHeader = React.memo(({ 
  icon: Icon, 
  title, 
  subtitle, 
  gradient = 'from-emerald-500 via-teal-500 to-cyan-500',
  iconBg = 'from-emerald-500 to-teal-600',
  action
}) => {
  return (
    <div className="mb-6 sm:mb-8 animate-fade-in">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-100 hover:shadow-lg transition-shadow duration-150">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${iconBg} rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30`}>
              {Icon && <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow" strokeWidth={2.5} />}
            </div>
            <div className="flex-1">
              <h1 className={`text-xl sm:text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && (
            <div className="w-full sm:w-auto">
              {action}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

PageHeader.displayName = 'PageHeader';

export default PageHeader;
