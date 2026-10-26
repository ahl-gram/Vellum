import { test } from "node:test";
import assert from "node:assert/strict";
import { readCam, type Cam } from "../../e2e/support/home.ts";
import { l9d2Debt, l9eFloor } from "../../e2e/suites/landfall/clamps.ts";
import { entersKit, gestureKit, stageKit } from "../../e2e/suites/landfall/kit.ts";
import { l9bPinch } from "../../e2e/suites/landfall/touch.ts";
import type { SuiteContext } from "../../e2e/types.ts";

// A state change an action causes lands LAG evaluates after it, so a pause that resolves at once reads the state before it lands.
const LAG = 2;
type Act = { kind: string; at: number };
type World = { clock: number; acts: Act[]; reads: { expr: string; out: unknown }[]; checked: Map<string, boolean> };
const landedOf = (w: World, ...kinds: string[]): number =>
  w.acts.filter((a) => kinds.includes(a.kind) && w.clock - a.at >= LAG).length;
const isEnds = (e: string) => e.includes("__lfEnds");
const world = (answer: (expr: string, w: World) => unknown) => {
  const w: World = { clock: 0, acts: [], reads: [], checked: new Map() };
  const act = (kind: string) => w.acts.push({ kind, at: w.clock });
  const ctx = {
    evaluate: (expr: string) => {
      w.clock++;
      const out = answer(expr, w);
      w.reads.push({ expr, out });
      return Promise.resolve(out);
    },
    send: (method: string, params: { type?: string; key?: string }) => {
      if (method === "Input.dispatchKeyEvent" && params.type === "keyDown") act(`key:${params.key}`);
      return Promise.resolve({});
    },
    touch: (type: string) => {
      if (type === "touchEnd") act("touchEnd");
      return Promise.resolve();
    },
    pinch: () => {
      act("pinch");
      return Promise.resolve();
    },
    sleep: () => Promise.resolve(),
    check: (name: string, ok: unknown) => void w.checked.set(name.split(" ")[0]!, !!ok),
    PORT: 8765,
  } as unknown as SuiteContext;
  return { w, k: entersKit(gestureKit(stageKit(ctx))) };
};
const cam = (scale: number, over: Partial<Cam> = {}): Cam => ({
  veil: false,
  lifting: false,
  status: null,
  scale,
  x: 0,
  y: 0,
  fit: 1,
  expected: 1.72,
  ...over,
});
const PT = { x: 640, y: 400 };
const ROOMY = { cx: 300, cy: 200, w: 1024, h: 768 };
const isRoom = (e: string) => e.includes("cx: m.e");
const endsOf = (w: World) => ({ ends: 2 * landedOf(w, "touchEnd", "pinch") });

test("two fingers are read only once both have lifted", async () => {
  const { w, k } = world((e, w) => (isEnds(e) ? endsOf(w) : undefined));
  await k.twoFingerDrag(PT);
  assert.deepEqual(w.reads.at(-1)?.out, { ends: 2 }, "the drag handed back before both fingers lifted");
  assert.ok(isEnds(w.reads.at(-1)?.expr ?? ""), "the drag's last read was not the fingers' lift");
});

test("the two-finger drag times out naming itself when the fingers never lift", async () => {
  const { k } = world((e) => (isEnds(e) ? { ends: 0 } : undefined));
  await assert.rejects(k.twoFingerDrag(PT), (err: Error) =>
    err.message.startsWith("settle timeout the two-finger drag's fingers lifted: "),
  );
});

test("the floor's pinch loop ends only on a pinch whose fingers lifted and left the scale", async () => {
  const { w, k } = world((e, w) => {
    if (e === readCam)
      return cam(Math.max(0.65, 1.5 * 0.6 ** landedOf(w, "pinch")), {
        x: 100 + 40 * landedOf(w, "touchEnd"),
        y: 100 + 30 * landedOf(w, "touchEnd"),
      });
    if (isRoom(e)) return ROOMY;
    return isEnds(e) ? endsOf(w) : undefined;
  });
  await l9eFloor(k, PT);
  assert.equal(w.checked.get("L9e"), true, "the loop ended off the floor, or the drag was read before it landed");
});

test("a pinch is read only once its fingers lifted", async () => {
  const { w, k } = world((e, w) => {
    if (e === readCam) return cam(2 * 2 ** landedOf(w, "pinch"));
    return isEnds(e) ? endsOf(w) : undefined;
  });
  await l9bPinch(k, PT);
  assert.equal(w.checked.get("L9b"), true, "the camera was read before the pinch landed");
});

test("L9d2 reads the camera only after both fingers lifted", async () => {
  const { w, k } = world((e, w) => {
    if (e === readCam) return cam(7);
    return isEnds(e) ? endsOf(w) : undefined;
  });
  await l9d2Debt(k, PT);
  const lifted = w.reads.findLastIndex((r) => isEnds(r.expr) && (r.out as { ends: number }).ends === 2);
  const judged = w.reads.findLastIndex((r) => r.expr === readCam);
  assert.ok(lifted >= 0, "no read saw both fingers lifted");
  assert.ok(lifted < judged, "the camera L9d2 judges was read before both fingers lifted");
});

const flight = [3, 2, 2, 1.5, 1, 1];
const recentring = (stalls: boolean) => {
  let since = 0;
  return world((e, w) => {
    if (e !== readCam) return undefined;
    if (!w.acts.some((a) => a.kind === "key:0")) return cam(3);
    const scale = stalls ? 1.5 : (flight[Math.min(since, flight.length - 1)] ?? 1);
    since++;
    return cam(scale);
  });
};

test("recenter hands back only once the camera rests at the chart's fit", async () => {
  const { k } = recentring(false);
  await k.recenter();
  assert.equal((await k.camNow())?.scale, 1, "recenter handed back mid-flight");
});

test("recenter times out naming itself when the flight never reaches the fit", async () => {
  const { k } = recentring(true);
  await assert.rejects(k.recenter(), (err: Error) =>
    err.message.startsWith("settle timeout the camera recentred by the 0 key: "),
  );
});
