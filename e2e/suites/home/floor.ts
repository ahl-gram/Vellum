// Home under the 1024 floor (Issue #762 pull request D; Alex, 2026-10-06, issuecomment-6022258449): on a window narrower than the page, a wheel more sideways than up or down scrolls the page, over the chart and over an open slip, and never zooms the chart; and a station's slip opened there brings itself into the window.
import { makeSettle } from "../../support/settle.ts";
import type { Payload, Point } from "../../types.ts";
import type { HomeKit } from "./kit.ts";

const W = 640;
const H = 800;

type View = { sx: number; sy: number; scale: number; cw: number; ready: boolean };
// The camera counts only once the sheet's box is the one the page wrote (CI caught home's sheet at its stage-sized box with the camera written, the page complete and the fonts loaded, on main's build too).
const VIEW: Payload<View> = `(() => {
  if (!document.documentElement || !document.body) return { sx: 0, sy: 0, scale: NaN, cw: 0, ready: false };
  const s = document.getElementById("lf-sheet"), st = document.querySelector("#lf-stage.cam");
  const w = s && st && s.style.transform ? new DOMMatrixReadOnly(s.style.transform) : null;
  const r = s ? s.getBoundingClientRect() : null, sr = st ? st.getBoundingClientRect() : null;
  const laidOut = !!w && !!r && !!sr && Math.abs(r.width - s.offsetWidth * w.a) < 1 && Math.abs(r.left - sr.left - w.e) < 1 && Math.abs(r.top - sr.top - w.f) < 1;
  return { sx: scrollX, sy: scrollY, scale: w ? w.a : NaN, cw: document.documentElement.clientWidth, ready: document.readyState === "complete" && laidOut };
})()`;

const centreOf = (selector: string): Payload<Point | null> =>
  `(() => { const e = document.querySelector(${JSON.stringify(selector)}); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; })()`;

async function landHome(k: HomeKit, w: number): Promise<View> {
  await k.send("Emulation.setDeviceMetricsOverride", { width: w, height: H, deviceScaleFactor: 1, mobile: false });
  await k.send("Page.navigate", { url: "about:blank" });
  await k.send("Page.navigate", { url: `http://127.0.0.1:${k.PORT}/` });
  let committed = false;
  for (let i = 0; i < 300 && !committed; i++) {
    committed = await k
      .evaluate<boolean>(
        `location.pathname === "/" && document.readyState === "complete" && !!document.getElementById("lf-stage")`,
      )
      .catch(() => false);
    if (!committed) await k.sleep(50);
  }
  if (!committed) throw new Error(`home never came up at ${w}x${H}`);
  return makeSettle(k)(
    VIEW,
    (d, last) => d.ready && d.cw === w && last !== null && JSON.stringify(d) === JSON.stringify(last),
    `home floor open ${w}`,
    300,
  );
}

async function openHome(k: HomeKit): Promise<View> {
  await k.setTouch(false);
  return landHome(k, W);
}

async function scrolledTo(k: HomeKit, left: number): Promise<View> {
  await k.evaluate(`window.scrollTo(${left}, 0)`);
  return makeSettle(k)(
    VIEW,
    (d, last) => d.sx === left && d.sy === 0 && last !== null && JSON.stringify(d) === JSON.stringify(last),
    `home floor at ${left}`,
  );
}

async function wheelled(k: HomeKit, at: Point, dx: number, dy: number, before: View): Promise<View> {
  for (let i = 0; i < 3; i++) {
    await k.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: at.x, y: at.y });
    await k.send("Input.dispatchMouseEvent", { type: "mouseWheel", x: at.x, y: at.y, deltaX: dx, deltaY: dy });
  }
  return makeSettle(k)(
    VIEW,
    (d, last) =>
      (d.sx !== before.sx || d.scale !== before.scale) && last !== null && JSON.stringify(d) === JSON.stringify(last),
    `home floor wheel ${dx},${dy}`,
  );
}

