import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface DateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  disabled?: boolean;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Select date and time',
  disabled = false
}) => {
  const { language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  
  // Format date for input value
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    
    // Format as YYYY-MM-DDThh:mm (format required by datetime-local input)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  
  // Format min/max dates
  const formatMinMaxDate = (date: Date | undefined): string => {
    if (!date) return '';
    return formatDateForInput(date);
  };
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (!inputValue) {
      onChange(null);
      return;
    }
    
    try {
      const newDate = new Date(inputValue);
      onChange(newDate);
    } catch (error) {
      console.error('Invalid date format:', error);
    }
  };
  
  // Display formatted date for user (depending on language)
  const getDisplayDate = (): string => {
    if (!value) return placeholder;
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return value.toLocaleString(language === 'en' ? 'en-US' : 'ru-RU', options);
  };
  
  return (
    <div className="relative">
      <div className="relative flex items-center">
        <input
          type="datetime-local"
          value={formatDateForInput(value)}
          onChange={handleChange}
          min={formatMinMaxDate(minDate)}
          max={formatMinMaxDate(maxDate)}
          disabled={disabled}
          className={`p-2 border border-gray-300 rounded-md w-full text-sm focus:ring-blue-500 focus:border-blue-500 ${
            isEditing ? 'opacity-100' : 'opacity-0'
          } absolute inset-0 cursor-text z-10`}
          required
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
        />
        <div 
          className={`flex items-center p-2 border border-gray-300 rounded-md w-full text-sm bg-white ${
            isEditing ? 'opacity-0' : 'opacity-100'
          } transition-opacity duration-200`}
        >
          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
          <span className={`flex-grow ${!value ? 'text-gray-400' : 'text-gray-800'}`}>
            {getDisplayDate()}
          </span>
          <Clock 
            className="!cursor-pointer h-4 w-4 text-gray-500 relative z-50" 
            onClick={() => setIsEditing(true)}
          />
        </div>
      </div>
    </div>
  );
};

export default DateTimePicker; 