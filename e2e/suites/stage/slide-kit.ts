// The Explorer's slide-away checks' shared reads and gestures (Issue #996): what the head cluster and the chart folio stand at, the camera posed at a chosen depth, and a mouse and a press aimed at the rects the page itself reports.
import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { pressAt } from "../print-room/kit.ts";
import { lensRest, ZOOM_IN } from "../print-room/print.ts";
import { open, size } from "./stage.ts";

export const SEED_42 = "/explorer/#seed=42";
export const LINK = "/explorer/#seed=42&cx=0.5000&cy=0.5000&k=2.7440";

type Box4 = [number, number, number, number];
export type Pieces = {
  k: number;
  innerW: number;
  innerH: number;
  head: { ty: number; nav: [number, number]; trail: [number, number]; summary: Box4 };
  folio: { ty: number; title: [number, number]; rest: number[] };
  chart: Box4;
  sheet: Box4;
  slip: { open: boolean; left: number };
  legendBottom: string;
  sheetW: number;
  sheetH: number;
  active: string;
};

export const PIECES_READ: Payload<Pieces> = `(() => {
  const q = (s) => document.querySelector(s);
  const ty = (e) => { const t = getComputedStyle(e).translate; return t === "none" ? 0 : parseFloat(t.split(" ")[1] || "0") || 0; };
  const span = (e) => { const r = new Range(); r.selectNodeContents(e); const b = r.getBoundingClientRect(); return [b.top, b.bottom]; };
  const box = (e) => { const b = e.getBoundingClientRect(); return [b.left, b.top, b.right, b.bottom]; };
  const head = q("header.chrome"), folio = q(".corner.bl"), title = q("#folio-title"), slip = q(".slip"), sheet = q("#sheet"), a = document.activeElement;
  const sb = sheet.getBoundingClientRect();
  return {
    k: new DOMMatrix(getComputedStyle(q("#map")).transform).a, innerW: innerWidth, innerH: innerHeight,
    head: { ty: ty(head), nav: span(q("header.chrome nav.rooms")), trail: span(q("header.chrome .trail")), summary: box(q("header.chrome summary")) },
    folio: { ty: ty(folio), title: span(title), rest: [...folio.querySelectorAll("p")].filter((p) => p !== title && p.textContent.trim()).map((p) => p.getBoundingClientRect().top) },
    chart: box(q("#map svg[data-vellum-style]")), sheet: box(sheet),
    slip: { open: !slip.classList.contains("folded"), left: slip.getBoundingClientRect().left },
    legendBottom: q(".legend").style.bottom, sheetW: sb.width, sheetH: sb.height,
    active: (a.closest("header.chrome") ? "head " : "") + a.tagName.toLowerCase() + (a.id ? "#" + a.id : "") + (typeof a.className === "string" && a.className ? "." + a.className.trim().split(" ")[0] : ""),
  };
})()`;

export async function openAt(
  ctx: SuiteContext,
  path: string,
  w: number,
  h: number,
  label: string,
  redraft = false,
): Promise<void> {
  await size(ctx, w, h);
  const at = await open(ctx, path, w, h, { w, h }, label);
  if (at === null) throw new Error(`${label}: ${path} is no chart room at ${w}x${h}`);
  if (!redraft) await ctx.evaluate("window.__vellumSetRedraftEnabled(false)");
}

export async function motionOn<T>(ctx: SuiteContext, body: () => Promise<T>): Promise<T> {
  await ctx.send("Emulation.setEmulatedMedia", { features: [] });
  try {
    return await body();
  } finally {
    await ctx.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  }
}

// Wiring, said at the checks: the follow is a function of depth, so a posed depth reads the curve where a glide's frame cannot be caught at a chosen depth.
export async function poseAt(ctx: SuiteContext, k: number): Promise<Pieces> {
  await ctx.evaluate(
    `(() => { const v = document.getElementById("map-viewport"), W = v.clientWidth, H = v.clientHeight; window.__vellumZoomTo({ x: W / 2 * (1 - ${k}), y: H / 2 * (1 - ${k}), k: ${k} }); return true; })()`,
  );
  return makeSettle(ctx)(
    PIECES_READ,
    (d, last) => Math.abs(d.k - k) < 0.002 && !!last && last.head.ty === d.head.ty && last.folio.ty === d.folio.ty,
    `slide pose ${k}`,
    40,
  );
}

