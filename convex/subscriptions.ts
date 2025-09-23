import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";

// Query to get user's current subscription
export const getCurrentSubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => 
        q.or(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("status"), "trialing")
        )
      )
      .first();

    return subscription;
  },
});

// Query to get user's subscription history
export const getSubscriptionHistory = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return subscriptions;
  },
});

// Mutation to create or update subscription
export const upsertSubscription = mutation({
  args: {
    userId: v.string(),
    subscriptionId: v.string(),
    customerId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("paused"),
      v.literal("trialing")
    ),
    priceId: v.string(),
    planName: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    trialEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if subscription already exists
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_subscription", (q) => q.eq("subscriptionId", args.subscriptionId))
      .first();

    if (existing) {
      // Update existing subscription
      await ctx.db.patch(existing._id, {
        ...args,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd ?? false,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new subscription
      const subscriptionId = await ctx.db.insert("subscriptions", {
        ...args,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd ?? false,
        createdAt: now,
        updatedAt: now,
      });

      // Update user's subscription status
      await updateUserSubscriptionStatus(ctx, args.userId, args.status);
      
      return subscriptionId;
    }
  },
});

// Mutation to cancel subscription
export const cancelSubscription = mutation({
  args: {
    subscriptionId: v.string(),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_subscription", (q) => q.eq("subscriptionId", args.subscriptionId))
      .first();

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // Verify user owns this subscription
    if (subscription.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();
    const newStatus = args.cancelAtPeriodEnd ? "active" : "canceled";

    await ctx.db.patch(subscription._id, {
      status: newStatus,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd ?? true,
      updatedAt: now,
    });

    // Update user status if immediately canceled
    if (!args.cancelAtPeriodEnd) {
      await updateUserSubscriptionStatus(ctx, identity.subject, "canceled");
    }

    return subscription._id;
  },
});

// Helper function to update user subscription status
async function updateUserSubscriptionStatus(
  ctx: MutationCtx, 
  userId: string, 
  status: "active" | "canceled" | "past_due" | "paused" | "trialing"
) {
  let user = await ctx.db
    .query("users")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  const now = Date.now();
  const userStatus = status === "trialing" ? "active" : status;
  
  // Determine token limits based on status
  let tokensLimit = 0;
  if (userStatus === "active") {
    // This should be determined by the plan type, but for now set a default
    tokensLimit = 10000; // You'll want to make this dynamic based on plan
  }

  if (user) {
    await ctx.db.patch(user._id, {
      subscriptionStatus: userStatus,
      tokensLimit,
      updatedAt: now,
    });
  } else {
    // Create user record if it doesn't exist
    await ctx.db.insert("users", {
      userId,
      email: "", // This should be populated from Clerk
      subscriptionStatus: userStatus,
      tokensUsed: 0,
      tokensLimit,
      lastResetAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }
}

// Query to get user profile with subscription info
export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => 
        q.or(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("status"), "trialing")
        )
      )
      .first();

    return {
      user,
      subscription,
    };
  },
});