import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import TextArea from '../ui/TextArea';
import MultiSelect from '../ui/MultiSelect';
import TagInput from '../ui/TagInput';
import Alert from '../ui/Alert';
import TelegramPostPreview from '../ui/TelegramPostPreview';
import ImageUploader from '../ui/ImageUploader';
import { useChannelsStore } from '../../store/channelsStore';
import { useContentStore } from '../../store/contentStore';
import { useLanguage } from '../../contexts/LanguageContext';
import DateTimePicker from '../ui/DateTimePicker';

// Scheduled post types
type ScheduleType = 'now' | 'later';

const PublishPanel: React.FC = () => {
  const { channels } = useChannelsStore();
  const { 
    content, 
    isPublishing, 
    publishResult, 
    error, 
    publish, 
    resetPublishResult
  } = useContentStore();
  const { t } = useLanguage();
  
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [publishText, setPublishText] = useState('');
  const [publishImageUrl, setPublishImageUrl] = useState('');
  const [publishTags, setPublishTags] = useState<string[]>([]);
  const [formError, setFormError] = useState('');
  const [uploadError, setUploadError] = useState('');
  
  // Schedule related states
  const [scheduleType, setScheduleType] = useState<ScheduleType>('now');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  
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
  
  // Update form values when content changes
  useEffect(() => {
    setPublishText(content.text);
    setPublishImageUrl(content.imageUrl);
    setPublishTags(content.tags);
  }, [content]);
  
  // Reset alert after 5 seconds
  useEffect(() => {
    if (publishResult) {
      const timer = setTimeout(() => {
        resetPublishResult();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [publishResult, resetPublishResult]);
  
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
    
    if (!publishText && !publishImageUrl) {
      setFormError(t('publish_panel.no_content_error'));
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
        setFormError(t('publish_panel.schedule_in_past_error'));
        return;
      }
    }

    // Initialize publishing progress
    setPublishingProgress({
      total: selectedChannelIds.length,
      current: 0,
      success: [],
      failed: []
    });

    // Publish to each selected channel sequentially
    for (let i = 0; i < selectedChannelIds.length; i++) {
      const channelId = selectedChannelIds[i];
      const channelName = channels.find(c => (c.id === channelId || c._id === channelId))?.title || channelId;
      
      try {
        // Update progress
        setPublishingProgress(prev => ({
          ...prev,
          current: i + 1
        }));

        // Publish to this channel
        const result = await publish({
          channelId,
          text: publishText,
          imageUrl: publishImageUrl,
          tags: publishTags,
          scheduledDate: scheduleType === 'later' ? scheduledDate : null
        });

        // Update success/fail lists based on result
        if (result.success) {
          setPublishingProgress(prev => ({
            ...prev,
            success: [...prev.success, channelName]
          }));
        } else {
          setPublishingProgress(prev => ({
            ...prev,
            failed: [...prev.failed, channelName]
          }));
        }

        // Small delay between requests to avoid rate limiting
        if (i < selectedChannelIds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (pubError) {
        // Handle error - add to failed list
        console.error('Error publishing to channel:', pubError);
        setPublishingProgress(prev => ({
          ...prev,
          failed: [...prev.failed, channelName]
        }));
      }
    }
  };
  
  // Create properly formatted channel options
  const channelOptions = channels.map(channel => {
    // Handle both _id and id formats
    const channelId = channel._id || channel.id;
    return {
      value: channelId,
      label: `${channel.title} (${channel.username})`
    };
  });  

  // Generate a summary of the publishing process
  const renderPublishingSummary = () => {
    const { total, current, success, failed } = publishingProgress;
    
    if (total === 0) return null;
    
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-700">
            {t('publish_panel.publishing_progress')}
          </h4>
          <span className="text-xs text-gray-500">
            {current}/{total} {t('publish_panel.channels')}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${(current / total) * 100}%` }}
          ></div>
        </div>
        
        {/* Success channels */}
        {success.length > 0 && (
          <div className="mb-2">
            <h5 className="text-xs font-medium text-green-700 flex items-center mb-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              {t('publish_panel.success_publish')}
            </h5>
            <ul className="text-xs text-gray-700 ml-4">
              {success.map((name, idx) => (
                <li key={`success-${idx}`}>{name}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Failed channels */}
        {failed.length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-red-700 flex items-center mb-1">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {t('publish_panel.failed_publish')}
            </h5>
            <ul className="text-xs text-gray-700 ml-4">
              {failed.map((name, idx) => (
                <li key={`failed-${idx}`}>{name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('publish_panel.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {publishResult && (
          <Alert
            variant={publishResult.success ? 'success' : 'error'}
            message={publishResult.message}
            onClose={resetPublishResult}
          />
        )}
        
        {error && (
          <Alert
            variant="error"
            message={error}
          />
        )}
        
        {formError && (
          <Alert
            variant="warning"
            message={formError}
            onClose={() => setFormError('')}
          />
        )}

        {/* Publishing progress summary */}
        {renderPublishingSummary()}
        
        <MultiSelect
          label={t('publish_panel.select_channels')}
          options={channelOptions}
          value={selectedChannelIds}
          onChange={handleChannelChange}
          error={formError && selectedChannelIds.length === 0 ? t('publish_panel.select_channel_error') : ''}
          placeholder={t('publish_panel.select_channels')}
        />
        
        <TextArea
          label={t('publish_panel.text_label')}
          placeholder={t('publish_panel.text_placeholder')}
          value={publishText}
          onChange={(e) => setPublishText(e.target.value)}
          rows={4}
        />
        
        {uploadError && (
          <Alert
            variant="error"
            message={uploadError}
            onClose={() => setUploadError('')}
          />
        )}
        
        <ImageUploader
          value={publishImageUrl}
          onChange={setPublishImageUrl}
          onError={setUploadError}
        />
        
        <TagInput
          label={t('publish_panel.tags')}
          tags={publishTags}
          onChange={setPublishTags}
        />
        
        {/* Scheduling options */}
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
        
        {/* Show preview only if there's content */}
        {(publishText || publishImageUrl || publishTags.length > 0) && (
          <TelegramPostPreview
            text={publishText}
            imageUrl={publishImageUrl}
            tags={publishTags}
          />
        )}
      </CardContent>
      <CardFooter>
        <Button 
          fullWidth
          onClick={handlePublish}
          isLoading={isPublishing}
          disabled={isPublishing || (!publishText && !publishImageUrl) || selectedChannelIds.length === 0 || (scheduleType === 'later' && !scheduledDate)}
          leftIcon={scheduleType === 'now' ? <Send size={16} /> : <Calendar size={16} />}
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

export default PublishPanel;