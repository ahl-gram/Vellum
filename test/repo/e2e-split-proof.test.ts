import { test } from "node:test";
import assert from "node:assert/strict";
import { compareHarvests, familyOf, harvestFamily } from "../../scripts/e2e-split-proof.ts";

const BASE = [
  "export async function run(ctx) {",
  "  const { evaluate, check, sleep, waitSettled } = ctx;",
  "  const step = makeStep(ctx);",
  "  await step(\"T1\", async () => {",
  "    await evaluate(`(()=>{",
  "      document.getElementById(\"draw\").click();",
  "    })()`);",
  "    await waitSettled(\"t1\");",
  "    const g = await evaluate(`({n:1})`);",
  "    check(\"T1 the sheet turns\", g.n === 1, JSON.stringify(g));",
  "  });",
  "  let seen = 0;",
  "  await step(\"T2\", async () => {",
  "    await sleep(120);",
  "    seen = await evaluate(`2`);",
  "    check(\"T2 it settles\", seen === 2);",
  "  });",
  "  check(\"T3 after\", seen > 0);",
  "}",
].join("\n");

const RUN = [
  "export async function run(ctx) {",
  "  const { check } = ctx;",
  "  const step = makeStep(ctx);",
  "  await step(\"T1\", () => t1Turns(ctx));",
  "  let seen = 0;",
  "  await step(\"T2\", async () => { seen = await t2Settles(ctx); });",
  "  check(\"T3 after\", seen > 0);",
  "}",
].join("\n");

const GROUPS = [
  "export async function t1Turns({ evaluate, check, waitSettled }) {",
  "  await evaluate(`(()=>{",
  "      document.getElementById(\"draw\").click();",
  "    })()`);",
  "  await waitSettled(\"t1\");",
  "  const g = await evaluate(`({n:1})`);",
  "  check(\"T1 the sheet turns\", g.n === 1, JSON.stringify(g));",
  "}",
  "export async function t2Settles({ evaluate, check, sleep }) {",
  "  await sleep(120);",
  "  const seen = await evaluate(`2`);",
  "  check(\"T2 it settles\", seen === 2);",
  "  return seen;",
  "}",
].join("\n");

const MOVED = `${RUN}\n${GROUPS}`;
const verdict = (...after: string[]) => compareHarvests(harvestFamily([BASE]), harvestFamily(after));
const swapped = (text: string, from: string, to: string): string => {
  assert.ok(text.includes(from), `the fixture no longer carries ${from}, so this case would compare the unchanged text`);
  return text.replace(from, to);
};

test("a pure move into named functions, in one file or across two, changes nothing the proof reads", () => {
  assert.deepEqual(verdict(MOVED).lines, []);
  assert.deepEqual(verdict(RUN, GROUPS).lines, []);
});

test("a changed check name, sleep, payload or payload indentation is a literal gone and one added, under the step it runs in", () => {
  assert.deepEqual(verdict(swapped(MOVED, "T1 the sheet turns", "T1 the sheet turn")).lines, ["literal gone: [T1] StringLiteral:\"T1 the sheet turns\"", "literal added: [T1] StringLiteral:\"T1 the sheet turn\""]);
  assert.deepEqual(verdict(swapped(MOVED, "sleep(120)", "sleep(150)")).lines, ["literal gone: [T2] FirstLiteralToken:120", "literal added: [T2] FirstLiteralToken:150"]);
  assert.ok(verdict(swapped(MOVED, "({n:1})", "({n:2})")).lines.includes("payload gone: [T1] `({n:1})`"));
  assert.equal(verdict(swapped(MOVED, "      document.getElementById", "    document.getElementById")).same, false);
});

test("a dropped call, and a second call to a name the base already calls, are each a difference", () => {
  assert.deepEqual(verdict(swapped(MOVED, ", JSON.stringify(g));", ");")).lines, ["call gone: [T1] stringify"]);
  assert.deepEqual(verdict(swapped(MOVED, "  await sleep(120);", "  await sleep(120);\n  await sleep(120);")).lines, ["literal added: [T2] FirstLiteralToken:120", "call added to a name the base already calls: [T2] sleep"]);
});

test("a statement moved across a step boundary is a difference even with every literal intact", () => {
  const into = swapped(swapped(MOVED, "  check(\"T3 after\", seen > 0);\n}", "}"), "  return seen;", "  check(\"T3 after\", seen > 0);\n  return seen;");
  assert.ok(verdict(into).lines.includes("literal gone: [unstepped] StringLiteral:\"T3 after\""));
  assert.ok(verdict(into).lines.includes("literal added: [T2] StringLiteral:\"T3 after\""));
  const outOf = swapped(swapped(MOVED, "  await sleep(120);\n", ""), "  let seen = 0;", "  let seen = 0;\n  await ctx.sleep(120);");
  assert.ok(verdict(outOf).lines.includes("literal added: [unstepped] FirstLiteralToken:120"), verdict(outOf).lines.join("\n"));
});

test("a type note or a condition marker gained or lost is a difference", () => {
  assert.deepEqual(verdict(swapped(MOVED, "  const g = ", "  // @ts-expect-error a note\n  const g = ")).lines, ["type notes 0 -> 1"]);
  assert.deepEqual(verdict(swapped(MOVED, "check(\"T2 it settles\", seen === 2);", "check(\"T2 it settles\", seen === 2); // eslint-disable-line @typescript-eslint/no-unnecessary-condition")).lines, ["condition markers 0 -> 1"]);
});

test("a suite's family is its suite file and its own folder, never a sibling whose name it prefixes, and the harness takes its server", () => {
  assert.equal(familyOf("scripts/e2e/suite-zoom.ts"), "zoom");
  assert.equal(familyOf("scripts/e2e/zoom/deep/reads.ts"), "zoom");
  assert.equal(familyOf("scripts/e2e/suite-zoom-gestures.ts"), "zoom-gestures");
  assert.equal(familyOf("scripts/e2e/zoom-gestures/checks.ts"), "zoom-gestures");
  assert.equal(familyOf("scripts/e2e/site-server.ts"), familyOf("scripts/e2e/harness.ts"));
  assert.equal(familyOf("scripts/e2e/room-support.ts"), "scripts/e2e/room-support.ts");
});
