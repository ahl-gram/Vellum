import { test } from "node:test";
import assert from "node:assert/strict";
import { g2cKeys, HASH } from "../../e2e/suites/glass-ceremony.ts";
import type { GlassKit } from "../../e2e/suites/glass-ceremony.ts";
import { d3DragQuiet, MARK_SHEET, NEW_SHEET } from "../../e2e/suites/motion.ts";
import { t3InterruptTurn, t5SettleSupersedes, TURNING } from "../../e2e/suites/turn.ts";
import { v1FlipsToVerso, v2RedrawWhileFlipped, v4bFlipBack, versoKit } from "../../e2e/suites/verso.ts";
import type { VersoKit } from "../../e2e/suites/verso.ts";
import { z13DeepLink, z5VersoHomes } from "../../e2e/suites/zoom/resets.ts";
import { FLIP } from "../../e2e/support/witness.ts";
import type { Flip } from "../../e2e/support/witness.ts";
import type { SuiteContext } from "../../e2e/types.ts";
import { count, recording } from "../../test-support/recording-ctx.ts";
import type { Said } from "../../test-support/recording-ctx.ts";

const MID_FLIGHT: Flip = { versoed: true, flip3d: true, m11: -0.4, running: 1 };
const LANDED: Flip = { versoed: true, flip3d: true, m11: -1, running: 0 };
const V1_READ = {
  versoed: true,
  flip3d: true,
  ghost: true,
  ghostBlob: true,
  docket: "CHART № 42 · Title · Year 1000 · Laukuwelua (once Haitani)",
  survey: 12,
  stamp: true,
  vis: "visible",
  label: "Back",
};
const waiting = (ctx: SuiteContext): SuiteContext => ({
  ...ctx,
  waitSettled: () => Promise.resolve(),
  waitTurned: () => Promise.resolve(),
  armTurnWatch: () => Promise.resolve(),
  waitReady: () => Promise.resolve(true),
});
const versoKitOver = (ctx: SuiteContext): VersoKit => ({
  ...versoKit(ctx),
  waitFlip3dGone: () => Promise.resolve(),
  waitRectoAttr: () => Promise.resolve(),
});
test("V1 reads the flip straight after the press and shoots the verso only once the flip has landed", async () => {
  let n = 0;
  const { ctx, said, slept } = recording((expression) => {
    if (expression === FLIP) return ++n <= 2 ? MID_FLIGHT : LANDED;
    if (expression.includes("verso-docket")) return V1_READ;
    return {};
  });
  await v1FlipsToVerso(versoKitOver(ctx), "Title");
  const at = (part: (s: Said) => boolean) => said.findIndex(part);
  const shot = at((s) => s.kind === "shoot");
  const read = at((s) => s.what.includes("verso-docket"));
  const waits = said.map((s, i) => (s.what === FLIP ? i : -1)).filter((i) => i >= 0);
  assert.equal(waits.length, 4, "the flip was read until it landed and rested");
  assert.ok(read < (waits[0] ?? -1), "the docket was not read straight after the press");
  assert.ok(shot > (waits[3] ?? Infinity), "the shot came before the flip landed");
  assert.ok(
    slept.every((ms) => ms === 50),
    `a pause other than the poll's: ${slept.join(",")}`,
  );
});

test("V1 times out naming the flip when it never lands", async () => {
  const { ctx } = recording((expression) =>
    expression === FLIP ? MID_FLIGHT : expression.includes("verso-docket") ? V1_READ : {},
  );
  await assert.rejects(v1FlipsToVerso(versoKitOver(ctx), "Title"), (err: Error) =>
    err.message.startsWith("settle timeout V1 the flip to the verso landed: "),
  );
});

test("V2 reads the rebuilt verso as soon as the recto carries the new seed", async () => {
  const { ctx, slept } = recording((expression) =>
    expression.includes("rectoSeed")
      ? { versoed: true, flip3d: true, docket: "CHART № 100 · Title", rectoSeed: "100", ghostChanged: true }
      : "blob:before",
  );
  await v2RedrawWhileFlipped(versoKitOver(ctx));
  assert.deepEqual(slept, []);
});

test("V4b reads the recto as soon as the 3D context is gone", async () => {
  const { ctx, slept } = recording(() => ({
    versoed: false,
    flip3d: false,
    perspective: "none",
    map: true,
    hits: 3,
    vVis: "hidden",
    label: "The Sheet",
  }));
  await v4bFlipBack(versoKitOver(ctx));
  assert.deepEqual(slept, []);
});

