import React, { SelectHTMLAttributes, ReactNode } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
  error?: string;
  fullWidth?: boolean;
}

const Select: React.FC<SelectProps> = ({ 
  children, 
  className = '', 
  error, 
  fullWidth = false,
  ...props 
}) => {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <select
        className={`
          px-3 py-2 rounded-md border border-gray-300 text-gray-900 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-colors disabled:bg-gray-100 disabled:text-gray-500
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select;