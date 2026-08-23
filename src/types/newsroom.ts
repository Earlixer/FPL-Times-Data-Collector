export interface FplNewsroomData {
  metadata: {
    schemaVersion: string;
    collectorVersion: string;
    season: string;
    gameweek: number;
    collectedAt: string;
  };

  gameweek: {
    id: number;
    name: string;
    finished: boolean;
    dataChecked: boolean;
  };

  competitions: {
    main: NewsroomCompetition;
    premier: NewsroomCompetition;
    europa: NewsroomCompetition;
  };

  managers: NewsroomManager[];

  players: NewsroomPlayer[];

  fixtures: NewsroomFixture[];

  editorialSignals: NewsroomEditorialSignals;
}

export interface NewsroomCompetition {
  name: string;
  fplLeagueId: number;
  standings: NewsroomStanding[];
}

export interface NewsroomStanding {
  entryId: number;
  rank: number;
  previousRank: number;
  rankChange: number | null;
  gameweekPoints: number;
  totalPoints: number;
}

export interface NewsroomManager {
  entryId: number;
  name: string;
  teamName: string;

  performance: {
    gameweekPoints: number;
    totalPoints: number;
    overallRank: number;
    rankChange: number | null;
  };

  team: {
    value: number;
    bank: number;
    transfers: number;
    transferCost: number;
  };

  captain: {
    playerId: number;
    multiplier: number;
  } | null;

  viceCaptain: {
    playerId: number;
  } | null;

  squad: {
    startingXI: NewsroomSquadPlayer[];
    bench: NewsroomSquadPlayer[];
  };

  transfers: NewsroomTransfer[];

  chip: string | null;
}

export interface NewsroomSquadPlayer {
  playerId: number;
  position: number;
  multiplier: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
}

export interface NewsroomTransfer {
  playerIn: number;
  playerOut: number;
  purchasePrice: number;
  sellingPrice: number;
}

export interface NewsroomPlayer {
  playerId: number;

  name: string;
  club: string;
  clubId: number;
  position: string;

  price: number;

  ownership: {
    selectedByPercent: number;
    transfersIn: number;
    transfersOut: number;
  };

  form: {
    current: number;
    pointsPerGame: number;
    priceChange: number;
  };

  gameweek: {
    points: number;
    minutes: number;
    goals: number;
    assists: number;
    cleanSheets: number;
    goalsConceded: number;
    bonus: number;
    bonusPointsSystem: number;
    yellowCards: number;
    redCards: number;
  };

  season: {
    totalPoints: number;
    goals: number;
    assists: number;
    cleanSheets: number;
    minutes: number;
  };
}

export interface NewsroomFixture {
  fixtureId: number;
  gameweek: number;
  homeTeamId: number;
  homeTeam: string;
  awayTeamId: number;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  finished: boolean;
}

export interface NewsroomEditorialSignals {
  global: EditorialSignalSet;
  main: EditorialSignalSet;
  premier: EditorialSignalSet;
  europa: EditorialSignalSet;
}

export interface EditorialSignalSet {
  highestGameweekScore: EditorialManagerSignal | null;
  lowestGameweekScore: EditorialManagerSignal | null;

  biggestRankRise: EditorialManagerSignal | null;
  biggestRankFall: EditorialManagerSignal | null;

  bestCaptain: EditorialCaptainSignal | null;
  worstCaptain: EditorialCaptainSignal | null;

  mostCaptainedPlayer: EditorialPlayerSignal | null;
  mostSelectedPlayer: EditorialPlayerSignal | null;

  biggestDifferential: EditorialPlayerSignal | null;

  mostTransferredIn: EditorialPlayerSignal | null;
  mostTransferredOut: EditorialPlayerSignal | null;
}

export interface EditorialManagerSignal {
  entryId: number;
  name: string;
  teamName: string;
  value: number;
}

export interface EditorialCaptainSignal {
  managerEntryId: number;
  managerName: string;
  teamName: string;
  playerId: number;
  points: number;
  multiplier: number;
  captainPoints: number;
}

export interface EditorialPlayerSignal {
  playerId: number;
  value: number;
}