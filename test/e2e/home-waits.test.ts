import { test } from "node:test";
import assert from "node:assert/strict";
import { h8KeySkip, h8bHoldSkip } from "../../e2e/suites/home/ceremony.ts";
import { IDLE_DELAY_MS } from "../../src/site/home/drift.ts";
import { DRIFT_TRIES, h15aDrift, h15bWheelStops, h15cRearmed, h15dFlightStops } from "../../e2e/suites/home/drift.ts";
import { homeKit } from "../../e2e/suites/home/kit.ts";
import { h14cLegend, h14dPipHover } from "../../e2e/suites/home/stations.ts";
import { makeMouse, readCam, readXform, type Cam } from "../../e2e/support/home.ts";
import type { SuiteContext } from "../../e2e/types.ts";

type Sent = { method: string; params: Record<string, unknown> };

const world = (answer: (expression: string, sent: readonly Sent[], slept: readonly number[]) => unknown) => {
  const sent: Sent[] = [];
  const asked: string[] = [];
  const slept: number[] = [];
  const checked: { code: string; ok: boolean }[] = [];
  const ctx = {
    evaluate: (expression: string) => {
      asked.push(expression);
      return Promise.resolve(answer(expression, sent, slept));
    },
    send: (method: string, params: Record<string, unknown> = {}) => {
      sent.push({ method, params });
      return Promise.resolve({});
    },
    sleep: (ms: number) => {
      slept.push(ms);
      return Promise.resolve();
    },
    check: (name: string, ok: unknown) => void checked.push({ code: name.split(" ")[0]!, ok: !!ok }),
    shoot: () => Promise.resolve(),
    PORT: 8765,
  } as unknown as SuiteContext;
  return { ctx, sent, asked, slept, checked };
};

const keysDown = (sent: readonly Sent[]): unknown[] =>
  sent
    .filter((s) => s.method === "Input.dispatchKeyEvent" && s.params["type"] === "keyDown")
    .map((s) => s.params["key"]);
const wheeled = (sent: readonly Sent[]): boolean =>
  sent.some((s) => s.method === "Input.dispatchMouseEvent" && s.params["type"] === "mouseWheel");

const cam = (over: Partial<Cam>): Cam => ({
  veil: false,
  lifting: false,
  status: null,
  scale: 1.72,
  x: 0,
  y: 0,
  fit: 1,
  expected: 1.72,
  ...over,
});
const ANCHORED = cam({ veil: true, status: "Sounding · 12 fathom", scale: 0.78 });
const HOLD = cam({ veil: true, status: "Landfall", scale: 0.78 });
const MIDFLIGHT = cam({ scale: 1.2 });
const LANDED = cam({});
const ZOOMED = cam({ scale: 2.58 });
const matrix = (n: number): string => `matrix(1, 0, 0, 1, ${n}, 0)`;
const REST = matrix(0);

test("H8 reads the camera only once the key has moved it off the anchorage, not as the key returns", async () => {
  let n = 0;
  const w = world((e, sent) => {
    if (e !== readCam) return null;
    return keysDown(sent).length === 0 ? ANCHORED : [ANCHORED, ANCHORED, LANDED][Math.min(n++, 2)];
  });
  await h8KeySkip(homeKit(w.ctx));
  assert.deepEqual(w.checked, [{ code: "H8", ok: true }]);
});

test("H8 fails when the key starts a flight rather than the jump", async () => {
  let n = 0;
  const w = world((e, sent) => {
    if (e !== readCam) return null;
    return keysDown(sent).length === 0 ? ANCHORED : [ANCHORED, MIDFLIGHT, LANDED][Math.min(n++, 2)];
  });
  await h8KeySkip(homeKit(w.ctx));
  assert.deepEqual(w.checked, [{ code: "H8", ok: false }]);
});

test("H8 times out when the skip lands later than the key's own handler", async () => {
  let n = 0;
  const w = world((e, sent) => {
    if (e !== readCam) return null;
    return keysDown(sent).length === 0 || n++ < 5 ? ANCHORED : LANDED;
  });
  await assert.rejects(h8KeySkip(homeKit(w.ctx)), (err: Error) =>
    err.message.startsWith("settle timeout H8 the key moved the camera off the anchorage: "),
  );
});

test("H8b times out when the skip lands later than the key's own handler", async () => {
  let n = 0;
  const w = world((e, sent) => {
    if (e !== readCam) return null;
    return keysDown(sent).length === 0 || n++ < 5 ? HOLD : LANDED;
  });
  await assert.rejects(h8bHoldSkip(homeKit(w.ctx)), (err: Error) =>
    err.message.startsWith("settle timeout H8b the key moved the camera off the anchorage: "),
  );
});

