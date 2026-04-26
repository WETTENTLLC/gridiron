import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  kimiAuthUrl: required("KIMI_AUTH_URL"),
  kimiOpenUrl: required("KIMI_OPEN_URL"),
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  paypalClientId: process.env.PAYPAL_CLIENT_ID ?? "",
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET ?? "",
  paypalPlanProMonthly: process.env.PAYPAL_PLAN_PRO_MONTHLY ?? "",
  paypalPlanAnalystMonthly: process.env.PAYPAL_PLAN_ANALYST_MONTHLY ?? "",
  paypalWebhookId: process.env.PAYPAL_WEBHOOK_ID ?? "",
  balldontlieApiKey: process.env.BALLDONTLIE_API_KEY ?? "",
  oddsApiKey: process.env.ODDS_API_KEY ?? "",
  cronToken: process.env.CRON_TOKEN ?? "",
};
