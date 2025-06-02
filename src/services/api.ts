import axios, { AxiosError } from 'axios';
import { Channel, PublishParams, PublishResult, CreditInfo, SubscriptionType, PollParams, ScheduledPostUpdate } from '../types';
import { TelegramUser } from 'react-telegram-login';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Telegram Auth API
export const verifyTelegramLogin = async (authData: TelegramUser) => {
  try {
    const response = await api.post('/telegram/auth', authData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data.user;
  } catch (error) {
    console.error('Error verifying Telegram login:', error);
    throw error;
  }
};

// User API
export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data.user;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Channels API
export const fetchChannels = async () => {
  try {
    const response = await api.get('/channels');
    return response.data.channels;
  } catch (error) {
    console.error('Error fetching channels:', error);
    throw error;
  }
};

export const getChannelLimits = async () => {
  try {
    const response = await api.get('/channels/limits');
    return response.data.data;
  } catch (error) {
    console.error('Error getting channel limits:', error);
    throw error;
  }
};

export const addChannel = async (channelData: { username: string; title: string; botToken?: string }) => {
  try {
    const response = await api.post('/channels', channelData);
    return response.data.channel;
  } catch (error: unknown) {
    console.error('Error adding channel:', error);
    // Проверяем, связано ли это с достижением лимита
    if (error instanceof AxiosError && error.response?.data?.limitReached) {
      const limitError = new Error(`Channel limit reached: ${error.response.data.message}`);
      limitError.name = 'ChannelLimitError';
      // @ts-expect-error - Add custom properties to error
      limitError.limitInfo = {
        limit: error.response.data.channelLimit,
        current: error.response.data.currentCount
      };
      throw limitError;
    }
    throw error;
  }
};

export const updateChannel = async (id: string, channelData: Partial<Channel>) => {
  try {
    const response = await api.put(`/channels/${id}`, channelData);
    return response.data.channel;
  } catch (error) {
    console.error('Error updating channel:', error);
    throw error;
  }
};

export const deleteChannel = async (id: string) => {
  try {
    await api.delete(`/channels/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting channel:', error);
    throw error;
  }
};

// Credits API
export const getCreditInfo = async (): Promise<CreditInfo> => {
  try {
    const response = await api.get('/credits/info');
    const creditInfo = response.data.data;
    
    // Log raw data for debugging
    console.log('Raw credit info from API:', JSON.stringify(creditInfo));
    
    // Ensure subscription type is lowercase and valid
    if (creditInfo) {
      if (!creditInfo.subscriptionType) {
        console.warn('No subscription type found in credit info response, defaulting to "free"');
        creditInfo.subscriptionType = 'free' as SubscriptionType;
      } else {
        creditInfo.subscriptionType = String(creditInfo.subscriptionType).toLowerCase() as SubscriptionType;
        console.log('Normalized subscription type:', creditInfo.subscriptionType);
      }
    }
    
    return creditInfo;
  } catch (error) {
    console.error('Error getting credit info:', error);
    throw error;
  }
};

export const useCredits = async (operationType: string, quantity: number = 1): Promise<{ remainingCredits: number }> => {
  try {
    const response = await api.post('/credits/use', { operationType, quantity });
    return response.data.data;
  } catch (error) {
    console.error('Error using credits:', error);
    throw error;
  }
};

export const addCredits = async (credits: number): Promise<{ credits: number }> => {
  try {
    const response = await api.post('/credits/add', { credits });
    return response.data.data;
  } catch (error) {
    console.error('Error adding credits:', error);
    throw error;
  }
};

export const updateSubscription = async (subscriptionType: SubscriptionType, paymentId?: string): Promise<CreditInfo> => {
  try {
    const response = await api.post('/credits/subscription', { subscriptionType, paymentId });
    return response.data.data;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

// Stripe API
export const createCheckoutSession = async (
  subscriptionType: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> => {
  try {
    const response = await api.post('/stripe/create-checkout-session', {
      subscriptionType,
      successUrl,
      cancelUrl,
    });
    
    if (response.data.success && response.data.data.url) {
      return response.data.data.url;
    } else {
      throw new Error('Не удалось создать платежную сессию');
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const createPortalSession = async (returnUrl: string): Promise<string> => {
  try {
    const response = await api.post('/stripe/create-portal-session', {
      returnUrl,
    });
    
    if (response.data.success && response.data.data.url) {
      return response.data.data.url;
    } else {
      throw new Error('Не удалось создать сессию управления подпиской');
    }
  } catch (error) {
    console.error('Error creating portal session:', error);
    
    // Проверка, связана ли ошибка с настройкой Customer Portal
    if (axios.isAxiosError(error) && error.response) {
      const responseData = error.response.data;
      
      // Проверка, содержит ли ответ сервера информацию о проблеме с конфигурацией
      if (responseData && responseData.details && 
          responseData.details.includes('Customer Portal') || 
          (responseData.message && responseData.message.includes('портал'))) {
        throw new Error('Портал управления подпиской не настроен. Пожалуйста, обратитесь к администратору.');
      }
    }
    
    throw error;
  }
};

export const cancelSubscription = async (): Promise<{ 
  success: boolean; 
  data?: { 
    endDate: string;
    subscriptionType?: string;
    isActive?: boolean;
    downgradeOnExpiry?: boolean;
    immediatelyCancelled?: boolean;
  }; 
  message?: string 
}> => {
  try {
    const response = await api.post('/stripe/cancel-subscription');
    return response.data;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

// Content generation
export const generateText = async (prompt: string): Promise<string> => {
  try {
    // Use real API instead of mock
    const response = await api.post('/ai/generate-text', { prompt });
    return response.data.data.text;
  } catch (error) {
    console.error('Error generating text:', error);
    throw new Error(error instanceof AxiosError ? error.response?.data?.message : 'Failed to generate text');
  }
};

export const generateTextFromImage = async (imageUrl: string, additionalPrompt?: string): Promise<string> => {
  try {
    const response = await api.post('/ai/generate-text-from-image', { 
      imageUrl,
      additionalPrompt
    });
    return response.data.data.text;
  } catch (error) {
    console.error('Error generating text from image:', error);
    throw new Error(error instanceof AxiosError ? error.response?.data?.message : 'Failed to generate text from image');
  }
};

export const generateImageFromImage = async (imageUrl: string, prompt?: string): Promise<string> => {
  try {
    const response = await api.post('/ai/generate-image-from-image', { 
      imageUrl,
      prompt 
    });
    return response.data.data.imageUrl;
  } catch (error) {
    console.error('Error generating image from image:', error);
    throw new Error(error instanceof AxiosError ? error.response?.data?.message : 'Failed to generate image from reference');
  }
};

// Upload image via our backend proxy
export const uploadImage = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    // Используем наш собственный бэкенд для проксирования запросов
    const response = await api.post(
      '/upload/image', 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    console.log('Image upload response:', response);
    
    if (response.data && response.data.imageUrl) {
      return response.data.imageUrl;
    } else {
      throw new Error('Failed to upload image');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Delete uploaded image from server
export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract filename from the URL
    const filename = imageUrl.split('/').pop();
    if (!filename) {
      console.error('Invalid image URL format', imageUrl);
      return false;
    }
    
    const response = await api.delete(`/upload/image/${filename}`);
    return response.data.success || false;
  } catch (error) {
    console.error('Error deleting image:', error);
    // Return false instead of throwing to prevent UI disruption
    return false;
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    // Use real API instead of mock
    const response = await api.post('/ai/generate-image', { prompt });
    return response.data.data.imageUrl;
  } catch (error) {
    console.error('Generate image error:', error);
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      throw new Error('Not enough credits to generate image');
    }
    throw error;
  }
};

export const generateTags = async (text: string): Promise<string[]> => {
  try {
    // Use real API instead of mock
    const response = await api.post('/ai/generate-tags', { text });
    console.log('response', response.data.data.tags);
    const words: string[] = response.data.data.tags
    const tags = words.length > 0 
    ? words.slice(0, Math.min(5, words.length)).map((word: string) => `#${word.toLowerCase().replace(/[^a-zA-Zа-яА-Я0-9]/g, '')}`)
    : ['#tag1', '#tag2', '#tag3', '#content', '#telegram'];

    return tags;
  } catch (error) {
    console.error('Generate tags error:', error);
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      throw new Error('Not enough credits to generate tags');
    }
    throw error;
  }
};

// Publishing
export const publishContent = async (params: PublishParams): Promise<PublishResult> => {
  try {
    // Fetch channel info to get botToken
    const channels = await fetchChannels();
    console.log('[CLIENT] Publishing content with params:', params);
    
    // Find channel by checking both id and _id
    const channel = channels.find((ch: Channel) => 
      (ch._id && ch._id === params.channelId) || 
      (ch.id && ch.id === params.channelId)
    );
    
    if (!channel || !channel.botToken) {
      throw new Error('channel_not_found');
    }
    
    // Check if this is a scheduled post
    if (params.scheduledDate) {
      try {
        console.log('[CLIENT] Scheduling post for future publication:', params.scheduledDate);
        // Store scheduled post in the database
        await api.post('/scheduled-posts', {
          channelId: params.channelId,
          text: params.text,
          imageUrl: params.imageUrl,
          imageUrls: params.imageUrls || [],
          tags: params.tags,
          scheduledDate: params.scheduledDate.toISOString(),
          imagePosition: params.imagePosition || 'top',
          buttons: params.buttons || []
        });
        
        return {
          success: true,
          message: `scheduled_success:${channel.title}:${params.scheduledDate.toLocaleString()}`
        };
      } catch (error) {
        console.error('[CLIENT] Error scheduling post:', error);
        return {
          success: false,
          message: error instanceof Error 
            ? error.message 
            : 'error_scheduling'
        };
      }
    }
    
    let messageText = params.text;
    
    // Append tags to the message if available
    if (params.tags && params.tags.length > 0) {
      messageText += '\n\n' + params.tags.join(' ');
    }
    
    let result;

    console.log('[CLIENT] Publishing to channel:', channel.title || channel.username);
    
    // Prepare chat_id - if it looks like a username without @, add it
    let chatId = channel.chatId || channel.id;  // First try to use chatId if exists
    if (!chatId) {
      // If no chatId, use title and prefix with @ if it's a username
      chatId = channel.title;
      if (chatId && !chatId.startsWith('@') && !chatId.match(/^-?\d+$/)) {
        chatId = '@' + chatId;
      }
    }
    
    // Prepare inline keyboard if buttons are provided
    const replyMarkup = params.buttons && params.buttons.length > 0 
      ? {
          inline_keyboard: params.buttons.map(button => [{
            text: button.text,
            url: button.url
          }])
        }
      : undefined;
    
    // Check for multiple images
    if (params.imageUrls && params.imageUrls.length > 0) {
      console.log('[CLIENT] Sending multiple images:', params.imageUrls.length);
      
      // Для позиции 'bottom', отправляем текстовое сообщение с предпросмотром первого изображения
      if (params.imagePosition === 'bottom' && messageText.trim()) {
        console.log('[CLIENT] Using bottom position with message preview for multiple images');
        // Берем первое изображение для предпросмотра
        const previewImageUrl = params.imageUrls[0];
        
        // Отправляем текстовое сообщение с предпросмотром изображения внизу
        result = await fetch(`https://api.telegram.org/bot${channel.botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `${messageText}`,
            parse_mode: 'HTML',
            link_preview_options: {
              is_disabled: false,
              url: previewImageUrl,
              prefer_large_media: true,
              show_above_text: false
            },
            reply_markup: replyMarkup
          })
        });
      } else {
        console.log('[CLIENT] Using standard media group sending for multiple images');
        // Стандартное поведение - с подписью на первом изображении
        const media = params.imageUrls.map((url, index) => {
          // The first media item will contain the caption (message text)
          return {
            type: 'photo',
            media: url,
            caption: index === 0 ? messageText : undefined,
            parse_mode: 'HTML'
          };
        });
        
        // If there are no images in the imageUrls array, check the single imageUrl
        if (media.length === 0 && params.imageUrl) {
          media.push({
            type: 'photo',
            media: params.imageUrl,
            caption: messageText,
            parse_mode: 'HTML'
          });
        }
        
        // Send media group if we have media items
        if (media.length > 0) {
          // For media groups, we can't add inline keyboard directly
          // So if we have buttons, we'll need to send a separate message after the media group
          result = await fetch(`https://api.telegram.org/bot${channel.botToken}/sendMediaGroup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              media: media
            })
          });
          
          // If we have buttons, send an additional message with the inline keyboard
          if (replyMarkup && result.ok) {
            console.log('[CLIENT] Sending buttons separately for media group');
            const mediaGroupResult = await result.json();
            
            // Send a follow-up message with the buttons
            await fetch(`https://api.telegram.org/bot${channel.botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: '🔗 Links:',
                reply_to_message_id: mediaGroupResult.result[0].message_id,
                reply_markup: replyMarkup
              })
            });
          }
        } else {
          // Fallback to sending a text message if no images
          result = await fetch(`https://api.telegram.org/bot${channel.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: messageText,
              parse_mode: 'HTML',
              reply_markup: replyMarkup
            })
          });
        }
      }
    }
    // If a single image is provided
    else if (params.imageUrl) {
      // Make sure the image URL is properly formatted
      let photoUrl = params.imageUrl;
      
      // If it's a relative URL from our server, convert it to an absolute URL
      if (photoUrl.startsWith('/uploads')) {
        const baseUrl = window.location.origin;
        photoUrl = `${baseUrl}${photoUrl}`;
      }
      
      // Validate URL - Telegram requires valid https or http URLs
      let isValidUrl = false;
      try {
        const url = new URL(photoUrl);
        isValidUrl = url.protocol === 'http:' || url.protocol === 'https:';
        
        // Check if URL has valid host and pathname
        if (!url.host || url.host === '' || url.pathname === '/') {
          isValidUrl = false;
        }
      } catch (e) {
        console.error('[CLIENT] Invalid URL format:', photoUrl, e);
        isValidUrl = false;
      }
      
      if (!isValidUrl) {
        throw new Error('Invalid image URL format. Please upload the image again.');
      }
      
      // Check for URLs from our own API as well
      if (photoUrl.includes('/api/upload/image') || photoUrl.includes('/uploads/')) {
        try {
          // For Telegram, we need to make sure the image is directly accessible
          console.log('[CLIENT] Image is from our own server:', photoUrl);
          
          // For local development URLs, replace localhost with a public URL if available
          if (photoUrl.includes('localhost') || photoUrl.includes('127.0.0.1')) {
            console.warn('[CLIENT] Local URL detected, this might not be accessible by Telegram:', photoUrl);
          }
        } catch (error) {
          console.error('[CLIENT] Error preparing image for Telegram:', error);
        }
      }
      
      console.log('[CLIENT] Sending photo to Telegram with position:', params.imagePosition);
      
      // For bottom image position, send a message with image preview at bottom
      if (params.imagePosition === 'bottom' && messageText.trim()) {
        console.log('[CLIENT] Using bottom position with message preview for single image');
        // Create message with image link preview
        const imageUrlForPreview = photoUrl;
        
        // Отправляем текстовое сообщение с предпросмотром изображения внизу
        result = await fetch(`https://api.telegram.org/bot${channel.botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `${messageText}`,
            parse_mode: 'HTML',
            link_preview_options: {
              is_disabled: false,
              url: imageUrlForPreview,
              prefer_large_media: true,
              show_above_text: false
            },
            reply_markup: replyMarkup
          })
        });
      } else {
        console.log('[CLIENT] Using standard photo with caption');
        // Regular behavior - image with caption
        result = await fetch(`https://api.telegram.org/bot${channel.botToken}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            photo: photoUrl,
            caption: messageText,
            parse_mode: 'HTML',
            reply_markup: replyMarkup
          })
        });
      }
    } else {
      // Otherwise just send a text message
      console.log('[CLIENT] Sending text-only message');
      result = await fetch(`https://api.telegram.org/bot${channel.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: 'HTML',
          reply_markup: replyMarkup
        })
      });
    }
    
    const data = await result.json();
    
    if (!result.ok) {
      console.error('[CLIENT] Telegram API error:', data);
      throw new Error(data.description || 'error_publishing');
    }
    
    console.log('[CLIENT] Successfully published to Telegram channel:', chatId);
    return {
      success: true,
      message: `publish_success:${channel.title}`
    };
  } catch (error) {
    console.error('[CLIENT] Publish error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'error_publishing'
    };
  }
};

// Publishing polls
export const publishPoll = async (params: PollParams): Promise<PublishResult> => {
  try {
    // Fetch channel info to get botToken
    const channels = await fetchChannels();
    
    // Find channel by checking both id and _id
    const channel = channels.find((ch: Channel) => 
      (ch._id && ch._id === params.channelId) || 
      (ch.id && ch.id === params.channelId)
    );
    
    if (!channel || !channel.botToken) {
      throw new Error('channel_not_found');
    }
    
    // Check if this is a scheduled poll
    if (params.scheduledDate) {
      try {
        // Store scheduled poll in the database
        await api.post('/scheduled-polls', {
          channelId: params.channelId,
          question: params.question,
          options: params.options,
          isAnonymous: params.isAnonymous,
          allowsMultipleAnswers: params.allowsMultipleAnswers,
          scheduledDate: params.scheduledDate.toISOString()
        });
        
        return {
          success: true,
          message: `scheduled_success:${channel.title}:${params.scheduledDate.toLocaleString()}`
        };
      } catch (error) {
        console.error('Error scheduling poll:', error);
        return {
          success: false,
          message: error instanceof Error 
            ? error.message 
            : 'error_scheduling'
        };
      }
    }
    
    // Prepare chat_id - if it looks like a username without @, add it
    let chatId = channel.chatId || channel.id;  // First try to use chatId if exists
    if (!chatId) {
      // If no chatId, use title and prefix with @ if it's a username
      chatId = channel.title;
      if (chatId && !chatId.startsWith('@') && !chatId.match(/^-?\d+$/)) {
        chatId = '@' + chatId;
      }
    }
    
    // Extract option texts to array
    const optionTexts = params.options.map(option => option.text);
    
    // Send poll via Telegram API
    const result = await fetch(`https://api.telegram.org/bot${channel.botToken}/sendPoll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        question: params.question,
        options: optionTexts,
        is_anonymous: params.isAnonymous ?? true,
        allows_multiple_answers: params.allowsMultipleAnswers ?? false,
        // We don't use these options in the basic implementation:
        // correct_option_id: null,
        // explanation: null,
        // open_period: null,
        // close_date: null,
        // is_closed: false
      })
    });
    
    const data = await result.json();
    
    if (!result.ok) {
      console.error('Telegram API error:', data);
      throw new Error(data.description || 'error_publishing_poll');
    }
    
    return {
      success: true,
      message: `publish_success:${channel.title}`
    };
  } catch (error) {
    console.error('Publish poll error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'error_publishing_poll'
    };
  }
};

