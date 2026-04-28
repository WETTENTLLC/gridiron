// Run with: DATABASE_URL=mysql://... npx tsx db/seed-demo.ts
import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import {
  teams,
  games,
  predictions,
  narratives,
  analystProfiles,
  posts,
} from "./schema";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!, { mode: "planetscale" });

async function seedDemo() {
  const allTeams = await db.select().from(teams);
  const allGames = await db.select().from(games);

  if (allTeams.length === 0 || allGames.length === 0) {
    console.error("No teams or games found. Run the cron sync first.");
    process.exit(1);
  }

  const teamMap = new Map(allTeams.map((t) => [t.id, t]));

  // ── Predictions ────────────────────────────────────────────────
  console.log("Seeding predictions...");
  const existingPreds = await db.select().from(predictions);
  if (existingPreds.length === 0) {
    const predRecords = allGames.map((g) => {
      const ht = teamMap.get(g.homeTeamId);
      const at = teamMap.get(g.awayTeamId);
      const htScheme = ht?.schemeComplexity ?? 50;
      const atScheme = at?.schemeComplexity ?? 50;
      const htQb = ht?.qbVolatility ?? 50;
      const atQb = at?.qbVolatility ?? 50;
      const htPassOff = ht?.passOffenseRank ?? 16;
      const atPassDef = at?.passDefenseRank ?? 16;
      const htRunOff = ht?.runOffenseRank ?? 16;
      const atRunDef = at?.runDefenseRank ?? 16;

      const chaosScore = Math.round((htQb + atQb + htScheme * 0.3) / 2.3);
      const predictabilityIndex = Math.round(100 - chaosScore);
      const homeWinProb = Math.min(78, Math.max(22, 50 + (atPassDef - htPassOff) * 1.5 + 3));
      const confidence = Math.round(predictabilityIndex * 0.9 + Math.random() * 10);

      return {
        gameId: g.id,
        predictedHomeScore: (20 + Math.random() * 14).toFixed(1),
        predictedAwayScore: (17 + Math.random() * 14).toFixed(1),
        confidenceScore: confidence,
        chaosScore,
        predictabilityIndex,
        homeWinProbability: homeWinProb.toFixed(2),
        awayWinProbability: (100 - homeWinProb).toFixed(2),
        passGameAdvantage: Math.round(htPassOff - atPassDef),
        runGameAdvantage: Math.round(htRunOff - atRunDef),
        schemeMismatchScore: Math.round(Math.abs(htScheme - atScheme)),
        lineMovementSignal: (["sharp_home", "sharp_away", "public_home", "public_away", "neutral", "contrarian"] as const)[Math.floor(Math.random() * 6)],
        sharpMoneyPercent: Math.round(35 + Math.random() * 30),
        publicBettingPercent: Math.round(40 + Math.random() * 20),
        analystConsensus: Math.round(45 + Math.random() * 10),
        varianceFactors: JSON.stringify({ weatherImpact: "low", qbStability: htQb < 50 ? "stable" : "volatile", injuries: "minimal" }),
        schemeFactors: JSON.stringify({ homeScheme: htScheme > 70 ? "complex" : "simple", awayScheme: atScheme > 70 ? "complex" : "simple" }),
        modelVersion: "v2.1",
      };
    });

    for (let i = 0; i < predRecords.length; i += 10) {
      await db.insert(predictions).values(predRecords.slice(i, i + 10));
    }
    console.log(`  Inserted ${predRecords.length} predictions`);
  } else {
    console.log(`  Skipped — ${existingPreds.length} predictions already exist`);
  }

  // ── Narratives ─────────────────────────────────────────────────
  console.log("Seeding narratives...");
  const existingNarratives = await db.select().from(narratives);
  if (existingNarratives.length === 0) {
    const sampleGames = allGames.slice(0, 8);
    const narrativeRecords = sampleGames.flatMap((g) => {
      const ht = teamMap.get(g.homeTeamId)!;
      const at = teamMap.get(g.awayTeamId)!;

      return [
        {
          gameId: g.id,
          narrativeType: "pregame" as const,
          title: `${at.name} @ ${ht.name}: Predictability Breakdown`,
          content: `This ${at.city} ${at.name} at ${ht.city} ${ht.name} matchup presents one of the more intriguing predictability profiles of the week. The ${ht.name} enter with a scheme complexity rating of ${ht.schemeComplexity}/100, suggesting a ${(ht.schemeComplexity ?? 0) > 70 ? "multi-layered offensive approach that could exploit defensive gaps or collapse under pressure" : "straightforward game plan that limits variance but also limits explosive upside"}. With quarterback volatility at ${ht.qbVolatility}/100 for the home side and ${at.qbVolatility}/100 for the visitors, this game carries a ${((ht.qbVolatility ?? 0) + (at.qbVolatility ?? 0)) / 2 > 55 ? "significant chaos factor that content creators should build their narrative around" : "moderate stability profile that favors the fundamentally stronger team"}. The pass-game efficiency differential and run-defense matchup will likely determine whether this becomes a shootout or a grinder — and that distinction is exactly what separates a good broadcast take from a great one.`,
          keyTalkingPoints: JSON.stringify([
            `Scheme complexity gap: ${Math.abs((ht.schemeComplexity ?? 0) - (at.schemeComplexity ?? 0))} points`,
            `QB volatility spread: ${ht.name} (${ht.qbVolatility}) vs ${at.name} (${at.qbVolatility})`,
            `Pass offense rank advantage: ${(ht.passOffenseRank ?? 16) < (at.passDefenseRank ?? 16) ? ht.name : at.name}`,
            `Key narrative angle: ${(ht.qbVolatility ?? 0) > 60 ? "Home QB under pressure — volatility story" : "Home QB stability — execution story"}`,
          ]),
          scriptOutline: JSON.stringify({
            intro: `Open with the ${at.abbreviation} @ ${ht.abbreviation} predictability hook`,
            body: ["Scheme mismatch breakdown", "QB volatility comparison", "Line movement analysis"],
            outro: "Chaos score reveal with contrarian angle",
          }),
          broadcastReady: true,
          format169: true,
          format916: true,
          aiGenerated: true,
          aiModel: "gridiron-narrative-v2",
          confidenceRating: 78 + Math.floor(Math.random() * 12),
        },
        {
          gameId: g.id,
          narrativeType: "breakdown" as const,
          title: `${at.abbreviation} @ ${ht.abbreviation}: Scheme Mismatch Deep Dive`,
          content: `The tactical chess match between the ${at.name} and ${ht.name} reveals a fascinating scheme mismatch. The ${ht.name}'s ${(ht.schemeComplexity ?? 0) > 70 ? "high-complexity offensive system" : "simplified attack"} faces a ${at.name} defense ranked ${at.passDefenseRank ?? 16}th against the pass. This creates a ${(ht.passOffenseRank ?? 16) < (at.passDefenseRank ?? 16) ? "clear passing advantage for the home team" : "defensive edge for the visitors"} that should be the centerpiece of any pre-game segment. For broadcast, lead with the mismatch score of ${Math.abs((ht.schemeComplexity ?? 0) - (at.schemeComplexity ?? 0))} — it's the kind of specific, quantified insight that separates your analysis from the generic talking heads.`,
          keyTalkingPoints: JSON.stringify([
            `Mismatch score: ${Math.abs((ht.schemeComplexity ?? 0) - (at.schemeComplexity ?? 0))}/100`,
            `Run game advantage: ${(ht.runOffenseRank ?? 16) < (at.runDefenseRank ?? 16) ? ht.name : at.name}`,
          ]),
          broadcastReady: true,
          format169: true,
          format916: false,
          aiGenerated: true,
          aiModel: "gridiron-narrative-v2",
          confidenceRating: 80 + Math.floor(Math.random() * 10),
        },
      ];
    });

    for (let i = 0; i < narrativeRecords.length; i += 5) {
      await db.insert(narratives).values(narrativeRecords.slice(i, i + 5));
    }
    console.log(`  Inserted ${narrativeRecords.length} narratives`);
  } else {
    console.log(`  Skipped — ${existingNarratives.length} narratives already exist`);
  }

  // ── Analyst Profiles ───────────────────────────────────────────
  console.log("Seeding analyst profiles...");
  const existingAnalysts = await db.select().from(analystProfiles);
  if (existingAnalysts.length === 0) {
    const analysts = [
      { displayName: "Marcus Cole", bio: "Former NFL scout turned analytics consultant. 15 years of scheme analysis experience across AFC and NFC.", specialization: "offense" as const, accuracyScore: "72.40", totalPredictions: 248, correctPredictions: 179, streak: 7, tier: "platinum" as const, verified: true },
      { displayName: "Sarah Chen", bio: "Sports data scientist specializing in quarterback volatility metrics and game-flow modeling.", specialization: "general" as const, accuracyScore: "68.90", totalPredictions: 186, correctPredictions: 128, streak: 4, tier: "gold" as const, verified: true },
      { displayName: "DeAndre Williams", bio: "Broadcast analyst and former defensive coordinator. Breaks down defensive schemes for content creators.", specialization: "defense" as const, accuracyScore: "65.20", totalPredictions: 312, correctPredictions: 203, streak: -2, tier: "gold" as const, verified: true },
      { displayName: "Jake Morrison", bio: "Sharp money tracker and line movement specialist. Focuses on reverse line movement and contrarian signals.", specialization: "betting" as const, accuracyScore: "61.80", totalPredictions: 420, correctPredictions: 259, streak: 3, tier: "silver" as const, verified: false },
      { displayName: "Priya Patel", bio: "Special teams analytics pioneer. Built predictive models for punt return efficiency and field goal variance.", specialization: "special_teams" as const, accuracyScore: "58.50", totalPredictions: 95, correctPredictions: 55, streak: 1, tier: "silver" as const, verified: false },
    ];

    // Use userId 1 through 5 (placeholder — these don't need real user accounts)
    await db.insert(analystProfiles).values(
      analysts.map((a, i) => ({ ...a, userId: i + 100 })),
    );
    console.log(`  Inserted ${analysts.length} analyst profiles`);
  } else {
    console.log(`  Skipped — ${existingAnalysts.length} analyst profiles already exist`);
  }

  // ── Blog Posts ─────────────────────────────────────────────────
  console.log("Seeding blog posts...");
  const existingPosts = await db.select().from(posts);
  if (existingPosts.length === 0) {
    const blogPosts = [
      {
        slug: "how-we-calculate-the-chaos-score",
        title: "How We Calculate the Chaos Score",
        excerpt: "The Chaos Score is our proprietary 0-100 metric that measures game unpredictability. Here's exactly how it works and why it matters for your broadcast.",
        content: `## What Is the Chaos Score?

The Chaos Score is a 0–100 metric that quantifies how unpredictable a game is likely to be. A score of 20 means the outcome is highly predictable — one team is clearly dominant. A score of 85 means anything can happen, and your broadcast narrative needs to account for wild swings.

## The Three Pillars

### 1. Quarterback Volatility (40% weight)
We track each quarterback's consistency across multiple dimensions: completion percentage variance, turnover tendency under pressure, and performance differential between home and away games. A QB with a volatility score of 75 means their performance swings wildly week to week — that's chaos fuel.

### 2. Scheme Complexity (30% weight)
Complex offensive schemes create more variance. A team running a sophisticated RPO-heavy system with multiple pre-snap reads has more points of failure than a team running a simplified power-run scheme. We quantify this using play-call diversity, formation variety, and motion frequency.

### 3. Environmental Factors (30% weight)
Weather (wind speed, precipitation, temperature extremes), venue effects (dome vs. outdoor, altitude), and scheduling factors (short week, cross-country travel, primetime pressure) all feed into the chaos calculation.

## Why It Matters for Content Creators

If you're covering a game with a Chaos Score of 75+, your narrative should be built around uncertainty — "anything can happen" angles, upset potential, and the specific factors driving unpredictability. If the score is below 35, your narrative should focus on execution and scheme advantages, because the outcome is likely to follow the fundamentals.

This is the difference between a generic "it should be a good game" take and a specific, credible analytical framework that your audience can follow.

## How to Use It On Air

Lead with the number. "This game carries a Chaos Score of 82 — here's why that matters." Then break down which pillar is driving the score. Your audience gets a concrete metric, and you get a structured narrative framework that writes itself.`,
        tags: JSON.stringify(["methodology", "chaos-score", "analytics"]),
        authorName: "GridIron Intelligence",
      },
      {
        slug: "understanding-sharp-money-signals",
        title: "Understanding Sharp Money Signals for Better Broadcast Takes",
        excerpt: "Sharp money movement is one of the most misunderstood concepts in sports media. Here's how to interpret it for credible on-air analysis.",
        content: `## Sharp vs. Public Money

When we talk about "sharp money," we're referring to bets placed by professional bettors and syndicates — the people who do this for a living. "Public money" is everyone else. The distinction matters because sharp bettors have a long-term edge, and their actions often signal information the public doesn't have.

## Reverse Line Movement

This is the most powerful signal we track. Reverse line movement occurs when the betting line moves in the opposite direction of where the majority of bets are being placed. For example: 70% of bets are on Team A, but the line moves in favor of Team B. This means the sportsbooks are reacting to the *money*, not the *number of bets* — and that money is coming from sharp accounts.

## How We Display It

Our Line Movement Interpreter shows three key metrics:

- **Sharp Money %**: What percentage of the dollar volume is coming from sharp accounts
- **Public Betting %**: What percentage of total bets are on each side
- **Signal Classification**: We categorize each game as Sharp Home, Sharp Away, Public Home, Public Away, Neutral, or Contrarian

## The Broadcast Angle

Don't say "the smart money is on Team X" — that's lazy. Instead, say "We're seeing a reverse line movement signal on this game. 68% of bets are on the Chiefs, but the line has moved a half-point toward the Bills. That tells us the professional money — the accounts that sportsbooks actually respect — is going the other way. Here's what they might be seeing that the public isn't."

That's a 30-second segment that makes you sound like you have inside information. You don't — you have data. But data delivered with context is more powerful than any insider tip.

## When to Ignore It

Sharp money signals are most reliable in the NFL because of the weekly schedule and the depth of the betting market. They're less reliable in early-season games when sample sizes are small, and they should never be the *only* factor in your analysis. Use them as one input alongside scheme analysis, injury reports, and our Chaos Score.`,
        tags: JSON.stringify(["sharp-money", "line-movement", "betting", "broadcast"]),
        authorName: "GridIron Intelligence",
      },
      {
        slug: "why-predictability-beats-prediction",
        title: "Why Predictability Beats Prediction for Content Creators",
        excerpt: "Everyone tries to predict winners. We measure predictability instead — and that's a better framework for building an audience.",
        content: `## The Prediction Trap

Every sports media personality falls into the same trap: they make picks. "I'm taking the Chiefs minus 7." Then they're either right or wrong, and their credibility rises or falls on a coin flip dressed up as analysis.

The problem isn't making picks — it's that picks are binary. You're right or you're wrong. There's no nuance, no framework, and no way to be "interestingly wrong."

## The Predictability Framework

Instead of asking "who wins?", we ask "how predictable is this game?" That's a fundamentally different question, and it leads to fundamentally better content.

When you tell your audience "this game has a Predictability Index of 73% — here are the three factors that make it one of the most predictable matchups of the week," you're giving them something they can't get anywhere else. You're not competing with every other talking head making picks. You're operating in a different category entirely.

## Building Credibility Over Time

Here's the key insight: if you frame your analysis around predictability rather than prediction, you can never be "wrong" in the traditional sense. If you say a game has high chaos potential and it turns into a blowout, you can point to the specific factor that overrode the chaos signals. If you say a game is highly predictable and it turns into a shootout, you can analyze what broke the model.

Either way, you're providing analysis. You're teaching your audience how to think about football, not just telling them what to think.

## The Content Creator Advantage

This framework gives you:

1. **A unique angle** — nobody else is quantifying predictability this way
2. **Recurring segments** — "This week's most chaotic matchup" writes itself every week
3. **Credibility insurance** — you're never wrong, you're always analyzing
4. **Audience education** — viewers learn your framework and come back to see how it plays out

## How to Start

Pick one game per week. Lead with the Chaos Score. Break down why. Show the scheme mismatch data. Reference the sharp money signal. Close with your take on whether the game will follow the predictability profile or break it.

That's a 3-minute segment that positions you as the smartest analyst in the room. And you built it in 60 seconds using our platform.`,
        tags: JSON.stringify(["content-strategy", "predictability", "creators"]),
        authorName: "GridIron Intelligence",
      },
    ];

    await db.insert(posts).values(blogPosts);
    console.log(`  Inserted ${blogPosts.length} blog posts`);
  } else {
    console.log(`  Skipped — ${existingPosts.length} posts already exist`);
  }

  console.log("\nDemo seed complete!");
  process.exit(0);
}

seedDemo().catch((err) => {
  console.error(err);
  process.exit(1);
});
