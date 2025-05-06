import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  label,
  placeholder,
  disabled = false,
}) => {
  const { t } = useLanguage();
  const [input, setInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    // Add tag on Enter or comma
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      
      // Format tag with # if it doesn't have one
      let newTag = input.trim();
      if (!newTag.startsWith('#')) {
        newTag = `#${newTag}`;
      }
      
      if (!tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInput('');
    }

    // Remove the last tag on Backspace if input is empty
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove: number) => {
    if (disabled) return;
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className={`
        flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md
        focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500
        ${disabled ? 'bg-gray-100' : 'bg-white'}
      `}>
        {tags.map((tag, index) => (
          <div
            key={index}
            className={`
              flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-md
              ${disabled ? 'opacity-60' : ''}
            `}
          >
            <span>{tag}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                aria-label={t('tag_input.remove_tag')}
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={tags.length === 0 ? (placeholder || t('tag_input.placeholder')) : ''}
          className="flex-grow border-0 focus:ring-0 min-w-[120px] p-1 text-sm disabled:bg-transparent"
          disabled={disabled}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {t('tag_input.hint')}
      </p>
    </div>
  );
};

export default TagInput;