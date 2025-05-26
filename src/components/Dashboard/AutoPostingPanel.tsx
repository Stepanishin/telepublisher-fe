/**
 * @fileoverview
 * @suppress {checkTypes}
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { PlusCircle, Clock, Settings, AlertTriangle, Calendar, Tag, Hash } from 'lucide-react';
import Button from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import Select from '../ui/Select';
import { useChannelsStore } from '../../store/channelsStore';
import Input from '../ui/Input';
import TagInput from '../ui/TagInput';
import { useNotification } from '../../contexts/NotificationContext';
import { createAutoPostingRule, deleteAutoPostingRule, getAutoPostingRules, updateAutoPostingRule } from '../../services/api';

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
  nextScheduled?: Date | null;
  lastPublished?: Date | null;
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
  
  // Fetch rules on component mount
  useEffect(() => {
    fetchRules();
  }, []);
  
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
    
    const ruleData: AutoPostingRule = {
      name: ruleName,
      topic: ruleTopic,
      status: ruleStatus,
      frequency: ruleFrequency,
      customInterval: customInterval,
      customTimeUnit: customTimeUnit,
      preferredTime: preferredTime,
      preferredDays: preferredDays,
      channelId: channelMongoId, // Use the MongoDB ObjectId here
      imageGeneration: generateImages,
      keywords: keywords
    };
    
    try {
      if (selectedRule && selectedRule._id) {
        // Update existing rule
        await updateAutoPostingRule(selectedRule._id, ruleData);
        setNotification({
          type: 'success',
          message: 'Auto-posting rule updated successfully'
        });
      } else {
        // Create new rule
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
          <button
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
          </button>
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
            <div className="flex items-center space-x-2 bg-yellow-50 border border-yellow-100 p-4 rounded-md text-yellow-800">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{t('auto_posting.coming_soon')}</span>
            </div>
            <div className="mt-4 text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
              <Clock className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                {t('auto_posting.no_logs')}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('auto_posting.logs_description')}
              </p>
            </div>
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