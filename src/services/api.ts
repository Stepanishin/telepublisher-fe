import axios from 'axios';
import { Channel, PublishParams, PublishResult, CreditInfo, SubscriptionType } from '../types';
import { TelegramUser } from 'react-telegram-login';
import { 
  generateText as mockGenerateText,
  generateImage as mockGenerateImage,
  generateTags as mockGenerateTags
} from '../mocks/api';

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
    return response.data.data;
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

// Content generation
export const generateText = async (prompt: string): Promise<string> => {
  try {
    return await mockGenerateText(prompt);
  } catch (error) {
    console.error('Generate text error:', error);
    throw error;
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    return await mockGenerateImage(prompt);
  } catch (error) {
    console.error('Generate image error:', error);
    throw error;
  }
};

export const generateTags = async (text: string): Promise<string[]> => {
  try {
    return await mockGenerateTags(text);
  } catch (error) {
    console.error('Generate tags error:', error);
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