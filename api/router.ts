import { authRouter } from "./auth-router";
import { nflRouter } from "./nfl-router";
import { aiRouter } from "./ai-router";
import { subscriptionRouter } from "./subscription-router";
import { syncRouter } from "./sync-router";
import { waitlistRouter } from "./waitlist-router";
import { blogRouter } from "./blog-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  nfl: nflRouter,
  ai: aiRouter,
  subscription: subscriptionRouter,
  sync: syncRouter,
  waitlist: waitlistRouter,
  blog: blogRouter,
});

export type AppRouter = typeof appRouter;
