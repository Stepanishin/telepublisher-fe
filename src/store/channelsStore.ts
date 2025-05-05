import { create } from 'zustand';
import { Channel } from '../types';
import { fetchChannels, addChannel, updateChannel as apiUpdateChannel, deleteChannel as apiDeleteChannel } from '../services/api';

interface ChannelsState {
  channels: Channel[];
  isLoading: boolean;
  error: string | null;
  fetchChannels: () => Promise<void>;
  addChannel: (params: { username: string; title: string; botToken?: string }) => Promise<void>;
  updateChannel: (channelId: string, params: { title?: string; botToken?: string }) => Promise<void>;
  deleteChannel: (channelId: string) => Promise<void>;
}

export const useChannelsStore = create<ChannelsState>((set, get) => ({
  channels: [],
  isLoading: false,
  error: null,
  
  fetchChannels: async () => {
    set({ isLoading: true, error: null });
    try {
      const channels = await fetchChannels();
      set({ channels, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch channels', 
        isLoading: false 
      });
    }
  },
  
  addChannel: async (params: { username: string; botToken?: string }) => {
    set({ isLoading: true, error: null });
    try {
      const newChannel = await addChannel(params);
      const currentChannels = get().channels;
      set({ 
        channels: [...currentChannels, newChannel], 
        isLoading: false 
      });
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
        channels: currentChannels.filter(channel => channel.id !== channelId),
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete channel', 
        isLoading: false 
      });
      throw error;
    }
  }
}));