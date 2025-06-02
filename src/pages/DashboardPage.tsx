import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChannelsManager from '../components/Dashboard/ChannelsManager';
import BotInstructionsPanel from '../components/Dashboard/BotInstructionsPanel';
import SubscriptionManager from '../components/Dashboard/SubscriptionManager';
import ScheduledPosts from '../components/Dashboard/ScheduledPosts';
import { useChannelsStore } from '../store/channelsStore';
import { Zap, Settings, BookOpen, Crown, FileText, BarChart2, Calendar, Bookmark, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Tab types for navigation
type TabType = 'content' | 'channels' | 'instructions' | 'subscription' | 'scheduled';

const DashboardPage: React.FC = () => {
  const { fetchChannels } = useChannelsStore();
  const [activeTab, setActiveTab] = useState<TabType>('content');
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // Tab configuration with short labels for small screens
  const tabs = [
    { 
      id: 'content', 
      label: t('dashboard.tab_content'),
      shortLabel: t('dashboard.tab_content_short') || 'Content',
      icon: <Zap className="h-5 w-5" /> 
    },
    { 
      id: 'channels', 
      label: t('dashboard.tab_channels'),
      shortLabel: t('dashboard.tab_channels_short') || 'Channels',
      icon: <Settings className="h-5 w-5" /> 
    },
    { 
      id: 'instructions', 
      label: t('dashboard.tab_instructions'),
      shortLabel: t('dashboard.tab_instructions_short') || 'Guide',
      icon: <BookOpen className="h-5 w-5" /> 
    },
    { 
      id: 'subscription', 
      label: t('dashboard.tab_subscription'),
      shortLabel: t('dashboard.tab_subscription_short') || 'Sub',
      icon: <Crown className="h-5 w-5" /> 
    },
    { 
      id: 'scheduled', 
      label: t('dashboard.tab_scheduled'),
      shortLabel: t('dashboard.tab_scheduled_short') || 'Scheduled',
      icon: <Calendar className="h-5 w-5" /> 
    },
  ];

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('dashboard.title')}</h1>
        <p className="text-gray-600">
          {t('dashboard.subtitle')}
        </p>
      </div>
      
      {/* Tabs navigation */}
      <div className="border-b border-gray-200">
        {/* Extra small screen tabs - only icons with tiny labels */}
        <div className="sm:hidden">
          <div className="grid grid-cols-4 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  flex flex-col items-center justify-center py-2 px-1 border-b-2 text-xs
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <div className="p-1">
                  {tab.icon}
                </div>
                <span className="truncate max-w-full">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Small screen tabs (scroll horizontally) */}
        <div className="hidden sm:block md:hidden">
          <div className="overflow-x-auto -mb-px flex" style={{ scrollbarWidth: 'none' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  whitespace-nowrap py-3 px-3 border-b-2 font-medium text-sm flex-shrink-0
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  flex items-center
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Desktop tabs */}
        <nav className="-mb-px hidden md:flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                flex items-center
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="mt-8">
        {activeTab === 'content' && (
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
        )}
        
        {activeTab === 'channels' && (
          <div>
            <ChannelsManager />
          </div>
        )}
        
        {activeTab === 'instructions' && (
          <div>
            <BotInstructionsPanel />
          </div>
        )}
        
        {activeTab === 'subscription' && (
          <div>
            <SubscriptionManager />
          </div>
        )}
        
        {activeTab === 'scheduled' && (
          <div>
            <ScheduledPosts />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;