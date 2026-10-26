import { test } from "node:test";
import assert from "node:assert/strict";
import { readCam, type Cam } from "../../e2e/support/home.ts";
import { entersKit, gestureKit, stageKit } from "../../e2e/suites/landfall/kit.ts";
import { l2ProseScrolls, l5bArrowScrolls } from "../../e2e/suites/landfall/panel.ts";
import { l1aConsumed, l1bCloseClamp, l1eAbsorbed } from "../../e2e/suites/landfall/wheel.ts";
import type { SuiteContext } from "../../e2e/types.ts";

// A state change an action causes lands LAG evaluates after it, so a pause that resolves at once reads the state before it lands.
const LAG = 2;
type Act = { kind: string; at: number; dy?: number; instant?: boolean; n?: number; p?: boolean };
type World = {
  clock: number;
  acts: Act[];
  reads: { expr: string; out: unknown }[];
  slept: number[];
  checked: Map<string, boolean>;
};
const landed = (w: World, a: Act): boolean => a.instant === true || w.clock - a.at >= LAG;
const acts = (w: World, kind: string): Act[] => w.acts.filter((a) => a.kind === kind);
const sinceReset = (w: World, kind: string): Act[] => {
  const reset = acts(w, `reset:${kind}`).at(-1)?.at ?? -1;
  return acts(w, kind).filter((a) => a.at >= reset);
};
const world = (
  answer: (expr: string, w: World) => unknown,
  onWheel: (a: Act, w: World) => Partial<Act> = () => ({}),
) => {
  const w: World = { clock: 0, acts: [], reads: [], slept: [], checked: new Map() };
  const ctx = {
    evaluate: (expr: string) => {
      w.clock++;
      if (expr === "window.__lfWheel = []") w.acts.push({ kind: "reset:wheel", at: w.clock });
      const out = answer(expr, w);
      w.reads.push({ expr, out });
      return Promise.resolve(out);
    },
    send: (method: string, params: { type?: string; key?: string }) => {
      if (method === "Input.dispatchKeyEvent" && params.type === "keyDown")
        w.acts.push({ kind: `key:${params.key}`, at: w.clock });
      if (method === "Input.dispatchMouseEvent" && params.type === "mouseReleased")
        w.acts.push({ kind: "click", at: w.clock });
      return Promise.resolve({});
    },
    wheel: (_x: number, _y: number, dy: number) => {
      const a: Act = { kind: "wheel", at: w.clock, dy };
      w.acts.push({ ...a, ...onWheel(a, w) });
      return Promise.resolve();
    },
    sleep: (ms: number) => {
      w.slept.push(ms);
      return Promise.resolve();
    },
    check: (name: string, ok: unknown) => void w.checked.set(name.split(" ")[0]!, !!ok),
    PORT: 8765,
  } as unknown as SuiteContext;
  return { w, ctx, k: entersKit(gestureKit(stageKit(ctx))) };
};
const cam = (scale: number, over: Partial<Cam> = {}): Cam => ({
  veil: false,
  lifting: false,
  status: null,
  scale,
  x: 0,
  y: 0,
  fit: 1.16,
  expected: 2,
  ...over,
});
const PT = { x: 640, y: 400 };
const isWheelLog = (e: string) => e.includes("__lfWheel.length");
const isLastWheel = (e: string) => e.includes("__lfWheel[");
const slipsOpen = (e: string) => e.includes('.lf-card")].filter');

test("L1a reads the camera only once the page has logged the wheel", async () => {
  const settled1 = cam(2);
  const { w, k } = world((e, w) => {
    const logged = sinceReset(w, "wheel").filter((a) => landed(w, a)).length;
    if (e === readCam) return cam(logged > 0 ? 2.4 : 2);
    if (isLastWheel(e)) return logged > 0 ? true : null;
    if (isWheelLog(e)) return { n: logged };
    return undefined;
  });
  await l1aConsumed(k, settled1, PT);
  assert.equal(w.checked.get("L1a"), true, "L1a read the camera before the wheel landed");
});

test("L1a's wait times out naming the check when the wheel is never logged", async () => {
  const { k } = world((e) => (isWheelLog(e) ? { n: 0 } : undefined));
  await assert.rejects(l1aConsumed(k, cam(2), PT), (err: Error) =>
    err.message.startsWith("settle timeout L1a the wheel landed: "),
  );
});

test("the close-in clamp's loop ends only on a logged wheel that left the scale", async () => {
  const movers = (w: World) => acts(w, "wheel").filter((a) => !a.instant && landed(w, a)).length;
  const scaleOf = (w: World) => Math.min(7, 2 * 1.5 ** movers(w));
  const { w, k } = world(
    (e, w) => {
      const log = sinceReset(w, "wheel").filter((a) => landed(w, a));
      if (e === readCam) return cam(scaleOf(w));
      if (isLastWheel(e)) return log.length ? !log.at(-1)!.instant : null;
      if (isWheelLog(e)) return { n: log.length };
      if (e === "window.scrollY") return 0;
      return undefined;
    },
    (_a, w) => ({ instant: scaleOf(w) >= 7 }),
  );
  await l1bCloseClamp(k, PT);
  assert.equal(w.checked.get("L1b"), true, "the loop ended on a stale read below the clamp");
});

