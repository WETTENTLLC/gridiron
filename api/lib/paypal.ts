import { env } from "./env";

const PAYPAL_BASE = env.isProduction
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getPayPalAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const auth = Buffer.from(
    `${env.paypalClientId}:${env.paypalClientSecret}`,
  ).toString("base64");

  const resp = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!resp.ok) throw new Error(`PayPal auth failed: ${resp.status}`);
  const data = await resp.json();

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.token;
}

export async function createPayPalSubscription(
  planId: string,
  userId: number,
  returnUrl: string,
  cancelUrl: string,
) {
  const token = await getPayPalAccessToken();

  const resp = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plan_id: planId,
      custom_id: userId.toString(),
      application_context: {
        brand_name: "GridIron Intelligence",
        return_url: returnUrl,
        cancel_url: cancelUrl,
        user_action: "SUBSCRIBE_NOW",
        shipping_preference: "NO_SHIPPING",
      },
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`PayPal subscription create failed: ${text}`);
  }
  return resp.json();
}

export async function getPayPalSubscription(subscriptionId: string) {
  const token = await getPayPalAccessToken();

  const resp = await fetch(
    `${PAYPAL_BASE}/v1/billing/subscriptions/${subscriptionId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!resp.ok) throw new Error(`PayPal get subscription failed: ${resp.status}`);
  return resp.json();
}

export async function cancelPayPalSubscription(
  subscriptionId: string,
  reason: string,
) {
  const token = await getPayPalAccessToken();

  const resp = await fetch(
    `${PAYPAL_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    },
  );

  if (!resp.ok && resp.status !== 204) {
    throw new Error(`PayPal cancel failed: ${resp.status}`);
  }
}

export async function verifyPayPalWebhook(
  headers: Record<string, string>,
  body: string,
): Promise<boolean> {
  if (!env.paypalWebhookId) return false;

  const token = await getPayPalAccessToken();

  const resp = await fetch(
    `${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: headers["paypal-auth-algo"],
        cert_url: headers["paypal-cert-url"],
        transmission_id: headers["paypal-transmission-id"],
        transmission_sig: headers["paypal-transmission-sig"],
        transmission_time: headers["paypal-transmission-time"],
        webhook_id: env.paypalWebhookId,
        webhook_event: JSON.parse(body),
      }),
    },
  );

  if (!resp.ok) return false;
  const data = await resp.json();
  return data.verification_status === "SUCCESS";
}

export { PAYPAL_BASE };
