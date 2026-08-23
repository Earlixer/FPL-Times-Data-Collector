export interface FplBootstrapResponse {
  events: FplGameweek[];
  teams: FplTeam[];
  elements: FplPlayer[];
}

export interface FplGameweek {
  id: number;
  name: string;
  deadline_time: string;
  finished: boolean;
  is_current: boolean;
  is_next: boolean;
}

export interface FplTeam {
  id: number;
  name: string;
  short_name: string;
}

export interface FplPlayer {
  id: number;

  first_name: string;
  second_name: string;

  team: number;
  element_type: number;

  now_cost: number;

  event_points: number;
  total_points: number;

  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;

  bonus: number;
  bps: number;

  selected_by_percent: string;

  transfers_in: number;
  transfers_out: number;

  form: string;
  points_per_game: string;

  cost_change_event: number;
}

export interface FplManagerPicksResponse {
  active_chip: string | null;

  automatic_subs: FplAutomaticSub[];

  entry_history: {
    event: number;
    points: number;
    total_points: number;
    rank: number;
    overall_rank: number;
    bank: number;
    value: number;
    event_transfers: number;
    event_transfers_cost: number;
  };

  picks: FplManagerPick[];
}

export interface FplManagerPick {
  element: number;
  position: number;
  multiplier: number;
  is_captain: boolean;
  is_vice_captain: boolean;
  selling_price: number;
}

export interface FplAutomaticSub {
  entry: number;
  element_in: number;
  element_out: number;
}

export interface FplLiveResponse {
  elements: FplLivePlayer[];
}

export interface FplLivePlayer {
  id: number;

  stats: {
    minutes: number;
    goals_scored: number;
    assists: number;
    clean_sheets: number;
    goals_conceded: number;
    own_goals: number;
    penalties_saved: number;
    penalties_missed: number;
    yellow_cards: number;
    red_cards: number;
    saves: number;
    bonus: number;
    bps: number;
    influence: string;
    creativity: string;
    threat: string;
    ict_index: string;
    total_points: number;
    in_dreamteam: boolean;
  };

  explain: unknown[];
}

export interface FplTransfer {
  id: number;
  element_in: number;
  element_out: number;
  element_in_cost: number;
  element_out_cost: number;
  time: string;
}

export type FplTransfersResponse =
  FplTransfer[];

export interface FplFixture {
  id: number;

  event: number | null;

  finished: boolean;

  team_h: number;
  team_a: number;

  team_h_score: number | null;
  team_a_score: number | null;

  kickoff_time: string | null;

  team_h_difficulty: number;
  team_a_difficulty: number;

  pulse_id: number;
}