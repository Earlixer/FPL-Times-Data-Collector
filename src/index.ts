import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { loadConfig } from "./config.js";

import {
  getBootstrap,
  getLeagueStandings,
  getManagerPicks,
  getManagerGameweekTransfers,
  getLiveGameweek,
  getGameweekFixtures
} from "./fpl-client.js";

import {
  normalizePlayer
} from "./normalizer.js";

import {
  normalizeManager
} from "./normalizers/manager-normalizer.js";

import {
  buildNewsroomData
} from "./newsroom-builder.js";

import {
  calculateEditorialSignals
} from "./editorial-signals.js";

import type {
  NewsroomManager,
  NewsroomFixture
} from "./types/newsroom.js";

function collectSquadPlayerIds(
  managers: NewsroomManager[]
): Set<number> {
  const playerIds = new Set<number>();

  for (const manager of managers) {
    for (const player of manager.squad.startingXI) {
      playerIds.add(player.playerId);
    }

    for (const player of manager.squad.bench) {
      playerIds.add(player.playerId);
    }
  }

  return playerIds;
}

function normalizeFixtures(
  fixtures: Awaited<
    ReturnType<typeof getGameweekFixtures>
  >,
  teams: {
    id: number;
    name: string;
    short_name: string;
  }[],
  gameweek: number
): NewsroomFixture[] {
  const teamMap = new Map(
    teams.map((team) => [
      team.id,
      team
    ])
  );

  return fixtures.map((fixture) => {
    const homeTeam =
      teamMap.get(fixture.team_h);

    const awayTeam =
      teamMap.get(fixture.team_a);

    return {
      fixtureId: fixture.id,

      gameweek,

      homeTeamId: fixture.team_h,

      homeTeam:
        homeTeam?.name ??
        `Unknown Team ${fixture.team_h}`,

      awayTeamId: fixture.team_a,

      awayTeam:
        awayTeam?.name ??
        `Unknown Team ${fixture.team_a}`,

      homeScore:
        fixture.team_h_score,

      awayScore:
        fixture.team_a_score,

      finished:
        fixture.finished
    };
  });
}

