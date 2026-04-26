// @ts-nocheck
import { getDb } from "../api/queries/connection";
import { teams, games, predictions, narratives } from "./schema";

const nflTeams = [
  { name: "Ravens", abbreviation: "BAL", city: "Baltimore", conference: "AFC", division: "North", primaryColor: "#241773", secondaryColor: "#000000", passOffenseRank: 8, runOffenseRank: 3, passDefenseRank: 6, runDefenseRank: 12, schemeComplexity: 72, qbVolatility: 45 },
  { name: "Bengals", abbreviation: "CIN", city: "Cincinnati", conference: "AFC", division: "North", primaryColor: "#FB4F14", secondaryColor: "#000000", passOffenseRank: 5, runOffenseRank: 18, passDefenseRank: 14, runDefenseRank: 22, schemeComplexity: 68, qbVolatility: 55 },
  { name: "Browns", abbreviation: "CLE", city: "Cleveland", conference: "AFC", division: "North", primaryColor: "#311D00", secondaryColor: "#FF3C00", passOffenseRank: 22, runOffenseRank: 8, passDefenseRank: 4, runDefenseRank: 5, schemeComplexity: 60, qbVolatility: 70 },
  { name: "Steelers", abbreviation: "PIT", city: "Pittsburgh", conference: "AFC", division: "North", primaryColor: "#FFB612", secondaryColor: "#101820", passOffenseRank: 19, runOffenseRank: 14, passDefenseRank: 3, runDefenseRank: 8, schemeComplexity: 65, qbVolatility: 50 },
  { name: "Bills", abbreviation: "BUF", city: "Buffalo", conference: "AFC", division: "East", primaryColor: "#00338D", secondaryColor: "#C60C30", passOffenseRank: 4, runOffenseRank: 9, passDefenseRank: 8, runDefenseRank: 10, schemeComplexity: 75, qbVolatility: 40 },
  { name: "Dolphins", abbreviation: "MIA", city: "Miami", conference: "AFC", division: "East", primaryColor: "#008E97", secondaryColor: "#FC4C02", passOffenseRank: 12, runOffenseRank: 15, passDefenseRank: 16, runDefenseRank: 18, schemeComplexity: 70, qbVolatility: 58 },
  { name: "Patriots", abbreviation: "NE", city: "New England", conference: "AFC", division: "East", primaryColor: "#002244", secondaryColor: "#C60C30", passOffenseRank: 25, runOffenseRank: 20, passDefenseRank: 12, runDefenseRank: 14, schemeComplexity: 78, qbVolatility: 65 },
  { name: "Jets", abbreviation: "NYJ", city: "New York", conference: "AFC", division: "East", primaryColor: "#125740", secondaryColor: "#FFFFFF", passOffenseRank: 28, runOffenseRank: 25, passDefenseRank: 2, runDefenseRank: 3, schemeComplexity: 62, qbVolatility: 75 },
  { name: "Texans", abbreviation: "HOU", city: "Houston", conference: "AFC", division: "South", primaryColor: "#03202F", secondaryColor: "#A71930", passOffenseRank: 10, runOffenseRank: 12, passDefenseRank: 18, runDefenseRank: 20, schemeComplexity: 55, qbVolatility: 48 },
  { name: "Colts", abbreviation: "IND", city: "Indianapolis", conference: "AFC", division: "South", primaryColor: "#002C5F", secondaryColor: "#A2AAAD", passOffenseRank: 15, runOffenseRank: 11, passDefenseRank: 20, runDefenseRank: 16, schemeComplexity: 58, qbVolatility: 52 },
  { name: "Jaguars", abbreviation: "JAX", city: "Jacksonville", conference: "AFC", division: "South", primaryColor: "#006778", secondaryColor: "#D7A22A", passOffenseRank: 18, runOffenseRank: 16, passDefenseRank: 24, runDefenseRank: 24, schemeComplexity: 52, qbVolatility: 62 },
  { name: "Titans", abbreviation: "TEN", city: "Tennessee", conference: "AFC", division: "South", primaryColor: "#0C2340", secondaryColor: "#4B92DB", passOffenseRank: 24, runOffenseRank: 22, passDefenseRank: 22, runDefenseRank: 19, schemeComplexity: 48, qbVolatility: 68 },
  { name: "Broncos", abbreviation: "DEN", city: "Denver", conference: "AFC", division: "West", primaryColor: "#FB4F14", secondaryColor: "#002244", passOffenseRank: 23, runOffenseRank: 19, passDefenseRank: 10, runDefenseRank: 9, schemeComplexity: 64, qbVolatility: 60 },
  { name: "Chiefs", abbreviation: "KC", city: "Kansas City", conference: "AFC", division: "West", primaryColor: "#E31837", secondaryColor: "#FFB81C", passOffenseRank: 3, runOffenseRank: 10, passDefenseRank: 5, runDefenseRank: 7, schemeComplexity: 85, qbVolatility: 35 },
  { name: "Raiders", abbreviation: "LV", city: "Las Vegas", conference: "AFC", division: "West", primaryColor: "#000000", secondaryColor: "#A5ACAF", passOffenseRank: 20, runOffenseRank: 21, passDefenseRank: 26, runDefenseRank: 28, schemeComplexity: 50, qbVolatility: 72 },
  { name: "Chargers", abbreviation: "LAC", city: "Los Angeles", conference: "AFC", division: "West", primaryColor: "#0080C6", secondaryColor: "#FFC20E", passOffenseRank: 14, runOffenseRank: 17, passDefenseRank: 15, runDefenseRank: 13, schemeComplexity: 66, qbVolatility: 55 },
  { name: "Bears", abbreviation: "CHI", city: "Chicago", conference: "NFC", division: "North", primaryColor: "#0B162A", secondaryColor: "#C83803", passOffenseRank: 26, runOffenseRank: 13, passDefenseRank: 9, runDefenseRank: 6, schemeComplexity: 56, qbVolatility: 68 },
  { name: "Lions", abbreviation: "DET", city: "Detroit", conference: "NFC", division: "North", primaryColor: "#0076B6", secondaryColor: "#B0B7BC", passOffenseRank: 2, runOffenseRank: 4, passDefenseRank: 19, runDefenseRank: 15, schemeComplexity: 74, qbVolatility: 42 },
  { name: "Packers", abbreviation: "GB", city: "Green Bay", conference: "NFC", division: "North", primaryColor: "#203731", secondaryColor: "#FFB612", passOffenseRank: 9, runOffenseRank: 7, passDefenseRank: 11, runDefenseRank: 11, schemeComplexity: 76, qbVolatility: 48 },
  { name: "Vikings", abbreviation: "MIN", city: "Minnesota", conference: "NFC", division: "North", primaryColor: "#4F2683", secondaryColor: "#FFC62F", passOffenseRank: 7, runOffenseRank: 6, passDefenseRank: 7, runDefenseRank: 4, schemeComplexity: 80, qbVolatility: 38 },
  { name: "Cowboys", abbreviation: "DAL", city: "Dallas", conference: "NFC", division: "East", primaryColor: "#003594", secondaryColor: "#869397", passOffenseRank: 6, runOffenseRank: 5, passDefenseRank: 13, runDefenseRank: 17, schemeComplexity: 72, qbVolatility: 45 },
  { name: "Giants", abbreviation: "NYG", city: "New York", conference: "NFC", division: "East", primaryColor: "#0B2265", secondaryColor: "#A71930", passOffenseRank: 27, runOffenseRank: 26, passDefenseRank: 21, runDefenseRank: 21, schemeComplexity: 54, qbVolatility: 70 },
  { name: "Eagles", abbreviation: "PHI", city: "Philadelphia", conference: "NFC", division: "East", primaryColor: "#004C54", secondaryColor: "#A5ACAF", passOffenseRank: 11, runOffenseRank: 2, passDefenseRank: 1, runDefenseRank: 1, schemeComplexity: 82, qbVolatility: 40 },
  { name: "Commanders", abbreviation: "WAS", city: "Washington", conference: "NFC", division: "East", primaryColor: "#5A1414", secondaryColor: "#FFB612", passOffenseRank: 16, runOffenseRank: 24, passDefenseRank: 23, runDefenseRank: 26, schemeComplexity: 58, qbVolatility: 58 },
  { name: "Falcons", abbreviation: "ATL", city: "Atlanta", conference: "NFC", division: "South", primaryColor: "#A71930", secondaryColor: "#000000", passOffenseRank: 17, runOffenseRank: 23, passDefenseRank: 25, runDefenseRank: 23, schemeComplexity: 60, qbVolatility: 55 },
  { name: "Panthers", abbreviation: "CAR", city: "Carolina", conference: "NFC", division: "South", primaryColor: "#0085CA", secondaryColor: "#101820", passOffenseRank: 29, runOffenseRank: 27, passDefenseRank: 17, runDefenseRank: 25, schemeComplexity: 46, qbVolatility: 78 },
  { name: "Saints", abbreviation: "NO", city: "New Orleans", conference: "NFC", division: "South", primaryColor: "#D3BC8D", secondaryColor: "#101820", passOffenseRank: 21, runOffenseRank: 28, passDefenseRank: 28, runDefenseRank: 27, schemeComplexity: 62, qbVolatility: 65 },
  { name: "Buccaneers", abbreviation: "TB", city: "Tampa Bay", conference: "NFC", division: "South", primaryColor: "#D50A0A", secondaryColor: "#FF7900", passOffenseRank: 13, runOffenseRank: 29, passDefenseRank: 9, runDefenseRank: 16, schemeComplexity: 68, qbVolatility: 52 },
  { name: "Cardinals", abbreviation: "ARI", city: "Arizona", conference: "NFC", division: "West", primaryColor: "#97233F", secondaryColor: "#000000", passOffenseRank: 30, runOffenseRank: 30, passDefenseRank: 27, runDefenseRank: 29, schemeComplexity: 44, qbVolatility: 80 },
  { name: "Rams", abbreviation: "LAR", city: "Los Angeles", conference: "NFC", division: "West", primaryColor: "#003594", secondaryColor: "#FFD100", passOffenseRank: 1, runOffenseRank: 1, passDefenseRank: 6, runDefenseRank: 2, schemeComplexity: 88, qbVolatility: 30 },
  { name: "49ers", abbreviation: "SF", city: "San Francisco", conference: "NFC", division: "West", primaryColor: "#AA0000", secondaryColor: "#B3995D", passOffenseRank: 8, runOffenseRank: 3, passDefenseRank: 4, runDefenseRank: 8, schemeComplexity: 84, qbVolatility: 42 },
  { name: "Seahawks", abbreviation: "SEA", city: "Seattle", conference: "NFC", division: "West", primaryColor: "#002244", secondaryColor: "#69BE28", passOffenseRank: 16, runOffenseRank: 19, passDefenseRank: 20, runDefenseRank: 22, schemeComplexity: 66, qbVolatility: 56 },
];

