import React from 'react';
import { motion } from 'framer-motion';

const Input = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder,
  required = false,
  error = null,
  icon = null,
  disabled = false,
  className = '',
  rows = 3,
  ...props 
}) => {
  const inputClasses = `
    w-full px-4 py-3.5 
    text-base text-slate-800 placeholder-slate-400
    bg-white border-2 rounded-xl
    ${error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
      : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500/20'
    }
    focus:outline-none focus:ring-4
    transition-all duration-200
    disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
    ${icon ? 'pl-12' : ''}
    ${className}
  `;

  const containerClasses = "relative";

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={containerClasses}>
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        
        {type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            className={inputClasses}
            {...props}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={inputClasses}
            {...props}
          />
        )}
      </div>

      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 font-medium flex items-center gap-1.5 mt-1.5"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;