test("H8b reads the camera only once the key has taken the hold off the anchorage", async () => {
  let n = 0;
  const w = world((e, sent) => {
    if (e !== readCam) return null;
    const keys = keysDown(sent);
    if (keys.includes("+")) return ZOOMED;
    return keys.includes("Escape") ? [HOLD, HOLD, LANDED][Math.min(n++, 2)] : HOLD;
  });
  await h8bHoldSkip(homeKit(w.ctx));
  assert.deepEqual(w.checked, [{ code: "H8b", ok: true }]);
});

const drifting = (restFor: number) => {
  let n = 0;
  return world((e) => {
    if (e === readXform) return n++ < restFor ? REST : matrix(n);
    if (e.includes("clampHeld")) return { xform: n++ < restFor ? REST : matrix(n), clampHeld: true };
    if (e.includes("DOMMatrixReadOnly")) return true;
    return null;
  });
};

test("H15a samples the drift only once it has left the rest it started from", async () => {
  const w = drifting(3);
  await h15aDrift(w.ctx);
  assert.deepEqual(w.checked, [{ code: "H15a", ok: true }]);
});

test("H15a times out naming the drift after the idle delay and its headroom", async () => {
  const w = drifting(Infinity);
  await assert.rejects(h15aDrift(w.ctx), (err: Error) =>
    err.message.startsWith("settle timeout H15a the drift started: "),
  );
  assert.equal(w.asked.filter((e) => e.includes("clampHeld")).length, DRIFT_TRIES);
  assert.ok(DRIFT_TRIES * 50 > IDLE_DELAY_MS, "the budget outlasts the idle delay");
});

test("H15c samples the drift only once it has left the rest again", async () => {
  const w = drifting(3);
  await h15cRearmed(w.ctx);
  assert.deepEqual(w.checked, [{ code: "H15c", ok: true }]);
});

test("H15b takes its first stillness sample only once the wheel's zoom has landed", async () => {
  const frames = [
    { scale: 1.65, x: 0 },
    { scale: 1.65, x: 0 },
    { scale: 1.65, x: 7 },
    { scale: 1.65, x: 7 },
  ];
  let n = 0;
  const frame = () => frames[n++] ?? { scale: 1.9965, x: 0 };
  const w = world((e, sent) => {
    if (e.includes(`getElementById("lf-stage").getBoundingClientRect()`)) return { x: 400, y: 300 };
    if (!wheeled(sent)) return e === readCam ? cam({ scale: 1.65 }) : null;
    if (e === readCam) return cam(frame());
    if (e === readXform) {
      const f = frame();
      return `matrix(${f.scale}, 0, 0, ${f.scale}, ${f.x}, 0)`;
    }
    return null;
  });
  await h15bWheelStops(w.ctx);
  assert.deepEqual(w.checked, [{ code: "H15b", ok: true }]);
});

test("H15b times out when the drift keeps moving after the wheel", async () => {
  let n = 0;
  const w = world((e, sent) => {
    if (e.includes(`getElementById("lf-stage").getBoundingClientRect()`)) return { x: 400, y: 300 };
    if (e !== readCam) return null;
    return wheeled(sent) ? cam({ scale: 1.9965, x: Math.min(n++, 20) }) : cam({ scale: 1.65 });
  });
  await assert.rejects(h15bWheelStops(w.ctx), (err: Error) =>
    err.message.startsWith("settle timeout H15b the wheel's zoom landed: "),
  );
});

type Stage = { open: boolean; printed: string; writes: number; frame: number };
const stage = (open: boolean, printed: string, writes: number, frame: number): Stage => ({
  open,
  printed,
  writes,
  frame,
});
const H15D_MID = "matrix(2.00288, 0, 0, 2.00288, -1160.2, -1159.6)";
const H15D_TAIL = "matrix(2.00288, 0, 0, 2.00288, -1148.6, -1159.6)";
const H15D_END = "matrix(2.00288, 0, 0, 2.00288, -1148.59, -1159.6)";

const landingPage = (stages: readonly Stage[]) => {
  let at = -1;
  const now = (): Stage => stages[Math.max(at, 0)]!;
  return world((e, sent, slept) => {
    if (e.includes(`data-station="reading-room"`) && e.includes("scrollIntoView")) return { x: 400, y: 300 };
    if (e.includes("MutationObserver")) return true;
    if (!sent.some((s) => s.params["type"] === "mousePressed")) return null;
    if (e === readXform) return slept.includes(900) ? stages[stages.length - 1]!.printed : now().printed;
    if (!e.includes("lf-card-reading-room")) return null;
    at = Math.min(at + 1, stages.length - 1);
    const s = now();
    return e.includes(readXform)
      ? { open: s.open, xform: s.printed }
      : { open: s.open, writes: s.writes, frame: s.frame };
  });
};

