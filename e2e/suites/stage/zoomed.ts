// The chrome over a zoomed chart (Issue #988, Alex, 2026-10-22): zoomed, the head cluster and the chart folio stand on the legend row's crisp panel and every line of them reads, on a tall window (EZ1) and on a short one where all four corners go crisp (EZ2).
import { makeSettle } from "../../support/settle.ts";
import { GRADIENT_STOPS, nearRgba, PAGE_RGBA, tokenRgba } from "../../support/pixel.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { pressAt } from "../print-room/kit.ts";
import { LENS, lensRest, ZOOM_IN } from "../print-room/print.ts";
import { RR_LENS } from "../reading-room/kit.ts";
import { GLYPH_LINES } from "./glyphs.ts";
import type { Glyph } from "./glyphs.ts";
import { CHART_ROOM_FLOOR, FLOOR_PLAIN, grounds, open, rest, size, withStyle, worstOf } from "./stage.ts";
import type { Stage } from "./stage.ts";

type Panel = { content: string; stops: number[][]; filter: string };
type Piece = "cluster" | "chart folio" | "Press" | "room folio" | "strip";
type Sub = "sub" | "coords";

const PANELS: Payload<Record<Piece, Panel | null>> =
  `(() => { const rgba = ${PAGE_RGBA}; const stops = ${GRADIENT_STOPS};
  const read = (sel) => { const e = document.querySelector(sel); if (!e) return null; const cs = getComputedStyle(e, "::before"); return { content: cs.content, stops: stops(cs.backgroundImage), filter: cs.filter }; };
  return { cluster: read("header.chrome"), "chart folio": read(".corner.bl"), Press: read(".legend"), "room folio": read(".corner.tr"), strip: read(".strip") };
})()`;

const crisp = (p: Panel | null): boolean =>
  !!p &&
  p.content === '""' &&
  p.filter === "none" &&
  p.stops.length === 2 &&
  nearRgba(p.stops[0], tokenRgba("--chart-ink", 0.85), 1) &&
  nearRgba(p.stops[1], tokenRgba("--chart-ink", 0.72), 1);
const pooled = (p: Panel | null): boolean => !!p && p.content === '""' && /^blur\(/.test(p.filter);

const BARE = "body:has(#map-viewport.zoomed) :is(header.chrome, .corner.bl)::before { content: none !important; }";
// No `!important`: `grounds` hides the text with one at (0,1,0), and one here at (1,5,1) would win over it and leave the text in the ground sample.
const LINE_TAN: Record<Sub, string> = {
  sub: ":root body:has(#map-viewport.zoomed) .corner.bl .folio-sub { color: var(--line-tan); }",
  coords: ":root body:has(#map-viewport.zoomed) .corner.bl .folio-coords { color: var(--line-tan); }",
};

type Reads = Awaited<ReturnType<typeof grounds>>;
type Ask = { pieces: readonly Piece[]; mark: boolean; bare: boolean; lineTan: readonly Sub[] };
type Ring = {
  visible: boolean;
  colour: number[];
  box: number[];
  text: number[];
  prevRight: number | null;
  reach: number;
} | null;

const RING = (selector: string): Payload<Ring> =>
  `(() => { const a = document.querySelector(${JSON.stringify(selector)}); const cs = getComputedStyle(a), b = a.getBoundingClientRect(), rg = new Range(); rg.selectNodeContents(a); const t = rg.getBoundingClientRect(), prev = a.previousElementSibling; return { visible: a.matches(":focus-visible"), colour: (${PAGE_RGBA})(cs.outlineColor), box: [b.left, b.top, b.right, b.bottom], text: [t.left, t.top, t.right, t.bottom], prevRight: prev ? prev.getBoundingClientRect().right : null, reach: parseFloat(cs.outlineWidth) + parseFloat(cs.outlineOffset) }; })()`;

// The colour is read on a later task than the focus: in the focus's own task the ring still reads the colour it started from (measured 2026-10-22, 1024x768 zoomed Explorer, [1,0,1,0] for the mark), so the read polls until two reads agree.
async function ringOf(ctx: SuiteContext, selector: string): Promise<Ring> {
  const focus: Payload<boolean> = `(() => { const a = document.querySelector(${JSON.stringify(selector)}); if (!a) return false; a.focus(); return true; })()`;
  if (!(await ctx.evaluate(focus))) return null;
  try {
    return await makeSettle(ctx)(
      RING(selector),
      (d, last) => d.visible && !!last && JSON.stringify(d.colour) === JSON.stringify(last.colour),
      `EZ ring ${selector}`,
    );
  } finally {
    await ctx.evaluate("document.activeElement instanceof HTMLElement && document.activeElement.blur()");
  }
}

async function markRing(ctx: SuiteContext): Promise<{ mark: Ring; control: Ring }> {
  await ctx.send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Shift",
    code: "ShiftLeft",
    windowsVirtualKeyCode: 16,
  });
  await ctx.send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Shift",
    code: "ShiftLeft",
    windowsVirtualKeyCode: 16,
  });
  return { mark: await ringOf(ctx, ".legend .legend-row a.fn"), control: await ringOf(ctx, ".slip a.fn") };
}

