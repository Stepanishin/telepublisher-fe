import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Send } from 'lucide-react';

interface TelegramPostPreviewProps {
  text: string;
  imageUrl?: string;
  tags?: string[];
}

const TelegramPostPreview: React.FC<TelegramPostPreviewProps> = ({
  text,
  imageUrl,
  tags = []
}) => {
  const { t } = useLanguage();

  // Format text with simple Telegram formatting (bold, italic)
  const formatText = (content: string) => {
    const formattedText = content
      // Bold text (Telegram uses *text*)
      .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
      // Italic text (Telegram uses _text_)
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      // Inline code (Telegram uses `text`)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Line breaks
      .replace(/\n/g, '<br />');
    
    return { __html: formattedText };
  };

  // Add hashtags at the end of the message
  const formattedTags = tags.length > 0 
    ? tags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')
    : '';

  return (
    <div className="telegram-preview mb-4">
      {/* <label className="block text-sm font-medium text-gray-700 mb-1">
        {t('publish_panel.telegram_preview')}
      </label> */}
      <div className="border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
        {/* Header - styled like Telegram */}
        <div className="bg-[#8774E1] text-white p-2 text-sm font-medium flex items-center">
        <Send className="h-5 w-5 text-white mr-2" />
          {t('publish_panel.telegram_preview')}
        </div>
        
        {/* Message content container */}
        <div className="p-4 bg-white">
          {/* Message bubble */}
          <div className="bg-white rounded-lg max-w-full flex flex-col">
            {/* Show image if provided */}
            {imageUrl && (
              <div className="mb-2 self-center">
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="max-w-full rounded-lg object-cover max-h-64" 
                />
              </div>
            )}
            
            {/* Message text */}
            {text && (
              <div 
                className="text-gray-900 whitespace-pre-line text-sm mb-2"
                dangerouslySetInnerHTML={formatText(text)}
              />
            )}
            
            {/* Tags */}
            {formattedTags && (
              <div className="text-blue-600 text-sm">
                {formattedTags}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramPostPreview; 