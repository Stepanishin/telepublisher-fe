import React, { useState, useEffect } from 'react';
import { Send, Calendar, Plus, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import MultiSelect from '../ui/MultiSelect';
import Alert from '../ui/Alert';
import { useChannelsStore } from '../../store/channelsStore';
import { usePollStore } from '../../store/pollStore';
import { useTabContentStore } from '../../store/tabContentStore';
import { useLanguage } from '../../contexts/LanguageContext';
import DateTimePicker from '../ui/DateTimePicker';

// Scheduled poll types
type ScheduleType = 'now' | 'later';

interface PollPublishPanelProps {
  onPollChange?: (poll: { question: string; options: { text: string }[]; isAnonymous: boolean; allowsMultipleAnswers: boolean }) => void;
}

const PollPublishPanel: React.FC<PollPublishPanelProps> = ({ onPollChange }) => {
  const { channels } = useChannelsStore();
  const { 
    poll,
    isPublishing, 
    publishResult, 
    error: pollError,
    setQuestion,
    addOption,
    removeOption,
    updateOption,
    setIsAnonymous,
    setAllowsMultipleAnswers,
    publishPoll: publishPollAction,
    resetPublishResult,
    setOptions
  } = usePollStore();
  const { t } = useLanguage();
  const { pollState, savePollState } = useTabContentStore();
  
  // Map of common Telegram error messages to translation keys
  const telegramErrorTranslations: Record<string, string> = {
    'chat not found': 'publish_panel.error_chat_not_found',
    'bot was kicked': 'publish_panel.error_bot_kicked',
    'not enough rights': 'publish_panel.error_not_enough_rights',
    'bot is not a member': 'publish_panel.error_bot_not_member',
    'bot can\'t': 'publish_panel.error_bot_cant',
    'forbidden': 'publish_panel.error_forbidden',
    'permission denied': 'publish_panel.error_permission_denied',
  };
  
  // Use stored values from tabContentStore as initial state
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>(pollState.selectedChannelIds || []);
  const [formError, setFormError] = useState('');
  
  // Schedule related states - restore from stored state
  const [scheduleType, setScheduleType] = useState<ScheduleType>(pollState.scheduleType || 'now');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(
    pollState.scheduledDate ? new Date(pollState.scheduledDate) : null
  );
  
  const [publishingProgress, setPublishingProgress] = useState<{
    total: number;
    current: number;
    success: string[];
    failed: string[];
  }>({ total: 0, current: 0, success: [], failed: [] });
  
  // Helper function to format messages with parameters
  const formatMessage = (key: string, params: Record<string, string>): string => {
    let message = t(key);
    
    // Replace each parameter in the message
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      message = message.replace(`{${paramKey}}`, paramValue);
    });
    
    return message;
  };
  
  // Notify parent component when poll changes
  useEffect(() => {
    if (onPollChange) {
      onPollChange(poll);
    }
  }, [poll, onPollChange]);
  
  // Reset alert after 5 seconds
  useEffect(() => {
    if (publishResult) {
      const timer = setTimeout(() => {
        resetPublishResult();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [publishResult, resetPublishResult]);
  
  // Initialize poll with stored values
  useEffect(() => {
    if (!pollState.question && !pollState.options.length) {
      // No stored data, use defaults
      return;
    }
    
    // Set the question
    if (pollState.question) {
      setQuestion(pollState.question);
    }
    
    // Set options directly instead of removing/adding one by one
    if (pollState.options && pollState.options.length >= 2) {
      setOptions(pollState.options);
    } else {
      setOptions([{ text: '' }, { text: '' }]);
    }
    
    setIsAnonymous(pollState.isAnonymous !== undefined ? pollState.isAnonymous : true);
    setAllowsMultipleAnswers(pollState.allowsMultipleAnswers || false);
  }, []);
  
  // Save poll state whenever it changes
  useEffect(() => {
    savePollState({
      question: poll.question,
      options: poll.options,
      isAnonymous: poll.isAnonymous,
      allowsMultipleAnswers: poll.allowsMultipleAnswers,
      selectedChannelIds,
      scheduleType,
      scheduledDate: scheduledDate ? scheduledDate.toISOString() : null
    });
  }, [
    poll.question,
    poll.options,
    poll.isAnonymous,
    poll.allowsMultipleAnswers,
    selectedChannelIds,
    scheduleType,
    scheduledDate,
    savePollState
  ]);
  
  const handleChannelChange = (selectedValues: string[]) => {
    setSelectedChannelIds(selectedValues);
    setFormError('');
  };
  
  const handleScheduleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setScheduleType(event.target.value as ScheduleType);
    
    // If switching back to "now", clear the scheduled date
    if (event.target.value === 'now') {
      setScheduledDate(null);
    } else if (!scheduledDate) {
      // Set default scheduled time to 1 hour from now
      const defaultDate = new Date();
      defaultDate.setHours(defaultDate.getHours() + 1);
      setScheduledDate(defaultDate);
    }
  };
  
  const handlePublish = async () => {
    // Validate form
    if (selectedChannelIds.length === 0) {
      setFormError(t('publish_panel.no_channel_error'));
      return;
    }
    
    if (!poll.question.trim()) {
      setFormError(t('poll_publish.question_required'));
      return;
    }
    
    // Check if there are at least 2 options with text
    const validOptions = poll.options.filter(option => option.text.trim());
    if (validOptions.length < 2) {
      setFormError(t('poll_publish.min_two_options'));
      return;
    }
    
    // Validate scheduled date if scheduling
    if (scheduleType === 'later') {
      if (!scheduledDate) {
        setFormError(t('publish_panel.no_schedule_date_error'));
        return;
      }
      
      const now = new Date();
      if (scheduledDate <= now) {
        setFormError(t('publish_panel.past_date_error'));
        return;
      }
    }
    
    try {
      // Start publishing to all selected channels
      setPublishingProgress({
        total: selectedChannelIds.length,
        current: 0,
        success: [],
        failed: []
      });
      
      // Process each channel sequentially
      for (let i = 0; i < selectedChannelIds.length; i++) {
        const channelId = selectedChannelIds[i];
        const channel = channels.find(ch => (ch._id === channelId || ch.id === channelId));
        
        if (!channel) continue;
        
        try {
          const result = await publishPollAction(
            channelId, 
            scheduleType === 'later' ? scheduledDate : null
          );
          
          if (result.success) {
            setPublishingProgress(prev => ({
              ...prev,
              current: prev.current + 1,
              success: [...prev.success, channel.title]
            }));
          } else {
            setPublishingProgress(prev => ({
              ...prev,
              current: prev.current + 1,
              failed: [...prev.failed, channel.title]
            }));
          }
        } catch {
          setPublishingProgress(prev => ({
            ...prev,
            current: prev.current + 1,
            failed: [...prev.failed, channel.title]
          }));
        }
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Error publishing poll');
    }
  };
  
  const handleOptionChange = (index: number, text: string) => {
    updateOption(index, text);
  };
  
  const handleAddOption = () => {
    if (poll.options.length < 10) { // Telegram limits polls to 10 options
      addOption('');
    }
  };

  const handleRemoveOption = (index: number) => {
    removeOption(index);
  };
  
  const handleClearFields = () => {
    // Clear poll question
    setQuestion('');
    
    // Reset options directly
    setOptions([{ text: '' }, { text: '' }]);
    
    // Reset poll settings
    setIsAnonymous(true); // Default to anonymous
    setAllowsMultipleAnswers(false); // Default to single answer
    
    // Reset channel selection
    setSelectedChannelIds([]);
    
    // Reset scheduling
    setScheduleType('now');
    setScheduledDate(null);
    
    // Clear errors
    setFormError('');
    
    // Reset publishing progress
    setPublishingProgress({ total: 0, current: 0, success: [], failed: [] });
    
    // Also clear stored state
    savePollState({
      question: '',
      options: [{ text: '' }, { text: '' }],
      isAnonymous: true,
      allowsMultipleAnswers: false,
      selectedChannelIds: [],
      scheduleType: 'now',
      scheduledDate: null
    });
  };
  
  const renderPublishingSummary = () => {
    const { total, current, success, failed } = publishingProgress;
    
    if (current === 0 || total === 0) return null;
    
    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">{t('publish_panel.publishing_progress')}</h3>
        <div className="text-xs text-gray-600 space-y-1">
          {success.length > 0 && (
            <div>
              <span className="font-medium text-green-600">{t('publish_panel.published_success')}:</span> {success.join(', ')}
            </div>
          )}
          {failed.length > 0 && (
            <div>
              <span className="font-medium text-red-600">{t('publish_panel.published_failed')}:</span> {failed.join(', ')}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Convert error message using translation map
  const getTranslatedErrorMessage = (message: string): string => {
    for (const [key, value] of Object.entries(telegramErrorTranslations)) {
      if (message.toLowerCase().includes(key.toLowerCase())) {
        return t(value);
      }
    }
    return message;
  };
  
  // Get publish result message
  const getPublishResultMessage = (): string => {
    if (!publishResult) return '';
    
    const message = publishResult.message;
    
    // Check if it's a scheduled success message (format: scheduled_success:channelName:date)
    if (message.startsWith('scheduled_success:')) {
      const parts = message.split(':');
      if (parts.length >= 3) {
        const channelName = parts[1];
        const dateStr = parts.slice(2).join(':'); // In case the date itself contains colons
        return formatMessage('publish_panel.success_scheduled', { 
          channel: channelName,
          date: dateStr
        });
      }
    }
    
    // Check if it's a publish success message (format: publish_success:channelName)
    if (message.startsWith('publish_success:')) {
      const channelName = message.substring('publish_success:'.length);
      return formatMessage('publish_panel.publish_success', { channel: channelName });
    }
    
    // Otherwise try to translate known error messages
    return getTranslatedErrorMessage(message);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('poll_publish.title') || 'Create Poll'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Channel Selection */}
        <div>
          <MultiSelect
            options={channels.map(channel => ({
              label: channel.title,
              value: channel._id || channel.id,
            }))}
            label={t('publish_panel.select_channels')}
            value={selectedChannelIds}
            onChange={handleChannelChange}
            placeholder={t('publish_panel.select_channels')}
            isRequired={true}
          />
        </div>
        
        {/* Poll Question */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('poll_publish.question_label') || 'Poll Question'}
          </label>
          <TextArea
            value={poll.question}
            onChange={e => setQuestion(e.target.value)}
            placeholder={t('poll_publish.question_placeholder') || 'Enter your poll question'}
            rows={2}
          />
        </div>
        
        {/* Poll Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('poll_publish.options_label') || 'Poll Options'}
          </label>
          <div className="space-y-2">
            {poll.options.map((option, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  value={option.text}
                  onChange={e => handleOptionChange(index, e.target.value)}
                  placeholder={`${t('poll_publish.option_placeholder') || 'Option'} ${index + 1}`}
                  className="flex-1"
                />
                {poll.options.length > 2 && (
                  <Button
                    onClick={() => handleRemoveOption(index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          {poll.options.length < 10 && (
            <Button
              onClick={handleAddOption}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('poll_publish.add_option') || 'Add Option'}
            </Button>
          )}
          
          <p className="text-xs text-gray-500 mt-1">
            {t('poll_publish.options_help') || 'Minimum 2, maximum 10 options'}
          </p>
        </div>
        
        {/* Poll Settings */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            {t('poll_publish.settings_label') || 'Poll Settings'}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                checked={poll.isAnonymous}
                onChange={e => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                {t('poll_publish.anonymous_label') || 'Anonymous voting'}
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="multiple"
                checked={poll.allowsMultipleAnswers}
                onChange={e => setAllowsMultipleAnswers(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="multiple" className="ml-2 block text-sm text-gray-700">
                {t('poll_publish.multiple_label') || 'Allow multiple answers'}
              </label>
            </div>
          </div>
        </div>
        
        {/* Scheduling Options */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('publish_panel.schedule_label')}
          </label>
          <div className="flex flex-col sm:flex-col sm:items-start gap-4">
            <select
              value={scheduleType}
              onChange={handleScheduleTypeChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="now">{t('publish_panel.publish_now')}</option>
              <option value="later">{t('publish_panel.schedule_for_later')}</option>
            </select>
            
            {scheduleType === 'later' && (
              <div className="flex-grow w-full">
                <DateTimePicker
                  value={scheduledDate}
                  onChange={setScheduledDate}
                  minDate={new Date()}
                  placeholder={t('publish_panel.select_date_time')}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Error and result alerts */}
        {formError && (
          <Alert 
            variant="error"
            message={formError}
          />
        )}
        
        {pollError && !formError && (
          <Alert 
            variant="error"
            message={getTranslatedErrorMessage(pollError)}
          />
        )}
        
        {publishResult && (
          <Alert 
            variant={publishResult.success ? "success" : "error"}
            message={getPublishResultMessage()}
          />
        )}
        
        {renderPublishingSummary()}
      </CardContent>
      
      <CardFooter className="flex justify-between gap-4">
        <Button 
          variant="outline"
          onClick={handleClearFields}
          leftIcon={<RefreshCw size={16} />}
          className="flex-none"
        >
          {t('publish_panel.clear_fields')}
        </Button>
        <Button 
          className="flex-grow"
          onClick={handlePublish}
          isLoading={isPublishing}
          leftIcon={scheduleType === 'later' ? <Calendar className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          disabled={isPublishing || selectedChannelIds.length === 0 || !poll.question.trim() || poll.options.length < 2}
        >
          {scheduleType === 'now' ? (
            selectedChannelIds.length > 1 
              ? formatMessage('publish_panel.publish_to_multiple', { count: selectedChannelIds.length.toString() }) 
              : t('publish_panel.publish_button')
          ) : (
            selectedChannelIds.length > 1
              ? formatMessage('publish_panel.schedule_to_multiple', { count: selectedChannelIds.length.toString() })
              : t('publish_panel.schedule_button')
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PollPublishPanel; 