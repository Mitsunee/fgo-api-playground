import { test } from "uvu";
import * as assert from "uvu/assert";
import { RunList } from "~/ap-calc/RunList";
import { HistoryRow } from "~/ap-calc/ScriptHistory";

const ts = 1743515238882;
const testRuns: HistoryRow["runs"] = [
  { ap: 10, title: "Test 1" },
  { ap: 80, title: "Test 2" },
  { ap: 144, title: "Test 3" }
];
const testRunsSerialized = `${ts}:79,90,${JSON.stringify(testRuns.map(run => [run.ap, run.title]))}`;

test("creates row from run list", () => {
  // create test list
  const runs = new RunList(79, 90, ts, false);
  testRuns.forEach(run => runs.push(run.ap, run.title));

  // create row from test list
  const row = HistoryRow.fromRunList(runs);

  // test created row properties
  assert.is(row.apStart, 79, "Starting AP");
  assert.is(row.startTime, ts, "Timestamp");
  assert.is(row.timerOffset, 90, "Offset for next AP in seconds");
  assert.equal(row.runs, testRuns, "runs array");

  // test serialize method
  assert.is(row.serialize(), testRunsSerialized, "Serizalized output");
});

test("it creates row from history file line", () => {
  const row = HistoryRow.fromFileLine(testRunsSerialized);

  // test created row properties
  assert.is(row.apStart, 79, "Starting AP");
  assert.is(row.startTime, ts, "Timestamp");
  assert.is(row.timerOffset, 90, "Offset for next AP in seconds");
  assert.equal(row.runs, testRuns, "runs array");
});

test.run();
