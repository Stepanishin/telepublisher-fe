import axios, { AxiosError } from 'axios';
import { Channel, PublishParams, PublishResult, CreditInfo, SubscriptionType, PollParams, ScheduledPostUpdate } from '../types';
import { TelegramUser } from 'react-telegram-login';

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

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
    throw error;
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

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    // Use real API instead of mock
    const response = await api.post('/ai/generate-image', { prompt });
    return response.data.data.imageUrl;
  } catch (error) {
    console.error('Generate image error:', error);
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      throw new Error('Недостаточно кредитов для генерации изображения');
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
      throw new Error('Недостаточно кредитов для генерации тегов');
    }
    throw error;
  }
};

// Publishing
export const publishContent = async (params: PublishParams): Promise<PublishResult> => {
  try {
    // Fetch channel info to get botToken
    const channels = await fetchChannels();
    console.log('channels', channels);
    console.log('params', params);
    
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
        // Store scheduled post in the database
        await api.post('/scheduled-posts', {
          channelId: params.channelId,
          text: params.text,
          imageUrl: params.imageUrl,
          imageUrls: params.imageUrls || [],
          tags: params.tags,
          scheduledDate: params.scheduledDate.toISOString()
        });
        
        return {
          success: true,
          message: `scheduled_success:${channel.title}:${params.scheduledDate.toLocaleString()}`
        };
      } catch (error) {
        console.error('Error scheduling post:', error);
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

    console.log('channel123', channel);
    
    // Prepare chat_id - if it looks like a username without @, add it
    let chatId = channel.chatId || channel.id;  // First try to use chatId if exists
    if (!chatId) {
      // If no chatId, use title and prefix with @ if it's a username
      chatId = channel.title;
      if (chatId && !chatId.startsWith('@') && !chatId.match(/^-?\d+$/)) {
        chatId = '@' + chatId;
      }
    }
    
    // Check for multiple images
    if (params.imageUrls && params.imageUrls.length > 0) {
      // Use Telegram's Media Group API for multiple images
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
        result = await fetch(`https://api.telegram.org/bot${channel.botToken}/sendMediaGroup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            media: media
          })
        });
      } else {
        // Fallback to sending a text message if no images
        result = await fetch(`https://api.telegram.org/bot${channel.botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: messageText,
            parse_mode: 'HTML'
          })
        });
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
      
      // Check for URLs from our own API as well
      if (photoUrl.includes('/api/upload/image') || photoUrl.includes('/uploads/')) {
        try {
          // For Telegram, we need to make sure the image is directly accessible
          console.log('Image is from our own server:', photoUrl);
        } catch (error) {
          console.error('Error preparing image for Telegram:', error);
        }
      }
      
      // Log the details for debugging
      console.log('Sending photo to Telegram with:', {
        chat_id: chatId,
        photo: photoUrl
      });
      
      result = await fetch(`https://api.telegram.org/bot${channel.botToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: photoUrl,
          caption: messageText,
          parse_mode: 'HTML'
        })
      });
    } else {
      // Otherwise just send a text message
      result = await fetch(`https://api.telegram.org/bot${channel.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: 'HTML'
        })
      });
    }
    
    const data = await result.json();
    
    if (!result.ok) {
      console.error('Telegram API error:', data);
      throw new Error(data.description || 'error_publishing');
    }
    
    return {
      success: true,
      message: `publish_success:${channel.title}`
    };
  } catch (error) {
    console.error('Publish error:', error);
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

export const deleteScheduledPost = async (postId: string) => {
  try {
    const response = await api.delete(`/scheduled-posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting scheduled post:', error);
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

export const publishScheduledPost = async (postId: string) => {
  try {
    const response = await api.post(`/scheduled-posts/${postId}/publish`);
    return response.data;
  } catch (error) {
    console.error('Error publishing scheduled post:', error);
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