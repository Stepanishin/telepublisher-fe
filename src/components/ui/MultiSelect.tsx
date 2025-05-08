import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  options: SelectOption[];
  value: string[];
  onChange: (selectedValues: string[]) => void;
  error?: string;
  placeholder?: string;
  isRequired?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  placeholder = 'Select options...',
  isRequired = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOptions = options.filter(option => value.includes(option.value));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(val => val !== optionValue)
      : [...value, optionValue];
    
    onChange(newValue);
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative" ref={dropdownRef}>
        {/* Dropdown trigger */}
        <div
          className={`
            px-4 py-2 bg-white border border-gray-300 rounded-md text-sm w-full cursor-pointer
            flex justify-between items-center min-h-[42px]
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-500' : ''}
          `}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map(option => (
                <div
                  key={option.value}
                  className="bg-blue-100 text-blue-800 rounded px-2 py-1 text-xs flex items-center"
                >
                  {option.label.split(' ').map(word => word.startsWith('@') ? word : null).join(' ')}
                  <X
                    size={14}
                    className="ml-1 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(option.value);
                    }}
                  />
                </div>
              ))
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center">
            {selectedOptions.length > 0 && (
              <X
                size={16}
                className="mr-2 cursor-pointer text-gray-500 hover:text-gray-700"
                onClick={clearAll}
              />
            )}
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
        
        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map(option => (
              <div
                key={option.value}
                className={`
                  px-4 py-2 cursor-pointer flex items-center hover:bg-gray-100
                  ${value.includes(option.value) ? 'bg-blue-50' : ''}
                `}
                onClick={() => toggleOption(option.value)}
              >
                <div className={`
                  w-4 h-4 mr-2 border rounded
                  ${value.includes(option.value) 
                    ? 'bg-blue-500 border-blue-500 flex items-center justify-center' 
                    : 'border-gray-300'
                  }
                `}>
                  {value.includes(option.value) && <Check size={12} color="white" />}
                </div>
                {/* use only word with @ in the start, other words remove */}
                {/*  "@crypto_explorer_channel (crypto_explorer_channel)" ырщгдв куегкт */}
                {option.label.split(' ').map(word => word.startsWith('@') ? word : null).join(' ')}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default MultiSelect; 