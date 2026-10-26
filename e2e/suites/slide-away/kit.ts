// The slide-away checks' shared reads and gestures in the seven other zoom rooms (Issue #1034): which rooms, what the head cluster and the chart folio stand at, the Glass's presses and the arithmetic written again, and a stillness that waits for nothing but rest.
import { TABLE_STORE_KEY } from "../../../src/site/shared/table-store.ts";
import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { LENS, lensRest, ZOOM_IN } from "../print-room/print.ts";
import type { Lens } from "../print-room/print.ts";
import { pressAt } from "../print-room/kit.ts";
import { RR_LENS } from "../reading-room/kit.ts";
import { open, size } from "../stage/stage.ts";

export type Room = {
  readonly id: string;
  readonly path: string;
  readonly lens: Payload<Lens>;
  readonly fill: "sheet" | "gesture";
};

export const ROOMS: readonly Room[] = [
  { id: "Print Room", path: "/print-room/#seed=42&style=antique", lens: LENS, fill: "sheet" },
  { id: "Portfolio", path: "/explorer/portfolio/", lens: LENS, fill: "sheet" },
  { id: "Prospect", path: "/prospect/#seed=42&i=0", lens: LENS, fill: "sheet" },
  { id: "Reading Room", path: "/reading-room/#seed=42", lens: RR_LENS, fill: "sheet" },
  { id: "Ribbon", path: "/ribbon/#seed=42", lens: LENS, fill: "sheet" },
  { id: "Seed of the Day", path: "/seed-of-the-day/", lens: LENS, fill: "gesture" },
  { id: "Specimen Book", path: "/specimen/", lens: LENS, fill: "sheet" },
];

type Box4 = [number, number, number, number];
export type Pieces = {
  k: number;
  innerW: number;
  innerH: number;
  head: { ty: number; nav: [number, number]; summary: [number, number]; also: [number, number] | null };
  folio: { ty: number; title: [number, number]; rest: number[] };
  sheet: Box4;
  gesture: Box4;
  face: Box4 | null;
  slip: { open: boolean; left: number } | null;
  stripTop: number | null;
};

export const PIECES: Payload<Pieces> = `(() => {
  const q = (s) => document.querySelector(s);
  const ty = (e) => { const t = getComputedStyle(e).translate; return t === "none" ? 0 : parseFloat(t.split(" ")[1] || "0") || 0; };
  const span = (e) => { if (!e) return null; const r = new Range(); r.selectNodeContents(e); const b = r.getBoundingClientRect(); return [b.top, b.bottom]; };
  const box = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [b.left, b.top, b.right, b.bottom]; };
  const head = q("header.chrome"), folio = q(".corner.bl"), title = q("#folio-title"), slip = q(".slip"), strip = q(".strip"), cam = q("#map-viewport > .rf-chart") || q("#map");
  return {
    k: new DOMMatrix(getComputedStyle(cam).transform).a, innerW: innerWidth, innerH: innerHeight,
    head: { ty: ty(head), nav: span(q("header.chrome nav.rooms")), summary: span(q("header.chrome summary")), also: span(q("header.chrome p.also")) },
    folio: { ty: ty(folio), title: span(title), rest: [...folio.querySelectorAll("p")].filter((p) => p !== title && p.textContent.trim()).map((p) => p.getBoundingClientRect().top) },
    sheet: box(q("#sheet")), gesture: box(q("#map-viewport")), face: box(q("#sheet svg")),
    slip: slip ? { open: !slip.classList.contains("folded"), left: slip.getBoundingClientRect().left } : null,
    stripTop: strip ? strip.getBoundingClientRect().top : null,
  };
})()`;

export const pressDepths = (n: number): number => {
  let d = 1;
  for (let i = 0; i < n; i++) d *= 1.4;
  return d;
};

export function fillPressOf(fill: number): number {
  let n = 1;
  while (pressDepths(n) < fill) n++;
  return n;
}