type RoomRead = {
  page: string;
  at: Stage | null;
  s: Stage | null;
  zoomed: boolean;
  panels: Record<Piece, Panel | null>;
  read: Reads;
  bare: Reads;
  lineTan: Record<Sub, Reads | null>;
  ring: { mark: Ring; control: Ring } | null;
};

async function zoomIn(ctx: SuiteContext, page: string): Promise<boolean> {
  const lens = page === "/reading-room/" ? RR_LENS : LENS;
  let zoomed = false;
  for (const n of [1, 2]) {
    const at = await ctx.evaluate(ZOOM_IN);
    if (!at || at.hit !== "zoom-in") return false;
    await pressAt(ctx, at.x, at.y);
    zoomed = (await lensRest(ctx, "leaned", `EZ ${page} press ${n}`, lens)).zoomed;
  }
  return zoomed;
}

async function readRoom(ctx: SuiteContext, page: string, w: number, h: number, ask: Ask): Promise<RoomRead> {
  await size(ctx, w, h);
  const at = await open(ctx, page, w, h, { w, h }, "EZ");
  const zoomed = at !== null && (await zoomIn(ctx, page));
  const s = await rest(ctx, w, h, `EZ ${page} zoomed`);
  const panels = await ctx.evaluate(PANELS);
  const lines = (await ctx.evaluate(GLYPH_LINES)).filter(
    (g) => ask.pieces.includes(g.piece as Piece) || (ask.mark && g.t.startsWith("the section mark")),
  );
  // Every ink is read before the first ground read: under the suite's reduced motion a hide style's removal leaves the next ink read at transparent for a frame (measured 2026-10-22, every chart folio line read 1.8 to 2.3 behind the panel), so an ink read inside a style polls until two reads agree.
  const tanInk: Record<Sub, Glyph[]> = { sub: [], coords: [] };
  for (const k of ask.lineTan)
    tanInk[k] = await withStyle(ctx, `ez-line-tan-${k}`, LINE_TAN[k], async () =>
      (
        await makeSettle(ctx)(
          GLYPH_LINES,
          (d, last) => !!last && JSON.stringify(d) === JSON.stringify(last),
          `EZ ${page} ${k} in line-tan`,
        )
      ).filter((g) => g.piece === "chart folio"),
    );
  const read = await grounds(ctx, lines);
  const lineTan: Record<Sub, Reads | null> = { sub: null, coords: null };
  for (const k of ask.lineTan) lineTan[k] = await grounds(ctx, tanInk[k]);
  const bare = ask.bare ? await withStyle(ctx, "ez-bare", BARE, () => grounds(ctx, lines)) : [];
  const ring = ask.mark ? await markRing(ctx) : null;
  return { page, at, s, zoomed, panels, read, bare, lineTan, ring };
}

const sameInk = (c: number[] | undefined, token: "--parchment-bright" | "--ink-dark"): boolean =>
  nearRgba(c, tokenRgba(token));

function roomFaults(r: RoomRead, ask: Ask, floored: boolean): string[] {
  const faults: string[] = [];
  const say = (m: string): number => faults.push(`${r.page}: ${m}`);
  if (!r.at) return [`${r.page}: no chart room read`];
  if (floored && !r.at.under)
    say("the Explorer is not floored at rest at 1024x474, so the read is not of a floored and zoomed sheet");
  if (!floored && r.at.under) say("floored at rest at 1024x768, so the zoomed arm is not read alone");
  if (!r.zoomed) say("two presses of the Glass left the chart unzoomed");
  if (!r.s) say("the zoomed room never came to rest");
  else if (floored && !r.s.under) say("the zoomed sheet is no longer floored");
  for (const p of ask.pieces) {
    if (!crisp(r.panels[p])) say(`the ${p}'s panel is not the crisp one: ${JSON.stringify(r.panels[p])}`);
    if (!r.read.some((g) => g.piece === p)) say(`no ${p} line was read`);
  }
  if (!floored && r.page === "/reading-room/" && !pooled(r.panels.strip))
    say(`the strip lost its blurred pool: ${JSON.stringify(r.panels.strip)}`);
  for (const g of r.read.filter((x) => x.ratio < FLOOR_PLAIN)) say(`${g.piece} "${g.t}" reads ${g.ratio.toFixed(2)}`);
  if (ask.mark) {
    if (!r.read.some((g) => g.t.startsWith("the section mark"))) say("no section mark line was read");
    const ok =
      !!r.ring &&
      !!r.ring.mark?.visible &&
      sameInk(r.ring.mark.colour, "--parchment-bright") &&
      !!r.ring.control?.visible &&
      sameInk(r.ring.control.colour, "--ink-dark");
    const m = r.ring?.mark;
    const encloses =
      !!m &&
      m.box[0]! <= m.text[0]! + 0.5 &&
      m.box[1]! <= m.text[1]! + 0.5 &&
      m.box[2]! >= m.text[2]! - 0.5 &&
      m.box[3]! >= m.text[3]! - 0.5;
    const clear = !!m && m.prevRight !== null && m.box[0]! - m.reach >= m.prevRight + 1;
    if (!encloses)
      say(`the section mark's ring does not enclose its glyph: ${JSON.stringify(m && { box: m.box, text: m.text })}`);
    if (!clear)
      say(
        `the section mark's ring lies on the neighbouring chip's border, not a pixel clear of it: ${JSON.stringify(m && { left: m.box[0]! - m.reach, prevRight: m.prevRight })}`,
      );
    if (!ok)
      say(
        `the section mark's focus ring is not parchment-bright beside the control's ink-dark: ${JSON.stringify(r.ring)}`,
      );
  }
  if (ask.bare)
    for (const p of ["cluster", "chart folio"])
      if (!(worstOf(r.bare, p) < FLOOR_PLAIN))
        say(
          `the ${p} reads ${worstOf(r.bare, p).toFixed(2)} with the panels taken away, so the read cannot see them fail`,
        );
  for (const k of ask.lineTan) {
    const w = worstOf(r.lineTan[k] ?? [], "chart folio");
    if (!(w < FLOOR_PLAIN))
      say(
        `the chart folio reads ${w.toFixed(2)} with its ${k} line in line-tan, so the read cannot see the parchment fail`,
      );
  }
  return faults;
}

