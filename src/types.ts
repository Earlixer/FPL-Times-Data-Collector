export interface CompetitionConfig {
  name: string;
  fplLeagueId: number;
}

export interface LeagueConfig {
  season: string;
  competitions: {
    main: CompetitionConfig;
    premier: CompetitionConfig;
    europa: CompetitionConfig;
  };
}

export interface ManagerConfig {
  entryId: number;
  name: string;
  teamName: string;
}

export interface ManagersConfig {
  managers: ManagerConfig[];
}

export interface CollectorConfig {
  league: LeagueConfig;
  managers: ManagerConfig[];
}

export interface CliOptions {
  gameweek?: number;
  latest: boolean;
}