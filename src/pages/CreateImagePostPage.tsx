import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import ContentGenerator from '../components/Dashboard/ContentGenerator';
import PublishPanelImage from '../components/Dashboard/PublishPanelImage';
import TelegramPostPreview from '../components/ui/TelegramPostPreview';
import { useLanguage } from '../contexts/LanguageContext';

interface PreviewContent {
  text: string;
  imageUrl: string;
  tags: string[];
  imagePosition: 'bottom';
  buttons?: { text: string; url: string }[];
}

const CreateImagePostPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [previewContent, setPreviewContent] = useState<PreviewContent>({
    text: '',
    imageUrl: 'https://picsum.photos/id/237/200/300',
    tags: [],
    imagePosition: 'bottom',
    buttons: []
  });

  const handleBack = () => {
    navigate('/dashboard/content/post');
  };

  const handleContentChange = (newContent: { 
    text?: string; 
    imageUrl?: string; 
    tags?: string[]; 
    buttons?: { text: string; url: string }[] 
  }) => {
    setPreviewContent({
      text: newContent.text || '',
      imageUrl: newContent.imageUrl || '',
      tags: newContent.tags || [],
      imagePosition: 'bottom',
      buttons: newContent.buttons || []
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between space-x-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('post_type.image_title') || 'Пост с изображением'}
          </h1>
          <p className="text-gray-600">
            {t('post_type.image_description') || 'Создайте пост с текстом и одним изображением'}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleBack}
          leftIcon={<ArrowLeft size={16} />}
        >
          {t('common.back') || 'Назад'}
        </Button>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Publish Panel */}
        <div>
          <PublishPanelImage 
            onContentChange={handleContentChange}
          />
        </div>

        {/* Right column - Content Generator + Preview */}
        <div className="space-y-6">
          <ContentGenerator />
          
          {/* Preview */}
          {(previewContent.text || previewContent.imageUrl || previewContent.tags.length > 0) && (
            <TelegramPostPreview
              text={previewContent.text}
              imageUrl={previewContent.imageUrl}
              tags={previewContent.tags}
              imagePosition="bottom"
              buttons={previewContent.buttons}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateImagePostPage; 