export interface TelegramUser {
  telegramId: string;
  username: string;
  photoUrl?: string;
}

export enum SubscriptionType {
  FREE = 'free',
  BASIC = 'basic',
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
  downgradeOnExpiry?: boolean;
  endDate?: Date;
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
  imageUrls?: string[];
  tags: string[];
  scheduledDate?: Date | null;
}

export interface PollOption {
  text: string;
}

export interface PollParams {
  channelId: string;
  question: string;
  options: PollOption[];
  isAnonymous?: boolean;
  allowsMultipleAnswers?: boolean;
  scheduledDate?: Date | null;
}

export interface PublishResult {
  success: boolean;
  message: string;
}

export interface ScheduledPostUpdate {
  channelId: string;
  text: string;
  imageUrl?: string;
  imageUrls?: string[];
  tags: string[];
  scheduledDate: Date | null;
}

export interface GeneratedContent {
  text: string;
  imageUrl: string;
  imageUrls: string[];
  tags: string[];
}

export interface PostimagesResponse {
  status: string;
  id: string;
  name: string;
  url: string;
  direct_url: string;
  width: number;
  height: number;
  filesize: number;
  adult: string;
  thumb_url: string;
  thumb: string;
  medium: string;
  avatar: string;
  delete_code: string;
  size_text: string;
  timestamp: number;
}