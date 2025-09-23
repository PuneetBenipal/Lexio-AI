"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import { paddleConfig } from '@/lib/paddle-config';
import { CheckoutData } from '@/types/paddle';
import { useUser } from '@clerk/nextjs';

interface PaddleCheckoutOptions {
  items: Array<{
    priceId: string;
    quantity: number;
  }>;
  customData?: {
    userId: string;
    [key: string]: unknown;
  };
  customer?: {
    email: string;
  };
  settings?: {
    successUrl: string;
    allowLogout: boolean;
  };
}

interface PaddleContextType {
  paddle: Paddle | null;
  isLoading: boolean;
  error: string | null;
  openCheckout: (checkoutData: CheckoutData) => Promise<void>;
}

const PaddleContext = createContext<PaddleContextType | undefined>(undefined);

export const usePaddle = () => {
  const context = useContext(PaddleContext);
  if (context === undefined) {
    throw new Error('usePaddle must be used within a PaddleProvider');
  }
  return context;
};

interface PaddleProviderProps {
  children: ReactNode;
}

export default function PaddleProvider({ children }: PaddleProviderProps) {
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    const initPaddle = async () => {
      try {
        if (!paddleConfig.clientSideToken) {
          throw new Error('Paddle client side token is not configured');
        }

        const paddleInstance = await initializePaddle({
          environment: paddleConfig.environment as 'sandbox' | 'production',
          token: paddleConfig.clientSideToken,
        });

        if (paddleInstance) {
          setPaddle(paddleInstance);
        } else {
          throw new Error('Failed to initialize Paddle');
        }
      } catch (err) {
        console.error('Paddle initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Paddle');
      } finally {
        setIsLoading(false);
      }
    };

    initPaddle();
  }, []);

  const openCheckout = async (checkoutData: CheckoutData) => {
    if (!paddle) {
      throw new Error('Paddle is not initialized');
    }

    if (!user) {
      throw new Error('User must be authenticated to make a purchase');
    }

    try {
      const checkoutOptions: PaddleCheckoutOptions = {
        items: checkoutData.items,
        customData: {
          ...checkoutData.customData,
          userId: user.id,
        },
        settings: {
          successUrl: `${window.location.origin}/subscription?success=true`,
          allowLogout: false,
        },
      };

      // Add customer email if available
      if (user.primaryEmailAddress?.emailAddress) {
        checkoutOptions.customer = {
          email: user.primaryEmailAddress.emailAddress,
        };
      }

      await paddle.Checkout.open(checkoutOptions as Parameters<typeof paddle.Checkout.open>[0]);
    } catch (err) {
      console.error('Checkout error:', err);
      throw err;
    }
  };

  const contextValue: PaddleContextType = {
    paddle,
    isLoading,
    error,
    openCheckout,
  };

  return (
    <PaddleContext.Provider value={contextValue}>
      {children}
    </PaddleContext.Provider>
  );
}