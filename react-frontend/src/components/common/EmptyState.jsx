import React from 'react';

/**
 * Unified Empty State Component
 * Consistent empty state design across all pages
 */
const EmptyState = React.memo(({ 
  icon: Icon, 
  title, 
  description, 
  action,
  gradient = 'from-gray-100 to-gray-200'
}) => {
  return (
    <div className="text-center py-16 px-4">
      <div className={`w-20 h-20 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm`}>
        {Icon && <Icon className="w-10 h-10 text-gray-400" strokeWidth={2} />}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">{description}</p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;