async function seed() {
  const db = getDb();

  console.log("Seeding teams...");
  await db.insert(teams).values(nflTeams);
  console.log(`Inserted ${nflTeams.length} teams`);

  const allTeams = await db.select().from(teams);
  const teamMap = new Map(allTeams.map(t => [t.abbreviation, t]));

  const week8Games = [
    { home: "BAL", away: "BUF", spread: -3.5, total: 47.5, day: "2026-10-26T20:20:00Z", primetime: true, venue: "M&T Bank Stadium" },
    { home: "KC", away: "DEN", spread: -7.5, total: 51.0, day: "2026-10-25T13:00:00Z", primetime: false, venue: "Arrowhead Stadium" },
    { home: "PHI", away: "DAL", spread: -4.0, total: 49.5, day: "2026-10-25T16:25:00Z", primetime: false, venue: "Lincoln Financial Field" },
    { home: "SF", away: "SEA", spread: -6.0, total: 45.0, day: "2026-10-25T13:00:00Z", primetime: false, venue: "Levi's Stadium" },
    { home: "DET", away: "GB", spread: -2.5, total: 52.5, day: "2026-10-25T13:00:00Z", primetime: false, venue: "Ford Field" },
    { home: "CIN", away: "CLE", spread: -1.5, total: 44.0, day: "2026-10-25T13:00:00Z", primetime: false, venue: "Paycor Stadium" },
    { home: "MIN", away: "CHI", spread: -8.5, total: 43.5, day: "2026-10-25T13:00:00Z", primetime: false, venue: "U.S. Bank Stadium" },
    { home: "LAR", away: "ARI", spread: -10.5, total: 48.0, day: "2026-10-25T16:05:00Z", primetime: false, venue: "SoFi Stadium" },
    { home: "MIA", away: "NYJ", spread: -3.0, total: 41.5, day: "2026-10-25T13:00:00Z", primetime: false, venue: "Hard Rock Stadium" },
    { home: "TB", away: "ATL", spread: -2.5, total: 46.0, day: "2026-10-25T13:00:00Z", primetime: false, venue: "Raymond James Stadium" },
  ];

  const gameRecords = week8Games.map(g => ({
    week: 8,
    season: 2026,
    homeTeamId: teamMap.get(g.home)!.id,
    awayTeamId: teamMap.get(g.away)!.id,
    gameDate: new Date(g.day),
    status: "scheduled" as const,
    spread: g.spread.toString(),
    total: g.total.toString(),
    weatherTemp: 68,
    weatherWind: 8,
    weatherPrecip: 0,
    venue: g.venue,
    primetime: g.primetime,
  }));

  console.log("Seeding games...");
  await db.insert(games).values(gameRecords);
  const allGames = await db.select().from(games);
  console.log(`Inserted ${allGames.length} games`);

  const predictionRecords = allGames.map(g => {
    const homeTeam = allTeams.find(t => t.id === g.homeTeamId)!;
    const awayTeam = allTeams.find(t => t.id === g.awayTeamId)!;
    const homeAdv = (homeTeam.passOffenseRank + homeTeam.runOffenseRank) / 2;
    const awayAdv = (awayTeam.passDefenseRank + awayTeam.runDefenseRank) / 2;
    const totalRank = homeAdv + awayAdv;
    const homeWinProb = Math.min(75, Math.max(25, 50 + (awayAdv - homeAdv) * 2));
    const chaosScore = Math.round((homeTeam.qbVolatility + awayTeam.qbVolatility + homeTeam.schemeComplexity * 0.3) / 2.3);
    const predictabilityIndex = Math.round(100 - chaosScore);

    return {
      gameId: g.id,
      predictedHomeScore: (totalRank / 4 + 3).toFixed(1),
      predictedAwayScore: (totalRank / 4 - 3).toFixed(1),
      confidenceScore: predictabilityIndex,
      chaosScore,
      predictabilityIndex,
      homeWinProbability: homeWinProb.toFixed(2),
      awayWinProbability: (100 - homeWinProb).toFixed(2),
      passGameAdvantage: Math.round(homeTeam.passOffenseRank - awayTeam.passDefenseRank),
      runGameAdvantage: Math.round(homeTeam.runOffenseRank - awayTeam.runDefenseRank),
      schemeMismatchScore: Math.round(Math.abs(homeTeam.schemeComplexity - awayTeam.schemeComplexity)),
      lineMovementSignal: Math.random() > 0.6 ? "sharp_home" : Math.random() > 0.5 ? "public_away" : "neutral" as const,
      sharpMoneyPercent: Math.round(35 + Math.random() * 30),
      publicBettingPercent: Math.round(40 + Math.random() * 20),
      analystConsensus: Math.round(45 + Math.random() * 10),
      varianceFactors: JSON.stringify({ weatherImpact: g.weatherWind > 15 ? "high" : "low", qbStability: homeTeam.qbVolatility < 45 ? "stable" : "volatile", injuries: "minimal" }),
      schemeFactors: JSON.stringify({ homeScheme: homeTeam.schemeComplexity > 70 ? "complex" : "simple", awayScheme: awayTeam.schemeComplexity > 70 ? "complex" : "simple", mismatchType: homeTeam.passOffenseRank < awayTeam.passDefenseRank ? "pass_advantage" : "neutral" }),
    };
  });

  console.log("Seeding predictions...");
  await db.insert(predictions).values(predictionRecords);
  console.log(`Inserted ${predictionRecords.length} predictions`);

  const narrativeData = allGames.slice(0, 3).map(g => {
    const homeTeam = allTeams.find(t => t.id === g.homeTeamId)!;
    const awayTeam = allTeams.find(t => t.id === g.awayTeamId)!;
    return {
      gameId: g.id,
      narrativeType: "pregame" as const,
      title: `${awayTeam.name} @ ${homeTeam.name}: Predictability Breakdown`,
      content: `This matchup between the ${awayTeam.name} and ${homeTeam.name} presents a fascinating predictability profile. The ${homeTeam.name} enter with a scheme complexity rating of ${homeTeam.schemeComplexity}, suggesting a multi-layered game plan that could either create mismatches or collapse under pressure. With QB volatility at ${homeTeam.qbVolatility}, this game carries significant narrative potential for broadcast storytelling.`,
      scriptOutline: JSON.stringify({ intro: "Set the scene with venue atmosphere", body: ["Scheme mismatch analysis", "Key personnel battles", "Weather/conditions impact"], outro: "Predictability score reveal and contrarian angle" }),
      keyTalkingPoints: JSON.stringify(["Scheme complexity differential", "QB volatility under pressure", "Line movement sharp money signals"]),
      broadcastReady: true,
      format169: true,
      format916: true,
      aiGenerated: true,
      aiModel: "gridiron-narrative-v1",
      confidenceRating: 85,
    };
  });

  console.log("Seeding narratives...");
  await db.insert(narratives).values(narrativeData);
  console.log(`Inserted ${narrativeData.length} narratives`);

  console.log("Seed complete!");
}

seed().catch(console.error);
