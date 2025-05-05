export interface TelegramUser {
  telegramId: string;
  username: string;
  photoUrl?: string;
}

export enum SubscriptionType {
  FREE = 'free',
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  BUSINESS = 'business'
}

export interface Subscription {
  type: SubscriptionType;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
}

export interface CreditInfo {
  currentCredits: number;
  totalUsed: number;
  maxCredits: number;
  subscriptionType: SubscriptionType;
  resetDate: Date;
  isActive: boolean;
}

export interface AIOperationCost {
  operationType: string;
  cost: number;
}

export interface Channel {
  id: string;
  _id?: string;
  username: string;
  title: string;
  botToken?: string;
}

export interface PublishParams {
  channelId: string;
  text: string;
  imageUrl: string;
  tags: string[];
}

export interface PublishResult {
  success: boolean;
  message: string;
}

export interface GeneratedContent {
  text: string;
  imageUrl: string;
  tags: string[];
}