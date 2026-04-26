import { authRouter } from "./auth-router";
import { nflRouter } from "./nfl-router";
import { aiRouter } from "./ai-router";
import { subscriptionRouter } from "./subscription-router";
import { syncRouter } from "./sync-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  nfl: nflRouter,
  ai: aiRouter,
  subscription: subscriptionRouter,
  sync: syncRouter,
});

export type AppRouter = typeof appRouter;