export function fillOf(p: Pieces, rule: "sheet" | "gesture"): number {
  const [sl, st, sr, sb] = p.sheet;
  const right = p.slip?.open ? p.slip.left : p.innerW;
  if (rule === "sheet") {
    const cx = (sl + sr) / 2;
    const cy = (st + sb) / 2;
    return Math.max(1, cx / (cx - sl), cy / (cy - st), (right - cx) / (sr - cx), (p.innerH - cy) / (sb - cy));
  }
  const [gl, gt, gr, gb] = p.gesture;
  const cx = (gl + gr) / 2;
  const cy = (gt + gb) / 2;
  return Math.max(1, cx / (cx - sl), cy / (cy - st), (p.innerH - cy) / (sb - cy));
}

export const travelsOf = (p: Pieces): { up: number; down: number } => ({
  up: -Math.ceil(p.head.nav[1] + 3),
  down: Math.ceil(p.innerH - 2 - p.folio.title[1]),
});

export const EASE_MS = 340;
const STILL_READS = 8;

export async function openRoom(
  ctx: SuiteContext,
  room: Pick<Room, "id" | "path">,
  w: number,
  h: number,
  label: string,
): Promise<Pieces> {
  if (room.path === "/explorer/portfolio/") {
    try {
      await ctx.evaluate(`localStorage.removeItem(${JSON.stringify(TABLE_STORE_KEY)})`);
    } catch {}
  }
  await size(ctx, w, h);
  const at = await open(ctx, room.path, w, h, { w, h }, label);
  if (at === null) throw new Error(`${label}: ${room.path} is no chart room at ${w}x${h}`);
  return ctx.evaluate(PIECES);
}

export async function pressGlass(ctx: SuiteContext, lens: Payload<Lens>, label: string): Promise<void> {
  const at = await ctx.evaluate(ZOOM_IN);
  if (!at || at.hit !== "zoom-in") throw new Error(`${label}: the Glass's press is covered: ${JSON.stringify(at)}`);
  await pressAt(ctx, at.x, at.y);
  await lensRest(ctx, "leaned", label, lens);
}

// Waits for rest alone, never for a value, so a piece stuck home or stuck away reaches the assertion; 8 reads at 50 ms outlast the 340 ms ease, so a move that starts after the camera rests is seen.
export function still(ctx: SuiteContext, label: string): Promise<Pieces> {
  let same = 0;
  return makeSettle(ctx)(
    PIECES,
    (d, last) => {
      same = !!last && d.k === last.k && d.head.ty === last.head.ty && d.folio.ty === last.folio.ty ? same + 1 : 0;
      return same >= STILL_READS;
    },
    `slide-away still ${label}`,
    120,
  );
}

export async function gather(ctx: SuiteContext, ms: number): Promise<Pieces[]> {
  const out: Pieces[] = [];
  const end = Date.now() + ms;
  do {
    out.push(await ctx.evaluate(PIECES));
    await ctx.sleep(100, "window: reads 100 ms apart across the span asked for");
  } while (Date.now() < end);
  return out;
}

const off = (v: number, want: number, tol = 0.5): boolean => !(Math.abs(v - want) <= tol);

export function homeFaults(p: Pieces, label: string): string[] {
  const faults: string[] = [];
  if (off(p.head.ty, 0)) faults.push(`${label}: the head stands ${p.head.ty}, not home`);
  if (off(p.folio.ty, 0)) faults.push(`${label}: the folio stands ${p.folio.ty}, not home`);
  return faults;
}

export function awayFaults(p: Pieces, t: { up: number; down: number }, label: string): string[] {
  const faults: string[] = [];
  if (off(p.head.ty, t.up)) faults.push(`${label}: the head stands ${p.head.ty} of ${t.up}`);
  if (off(p.folio.ty, t.down)) faults.push(`${label}: the folio stands ${p.folio.ty} of ${t.down}`);
  return faults;
}
