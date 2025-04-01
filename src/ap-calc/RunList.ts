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
  readonly apCurr: number;
  readonly timerOffset: number;
  #differ: TimeDiffer;
  #showAll: boolean;

  constructor(
    apCurrent: number,
    timerSeconds: number,
    startedAt: number,
    showAll: boolean
  ) {
    this.startTime = startedAt;
    this.apCurr = apCurrent;
    this.timerOffset = timerSeconds;
    this.#differ = createTimeDiffer(startedAt);
    this.#showAll = showAll;
  }

  push(apTarget: number, title: string) {
    const deltaAP = apTarget - this.apCurr;
    const deltaSeconds = Math.max(0, (deltaAP - 1) * 300 + this.timerOffset);
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
      if (!this.#showAll && row.ap < this.apCurr) return obj;
      obj[title] = row;
      return obj;
    }, {} as RunTable);
  }
}
