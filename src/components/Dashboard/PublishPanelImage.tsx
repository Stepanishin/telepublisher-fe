import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle, AlertTriangle, Calendar, RefreshCw, Smile } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import MultiSelect from '../ui/MultiSelect';
import TagInput from '../ui/TagInput';
import Alert from '../ui/Alert';
import ImageUploader from '../ui/ImageUploader';
import VoiceRecorder from '../ui/VoiceRecorder';
import { useChannelsStore } from '../../store/channelsStore';
import { useContentStore } from '../../store/contentStore';
import { useTabContentStore } from '../../store/tabContentStore';
import { useLanguage } from '../../contexts/LanguageContext';
import DateTimePicker from '../ui/DateTimePicker';
import { deleteImage } from '../../services/api';
import { commonEmojis } from '../../utils/commonEmojis';
import { TelegramButton } from '../../types';

// Scheduled post types
type ScheduleType = 'now' | 'later';

// Define the props for the component
interface PublishPanelProps {
  onContentChange?: (content: { 
    text: string; 
    imageUrl: string; 
    imageUrls: string[]; 
    tags: string[];
    imagePosition?: 'top' | 'bottom';
    buttons?: { text: string; url: string }[];
  }) => void;
  editMode?: boolean;
  scheduledPostId?: string;
  initialChannelId?: string;
  initialScheduledDate?: Date;
}

