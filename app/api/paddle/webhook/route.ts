import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// You'll need to add these to your environment variables
const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET;

interface PaddleWebhookEvent {
  event_type: string;
  data: {
    id: string;
    status?: string;
    custom_data?: {
      userId?: string;
    };
    customer_id?: string;
    subscription_id?: string;
    items?: Array<{
      price: {
        id: string;
      };
    }>;
    billed_at?: string;
    next_billed_at?: string;
  };
}

function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('paddle-signature') || '';
    
    // Verify webhook signature
    if (!PADDLE_WEBHOOK_SECRET || !verifyWebhookSignature(body, signature, PADDLE_WEBHOOK_SECRET)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event: PaddleWebhookEvent = JSON.parse(body);
    console.log('Received Paddle webhook:', event.event_type);

    // Handle different event types
    switch (event.event_type) {
      case 'subscription.created':
        await handleSubscriptionCreated(event);
        break;
      
      case 'subscription.updated':
        await handleSubscriptionUpdated(event);
        break;
      
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event);
        break;
      
      case 'subscription.paused':
        await handleSubscriptionPaused(event);
        break;
      
      case 'subscription.resumed':
        await handleSubscriptionResumed(event);
        break;
      
      case 'transaction.completed':
        await handleTransactionCompleted(event);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.event_type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(event: PaddleWebhookEvent) {
  console.log('Processing subscription created:', event.data.id);
  
  // Here you would typically:
  // 1. Extract user ID from custom_data
  // 2. Update user's subscription status in your database (Convex)
  // 3. Send confirmation email
  
  const userId = event.data.custom_data?.userId;
  const subscriptionId = event.data.id;
  const customerId = event.data.customer_id;
  const priceId = event.data.items?.[0]?.price.id;
  
  if (userId && subscriptionId && customerId && priceId) {
    // TODO: Update Convex database with subscription data
    console.log('Subscription created for user:', userId);
  }
}

async function handleSubscriptionUpdated(event: PaddleWebhookEvent) {
  console.log('Processing subscription updated:', event.data.id);
  
  const subscriptionId = event.data.id;
  const status = event.data.status;
  
  if (subscriptionId && status) {
    // TODO: Update subscription status in Convex
    console.log('Subscription updated:', subscriptionId, status);
  }
}

async function handleSubscriptionCancelled(event: PaddleWebhookEvent) {
  console.log('Processing subscription cancelled:', event.data.id);
  
  const subscriptionId = event.data.id;
  
  if (subscriptionId) {
    // TODO: Update subscription status to cancelled in Convex
    console.log('Subscription cancelled:', subscriptionId);
  }
}

async function handleSubscriptionPaused(event: PaddleWebhookEvent) {
  console.log('Processing subscription paused:', event.data.id);
  
  const subscriptionId = event.data.id;
  
  if (subscriptionId) {
    // TODO: Update subscription status to paused in Convex
    console.log('Subscription paused:', subscriptionId);
  }
}

async function handleSubscriptionResumed(event: PaddleWebhookEvent) {
  console.log('Processing subscription resumed:', event.data.id);
  
  const subscriptionId = event.data.id;
  
  if (subscriptionId) {
    // TODO: Update subscription status to active in Convex
    console.log('Subscription resumed:', subscriptionId);
  }
}

async function handleTransactionCompleted(event: PaddleWebhookEvent) {
  console.log('Processing transaction completed:', event.data.id);
  
  // Handle successful payments
  const subscriptionId = event.data.subscription_id;
  
  if (subscriptionId) {
    // TODO: Update subscription billing info in Convex
    console.log('Transaction completed for subscription:', subscriptionId);
  }
}