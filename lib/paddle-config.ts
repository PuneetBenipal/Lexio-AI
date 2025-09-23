export const paddleConfig = {
  // Paddle environment configuration
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  clientSideToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_SIDE_TOKEN!,
  
  // Pricing plans - replace with your actual Paddle price IDs
  plans: {
    basic: {
      priceId: process.env.NEXT_PUBLIC_PADDLE_BASIC_PRICE_ID!,
      name: 'Basic Plan',
      price: '$9.99/month',
      features: [
        '10,000 AI tokens per month',
        'Basic chat support',
        'Standard response time',
      ],
    },
    pro: {
      priceId: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID!,
      name: 'Pro Plan',
      price: '$19.99/month',
      features: [
        '50,000 AI tokens per month',
        'Priority chat support',
        'Faster response time',
        'Advanced analytics',
      ],
    },
    enterprise: {
      priceId: process.env.NEXT_PUBLIC_PADDLE_ENTERPRISE_PRICE_ID!,
      name: 'Enterprise Plan',
      price: '$49.99/month',
      features: [
        'Unlimited AI tokens',
        '24/7 phone support',
        'Instant responses',
        'Custom integrations',
        'Dedicated account manager',
      ],
    },
  },
} as const;

export type PlanType = keyof typeof paddleConfig.plans;