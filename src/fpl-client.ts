import axios, {
  type AxiosRequestConfig
} from "axios";

import type {
  FplBootstrapResponse,
  FplManagerPicksResponse,
  FplLiveResponse,
  FplTransfersResponse,
  FplTransfer,
  FplGameweek,
  FplFixture
} from "./types/fpl.js";

export interface FplLeagueStandingsResponse {
  league: {
    id: number;
    name: string;
  };

  standings: {
    has_next: boolean;
    page: number;
    results: FplLeagueStanding[];
  };
}

export interface FplLeagueStanding {
  id: number;
  entry: number;
  entry_name: string;
  player_name: string;

  rank: number;
  last_rank: number;

  event_total: number;
  total: number;
}

const FPL_BASE_URL =
  "https://fantasy.premierleague.com/api";

const MAX_RETRIES = 3;
const REQUEST_TIMEOUT = 30000;
const RETRY_DELAY = 2000;

const axiosClient = axios.create({
  baseURL: FPL_BASE_URL,
  timeout: REQUEST_TIMEOUT
});

async function request<T>(
  config: AxiosRequestConfig
): Promise<T> {
  let lastError: unknown;

  for (
    let attempt = 1;
    attempt <= MAX_RETRIES;
    attempt++
  ) {
    try {
      const response =
        await axiosClient.request<T>(config);

      return response.data;
    } catch (error) {
      lastError = error;

      if (attempt < MAX_RETRIES) {
        console.log(
          `    Request failed. Retrying (${attempt}/${MAX_RETRIES})...`
        );

        await new Promise(
          (resolve) =>
            setTimeout(resolve, RETRY_DELAY)
        );
      }
    }
  }

  throw lastError;
}

export async function getBootstrap(): Promise<FplBootstrapResponse> {
  return request<FplBootstrapResponse>({
    method: "GET",
    url: "/bootstrap-static/"
  });
}

export async function getLeagueStandings(
  leagueId: number
): Promise<FplLeagueStandingsResponse> {
  return request<FplLeagueStandingsResponse>({
    method: "GET",
    url: `/leagues-classic/${leagueId}/standings/`
  });
}

export async function getManagerPicks(
  entryId: number,
  gameweek: number
): Promise<FplManagerPicksResponse> {
  return request<FplManagerPicksResponse>({
    method: "GET",
    url: `/entry/${entryId}/event/${gameweek}/picks/`
  });
}

export async function getLiveGameweek(
  gameweek: number
): Promise<FplLiveResponse> {
  return request<FplLiveResponse>({
    method: "GET",
    url: `/event/${gameweek}/live/`
  });
}

export async function getManagerTransfers(
  entryId: number
): Promise<FplTransfersResponse> {
  return request<FplTransfersResponse>({
    method: "GET",
    url: `/entry/${entryId}/transfers/`
  });
}

export async function getManagerGameweekTransfers(
  entryId: number,
  gameweek: number,
  gameweeks: FplGameweek[]
): Promise<FplTransfer[]> {
  const transfers =
    await getManagerTransfers(entryId);

  const currentGameweek =
    gameweeks.find(
      (event) => event.id === gameweek
    );

  if (!currentGameweek) {
    throw new Error(
      `Gameweek ${gameweek} not found`
    );
  }

  const previousGameweek =
    gameweeks.find(
      (event) =>
        event.id === gameweek - 1
    );

  const currentDeadline =
    new Date(
      currentGameweek.deadline_time
    );

  const previousDeadline =
    previousGameweek
      ? new Date(
          previousGameweek.deadline_time
        )
      : null;

  return transfers.filter(
    (transfer) => {
      const transferTime =
        new Date(transfer.time);

      const afterPreviousDeadline =
        previousDeadline
          ? transferTime >
            previousDeadline
          : true;

      const beforeCurrentDeadline =
        transferTime <=
        currentDeadline;

      return (
        afterPreviousDeadline &&
        beforeCurrentDeadline
      );
    }
  );
}

export async function getGameweekFixtures(
  gameweek: number
): Promise<FplFixture[]> {
  return request<FplFixture[]>({
    method: "GET",
    url: "/fixtures/",
    params: {
      event: gameweek
    }
  });
}