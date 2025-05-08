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
    <div className="rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
      <div className="bg-blue-50 p-4 border-b border-gray-200">
        <h3 className="text-base font-medium text-gray-900 flex items-center">
          <Send className="h-5 w-5 mr-2 text-blue-600" />
          {t('post_preview.title') || 'Telegram Post Preview'}
        </h3>
      </div>
    <div className="p-4 mb-4">
      <div className="border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
        {/* Header - styled like Telegram */}
        <div className="bg-[#F0F2F5] p-3 flex items-start">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
              <span className="text-sm font-medium">T</span>
            </div>
            <div className="ml-3">
              <div className="font-semibold text-sm">Telegram</div>
              <div className="text-xs text-gray-500">Post</div>
            </div>
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
    </div>
  );
};

export default TelegramPostPreview; 