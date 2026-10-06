import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { CHART_ROOM_FLOOR, DESK, rest, withStyle } from "./stage.ts";

const NARROW = { w: 800, h: 800 };
const TOLERANCE = 0.5;
const STILL = 3;
const CONTROL_ROOM = "/print-room/";
const SEAT_FOLLOWS = ".slip .legend-dock .legend.in-slip { width: max-content !important; }";

type Handle = { x: number; y: number; reachable: boolean } | null;
type Docked = { open: boolean; row: number; dock: number } | null;

const HANDLE: Payload<Handle> = `(() => { const h = document.querySelector(".slip .slip-handle"); if (!h) return null; const r = h.getBoundingClientRect(); if (r.width === 0) return null; const x = r.left + r.width / 2, y = r.top + r.height / 2; return { x, y, reachable: document.elementFromPoint(x, y) === h }; })()`;
const DOCKED: Payload<Docked> = `(() => { const l = document.querySelector(".slip .legend-dock .legend.in-slip"); if (!l) return null; const d = l.parentElement, cs = getComputedStyle(d); return { open: document.querySelector(".slip").classList.contains("open"), row: l.getBoundingClientRect().width, dock: d.getBoundingClientRect().width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth) }; })()`;

async function docked(ctx: SuiteContext, label: string): Promise<Docked> {
  let still = 0;
  return makeSettle(ctx)(DOCKED, (d, last) => {
    still = last !== null && d.row === last.row && d.dock === last.dock ? still + 1 : 0;
    return d.open && d.row > 0 && still >= STILL;
  }, `EL3 ${label} docked`);
}

async function seatedThenDocked(ctx: SuiteContext, page: string): Promise<{ page: string; read: Docked; fault: string | null; control?: Docked }> {
  await ctx.send("Emulation.setDeviceMetricsOverride", { width: DESK.w, height: DESK.h, deviceScaleFactor: 1, mobile: false });
  await ctx.send("Page.navigate", { url: "about:blank" });
  await ctx.send("Page.navigate", { url: `http://127.0.0.1:${ctx.PORT}${page}` });
  await rest(ctx, DESK.w, DESK.h, `EL3 ${page} seated`);
  const pressed = await ctx.evaluate<boolean>(`!!document.querySelector(".legend:not(.in-slip) .legend-row .legend-btn")`);
  if (!pressed) return { page, read: null, fault: null };
  await ctx.send("Emulation.setDeviceMetricsOverride", { width: NARROW.w, height: NARROW.h, deviceScaleFactor: 1, mobile: false });
  await rest(ctx, NARROW.w, NARROW.h, `EL3 ${page} narrow`);
  const handle = await ctx.evaluate(HANDLE);
  if (handle === null || !handle.reachable) return { page, read: null, fault: `${page}: the slip's handle is not reachable at ${NARROW.w}x${NARROW.h}` };
  await ctx.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: handle.x, y: handle.y });
  await ctx.send("Input.dispatchMouseEvent", { type: "mousePressed", x: handle.x, y: handle.y, button: "left", clickCount: 1 });
  await ctx.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: handle.x, y: handle.y, button: "left", clickCount: 1 });
  const read = await docked(ctx, page);
  const fault = read !== null && Math.abs(read.row - read.dock) > TOLERANCE ? `${page}: the docked Press is ${read.row.toFixed(1)} wide in a ${read.dock.toFixed(1)} dock` : null;
  const control = page === CONTROL_ROOM ? await withStyle(ctx, "el3-seat-follows", SEAT_FOLLOWS, () => docked(ctx, `${page} control`)) : undefined;
  await ctx.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
  return { page, read, fault, control };
}

export async function el3Docked(ctx: SuiteContext): Promise<void> {
  await ctx.setTouch(false);
  const runs: Awaited<ReturnType<typeof seatedThenDocked>>[] = [];
  for (const page of CHART_ROOM_FLOOR) runs.push(await seatedThenDocked(ctx, page));
  await ctx.send("Emulation.setDeviceMetricsOverride", { width: DESK.w, height: DESK.h, deviceScaleFactor: 1, mobile: false });
  const read = runs.flatMap((r) => (r.read === null ? [] : [{ page: r.page, ...r.read }]));
  const faults = runs.flatMap((r) => (r.fault === null ? [] : [r.fault]));
  const control = runs.find((r) => r.page === CONTROL_ROOM)?.control ?? null;
  const controlBites = control !== null && control.dock - control.row > TOLERANCE;
  ctx.check(
    "EL3 in every chart room with a Press, seated on a 1280x800 window and then resized while loaded to 800x800 with its slip opened by its handle, the docked Press fills its dock, so the width the seat gives the row on a desktop window does not follow it into the slip; the same-run control gives the Print Room's docked row the content width the seat sets and reads it short of its dock (Issue #762)",
    read.length >= CHART_ROOM_FLOOR.length - 1 && faults.length === 0 && controlBites,
    `${read.map((r) => `${r.page} ${r.row.toFixed(1)} in ${r.dock.toFixed(1)}`).join("; ")}; control ${control === null ? "not read" : `${control.row.toFixed(1)} in ${control.dock.toFixed(1)}`}${faults.length ? `; ${faults.length} faults: ${faults.slice(0, 6).join("; ")}` : ""}`,
  );
}
