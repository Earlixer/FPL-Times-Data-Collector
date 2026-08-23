import type {
  FplPlayer,
  FplTeam,
  FplLivePlayer
} from "./types/fpl.js";

import type {
  NewsroomPlayer
} from "./types/newsroom.js";

export function normalizePlayer(
  player: FplPlayer,
  teams: FplTeam[],
  livePlayer?: FplLivePlayer
): NewsroomPlayer {
  const team = teams.find(
    (team) => team.id === player.team
  );

  if (!team) {
    throw new Error(
      `Unable to find team ${player.team} for player ${player.id}`
    );
  }

  const liveStats = livePlayer?.stats;

  return {
    playerId: player.id,

    name: `${player.first_name} ${player.second_name}`,

    club: team.name,

    clubId: team.id,

    position: getPositionName(
      player.element_type
    ),

    price: player.now_cost / 10,

    ownership: {
      selectedByPercent: Number(
        player.selected_by_percent
      ),

      transfersIn: player.transfers_in,

      transfersOut: player.transfers_out
    },

    form: {
      current: Number(player.form),

      pointsPerGame: Number(
        player.points_per_game
      ),

      priceChange:
        player.cost_change_event / 10
    },

    gameweek: {
      points:
        liveStats?.total_points ??
        player.event_points,

      minutes:
        liveStats?.minutes ??
        player.minutes,

      goals:
        liveStats?.goals_scored ??
        player.goals_scored,

      assists:
        liveStats?.assists ??
        player.assists,

      cleanSheets:
        liveStats?.clean_sheets ??
        player.clean_sheets,

      goalsConceded:
        liveStats?.goals_conceded ??
        player.goals_conceded,

      bonus:
        liveStats?.bonus ??
        player.bonus,

      bonusPointsSystem:
        liveStats?.bps ??
        player.bps,

      yellowCards:
        liveStats?.yellow_cards ??
        0,

      redCards:
        liveStats?.red_cards ??
        0
    },

    season: {
      totalPoints:
        player.total_points,

      goals:
        player.goals_scored,

      assists:
        player.assists,

      cleanSheets:
        player.clean_sheets,

      minutes:
        player.minutes
    }
  };
}

function getPositionName(
  elementType: number
): string {
  switch (elementType) {
    case 1:
      return "GKP";

    case 2:
      return "DEF";

    case 3:
      return "MID";

    case 4:
      return "FWD";

    default:
      throw new Error(
        `Unknown FPL position type: ${elementType}`
      );
  }
}