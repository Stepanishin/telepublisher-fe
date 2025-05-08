import { create } from 'zustand';
import { GeneratedContent, PublishParams, PublishResult } from '../types';
import { generateText, generateImage, generateTags, publishContent } from '../services/api';

interface ContentState {
  content: GeneratedContent;
  generatedContent: GeneratedContent;
  isGenerating: boolean;
  isPublishing: boolean;
  publishResult: PublishResult | null;
  error: string | null;
  setContent: (content: Partial<GeneratedContent>) => void;
  resetContent: () => void;
  generateText: (prompt: string) => Promise<void>;
  generateImage: (prompt: string) => Promise<void>;
  generateTags: (text: string) => Promise<void>;
  transferGeneratedText: () => void;
  transferGeneratedImage: () => void;
  transferGeneratedTags: () => void;
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
  generatedContent: { ...initialContent },
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
        generatedContent: { ...get().generatedContent, text }, 
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
        generatedContent: { ...get().generatedContent, imageUrl }, 
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
        generatedContent: { ...get().generatedContent, tags }, 
        isGenerating: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to generate tags', 
        isGenerating: false 
      });
    }
  },
  
  transferGeneratedText: () => {
    const { generatedContent } = get();
    if (generatedContent.text) {
      set({
        content: { ...get().content, text: generatedContent.text }
      });
    }
  },
  
  transferGeneratedImage: () => {
    const { generatedContent } = get();
    if (generatedContent.imageUrl) {
      set({
        content: { ...get().content, imageUrl: generatedContent.imageUrl }
      });
    }
  },
  
  transferGeneratedTags: () => {
    const { generatedContent } = get();
    if (generatedContent.tags.length > 0) {
      set({
        content: { ...get().content, tags: generatedContent.tags }
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