export async function h19Sideways(k: HomeKit): Promise<void> {
  await openHome(k);
  const at = { x: W / 2, y: H / 2 };
  const rows: string[] = [];
  const faults: string[] = [];
  for (const [dx, dy, from] of [
    [120, 6, 0],
    [120, -6, 0],
    [-120, 6, 300],
  ] as const) {
    const before = await scrolledTo(k, from);
    const after = await wheelled(k, at, dx, dy, before);
    if (Math.sign(after.sx - before.sx) !== Math.sign(dx))
      faults.push(`a wheel of ${dx},${dy} from ${from} left the page at ${after.sx}`);
    if (after.scale !== before.scale)
      faults.push(`a wheel of ${dx},${dy} zoomed the chart from ${before.scale} to ${after.scale}`);
    rows.push(`${dx},${dy} from ${from}: scrolled to ${after.sx},${after.sy}, scale ${after.scale}`);
  }
  const top = await scrolledTo(k, 0);
  const zoomed = await wheelled(k, at, 0, -120, top);
  rows.push(`the control 0,-120: scale ${top.scale} to ${zoomed.scale}`);
  k.check(
    "H19 at a 640 window, a wheel over the chart more sideways than up or down scrolls the page that way, rightward drifting down or up and leftward back, and leaves the chart's scale alone, while a vertical wheel at the same point zooms it, the same-run control (Alex, 2026-10-06, Issue #762: the downward drift's page scroll is the accepted cost, reported here)",
    faults.length === 0 && zoomed.scale > top.scale,
    `${rows.join(" | ")}${faults.length ? `; ${faults.join("; ")}` : ""}`,
  );
}

type Slip = { open: boolean; overflows: boolean };
const SLIP = (id: string): Payload<Slip> =>
  `(() => { const c = document.getElementById("lf-card-${id}"); const s = c ? c.querySelector(".lf-card-scroll") : null; return { open: !!c && !c.hidden && Number(getComputedStyle(c).opacity) === 1, overflows: !!s && s.scrollHeight > s.clientHeight }; })()`;

async function openSlip(k: HomeKit, id: string): Promise<Slip> {
  const pip = `.lf-station[data-station="${id}"]`;
  const left = await k.evaluate<number>(
    `(() => { const r = document.querySelector('${pip}').getBoundingClientRect(), root = document.documentElement; return Math.min(root.scrollWidth - root.clientWidth, Math.max(0, Math.round(r.left + r.width / 2 + scrollX - ${W / 2}))); })()`,
  );
  await scrolledTo(k, left);
  const at = await k.evaluate(centreOf(pip));
  const hit =
    at !== null &&
    (await k.evaluate<boolean>(
      `(() => { const e = document.elementFromPoint(${at.x}, ${at.y}); return !!e && !!e.closest('${pip}'); })()`,
    ));
  if (at === null || !hit) throw new Error(`the ${id} pip takes no hit at ${JSON.stringify(at)}`);
  await k.clickAt(at.x, at.y);
  return makeSettle(k)(SLIP(id), (d) => d.open, `home floor ${id} slip open`);
}

type Shown = { open: boolean; sx: number; sy: number; cw: number; slip: [number, number]; pip: number };
const SHOWN = (id: string): Payload<Shown> => `(() => {
  const c = document.getElementById("lf-card-${id}");
  if (!c) return { open: false, sx: 0, sy: 0, cw: 0, slip: [0, 0], pip: 0 };
  const r = c.getBoundingClientRect(), p = document.querySelector('.lf-station[data-station="${id}"]').getBoundingClientRect();
  const done = !c.hidden && Number(getComputedStyle(c).opacity) === 1 && c.getAnimations({ subtree: true }).length === 0;
  return { open: done, sx: scrollX, sy: scrollY, cw: document.documentElement.clientWidth, slip: [Math.round(r.left * 10) / 10, Math.round(r.right * 10) / 10], pip: Math.round((p.left + p.width / 2) * 10) / 10 };
})()`;

