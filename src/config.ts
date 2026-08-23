import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import type {
  CollectorConfig,
  LeagueConfig,
  ManagersConfig
} from "./types.js";

const CONFIG_DIR = resolve(process.cwd(), "config");

async function loadJson<T>(filename: string): Promise<T> {
  const filePath = resolve(CONFIG_DIR, filename);

  const contents = await readFile(filePath, "utf-8");

  return JSON.parse(contents) as T;
}

export async function loadConfig(): Promise<CollectorConfig> {
  const league = await loadJson<LeagueConfig>("league.json");
  const managers = await loadJson<ManagersConfig>("managers.json");

  validateLeagueConfig(league);
  validateManagersConfig(managers);

  return {
    league,
    managers: managers.managers
  };
}

function validateLeagueConfig(config: LeagueConfig): void {
  if (!config.season.trim()) {
    throw new Error("season is required");
  }

  const competitions = config.competitions;

  if (!competitions.main) {
    throw new Error("Main League configuration is missing");
  }

  if (!competitions.premier) {
    throw new Error("Premier League configuration is missing");
  }

  if (!competitions.europa) {
    throw new Error("Europa League configuration is missing");
  }

  for (const [key, competition] of Object.entries(competitions)) {
    if (
      !Number.isInteger(competition.fplLeagueId) ||
      competition.fplLeagueId <= 0
    ) {
      throw new Error(
        `Invalid FPL league ID for competition: ${key}`
      );
    }

    if (!competition.name.trim()) {
      throw new Error(
        `Competition name is missing for: ${key}`
      );
    }
  }
}

function validateManagersConfig(
  config: ManagersConfig
): void {
  if (!Array.isArray(config.managers)) {
    throw new Error("managers must be an array");
  }

  if (config.managers.length === 0) {
    throw new Error("No managers configured");
  }

  const ids = new Set<number>();

  for (const manager of config.managers) {
    if (!Number.isInteger(manager.entryId) || manager.entryId <= 0) {
      throw new Error(
        `Invalid entryId for manager "${manager.name}"`
      );
    }

    if (ids.has(manager.entryId)) {
      throw new Error(
        `Duplicate manager entryId: ${manager.entryId}`
      );
    }

    ids.add(manager.entryId);

    if (!manager.name.trim()) {
      throw new Error(
        `Manager ${manager.entryId} has no name`
      );
    }

    if (!manager.teamName.trim()) {
      throw new Error(
        `Manager "${manager.name}" has no teamName`
      );
    }
  }
}