// ESPN public API — no key required
const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/football/nfl";

type EspnTeam = {
  id: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  location: string;
  color: string;
  alternateColor: string;
  logos: { href: string }[];
};

type EspnCompetitor = {
  id: string;
  homeAway: "home" | "away";
  team: EspnTeam;
  score: string;
};

type EspnEvent = {
  id: string;
  date: string;
  name: string;
  shortName: string;
  season: { year: number };
  week: { number: number };
  competitions: {
    id: string;
    venue: { fullName: string };
    competitors: EspnCompetitor[];
    status: {
      type: { name: string; state: string; completed: boolean };
    };
  }[];
};

export async function fetchEspnScoreboard(
  week?: number,
  season?: number,
): Promise<EspnEvent[]> {
  const params = new URLSearchParams();
  if (week) params.set("week", week.toString());
  if (season) params.set("dates", season.toString());

  const url = `${ESPN_BASE}/scoreboard?${params}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`ESPN scoreboard failed: ${resp.status}`);
  const data = await resp.json();
  return data.events ?? [];
}

export async function fetchEspnTeams(): Promise<EspnTeam[]> {
  const resp = await fetch(`${ESPN_BASE}/teams`);
  if (!resp.ok) throw new Error(`ESPN teams failed: ${resp.status}`);
  const data = await resp.json();
  return (
    data.sports?.[0]?.leagues?.[0]?.teams?.map(
      (t: { team: EspnTeam }) => t.team,
    ) ?? []
  );
}

export function mapEspnStatus(
  espnStatus: string,
): "scheduled" | "live" | "halftime" | "final" | "postponed" {
  switch (espnStatus) {
    case "STATUS_SCHEDULED":
    case "STATUS_FIRST_HALF":
      return "scheduled";
    case "STATUS_IN_PROGRESS":
      return "live";
    case "STATUS_HALFTIME":
      return "halftime";
    case "STATUS_FINAL":
    case "STATUS_FINAL_OVERTIME":
      return "final";
    case "STATUS_POSTPONED":
    case "STATUS_CANCELED":
      return "postponed";
    default:
      return "scheduled";
  }
}

export type { EspnEvent, EspnTeam, EspnCompetitor };
