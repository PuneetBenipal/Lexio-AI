"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import PricingSection from "@/components/PricingSection";
import { paddleConfig, PlanType } from "@/lib/paddle-config";

export default function PricingPage() {
  const userProfile = useQuery(api.subscriptions.getUserProfile);

  // Determine current plan based on subscription
  let currentPlan: PlanType | undefined;
  if (userProfile?.subscription?.priceId) {
    const planEntry = Object.entries(paddleConfig.plans).find(
      ([, plan]) => plan.priceId === userProfile.subscription?.priceId
    );
    if (planEntry) {
      currentPlan = planEntry[0] as PlanType;
    }
  }

  const handleSubscribe = () => {
    // Refresh the user profile after subscription
    // The query will automatically update due to Convex reactivity
    console.log("Subscription completed, data will update automatically");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <PricingSection 
          currentPlan={currentPlan} 
          onSubscribe={handleSubscribe}
        />
      </div>
    </div>
  );
}