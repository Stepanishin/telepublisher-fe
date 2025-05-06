import axios from 'axios';
import { Channel, PublishParams, PublishResult, CreditInfo, SubscriptionType } from '../types';
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
    const response = await api.get('/users/profile');
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
    console.error('Error getting channels:', error);
    throw error;
  }
};

export const addChannel = async (channelData: { username: string; botToken?: string }) => {
  try {
    const response = await api.post('/channels', channelData);
    return response.data.channel;
  } catch (error) {
    console.error('Error adding channel:', error);
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
    console.error('Generate text error:', error);
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      throw new Error('Недостаточно кредитов для генерации текста');
    }
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
      throw new Error('Канал не найден или отсутствует токен бота');
    }
    
    let messageText = params.text;
    
    // Append tags to the message if available
    if (params.tags && params.tags.length > 0) {
      messageText += '\n\n' + params.tags.join(' ');
    }
    
    let result;

    console.log('channel123', channel);
    
    // If there's an image, send a photo with caption
    if (params.imageUrl) {
      result = await fetch(`https://api.telegram.org/bot${channel.botToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: channel.title,
          photo: params.imageUrl,
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
          chat_id: channel.title,
          text: messageText,
          parse_mode: 'HTML'
        })
      });
    }
    
    const data = await result.json();
    
    if (!result.ok) {
      throw new Error(data.description || 'Ошибка публикации');
    }
    
    return {
      success: true,
      message: `Успешно опубликовано в канале ${channel.title}`
    };
  } catch (error) {
    console.error('Publish error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Ошибка публикации. Пожалуйста, попробуйте снова.'
    };
  }
};