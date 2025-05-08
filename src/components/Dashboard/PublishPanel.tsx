import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle, AlertTriangle, Calendar, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import TextArea from '../ui/TextArea';
import MultiSelect from '../ui/MultiSelect';
import TagInput from '../ui/TagInput';
import Alert from '../ui/Alert';
import ImageUploader from '../ui/ImageUploader';
import MultipleImageUploader from '../ui/MultipleImageUploader';
import { useChannelsStore } from '../../store/channelsStore';
import { useContentStore } from '../../store/contentStore';
import { useTabContentStore } from '../../store/tabContentStore';
import { useLanguage } from '../../contexts/LanguageContext';
import DateTimePicker from '../ui/DateTimePicker';

// Scheduled post types
type ScheduleType = 'now' | 'later';

// Define the props for the component
interface PublishPanelProps {
  onContentChange?: (content: { text: string; imageUrl: string; imageUrls: string[]; tags: string[] }) => void;
  editMode?: boolean;
  scheduledPostId?: string;
  initialChannelId?: string;
  initialScheduledDate?: Date;
}

const PublishPanel: React.FC<PublishPanelProps> = ({ onContentChange, editMode, scheduledPostId, initialChannelId, initialScheduledDate }) => {
  const { channels } = useChannelsStore();
  const { 
    content, 
    isPublishing, 
    publishResult, 
    error, 
    publish, 
    resetPublishResult,
    updateScheduledPost,
    setPublishResult,
    setContent
  } = useContentStore();
  const { t } = useLanguage();
  const { postState, savePostState } = useTabContentStore();
  
  // Ref to track if we've loaded from saved state
  const hasInitializedFromSavedState = useRef(false);
  
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
  
  // Use stored values from tabContentStore as initial state or default to empty values
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>(
    editMode && initialChannelId ? [initialChannelId] : postState.selectedChannelIds || []
  );
  const [publishText, setPublishText] = useState(postState.text || '');
  const [publishImageUrl, setPublishImageUrl] = useState(postState.imageUrl || '');
  const [publishImageUrls, setPublishImageUrls] = useState<string[]>(postState.imageUrls || []);
  const [useMultipleImages, setUseMultipleImages] = useState(postState.useMultipleImages || false);
  const [publishTags, setPublishTags] = useState<string[]>(postState.tags || []);
  const [formError, setFormError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [showLengthWarning, setShowLengthWarning] = useState(true);
  
  // Schedule related states
  const [scheduleType, setScheduleType] = useState<ScheduleType>(postState.scheduleType || 'now');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(
    editMode && initialScheduledDate 
      ? initialScheduledDate 
      : (postState.scheduledDate ? new Date(postState.scheduledDate) : null)
  );
  
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
    if (publishImageUrl || publishImageUrls.length > 0) {
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
  
  // Update form values when content changes from content store
  useEffect(() => {
    // Skip if not initialized from saved state yet and not in edit mode
    if (!hasInitializedFromSavedState.current && !editMode) {
      // Mark as initialized to allow updates to flow through on first render
      hasInitializedFromSavedState.current = true;
      return; // Exit early to avoid updates during initialization
    }
    
    // Use JSON.stringify for deep comparison of arrays
    const hasContentChanges = 
      content.text !== publishText ||
      content.imageUrl !== publishImageUrl ||
      JSON.stringify(content.imageUrls) !== JSON.stringify(publishImageUrls) ||
      JSON.stringify(content.tags) !== JSON.stringify(publishTags);
      
    // Only proceed if there are actual changes to avoid update loops
    if (!hasContentChanges) return;
    
    // Use a batch update approach to avoid multiple renders
    const updates: Array<() => void> = [];
    
    if (content.text !== publishText) {
      updates.push(() => setPublishText(content.text));
    }
    
    if (content.imageUrl !== publishImageUrl) {
      updates.push(() => setPublishImageUrl(content.imageUrl));
    }
    
    if (JSON.stringify(content.imageUrls) !== JSON.stringify(publishImageUrls)) {
      updates.push(() => setPublishImageUrls(content.imageUrls || []));
    }
    
    if (JSON.stringify(content.tags) !== JSON.stringify(publishTags)) {
      updates.push(() => setPublishTags(content.tags));
    }
    
    // Enable multiple image mode if needed
    if (content.imageUrls && content.imageUrls.length > 0 && !useMultipleImages) {
      updates.push(() => setUseMultipleImages(true));
    }
    
    // Execute state updates in sequence
    updates.forEach(update => update());
  }, [content]); // Only depend on content to avoid circular dependencies
  
  // Initialize from saved state on first mount
  useEffect(() => {
    // Only apply saved state if not in edit mode and we have valid saved state
    if (!editMode && !hasInitializedFromSavedState.current && 
        (postState.text || postState.imageUrl || postState.imageUrls.length > 0 || postState.tags.length > 0)) {
      setPublishText(postState.text || '');
      setPublishImageUrl(postState.imageUrl || '');
      setPublishImageUrls(postState.imageUrls || []);
      setPublishTags(postState.tags || []);
      setUseMultipleImages(postState.useMultipleImages || false);
      setSelectedChannelIds(postState.selectedChannelIds || []);
      setScheduleType(postState.scheduleType || 'now');
      
      if (postState.scheduledDate) {
        setScheduledDate(new Date(postState.scheduledDate));
      }
      
      // Mark as initialized
      hasInitializedFromSavedState.current = true;
    }
  }, [editMode, postState]);
  
  // Set initial channel and scheduled date for edit mode
  useEffect(() => {
    if (editMode && initialChannelId) {
      setSelectedChannelIds([initialChannelId]);
    }
    
    if (editMode && initialScheduledDate) {
      setScheduleType('later');
      setScheduledDate(initialScheduledDate);
    }
  }, [editMode, initialChannelId, initialScheduledDate]);
  
  // Notify parent component when content changes
  useEffect(() => {
    if (onContentChange) {
      onContentChange({
        text: publishText,
        imageUrl: publishImageUrl,
        imageUrls: publishImageUrls,
        tags: publishTags
      });
    }
  }, [publishText, publishImageUrl, publishImageUrls, publishTags, onContentChange]);
  
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
  
  // Sync local values to content store
  useEffect(() => {
    // Only update content store if we've fully initialized
    if (!hasInitializedFromSavedState.current && !editMode) return;
    
    // Prevent potential loop by checking if values are actually different
    if (content.text !== publishText ||
        content.imageUrl !== publishImageUrl ||
        JSON.stringify(content.imageUrls) !== JSON.stringify(publishImageUrls) ||
        JSON.stringify(content.tags) !== JSON.stringify(publishTags)) {
      
      setContent({
        text: publishText,
        imageUrl: publishImageUrl,
        imageUrls: publishImageUrls,
        tags: publishTags
      });
    }
  }, [publishText, publishImageUrl, publishImageUrls, publishTags, editMode]);
  
  // Use a separate effect to handle saving to persistent storage 
  // to avoid creating a cyclical dependency
  const saveToLocalStorage = useRef(() => {
    if (editMode) return;
    
    savePostState({
      text: publishText,
      imageUrl: publishImageUrl,
      imageUrls: publishImageUrls,
      tags: publishTags,
      selectedChannelIds,
      scheduleType,
      scheduledDate: scheduledDate ? scheduledDate.toISOString() : null,
      useMultipleImages
    });
  });
  
  // Update ref with latest values
  useEffect(() => {
    saveToLocalStorage.current = () => {
      if (editMode) return;
      
      savePostState({
        text: publishText,
        imageUrl: publishImageUrl,
        imageUrls: publishImageUrls,
        tags: publishTags,
        selectedChannelIds,
        scheduleType,
        scheduledDate: scheduledDate ? scheduledDate.toISOString() : null,
        useMultipleImages
      });
    };
  }, [
    publishText,
    publishImageUrl,
    publishImageUrls,
    publishTags,
    selectedChannelIds,
    scheduleType,
    scheduledDate,
    useMultipleImages,
    editMode,
    savePostState
  ]);
  
  // Use debounce to avoid saving on every keystroke
  useEffect(() => {
    // Skip first run
    if (!hasInitializedFromSavedState.current) return;
    
    const timeoutId = setTimeout(() => {
      saveToLocalStorage.current();
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [
    publishText,
    publishImageUrl,
    publishImageUrls,
    publishTags,
    selectedChannelIds,
    scheduleType,
    scheduledDate,
    useMultipleImages
  ]);
  
  const handleChannelChange = (selectedValues: string[]) => {
    setSelectedChannelIds(selectedValues);
    setFormError('');
  };
  
  const handleClearFields = () => {
    // Clear text
    setPublishText('');
    
    // Clear images
    setPublishImageUrl('');
    setPublishImageUrls([]);
    setUseMultipleImages(false);
    
    // Clear tags
    setPublishTags([]);
    
    // Reset channel selection if not in edit mode
    if (!editMode) {
      setSelectedChannelIds([]);
    }
    
    // Reset schedule
    if (!editMode || !initialScheduledDate) {
      setScheduleType('now');
      setScheduledDate(null);
    }
    
    // Clear errors
    setFormError('');
    setUploadError('');
    
    // Reset warnings
    setShowLengthWarning(true);
    
    // Reset publishing progress
    setPublishingProgress({ total: 0, current: 0, success: [], failed: [] });
    
    // Also clear stored state in tabContentStore (only if not in edit mode)
    if (!editMode) {
      savePostState({
        text: '',
        imageUrl: '',
        imageUrls: [],
        tags: [],
        selectedChannelIds: [],
        scheduleType: 'now',
        scheduledDate: null,
        useMultipleImages: false
      });
    }
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
  
  const toggleImageMode = () => {
    setUseMultipleImages(!useMultipleImages);
    
    // When switching to single image mode, use the first image from multiple images if available
    if (useMultipleImages && publishImageUrls.length > 0) {
      setPublishImageUrl(publishImageUrls[0]);
    }
    
    // When switching to multiple images mode, add the current single image if available
    if (!useMultipleImages && publishImageUrl) {
      setPublishImageUrls([publishImageUrl]);
    }
  };
  
  const handlePublish = async () => {
    // Validate form
    if (selectedChannelIds.length === 0) {
      setFormError(t('publish_panel.no_channel_error'));
      return;
    }
    
    if (!publishText && !publishImageUrl && publishImageUrls.length === 0) {
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

    // If in edit mode and we have a scheduledPostId, update the post instead of creating a new one
    if (editMode && scheduledPostId) {
      try {
        const result = await updateScheduledPost(scheduledPostId, {
          channelId: selectedChannelIds[0],
          text: publishText,
          imageUrl: useMultipleImages ? '' : publishImageUrl,
          imageUrls: useMultipleImages ? publishImageUrls : [],
          tags: publishTags,
          scheduledDate: scheduledDate
        });

        if (result.success) {
          resetPublishResult();
          // Show success message
          setPublishResult({
            success: true,
            message: t('publish_panel.update_success')
          });
        } else {
          setFormError(result.message || t('publish_panel.error_updating'));
        }
        
        return;
      } catch (error) {
        console.error('Error updating scheduled post:', error);
        setFormError(t('publish_panel.error_updating'));
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
          imageUrl: useMultipleImages ? '' : publishImageUrl,
          imageUrls: useMultipleImages ? publishImageUrls : [],
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
            
            // Check against our dictionary of known errors
            let translatedError = '';
            
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
          isRequired={true}
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
        {(publishImageUrl || publishImageUrls.length > 0) && publishText.length > 900 && publishText.length <= 1024 && showLengthWarning && (
          <Alert
            variant="warning"
            message={formatMessage('publish_panel.approaching_caption_limit', { 
              remaining: (1024 - publishText.length).toString() 
            })}
            onClose={() => setShowLengthWarning(false)}
          />
        )}
        
        {/* Show error when exceeding caption limit with image */}
        {(publishImageUrl || publishImageUrls.length > 0) && publishText.length > 1024 && (
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
        
        {/* Toggle between single and multiple image modes */}
        <div className="mb-4">
          <div className="flex items-center justify-end mb-2">
            <label className="text-sm text-gray-600 mr-2 flex items-center">
              <ImageIcon size={16} className="mr-1" />
              {t('publish_panel.multiple_images') || 'Multiple Images'}
            </label>
            <div 
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer ${
                useMultipleImages ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              onClick={toggleImageMode}
            >
              <div 
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  useMultipleImages ? 'translate-x-5' : 'translate-x-0'
                }`} 
              />
            </div>
          </div>
          
          {!useMultipleImages ? (
            <ImageUploader
              value={publishImageUrl}
              onChange={setPublishImageUrl}
              onError={setUploadError}
            />
          ) : (
            <MultipleImageUploader
              values={publishImageUrls}
              onChange={setPublishImageUrls}
              onError={setUploadError}
              maxImages={10}
            />
          )}
        </div>
        
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
          disabled={!!(isPublishing || 
            (!publishText && !publishImageUrl && publishImageUrls.length === 0) || 
            selectedChannelIds.length === 0 || 
            (scheduleType === 'later' && !scheduledDate) ||
            (publishText.length > 4096) ||
            ((publishImageUrl || publishImageUrls.length > 0) && publishText.length > 1024))}
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

// Set default props
PublishPanel.defaultProps = {
  onContentChange: undefined,
  editMode: false,
  scheduledPostId: undefined,
  initialChannelId: undefined,
  initialScheduledDate: undefined
};

export default PublishPanel;