const detail = (r: RoomRead, ask: Ask): string =>
  `${r.page}: ${r.read.length} lines, worst ${worstOf(r.read).toFixed(2)}` +
  (ask.bare
    ? `, bare cluster ${worstOf(r.bare, "cluster").toFixed(2)}, chart folio ${worstOf(r.bare, "chart folio").toFixed(2)}`
    : "") +
  ask.lineTan.map((k) => `, ${k} in line-tan ${worstOf(r.lineTan[k] ?? [], "chart folio").toFixed(2)}`).join("");

export async function ez1Zoomed(ctx: SuiteContext): Promise<void> {
  await ctx.setTouch(false);
  const rows: { r: RoomRead; ask: Ask }[] = [];
  for (const page of CHART_ROOM_FLOOR) {
    const explorer = page === "/explorer/";
    const ask: Ask = {
      pieces: ["cluster", "chart folio"],
      mark: explorer,
      bare: explorer || page === "/reading-room/",
      lineTan: explorer ? ["sub", "coords"] : page === "/reading-room/" ? ["sub"] : [],
    };
    rows.push({ r: await readRoom(ctx, page, 1024, 768, ask), ask });
  }
  const faults = rows.flatMap(({ r, ask }) => roomFaults(r, ask, false));
  ctx.check(
    "EZ1 zoomed by two presses of the Glass at 1024x768, in every chart room the head cluster and the chart folio stand on the legend row's crisp panel (chart ink 0.85 to 0.72, no blur), the Reading Room's strip on its blurred pool, and every line of the cluster and the chart folio, the Explorer's section mark beside the Press among them, reads at 4.5:1 or better against the ground under it; in the same run the cluster and the chart folio read under 4.5:1 with the panels taken away on the Explorer and in the Reading Room, and the chart folio reads under 4.5:1 on the Explorer with its survey line in line-tan and again with its coordinates in line-tan, and in the Reading Room with its survey line in line-tan, so the read can see each fail; and on the Explorer the section mark's keyboard focus ring is parchment-bright while a note mark on the Broadside's paper keeps the house's ink-dark, read in the same run, and that ring encloses the mark's glyph and stands a pixel clear of the neighbouring chip's border (Alex, 2026-10-22, Issue #988)",
    faults.length === 0,
    rows.map(({ r, ask }) => detail(r, ask)).join("; ") +
      (faults.length ? `; ${faults.length} faults: ${faults.slice(0, 6).join("; ")}` : ""),
  );
}

export async function ez2Short(ctx: SuiteContext): Promise<void> {
  await ctx.setTouch(false);
  const ask: Ask = { pieces: ["cluster", "chart folio", "Press", "room folio"], mark: false, bare: false, lineTan: [] };
  const r = await readRoom(ctx, "/explorer/", 1024, 474, ask);
  const faults = roomFaults(r, ask, true);
  ctx.check(
    "EZ2 on a short window, the Explorer floored at 1024x474 and then zoomed by two presses of the Glass, the head cluster, the chart folio, the Press and the room folio all stand on the crisp panel with no blur, the floored dress's blur reaching none of them, and every line of theirs reads at 4.5:1 or better (Alex, 2026-10-22, Issue #988; at rest there the four keep the cluster's blurred pool, NS1)",
    faults.length === 0,
    detail(r, ask) + (faults.length ? `; ${faults.length} faults: ${faults.slice(0, 6).join("; ")}` : ""),
  );
}
