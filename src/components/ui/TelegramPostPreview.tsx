import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Send, ChevronLeft, ChevronRight } from 'lucide-react';

interface TelegramPostPreviewProps {
  text: string;
  imageUrl?: string;
  imageUrls?: string[];
  tags?: string[];
}

const TelegramPostPreview: React.FC<TelegramPostPreviewProps> = ({
  text,
  imageUrl,
  imageUrls = [],
  tags = []
}) => {
  const { t } = useLanguage();
  
  // Объединяем все изображения в единый массив
  const allImages = React.useMemo(() => {
    const images = [...imageUrls];
    if (imageUrl && !images.includes(imageUrl)) {
      images.unshift(imageUrl);
    }
    return images;
  }, [imageUrl, imageUrls]);
  
  // Автоматически показываем галерею, если есть несколько изображений
  const [showGallery, setShowGallery] = React.useState(allImages.length > 1);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  
  // Синхронизируем состояние с props
  React.useEffect(() => {
    // Если количество изображений изменилось, обновляем режим отображения
    if (allImages.length > 1) {
      setShowGallery(true);
    } else {
      setShowGallery(false);
    }
    // Сбрасываем индекс
    setCurrentImageIndex(0);
  }, [allImages.length]);

  // Функция для определения итогового отображаемого изображения
  const displayImage = React.useMemo(() => {
    if (showGallery && allImages.length > 0) {
      return allImages[currentImageIndex];
    }
    return imageUrl;
  }, [imageUrl, allImages, currentImageIndex, showGallery]);

  // Проверяем, есть ли изображение для отображения
  const hasImageToDisplay = React.useMemo(() => {
    return displayImage && displayImage.trim() !== '';
  }, [displayImage]);

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

  // Переключение на следующее изображение в галерее
  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  // Переключение на предыдущее изображение в галерее
  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  // Переключаем режим отображения между одиночным изображением и галереей
  const toggleGalleryMode = () => {
    if (allImages.length > 1) {
      setShowGallery(prev => !prev);
      setCurrentImageIndex(0);
    }
    // Если только одно изображение, не показываем галерею
  };

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
            {/* Показываем изображения */}
            {hasImageToDisplay && allImages.length > 0 && (
              <div className="mb-2 self-center w-full">
                {/* Показываем текущее изображение */}
                <div className="relative">
                  <img 
                    src={displayImage} 
                    alt="Preview" 
                    className="max-w-full rounded-lg mx-auto object-cover max-h-64"
                  />
                  
                  {/* Показываем индикатор галереи, если есть несколько изображений */}
                  {allImages.length > 1 && !showGallery && (
                    <div 
                      className="absolute bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-md cursor-pointer"
                      onClick={toggleGalleryMode}
                    >
                      {`+ ${allImages.length} ${t('post_preview.images') || 'images'}`}
                    </div>
                  )}
                  
                  {/* Показываем режим галереи и индикатор текущего изображения */}
                  {showGallery && allImages.length > 1 && (
                    <div className="absolute top-0 left-0 w-full bg-black bg-opacity-70 px-3 py-1 flex justify-between items-center">

                      <span className="text-white text-xs">
                        {`${currentImageIndex + 1}/${allImages.length}`}
                      </span>
                    </div>
                  )}
                  
                  {/* Показываем кнопки навигации в режиме галереи */}
                  {showGallery && allImages.length > 1 && (
                    <>
                      <button
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                        onClick={prevImage}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                        onClick={nextImage}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </>
                  )}
                  
                  {/* Миниатюры для галереи (опционально) */}
                  {showGallery && allImages.length > 1 && (
                    <div className="flex mt-2 overflow-x-auto space-x-2 pb-2">
                      {allImages.map((img, idx) => (
                        <div 
                          key={idx}
                          className={`w-12 h-12 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 
                            ${idx === currentImageIndex ? 'border-blue-500' : 'border-transparent'}`}
                          onClick={() => setCurrentImageIndex(idx)}
                        >
                          <img 
                            src={img} 
                            alt={`Thumbnail ${idx + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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