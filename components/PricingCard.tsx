"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { usePaddle } from '@/components/PaddleProvider';
import { paddleConfig, PlanType } from '@/lib/paddle-config';

interface PricingCardProps {
  plan: PlanType;
  isPopular?: boolean;
  currentPlan?: boolean;
  onSubscribe?: () => void;
}

export default function PricingCard({ 
  plan, 
  isPopular = false, 
  currentPlan = false,
  onSubscribe 
}: PricingCardProps) {
  const { openCheckout, isLoading } = usePaddle();
  const planData = paddleConfig.plans[plan];

  const handleSubscribe = async () => {
    if (currentPlan) return;

    try {
      await openCheckout({
        items: [
          {
            priceId: planData.priceId,
            quantity: 1,
          },
        ],
      });
      onSubscribe?.();
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  return (
    <Card className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : 'border-border'} transition-all duration-300`}>
      {isPopular && (
        <Badge 
          variant="default" 
          className="absolute -top-2 left-1/2 transform -translate-x-1/2"
        >
          Most Popular
        </Badge>
      )}
      
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold">{planData.name}</CardTitle>
        <CardDescription className="text-3xl font-bold text-foreground">
          {planData.price}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {planData.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button 
          onClick={handleSubscribe}
          disabled={isLoading || currentPlan}
          className="w-full"
          variant={isPopular ? "default" : "outline"}
        >
          {currentPlan 
            ? "Current Plan" 
            : isLoading 
              ? "Loading..." 
              : "Subscribe Now"
          }
        </Button>
      </CardFooter>
    </Card>
  );
}