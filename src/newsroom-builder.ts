import type { FplLeagueStandingsResponse } from "./fpl-client.js";

import type {
  FplNewsroomData,
  NewsroomCompetition,
  NewsroomStanding
} from "./types/newsroom.js";

export function buildCompetition(
  data: FplLeagueStandingsResponse
): NewsroomCompetition {
  const standings: NewsroomStanding[] =
    data.standings.results.map((manager) => ({
      entryId: manager.entry,
      rank: manager.rank,
      previousRank: manager.last_rank,

      rankChange:
        manager.last_rank > 0
          ? manager.last_rank - manager.rank
          : null,

      gameweekPoints: manager.event_total,
      totalPoints: manager.total
    }));

  return {
    name: data.league.name,
    fplLeagueId: data.league.id,
    standings
  };
}

export function buildNewsroomData(
  season: string,
  gameweek: number,
  competitions: {
    main: FplLeagueStandingsResponse;
    premier: FplLeagueStandingsResponse;
    europa: FplLeagueStandingsResponse;
  }
): FplNewsroomData {
  return {
    metadata: {
      schemaVersion: "1.0",
      collectorVersion: "0.1.0",
      season,
      gameweek,
      collectedAt: new Date().toISOString()
    },

    gameweek: {
      id: gameweek,
      name: `Gameweek ${gameweek}`,
      finished: false,
      dataChecked: false
    },

    competitions: {
      main: buildCompetition(
        competitions.main
      ),

      premier: buildCompetition(
        competitions.premier
      ),

      europa: buildCompetition(
        competitions.europa
      )
    },

    managers: [],

    players: [],

    fixtures: [],

    editorialSignals: {
      highestGameweekScore: null,
      lowestGameweekScore: null,
      biggestRankRise: null,
      biggestRankFall: null,
      bestCaptain: null,
      worstCaptain: null,
      mostCaptainedPlayer: null,
      mostSelectedPlayer: null,
      biggestDifferential: null,
      mostTransferredIn: null,
      mostTransferredOut: null
    }
  };
}