import { create } from 'zustand';
import { GeneratedContent, PublishParams, PublishResult } from '../types';
import { generateText, generateImage, generateTags, publishContent } from '../services/api';

interface ContentState {
  content: GeneratedContent;
  isGenerating: boolean;
  isPublishing: boolean;
  publishResult: PublishResult | null;
  error: string | null;
  setContent: (content: Partial<GeneratedContent>) => void;
  resetContent: () => void;
  generateText: (prompt: string) => Promise<void>;
  generateImage: (prompt: string) => Promise<void>;
  generateTags: (text: string) => Promise<void>;
  publish: (params: PublishParams) => Promise<PublishResult>;
  resetPublishResult: () => void;
}

const initialContent: GeneratedContent = {
  text: '',
  imageUrl: '',
  imageUrls: [],
  tags: [],
};

export const useContentStore = create<ContentState>((set, get) => ({
  content: { ...initialContent },
  isGenerating: false,
  isPublishing: false,
  publishResult: null,
  error: null,
  
  setContent: (content: Partial<GeneratedContent>) => {
    set({ content: { ...get().content, ...content } });
  },
  
  resetContent: () => {
    set({ content: { ...initialContent } });
  },
  
  generateText: async (prompt: string) => {
    set({ isGenerating: true, error: null });
    try {
      const text = await generateText(prompt);
      set({ 
        content: { ...get().content, text }, 
        isGenerating: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to generate text', 
        isGenerating: false 
      });
    }
  },
  
  generateImage: async (prompt: string) => {
    set({ isGenerating: true, error: null });
    try {
      const imageUrl = await generateImage(prompt);
      set({ 
        content: { ...get().content, imageUrl }, 
        isGenerating: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to generate image', 
        isGenerating: false 
      });
    }
  },
  
  generateTags: async (text: string) => {
    set({ isGenerating: true, error: null });
    try {
      const tags = await generateTags(text);
      set({ 
        content: { ...get().content, tags }, 
        isGenerating: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to generate tags', 
        isGenerating: false 
      });
    }
  },
  
  publish: async (params: PublishParams) => {
    console.log('publish', params);
    set({ isPublishing: true, publishResult: null, error: null });
    try {
      const result = await publishContent(params);
      set({ publishResult: result, isPublishing: false });
      return result;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to publish content', 
        isPublishing: false 
      });
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to publish content'
      };
    }
  },
  
  resetPublishResult: () => {
    set({ publishResult: null });
  }
}));