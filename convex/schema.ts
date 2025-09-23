import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    author: v.string(),
    body: v.string(),
  }),

  subscriptions: defineTable({
    userId: v.string(), // Clerk user ID
    subscriptionId: v.string(), // Paddle subscription ID
    customerId: v.string(), // Paddle customer ID
    status: v.union(
      v.literal("active"),
      v.literal("canceled"), 
      v.literal("past_due"),
      v.literal("paused"),
      v.literal("trialing")
    ),
    priceId: v.string(), // Paddle price ID
    planName: v.string(), // Plan name (basic, pro, enterprise)
    currentPeriodStart: v.number(), // Unix timestamp
    currentPeriodEnd: v.number(), // Unix timestamp
    cancelAtPeriodEnd: v.boolean(),
    trialEnd: v.optional(v.number()), // Unix timestamp
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_subscription", ["subscriptionId"])
    .index("by_customer", ["customerId"]),

  users: defineTable({
    userId: v.string(), // Clerk user ID
    email: v.string(),
    name: v.optional(v.string()),
    subscriptionStatus: v.optional(v.union(
      v.literal("free"),
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("paused")
    )),
    tokensUsed: v.number(),
    tokensLimit: v.number(),
    lastResetAt: v.number(), // Unix timestamp for monthly reset
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),
});