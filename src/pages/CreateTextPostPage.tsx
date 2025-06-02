import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import ContentGenerator from '../components/Dashboard/ContentGenerator';
import PublishPanelText from '../components/Dashboard/PublishPanelText';
import TelegramPostPreview from '../components/ui/TelegramPostPreview';
import { useLanguage } from '../contexts/LanguageContext';

interface PreviewContent {
  text: string;
  tags: string[];
}

const CreateTextPostPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [previewContent, setPreviewContent] = useState<PreviewContent>({
    text: '',
    tags: []
  });

  const handleBack = () => {
    navigate('/dashboard/content/post');
  };

  const handleContentChange = (newContent: { text?: string; tags?: string[] }) => {
    setPreviewContent({
      text: newContent.text || '',
      tags: newContent.tags || []
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between space-x-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('post_type.text_title') || 'Текстовый пост'}
          </h1>
          <p className="text-gray-600">
            {t('post_type.text_description') || 'Создайте текстовое сообщение с форматированием и тегами'}
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
          <PublishPanelText 
            onContentChange={handleContentChange}
          />
        </div>

        {/* Right column - Content Generator + Preview */}
        <div className="space-y-6">
          <ContentGenerator />
          
          {/* Preview */}
          {(previewContent.text || previewContent.tags.length > 0) && (
            <TelegramPostPreview
              text={previewContent.text}
              tags={previewContent.tags}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTextPostPage; 