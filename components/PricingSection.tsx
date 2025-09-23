"use client";

import React from 'react';
import PricingCard from './PricingCard';
import { PlanType } from '@/lib/paddle-config';

interface PricingSectionProps {
  currentPlan?: PlanType;
  onSubscribe?: () => void;
}

export default function PricingSection({ currentPlan, onSubscribe }: PricingSectionProps) {
  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold tracking-tight mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan for your AI needs. Upgrade or downgrade at any time.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <PricingCard 
          plan="basic"
          currentPlan={currentPlan === 'basic'}
          onSubscribe={onSubscribe}
        />
        <PricingCard 
          plan="pro"
          isPopular
          currentPlan={currentPlan === 'pro'}
          onSubscribe={onSubscribe}
        />
        <PricingCard 
          plan="enterprise"
          currentPlan={currentPlan === 'enterprise'}
          onSubscribe={onSubscribe}
        />
      </div>

      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground">
          All plans include a 14-day free trial. No credit card required to start.
        </p>
      </div>
    </section>
  );
}