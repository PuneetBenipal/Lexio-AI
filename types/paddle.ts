export interface SubscriptionData {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'paused' | 'trialing';
  customerId: string;
  priceId: string;
  planName: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
}

export interface CheckoutData {
  items: Array<{
    priceId: string;
    quantity: number;
  }>;
  customData?: {
    userId: string;
    [key: string]: any;
  };
  customer?: {
    email?: string;
    address?: {
      countryCode: string;
    };
  };
}

export interface PaddleEventData {
  eventType: string;
  eventId: string;
  customerId?: string;
  subscriptionId?: string;
  data: any;
}

export interface UserSubscription {
  userId: string;
  subscriptionId: string;
  customerId: string;
  status: SubscriptionData['status'];
  priceId: string;
  planName: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}