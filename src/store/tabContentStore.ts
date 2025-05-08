import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the types for the saved state
interface SavedPostState {
  text: string;
  imageUrl: string;
  imageUrls: string[];
  tags: string[];
  selectedChannelIds: string[];
  scheduleType: 'now' | 'later';
  scheduledDate: string | null; // ISO string format
  useMultipleImages: boolean;
}

interface SavedPollState {
  question: string;
  options: { text: string }[];
  isAnonymous: boolean;
  allowsMultipleAnswers: boolean;
  selectedChannelIds: string[];
  scheduleType: 'now' | 'later';
  scheduledDate: string | null; // ISO string format
}

// Store state interface
interface TabContentState {
  postState: SavedPostState;
  pollState: SavedPollState;
  savePostState: (state: Partial<SavedPostState>) => void;
  savePollState: (state: Partial<SavedPollState>) => void;
  clearPostState: () => void;
  clearPollState: () => void;
}

// Initial states
const initialPostState: SavedPostState = {
  text: '',
  imageUrl: '',
  imageUrls: [],
  tags: [],
  selectedChannelIds: [],
  scheduleType: 'now',
  scheduledDate: null,
  useMultipleImages: false
};

const initialPollState: SavedPollState = {
  question: '',
  options: [{ text: '' }, { text: '' }],
  isAnonymous: true,
  allowsMultipleAnswers: false,
  selectedChannelIds: [],
  scheduleType: 'now',
  scheduledDate: null
};

// Create the store with persistence
export const useTabContentStore = create<TabContentState>()(
  persist(
    (set, get) => ({
      postState: initialPostState,
      pollState: initialPollState,
      
      savePostState: (state: Partial<SavedPostState>) => {
        set({ 
          postState: { 
            ...get().postState, 
            ...state 
          } 
        });
      },
      
      savePollState: (state: Partial<SavedPollState>) => {
        set({ 
          pollState: { 
            ...get().pollState, 
            ...state 
          } 
        });
      },
      
      clearPostState: () => {
        set({ postState: initialPostState });
      },
      
      clearPollState: () => {
        set({ pollState: initialPollState });
      }
    }),
    {
      name: 'tab-content-storage', // localStorage key
    }
  )
); 