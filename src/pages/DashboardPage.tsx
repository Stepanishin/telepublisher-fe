import React, { useEffect, useState } from 'react';
import ContentGenerator from '../components/Dashboard/ContentGenerator';
import ChannelsManager from '../components/Dashboard/ChannelsManager';
import PublishPanel from '../components/Dashboard/PublishPanel';
import BotInstructionsPanel from '../components/Dashboard/BotInstructionsPanel';
import SubscriptionManager from '../components/Dashboard/SubscriptionManager';
import { useChannelsStore } from '../store/channelsStore';
import { Zap, Settings, BookOpen, Crown } from 'lucide-react';

// Tab types for navigation
type TabType = 'content' | 'channels' | 'instructions' | 'subscription';

const DashboardPage: React.FC = () => {
  const { fetchChannels } = useChannelsStore();
  const [activeTab, setActiveTab] = useState<TabType>('content');
  
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // Tab configuration
  const tabs = [
    { id: 'content', label: 'Генерация контента', icon: <Zap className="h-5 w-5" /> },
    { id: 'channels', label: 'Управление каналами', icon: <Settings className="h-5 w-5" /> },
    { id: 'instructions', label: 'Инструкция', icon: <BookOpen className="h-5 w-5" /> },
    { id: 'subscription', label: 'Подписка', icon: <Crown className="h-5 w-5" /> },
  ];
  
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление контентом</h1>
        <p className="text-gray-600">
          Создавайте, редактируйте и публикуйте контент в Telegram-каналы
        </p>
      </div>
      
      {/* Tabs navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ContentGenerator />
            </div>
            <div>
              <PublishPanel />
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
      </div>
    </div>
  );
};

export default DashboardPage;