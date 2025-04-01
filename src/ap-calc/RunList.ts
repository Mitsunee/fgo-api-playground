import { log } from "~/utils/logger";
import type { TimeDiff, TimeDiffer } from "./timeDiffer";
import { createTimeDiffer } from "./timeDiffer";

export interface RunListRow extends TimeDiff {
  ap: number;
  title: string;
}

export interface RunTable {
  [title: string]: Omit<RunListRow, "title">;
}

export class RunList {
  readonly list = new Array<RunListRow>();
  readonly startTime: number;
  #apCurr: number;
  readonly timerOffset: number;
  #differ: TimeDiffer;

  constructor(apCurrent: number, timerSeconds: number, startedAt: number) {
    this.startTime = startedAt;
    this.#apCurr = apCurrent;
    this.timerOffset = timerSeconds;
    this.#differ = createTimeDiffer(startedAt);
  }

  push(apTarget: number, title: string) {
    const deltaAP = apTarget - this.#apCurr;
    if (deltaAP <= 0) {
      log.debug(
        `Skipping run '${title}' because target ${apTarget} is less than current AP of ${this.#apCurr}`
      );
      return;
    }

    const deltaSeconds = (deltaAP - 1) * 300 + this.timerOffset;
    const diff = this.#differ(deltaSeconds);
    const row: RunListRow = {
      ap: apTarget,
      title,
      ...diff
    };
    this.list.push(row);
  }

  sort() {
    return this.list.sort((a, b) => a.ap - b.ap);
  }

  toTable() {
    return this.list.sort().reduce((obj, { title, ...row }) => {
      obj[title] = row;
      return obj;
    }, {} as RunTable);
  }
}
