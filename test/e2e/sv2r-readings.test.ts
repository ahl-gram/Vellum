import { test } from "node:test";
import assert from "node:assert/strict";
import type { SuiteContext } from "../../e2e/types.ts";
import type { SurveyKit } from "../../e2e/suites/survey/kit.ts";
import {
  INK_END_TRIES,
  INK_INSTALL,
  INK_MARK,
  INK_READ,
  INK_STATE,
  sv2pDrawBeat,
  sv2pSwapThenInk,
  type InkSpan,
} from "../../e2e/suites/survey/beat.ts";

type Four = { dashSteps: number; dashSeen: number; gap: number; frames: number };
type Case = { four: Four; ink: InkSpan; inked?: boolean; closedOn?: number };
type Checked = { code: string; ok: boolean; detail: string };

const HEALTHY: Four = { dashSteps: 26, dashSeen: 27, gap: 50, frames: 27 };
const INK_HEALTHY: InkSpan = {
  inkStarted: true,
  inkEnd: "animationend",
  inkClosed: true,
  inkFrames: 53,
  inkSteps: 53,
  inkGap: 33.4,
  inkMedianFrame: 16.7,
  readMs: 249.7,
  readFrames: 10,
  readSteps: 10,
};
const INK_STALLED: InkSpan = {
  inkStarted: true,
  inkEnd: "animationend",
  inkClosed: true,
  inkFrames: 9,
  inkSteps: 9,
  inkGap: 1016.6,
  inkMedianFrame: 16.7,
  readMs: 1260.4,
  readFrames: 9,
  readSteps: 9,
};
const INK_NONE: InkSpan = {
  inkStarted: false,
  inkEnd: "none",
  inkClosed: false,
  inkFrames: 0,
  inkSteps: 0,
  inkGap: 0,
  inkMedianFrame: null,
  readMs: null,
  readFrames: 0,
  readSteps: 0,
};

async function swap({ four, ink, inked = true, closedOn = 1 }: Case) {
  const events: string[] = [];
  const checked: Checked[] = [];
  let polls = 0;
  const evaluate = async (expression: string): Promise<unknown> => {
    if (expression === INK_MARK) {
      events.push("mark");
      return inked;
    }
    if (expression === INK_STATE) {
      polls++;
      events.push("state");
      return { started: true, closed: polls >= closedOn, frames: 0, end: "none" };
    }
    if (expression === INK_READ) {
      events.push("ink");
      return ink;
    }
    if (expression.includes("window.__mo.disconnect()")) {
      events.push("read");
      return {
        batches: [
          { chart: true, overlay: false, frames: 5, verso: false },
          { chart: false, overlay: true, frames: 16, verso: true },
        ],
        chartBatch: 0,
        inkBatch: 1,
        chartAlone: true,
        ...four,
        framesBetween: 11,
        versoAtSwap: false,
        facesAgree: true,
        overlays: 1,
        vertices: 40,
        status: "",
        hash: "#seed=42&style=antique&survey",
      };
    }
    throw new Error(`unexpected evaluate: ${expression.slice(0, 60)}`);
  };
  const sleep = async () => {
    events.push("sleep");
  };
  const check = (name: string, ok: unknown, detail: string) => {
    checked.push({ code: name.split(" ")[0]!, ok: !!ok, detail });
  };
  const ctx = { evaluate, sleep, check } as unknown as SuiteContext;
  const outcome = await sv2pSwapThenInk(ctx).then(
    () => ({ threw: null as Error | null }),
    (err: Error) => ({ threw: err }),
  );
  return { events, checked, ...outcome };
}

const sv2r = (c: Checked[]) => c.find((x) => x.code === "SV2r")!;
const count = (events: string[], what: string) => events.filter((e) => e === what).length;

