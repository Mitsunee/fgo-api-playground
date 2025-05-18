import { readFile, writeFile } from "@foxkit/fs";
import type { RunListRow } from "./RunList";
import { RunList } from "./RunList";
import { log } from "~/utils/logger";
import { List } from "@foxkit/list";

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

export class HistoryRow {
  apStart: number;
  timerOffset: number;
  startTime: number;
  runs = new Array<Pick<RunListRow, "ap" | "title">>();
  list?: RunList;

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

  serialize() {
    const runs = JSON.stringify(this.runs.map(run => [run.ap, run.title]));
    return `${this.startTime}:${this.apStart},${this.timerOffset},${runs}`;
  }

  toRunList(showAllRuns: boolean) {
    if (this.list) return this.list;

    const runList = new RunList(
      this.apStart,
      this.timerOffset,
      this.startTime,
      showAllRuns
    );

    for (const { ap, title } of this.runs) runList.push(ap, title);

    this.list = runList;
    return runList;
  }
}

export class ScriptHistory {
  readonly list = new List<HistoryRow>();
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

    // recover rows from file
    res.data
      .map(line => HistoryRow.fromFileLine(line))
      .sort((a, b) => {
        return b.startTime - a.startTime;
      })
      .forEach(row => history.list.push(row));

    return history;
  }

  /**
   * Write updated history to file
   */
  async updateFile() {
    const res = await writeFile(this.fileLoc, this.list, list =>
      list.map(row => row.serialize()).join("\n")
    );

    if (res.error) throw res.error as Error;
  }

  /**
   * Gets RunList for history entry at given index
   * @param idx Index where newest run is 0, oldest is 4
   * @returns RunList created from history entry
   */
  getRunList(idx: number) {
    const row = this.list.get(idx);
    if (!row) {
      throw new Error(`Could not retrieve run list at index ${idx}`);
    }

    return row.toRunList(this.#showAll);
  }

  /**
   * Adds new histoy entry given RunList. History will be culled if length exceeds 5
   * @param runList
   */
  push(runList: RunList) {
    const newRow = HistoryRow.fromRunList(runList);
    this.list.unshift(newRow);
    if (this.list.length > 5) this.list.pop();
  }

  /**
   * Gets amount of history entries
   */
  get length() {
    return this.list.length;
  }
}
