import type {
  NewsroomEditorialSignals,
  NewsroomManager,
  NewsroomPlayer,
  EditorialSignalSet,
  EditorialManagerSignal,
  EditorialCaptainSignal,
  EditorialPlayerSignal
} from "./types/newsroom.js";

export function calculateEditorialSignals(
  managers: NewsroomManager[],
  players: NewsroomPlayer[],
  competitionManagerIds: {
    main: Set<number>;
    premier: Set<number>;
    europa: Set<number>;
  }
): NewsroomEditorialSignals {
  const mainManagers =
    managers.filter((manager) =>
      competitionManagerIds.main.has(
        manager.entryId
      )
    );

  const premierManagers =
    managers.filter((manager) =>
      competitionManagerIds.premier.has(
        manager.entryId
      )
    );

  const europaManagers =
    managers.filter((manager) =>
      competitionManagerIds.europa.has(
        manager.entryId
      )
    );

  return {
    global: calculateSignalSet(
      managers,
      players
    ),

    main: calculateSignalSet(
      mainManagers,
      players
    ),

    premier: calculateSignalSet(
      premierManagers,
      players
    ),

    europa: calculateSignalSet(
      europaManagers,
      players
    )
  };
}

function calculateSignalSet(
  managers: NewsroomManager[],
  players: NewsroomPlayer[]
): EditorialSignalSet {
  return {
    highestGameweekScore:
      getHighestGameweekScore(managers),

    lowestGameweekScore:
      getLowestGameweekScore(managers),

    biggestRankRise:
      getBiggestRankRise(managers),

    biggestRankFall:
      getBiggestRankFall(managers),

    bestCaptain:
      getBestCaptain(
        managers,
        players
      ),

    worstCaptain:
      getWorstCaptain(
        managers,
        players
      ),

    mostCaptainedPlayer:
      getMostCaptainedPlayer(
        managers
      ),

    mostSelectedPlayer:
      getMostSelectedPlayer(
        managers,
        players
      ),

    biggestDifferential:
      getBiggestDifferential(
        managers,
        players
      ),

    mostTransferredIn:
      getMostTransferredIn(
        managers
      ),

    mostTransferredOut:
      getMostTransferredOut(
        managers
      )
  };
}

function getHighestGameweekScore(
  managers: NewsroomManager[]
): EditorialManagerSignal | null {
  if (managers.length === 0) {
    return null;
  }

  const manager = managers.reduce(
    (best, current) =>
      current.performance.gameweekPoints >
      best.performance.gameweekPoints
        ? current
        : best
  );

  return {
    entryId: manager.entryId,
    name: manager.name,
    teamName: manager.teamName,
    value: manager.performance.gameweekPoints
  };
}

function getLowestGameweekScore(
  managers: NewsroomManager[]
): EditorialManagerSignal | null {
  if (managers.length === 0) {
    return null;
  }

  const manager = managers.reduce(
    (worst, current) =>
      current.performance.gameweekPoints <
      worst.performance.gameweekPoints
        ? current
        : worst
  );

  return {
    entryId: manager.entryId,
    name: manager.name,
    teamName: manager.teamName,
    value: manager.performance.gameweekPoints
  };
}

function getBiggestRankRise(
  managers: NewsroomManager[]
): EditorialManagerSignal | null {
  const eligible = managers.filter(
    (manager) =>
      manager.performance.rankChange !== null
  );

  if (eligible.length === 0) {
    return null;
  }

  const manager = eligible.reduce(
    (best, current) =>
      (current.performance.rankChange ?? 0) >
      (best.performance.rankChange ?? 0)
        ? current
        : best
  );

  return {
    entryId: manager.entryId,
    name: manager.name,
    teamName: manager.teamName,
    value:
      manager.performance.rankChange ?? 0
  };
}

function getBiggestRankFall(
  managers: NewsroomManager[]
): EditorialManagerSignal | null {
  const eligible = managers.filter(
    (manager) =>
      manager.performance.rankChange !== null
  );

  if (eligible.length === 0) {
    return null;
  }

  const manager = eligible.reduce(
    (worst, current) =>
      (current.performance.rankChange ?? 0) <
      (worst.performance.rankChange ?? 0)
        ? current
        : worst
  );

  return {
    entryId: manager.entryId,
    name: manager.name,
    teamName: manager.teamName,
    value:
      manager.performance.rankChange ?? 0
  };
}

function getBestCaptain(
  managers: NewsroomManager[],
  players: NewsroomPlayer[]
): EditorialCaptainSignal | null {
  const signals: EditorialCaptainSignal[] = [];

  for (const manager of managers) {
    if (!manager.captain) {
      continue;
    }

    const player = players.find(
      (candidate) =>
        candidate.playerId ===
        manager.captain?.playerId
    );

    if (!player) {
      continue;
    }

    signals.push({
      managerEntryId: manager.entryId,
      managerName: manager.name,
      teamName: manager.teamName,
      playerId: player.playerId,
      points: player.gameweek.points,
      multiplier: manager.captain.multiplier,
      captainPoints:
        player.gameweek.points *
        manager.captain.multiplier
    });
  }

  if (signals.length === 0) {
    return null;
  }

  return signals.reduce(
    (best, current) =>
      current.captainPoints >
      best.captainPoints
        ? current
        : best
  );
}

