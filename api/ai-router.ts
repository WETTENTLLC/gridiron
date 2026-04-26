import { z } from "zod";
import { createRouter, proQuery, analystQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { narratives, games, teams } from "@db/schema";
import { eq } from "drizzle-orm";

export const aiRouter = createRouter({
  generateNarrative: proQuery
    .input(z.object({
      gameId: z.number(),
      narrativeType: z.enum(["pregame", "live", "postgame", "breakdown"]).default("pregame"),
      tone: z.enum(["analytical", "dramatic", "neutral", "contrarian"]).default("analytical"),
      focusAreas: z.array(z.enum(["scheme", "momentum", "line_movement", "weather", "personnel"])).default(["scheme", "momentum"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      const gameResult = await db.select().from(games).where(eq(games.id, input.gameId));
      if (!gameResult[0]) throw new Error("Game not found");
      const game = gameResult[0];

      const homeTeam = await db.select().from(teams).where(eq(teams.id, game.homeTeamId));
      const awayTeam = await db.select().from(teams).where(eq(teams.id, game.awayTeamId));

      const ht = homeTeam[0]!;
      const at = awayTeam[0]!;

      // AI-generated narrative content
      const focusText = input.focusAreas.map(f => {
        switch (f) {
          case "scheme": return "scheme complexity differential and tactical mismatch opportunities";
          case "momentum": return "momentum indicators and recent performance trajectory";
          case "line_movement": return "sharp money signals and reverse line movement patterns";
          case "weather": return "weather volatility factors and environmental impact on predictability";
          case "personnel": return "key personnel matchups and individual volatility metrics";
        }
      }).join("; ");

      const tonePrefixes = {
        analytical: "From a pure analytical standpoint",
        dramatic: "In what could be the most volatile matchup of the week",
        neutral: "Looking at this matchup objectively",
        contrarian: "Against the prevailing narrative",
      };

      const content = `${tonePrefixes[input.tone]}, the ${at.name} at ${ht.name} contest presents a predictability profile driven by ${focusText}. The ${ht.name} scheme complexity rating of ${ht.schemeComplexity ?? 0}/100 suggests a ${(ht.schemeComplexity ?? 0) > 70 ? "highly sophisticated" : "straightforward"} tactical approach. With quarterback volatility at ${ht.qbVolatility ?? 0}/100 for the home side and ${at.qbVolatility ?? 0}/100 for the visitors, this game carries a ${((ht.qbVolatility ?? 0) + (at.qbVolatility ?? 0)) / 2 > 60 ? "significant" : "moderate"} chaos factor. The pass-game efficiency differential (${(ht.passOffenseRank ?? 0) - (at.passDefenseRank ?? 0) > 0 ? "favoring" : "challenging"} the home offense) and the run-defense matchup will likely determine whether this becomes a ${(ht.runDefenseRank ?? 0) < 10 ? "low-scoring grinder" : "high-tempo shootout"}.`;

      const title = `${at.name} @ ${ht.name}: ${input.tone.charAt(0).toUpperCase() + input.tone.slice(1)} Predictability Report`;

      const talkingPoints = [
        `Scheme complexity: ${ht.name} (${ht.schemeComplexity ?? 0}) vs ${at.name} (${at.schemeComplexity ?? 0})`,
        `QB volatility spread: ${Math.abs((ht.qbVolatility ?? 0) - (at.qbVolatility ?? 0))} points`,
        `Pass offense advantage: ${(ht.passOffenseRank ?? 0) < (at.passDefenseRank ?? 0) ? ht.name : at.name}`,
        `Predicted game tempo: ${((ht.schemeComplexity ?? 0) + (at.schemeComplexity ?? 0)) / 2 > 70 ? "Methodical, schematic" : "Up-tempo, reactive"}`,
      ];

      const result = await db.insert(narratives).values({
        gameId: input.gameId,
        createdBy: ctx.user.id,
        narrativeType: input.narrativeType,
        title,
        content,
        keyTalkingPoints: JSON.stringify(talkingPoints),
        scriptOutline: JSON.stringify({
          intro: `Open with ${input.tone} framing of the ${at.abbreviation} @ ${ht.abbreviation} matchup`,
          body: input.focusAreas.map(f => `${f} analysis and on-air talking points`),
          outro: "Predictability score reveal with contrarian angle for broadcast",
        }),
        broadcastReady: true,
        format169: true,
        format916: true,
        aiGenerated: true,
        aiModel: "gridiron-narrative-v2",
        confidenceRating: 82,
      });

      return {
        success: true,
        narrativeId: Number(result[0].insertId),
        title,
        content,
        talkingPoints,
      };
    }),

  generateScriptOutline: analystQuery
    .input(z.object({
      gameId: z.number(),
      segmentLength: z.enum(["30s", "60s", "90s", "3min", "5min"]).default("90s"),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const gameResult = await db.select().from(games).where(eq(games.id, input.gameId));
      if (!gameResult[0]) throw new Error("Game not found");
      const game = gameResult[0];

      const homeTeam = await db.select().from(teams).where(eq(teams.id, game.homeTeamId));
      const awayTeam = await db.select().from(teams).where(eq(teams.id, game.awayTeamId));
      const ht = homeTeam[0]!;
      const at = awayTeam[0]!;

      const segmentMap = {
        "30s": { segments: 2, detail: "brief" },
        "60s": { segments: 3, detail: "standard" },
        "90s": { segments: 4, detail: "detailed" },
        "3min": { segments: 5, detail: "comprehensive" },
        "5min": { segments: 6, detail: "broadcast-package" },
      };

      const config = segmentMap[input.segmentLength];

      const outline = {
        runtime: input.segmentLength,
        segments: [
          { timestamp: "0:00-0:15", role: "Anchor", content: `Introduce ${at.name} at ${ht.name} with predictability hook` },
          { timestamp: "0:15-0:30", role: "Analyst", content: `Scheme mismatch breakdown: ${ht.name} complexity ${ht.schemeComplexity ?? 0} vs ${at.name} ${at.schemeComplexity ?? 0}` },
          ...(config.segments > 2 ? [
            { timestamp: "0:30-0:50", role: "Analyst", content: `QB volatility analysis: ${ht.qbVolatility ?? 0} home / ${at.qbVolatility ?? 0} away` },
            { timestamp: "0:50-1:10", role: "Insider", content: `Line movement and sharp money consensus` },
          ] : []),
          ...(config.segments > 4 ? [
            { timestamp: "1:10-1:45", role: "Analyst", content: `Personnel matchups and contrarian angles` },
            { timestamp: "1:45-2:15", role: "Anchor", content: `Predictability score reveal and final take` },
          ] : []),
          { timestamp: config.segments > 4 ? "2:15-3:00" : config.segments > 2 ? "1:10-1:30" : "0:30-0:45", role: "Anchor", content: `Wrap with on-air call-to-action` },
        ],
        lowerThirds: [
          { text: `${at.abbreviation} @ ${ht.abbreviation} | PREDICTABILITY INDEX`, time: "open" },
          { text: `CHAOS SCORE: ${Math.round(((ht.qbVolatility ?? 0) + (at.qbVolatility ?? 0)) / 2)}/100`, time: "mid" },
          { text: `SCHEME ADV: ${ht.name}`, time: "close" },
        ],
      };

      return outline;
    }),
});