async function clickStation(k: HomeKit, w: number, scrollDown: boolean): Promise<{ id: string; shown: Shown }> {
  await landHome(k, w);
  if (scrollDown) await k.evaluate(`window.scrollTo(0, 600)`);
  const pick = await k.evaluate<{ id: string; x: number; y: number } | null>(`(() => {
    for (const id of ${JSON.stringify(scrollDown ? ["reading-room", "gallery", "atlas", "explorer"] : ["explorer"])}) {
      const r = document.querySelector('.lf-station[data-station="' + id + '"]').getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      const e = document.elementFromPoint(x, y);
      if (x > 0 && x < innerWidth && y > 0 && y < innerHeight && e && e.closest('.lf-station[data-station="' + id + '"]')) return { id, x: Math.round(x), y: Math.round(y) };
    }
    return null;
  })()`);
  if (pick === null) throw new Error(`no station pip takes a hit at ${w}x${H}${scrollDown ? " scrolled down" : ""}`);
  await k.clickAt(pick.x, pick.y);
  const shown = await makeSettle(k)(
    SHOWN(pick.id),
    (d, last) => d.open && last !== null && JSON.stringify(d) === JSON.stringify(last),
    `home reveal ${pick.id} at ${w}`,
    200,
  );
  await k.pressKey("Escape", "Escape", 27);
  return { id: pick.id, shown };
}

export async function h20Reveal(k: HomeKit): Promise<void> {
  await k.setTouch(false);
  const faults: string[] = [];
  const rows: string[] = [];
  const arms: readonly (readonly [number, string, boolean])[] = [
    [560, "reduce", false],
    [640, "reduce", false],
    [900, "reduce", false],
    [640, "no-preference", false],
    [640, "no-preference", true],
    [1280, "reduce", false],
  ];
  try {
    for (const [w, motion, scrollDown] of arms) {
      await k.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: motion }] });
      const { id, shown } = await clickStation(k, w, scrollDown);
      const at = `${w}x${H} ${motion}${scrollDown ? " scrolled down" : ""} (${id})`;
      if (shown.slip[0] < 0 || shown.slip[1] > shown.cw)
        faults.push(`${at}: the slip stands at ${shown.slip.join(" to ")} in a ${shown.cw} window`);
      if (w >= 593 && (shown.pip < 0 || shown.pip > shown.cw))
        faults.push(`${at}: the station's pip left the window, at ${shown.pip}`);
      if (shown.sy !== 0) faults.push(`${at}: the window ended ${shown.sy} down, not at the stage's top`);
      if (w >= 1024 && shown.sx !== 0)
        faults.push(`${at}: a window as wide as the page scrolled sideways by ${shown.sx}`);
      rows.push(`${at}: scrolled ${shown.sx},${shown.sy}, slip ${shown.slip.join(" to ")}, pip ${shown.pip}`);
    }
  } finally {
    await k.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  }
  k.check(
    "H20 a station's slip opened on a window narrower than the page brings itself wholly into the window by a sideways scroll, at 560, 640 and 900 with motion reduced and at 640 with motion on, there also after the reader had scrolled down, the window ending at the stage's top; the station clicked stays in the window from about 593 wide; at 1280 nothing scrolls (Alex, 2026-10-06, Issue #762)",
    faults.length === 0,
    `${rows.join(" | ")}${faults.length ? `; ${faults.join("; ")}` : ""}`,
  );
}

type Back = { id: string; overflows: boolean; from: number; to: number };

async function backOverSlip(k: HomeKit, id: string, over: string): Promise<Back> {
  await openHome(k);
  const slip = await openSlip(k, id);
  const before = await scrolledTo(k, 346);
  const at = await k.evaluate(centreOf(over));
  if (at === null) throw new Error(`no ${over} on the ${id} slip`);
  const after = await wheelled(k, at, -120, 0, before);
  await k.pressKey("Escape", "Escape", 27);
  return { id, overflows: slip.overflows, from: before.sx, to: after.sx };
}

export async function h19bOverSlips(k: HomeKit): Promise<void> {
  const explorer = await backOverSlip(k, "explorer", "#lf-card-explorer .lf-card-prose");
  const how = await backOverSlip(k, "how", "#lf-card-how .lf-card-scroll");
  k.check(
    "H19b at a 640 window, a leftward wheel over an open slip scrolls the page back, over the Explorer's slip and over the How It Works slip's own scrolling text, whose body overflows at this window, so the wheel reaches the page past both the slips' guard and that body's vertical-only containment (Issue #762)",
    explorer.to < explorer.from && how.to < how.from && how.overflows,
    JSON.stringify({ explorer, how }),
  );
}
