import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, subscriptions } from "@db/schema";
import { eq } from "drizzle-orm";
import { env } from "./lib/env";
import {
  createPayPalSubscription,
  getPayPalSubscription,
  cancelPayPalSubscription,
} from "./lib/paypal";

export const subscriptionRouter = createRouter({
  myTier: authedQuery.query(async ({ ctx }) => {
    return {
      tier: ctx.user.subscriptionTier ?? "free",
      role: ctx.user.role,
    };
  }),

  plans: publicQuery.query(() => [
    {
      tier: "free",
      name: "Free",
      price: 0,
      interval: "month",
      features: [
        "Game schedules & scores",
        "Basic win probabilities",
        "Public chaos scores",
        "3 game previews per week",
      ],
    },
    {
      tier: "pro",
      name: "Pro",
      price: 9.99,
      interval: "month",
      features: [
        "Everything in Free",
        "Full chaos & predictability scores",
        "Scheme advantage analysis",
        "Line movement signals",
        "AI narrative generation",
        "Unlimited game access",
      ],
    },
    {
      tier: "analyst",
      name: "Analyst",
      price: 29.99,
      interval: "month",
      features: [
        "Everything in Pro",
        "Studio producer mode",
        "Broadcast script generation",
        "Lower thirds & chyrons",
        "API access",
        "Priority support",
      ],
    },
  ]),

  createCheckout: authedQuery
    .input(z.object({ tier: z.enum(["pro", "analyst"]) }))
    .mutation(async ({ input, ctx }) => {
      const planId =
        input.tier === "pro"
          ? env.paypalPlanProMonthly
          : env.paypalPlanAnalystMonthly;

      if (!planId) throw new Error(`PayPal plan not configured for ${input.tier}`);

      const result = await createPayPalSubscription(
        planId,
        ctx.user.id,
        `${env.appUrl}/dashboard?upgraded=true`,
        `${env.appUrl}/pricing`,
      );

      const approveLink = result.links?.find(
        (l: any) => l.rel === "approve",
      );

      return { url: approveLink?.href ?? null, subscriptionId: result.id };
    }),

  // Called after user returns from PayPal approval
  activateSubscription: authedQuery
    .input(z.object({ subscriptionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const sub = await getPayPalSubscription(input.subscriptionId);

      if (sub.status !== "ACTIVE" && sub.status !== "APPROVED") {
        throw new Error(`Subscription not active: ${sub.status}`);
      }

      const tier = sub.plan_id === env.paypalPlanProMonthly ? "pro" : "analyst";
      const db = getDb();

      await db.insert(subscriptions).values({
        userId: ctx.user.id,
        paypalSubscriptionId: input.subscriptionId,
        paypalPlanId: sub.plan_id,
        tier,
        status: "active",
        currentPeriodStart: new Date(sub.billing_info?.last_payment?.time ?? new Date()),
        currentPeriodEnd: new Date(sub.billing_info?.next_billing_time ?? new Date()),
      });

      await db
        .update(users)
        .set({ subscriptionTier: tier, paypalSubscriberId: sub.subscriber?.payer_id })
        .where(eq(users.id, ctx.user.id));

      return { success: true, tier };
    }),

  cancelSubscription: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, ctx.user.id))
      .limit(1);

    const sub = rows[0];
    if (!sub || sub.status !== "active") {
      throw new Error("No active subscription found");
    }

    await cancelPayPalSubscription(
      sub.paypalSubscriptionId,
      "User requested cancellation",
    );

    await db
      .update(subscriptions)
      .set({ status: "canceled", cancelAtPeriodEnd: true })
      .where(eq(subscriptions.id, sub.id));

    await db
      .update(users)
      .set({ subscriptionTier: "free" })
      .where(eq(users.id, ctx.user.id));

    return { success: true };
  }),

  mySubscription: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, ctx.user.id))
      .limit(1);
    return rows[0] ?? null;
  }),
});