test("H15d hands over once the page has stopped writing the camera, not when its printed matrix first repeats", async () => {
  const w = landingPage([
    stage(false, H15D_MID, 10, 10),
    stage(true, H15D_TAIL, 13, 13),
    stage(true, H15D_TAIL, 16, 16),
    stage(true, H15D_END, 18, 19),
    stage(true, H15D_END, 18, 22),
  ]);
  await h15dFlightStops(homeKit(w.ctx));
  assert.deepEqual(w.checked, [{ code: "H15d", ok: true }]);
});

test("H15d hands over only once a frame has run between its two reads", async () => {
  const w = landingPage([
    stage(false, H15D_MID, 10, 10),
    stage(true, H15D_TAIL, 13, 13),
    stage(true, H15D_TAIL, 13, 13),
    stage(true, H15D_END, 15, 16),
    stage(true, H15D_END, 15, 19),
  ]);
  await h15dFlightStops(homeKit(w.ctx));
  assert.deepEqual(w.checked, [{ code: "H15d", ok: true }]);
});

test("H15d takes its first stillness sample only once the station flight has landed", async () => {
  const w = landingPage([
    stage(false, matrix(1), 3, 3),
    stage(false, matrix(2), 6, 6),
    stage(false, matrix(2), 6, 9),
    stage(true, matrix(3), 9, 12),
    stage(true, matrix(4), 12, 15),
    stage(true, matrix(5), 14, 18),
    stage(true, matrix(5), 14, 21),
  ]);
  await h15dFlightStops(homeKit(w.ctx));
  assert.deepEqual(w.checked, [{ code: "H15d", ok: true }]);
});

const pip = (cx: number, over: Record<string, unknown> = {}) => ({
  cx,
  cy: 200,
  w: 34,
  glyphW: 25.46,
  btnBg: "rgba(0, 0, 0, 0)",
  hover: false,
  ...over,
});

test("H14d reads the pip at rest only once the camera is home, and on the hover only once the glyph has grown", async () => {
  const atlas = cam({ scale: 2.6, x: -100, y: 50 });
  const homed = [
    { cam: atlas, pip: pip(900) },
    { cam: atlas, pip: pip(900) },
    { cam: cam({ scale: 2, x: -50 }), pip: pip(700) },
    { cam: cam({ scale: 1.9, x: -20 }), pip: pip(500) },
  ];
  const hovered = [pip(300), pip(300), pip(300, { hover: true, glyphW: 28.6 })];
  let flying = 0;
  let hovering = 0;
  const w = world((e, sent) => {
    if (e === readCam) return atlas;
    const hoverPhase = sent.some((s) => s.method === "Input.dispatchMouseEvent" && s.params["x"] !== 20);
    const flight = () => homed[flying++] ?? { cam: cam({}), pip: pip(300) };
    const hover = () => hovered[hovering++] ?? pip(300, { hover: true, glyphW: 31.82 });
    if (e.includes("pip:")) return flight();
    if (e.includes(`data-station="atlas"`)) return hoverPhase ? hover() : flight().pip;
    return null;
  });
  await h14dPipHover(homeKit(w.ctx));
  assert.deepEqual(w.checked, [{ code: "H14d", ok: true }]);
});

test("H14c hands over only once the slip is set aside and the camera has come to rest", async () => {
  const aside = [
    { hidden: false, xform: matrix(1) },
    { hidden: false, xform: matrix(1) },
    { hidden: true, xform: matrix(2) },
  ];
  let n = 0;
  const w = world((e, sent) => {
    if (e.includes(".lf-legend-btn")) return { x: 400, y: 300 };
    if (e.includes(".lf-card-title")) return { open: true, title: "The Reading Room" };
    if (e.includes("xform:") && keysDown(sent).includes("Escape"))
      return aside[n++] ?? { hidden: true, xform: matrix(3) };
    return null;
  });
  await h14cLegend(homeKit(w.ctx));
  assert.deepEqual(w.checked, [{ code: "H14c", ok: true }]);
  assert.equal(w.asked.filter((e) => e.includes("xform:")).length, 5);
});

test("dragAcross lets go and pauses for nothing", async () => {
  const w = world(() => null);
  await makeMouse(w.ctx).dragAcross({ x: 10, y: 10 }, 100, 0);
  assert.deepEqual(
    w.sent.map((s) => s.params["type"]),
    ["mousePressed", ...Array<string>(8).fill("mouseMoved"), "mouseReleased"],
  );
  assert.deepEqual(w.slept, []);
});