export const fillOf = (p: Pieces): number => {
  const [sl, st, sr, sb] = p.sheet;
  const right = p.slip.open ? p.slip.left : p.innerW;
  const cx = (sl + sr) / 2;
  const cy = (st + sb) / 2;
  return Math.max(1, cx / (cx - sl), cy / (cy - st), (right - cx) / (sr - cx), (p.innerH - cy) / (sb - cy));
};

export const travelsOf = (p: Pieces): { up: number; down: number } => ({
  up: -Math.ceil(p.head.nav[1] + 3),
  down: Math.ceil(p.innerH - 2 - p.folio.title[1]),
});

export async function press(ctx: SuiteContext, n: number): Promise<void> {
  for (let i = 1; i <= n; i++) {
    const at = await ctx.evaluate(ZOOM_IN);
    if (!at || at.hit !== "zoom-in") throw new Error(`the Glass's press is covered: ${JSON.stringify(at)}`);
    await pressAt(ctx, at.x, at.y);
    await lensRest(ctx, "leaned", `slide press ${i}`);
  }
}

export type Aim = { x: number; y: number; hit: boolean };

export const aimAt = (selector: string): Payload<Aim> =>
  `(() => { const e = document.querySelector(${JSON.stringify(selector)}); const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, h = document.elementFromPoint(x, y); return { x, y, hit: !!h && !!h.closest(${JSON.stringify(selector)}) }; })()`;

export async function pressSelector(ctx: SuiteContext, selector: string): Promise<void> {
  const at = await ctx.evaluate(aimAt(selector));
  if (!at.hit) throw new Error(`${selector} is covered at its centre`);
  await pressAt(ctx, at.x, at.y);
}

export const mouseTo = (ctx: SuiteContext, x: number, y: number): Promise<unknown> =>
  ctx.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "none", buttons: 0 });

export const lineAim = (selector: string): Payload<Aim & { inside: boolean }> =>
  `(() => { const e = document.querySelector(${JSON.stringify(selector)}); const r = new Range(); r.selectNodeContents(e); const b = r.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2, h = document.elementFromPoint(x, y); return { x, y, hit: !!h && !!h.closest(${JSON.stringify(selector)}), inside: !!h && !!h.closest("#chart-drawer") }; })()`;

export async function readsFor(ctx: SuiteContext, ms: number): Promise<Pieces[]> {
  const out: Pieces[] = [];
  const end = Date.now() + ms;
  do {
    out.push(await ctx.evaluate(PIECES_READ));
    await ctx.sleep(100);
  } while (Date.now() < end);
  return out;
}

export function settleTy(ctx: SuiteContext, piece: "head" | "folio", want: number, label: string): Promise<Pieces> {
  return makeSettle(ctx)(PIECES_READ, (d) => Math.abs(d[piece].ty - want) <= 0.5, label, 40);
}

export function settleSlid(ctx: SuiteContext, piece: "head" | "folio", label: string): Promise<Pieces> {
  return makeSettle(ctx)(
    PIECES_READ,
    (d, last) => d[piece].ty !== 0 && !!last && last[piece].ty === d[piece].ty,
    label,
    40,
  );
}

export function draftsLanded(ctx: SuiteContext, label: string): Promise<unknown> {
  const read: Payload<{ drafting: boolean; box: string }> =
    `(() => { const r = document.querySelector(".corner.bl").getBoundingClientRect(); return { drafting: document.getElementById("caption").textContent.startsWith("Drafting"), box: [r.left, r.top, r.right, r.bottom].join() }; })()`;
  return makeSettle(ctx)(read, (d, last) => !d.drafting && !!last && last.box === d.box, label);
}

export const near = (a: number, b: number, tol: number): boolean => Math.abs(a - b) <= tol;
