import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { handlePayPalWebhook } from "./paypal-webhook";
import { syncTeams, syncScheduleAndScores, syncOdds } from "./ingestion/sync";
import { Paths } from "@contracts/constants";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(
  "*",
  cors({
    origin: env.isProduction ? env.appUrl : "http://localhost:3000",
    credentials: true,
  }),
);
app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

// PayPal webhook
app.post("/api/webhooks/paypal", handlePayPalWebhook);

// Cron endpoint — protected by token, called by Railway cron
app.post("/api/cron/sync", async (c) => {
  const token = c.req.header("authorization")?.replace("Bearer ", "");
  if (!env.cronToken || token !== env.cronToken) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const scores = await syncScheduleAndScores();
    const odds = await syncOdds();
    return c.json({ success: true, scores, odds });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