async function main(): Promise<void> {
  try {
    const config = await loadConfig();

    const gameweek = 1;

    console.log(
      `Collecting FPL Times data for Gameweek ${gameweek}...`
    );

    // --------------------------------------------------
    // 1. Bootstrap
    // --------------------------------------------------

    console.log(
      "\nCalling FPL bootstrap endpoint..."
    );

    const bootstrap =
      await getBootstrap();

    console.log(
      "FPL bootstrap data received."
    );

    // --------------------------------------------------
    // 2. Live Gameweek data
    // --------------------------------------------------

    console.log(
      "\nCalling live Gameweek endpoint..."
    );

    const live =
      await getLiveGameweek(gameweek);

    const livePlayersById =
      new Map(
        live.elements.map(
          (player) => [
            player.id,
            player
          ]
        )
      );

    console.log(
      `✓ ${live.elements.length} live player records received.`
    );

    // --------------------------------------------------
    // 3. Fixtures
    // --------------------------------------------------

    console.log(
      "\nCalling Gameweek fixtures endpoint..."
    );

    const fixtures =
      await getGameweekFixtures(
        gameweek
      );

    console.log(
      `✓ ${fixtures.length} fixtures received.`
    );

    const normalizedFixtures =
      normalizeFixtures(
        fixtures,
        bootstrap.teams,
        gameweek
      );

    // --------------------------------------------------
    // 4. Normalize players
    // --------------------------------------------------

    console.log(
      "\nNormalizing player data..."
    );

    const normalizedPlayers =
      bootstrap.elements.map(
        (player) =>
          normalizePlayer(
            player,
            bootstrap.teams,
            livePlayersById.get(
              player.id
            )
          )
      );

    console.log(
      `✓ ${normalizedPlayers.length} players available.`
    );

    // --------------------------------------------------
    // 5. League standings
    // --------------------------------------------------

    console.log(
      "\nCollecting league standings..."
    );

    const mainLeague =
      await getLeagueStandings(
        config.league.competitions.main.fplLeagueId
      );

    const premierLeague =
      await getLeagueStandings(
        config.league.competitions.premier.fplLeagueId
      );

    const europaLeague =
      await getLeagueStandings(
        config.league.competitions.europa.fplLeagueId
      );

    console.log(
      "✓ All league standings collected."
    );

    // --------------------------------------------------
    // 6. Manager data
    // --------------------------------------------------

    console.log(
      "\nCollecting manager data..."
    );

    const managers: NewsroomManager[] =
      [];

    for (const manager of config.managers) {
      console.log(
        `  → ${manager.name} (${manager.entryId})`
      );

      const picks =
        await getManagerPicks(
          manager.entryId,
          gameweek
        );

      const transfers =
        await getManagerGameweekTransfers(
          manager.entryId,
          gameweek,
          bootstrap.events
        );

      const newsroomManager =
        normalizeManager(
          manager,
          picks,
          transfers
        );

      managers.push(
        newsroomManager
      );
    }

    console.log(
      `✓ ${managers.length} managers collected.`
    );

    // --------------------------------------------------
    // 7. Determine relevant players
    // --------------------------------------------------

    const squadPlayerIds =
      collectSquadPlayerIds(
        managers
      );

    const players =
      normalizedPlayers.filter(
        (player) =>
          squadPlayerIds.has(
            player.playerId
          )
      );

    console.log(
      `✓ ${players.length} unique players used by managers.`
    );

    // --------------------------------------------------
    // 8. Build newsroom document
    // --------------------------------------------------

    const newsroomData =
      buildNewsroomData(
        config.league.season,
        gameweek,
        {
          main: mainLeague,
          premier: premierLeague,
          europa: europaLeague
        }
      );

    newsroomData.managers =
      managers;

    newsroomData.players =
      players;

    newsroomData.fixtures =
      normalizedFixtures;

    // --------------------------------------------------
    // 9. Calculate editorial signals
    // --------------------------------------------------

    console.log(
      "\nCalculating editorial signals..."
    );

    const mainManagerIds =
    new Set(
      mainLeague.standings.results.map(
        (manager) => manager.entry
      )
    );

  const premierManagerIds =
    new Set(
      premierLeague.standings.results.map(
        (manager) => manager.entry
      )
    );

  const europaManagerIds =
    new Set(
      europaLeague.standings.results.map(
        (manager) => manager.entry
      )
    );

  newsroomData.editorialSignals =
    calculateEditorialSignals(
      managers,
      players,
      {
        main: mainManagerIds,
        premier: premierManagerIds,
        europa: europaManagerIds
      }
    );

    console.log(
      "✓ Editorial signals calculated."
    );

    // --------------------------------------------------
    // 10. Write output
    // --------------------------------------------------

    const outputDirectory =
      resolve(
        process.cwd(),
        "data",
        "output"
      );

    await mkdir(
      outputDirectory,
      {
        recursive: true
      }
    );

    const filename =
      `GW${String(gameweek).padStart(
        2,
        "0"
      )}_FPL_NEWSROOM.json`;

    const outputPath =
      resolve(
        outputDirectory,
        filename
      );

    await writeFile(
      outputPath,
      JSON.stringify(
        newsroomData,
        null,
        2
      ),
      "utf-8"
    );

    console.log(
      "\n================================="
    );

    console.log(
      "  COLLECTION COMPLETE"
    );

    console.log(
      "================================="
    );

    console.log(
      `Managers: ${managers.length}`
    );

    console.log(
      `Players: ${players.length}`
    );

    console.log(
      `Fixtures: ${normalizedFixtures.length}`
    );

    console.log(
      `Output: ${outputPath}`
    );

  } catch (error) {
    console.error(
      "\nCollector failed:",
      error instanceof Error
        ? error.message
        : error
    );

    process.exit(1);
  }
}

await main();