import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, BarChart2, Clock, Bookmark } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const DashboardContentPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Content options for navigation
  const contentOptions = [
    {
      id: 'post',
      title: t('dashboard.tab_content_post') || 'Создать пост',
      description: t('dashboard.content_post_description') || 'Создайте и опубликуйте пост в Telegram',
      icon: <FileText className="h-8 w-8" />,
      path: '/dashboard/content/post'
    },
    {
      id: 'poll',
      title: t('dashboard.tab_content_poll') || 'Создать опрос',
      description: t('dashboard.content_poll_description') || 'Создайте интерактивный опрос для аудитории',
      icon: <BarChart2 className="h-8 w-8" />,
      path: '/dashboard/content/poll'
    },
    {
      id: 'autoposting',
      title: t('dashboard.tab_content_autoposting') || 'Автопостинг',
      description: t('dashboard.content_autoposting_description') || 'Настройте автоматическую публикацию контента',
      icon: <Clock className="h-8 w-8" />,
      path: '/dashboard/content/autoposting'
    },
    {
      id: 'drafts',
      title: t('dashboard.tab_content_drafts') || 'Черновики',
      description: t('dashboard.content_drafts_description') || 'Управляйте сохраненными черновиками',
      icon: <Bookmark className="h-8 w-8" />,
      path: '/dashboard/content/drafts'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {t('dashboard.content_title') || 'Создание контента'}
        </h2>
        <p className="text-gray-600">
          {t('dashboard.content_subtitle') || 'Выберите тип контента, который хотите создать'}
        </p>
      </div>

      {/* Content options grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contentOptions.map((option) => (
          <div
            key={option.id}
            className="group relative bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => navigate(option.path)}
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                {option.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {option.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {option.description}
                </p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardContentPage;

