import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { FileText, Image, BarChart2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import TelegramPostPreview from '../ui/TelegramPostPreview';

// Post type definitions
type PostType = 'text' | 'image' | 'video' | 'media-group';

interface PostTypeOption {
  id: PostType;
  title: string;
  description: string;
  icon: React.ReactNode;
  example: {
    text: string;
    imageUrl?: string;
    imageUrls?: string[];
    tags?: string[];
  };
}

const PostTypeSelector: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<PostType>('text');

  const postTypes: PostTypeOption[] = [
    {
      id: 'text',
      title: t('post_type.text_title') || 'Текстовый пост',
      description: t('post_type.text_description') || 'Обычное текстовое сообщение с форматированием',
      icon: <FileText size={24} />,
      example: {
        text: t('post_type.text_example') || '🚀 Запускаем новый продукт!\n\nМы рады представить вам инновационное решение для управления контентом.\n\n✅ Быстрая публикация\n✅ Управление каналами\n✅ AI-генерация\n\n',
        tags: [t('post_type.text_example_tags') || '#new #content #telegram']
      }
    },
    {
      id: 'image',
      title: t('post_type.image_title') || 'Пост с изображением',
      description: t('post_type.image_description') || 'Текст с одним изображением',
      icon: <Image size={24} />,
      example: {
        text: t('post_type.image_example') || '🎨 Креативный дизайн для вашего бренда\n\nСоздаем уникальные визуальные решения, которые привлекают внимание и запоминаются.\n\n',
        imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&h=200&fit=crop',
        tags: [t('post_type.image_example_tags') || '#design #creative #branding']
      }
    },
    {
      id: 'media-group',
      title: t('post_type.media_group_title') || 'Медиа-группа',
      description: t('post_type.media_group_description') || 'Несколько изображений в одном посте',
      icon: <BarChart2 size={24} />,
      example: {
        text: t('post_type.media_group_example') || '📸 Фотоотчет с мероприятия\n\nДелимся яркими моментами с нашего последнего события. Было здорово!\n\n👥 200+ участников\n🎯 10 докладов\n⭐ Отличные отзывы\n\n',
        imageUrls: [
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&h=200&fit=crop',
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop',
          'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=300&h=200&fit=crop'
        ],
        tags: [t('post_type.media_group_example_tags') || '#event #photo #team']
      }
    }
  ];

  const selectedPostType = postTypes.find(type => type.id === selectedType)!;

  const handleContinue = () => {
    navigate(`/dashboard/content/create-${selectedType}`);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-x-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('post_type.title') || 'Выберите тип поста'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('post_type.subtitle') || 'Выберите формат поста, который лучше всего подходит для вашего контента'}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Post Types Selection */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('post_type.types_title') || 'Типы постов'}
          </h2>
          <div className="space-y-3">
            {postTypes.map((type) => (
              <div
                key={type.id}
                className={`cursor-pointer transition-all duration-200 border rounded-lg ${
                  selectedType === type.id
                    ? 'ring-2 ring-blue-500 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800'
                    : 'hover:shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${
                      selectedType === type.id
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {type.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('post_type.preview_title') || 'Предварительный просмотр'}
          </h2>
          <div className="sticky top-6">
            <TelegramPostPreview
              text={selectedPostType.example.text}
              imageUrl={selectedPostType.example.imageUrl}
              imageUrls={selectedPostType.example.imageUrls}
              tags={selectedPostType.example.tags}
              imagePosition={selectedPostType.id === 'image' ? 'bottom' : 'top'}
            />
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={handleContinue}
          size="lg"
          rightIcon={<ArrowRight size={20} />}
          className="px-8"
        >
          {t('post_type.continue') || 'Продолжить создание поста'}
        </Button>
      </div>
    </div>
  );
};

export default PostTypeSelector; 