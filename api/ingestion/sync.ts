import { getDb } from "../queries/connection";
import { teams, games, lineMovements, syncLogs } from "@db/schema";
import { eq } from "drizzle-orm";
import {
  fetchBdlTeams,
  fetchBdlGames,
  mapBdlStatus,
} from "./balldontlie";
import {
  fetchEspnScoreboard,
  fetchEspnTeams,
  mapEspnStatus,
} from "./espn";
import { fetchNflOdds, extractSpreadAndTotal } from "./odds";

async function logSync(
  type: "schedules" | "scores" | "odds" | "teams",
  fn: () => Promise<number>,
) {
  const db = getDb();
  const [log] = await db
    .insert(syncLogs)
    .values({ syncType: type, status: "running" });
  const logId = Number(log.insertId);

  try {
    const count = await fn();
    await db
      .update(syncLogs)
      .set({ status: "completed", recordsProcessed: count, completedAt: new Date() })
      .where(eq(syncLogs.id, logId));
    return count;
  } catch (err: any) {
    await db
      .update(syncLogs)
      .set({ status: "failed", errorMessage: err.message, completedAt: new Date() })
      .where(eq(syncLogs.id, logId));
    throw err;
  }
}

// ── Teams: balldontlie primary, ESPN fallback ──────────────────

export async function syncTeams() {
  return logSync("teams", async () => {
    const db = getDb();
    let count = 0;

    try {
      // Primary: balldontlie
      const bdlTeams = await fetchBdlTeams();
      for (const bt of bdlTeams) {
        const existing = await db
          .select()
          .from(teams)
          .where(eq(teams.abbreviation, bt.abbreviation))
          .limit(1);

        if (existing[0]) {
          await db
            .update(teams)
            .set({
              name: bt.name,
              city: bt.location,
              conference: bt.conference as any,
              division: bt.division as any,
            })
            .where(eq(teams.id, existing[0].id));
        } else {
          await db.insert(teams).values({
            name: bt.name,
            abbreviation: bt.abbreviation,
            city: bt.location,
            conference: (bt.conference === "AFC" ? "AFC" : "NFC") as any,
            division: bt.division as any,
          });
        }
        count++;
      }

      // Supplement with ESPN for logos and colors
      try {
        const espnTeams = await fetchEspnTeams();
        for (const et of espnTeams) {
          const existing = await db
            .select()
            .from(teams)
            .where(eq(teams.abbreviation, et.abbreviation))
            .limit(1);

          if (existing[0]) {
            await db
              .update(teams)
              .set({
                primaryColor: `#${et.color}`,
                secondaryColor: `#${et.alternateColor}`,
                logoUrl: et.logos?.[0]?.href ?? existing[0].logoUrl,
              })
              .where(eq(teams.id, existing[0].id));
          }
        }
      } catch (espnErr) {
        console.warn("[sync] ESPN team supplement failed, continuing:", espnErr);
      }
    } catch (bdlErr) {
      // Fallback: ESPN only
      console.warn("[sync] balldontlie teams failed, falling back to ESPN:", bdlErr);
      const espnTeams = await fetchEspnTeams();
      for (const et of espnTeams) {
        const existing = await db
          .select()
          .from(teams)
          .where(eq(teams.abbreviation, et.abbreviation))
          .limit(1);

        if (existing[0]) {
          await db
            .update(teams)
            .set({
              name: et.shortDisplayName,
              city: et.location,
              primaryColor: `#${et.color}`,
              secondaryColor: `#${et.alternateColor}`,
              logoUrl: et.logos?.[0]?.href ?? null,
            })
            .where(eq(teams.id, existing[0].id));
        } else {
          await db.insert(teams).values({
            name: et.shortDisplayName,
            abbreviation: et.abbreviation,
            city: et.location,
            conference: "AFC",
            division: "North",
            primaryColor: `#${et.color}`,
            secondaryColor: `#${et.alternateColor}`,
            logoUrl: et.logos?.[0]?.href ?? null,
          });
        }
        count++;
      }
    }

    return count;
  });
}

// ── Scores: balldontlie primary, ESPN fallback ─────────────────

