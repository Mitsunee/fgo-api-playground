import { readFile } from "@foxkit/fs";
import type { RunList, RunListRow } from "./RunList";
import { log } from "~/utils/logger";

// TODO: write tests for parsing history lines

function parseSettingsFromLine(settingsStr: string) {
  const settings = JSON.parse(`[${settingsStr.replace(":", ",")}]`);
  if (
    !Array.isArray(settings) ||
    settings.length != 3 ||
    !settings.every(n => typeof n == "number")
  ) {
    throw new Error(`Invalid settings in history line: '${settingsStr}'`);
  }

  const [startTime, apStart, timerOffset] = settings;
  return { apStart, timerOffset, startTime };
}

function isRunTuple(run: unknown): run is [number, string] {
  if (!Array.isArray(run)) return false;
  if (typeof run[0] != "number") return false;
  if (typeof run[1] != "string") return false;
  return true;
}

function parseRunsFromLine(runsStr: string) {
  const runs = JSON.parse(runsStr);
  if (!Array.isArray(runs) || !runs.every(isRunTuple)) {
    throw new Error(`Invalid runs in history line: '${runsStr}'`);
  }

  return runs;
}

// WIP
class HistoryRow {
  apStart: number;
  timerOffset: number;
  startTime: number;
  runs = new Array<Pick<RunListRow, "ap" | "title">>();

  private constructor(apStart: number, timerOffset: number, startTime: number) {
    this.apStart = apStart;
    this.timerOffset = timerOffset;
    this.startTime = startTime;
  }

  static fromRunList(runs: RunList) {
    const row = new HistoryRow(runs.apCurr, runs.timerOffset, runs.startTime);
    for (const run of runs.list) {
      row.runs.push({ ap: run.ap, title: run.title });
    }
    return row;
  }

  static fromFileLine(line: string) {
    const match = line.match(
      /(?<settings>[0-9]+:[0-9]+,[0-9]+),(?<runs>\[.*?\])$/
    );
    if (!match?.groups) {
      throw new Error(`Invalid history line: '${line}'`);
    }

    const settings = parseSettingsFromLine(match.groups.settings);
    const runs = parseRunsFromLine(match.groups.runs);
    const row = new HistoryRow(
      settings.apStart,
      settings.timerOffset,
      settings.startTime
    );
    for (const [ap, title] of runs) row.runs.push({ ap, title });

    return row;
  }

  // TODO: serialize() {}
  /*
  Format:
    tz:apStart,timerOffset,Array<[ap,"title"]>
  */
}

export type { HistoryRow };

// WIP
export class ScriptHistory {
  readonly list = new Array<HistoryRow>();
  readonly fileLoc: string;
  #showAll: boolean;

  private constructor(fileLoc: string, showAll: boolean) {
    this.fileLoc = fileLoc;
    this.#showAll = showAll;
  }

  static async loadFromFile(fileLoc: string, showAllRuns: boolean) {
    const history = new ScriptHistory(fileLoc, showAllRuns);
    const res = await readFile(fileLoc, data =>
      data.split("\n").filter(line => line !== "")
    );

    // return empty history if no file exists
    if (!res.success) {
      log.debug("Could not read history file, assuming no history exists");
      log.debug(res.error);
      return history;
    }

    // recover existing history
    // WIP
  }
}