test("L1e reads the flick and the wheel after it together, and retries a pair the browser coalesced", async () => {
  const pairs = (w: World) => acts(w, "wheel").filter((a) => a.dy === 480);
  const entries = (w: World) => {
    const q = pairs(w).at(-1);
    if (!q || w.clock - q.at < LAG) return [];
    return [{ p: q.p, t: 1000 }, ...(q.n! >= 2 && w.clock - q.at >= 5 ? [{ p: q.p, t: 1030 }] : [])];
  };
  const { w, k } = world(
    (e, w) => {
      const log = entries(w);
      if (e === readCam) return cam(1.5);
      if (e === "window.scrollY") return 0;
      if (e.includes("addEventListener")) return true;
      if (e === "window.__lfW2") return log;
      if (e.includes("performance.now()"))
        return { n: log.length, age: log.length ? 100 * (w.clock - pairs(w).at(-1)!.at - LAG + 1) : 0 };
      if (isWheelLog(e)) return { n: acts(w, "wheel").filter((a) => landed(w, a)).length };
      return undefined;
    },
    (a, w) =>
      a.dy === 480 ? { n: pairs(w).length + 1, p: acts(w, "wheel").some((x) => x.dy === -240 && landed(w, x)) } : {},
  );
  await l1eAbsorbed(k, PT, cam(1.5));
  assert.equal(w.checked.get("L1e"), true, "L1e certified a stream it had not read whole");
  assert.equal(
    w.reads.filter((r) => r.expr === "window.scrollTo(0, 0)").length,
    2,
    "the first, coalesced pair was not retried",
  );
});

const PROSE_ENDS = (e: string) => e.includes("__lfProseEnds");
const PROSE_TOP = (e: string) => e.includes("top: s.scrollTop") && !PROSE_ENDS(e);

test("ArrowDown's scroll is read only once the prose's scroll has ended", async () => {
  const { w, k } = world((e, w) => {
    const key = acts(w, "key:ArrowDown").some((a) => landed(w, a));
    if (PROSE_ENDS(e)) return { ends: key ? 1 : 0, top: key ? 40 : 0, max: 300, y: 0 };
    if (e.includes("?.scrollTop ?? null")) return key ? 40 : 0;
    if (e === "window.scrollY") return 0;
    return undefined;
  });
  await l5bArrowScrolls(k, { open: true, focused: true, scrollTop: 0, max: 300 }, 0);
  assert.equal(w.checked.get("L5b"), true, "the prose was read at top 0");
});

test("the prose is wheeled once per finished scroll until its end", async () => {
  const { w, k } = world((e, w) => {
    const n = acts(w, "wheel").filter((a) => landed(w, a)).length;
    if (e === readCam) return cam(2);
    if (e === "window.scrollY") return 0;
    if (PROSE_ENDS(e)) return { ends: n, top: Math.min(240, 120 * n), max: 240, y: 0 };
    if (PROSE_TOP(e)) return { top: Math.min(240, 120 * n), max: 240 };
    if (e.includes("Math.round(r.x")) return PT;
    if (e.includes(".lf-card-close")) return [0, 0, 40, 40];
    return undefined;
  });
  await l2ProseScrolls(k, 0);
  assert.equal(w.checked.get("L2"), true, "the prose did not reach its end");
  assert.equal(acts(w, "wheel").length, 2, "a stale read of the prose sent a wheel too many");
});

test("each slip's Enter link is measured only once its card has finished opening", async () => {
  const rest = new Map<string, number>();
  const idOf = (e: string) => /lf-card-([a-z-]+)/.exec(e)![1]!;
  const { k } = world((e, w) => {
    if (e === readCam) return cam(2);
    if (e === "window.scrollY") return 0;
    if (e.includes("Number(cs.opacity) > 0.95")) return true;
    if (e.includes("op: cs.opacity")) {
      const n = (rest.get(idOf(e)) ?? 0) + 1;
      rest.set(idOf(e), n);
      return { op: n < 3 ? "0.97" : "1", t: "none", w: 200, h: n < 3 ? 40 : 44 };
    }
    if (e.includes("return { id:"))
      return { id: idOf(e), open: true, w: 200, h: (rest.get(idOf(e)) ?? 0) >= 3 ? 44 : 40 };
    if (slipsOpen(e))
      return { open: acts(w, "click").length > acts(w, "key:Escape").filter((a) => landed(w, a)).length ? 1 : 0 };
    if (e.includes("lf-legend-btn") || e.includes("lf-card-prose")) return PT;
    return undefined;
  });
  const { boxes } = await k.measureEnters();
  assert.deepEqual(
    boxes.map((b) => b?.h),
    [44, 44, 44, 44],
    "a box was read while its card was still opening",
  );
});

const shutting = (open: number, closes: boolean) =>
  world((e, w) =>
    slipsOpen(e) ? { open: closes && acts(w, "key:Escape").some((a) => landed(w, a)) ? 0 : open } : undefined,
  );
const slipReads = (w: World) => w.reads.filter((r) => slipsOpen(r.expr));

test("shutSlips waits for the open slip to be set aside", async () => {
  const { w, k } = shutting(1, true);
  await k.shutSlips("L28 the last slip set aside");
  assert.deepEqual(slipReads(w).at(-1)?.out, { open: 0 }, "shutSlips returned while the slip was still open");
});

test("shutSlips times out naming the slip when it never closes", async () => {
  const { k } = shutting(1, false);
  await assert.rejects(k.shutSlips("L28 the last slip set aside"), (err: Error) =>
    err.message.startsWith("settle timeout L28 the last slip set aside: "),
  );
});

test("shutSlips with no slip open presses Escape and waits for nothing", async () => {
  const { w, k } = shutting(0, true);
  await k.shutSlips("L28 the last slip set aside");
  assert.equal(slipReads(w).length, 1, "it read the slips more than once");
  assert.equal(acts(w, "key:Escape").length, 1, "it did not press Escape once");
  assert.deepEqual(w.slept, [], "it paused");
});
