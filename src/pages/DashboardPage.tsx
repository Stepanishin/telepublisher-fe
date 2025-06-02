import React, { useEffect, useState } from 'react';
import ContentGenerator from '../components/Dashboard/ContentGenerator';
import ChannelsManager from '../components/Dashboard/ChannelsManager';
import PublishPanel from '../components/Dashboard/PublishPanel';
import BotInstructionsPanel from '../components/Dashboard/BotInstructionsPanel';
import SubscriptionManager from '../components/Dashboard/SubscriptionManager';
import PollPublishPanel from '../components/Dashboard/PollPublishPanel';
import ScheduledPosts from '../components/Dashboard/ScheduledPosts';
import DraftsPanel from '../components/Dashboard/DraftsPanel';
// @ts-expect-error - Import AutoPostingPanel module has missing type declarations
import AutoPostingPanel from '../components/Dashboard/AutoPostingPanel';
import { useChannelsStore } from '../store/channelsStore';
import { useContentStore } from '../store/contentStore';
import { Zap, Settings, BookOpen, Crown, FileText, BarChart2, Calendar, Bookmark, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import TelegramPostPreview from '../components/ui/TelegramPostPreview';
import TelegramPollPreview from '../components/ui/TelegramPollPreview';

// Tab types for navigation
type TabType = 'content' | 'channels' | 'instructions' | 'subscription' | 'scheduled';
type ContentSubTabType = 'post' | 'poll' | 'autoposting' | 'drafts';

// Preview content type
interface PreviewContent {
  text: string;
  imageUrl: string;
  imageUrls: string[];
  tags: string[];
  imagePosition?: 'top' | 'bottom';
  buttons?: { text: string; url: string }[];
}

// Poll preview content type
interface PollPreviewContent {
  question: string;
  options: { text: string }[];
  isAnonymous: boolean;
  allowsMultipleAnswers: boolean;
}

const DashboardPage: React.FC = () => {
  const { fetchChannels } = useChannelsStore();
  const { content } = useContentStore();
  const [activeTab, setActiveTab] = useState<TabType>('content');
  const [activeContentSubTab, setActiveContentSubTab] = useState<ContentSubTabType>('post');
  const [previewContent, setPreviewContent] = useState<PreviewContent>({
    text: '',
    imageUrl: '',
    imageUrls: [],
    tags: [],
    imagePosition: 'top',
    buttons: []
  });
  const [pollPreviewContent, setPollPreviewContent] = useState<PollPreviewContent>({
    question: '',
    options: [{ text: '' }, { text: '' }],
    isAnonymous: true,
    allowsMultipleAnswers: false
  });
  const { t } = useLanguage();
  
  // Update preview when content from store changes
  useEffect(() => {
    setPreviewContent({
      text: content.text,
      imageUrl: content.imageUrl,
      imageUrls: content.imageUrls || [], // Ensure imageUrls is always defined
      tags: content.tags,
      imagePosition: content.imagePosition || 'top',
      buttons: content.buttons || []
    });
  }, [content]);
  
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

  // Content subtabs
  const contentSubTabs = [
    {
      id: 'post',
      label: t('dashboard.tab_content_post') || 'Post',
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: 'poll',
      label: t('dashboard.tab_content_poll') || 'Poll',
      icon: <BarChart2 className="h-4 w-4" />
    },
    {
      id: 'autoposting',
      label: t('dashboard.tab_content_autoposting') || 'AutoPosting',
      icon: <Clock className="h-4 w-4" />
    },
    {
      id: 'drafts',
      label: t('dashboard.tab_content_drafts') || 'Drafts',
      icon: <Bookmark className="h-4 w-4" />
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
          <>
            {/* Content subtabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-6" aria-label="Content Tabs">
                {contentSubTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveContentSubTab(tab.id as ContentSubTabType)}
                    className={`
                      whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
                      ${activeContentSubTab === tab.id
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

            {/* Content subtab content */}
            {activeContentSubTab === 'post' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <PublishPanel onContentChange={setPreviewContent} />
                </div>
                <div className="lg:col-span-1">
                  <ContentGenerator />
                  {(previewContent.text || previewContent.imageUrl || (previewContent.imageUrls && previewContent.imageUrls.length > 0) || (previewContent.tags && previewContent.tags.length > 0)) && (
                    <div className="mt-6">
                      <TelegramPostPreview
                        text={previewContent.text}
                        imageUrl={previewContent.imageUrl}
                        imageUrls={previewContent.imageUrls}
                        tags={previewContent.tags}
                        imagePosition={previewContent.imagePosition}
                        buttons={previewContent.buttons}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeContentSubTab === 'poll' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <PollPublishPanel 
                    onPollChange={(pollData) => setPollPreviewContent(pollData)}
                  />
                </div>
                <div className="lg:col-span-1">
                  <TelegramPollPreview
                    question={pollPreviewContent.question}
                    options={pollPreviewContent.options}
                    isAnonymous={pollPreviewContent.isAnonymous}
                    allowsMultipleAnswers={pollPreviewContent.allowsMultipleAnswers}
                  />
                </div>
              </div>
            )}

            {activeContentSubTab === 'autoposting' && (
              <div>
                <AutoPostingPanel />
              </div>
            )}

            {activeContentSubTab === 'drafts' && (
              <div>
                <DraftsPanel />
              </div>
            )}
          </>
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