const PublishPanelImage: React.FC<PublishPanelProps> = ({ onContentChange, editMode, scheduledPostId, initialChannelId, initialScheduledDate }) => {
  const { channels } = useChannelsStore();
  const { 
    content, 
    isPublishing, 
    publishResult, 
    error, 
    publish, 
    resetPublishResult,
    updateScheduledPost,
    setPublishResult
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
  
  // Add a ref for the Quill editor instance
  const quillRef = useRef<ReactQuill>(null);
  
  // State for emoji picker visibility
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Add this after line 44
  const [imagePosition, setImagePosition] = useState<'top' | 'bottom'>(
    'bottom'
  );
  const [buttons, setButtons] = useState<TelegramButton[]>(
    postState.buttons || []
  );
  
  // Function to insert emoji at cursor position
  const insertEmoji = (emoji: string) => {
    if (!quillRef.current) return;
    
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();
    
    if (range) {
      // Insert emoji at cursor position
      quill.insertText(range.index, emoji);
      // Move cursor after the inserted emoji
      quill.setSelection(range.index + emoji.length, 0);
    } else {
      // If no selection, insert at the end
      const length = quill.getText().length;
      quill.insertText(length, emoji);
      quill.setSelection(length + emoji.length, 0);
    }
    
    // Hide emoji picker after selection
    setShowEmojiPicker(false);
  };
  
  // Define Quill modules and formats
  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link']
    ]
  };

  const quillFormats = [
    'bold', 'italic', 'underline', 'strike', 
    'list', 'bullet', 'link'
  ];
  
  // Utility function to get HTML content length without tags
  const getTextContentLength = (html: string): number => {
    if (!html) return 0;
    // Create a temporary DOM element
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;
    // Get text content
    const text = tempElement.textContent || tempElement.innerText || '';
    return text.length;
  };
  
  // Calculate total message length including tags
  const getTotalMessageLength = (): number => {
    // Strip HTML to get plain text for accurate length calculation
    const plainText = stripHtml(publishText);
    let totalLength = plainText.length;
    
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
    // Для позиции изображения внизу (bottom) лимит значительно выше
    if (imagePosition === 'bottom' && (publishImageUrl || publishImageUrls.length > 0)) {
      return {
        warningThreshold: 3800,
        errorThreshold: 4096,
        maxLimit: 4096,
        warningMessage: 'publish_panel.approaching_limit',
        errorMessage: 'publish_panel.message_too_long',
        limitLabel: 'publish_panel.extended_caption_limit'
      };
    }
    // Стандартный случай для изображений (подпись к фото ограничена 1024 символами)
    else if (publishImageUrl || publishImageUrls.length > 0) {
      return {
        warningThreshold: 900,
        errorThreshold: 1024,
        maxLimit: 1024,
        warningMessage: 'publish_panel.approaching_caption_limit',
        errorMessage: 'publish_panel.error_caption_too_long',
        limitLabel: 'publish_panel.caption_limit'
      };
    } 
    // Обычное текстовое сообщение без изображений
    else {
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
  
  // Helper function to validate URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
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
  
  // Initialize component with any existing content from content generator (one-way sync only)
  useEffect(() => {
    // Only update if content generator has provided content and we haven't initialized yet
    if (!hasInitializedFromSavedState.current && !editMode) {
      // Check if content generator has provided any content
      if (content.text || content.imageUrl || (content.imageUrls && content.imageUrls.length > 0) || (content.tags && content.tags.length > 0)) {
        // Apply content from generator to local state
        if (content.text && !publishText) {
          setPublishText(content.text);
        }
        if (content.imageUrl && !publishImageUrl) {
          setPublishImageUrl(content.imageUrl);
        }
        if (content.imageUrls && content.imageUrls.length > 0 && publishImageUrls.length === 0) {
          setPublishImageUrls(content.imageUrls);
          setUseMultipleImages(true);
        }
        if (content.tags && content.tags.length > 0 && publishTags.length === 0) {
          setPublishTags(content.tags);
        }
      }
      
      // Mark as initialized
      hasInitializedFromSavedState.current = true;
    }
  }, []); // Run only once on mount
  
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
  
  // Call onContentChange whenever content changes
  useEffect(() => {
    if (onContentChange) {
      onContentChange({
        text: publishText,
        imageUrl: publishImageUrl,
        imageUrls: publishImageUrls,
        tags: publishTags,
        imagePosition,
        buttons
      });
    }
  }, [publishText, publishImageUrl, publishImageUrls, publishTags, imagePosition, buttons]); // Remove onContentChange from dependencies
  
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
    const { warningThreshold } = getMessageLengthLimits();
    if (getTotalMessageLength() <= warningThreshold) {
      setShowLengthWarning(true); // Reset when back under threshold
    }
  }, [publishText, imagePosition]);
  
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
      useMultipleImages,
      imagePosition,
      buttons
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
        useMultipleImages,
        imagePosition,
        buttons
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
    savePostState,
    imagePosition,
    buttons
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
    // Delete uploaded images from server before clearing
    if (publishImageUrl && publishImageUrl.includes('/uploads/')) {
      deleteImage(publishImageUrl).then(success => {
        if (success) {
          console.log('Successfully deleted single image from server:', publishImageUrl);
        }
      });
    }
    
    if (publishImageUrls.length > 0) {
      publishImageUrls.forEach(imageUrl => {
        if (imageUrl.includes('/uploads/')) {
          deleteImage(imageUrl).then(success => {
            if (success) {
              console.log('Successfully deleted image from server:', imageUrl);
            }
          });
        }
      });
    }
    
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
    
    // Reset image position
    setImagePosition('top');
    
    // Reset buttons
    setButtons([]);
    
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
        useMultipleImages: false,
        imagePosition: 'top',
        buttons: []
      });
    }
  };
  
  const handleTextChange = (content: string) => {
    setPublishText(content);
    
    // Calculate plain text length for validation
    const plainTextLength = getTextContentLength(content);
    const { errorThreshold } = getMessageLengthLimits();
    
    // Clear errors when text is okay
    if (plainTextLength <= errorThreshold && formError === t('publish_panel.message_too_long')) {
      setFormError('');
    }
    
    // Set error when text is too long
    if (plainTextLength > errorThreshold && formError !== t('publish_panel.message_too_long')) {
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
  
  // Utility function to strip HTML and convert to plain text
  const stripHtml = (html: string): string => {
    // Create a temporary DOM element
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;
    
    // Get text content
    let text = tempElement.textContent || tempElement.innerText || '';
    
    // Replace multiple spaces with single space
    text = text.replace(/\s+/g, ' ');
    
    // Trim and remove extra newlines
    return text.trim();
  };
  
  // Convert HTML to Telegram-compatible format
  const convertHtmlToTelegramFormat = (html: string): string => {
    if (!html) return '';
    
    // Replace emoji spans with their unicode character
    html = html.replace(/<span class="ql-emoji"[^>]*data-unicode="([^"]+)"[^>]*>.*?<\/span>/g, (match, unicode) => {
      try {
        // Convert hex code to actual unicode character
        return String.fromCodePoint(parseInt(unicode, 16));
      } catch (err) {
        console.error('Error converting emoji unicode:', err);
        return match;
      }
    });
    
    // Заменяем &nbsp; на обычный пробел перед обработкой
    html = html.replace(/&nbsp;/g, ' ');
    
    // Предварительная очистка HTML от некоторых тегов, которые не поддерживаются Telegram
    // Заменяем параграфы на перенос строки, но не добавляем двойной перенос
    const cleanHtml = html.replace(/<p[^>]*>/gi, '')
                        .replace(/<\/p>/gi, '\n')  // Только один перенос вместо двух
                        .replace(/<br\s*\/?>/gi, '\n')
                        .replace(/<div[^>]*>/gi, '')
                        .replace(/<\/div>/gi, '\n');
    
    // Создаем временный элемент для работы с HTML
    const tempElement = document.createElement('div');
    tempElement.innerHTML = cleanHtml;
    
    // Обрабатываем различные элементы HTML и преобразуем их в HTML-теги для Telegram
    
    // Обработка жирного текста
    const boldElements = tempElement.querySelectorAll('strong, b');
    boldElements.forEach(el => {
      const boldText = el.innerHTML;
      el.outerHTML = `<b>${boldText}</b>`;
    });
    
    // Обработка курсива
    const italicElements = tempElement.querySelectorAll('em, i');
    italicElements.forEach(el => {
      const italicText = el.innerHTML;
      el.outerHTML = `<i>${italicText}</i>`;
    });
    
    // Обработка подчеркнутого текста
    const underlineElements = tempElement.querySelectorAll('u');
    underlineElements.forEach(el => {
      const underlineText = el.innerHTML;
      el.outerHTML = `<u>${underlineText}</u>`;
    });
    
    // Обработка зачеркнутого текста
    const strikeElements = tempElement.querySelectorAll('s, del, strike');
    strikeElements.forEach(el => {
      const strikeText = el.innerHTML;
      el.outerHTML = `<s>${strikeText}</s>`;
    });
    
    // Обработка кода
    const codeElements = tempElement.querySelectorAll('code, pre');
    codeElements.forEach(el => {
      const codeText = el.innerHTML;
      el.outerHTML = `<code>${codeText}</code>`;
    });
    
    // Обработка ссылок
    const linkElements = tempElement.querySelectorAll('a');
    linkElements.forEach(el => {
      const href = el.getAttribute('href');
      // Берем текстовое содержимое вместо innerHTML, чтобы избежать вложенных тегов
      const linkText = el.textContent || '';
      
      if (href && href.trim() !== '') {
        // Создаем корректную ссылку с экранированием кавычек в URL
        const safeHref = href.replace(/"/g, '&quot;');
        el.outerHTML = `<a href="${safeHref}">${linkText}</a>`;
      } else {
        // Если ссылка пустая, просто заменяем тег на текст
        el.outerHTML = linkText;
      }
    });
    
    // Обработка списков
    const ulElements = tempElement.querySelectorAll('ul');
    ulElements.forEach(ul => {
      const listItems = ul.querySelectorAll('li');
      let listText = '\n';
      listItems.forEach(li => {
        listText += `• ${li.innerHTML.trim()}\n`;
      });
      ul.outerHTML = listText;
    });
    
    const olElements = tempElement.querySelectorAll('ol');
    olElements.forEach(ol => {
      const listItems = ol.querySelectorAll('li');
      let listText = '\n';
      listItems.forEach((li, index) => {
        listText += `${index + 1}. ${li.innerHTML.trim()}\n`;
      });
      ol.outerHTML = listText;
    });
    
    // Получаем итоговый HTML
    let result = tempElement.innerHTML;
    
    // Убираем последовательные переносы строк (более 2-х) и заменяем их на двойной перенос
    result = result.replace(/\n{3,}/g, '\n\n');
    
    // Экранируем некоторые специальные символы HTML
    result = result.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;');
    
    // Возвращаем теги форматирования
    result = result.replace(/&lt;b&gt;/g, '<b>')
                  .replace(/&lt;\/b&gt;/g, '</b>')
                  .replace(/&lt;i&gt;/g, '<i>')
                  .replace(/&lt;\/i&gt;/g, '</i>')
                  .replace(/&lt;u&gt;/g, '<u>')
                  .replace(/&lt;\/u&gt;/g, '</u>')
                  .replace(/&lt;s&gt;/g, '<s>')
                  .replace(/&lt;\/s&gt;/g, '</s>')
                  .replace(/&lt;code&gt;/g, '<code>')
                  .replace(/&lt;\/code&gt;/g, '</code>')
                  .replace(/&lt;a href="([^"]+)"&gt;/g, '<a href="$1">')
                  .replace(/&lt;\/a&gt;/g, '</a>');
    
    // Финальная очистка от избыточных переносов строк в начале и конце текста
    result = result.trim();
    
    // Еще раз заменяем все оставшиеся HTML-сущности на соответствующие символы
    result = result.replace(/&nbsp;/g, ' ')
                   .replace(/&amp;nbsp;/g, ' ')
                   .replace(/&quot;/g, '"')
                   .replace(/&apos;/g, "'")
                   .replace(/&laquo;/g, '«')
                   .replace(/&raquo;/g, '»')
                   .replace(/&ndash;/g, '–')
                   .replace(/&mdash;/g, '—')
                   .replace(/&hellip;/g, '...');
    
    return result;
  };

  const handlePublish = async () => {
    // Validate form
    if (selectedChannelIds.length === 0) {
      setFormError(t('publish_panel.no_channel_error'));
      return;
    }
    
    // Convert HTML to Telegram-compatible format
    const telegramText = convertHtmlToTelegramFormat(publishText);
    
    if (!telegramText && !publishImageUrl && publishImageUrls.length === 0) {
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
          text: telegramText,
          imageUrl: useMultipleImages ? '' : publishImageUrl,
          imageUrls: useMultipleImages ? publishImageUrls : [],
          tags: publishTags,
          scheduledDate: scheduledDate,
          imagePosition: imagePosition,
          buttons: buttons
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
          text: telegramText,
          imageUrl: useMultipleImages ? '' : publishImageUrl,
          imageUrls: useMultipleImages ? publishImageUrls : [],
          tags: publishTags,
          scheduledDate: scheduleType === 'later' ? scheduledDate : null,
          imagePosition: imagePosition,
          buttons: buttons
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
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('publish_panel.text_label')}
          </label>
          <div className="quill-container">
            <ReactQuill
              ref={quillRef}
              value={publishText}
              onChange={handleTextChange}
              modules={quillModules}
              formats={quillFormats}
              placeholder={t('publish_panel.text_placeholder')}
              theme="snow"
            />
          </div>
          <div className="flex justify-between mt-2">
            {/* Emoji picker button */}
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                leftIcon={<Smile size={16} />}
                className="flex justify-center items-center"
              >
              </Button>
              
              {/* Emoji picker panel */}
              {showEmojiPicker && (
                <div className="absolute top-10 left-0 z-10 bg-white border border-gray-200 rounded-md shadow-lg p-2 max-w-xs max-h-48 overflow-y-auto w-max">
                  <div className="grid grid-cols-8 gap-1">
                    {commonEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        className="w-8 h-8 text-lg hover:bg-gray-100 rounded-md flex items-center justify-center focus:outline-none"
                        onClick={() => insertEmoji(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <VoiceRecorder
              onTranscript={(transcript) => {
                // Append transcribed text to the current content
                // Since ReactQuill uses HTML, we need to preserve formatting
                const quillEditor = document.querySelector('.ql-editor');
                if (quillEditor) {
                  // Get current cursor position
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    if (quillEditor.contains(range.commonAncestorContainer)) {
                      // Insert at cursor position
                      range.deleteContents();
                      range.insertNode(document.createTextNode(transcript));
                      // Move cursor to end of inserted text
                      range.setStartAfter(range.endContainer);
                      range.setEndAfter(range.endContainer);
                      selection.removeAllRanges();
                      selection.addRange(range);
                      
                      // Trigger change event
                      const newContent = quillEditor.innerHTML;
                      handleTextChange(newContent);
                      return;
                    }
                  }
                  
                  // Fallback: append to end (preserve formatting)
                  const newText = publishText 
                    ? `${publishText}<p>${transcript}</p>` 
                    : `<p>${transcript}</p>`;
                  handleTextChange(newText);
                } else {
                  // Simple fallback if can't find the editor
                  const newText = publishText 
                    ? `${publishText}\n${transcript}` 
                    : transcript;
                  handleTextChange(newText);
                }
              }}
              onError={(errorMsg) => setFormError(errorMsg)}
              buttonSize="sm"
              className="ml-auto"
            />
          </div>
          <div style={{ height: '20px' }}></div> {/* Spacer to compensate for the Quill toolbar */}
        </div>
        
        {/* Show warning when approaching character limit */}
        {getTotalMessageLength() > getMessageLengthLimits().warningThreshold && showLengthWarning && (
          <Alert
            variant="warning"
            message={getTotalMessageLength() > getMessageLengthLimits().errorThreshold 
              ? t('publish_panel.message_too_long') 
              : formatMessage('publish_panel.approaching_limit', { 
                  remaining: (getMessageLengthLimits().maxLimit - getTotalMessageLength()).toString() 
                })
            }
            onClose={() => setShowLengthWarning(false)}
          />
        )}
        
        {/* Show warning when approaching caption limit with image */}
        {(publishImageUrl || publishImageUrls.length > 0) && imagePosition === 'top' && 
         getTotalMessageLength() > 900 && getTotalMessageLength() <= 1024 && showLengthWarning && (
          <Alert
            variant="warning"
            message={formatMessage('publish_panel.approaching_caption_limit', { 
              remaining: (1024 - getTotalMessageLength()).toString() 
            })}
            onClose={() => setShowLengthWarning(false)}
          />
        )}
        
        {/* Show error when exceeding caption limit with image */}
        {(publishImageUrl || publishImageUrls.length > 0) && imagePosition === 'top' && 
         getTotalMessageLength() > 1024 && (
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
          <ImageUploader
              value={publishImageUrl}
              onChange={setPublishImageUrl}
              onError={setUploadError}
            />
        </div>
        
        <TagInput
          label={t('publish_panel.tags')}
          tags={publishTags}
          onChange={setPublishTags}
        />

        {/* Telegram Buttons */}
        {
          (imagePosition === 'bottom' || imagePosition === 'top') && (
            <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('publish_panel.buttons')}
          </label>
          
            <>
              {buttons.map((button, index) => (
                <div key={index} className="flex items-start mb-3 space-x-2 bg-gray-50 p-3 rounded-md border border-gray-200">
                  <div className="flex-grow">
                    <label className="block text-xs text-gray-600 mb-1">{t('publish_panel.button_text')}</label>
                    <input
                      type="text"
                      placeholder={t('publish_panel.button_text_placeholder')}
                      value={button.text}
                      onChange={(e) => {
                        const newButtons = [...buttons];
                        newButtons[index].text = e.target.value;
                        setButtons(newButtons);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2"
                    />
                    <label className="block text-xs text-gray-600 mb-1">{t('publish_panel.button_url')}</label>
                    <input
                      type="text"
                      placeholder={t('publish_panel.button_url_placeholder')}
                      value={button.url}
                      onChange={(e) => {
                        const newButtons = [...buttons];
                        newButtons[index].url = e.target.value;
                        setButtons(newButtons);
                      }}
                      className={`w-full p-2 border rounded-md text-sm ${
                        button.url && !isValidUrl(button.url) 
                          ? 'border-red-500' 
                          : 'border-gray-300'
                      }`}
                    />
                    {button.url && !isValidUrl(button.url) && (
                      <p className="text-xs text-red-500 mt-1">
                        {t('publish_panel.invalid_url')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const newButtons = [...buttons];
                      newButtons.splice(index, 1);
                      setButtons(newButtons);
                    }}
                    className="mt-1 p-2 text-red-500 hover:bg-red-50 rounded-md"
                    type="button"
                    title={t('publish_panel.remove_button')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
              
              {/* Add button button */}
              {buttons.length < 5 && (
                <button
                  onClick={() => {
                    setButtons([...buttons, { text: '', url: '' }]);
                  }}
                  className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors flex items-center"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  {t('publish_panel.add_button')}
                </button>
              )}
              
              {buttons.length >= 5 && (
                <p className="text-xs text-gray-500 mt-1">
                  {t('publish_panel.max_buttons')}
                </p>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                {t('publish_panel.buttons_note')}
              </p>
            </>

        </div>
        )}

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
            (getTotalMessageLength() > getMessageLengthLimits().errorThreshold) ||
            ((publishImageUrl || publishImageUrls.length > 0) && imagePosition === 'top' && getTotalMessageLength() > 1024))}
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
PublishPanelImage.defaultProps = {
  onContentChange: undefined,
  editMode: false,
  scheduledPostId: undefined,
  initialChannelId: undefined,
  initialScheduledDate: undefined
};

export default PublishPanelImage;