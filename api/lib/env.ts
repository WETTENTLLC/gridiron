import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

function optional(name: string): string {
  return process.env[name] ?? "";
}

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  appSecret: required("APP_SECRET"),
  databaseUrl: required("DATABASE_URL"),
  appUrl: optional("APP_URL") || "http://localhost:3000",
  ownerEmail: optional("OWNER_EMAIL"),
  paypalClientId: optional("PAYPAL_CLIENT_ID"),
  paypalClientSecret: optional("PAYPAL_CLIENT_SECRET"),
  paypalPlanProMonthly: optional("PAYPAL_PLAN_PRO_MONTHLY"),
  paypalPlanAnalystMonthly: optional("PAYPAL_PLAN_ANALYST_MONTHLY"),
  paypalWebhookId: optional("PAYPAL_WEBHOOK_ID"),
  balldontlieApiKey: optional("BALLDONTLIE_API_KEY"),
  oddsApiKey: optional("ODDS_API_KEY"),
  cronToken: optional("CRON_TOKEN"),
};