test("SV2r is judged on the four values it read before this pull request, whatever the ink's own span read", async () => {
  const cases: { name: string; case_: Case; ok: boolean }[] = [
    {
      name: "2026-09-10's row",
      case_: { four: { dashSteps: 11, dashSeen: 11, gap: 250, frames: 75 }, ink: INK_HEALTHY },
      ok: false,
    },
    { name: "healthy four, stalled ink", case_: { four: HEALTHY, ink: INK_STALLED }, ok: true },
    { name: "healthy four, no ink", case_: { four: HEALTHY, ink: INK_NONE, inked: false }, ok: true },
    { name: "dashSeen 12", case_: { four: { ...HEALTHY, dashSeen: 12 }, ink: INK_HEALTHY }, ok: true },
    { name: "dashSeen 11", case_: { four: { ...HEALTHY, dashSeen: 11 }, ink: INK_HEALTHY }, ok: false },
    { name: "gap 899.9", case_: { four: { ...HEALTHY, gap: 899.9 }, ink: INK_HEALTHY }, ok: true },
    { name: "gap 900", case_: { four: { ...HEALTHY, gap: 900 }, ink: INK_HEALTHY }, ok: false },
    { name: "gap 0", case_: { four: { ...HEALTHY, gap: 0 }, ink: INK_HEALTHY }, ok: false },
  ];
  for (const { name, case_, ok } of cases) {
    const got = await swap(case_);
    assert.equal(got.threw, null, name);
    assert.deepEqual(
      got.checked.map((x) => x.code),
      ["SV2p", "SV2r", "SV2k"],
      name,
    );
    assert.equal(sv2r(got.checked).ok, ok, name);
  }
});

test("SV2r's detail prints the four values it judges and the ink's own span beside them", async () => {
  const got = await swap({ four: HEALTHY, ink: INK_HEALTHY });
  assert.deepEqual(JSON.parse(sv2r(got.checked).detail), { ...HEALTHY, ...INK_HEALTHY });
});

test("the ink's span is read once it has closed, here at the fifth try", async () => {
  const got = await swap({ four: HEALTHY, ink: INK_HEALTHY, closedOn: 5 });
  assert.equal(got.threw, null);
  assert.equal(count(got.events, "state"), 5);
  assert.equal(count(got.events, "sleep"), 4);
  assert.equal(count(got.events, "ink"), 1);
  assert.ok(got.events.lastIndexOf("ink") > got.events.lastIndexOf("state"), "the span was read before it closed");
});

test("an ink that never closes stops the step with the wait's label and last state, after INK_END_TRIES tries", async () => {
  const got = await swap({ four: HEALTHY, ink: INK_HEALTHY, closedOn: Infinity });
  assert.match(
    got.threw?.message ?? "",
    /^settle timeout SV2r the ink's span closing: \{"started":true,"closed":false/,
  );
  assert.equal(count(got.events, "state"), INK_END_TRIES);
  assert.equal(count(got.events, "sleep"), INK_END_TRIES);
  assert.equal(count(got.events, "ink"), 0);
  assert.deepEqual(
    got.checked.map((x) => x.code),
    ["SV2p"],
  );
});

test("with no ink on the new coast at the mark, nothing is waited for and SV2r is judged as today", async () => {
  const got = await swap({ four: HEALTHY, ink: INK_NONE, inked: false, closedOn: Infinity });
  assert.equal(got.threw, null);
  assert.equal(count(got.events, "state"), 0);
  assert.equal(count(got.events, "sleep"), 0);
  assert.equal(count(got.events, "ink"), 1);
  assert.ok(got.events.indexOf("ink") > got.events.indexOf("mark"), "the span was read before the mark");
  assert.deepEqual(
    got.checked.map((x) => x.code),
    ["SV2p", "SV2r", "SV2k"],
  );
  assert.equal(JSON.parse(sv2r(got.checked).detail).inkStarted, false);
});

test("the read SV2r judges is marked in the ink's span before the wait", async () => {
  const got = await swap({ four: HEALTHY, ink: INK_HEALTHY, closedOn: 3 });
  const read = got.events.indexOf("read");
  const mark = got.events.indexOf("mark");
  assert.notEqual(read, -1);
  assert.notEqual(mark, -1);
  assert.ok(read < mark, "the mark came before the read");
  assert.ok(mark < got.events.indexOf("state"), "the wait began before the mark");
});

test("the ink's instrument goes in after the read's sampler and before the Draw", async () => {
  const seen: string[] = [];
  const kit = {
    evaluate: async (expression: string) => {
      seen.push(expression);
      return true;
    },
    goto: async () => {},
    waitInked: async () => 0,
    waitSettled: async () => {},
  } as unknown as SurveyKit;
  await sv2pDrawBeat(kit);
  const sampler = seen.findIndex((e) => e.includes("window.__land={"));
  const click = seen.findIndex((e) => e.includes('getElementById("draw").click()'));
  const install = seen.indexOf(INK_INSTALL);
  assert.notEqual(sampler, -1);
  assert.notEqual(click, -1);
  assert.ok(
    install > sampler && install < click,
    `INK_INSTALL at ${install}, sampler at ${sampler}, click at ${click}`,
  );
});
