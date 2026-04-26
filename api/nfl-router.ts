import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { teams, games, predictions, narratives, analystProfiles, lineMovements } from "@db/schema";
import { eq, and, desc, asc } from "drizzle-orm";

export const nflRouter = createRouter({
  teams: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(teams).orderBy(asc(teams.name));
  }),

  teamById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(teams).where(eq(teams.id, input.id));
      return result[0] ?? null;
    }),

  games: publicQuery
    .input(z.object({
      week: z.number().optional(),
      season: z.number().optional(),
      status: z.enum(["scheduled", "live", "halftime", "final", "postponed"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.week) conditions.push(eq(games.week, input.week));
      if (input?.season) conditions.push(eq(games.season, input.season));
      if (input?.status) conditions.push(eq(games.status, input.status));

      const query = db.select().from(games).orderBy(asc(games.gameDate));
      if (conditions.length > 0) {
        return query.where(and(...conditions));
      }
      return query;
    }),

  gameById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const gameResult = await db.select().from(games).where(eq(games.id, input.id));
      if (!gameResult[0]) return null;

      const game = gameResult[0];
      const homeTeam = await db.select().from(teams).where(eq(teams.id, game.homeTeamId));
      const awayTeam = await db.select().from(teams).where(eq(teams.id, game.awayTeamId));
      const predictionResult = await db.select().from(predictions).where(eq(predictions.gameId, game.id));
      const narrativeResult = await db.select().from(narratives).where(eq(narratives.gameId, game.id));
      const lineMovementResult = await db.select().from(lineMovements).where(eq(lineMovements.gameId, game.id));

      return {
        ...game,
        homeTeam: homeTeam[0] ?? null,
        awayTeam: awayTeam[0] ?? null,
        prediction: predictionResult[0] ?? null,
        narratives: narrativeResult,
        lineMovements: lineMovementResult,
      };
    }),

  predictions: publicQuery
    .input(z.object({
      week: z.number().optional(),
      season: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const allGames = await db.select().from(games).orderBy(asc(games.gameDate));
      const allPredictions = await db.select().from(predictions);
      const allTeams = await db.select().from(teams);

      const gameMap = new Map(allGames.map(g => [g.id, g]));
      const teamMap = new Map(allTeams.map(t => [t.id, t]));

      return allPredictions
        .filter(p => {
          const game = gameMap.get(p.gameId);
          if (!game) return false;
          if (input?.week && game.week !== input.week) return false;
          if (input?.season && game.season !== input.season) return false;
          return true;
        })
        .map(p => {
          const game = gameMap.get(p.gameId)!;
          return {
            ...p,
            game,
            homeTeam: teamMap.get(game.homeTeamId) ?? null,
            awayTeam: teamMap.get(game.awayTeamId) ?? null,
          };
        })
        .sort((a, b) => new Date(a.game.gameDate).getTime() - new Date(b.game.gameDate).getTime());
    }),

  narratives: publicQuery
    .input(z.object({
      gameId: z.number().optional(),
      type: z.enum(["pregame", "live", "postgame", "breakdown"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.gameId) conditions.push(eq(narratives.gameId, input.gameId));
      if (input?.type) conditions.push(eq(narratives.narrativeType, input.type));

      const query = db.select().from(narratives).orderBy(desc(narratives.createdAt));
      if (conditions.length > 0) {
        return query.where(and(...conditions));
      }
      return query;
    }),

  createNarrative: authedQuery
    .input(z.object({
      gameId: z.number(),
      narrativeType: z.enum(["pregame", "live", "postgame", "breakdown"]),
      title: z.string().min(1).max(255),
      content: z.string().min(1),
      keyTalkingPoints: z.array(z.string()).optional(),
      broadcastReady: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const result = await db.insert(narratives).values({
        gameId: input.gameId,
        createdBy: ctx.user.id,
        narrativeType: input.narrativeType,
        title: input.title,
        content: input.content,
        keyTalkingPoints: JSON.stringify(input.keyTalkingPoints ?? []),
        broadcastReady: input.broadcastReady,
        aiGenerated: false,
        confidenceRating: 70,
      });
      return result;
    }),

  analyticsDashboard: publicQuery.query(async () => {
    const db = getDb();
    const allGames = await db.select().from(games);
    const allPredictions = await db.select().from(predictions);
    const allNarratives = await db.select().from(narratives);

    const avgChaos = allPredictions.length > 0
      ? allPredictions.reduce((sum, p) => sum + (p.chaosScore ?? 0), 0) / allPredictions.length
      : 0;

    const avgPredictability = allPredictions.length > 0
      ? allPredictions.reduce((sum, p) => sum + (p.predictabilityIndex ?? 0), 0) / allPredictions.length
      : 0;

    const sharpSignals = allPredictions.filter(p => p.lineMovementSignal === "sharp_home" || p.lineMovementSignal === "sharp_away").length;
    const contrarianSignals = allPredictions.filter(p => p.lineMovementSignal === "contrarian").length;

    return {
      totalGames: allGames.length,
      totalPredictions: allPredictions.length,
      totalNarratives: allNarratives.length,
      avgChaosScore: Math.round(avgChaos),
      avgPredictabilityIndex: Math.round(avgPredictability),
      sharpSignals,
      contrarianSignals,
      highVarianceGames: allPredictions.filter(p => (p.chaosScore ?? 0) > 70).length,
      lowVarianceGames: allPredictions.filter(p => (p.chaosScore ?? 0) < 40).length,
    };
  }),

  analysts: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(analystProfiles).orderBy(desc(analystProfiles.accuracyScore));
  }),

  lineMovements: publicQuery
    .input(z.object({ gameId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(lineMovements).where(eq(lineMovements.gameId, input.gameId)).orderBy(desc(lineMovements.recordedAt));
    }),
});