test("Z5 times out naming the flip when it never lands", async () => {
  const { ctx } = recording((expression) => (expression === FLIP ? MID_FLIGHT : {}));
  await assert.rejects(z5VersoHomes(ctx), (err: Error) =>
    err.message.startsWith("settle timeout Z5 the flip to the verso landed: "),
  );
});

test("Z5 times out naming the flip back when the 3D context is never torn down", async () => {
  const { ctx } = recording((expression, so) => {
    if (expression === FLIP)
      return count(so, 'verso-turn").click()') >= 2 ? { versoed: false, flip3d: true, m11: -0.2, running: 1 } : LANDED;
    if (expression.includes("ghost")) return { versoed: true, ghost: true, vis: "visible", k: 1, x: 0, y: 0, cx: null };
    return {};
  });
  await assert.rejects(z5VersoHomes(ctx), (err: Error) =>
    err.message.startsWith("settle timeout Z5 the flip back to the recto landed: "),
  );
});

test("T3 interrupts the ink turn only once it is under way, and times out naming it when it never starts", async () => {
  const { ctx, said } = recording((expression) => (expression === TURNING ? { turning: false } : {}));
  await assert.rejects(t3InterruptTurn(waiting(ctx)), (err: Error) =>
    err.message.startsWith("settle timeout T3 the ink turn under way: "),
  );
  assert.equal(count(said, "topographic"), 0, "the second style was set before the first turn began");
});

test("T5 draws the new world only once the nautical turn is under way, and times out naming it when it never starts", async () => {
  const { ctx, said } = recording((expression) => (expression === TURNING ? { turning: false } : {}));
  await assert.rejects(t5SettleSupersedes(waiting(ctx)), (err: Error) =>
    err.message.startsWith("settle timeout T5 the nautical turn under way: "),
  );
  assert.equal(count(said, 'value="7"'), 0, "the new world was drawn before the turn began");
});

test("D3 waits for the sheet it marked before the input to be replaced", async () => {
  let reads = 0;
  let arriving = 0;
  const { ctx, said, checked } = recording((expression, so) => {
    if (expression === MARK_SHEET) return true;
    if (expression === NEW_SHEET) return { fresh: count(so, MARK_SHEET) > 0 && ++reads >= 2 };
    if (expression.includes('classList.contains("arriving")')) return ++arriving > 1;
    return {};
  });
  await d3DragQuiet(waiting(ctx));
  assert.deepEqual(
    checked.filter((c) => c.code === "D3"),
    [{ code: "D3", ok: true }],
  );
  const marked = said.map((s, i) => (s.what === MARK_SHEET ? i : -1)).filter((i) => i >= 0);
  const input = said.findIndex((s) => s.what.includes('new Event("input"'));
  assert.equal(marked.length, 1, "the sheet was marked once");
  assert.ok((marked[0] ?? Infinity) < input, "the sheet was marked after the input");
});

test("D3 times out naming the quiet redraw when the sheet is never replaced", async () => {
  const { ctx } = recording((expression) => (expression === NEW_SHEET ? { fresh: false } : {}));
  await assert.rejects(d3DragQuiet(waiting(ctx)), (err: Error) =>
    err.message.startsWith("settle timeout D3 the quiet redraw replaced the sheet: "),
  );
});

test("G2c times out naming the hash write when the settle never writes k=1.4", async () => {
  const { ctx } = recording((expression) => (expression === HASH ? { cx: null, cy: null, k: null } : {}));
  const k = {
    ...ctx,
    settleK: () => Promise.resolve({ k: 1.4, x: 0, y: 0 }),
    settleHome: () => Promise.resolve({ k: 1, x: 0, y: 0 }),
  } as unknown as GlassKit;
  await assert.rejects(g2cKeys(k), (err: Error) =>
    err.message.startsWith("settle timeout G2c the settle writes the hash at 1.4: "),
  );
});

test("Z13 reads the deep link's camera straight after the boot settles", async () => {
  const { ctx, slept } = recording((expression) =>
    expression.includes("clientWidth") ? { k: 4, x: -1500, W: 1000 } : {},
  );
  await z13DeepLink(waiting(ctx));
  assert.deepEqual(slept, []);
});
