import React from 'react';
import { Plus } from 'lucide-react';

/**
 * AddButton - Reusable "Add" button component with uniform teal-500 styling
 * Features:
 * - Consistent teal-500 background
 * - White text with shadow
 * - Hover effects (darker teal, scale, shadow)
 * - Plus icon on the left
 * - Responsive sizing
 */
const AddButton = ({ 
  onClick, 
  children = "Add New",
  icon: Icon = Plus,
  className = "",
  disabled = false,
  ...props 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 
        px-4 sm:px-6 py-2.5 
        bg-teal-500 text-white 
        rounded-lg 
        shadow-md hover:shadow-lg 
        hover:bg-teal-600 
        hover:scale-[1.02]
        active:scale-[0.98]
        transition-all duration-200 
        font-medium
        disabled:opacity-50 
        disabled:cursor-not-allowed
        disabled:hover:scale-100
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
      <span className="text-sm sm:text-base">{children}</span>
    </button>
  );
};

export default AddButton;
