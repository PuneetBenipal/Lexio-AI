"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Authenticated>
        <UserButton />
        <Content />
      </Authenticated>
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
    </>
  );
}

function Content() {
  const messages = useQuery(api.messages.getForCurrentUser);
  const userProfile = useQuery(api.subscriptions.getUserProfile);
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight mb-8">Welcome to Lexio AI</h1>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Your Account</h2>
              <p className="text-muted-foreground mb-4">
                Messages: {messages?.length || 0}
              </p>
              {userProfile?.user && (
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Subscription:</span>{" "}
                    {userProfile.user.subscriptionStatus === 'active' ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-muted-foreground">Free</span>
                    )}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Tokens:</span>{" "}
                    {userProfile.user.tokensUsed.toLocaleString()} / {userProfile.user.tokensLimit.toLocaleString()}
                  </p>
                </div>
              )}
              <div className="mt-4">
                <Button asChild variant="outline">
                  <Link href="/subscription">Manage Subscription</Link>
                </Button>
              </div>
            </div>
            
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Upgrade Your Plan</h2>
              <p className="text-muted-foreground mb-4">
                Get more AI tokens and premium features with our subscription plans.
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/pricing">View Pricing Plans</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
