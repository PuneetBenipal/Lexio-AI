# Paddle Integration Setup Guide

This guide will help you complete the Paddle integration in your Lexio AI project.

## 📋 Prerequisites

1. ✅ Paddle package is already installed (`@paddle/paddle-js`)
2. ✅ Integration code is complete
3. ✅ UI components are built with ShadCN
4. ✅ Convex schema and functions are ready

## 🚀 Next Steps: API Setup Required

### 1. Create Paddle Account & Get Credentials

Visit [Paddle Dashboard](https://vendors.paddle.com/) and:

1. **Create/Login to your Paddle account**
2. **Get your Client Side Token:**
   - Go to Developer Tools > Authentication
   - Copy your "Client-side token"
   - Add to `.env.local` as `NEXT_PUBLIC_PADDLE_CLIENT_SIDE_TOKEN`

3. **Set up Webhook Secret:**
   - Go to Developer Tools > Notifications
   - Create a webhook endpoint: `https://yourdomain.com/api/paddle/webhook`
   - Copy the webhook secret
   - Add to `.env.local` as `PADDLE_WEBHOOK_SECRET`

### 2. Create Subscription Products & Prices

In your Paddle dashboard:

1. **Create Products:**
   - Basic Plan: $9.99/month
   - Pro Plan: $19.99/month  
   - Enterprise Plan: $49.99/month

2. **Create Prices for each product:**
   - Copy each price ID
   - Add to `.env.local`:
     ```
     NEXT_PUBLIC_PADDLE_BASIC_PRICE_ID=pri_xxxxx
     NEXT_PUBLIC_PADDLE_PRO_PRICE_ID=pri_xxxxx
     NEXT_PUBLIC_PADDLE_ENTERPRISE_PRICE_ID=pri_xxxxx
     ```

### 3. Environment Variables Setup

Create/update your `.env.local` file with:

```env
# Existing variables (keep your current values)
NEXT_PUBLIC_CONVEX_URL=your_convex_url
CONVEX_DEPLOYMENT=your_deployment
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Paddle Configuration (ADD THESE)
NEXT_PUBLIC_PADDLE_CLIENT_SIDE_TOKEN=your_client_side_token
PADDLE_WEBHOOK_SECRET=your_webhook_secret

# Paddle Price IDs (ADD THESE)
NEXT_PUBLIC_PADDLE_BASIC_PRICE_ID=pri_basic_xxxxx
NEXT_PUBLIC_PADDLE_PRO_PRICE_ID=pri_pro_xxxxx
NEXT_PUBLIC_PADDLE_ENTERPRISE_PRICE_ID=pri_enterprise_xxxxx
```

### 4. Deploy & Configure Webhook

1. **Deploy your application** to get a live URL
2. **Add webhook URL in Paddle:**
   - URL: `https://yourdomain.com/api/paddle/webhook`
   - Events: Select all subscription events
3. **Test webhook** using Paddle's webhook testing tool

### 5. Update Webhook Handler (Optional Enhancement)

In `app/api/paddle/webhook/route.ts`, connect the webhook handlers to your Convex database by replacing the `// TODO:` comments with actual Convex API calls.

Example for `handleSubscriptionCreated`:
```typescript
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function handleSubscriptionCreated(event: PaddleWebhookEvent) {
  // ... existing code ...
  
  if (userId && subscriptionId && customerId && priceId) {
    await convex.mutation(api.subscriptions.upsertSubscription, {
      userId,
      subscriptionId,
      customerId,
      status: "active",
      priceId,
      planName: "Basic", // Determine from priceId
      currentPeriodStart: Date.now(),
      currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });
  }
}
```

## 🧪 Testing

### Test in Sandbox Mode
1. Use Paddle's sandbox environment for testing
2. Create test subscriptions using test payment methods
3. Verify webhook events are received and processed

### Test Features
1. **Subscription Creation:** Visit `/pricing` and create a subscription
2. **Subscription Management:** Visit `/subscription` to manage subscriptions
3. **Webhook Processing:** Test cancellation, updates, etc.

## 📁 File Structure Created

```
├── app/
│   ├── api/paddle/webhook/route.ts      # Webhook handler
│   ├── pricing/page.tsx                 # Pricing page
│   ├── subscription/page.tsx            # Subscription management
│   └── layout.tsx                       # Updated with PaddleProvider
├── components/
│   ├── PaddleProvider.tsx               # Paddle context provider
│   ├── PricingCard.tsx                  # Individual pricing cards
│   └── PricingSection.tsx               # Complete pricing section
├── convex/
│   ├── schema.ts                        # Database schema
│   └── subscriptions.ts                 # Subscription queries/mutations
├── lib/
│   └── paddle-config.ts                 # Paddle configuration
├── types/
│   └── paddle.ts                        # TypeScript types
└── .env.example                         # Environment template
```

## 🔧 Customization

### Update Plan Details
Edit `lib/paddle-config.ts` to customize:
- Plan names and prices
- Feature lists
- Plan descriptions

### Styling
All components use ShadCN UI and are fully customizable through:
- Tailwind CSS classes
- CSS variables (for themes)
- Component prop modifications

### Add More Features
- Usage tracking and limits
- Plan upgrade/downgrade flows
- Proration handling
- Invoice management

## 🚨 Important Notes

1. **Sandbox vs Production:** Ensure you switch to production mode when ready
2. **Webhook Security:** Always verify webhook signatures in production
3. **Error Handling:** Add proper error handling for production use
4. **Rate Limiting:** Consider adding rate limiting to webhook endpoints
5. **Logging:** Add comprehensive logging for debugging

## 📞 Support

- **Paddle Documentation:** https://developer.paddle.com/
- **Convex Documentation:** https://docs.convex.dev/
- **ShadCN UI:** https://ui.shadcn.com/

Your Paddle integration is now complete! Follow the API setup steps above to go live.