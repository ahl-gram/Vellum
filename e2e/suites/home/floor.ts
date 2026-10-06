// Home under the 1024 floor (Issue #762 pull request D; Alex, 2026-10-06, issuecomment-6022258449): on a window narrower than the page, a wheel more sideways than up or down scrolls the page, over the chart and over an open slip, and never zooms the chart.
import { makeSettle } from "../../support/settle.ts";
import type { Payload, Point } from "../../types.ts";
import type { HomeKit } from "./kit.ts";

const W = 640;
const H = 800;

type View = { sx: number; sy: number; scale: number; cw: number; ready: boolean };
const VIEW: Payload<View> = `(() => {
  const s = document.getElementById("lf-sheet");
  const m = s ? new DOMMatrixReadOnly(getComputedStyle(s).transform) : null;
  return { sx: scrollX, sy: scrollY, scale: m ? m.a : NaN, cw: document.documentElement.clientWidth, ready: document.readyState === "complete" && !!document.querySelector("#lf-stage.cam") };
})()`;

const centreOf = (selector: string): Payload<Point | null> => `(() => { const e = document.querySelector(${JSON.stringify(selector)}); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; })()`;

async function openHome(k: HomeKit): Promise<View> {
  await k.setTouch(false);
  await k.send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await k.send("Page.navigate", { url: "about:blank" });
  await k.send("Page.navigate", { url: `http://127.0.0.1:${k.PORT}/` });
  return makeSettle(k)(VIEW, (d, last) => d.ready && d.cw === W && last !== null && JSON.stringify(d) === JSON.stringify(last), "home floor open", 300);
}

async function scrolledTo(k: HomeKit, left: number): Promise<View> {
  await k.evaluate(`window.scrollTo(${left}, 0)`);
  return makeSettle(k)(VIEW, (d, last) => d.sx === left && d.sy === 0 && last !== null && JSON.stringify(d) === JSON.stringify(last), `home floor at ${left}`);
}

async function wheelled(k: HomeKit, at: Point, dx: number, dy: number, before: View): Promise<View> {
  for (let i = 0; i < 3; i++) {
    await k.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: at.x, y: at.y });
    await k.send("Input.dispatchMouseEvent", { type: "mouseWheel", x: at.x, y: at.y, deltaX: dx, deltaY: dy });
  }
  return makeSettle(k)(VIEW, (d, last) => (d.sx !== before.sx || d.scale !== before.scale) && last !== null && JSON.stringify(d) === JSON.stringify(last), `home floor wheel ${dx},${dy}`);
}

export async function h19Sideways(k: HomeKit): Promise<void> {
  await openHome(k);
  const at = { x: W / 2, y: H / 2 };
  const rows: string[] = [];
  const faults: string[] = [];
  for (const [dx, dy, from] of [[120, 6, 0], [120, -6, 0], [-120, 6, 300]] as const) {
    const before = await scrolledTo(k, from);
    const after = await wheelled(k, at, dx, dy, before);
    if (Math.sign(after.sx - before.sx) !== Math.sign(dx)) faults.push(`a wheel of ${dx},${dy} from ${from} left the page at ${after.sx}`);
    if (after.scale !== before.scale) faults.push(`a wheel of ${dx},${dy} zoomed the chart from ${before.scale} to ${after.scale}`);
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
const SLIP = (id: string): Payload<Slip> => `(() => { const c = document.getElementById("lf-card-${id}"); const s = c ? c.querySelector(".lf-card-scroll") : null; return { open: !!c && !c.hidden && Number(getComputedStyle(c).opacity) === 1, overflows: !!s && s.scrollHeight > s.clientHeight }; })()`;

async function openSlip(k: HomeKit, id: string): Promise<Slip> {
  const pip = `.lf-station[data-station="${id}"]`;
  const left = await k.evaluate<number>(`(() => { const r = document.querySelector('${pip}').getBoundingClientRect(), root = document.documentElement; return Math.min(root.scrollWidth - root.clientWidth, Math.max(0, Math.round(r.left + r.width / 2 + scrollX - ${W / 2}))); })()`);
  await scrolledTo(k, left);
  const at = await k.evaluate(centreOf(pip));
  const hit = at !== null && await k.evaluate<boolean>(`(() => { const e = document.elementFromPoint(${at.x}, ${at.y}); return !!e && !!e.closest('${pip}'); })()`);
  if (at === null || !hit) throw new Error(`the ${id} pip takes no hit at ${JSON.stringify(at)}`);
  await k.clickAt(at.x, at.y);
  return makeSettle(k)(SLIP(id), (d) => d.open, `home floor ${id} slip open`);
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
