import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import ContentGenerator from '../components/Dashboard/ContentGenerator';
import PublishPanelMediaGroup from '../components/Dashboard/PublishPanelMediaGroup';
import TelegramPostPreview from '../components/ui/TelegramPostPreview';
import { useLanguage } from '../contexts/LanguageContext';

interface PreviewContent {
  text: string;
  imageUrls: string[];
  tags: string[];
  imagePosition: 'top';
  buttons?: { text: string; url: string }[];
}

const CreateMediaGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [previewContent, setPreviewContent] = useState<PreviewContent>({
    text: '',
    imageUrls: [],
    tags: [],
    imagePosition: 'top',
    buttons: [],
  });

  const handleBack = () => {
    navigate('/dashboard/content/post');
  };

  const handleContentChange = (newContent: {
    text?: string;
    imageUrls?: string[];
    tags?: string[];
    buttons?: { text: string; url: string }[];
  }) => {
    setPreviewContent({
      text: newContent.text || '',
      imageUrls: newContent.imageUrls || [],
      tags: newContent.tags || [],
      imagePosition: 'top',
      buttons: newContent.buttons || [],
    });
  };

  return (
    <div className='space-y-6'>
      {/* Header with back button */}
      <div className='flex items-center justify-between space-x-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            {t('post_type.media_group_title') || 'Медиа-группа'}
          </h1>
          <p className='text-gray-600'>
            {t('post_type.media_group_description') ||
              'Создайте пост с несколькими изображениями'}
          </p>
        </div>

        <Button
          variant='outline'
          size='sm'
          onClick={handleBack}
          leftIcon={<ArrowLeft size={16} />}
        >
          {t('common.back') || 'Назад'}
        </Button>
      </div>

      {/* Main content */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Left column - Publish Panel */}
        <div>
          <PublishPanelMediaGroup onContentChange={handleContentChange} />
        </div>

        {/* Right column - Content Generator + Preview */}
        <div className='space-y-6'>
          <ContentGenerator />

          {/* Preview */}
          {(previewContent.text ||
            previewContent.imageUrls.length > 0 ||
            previewContent.tags.length > 0) && (
            <TelegramPostPreview
              text={previewContent.text}
              imageUrls={previewContent.imageUrls}
              tags={previewContent.tags}
              imagePosition='top'
              buttons={previewContent.buttons}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateMediaGroupPage;
