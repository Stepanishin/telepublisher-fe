import { create } from 'zustand';
import { PollOption, PollParams, PublishResult } from '../types';
import { publishPoll } from '../services/api';

interface PollState {
  poll: {
    question: string;
    options: PollOption[];
    isAnonymous: boolean;
    allowsMultipleAnswers: boolean;
  };
  isPublishing: boolean;
  publishResult: PublishResult | null;
  error: string | null;
  
  setQuestion: (question: string) => void;
  setOptions: (options: PollOption[]) => void;
  addOption: (text: string) => void;
  removeOption: (index: number) => void;
  updateOption: (index: number, text: string) => void;
  setIsAnonymous: (isAnonymous: boolean) => void;
  setAllowsMultipleAnswers: (allowsMultipleAnswers: boolean) => void;
  
  resetPoll: () => void;
  publishPoll: (channelId: string, scheduledDate?: Date | null) => Promise<PublishResult>;
  resetPublishResult: () => void;
}

const initialPoll = {
  question: '',
  options: [{ text: '' }, { text: '' }], // Start with two empty options
  isAnonymous: true,
  allowsMultipleAnswers: false,
};

export const usePollStore = create<PollState>((set, get) => ({
  poll: { ...initialPoll },
  isPublishing: false,
  publishResult: null,
  error: null,
  
  setQuestion: (question: string) => {
    set({ poll: { ...get().poll, question } });
  },
  
  setOptions: (options: PollOption[]) => {
    set({ poll: { ...get().poll, options } });
  },
  
  addOption: (text: string = '') => {
    const { options } = get().poll;
    set({ 
      poll: { 
        ...get().poll, 
        options: [...options, { text }] 
      } 
    });
  },
  
  removeOption: (index: number) => {
    const { options } = get().poll;
    if (options.length <= 2) return; // Telegram polls require at least 2 options
    
    set({ 
      poll: { 
        ...get().poll, 
        options: options.filter((_, i) => i !== index) 
      } 
    });
  },
  
  updateOption: (index: number, text: string) => {
    const { options } = get().poll;
    const newOptions = [...options];
    
    if (index >= 0 && index < newOptions.length) {
      newOptions[index] = { text };
      set({ 
        poll: { 
          ...get().poll, 
          options: newOptions 
        } 
      });
    }
  },
  
  setIsAnonymous: (isAnonymous: boolean) => {
    set({ poll: { ...get().poll, isAnonymous } });
  },
  
  setAllowsMultipleAnswers: (allowsMultipleAnswers: boolean) => {
    set({ poll: { ...get().poll, allowsMultipleAnswers } });
  },
  
  resetPoll: () => {
    set({ poll: { ...initialPoll } });
  },
  
  publishPoll: async (channelId: string, scheduledDate: Date | null = null) => {
    set({ isPublishing: true, publishResult: null, error: null });
    
    try {
      const { poll } = get();
      
      // Validate poll question and options
      if (!poll.question.trim()) {
        throw new Error('question_required');
      }
      
      // Make sure all options have text
      const hasEmptyOptions = poll.options.some(opt => !opt.text.trim());
      if (hasEmptyOptions) {
        throw new Error('options_required');
      }
      
      // Filter out any empty options (though we shouldn't have any at this point)
      const validOptions = poll.options.filter(opt => opt.text.trim());
      
      if (validOptions.length < 2) {
        throw new Error('min_two_options');
      }
      
      const params: PollParams = {
        channelId,
        question: poll.question,
        options: validOptions,
        isAnonymous: poll.isAnonymous,
        allowsMultipleAnswers: poll.allowsMultipleAnswers,
        scheduledDate
      };
      
      const result = await publishPoll(params);
      set({ publishResult: result, isPublishing: false });
      return result;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to publish poll', 
        isPublishing: false 
      });
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to publish poll'
      };
    }
  },
  
  resetPublishResult: () => {
    set({ publishResult: null });
  }
})); 