import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const Select = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [],
  required = false,
  error = null,
  disabled = false,
  placeholder = 'Select an option',
  className = '',
  ...props 
}) => {
  const selectClasses = `
    w-full px-4 py-3.5 pr-12
    text-base text-slate-800
    bg-white border-2 rounded-xl
    appearance-none cursor-pointer
    ${error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
      : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500/20'
    }
    focus:outline-none focus:ring-4
    transition-all duration-200
    disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
    ${!value ? 'text-slate-400' : 'text-slate-800'}
    ${className}
  `;

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
      
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={selectClasses}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option, index) => (
            <option 
              key={option.value || index} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className={`w-5 h-5 ${error ? 'text-red-400' : 'text-slate-400'}`} />
        </div>
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

export default Select;
