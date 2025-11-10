import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon,
  onClick,
  type = 'button',
  className = '',
  disabled = false
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-teal-500 hover:bg-teal-600 text-white shadow-sm hover:shadow-md focus:ring-teal-500',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 hover:border-slate-400 focus:ring-slate-400',
    danger: 'bg-white hover:bg-red-50 text-red-600 border-2 border-red-300 hover:border-red-400 focus:ring-red-400',
    outline: 'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300 focus:ring-slate-400',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
