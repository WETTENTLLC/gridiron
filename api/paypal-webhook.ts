import type { Context } from "hono";
import { env } from "./lib/env";
import { verifyPayPalWebhook } from "./lib/paypal";
import { getDb } from "./queries/connection";
import { users, subscriptions } from "@db/schema";
import { eq } from "drizzle-orm";

export async function handlePayPalWebhook(c: Context) {
  if (!env.paypalClientId || !env.paypalWebhookId) {
    return c.json({ error: "PayPal not configured" }, 500);
  }

  const body = await c.req.text();
  const headers: Record<string, string> = {};
  for (const key of [
    "paypal-auth-algo",
    "paypal-cert-url",
    "paypal-transmission-id",
    "paypal-transmission-sig",
    "paypal-transmission-time",
  ]) {
    headers[key] = c.req.header(key) ?? "";
  }

  const verified = await verifyPayPalWebhook(headers, body);
  if (!verified) {
    console.warn("[paypal] Webhook verification failed");
    return c.json({ error: "Invalid signature" }, 400);
  }

  const event = JSON.parse(body);
  const db = getDb();

  switch (event.event_type) {
    // Subscription activated (first payment or reactivation)
    case "BILLING.SUBSCRIPTION.ACTIVATED": {
      const subId = event.resource?.id;
      const customId = event.resource?.custom_id;
      const planId = event.resource?.plan_id;
      if (!subId || !customId) break;

      const userId = parseInt(customId);
      const tier = planId === env.paypalPlanProMonthly ? "pro" : "analyst";

      // Upsert subscription
      const existing = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.paypalSubscriptionId, subId))
        .limit(1);

      if (existing[0]) {
        await db
          .update(subscriptions)
          .set({ status: "active", cancelAtPeriodEnd: false })
          .where(eq(subscriptions.id, existing[0].id));
      } else {
        await db.insert(subscriptions).values({
          userId,
          paypalSubscriptionId: subId,
          paypalPlanId: planId,
          tier,
          status: "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(
            event.resource?.billing_info?.next_billing_time ?? Date.now() + 30 * 86400000,
          ),
        });
      }

      await db.update(users).set({ subscriptionTier: tier }).where(eq(users.id, userId));
      break;
    }

    // Payment completed (renewal)
    case "PAYMENT.SALE.COMPLETED": {
      const subId = event.resource?.billing_agreement_id;
      if (!subId) break;

      await db
        .update(subscriptions)
        .set({
          status: "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
        })
        .where(eq(subscriptions.paypalSubscriptionId, subId));
      break;
    }

    // Subscription cancelled
    case "BILLING.SUBSCRIPTION.CANCELLED": {
      const subId = event.resource?.id;
      if (!subId) break;

      const rows = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.paypalSubscriptionId, subId))
        .limit(1);

      if (rows[0]) {
        await db
          .update(subscriptions)
          .set({ status: "canceled" })
          .where(eq(subscriptions.id, rows[0].id));

        await db
          .update(users)
          .set({ subscriptionTier: "free" })
          .where(eq(users.id, rows[0].userId));
      }
      break;
    }

    // Subscription suspended (payment failed)
    case "BILLING.SUBSCRIPTION.SUSPENDED": {
      const subId = event.resource?.id;
      if (!subId) break;

      await db
        .update(subscriptions)
        .set({ status: "past_due" })
        .where(eq(subscriptions.paypalSubscriptionId, subId));
      break;
    }
  }

  return c.json({ received: true });
}
