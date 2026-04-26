import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { syncLogs } from "@db/schema";
import { desc } from "drizzle-orm";
import { syncTeams, syncScheduleAndScores, syncOdds } from "./ingestion/sync";

export const syncRouter = createRouter({
  runSync: adminQuery
    .input(
      z.object({
        type: z.enum(["teams", "scores", "odds", "all"]),
        week: z.number().optional(),
        season: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const results: Record<string, number> = {};

      if (input.type === "teams" || input.type === "all") {
        results.teams = await syncTeams();
      }
      if (input.type === "scores" || input.type === "all") {
        results.scores = await syncScheduleAndScores(input.week, input.season);
      }
      if (input.type === "odds" || input.type === "all") {
        results.odds = await syncOdds();
      }

      return { success: true, results };
    }),

  logs: adminQuery
    .input(z.object({ limit: z.number().default(20) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(syncLogs)
        .orderBy(desc(syncLogs.startedAt))
        .limit(input?.limit ?? 20);
    }),
});
