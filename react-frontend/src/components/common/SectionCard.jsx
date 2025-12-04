import React from 'react';

/**
 * Unified Section Card Component
 * Consistent card container across all pages
 */
const SectionCard = React.memo(({ 
  children, 
  className = '',
  title,
  subtitle,
  icon: Icon,
  iconGradient = 'from-emerald-500 to-teal-600',
  action,
  noPadding = false,
  gradient = false
}) => {
  const baseClasses = `bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-150 ${className}`;
  const paddingClasses = noPadding ? '' : 'p-5 sm:p-6';
  
  return (
    <div className={`${baseClasses} ${paddingClasses}`}>
      {(title || action) && (
        <div className={`flex items-center justify-between ${noPadding ? 'px-5 sm:px-6 pt-5 sm:pt-6 pb-4' : 'mb-5'}`}>
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`w-10 h-10 bg-gradient-to-br ${iconGradient} rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20`}>
                <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
            )}
            <div>
              {title && (
                <h3 className={`text-lg font-bold ${gradient ? `bg-gradient-to-r ${iconGradient} bg-clip-text text-transparent` : 'text-gray-900'}`}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
});

SectionCard.displayName = 'SectionCard';

export default SectionCard;