export async function syncScheduleAndScores(week?: number, season?: number) {
  return logSync("scores", async () => {
    const db = getDb();
    const allTeams = await db.select().from(teams);
    const teamByAbbr = new Map(allTeams.map((t) => [t.abbreviation, t]));
    let count = 0;

    try {
      // Primary: balldontlie
      const bdlGames = await fetchBdlGames(season, week);

      for (const bg of bdlGames) {
        const homeTeam = teamByAbbr.get(bg.home_team.abbreviation);
        const awayTeam = teamByAbbr.get(bg.visitor_team.abbreviation);
        if (!homeTeam || !awayTeam) continue;

        const status = mapBdlStatus(bg.status);
        const externalId = `bdl_${bg.id}`;

        const existing = await db
          .select()
          .from(games)
          .where(eq(games.externalId, externalId))
          .limit(1);

        if (existing[0]) {
          await db
            .update(games)
            .set({
              status,
              homeScore: bg.home_team_score,
              awayScore: bg.visitor_team_score,
            })
            .where(eq(games.id, existing[0].id));
        } else {
          await db.insert(games).values({
            externalId,
            week: bg.week,
            season: bg.season,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            gameDate: new Date(bg.date),
            status,
            homeScore: bg.home_team_score,
            awayScore: bg.visitor_team_score,
            venue: bg.venue,
            primetime: new Date(bg.date).getUTCHours() >= 23,
          });
        }
        count++;
      }
    } catch (bdlErr) {
      // Fallback: ESPN
      console.warn("[sync] balldontlie scores failed, falling back to ESPN:", bdlErr);
      const events = await fetchEspnScoreboard(week, season);

      for (const event of events) {
        const comp = event.competitions[0];
        if (!comp) continue;

        const home = comp.competitors.find((c) => c.homeAway === "home");
        const away = comp.competitors.find((c) => c.homeAway === "away");
        if (!home || !away) continue;

        const homeTeam = teamByAbbr.get(home.team.abbreviation);
        const awayTeam = teamByAbbr.get(away.team.abbreviation);
        if (!homeTeam || !awayTeam) continue;

        const status = mapEspnStatus(comp.status.type.name);
        const externalId = `espn_${event.id}`;

        const existing = await db
          .select()
          .from(games)
          .where(eq(games.externalId, externalId))
          .limit(1);

        if (existing[0]) {
          await db
            .update(games)
            .set({
              status,
              homeScore: status === "final" || status === "live" ? parseInt(home.score) || null : existing[0].homeScore,
              awayScore: status === "final" || status === "live" ? parseInt(away.score) || null : existing[0].awayScore,
            })
            .where(eq(games.id, existing[0].id));
        } else {
          await db.insert(games).values({
            externalId,
            week: event.week?.number ?? 1,
            season: event.season?.year ?? new Date().getFullYear(),
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            gameDate: new Date(event.date),
            status,
            homeScore: parseInt(home.score) || null,
            awayScore: parseInt(away.score) || null,
            venue: comp.venue?.fullName ?? null,
            primetime: new Date(event.date).getUTCHours() >= 23,
          });
        }
        count++;
      }
    }

    return count;
  });
}

// ── Odds: The Odds API ─────────────────────────────────────────

export async function syncOdds() {
  return logSync("odds", async () => {
    const db = getDb();
    const oddsEvents = await fetchNflOdds();
    const allTeams = await db.select().from(teams);
    const allGames = await db.select().from(games);

    const teamByName = new Map<string, (typeof allTeams)[0]>();
    for (const t of allTeams) {
      teamByName.set(t.city + " " + t.name, t);
      teamByName.set(t.name, t);
    }

    let count = 0;

    for (const oe of oddsEvents) {
      const homeTeam = teamByName.get(oe.home_team);
      const awayTeam = teamByName.get(oe.away_team);
      if (!homeTeam || !awayTeam) continue;

      const matchDate = new Date(oe.commence_time);
      const game = allGames.find(
        (g) =>
          g.homeTeamId === homeTeam.id &&
          g.awayTeamId === awayTeam.id &&
          Math.abs(new Date(g.gameDate).getTime() - matchDate.getTime()) <
            24 * 60 * 60 * 1000,
      );
      if (!game) continue;

      const { spread, total, homeMoneyline, awayMoneyline, sportsbook } =
        extractSpreadAndTotal(oe.bookmakers);

      if (spread !== null || total !== null) {
        await db
          .update(games)
          .set({
            spread: spread?.toString() ?? game.spread,
            total: total?.toString() ?? game.total,
          })
          .where(eq(games.id, game.id));
      }

      if (sportsbook) {
        await db.insert(lineMovements).values({
          gameId: game.id,
          sportsbook,
          currentSpread: spread?.toString() ?? null,
          currentTotal: total?.toString() ?? null,
          homeMoneyline,
          awayMoneyline,
        });
      }
      count++;
    }
    return count;
  });
}