function getWorstCaptain(
  managers: NewsroomManager[],
  players: NewsroomPlayer[]
): EditorialCaptainSignal | null {
  const signals: EditorialCaptainSignal[] = [];

  for (const manager of managers) {
    if (!manager.captain) {
      continue;
    }

    const player = players.find(
      (candidate) =>
        candidate.playerId ===
        manager.captain?.playerId
    );

    if (!player) {
      continue;
    }

    signals.push({
      managerEntryId: manager.entryId,
      managerName: manager.name,
      teamName: manager.teamName,
      playerId: player.playerId,
      points: player.gameweek.points,
      multiplier: manager.captain.multiplier,
      captainPoints:
        player.gameweek.points *
        manager.captain.multiplier
    });
  }

  if (signals.length === 0) {
    return null;
  }

  return signals.reduce(
    (worst, current) =>
      current.captainPoints <
      worst.captainPoints
        ? current
        : worst
  );
}

function getMostCaptainedPlayer(
  managers: NewsroomManager[]
): EditorialPlayerSignal | null {
  const counts =
    new Map<number, number>();

  for (const manager of managers) {
    if (!manager.captain) {
      continue;
    }

    const playerId =
      manager.captain.playerId;

    counts.set(
      playerId,
      (counts.get(playerId) ?? 0) + 1
    );
  }

  let bestPlayerId: number | null = null;
  let bestCount = 0;

  for (const [playerId, count] of counts) {
    if (count > bestCount) {
      bestPlayerId = playerId;
      bestCount = count;
    }
  }

  if (bestPlayerId === null) {
    return null;
  }

  return {
    playerId: bestPlayerId,
    value: bestCount
  };
}

function getMostSelectedPlayer(
  managers: NewsroomManager[],
  players: NewsroomPlayer[]
): EditorialPlayerSignal | null {
  let best: EditorialPlayerSignal | null =
    null;

  for (const player of players) {
    let count = 0;

    for (const manager of managers) {
      const selected =
        manager.squad.startingXI.some(
          (squadPlayer) =>
            squadPlayer.playerId ===
            player.playerId
        ) ||
        manager.squad.bench.some(
          (squadPlayer) =>
            squadPlayer.playerId ===
            player.playerId
        );

      if (selected) {
        count++;
      }
    }

    if (
      best === null ||
      count > best.value
    ) {
      best = {
        playerId: player.playerId,
        value: count
      };
    }
  }

  return best;
}

function getBiggestDifferential(
  managers: NewsroomManager[],
  players: NewsroomPlayer[]
): EditorialPlayerSignal | null {
  let best: EditorialPlayerSignal | null =
    null;

  for (const player of players) {
    let count = 0;

    for (const manager of managers) {
      const selected =
        manager.squad.startingXI.some(
          (squadPlayer) =>
            squadPlayer.playerId ===
            player.playerId
        ) ||
        manager.squad.bench.some(
          (squadPlayer) =>
            squadPlayer.playerId ===
            player.playerId
        );

      if (selected) {
        count++;
      }
    }

    if (count === 0) {
      continue;
    }

    if (
      best === null ||
      count < best.value
    ) {
      best = {
        playerId: player.playerId,
        value: count
      };
    }
  }

  return best;
}

function getMostTransferredIn(
  managers: NewsroomManager[]
): EditorialPlayerSignal | null {
  const counts =
    new Map<number, number>();

  for (const manager of managers) {
    for (const transfer of manager.transfers) {
      counts.set(
        transfer.playerIn,
        (counts.get(transfer.playerIn) ?? 0) + 1
      );
    }
  }

  let bestPlayerId: number | null = null;
  let bestCount = 0;

  for (const [playerId, count] of counts) {
    if (count > bestCount) {
      bestPlayerId = playerId;
      bestCount = count;
    }
  }

  if (bestPlayerId === null) {
    return null;
  }

  return {
    playerId: bestPlayerId,
    value: bestCount
  };
}

function getMostTransferredOut(
  managers: NewsroomManager[]
): EditorialPlayerSignal | null {
  const counts =
    new Map<number, number>();

  for (const manager of managers) {
    for (const transfer of manager.transfers) {
      counts.set(
        transfer.playerOut,
        (counts.get(transfer.playerOut) ?? 0) + 1
      );
    }
  }

  let bestPlayerId: number | null = null;
  let bestCount = 0;

  for (const [playerId, count] of counts) {
    if (count > bestCount) {
      bestPlayerId = playerId;
      bestCount = count;
    }
  }

  if (bestPlayerId === null) {
    return null;
  }

  return {
    playerId: bestPlayerId,
    value: bestCount
  };
}