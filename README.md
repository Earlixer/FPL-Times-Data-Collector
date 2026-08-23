FPL Times Data Collector

A small TypeScript application that collects and normalizes weekly Fantasy Premier League data for the FPL Times 2026/27 newsletter project.

Context

FPL Times is a private fantasy football newsletter built around three separate FPL leagues:

Baller League 2026 - the main league

Baller Champions League - the top division

Ballers Europa League - the lower division and promotion pathway

The collector retrieves the weekly FPL data needed by the FPL Times AI newsroom and produces a single structured JSON file for each Gameweek.

What it collects

For each Gameweek, the collector gathers:

League standings across all three competitions

Manager squads and starting XIs

Captains and vice-captains

Manager Gameweek performance

Transfers

Player Gameweek and season statistics

Relevant player ownership and form data

Premier League fixtures and results

Rank movement

Editorial signals, globally and by competition

Output

Each run produces a newsroom-ready file such as:

data/output/GW01_FPL_NEWSROOM.json

The collector is responsible for data collection and normalization. Editorial interpretation, story selection, humour and newsletter writing are handled separately by the FPL Times AI newsroom.

Usage

Install dependencies:

npm install

Type-check:

npm run typecheck

Collect a Gameweek:

npm run collect -- --gw 1

Architecture

Fantasy Premier League API
          ↓
   FPL Times Collector
          ↓
 Normalized weekly JSON
          ↓
     AI Newsroom
          ↓
    FPL Times Newsletter

Version

Collector v1.0

Season: 2026/27