// Scheduled posts
export const getScheduledPosts = async () => {
  try {
    const response = await api.get('/scheduled-posts');
    return response.data;
  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    throw error;
  }
};

export const getScheduledPost = async (postId: string) => {
  try {
    const response = await api.get(`/scheduled-posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching scheduled post:', error);
    throw error;
  }
};

export const deleteScheduledPost = async (postId: string) => {
  try {
    const response = await api.delete(`/scheduled-posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting scheduled post:', error);
    throw error;
  }
};

export const publishScheduledPost = async (postId: string) => {
  try {
    console.log(`[CLIENT] Publishing scheduled post with ID: ${postId}`);
    const response = await api.post(`/scheduled-posts/${postId}/publish`);
    console.log(`[CLIENT] Published scheduled post result:`, response.data);
    return response.data;
  } catch (error) {
    console.error('[CLIENT] Error publishing scheduled post:', error);
    throw error;
  }
};

export const updateScheduledPost = async (postId: string, data: ScheduledPostUpdate) => {
  try {
    const response = await api.put(`/scheduled-posts/${postId}`, data);
    return {
      success: true,
      message: response.data.message || 'Post updated successfully',
      data: response.data.data
    };
  } catch (error) {
    console.error('Error updating scheduled post:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update scheduled post'
    };
  }
};

// Scheduled polls
export const getScheduledPolls = async () => {
  try {
    const response = await api.get('/scheduled-polls');
    return response.data;
  } catch (error) {
    console.error('Error fetching scheduled polls:', error);
    throw error;
  }
};

export const getScheduledPoll = async (pollId: string) => {
  try {
    const response = await api.get(`/scheduled-polls/${pollId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching scheduled poll:', error);
    throw error;
  }
};

export const deleteScheduledPoll = async (pollId: string) => {
  try {
    const response = await api.delete(`/scheduled-polls/${pollId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting scheduled poll:', error);
    throw error;
  }
};

export const updateScheduledPoll = async (pollId: string, data: {
  channelId?: string;
  question?: string;
  options?: Array<{ text: string }>;
  isAnonymous?: boolean;
  allowsMultipleAnswers?: boolean;
  scheduledDate?: Date | null;
}) => {
  try {
    const response = await api.put(`/scheduled-polls/${pollId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating scheduled poll:', error);
    throw error;
  }
};

export const publishScheduledPoll = async (pollId: string) => {
  try {
    const response = await api.post(`/scheduled-polls/${pollId}/publish`);
    return response.data;
  } catch (error) {
    console.error('Error publishing scheduled poll:', error);
    throw error;
  }
};

// Purchase AI tokens
export const purchaseTokens = async (
  tokenAmount: number, 
  price: number,
  successUrl: string, 
  cancelUrl: string
): Promise<string> => {
  try {
    const response = await api.post('/stripe/purchase-tokens', {
      tokenAmount,
      price,
      successUrl,
      cancelUrl,
    });
    
    if (response.data.success && response.data.data.url) {
      return response.data.data.url;
    } else {
      throw new Error('Failed to create token purchase session');
    }
  } catch (error) {
    console.error('Error creating token purchase session:', error);
    throw error;
  }
};

// Draft API functions
export interface Draft {
  _id: string;
  title: string;
  content: string;
  type?: 'text' | 'image' | 'video' | 'media-group';
  imageUrl?: string;
  imageUrls?: string[];
  tags?: string[];
  imagePosition?: 'top' | 'bottom';
  buttons?: { text: string; url: string }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DraftCreateData {
  title: string;
  content: string;
  type?: 'text' | 'image' | 'video' | 'media-group';
  imageUrl?: string;
  imageUrls?: string[];
  tags?: string[];
  imagePosition?: 'top' | 'bottom';
  buttons?: { text: string; url: string }[];
}

export interface DraftUpdateData {
  title?: string;
  content?: string;
  imageUrl?: string;
  imageUrls?: string[];
  tags?: string[];
  imagePosition?: 'top' | 'bottom';
  buttons?: { text: string; url: string }[];
}

// Get all drafts
export const getDrafts = async (): Promise<Draft[]> => {
  try {
    const response = await api.get('/drafts');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching drafts:', error);
    throw error;
  }
};

// Get a specific draft by ID
export const getDraftById = async (draftId: string): Promise<Draft> => {
  try {
    const response = await api.get(`/drafts/${draftId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching draft:', error);
    throw error;
  }
};

// Create a new draft
export const createDraft = async (draftData: DraftCreateData): Promise<Draft> => {
  try {
    const response = await api.post('/drafts', draftData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating draft:', error);
    throw error;
  }
};

// Update an existing draft
export const updateDraft = async (draftId: string, draftData: DraftUpdateData): Promise<Draft> => {
  try {
    const response = await api.put(`/drafts/${draftId}`, draftData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating draft:', error);
    throw error;
  }
};

// Delete a draft
export const deleteDraft = async (draftId: string): Promise<boolean> => {
  try {
    await api.delete(`/drafts/${draftId}`);
    return true;
  } catch (error) {
    console.error('Error deleting draft:', error);
    throw error;
  }
};

// Upload an image for a draft
export const uploadDraftImage = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post(
      '/drafts/upload-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    if (response.data && response.data.imageUrl) {
      return response.data.imageUrl;
    } else {
      throw new Error('Failed to upload draft image');
    }
  } catch (error) {
    console.error('Error uploading draft image:', error);
    throw error;
  }
};

// AutoPosting API functions
export type Frequency = 'daily' | 'weekly' | 'custom';
export type TimeUnit = 'minutes' | 'hours' | 'days';

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
  buttons?: { text: string; url: string }[];
  nextScheduled?: Date | null;
  lastPublished?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Get all autoposting rules
export const getAutoPostingRules = async () => {
  try {
    const response = await api.get('/autoposting/rules');
    return response.data;
  } catch (error) {
    console.error('Error fetching autoposting rules:', error);
    throw error;
  }
};

// Get a specific autoposting rule
export const getAutoPostingRule = async (ruleId: string) => {
  try {
    const response = await api.get(`/autoposting/rules/${ruleId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching autoposting rule:', error);
    throw error;
  }
};

// Create a new autoposting rule
export const createAutoPostingRule = async (ruleData: AutoPostingRule) => {
  try {
    const response = await api.post('/autoposting/rules', ruleData);
    return response.data;
  } catch (error) {
    console.error('Error creating autoposting rule:', error);
    throw error;
  }
};

// Update an existing autoposting rule
export const updateAutoPostingRule = async (ruleId: string, ruleData: Partial<AutoPostingRule>) => {
  try {
    const response = await api.put(`/autoposting/rules/${ruleId}`, ruleData);
    return response.data;
  } catch (error) {
    console.error('Error updating autoposting rule:', error);
    throw error;
  }
};

// Delete an autoposting rule
export const deleteAutoPostingRule = async (ruleId: string) => {
  try {
    await api.delete(`/autoposting/rules/${ruleId}`);
    return true;
  } catch (error) {
    console.error('Error deleting autoposting rule:', error);
    throw error;
  }
};

// Get autoposting history
export const getAutoPostingHistory = async (
  limit: number = 20, 
  page: number = 1,
  status?: 'success' | 'failed' | 'all',
  search?: string
) => {
  try {
    // Формируем параметры запроса
    const params: Record<string, string | number> = { limit, page };
    
    // Добавляем параметры фильтрации, если они заданы
    if (status && status !== 'all') {
      params.status = status;
    }
    
    if (search && search.trim()) {
      params.search = search.trim();
    }
    
    const response = await api.get('/autoposting/history', { params });
    
    // Просто передаем ответ от сервера, не преобразовывая его
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error getting auto-posting history:', error);
    return {
      success: false,
      message: 'Failed to fetch auto-posting history'
    };
  }
};