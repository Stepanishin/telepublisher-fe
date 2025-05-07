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
  
  // Map of common Telegram error messages to translation keys
  const telegramErrorTranslations: Record<string, string> = {
    'message is too long': 'publish_panel.message_too_long',
    'chat not found': 'publish_panel.error_chat_not_found',
    'bot was kicked': 'publish_panel.error_bot_kicked',
    'not enough rights': 'publish_panel.error_not_enough_rights',
    'bot is not a member': 'publish_panel.error_bot_not_member',
    'bot can\'t': 'publish_panel.error_bot_cant',
    'forbidden': 'publish_panel.error_forbidden',
    'permission denied': 'publish_panel.error_permission_denied',
    'message caption is too long': 'publish_panel.error_caption_too_long',
    'caption is too long': 'publish_panel.error_caption_too_long'
  };
  
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [publishText, setPublishText] = useState('');
  const [publishImageUrl, setPublishImageUrl] = useState('');
  const [publishTags, setPublishTags] = useState<string[]>([]);
  const [formError, setFormError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [showLengthWarning, setShowLengthWarning] = useState(true);
  
  // Schedule related states
  const [scheduleType, setScheduleType] = useState<ScheduleType>('now');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  
  const [publishingProgress, setPublishingProgress] = useState<{
    total: number;
    current: number;
    success: string[];
    failed: string[];
  }>({ total: 0, current: 0, success: [], failed: [] });
  
  // Calculate total message length including tags
  const getTotalMessageLength = (): number => {
    let totalLength = publishText.length;
    
    // Add space for tags if they exist
    if (publishTags.length > 0) {
      // Two newlines and a space between tags
      totalLength += 2; // For "\n\n"
      
      // Add length of each tag
      publishTags.forEach((tag, index) => {
        totalLength += tag.length;
        // Add space between tags
        if (index < publishTags.length - 1) {
          totalLength += 1;
        }
      });
    }
    
    return totalLength;
  };
  
  // Get message length limits
  const getMessageLengthLimits = () => {
    if (publishImageUrl) {
      return {
        warningThreshold: 900,
        errorThreshold: 1024,
        maxLimit: 1024,
        warningMessage: 'publish_panel.approaching_caption_limit',
        errorMessage: 'publish_panel.error_caption_too_long',
        limitLabel: 'publish_panel.caption_limit'
      };
    } else {
      return {
        warningThreshold: 3800,
        errorThreshold: 4096,
        maxLimit: 4096,
        warningMessage: 'publish_panel.approaching_limit',
        errorMessage: 'publish_panel.message_too_long',
        limitLabel: 'publish_panel.message_limit'
      };
    }
  };
  
  // Message character counter component
  const MessageLengthCounter = () => {
    const totalLength = getTotalMessageLength();
    const { warningThreshold, errorThreshold, maxLimit, limitLabel } = getMessageLengthLimits();
    
    let colorClass = 'bg-green-500';
    let textColorClass = 'text-gray-500';
    
    if (totalLength > errorThreshold) {
      colorClass = 'bg-red-500';
      textColorClass = 'text-red-500 font-medium';
    } else if (totalLength > warningThreshold) {
      colorClass = 'bg-yellow-500';
      textColorClass = 'text-yellow-600';
    }
    
    const percentFilled = Math.min((totalLength / maxLimit) * 100, 100);
    
    return (
      <div className="mb-6 mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600">
            {t(limitLabel)}: {maxLimit} {t('publish_panel.characters')}
            {publishTags.length > 0 && ` (${t('publish_panel.including_tags')})`}
          </span>
          <span className={textColorClass}>
            {totalLength} / {maxLimit}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${colorClass}`} 
            style={{ width: `${percentFilled}%` }}
          ></div>
        </div>
      </div>
    );
  };
  
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
  
  // Reset length warning when text length changes significantly
  useEffect(() => {
    if (publishText.length <= 3800) {
      setShowLengthWarning(true); // Reset when back under threshold
    }
  }, [publishText]);
  
  const handleChannelChange = (selectedValues: string[]) => {
    setSelectedChannelIds(selectedValues);
    setFormError('');
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setPublishText(newText);
    
    // Clear errors when text is okay
    if (newText.length <= 4096 && formError === t('publish_panel.message_too_long')) {
      setFormError('');
    }
    
    // Set error when text is too long
    if (newText.length > 4096 && formError !== t('publish_panel.message_too_long')) {
      setFormError(t('publish_panel.message_too_long'));
    }
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
          // Add translation support for success messages
          // Check for special formatted success messages
          if (result.message && result.message.startsWith('scheduled_success:')) {
            // Parse the scheduled message format
            const parts = result.message.split(':');
            if (parts.length >= 3) {
              const channelTitle = parts[1];
              const scheduledDate = parts.slice(2).join(':'); // Rejoin in case the date contains colons
              
              
              // Format with translation
              result.message = formatMessage('publish_panel.success_scheduled', {
                channel: channelTitle,
                date: scheduledDate
              });
            }
          } else if (result.message && result.message.startsWith('publish_success:')) {
            // Parse the publish message format
            const parts = result.message.split(':');
            if (parts.length >= 2) {
              const channelTitle = parts[1];
              
              
              // Format with translation
              result.message = formatMessage('publish_panel.success_published', {
                channel: channelTitle
              });
            }
          } else if (result.message && result.message.includes('успешно') && result.message.includes('опубликовано')) {
            // Fallback for old format success messages in Russian
            result.message = formatMessage('publish_panel.success_published', {
              channel: channelName
            });
          } else if (result.message && result.message.includes('successfully') && result.message.includes('published')) {
            // Fallback for old format success messages in English
            result.message = formatMessage('publish_panel.success_published', {
              channel: channelName
            });
          }
          
          setPublishingProgress(prev => ({
            ...prev,
            success: [...prev.success, channelName]
          }));
        } else {
          // Check for special error codes
          if (result.message === 'channel_not_found') {
            setFormError(t('publish_panel.error_channel_not_found'));
          } else if (result.message === 'error_scheduling') {
            setFormError(t('publish_panel.error_scheduling'));
          } else if (result.message === 'error_publishing') {
            setFormError(t('alert.error_title'));
          }
          // Check for message too long error
          else if (result.message && (
            result.message.includes("Bad Request: message is too long") || 
            result.message.includes("message is too long") ||
            result.message.toLowerCase().includes("too long")
          )) {
            setFormError(t('publish_panel.message_too_long'));
          } else if (result.message) {
            // For other Telegram API errors, attempt to find translation
            const errorLowerCase = result.message.toLowerCase();
            
            // Check for common error patterns from Telegram API
            let translatedError = '';
            
            // Check against our dictionary of known errors
            for (const [errorKey, translationKey] of Object.entries(telegramErrorTranslations)) {
              if (errorLowerCase.includes(errorKey)) {
                translatedError = t(translationKey);
                break;
              }
            }
            
            // If translation found, use it; otherwise show generic error with original message
            if (translatedError) {
              setFormError(translatedError);
            } else {
              // Format generic error message with Telegram's description
              const genericMessage = result.message.startsWith('Bad Request:') 
                ? result.message.replace('Bad Request:', '').trim()
                : result.message;
                
              setFormError(`${t('alert.error_title')} ${genericMessage}`);
            }
          }
          
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
        
        {/* Character counter with dynamic limits based on content type */}
        <MessageLengthCounter />
        
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
          onChange={handleTextChange}
          rows={12}
        />
        
        {/* Show warning when approaching character limit */}
        {publishText.length > 3800 && showLengthWarning && (
          <Alert
            variant="warning"
            message={publishText.length > 4096 
              ? t('publish_panel.message_too_long') 
              : formatMessage('publish_panel.approaching_limit', { 
                  remaining: (4096 - publishText.length).toString() 
                })
            }
            onClose={() => setShowLengthWarning(false)}
          />
        )}
        
        {/* Show warning when approaching caption limit with image */}
        {publishImageUrl && publishText.length > 900 && publishText.length <= 1024 && showLengthWarning && (
          <Alert
            variant="warning"
            message={formatMessage('publish_panel.approaching_caption_limit', { 
              remaining: (1024 - publishText.length).toString() 
            })}
            onClose={() => setShowLengthWarning(false)}
          />
        )}
        
        {/* Show error when exceeding caption limit with image */}
        {publishImageUrl && publishText.length > 1024 && (
          <Alert
            variant="error"
            message={t('publish_panel.error_caption_too_long')}
            onClose={() => {}}
          />
        )}
        
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
          disabled={!!(isPublishing || 
            (!publishText && !publishImageUrl) || 
            selectedChannelIds.length === 0 || 
            (scheduleType === 'later' && !scheduledDate) ||
            (publishText.length > 4096) ||
            (publishImageUrl && publishText.length > 1024))}
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