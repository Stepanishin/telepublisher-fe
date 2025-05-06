import { create } from 'zustand';
import { Channel } from '../types';
import { 
  fetchChannels, 
  addChannel, 
  updateChannel as apiUpdateChannel, 
  deleteChannel as apiDeleteChannel,
  getChannelLimits
} from '../services/api';

interface ChannelLimits {
  allowed: boolean;
  limit: number;  // -1 represents unlimited
  current: number;
}

interface ChannelsState {
  channels: Channel[];
  isLoading: boolean;
  error: string | null;
  channelLimits: ChannelLimits | null;
  fetchChannels: () => Promise<void>;
  fetchChannelLimits: () => Promise<void>;
  addChannel: (params: { username: string; title: string; botToken?: string }) => Promise<void>;
  updateChannel: (channelId: string, params: { title?: string; botToken?: string }) => Promise<void>;
  deleteChannel: (channelId: string) => Promise<void>;
}

export const useChannelsStore = create<ChannelsState>((set, get) => ({
  channels: [],
  isLoading: false,
  error: null,
  channelLimits: null,
  
  fetchChannels: async () => {
    set({ isLoading: true, error: null });
    try {
      const channels = await fetchChannels();
      set({ channels, isLoading: false });
      
      // After fetching channels, get updated limit info
      get().fetchChannelLimits();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch channels', 
        isLoading: false 
      });
    }
  },
  
  fetchChannelLimits: async () => {
    try {
      const limits = await getChannelLimits();
      set({ channelLimits: limits });
    } catch (error) {
      console.error('Error fetching channel limits:', error);
      // Don't update state on error for this non-critical functionality
    }
  },
  
  addChannel: async (params: { username: string; title: string; botToken?: string }) => {
    set({ isLoading: true, error: null });
    try {
      const newChannel = await addChannel(params);
      const currentChannels = get().channels;
      set({ 
        channels: [...currentChannels, newChannel], 
        isLoading: false 
      });
      
      // Update limits after adding a channel
      get().fetchChannelLimits();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add channel', 
        isLoading: false 
      });
      throw error;
    }
  },

  updateChannel: async (channelId: string, params: { title?: string; botToken?: string }) => {
    set({ isLoading: true, error: null });
    try {
      const updatedChannel = await apiUpdateChannel(channelId, params);
      const currentChannels = get().channels;
      set({ 
        channels: currentChannels.map(channel => 
          channel.id === channelId ? updatedChannel : channel
        ),
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update channel', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  deleteChannel: async (channelId: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiDeleteChannel(channelId);
      const currentChannels = get().channels;
      set({ 
        channels: currentChannels.filter(channel => 
          channel.id !== channelId
        ),
        isLoading: false 
      });
      
      // Update limits after deleting a channel
      get().fetchChannelLimits();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete channel', 
        isLoading: false 
      });
      throw error;
    }
  }
}));