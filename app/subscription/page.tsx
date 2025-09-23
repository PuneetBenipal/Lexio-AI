"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import { paddleConfig, PlanType } from "@/lib/paddle-config";
import Link from "next/link";

export default function SubscriptionPage() {
  const userProfile = useQuery(api.subscriptions.getUserProfile);
  const subscriptionHistory = useQuery(api.subscriptions.getSubscriptionHistory);
  const cancelSubscription = useMutation(api.subscriptions.cancelSubscription);

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading your subscription...</p>
        </div>
      </div>
    );
  }

  const { user, subscription } = userProfile;

  // Determine current plan
  let currentPlan: { name: string; type: PlanType } | null = null;
  if (subscription?.priceId) {
    const planEntry = Object.entries(paddleConfig.plans).find(
      ([, plan]) => plan.priceId === subscription.priceId
    );
    if (planEntry) {
      currentPlan = {
        name: planEntry[1].name,
        type: planEntry[0] as PlanType,
      };
    }
  }

  const handleCancelSubscription = async (cancelAtPeriodEnd: boolean = true) => {
    if (!subscription?.subscriptionId) return;

    try {
      await cancelSubscription({
        subscriptionId: subscription.subscriptionId,
        cancelAtPeriodEnd,
      });
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: "bg-green-100 text-green-800",
      trialing: "bg-blue-100 text-blue-800",
      canceled: "bg-red-100 text-red-800",
      past_due: "bg-yellow-100 text-yellow-800",
      paused: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your subscription and billing information
          </p>
        </div>

        {/* Current Subscription */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {currentPlan?.name || "Unknown Plan"}
                    </h3>
                    <p className="text-muted-foreground">
                      {subscription.status === "trialing" ? "Free Trial" : "Active Subscription"}
                    </p>
                  </div>
                  {getStatusBadge(subscription.status)}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Current Period</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                      </p>
                    </div>
                  </div>

                  {subscription.trialEnd && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Trial Ends</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(subscription.trialEnd)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {subscription.cancelAtPeriodEnd && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your subscription is set to cancel at the end of the current billing period on{" "}
                      {formatDate(subscription.currentPeriodEnd)}.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  {subscription.status === "active" && !subscription.cancelAtPeriodEnd && (
                    <Button
                      variant="destructive"
                      onClick={() => handleCancelSubscription(true)}
                    >
                      Cancel at Period End
                    </Button>
                  )}
                  
                  {subscription.cancelAtPeriodEnd && (
                    <Button
                      variant="outline"
                      onClick={() => handleCancelSubscription(false)}
                    >
                      Resume Subscription
                    </Button>
                  )}
                  
                  <Button asChild variant="outline">
                    <Link href="/pricing">Change Plan</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You don't have an active subscription.
                </p>
                <Button asChild>
                  <Link href="/pricing">Choose a Plan</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Information */}
        {user && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Usage This Month</CardTitle>
              <CardDescription>
                Track your AI token usage and remaining quota
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Tokens Used</span>
                    <span>{user.tokensUsed.toLocaleString()} / {user.tokensLimit.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min((user.tokensUsed / user.tokensLimit) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Usage resets on {formatDate(user.lastResetAt + 30 * 24 * 60 * 60 * 1000)} (monthly)
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription History */}
        {subscriptionHistory && subscriptionHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription History</CardTitle>
              <CardDescription>
                View your past subscriptions and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptionHistory.map((sub) => {
                    const planEntry = Object.entries(paddleConfig.plans).find(
                      ([, plan]) => plan.priceId === sub.priceId
                    );
                    const planName = planEntry ? planEntry[1].name : "Unknown Plan";

                    return (
                      <TableRow key={sub._id}>
                        <TableCell className="font-medium">{planName}</TableCell>
                        <TableCell>{getStatusBadge(sub.status)}</TableCell>
                        <TableCell>
                          {formatDate(sub.currentPeriodStart)} - {formatDate(sub.currentPeriodEnd)}
                        </TableCell>
                        <TableCell>{formatDate(sub.createdAt)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}