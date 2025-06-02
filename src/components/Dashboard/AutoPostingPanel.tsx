/**
 * @fileoverview
 * @suppress {checkTypes}
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { PlusCircle, Clock, Settings, Calendar, Tag, Hash, Search, ExternalLink, Image } from 'lucide-react';
import Button from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import Select from '../ui/Select';
import { useChannelsStore } from '../../store/channelsStore';
import Input from '../ui/Input';
import TagInput from '../ui/TagInput';
import { useNotification } from '../../contexts/NotificationContext';
import { createAutoPostingRule, deleteAutoPostingRule, getAutoPostingRules, updateAutoPostingRule, getAutoPostingHistory } from '../../services/api';

// Типы подвкладок
type AutoPostingSubTab = 'rules' | 'logs' | 'editor';

// Типы правил автопостинга
export type Frequency = 'daily' | 'weekly' | 'custom';
export type TimeUnit = 'minutes' | 'hours' | 'days';

// Тип правила автопостинга
export interface AutoPostingRule {
  _id?: string;
  id?: string;
  name: string;
  topic: string;
  status: 'active' | 'inactive';
  frequency: Frequency;
  customInterval?: number;
  customTimeUnit?: TimeUnit;
  preferredTime?: string;
  preferredDays?: string[];
  channelId: string;
  imageGeneration: boolean;
  keywords?: string[];
  sourceUrls?: string[]; // URLs to scrape content from
  avoidDuplication?: boolean; // Check for content duplication
  duplicateCheckDays?: number; // Number of days to check back for duplicates
  nextScheduled?: Date | null;
  lastPublished?: Date | null;
  buttons?: { text: string; url: string }[];
}

// Тип записи истории автопостинга
export interface AutoPostingHistoryEntry {
  _id?: string;
  ruleId: string;
  ruleName: string;
  channelId?: string;
  channelName?: string;
  postId?: string;
  status: 'success' | 'failed';
  message?: string;
  contentSummary?: string;
  content?: string;
  imageUrl?: string;
  buttons?: { text: string; url: string }[];
  createdAt: Date;
  postUrl?: string;
}

const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const AutoPostingPanel: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<AutoPostingSubTab>('rules');
  const [rules, setRules] = useState<AutoPostingRule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRule, setSelectedRule] = useState<AutoPostingRule | null>(null);
  const { t } = useLanguage();
  const { channels } = useChannelsStore();
  const { setNotification } = useNotification();
  
  // История автопостинга
  const [historyLoading, setHistoryLoading] = useState<boolean>(true);
  const [historyEntries, setHistoryEntries] = useState<AutoPostingHistoryEntry[]>([]);
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [hasMoreHistory, setHasMoreHistory] = useState<boolean>(true);
  const [selectedHistoryFilter, setSelectedHistoryFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Form fields
  const [ruleName, setRuleName] = useState<string>('');
  const [ruleTopic, setRuleTopic] = useState<string>('');
  const [ruleFrequency, setRuleFrequency] = useState<Frequency>('daily');
  const [ruleStatus, setRuleStatus] = useState<'active' | 'inactive'>('active');
  const [ruleChannel, setRuleChannel] = useState<string>('');
  const [customInterval, setCustomInterval] = useState<number>(1);
  const [customTimeUnit, setCustomTimeUnit] = useState<TimeUnit>('days');
  const [preferredTime, setPreferredTime] = useState<string>('12:00');
  const [preferredDays, setPreferredDays] = useState<string[]>(['monday', 'wednesday', 'friday']);
  const [generateImages, setGenerateImages] = useState<boolean>(true);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [sourceUrls, setSourceUrls] = useState<string[]>([]);
  const [newSourceUrl, setNewSourceUrl] = useState<string>('');
  const [buttons, setButtons] = useState<{ text: string; url: string }[]>([]);
  const [buttonText, setButtonText] = useState<string>('');
  const [buttonUrl, setButtonUrl] = useState<string>('');
  const [avoidDuplication, setAvoidDuplication] = useState<boolean>(false);
  const [duplicateCheckDays, setDuplicateCheckDays] = useState<number>(7);
  
  // Fetch rules on component mount
  useEffect(() => {
    fetchRules();
  }, []);
  
  // Загружать историю при переходе на вкладку логов
  useEffect(() => {
    if (activeSubTab === 'logs') {
      fetchHistory(1, true);
    }
  }, [activeSubTab]);
  
  // Загружать историю при изменении фильтра
  useEffect(() => {
    if (activeSubTab === 'logs') {
      fetchHistory(1, true);
    }
  }, [selectedHistoryFilter]);
  
  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await getAutoPostingRules();
      setRules(response.data || []);
    } catch (error) {
      console.error('Failed to fetch auto-posting rules:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load auto-posting rules'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Функция для загрузки истории автопостинга
  const fetchHistory = async (page = 1, reset = false) => {
    setHistoryLoading(true);
    
    try {
      const response = await getAutoPostingHistory(20, page, selectedHistoryFilter, searchTerm);
      
      console.log('API Response:', response);
      
      if (response.success) {
        // Адаптируем ответ API к ожидаемому формату
        const entries = response.data?.data?.history || [];
        const hasMore = response.data?.data?.pagination?.totalPages > page;
        
        console.log('Parsed entries:', entries);
        
        // Преобразуем строковые даты в объекты Date
        const processedEntries = entries.map((entry: Omit<AutoPostingHistoryEntry, 'createdAt'> & { createdAt: string | Date }) => ({
          ...entry,
          createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date()
        }));
        
        console.log('Processed entries:', processedEntries);
        
        if (reset) {
          setHistoryEntries(processedEntries);
        } else {
          setHistoryEntries(prev => [...prev, ...processedEntries]);
        }
        
        console.log('Current state historyEntries:', processedEntries);
        
        setHistoryPage(page);
        setHasMoreHistory(hasMore);
      } else {
        setNotification({
          type: 'error',
          message: t('auto_posting.history_load_error')
        });
      }
    } catch (error) {
      console.error('Failed to fetch auto-posting history:', error);
      setNotification({
        type: 'error',
        message: t('auto_posting.history_load_error')
      });
    } finally {
      setHistoryLoading(false);
    }
  };
  
  // Функция загрузки следующей страницы истории
  const loadMoreHistory = () => {
    if (!historyLoading && hasMoreHistory) {
      fetchHistory(historyPage + 1);
    }
  };
  
  // Функция для поиска в истории
  const handleHistorySearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory(1, true);
  };
  
  // Функция для создания нового правила
  const handleCreateRule = () => {
    resetForm();
    setSelectedRule(null);
    setActiveSubTab('editor');
  };
  
  // Функция для редактирования правила
  const handleEditRule = (rule: AutoPostingRule) => {
    setSelectedRule(rule);
    
    // Fill form with rule data
    setRuleName(rule.name);
    setRuleTopic(rule.topic);
    setRuleFrequency(rule.frequency);
    setRuleStatus(rule.status);
    setRuleChannel(rule.channelId);
    setCustomInterval(rule.customInterval || 1);
    setCustomTimeUnit(rule.customTimeUnit || 'days');
    setPreferredTime(rule.preferredTime || '12:00');
    setPreferredDays(rule.preferredDays || ['monday', 'wednesday', 'friday']);
    setGenerateImages(rule.imageGeneration);
    setKeywords(rule.keywords || []);
    setSourceUrls(rule.sourceUrls || []);
    setNewSourceUrl('');
    setButtons(rule.buttons || []);
    setButtonText('');
    setButtonUrl('');
    setAvoidDuplication(rule.avoidDuplication || false);
    setDuplicateCheckDays(rule.duplicateCheckDays || 7);
    
    setActiveSubTab('editor');
  };
  
  // Reset form
  const resetForm = () => {
    setRuleName('');
    setRuleTopic('');
    setRuleFrequency('daily');
    setRuleStatus('active');
    setRuleChannel(channels.length > 0 && channels[0]._id ? channels[0]._id : '');
    setCustomInterval(1);
    setCustomTimeUnit('days');
    setPreferredTime('12:00');
    setPreferredDays(['monday', 'wednesday', 'friday']);
    setGenerateImages(true);
    setKeywords([]);
    setSourceUrls([]);
    setNewSourceUrl('');
    setButtons([]);
    setButtonText('');
    setButtonUrl('');
    setAvoidDuplication(false);
    setDuplicateCheckDays(7);
  };
  
  // Handle save rule
  const handleSaveRule = async () => {
    // Form validation
    if (!ruleName.trim()) {
      setNotification({
        type: 'error',
        message: 'Rule name is required'
      });
      return;
    }
    
    if (!ruleTopic.trim()) {
      setNotification({
        type: 'error',
        message: 'Topic is required'
      });
      return;
    }
    
    if (!ruleChannel) {
      setNotification({
        type: 'error',
        message: 'Channel selection is required'
      });
      return;
    }

    // Find the selected channel object to get its MongoDB _id
    const selectedChannel = channels.find(c => c._id === ruleChannel);
    if (!selectedChannel) {
      setNotification({
        type: 'error',
        message: 'Selected channel not found'
      });
      return;
    }

    // Use _id (MongoDB ObjectId) as channelId if available, otherwise fallback to id
    const channelMongoId = selectedChannel._id || selectedChannel.id;
    
    // Prepare the rule data based on frequency type
    const ruleData: AutoPostingRule = {
      name: ruleName,
      topic: ruleTopic,
      status: ruleStatus,
      frequency: ruleFrequency,
      channelId: channelMongoId,
      imageGeneration: generateImages,
      keywords: keywords,
      sourceUrls: sourceUrls,
      buttons: buttons.length > 0 ? buttons : undefined,
      avoidDuplication: avoidDuplication,
      duplicateCheckDays: duplicateCheckDays
    };
    
    // Add frequency-specific fields
    if (ruleFrequency === 'custom') {
      ruleData.customInterval = customInterval;
      ruleData.customTimeUnit = customTimeUnit;
      // Custom interval doesn't use preferred time in UI, but backend still expects it
      // Setting a default value to match backend expectations
      ruleData.preferredTime = '12:00';
      // For custom frequency, preferredDays is not used in calculation but still sent for consistency
      ruleData.preferredDays = weekDays;
    } else {
      // For daily and weekly, add preferred time
      ruleData.preferredTime = preferredTime;
      
      // For weekly, add preferred days
      if (ruleFrequency === 'weekly') {
        // Ensure at least one day is selected
        if (preferredDays.length === 0) {
          setNotification({
            type: 'error',
            message: 'Please select at least one day of the week'
          });
          return;
        }
        ruleData.preferredDays = preferredDays;
      } else {
        // For daily, set all days as preferred
        ruleData.preferredDays = weekDays;
      }
    }
    
    try {
      if (selectedRule && selectedRule._id) {
        // Update existing rule
        console.log('Updating rule with data:', JSON.stringify(ruleData, null, 2));
        await updateAutoPostingRule(selectedRule._id, ruleData);
        setNotification({
          type: 'success',
          message: 'Auto-posting rule updated successfully'
        });
      } else {
        // Create new rule
        console.log('Creating rule with data:', JSON.stringify(ruleData, null, 2));
        await createAutoPostingRule(ruleData);
        setNotification({
          type: 'success',
          message: 'Auto-posting rule created successfully'
        });
      }
      
      // Refresh rules list
      await fetchRules();
      
      // Return to rules list
      setActiveSubTab('rules');
    } catch (error) {
      console.error('Failed to save auto-posting rule:', error);
      setNotification({
        type: 'error',
        message: 'Failed to save auto-posting rule'
      });
    }
  };
  
  // Handle delete rule
  const handleDeleteRule = async (ruleId: string) => {
    if (!ruleId) return;
    
    if (!window.confirm(t('auto_posting.confirm_delete'))) {
      return;
    }
    
    try {
      await deleteAutoPostingRule(ruleId);
      setNotification({
        type: 'success',
        message: 'Auto-posting rule deleted successfully'
      });
      
      // Refresh rules list
      await fetchRules();
    } catch (error) {
      console.error('Failed to delete auto-posting rule:', error);
      setNotification({
        type: 'error',
        message: 'Failed to delete auto-posting rule'
      });
    }
  };
  
  // Get channel name by ID
  const getChannelName = (channelId: string) => {
    const channel = channels.find(c => c._id === channelId);
    return channel ? channel.username : 'Unknown channel';
  };
  
  // Format next scheduled date
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return t('auto_posting.not_scheduled');
    
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    return date.toLocaleString();
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('auto_posting.title')}</CardTitle>
          <p className="text-sm text-gray-500 mt-1">{t('auto_posting.subtitle')}</p>
        </div>
        {activeSubTab === 'rules' && (
          <Button 
            onClick={handleCreateRule}
            leftIcon={<PlusCircle size={16} />}
          >
            {t('auto_posting.create_rule')}
          </Button>
        )}
      </CardHeader>
      
      <div className="border-b border-gray-200 px-6">
        <nav className="-mb-px flex space-x-6" aria-label="Auto-posting Tabs">
          <button
            onClick={() => setActiveSubTab('rules')}
            className={`
              whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
              ${activeSubTab === 'rules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              flex items-center
            `}
          >
            <Settings size={16} className="mr-2" />
            {t('auto_posting.tab_rules')}
          </button>
          {/* <button
            onClick={() => setActiveSubTab('logs')}
            className={`
              whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
              ${activeSubTab === 'logs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              flex items-center
            `}
          >
            <Clock size={16} className="mr-2" />
            {t('auto_posting.tab_logs')}
          </button> */}
        </nav>
      </div>
      
      <CardContent className="pt-6">
        {activeSubTab === 'rules' && (
          <div>
            {loading ? (
              <div className="text-center py-10">
                <p>{t('common.loading') || 'Loading rules...'}</p>
              </div>
            ) : rules.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                <Clock className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  {t('auto_posting.no_rules')}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('auto_posting.create_first_rule')}
                </p>
                <div className="mt-6">
                  <Button onClick={handleCreateRule} leftIcon={<PlusCircle size={16} />}>
                    {t('auto_posting.create_rule')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {rules.map(rule => (
                  <div 
                    key={rule._id || rule.id} 
                    className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="cursor-pointer" onClick={() => handleEditRule(rule)}>
                        <h3 className="font-medium text-lg">{rule.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{t('auto_posting.content_topic')}: {rule.topic}</p>
                        <p className="text-sm text-gray-600">{t('auto_posting.target_channel')}: {getChannelName(rule.channelId)}</p>
                        {rule.buttons && rule.buttons.length > 0 && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">{t('auto_posting.buttons') || 'Buttons'}:</span> {rule.buttons.length}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-2 ">
                          {rule.status === 'active' 
                            ? `${t('auto_posting.next_publication')}: ${formatDate(rule.nextScheduled)}`
                            : t('auto_posting.status_inactive')}
                        </p>
                        {rule.lastPublished && (
                          <p className="text-sm text-gray-600">
                            {t('auto_posting.last_published')}: {formatDate(rule.lastPublished)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2">
                        <span 
                          className={`px-2 py-1 text-xs font-medium rounded-full flex items-center justify-center ${
                            rule.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {rule.status === 'active' ? t('auto_posting.status_active') : t('auto_posting.status_inactive')}
                        </span>
                        <div className="flex space-x-2 mt-2">
                          <button 
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            onClick={() => handleEditRule(rule)}
                          >
                            {t('common.edit') || 'Edit'}
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800 text-sm"
                            onClick={() => handleDeleteRule(rule._id || rule.id || '')}
                          >
                            {t('common.delete') || 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeSubTab === 'logs' && (
          <div>
            {/* Заголовок и фильтры */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">
                {t('auto_posting.history_title')}
              </h3>
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedHistoryFilter('all')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                      selectedHistoryFilter === 'all'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('auto_posting.all_posts')}
                  </button>
                  <button
                    onClick={() => setSelectedHistoryFilter('success')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                      selectedHistoryFilter === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('auto_posting.successful_posts')}
                  </button>
                  <button
                    onClick={() => setSelectedHistoryFilter('failed')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                      selectedHistoryFilter === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('auto_posting.failed_posts')}
                  </button>
                </div>
                
                <form onSubmit={handleHistorySearch} className="flex">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-500" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t('auto_posting.search_placeholder')}
                      className="py-2 pl-10 pr-4 border border-gray-300 rounded-md text-sm w-full md:w-64"
                    />
                  </div>
                  <button
                    type="submit"
                    className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                  >
                    {t('common.search')}
                  </button>
                </form>
              </div>
            </div>
            
            {historyLoading && historyPage === 1 ? (
              <div className="text-center py-10">
                <p>{t('common.loading') || 'Загрузка...'}</p>
              </div>
            ) : historyEntries.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                <Clock className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  {t('auto_posting.no_history')}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('auto_posting.history_empty_description')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyEntries.map(entry => (
                  <div 
                    key={entry._id || entry.postId} 
                    className={`border rounded-lg p-4 hover:shadow-sm transition-shadow ${
                      entry.status === 'success' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-base">{entry.ruleName}</h4>
                          <span 
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              entry.status === 'success' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {entry.status === 'success' 
                              ? t('auto_posting.status_success') 
                              : t('auto_posting.status_failed')}
                          </span>
                          {entry.imageUrl && !entry.imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net') && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                              <Image size={12} className="inline mr-1" />
                              {t('auto_posting.has_image')}
                            </span>
                          )}
                        </div>
                        
                        {entry.channelName && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">{t('auto_posting.target_channel')}:</span> {entry.channelName}
                          </p>
                        )}
                        
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">{t('auto_posting.published_date')}:</span> {formatDate(entry.createdAt)}
                        </p>
                        
                        {entry.buttons && entry.buttons.length > 0 && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">{t('auto_posting.buttons') || 'Buttons'}:</span> {entry.buttons.length}
                          </p>
                        )}
                        
                        {entry.message && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">{t('auto_posting.message')}:</span> {entry.message}
                          </p>
                        )}
                        
                        <div className="mt-2 bg-gray-50 p-3 rounded border border-gray-200">
                          <div className="flex items-start gap-2">
                            <Image size={16} className="text-gray-500 mt-1 shrink-0" />
                            <p className="text-sm text-gray-700 line-clamp-3">{entry.contentSummary || entry.content || "No content available"}</p>
                          </div>
                        </div>
                      </div>
                      
                      {entry.imageUrl && (
                        <div className="shrink-0">
                          <img 
                            src={entry.imageUrl} 
                            alt={t('auto_posting.post_image')} 
                            className="w-24 h-24 object-cover rounded-md border border-gray-200" 
                            onError={(e) => {
                              // Заменяем изображение на плейсхолдер при ошибке загрузки
                              e.currentTarget.src = 'https://via.placeholder.com/96x96?text=Image+Unavailable';
                              // Добавляем класс для затемнения плейсхолдера
                              e.currentTarget.classList.add('opacity-60');
                            }}
                          />
                        </div>
                      )}
                    </div>
                    
                    {entry.postUrl ? (
                      <div className="mt-3 text-right">
                        <a 
                          href={entry.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {t('auto_posting.view_post')}
                          <ExternalLink size={14} className="ml-1" />
                        </a>
                      </div>
                    ) : entry.postId ? (
                      <div className="mt-3 text-right">
                        <span className="text-gray-500 text-sm">
                          {t('auto_posting.post_id')}: {entry.postId}
                        </span>
                      </div>
                    ) : null}
                  </div>
                ))}
                
                {hasMoreHistory && (
                  <div className="text-center py-4">
                    <Button
                      variant="outline"
                      onClick={loadMoreHistory}
                      isLoading={historyLoading}
                    >
                      {t('auto_posting.load_more')}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {activeSubTab === 'editor' && (
          <div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-medium mb-4">
                {selectedRule ? `${t('auto_posting.update_button')}: ${selectedRule.name}` : t('auto_posting.create_button')}
              </h3>
              
              <div className="space-y-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auto_posting.rule_name')} *
                    </label>
                    <Input
                      value={ruleName}
                      onChange={(e) => setRuleName(e.target.value)}
                      placeholder="Daily News Update"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auto_posting.content_topic')} *
                    </label>
                    <Input
                      value={ruleTopic}
                      onChange={(e) => setRuleTopic(e.target.value)}
                      placeholder="Tech news, cryptocurrency updates"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('auto_posting.content_topic_description')}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auto_posting.status')}
                    </label>
                    <Select
                      value={ruleStatus}
                      onChange={(e) => setRuleStatus(e.target.value as 'active' | 'inactive')}
                      className="w-full"
                    >
                      <option value="active">{t('auto_posting.status_active')}</option>
                      <option value="inactive">{t('auto_posting.status_inactive')}</option>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auto_posting.target_channel')} *
                    </label>
                    <Select
                      value={ruleChannel}
                      onChange={(e) => setRuleChannel(e.target.value)}
                      className="w-full"
                    >
                      {channels.length === 0 ? (
                        <option value="">{t('auto_posting.no_channels')}</option>
                      ) : (
                        <>
                          <option value="">{t('publish_panel.select_channel_error')}</option>
                          {channels.map(channel => (
                            <option key={channel._id} value={channel._id}>
                              {channel.username}
                            </option>
                          ))}
                        </>
                      )}
                    </Select>
                  </div>
                </div>
                
                {/* Frequency Settings */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-md font-medium mb-3 flex items-center">
                    <Calendar size={18} className="mr-2" />
                    {t('auto_posting.publishing_schedule')}
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('auto_posting.frequency')}
                      </label>
                      <Select
                        value={ruleFrequency}
                        onChange={(e) => setRuleFrequency(e.target.value as Frequency)}
                        className="w-full"
                      >
                        <option value="daily">{t('auto_posting.frequency_daily')}</option>
                        <option value="weekly">{t('auto_posting.frequency_weekly')}</option>
                        <option value="custom">{t('auto_posting.frequency_custom')}</option>
                      </Select>
                    </div>
                    
                    {ruleFrequency === 'custom' && (
                      <div className="flex space-x-2">
                        <div className="w-1/3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('auto_posting.every')}
                          </label>
                          <Input
                            type="number"
                            min={1}
                            value={customInterval}
                            onChange={(e) => setCustomInterval(parseInt(e.target.value) || 1)}
                            className="w-full"
                          />
                        </div>
                        <div className="w-2/3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('auto_posting.time_unit')}
                          </label>
                          <Select
                            value={customTimeUnit}
                            onChange={(e) => setCustomTimeUnit(e.target.value as TimeUnit)}
                            className="w-full"
                          >
                            <option value="minutes">{t('auto_posting.minutes')}</option>
                            <option value="hours">{t('auto_posting.hours')}</option>
                            <option value="days">{t('auto_posting.days')}</option>
                          </Select>
                        </div>
                      </div>
                    )}
                    
                    {ruleFrequency !== 'custom' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('auto_posting.preferred_time')}
                        </label>
                        <Input
                          type="time"
                          value={preferredTime}
                          onChange={(e) => setPreferredTime(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    )}
                    
                    {ruleFrequency === 'weekly' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('auto_posting.preferred_days')}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {weekDays.map(day => (
                            <div key={day} className="flex items-center">
                              <input
                                type="checkbox"
                                id={day}
                                checked={preferredDays.includes(day)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setPreferredDays([...preferredDays, day]);
                                  } else {
                                    setPreferredDays(preferredDays.filter(d => d !== day));
                                  }
                                }}
                                className="mr-2"
                              />
                              <label htmlFor={day} className="text-sm capitalize">
                                {day}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Content Settings */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-md font-medium mb-3 flex items-center">
                    <Tag size={18} className="mr-2" />
                    {t('auto_posting.content_settings')}
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="generateImages"
                        checked={generateImages}
                        onChange={(e) => setGenerateImages(e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="generateImages" className="text-sm">
                        {t('auto_posting.generate_images')}
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <div className="flex items-center">
                          <Hash size={16} className="mr-1" />
                          {t('auto_posting.keywords')} (optional)
                        </div>
                      </label>
                      <TagInput
                        tags={keywords}
                        onChange={setKeywords}
                        placeholder={t('tag_input.placeholder') || "Add keyword..."}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {t('auto_posting.keywords_description') || "Keywords to focus on in generated content"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('auto_posting.source_urls') || "Source URLs"} (optional)
                      </label>
                      
                      {/* Existing source URLs list */}
                      {sourceUrls.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm font-medium mb-1">{t('auto_posting.existing_source_urls') || "Existing Source URLs"}</div>
                          <div className="space-y-2">
                            {sourceUrls.map((url, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                                <div className="flex-1">
                                  <div className="font-medium">{url}</div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSourceUrls = [...sourceUrls];
                                    newSourceUrls.splice(index, 1);
                                    setSourceUrls(newSourceUrls);
                                  }}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  {t('common.delete') || "Delete"}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Add new source URL form */}
                      <div className="mt-2">
                        <div className="text-sm font-medium mb-1">{t('auto_posting.add_source_url') || "Add Source URL"}</div>
                        
                        <div className="space-y-2">
                          <Input
                            value={newSourceUrl}
                            onChange={(e) => setNewSourceUrl(e.target.value)}
                            placeholder={t('auto_posting.source_url_placeholder') || "https://example.com"}
                            className="w-full"
                          />
                          
                          <Button
                            onClick={() => {
                              if (newSourceUrl.trim()) {
                                // Validate URL format
                                try {
                                  new URL(newSourceUrl.trim());
                                  setSourceUrls([...sourceUrls, newSourceUrl.trim()]);
                                  setNewSourceUrl('');
                                } catch {
                                  setNotification({
                                    type: 'error',
                                    message: t('auto_posting.source_url_validation') || 'Please enter a valid URL (e.g., https://example.com)'
                                  });
                                }
                              } else {
                                setNotification({
                                  type: 'error',
                                  message: t('auto_posting.source_url_validation') || 'Source URL is required'
                                });
                              }
                            }}
                            variant="outline"
                            className="w-full"
                          >
                            {t('auto_posting.add') || "Add"}
                          </Button>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-1">
                          {t('auto_posting.source_urls_description') || "Source URLs to scrape content from"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Buttons Settings */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-md font-medium mb-3 flex items-center">
                    <Tag size={18} className="mr-2" />
                    {t('auto_posting.buttons')}
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('auto_posting.buttons') || "Buttons"} (optional)
                      </label>
                      
                      {/* Existing buttons list */}
                      {buttons.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm font-medium mb-1">{t('auto_posting.existing_buttons') || "Existing Buttons"}</div>
                          <div className="space-y-2">
                            {buttons.map((button, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                                <div className="flex-1">
                                  <div className="font-medium">{button.text}</div>
                                  <div className="text-xs text-blue-600 truncate">{button.url}</div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newButtons = [...buttons];
                                    newButtons.splice(index, 1);
                                    setButtons(newButtons);
                                  }}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  {t('common.delete') || "Delete"}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Add new button form */}
                      <div className="mt-2">
                        <div className="text-sm font-medium mb-1">{t('auto_posting.add_button') || "Add Button"}</div>
                        
                        <div className="space-y-2">
                          <Input
                            value={buttonText}
                            onChange={(e) => setButtonText(e.target.value)}
                            placeholder={t('auto_posting.button_text') || "Button Text"}
                            className="w-full"
                          />
                          
                          <Input
                            value={buttonUrl}
                            onChange={(e) => setButtonUrl(e.target.value)}
                            placeholder={t('auto_posting.button_url') || "https://example.com"}
                            className="w-full"
                          />
                          
                          <Button
                            onClick={() => {
                              if (buttonText.trim() && buttonUrl.trim()) {
                                setButtons([...buttons, { text: buttonText, url: buttonUrl }]);
                                setButtonText('');
                                setButtonUrl('');
                              } else {
                                setNotification({
                                  type: 'error',
                                  message: t('auto_posting.button_validation') || 'Button text and URL are required'
                                });
                              }
                            }}
                            variant="outline"
                            className="w-full"
                          >
                            {t('auto_posting.add') || "Add"}
                          </Button>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-1">
                          {t('auto_posting.buttons_description') || "Buttons will be added to each auto-posted message"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Content Duplication Settings */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-md font-medium mb-3 flex items-center">
                    <Settings size={18} className="mr-2" />
                    {t('auto_posting.avoid_duplication')}
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="avoidDuplication"
                        checked={avoidDuplication}
                        onChange={(e) => setAvoidDuplication(e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="avoidDuplication" className="text-sm">
                        {t('auto_posting.avoid_duplication_description')}
                      </label>
                    </div>
                    
                    {avoidDuplication && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('auto_posting.duplicate_check_days')}
                        </label>
                        <Input
                          type="number"
                          min={1}
                          max={30}
                          value={duplicateCheckDays}
                          onChange={(e) => setDuplicateCheckDays(Math.max(1, Math.min(30, parseInt(e.target.value) || 7)))}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {t('auto_posting.duplicate_check_days_description')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setActiveSubTab('rules')}
                  >
                    {t('auto_posting.cancel')}
                  </Button>
                  <Button
                    onClick={handleSaveRule}
                  >
                    {selectedRule ? t('auto_posting.update_button') : t('auto_posting.create_button')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoPostingPanel; 