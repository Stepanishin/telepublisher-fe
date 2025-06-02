import { create } from 'zustand';
import { GeneratedContent, PublishParams, PublishResult, ScheduledPostUpdate } from '../types';
import { 
  generateText, 
  generateImage, 
  generateTags, 
  generateTextFromImage,
  generateImageFromImage,
  publishContent, 
  updateScheduledPost as apiUpdateScheduledPost 
} from '../services/api';

interface Content {
  text: string;
  imageUrl: string;
  imageUrls: string[];
  tags: string[];
  imagePosition?: 'top' | 'bottom';
  buttons?: { text: string; url: string }[];
}

interface ContentStore {
  content: Content;
  generatedContent: GeneratedContent;
  isGenerating: boolean;
  isPublishing: boolean;
  publishResult: PublishResult | null;
  error: string | null;
  setContent: (content: Partial<Content>) => void;
  clearContent: () => void;
  setPublishResult: (result: PublishResult | null) => void;
  generateText: (prompt: string) => Promise<void>;
  generateImage: (prompt: string) => Promise<void>;
  generateTags: (text: string) => Promise<void>;
  generateTextFromImage: (imageUrl: string, additionalPrompt?: string) => Promise<void>;
  generateImageFromImage: (imageUrl: string, prompt?: string) => Promise<void>;
  transferGeneratedText: () => void;
  transferGeneratedImage: () => void;
  transferGeneratedTags: () => void;
  publish: (params: PublishParams) => Promise<PublishResult>;
  resetPublishResult: () => void;
  updateScheduledPost: (postId: string, data: ScheduledPostUpdate) => Promise<PublishResult>;
}

const initialContent: Content = {
  text: '',
  imageUrl: '',
  imageUrls: [],
  tags: [],
  imagePosition: 'top',
  buttons: []
};

export const useContentStore = create<ContentStore>((set, get) => ({
  content: initialContent,
  generatedContent: { ...initialContent },
  isGenerating: false,
  isPublishing: false,
  publishResult: null,
  error: null,
  
  setContent: (newContent) => 
    set((state) => ({
      content: { ...state.content, ...newContent }
    })),
  
  clearContent: () => 
    set({ content: initialContent }),
  
  setPublishResult: (result: PublishResult | null) => {
    set({ publishResult: result });
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
  
  generateTextFromImage: async (imageUrl: string, additionalPrompt?: string) => {
    set({ isGenerating: true, error: null });
    try {
      const text = await generateTextFromImage(imageUrl, additionalPrompt);
      set({ 
        generatedContent: { ...get().generatedContent, text }, 
        isGenerating: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to generate text from image', 
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
  
  generateImageFromImage: async (imageUrl: string, prompt?: string) => {
    set({ isGenerating: true, error: null });
    try {
      const newImageUrl = await generateImageFromImage(imageUrl, prompt);
      set({ 
        generatedContent: { ...get().generatedContent, imageUrl: newImageUrl }, 
        isGenerating: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to generate image from reference', 
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
  },
  
  updateScheduledPost: async (postId: string, data: ScheduledPostUpdate) => {
    set({ isPublishing: true, publishResult: null, error: null });
    try {
      const result = await apiUpdateScheduledPost(postId, data);
      set({ publishResult: result, isPublishing: false });
      return result;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update scheduled post', 
        isPublishing: false 
      });
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update scheduled post'
      };
    }
  }
}));