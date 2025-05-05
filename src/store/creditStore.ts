import { create } from 'zustand';
import { CreditInfo, SubscriptionType } from '../types';
import { getCreditInfo, useCredits as apiUseCredits, updateSubscription } from '../services/api';

interface CreditState {
  creditInfo: CreditInfo | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchCreditInfo: () => Promise<void>;
  useAICredits: (operationType: string, quantity?: number) => Promise<boolean>;
  upgradeSubscription: (subscriptionType: SubscriptionType, paymentId?: string) => Promise<boolean>;
}

const defaultCreditInfo: CreditInfo = {
  currentCredits: 0,
  totalUsed: 0,
  maxCredits: 50,
  subscriptionType: SubscriptionType.FREE,
  resetDate: new Date(),
  isActive: true
};

export const useCreditStore = create<CreditState>((set, get) => ({
  creditInfo: null,
  isLoading: false,
  error: null,
  
  fetchCreditInfo: async () => {
    set({ isLoading: true });
    try {
      const info = await getCreditInfo();
      // Convert string dates to Date objects
      const creditInfo: CreditInfo = {
        ...info,
        resetDate: info.resetDate ? new Date(info.resetDate) : new Date(),
      };
      
      set({ creditInfo, isLoading: false, error: null });
    } catch (error) {
      console.error('Error fetching credit info:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load credit information',
        creditInfo: defaultCreditInfo
      });
    }
  },
  
  useAICredits: async (operationType: string, quantity: number = 1) => {
    set({ isLoading: true });
    try {
      const result = await apiUseCredits(operationType, quantity);
      
      // Update the credit info with the new remaining credits
      const { creditInfo } = get();
      if (creditInfo) {
        set({ 
          creditInfo: { 
            ...creditInfo, 
            currentCredits: result.remainingCredits,
            totalUsed: creditInfo.totalUsed + (quantity || 1)
          },
          isLoading: false,
          error: null
        });
      } else {
        // If we don't have credit info yet, fetch it
        await get().fetchCreditInfo();
      }
      
      return true;
    } catch (error) {
      console.error('Error using AI credits:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to use credits'
      });
      return false;
    }
  },
  
  upgradeSubscription: async (subscriptionType: SubscriptionType, paymentId?: string) => {
    set({ isLoading: true });
    try {
      const updatedInfo = await updateSubscription(subscriptionType, paymentId);
      
      // Convert string dates to Date objects
      const creditInfo: CreditInfo = {
        ...updatedInfo,
        resetDate: updatedInfo.resetDate ? new Date(updatedInfo.resetDate) : new Date(),
      };
      
      set({ creditInfo, isLoading: false, error: null });
      return true;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to upgrade subscription'
      });
      return false;
    }
  }
})); 