import React, { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useChannelsStore } from '../store/channelsStore';
import { Zap, Settings, BookOpen, Crown, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Tab types for navigation
type TabType = 'content' | 'channels' | 'instructions' | 'subscription' | 'scheduled';

const DashboardPage: React.FC = () => {
  const { fetchChannels } = useChannelsStore();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // Determine active tab from current path
  const getActiveTab = (): TabType => {
    const path = location.pathname;
    // Check for exact tab matches first
    if (path.startsWith('/dashboard/channels')) return 'channels';
    if (path.startsWith('/dashboard/instructions')) return 'instructions';
    if (path.startsWith('/dashboard/subscription')) return 'subscription';
    if (path.startsWith('/dashboard/scheduled')) return 'scheduled';
    // Default to content for /dashboard, /dashboard/content, and all content sub-routes
    return 'content';
  };

  const activeTab = getActiveTab();

  // Tab configuration with short labels for small screens
  const tabs = [
    { 
      id: 'content', 
      label: t('dashboard.tab_content'),
      shortLabel: t('dashboard.tab_content_short') || 'Content',
      icon: <Zap className="h-5 w-5" />,
      path: '/dashboard/content'
    },
    { 
      id: 'channels', 
      label: t('dashboard.tab_channels'),
      shortLabel: t('dashboard.tab_channels_short') || 'Channels',
      icon: <Settings className="h-5 w-5" />,
      path: '/dashboard/channels'
    },
    { 
      id: 'instructions', 
      label: t('dashboard.tab_instructions'),
      shortLabel: t('dashboard.tab_instructions_short') || 'Guide',
      icon: <BookOpen className="h-5 w-5" />,
      path: '/dashboard/instructions'
    },
    { 
      id: 'subscription', 
      label: t('dashboard.tab_subscription'),
      shortLabel: t('dashboard.tab_subscription_short') || 'Sub',
      icon: <Crown className="h-5 w-5" />,
      path: '/dashboard/subscription'
    },
    { 
      id: 'scheduled', 
      label: t('dashboard.tab_scheduled'),
      shortLabel: t('dashboard.tab_scheduled_short') || 'Scheduled',
      icon: <Calendar className="h-5 w-5" />,
      path: '/dashboard/scheduled'
    },
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
                onClick={() => navigate(tab.path)}
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
                onClick={() => navigate(tab.path)}
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
              onClick={() => navigate(tab.path)}
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
      
      {/* Tab content - rendered via nested routes */}
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardPage;