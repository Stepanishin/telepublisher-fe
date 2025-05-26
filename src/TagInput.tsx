import React, { useState, KeyboardEvent, useRef } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

const TagInput: React.FC<TagInputProps> = ({ 
  tags, 
  setTags, 
  placeholder = 'Add tag...', 
  maxTags = 10 
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  
  const addTag = (tag: string) => {
    tag = tag.trim();
    
    if (!tag) return;
    if (tags.includes(tag)) return;
    if (tags.length >= maxTags) return;
    
    setTags([...tags, tag]);
    setInput('');
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };
  
  const focusInput = () => {
    inputRef.current?.focus();
  };
  
  return (
    <div 
      className="border rounded-md p-2 flex flex-wrap gap-2 cursor-text min-h-[42px]"
      onClick={focusInput}
    >
      {tags.map((tag, index) => (
        <div 
          key={index} 
          className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-sm flex items-center"
        >
          <span className="mr-1">{tag}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
            className="text-blue-600 hover:text-blue-800"
            aria-label={t('tag_input.remove_tag') || 'Remove tag'}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input && addTag(input)}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="outline-none flex-grow min-w-[120px] bg-transparent"
      />
    </div>
  );
};

export default TagInput; 