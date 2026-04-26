// balldontlie NFL API — https://docs.balldontlie.io
// Free tier available, covers 2002-current
import { env } from "../lib/env";

const BDL_BASE = "https://api.balldontlie.io/nfl/v1";

function headers() {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (env.balldontlieApiKey) {
    h["Authorization"] = env.balldontlieApiKey;
  }
  return h;
}

async function bdlFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BDL_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const resp = await fetch(url.toString(), { headers: headers() });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`balldontlie ${path} failed (${resp.status}): ${text}`);
  }
  return resp.json();
}

// ── Types ──────────────────────────────────────────────────────

export type BdlTeam = {
  id: number;
  conference: string;
  division: string;
  location: string;
  name: string;
  full_name: string;
  abbreviation: string;
};

export type BdlGame = {
  id: number;
  date: string;
  season: number;
  week: number;
  status: string;
  home_team: BdlTeam;
  visitor_team: BdlTeam;
  home_team_score: number | null;
  visitor_team_score: number | null;
  venue: string | null;
};

export type BdlStanding = {
  team: BdlTeam;
  wins: number;
  losses: number;
  ties: number;
  conference_rank: number;
  division_rank: number;
};

type BdlResponse<T> = {
  data: T[];
  meta?: { next_cursor?: number; per_page?: number };
};

// ── Fetchers ───────────────────────────────────────────────────

export async function fetchBdlTeams(): Promise<BdlTeam[]> {
  const result = await bdlFetch<BdlResponse<BdlTeam>>("/teams");
  return result.data;
}

export async function fetchBdlGames(
  season?: number,
  week?: number,
): Promise<BdlGame[]> {
  const params: Record<string, string> = {};
  if (season) params["seasons[]"] = season.toString();
  if (week) params["weeks[]"] = week.toString();
  params["per_page"] = "100";

  const result = await bdlFetch<BdlResponse<BdlGame>>("/games", params);
  return result.data;
}

export async function fetchBdlStandings(
  season: number,
): Promise<BdlStanding[]> {
  const result = await bdlFetch<BdlResponse<BdlStanding>>("/standings", {
    season: season.toString(),
  });
  return result.data;
}

// ── Status mapping ─────────────────────────────────────────────

export function mapBdlStatus(
  status: string,
): "scheduled" | "live" | "halftime" | "final" | "postponed" {
  const s = status.toLowerCase();
  if (s.includes("final")) return "final";
  if (s.includes("progress") || s.includes("live")) return "live";
  if (s.includes("half")) return "halftime";
  if (s.includes("postpone") || s.includes("cancel")) return "postponed";
  return "scheduled";
}
