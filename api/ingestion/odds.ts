// The Odds API — free tier: 500 requests/month
// https://the-odds-api.com/
import { env } from "../lib/env";

const ODDS_BASE = "https://api.the-odds-api.com/v4";

type OddsOutcome = {
  name: string;
  price: number;
  point?: number;
};

type OddsMarket = {
  key: string;
  outcomes: OddsOutcome[];
};

type OddsBookmaker = {
  key: string;
  title: string;
  markets: OddsMarket[];
};

type OddsEvent = {
  id: string;
  sport_key: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsBookmaker[];
};

export async function fetchNflOdds(): Promise<OddsEvent[]> {
  if (!env.oddsApiKey) {
    console.warn("[odds] ODDS_API_KEY not set, skipping odds fetch");
    return [];
  }

  const params = new URLSearchParams({
    apiKey: env.oddsApiKey,
    regions: "us",
    markets: "spreads,totals,h2h",
    oddsFormat: "american",
  });

  const resp = await fetch(
    `${ODDS_BASE}/sports/americanfootball_nfl/odds?${params}`,
  );
  if (!resp.ok) throw new Error(`Odds API failed: ${resp.status}`);
  return resp.json();
}

export function extractSpreadAndTotal(bookmakers: OddsBookmaker[]) {
  // Prefer FanDuel or DraftKings, fall back to first available
  const preferred = bookmakers.find(
    (b) => b.key === "fanduel" || b.key === "draftkings",
  );
  const book = preferred ?? bookmakers[0];
  if (!book) return { spread: null, total: null, homeMoneyline: null, awayMoneyline: null };

  const spreads = book.markets.find((m) => m.key === "spreads");
  const totals = book.markets.find((m) => m.key === "totals");
  const h2h = book.markets.find((m) => m.key === "h2h");

  const homeSpread = spreads?.outcomes.find((o) => o.name !== "Away")?.point ?? null;
  const totalPoints = totals?.outcomes.find((o) => o.name === "Over")?.point ?? null;
  const homeML = h2h?.outcomes?.[0]?.price ?? null;
  const awayML = h2h?.outcomes?.[1]?.price ?? null;

  return {
    spread: homeSpread,
    total: totalPoints,
    homeMoneyline: homeML,
    awayMoneyline: awayML,
    sportsbook: book.title,
  };
}

export type { OddsEvent, OddsBookmaker };
