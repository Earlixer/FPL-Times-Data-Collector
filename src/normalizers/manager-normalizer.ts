import type {
  FplManagerPicksResponse,
  FplTransfer
} from "../types/fpl.js";

import type {
  ManagerConfig
} from "../types.js";

import type {
  NewsroomManager,
  NewsroomSquadPlayer,
  NewsroomTransfer
} from "../types/newsroom.js";

export function normalizeManager(
  manager: ManagerConfig,
  picks: FplManagerPicksResponse,
  transfers: FplTransfer[] = []
): NewsroomManager {
  const squadPlayers: NewsroomSquadPlayer[] =
    picks.picks.map((player) => ({
      playerId: player.element,
      position: player.position,
      multiplier: player.multiplier,
      isCaptain: player.is_captain,
      isViceCaptain: player.is_vice_captain
    }));

  const startingXI = squadPlayers.filter(
    (player) => player.position <= 11
  );

  const bench = squadPlayers.filter(
    (player) => player.position > 11
  );

  const captain = squadPlayers.find(
    (player) => player.isCaptain
  );

  const viceCaptain = squadPlayers.find(
    (player) => player.isViceCaptain
  );

  const newsroomTransfers: NewsroomTransfer[] =
    transfers.map((transfer) => ({
      playerIn: transfer.element_in,
      playerOut: transfer.element_out,
      purchasePrice:
        transfer.element_in_cost / 10,
      sellingPrice:
        transfer.element_out_cost / 10
    }));

  return {
    entryId: manager.entryId,

    name: manager.name,

    teamName: manager.teamName,

    performance: {
      gameweekPoints:
        picks.entry_history.points,

      totalPoints:
        picks.entry_history.total_points,

      overallRank:
        picks.entry_history.overall_rank,

      rankChange: null
    },

    team: {
      value:
        picks.entry_history.value / 10,

      bank:
        picks.entry_history.bank / 10,

      transfers:
        picks.entry_history.event_transfers,

      transferCost:
        picks.entry_history.event_transfers_cost
    },

    captain: captain
      ? {
          playerId: captain.playerId,
          multiplier: captain.multiplier
        }
      : null,

    viceCaptain: viceCaptain
      ? {
          playerId: viceCaptain.playerId
        }
      : null,

    squad: {
      startingXI,
      bench
    },

    transfers: newsroomTransfers,

    chip: picks.active_chip
  };
}