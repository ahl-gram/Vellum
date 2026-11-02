// The slip's own lines read for contrast as EA4 reads the chrome's: each line's computed ink against the ground painted under it with the slip's and the footnotes' text hidden, for SB20 here and BR24 on the Broadside (Issue #1160).
import { nearRgba, sampleRow, tokenRgba, type Rgb } from "../../support/pixel.ts";
import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { contrast } from "../cluster/trail.ts";
import { FLOOR_PLAIN, withStyle } from "../stage/stage.ts";
import type { SpecimenKit } from "./kit.ts";

export type InkPiece = readonly [piece: string, selector: string];
type InkLine = { piece: string; t: string; ink: Rgb; row: number; x: number; w: number; seen: boolean; foot: boolean };
type InkRead = InkLine & { ground: Rgb; ratio: number; panel: boolean };

export const FONTS_LOADED: Payload<string> = `document.fonts.status`;
const HIDE_SLIP_TEXT = `.slip *, .fn-note * { color: transparent !important; text-decoration-color: transparent !important; }`;
const COUNT = (selector: string): Payload<number> => `document.querySelectorAll(${JSON.stringify(selector)}).length`;
// One element at a time, scrolled into its own scroller's view first: the Book's body note stands under the slip's foot until its body is scrolled (1280x800).
const LINES_OF = (piece: string, selector: string, i: number): Payload<InkLine[]> => `(() => {
  const el = document.querySelectorAll(${JSON.stringify(selector)})[${i}], out = [];
  el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const host = n.parentElement;
    if (!n.textContent.trim() || !host || host.closest("a")) continue;
    const rg = new Range();
    rg.selectNodeContents(n);
    for (const b of rg.getClientRects()) {
      if (!(b.width > 0)) continue;
      const cx = b.left + b.width / 2, cy = b.top + b.height / 2, hit = document.elementFromPoint(cx, cy);
      const m = getComputedStyle(host).color.match(/[0-9.]+/g).map(Number);
      out.push({ piece: ${JSON.stringify(piece)}, t: n.textContent.trim().slice(0, 24), ink: [m[0], m[1], m[2]], row: Math.round(cy), x: Math.max(0, Math.floor(b.left)), w: Math.max(1, Math.floor(b.width)), seen: !!hit && el.contains(hit), foot: !!el.closest(".slip-foot") });
    }
  }
  return out;
})()`;
// The chrome's ink-in still plays on the slip once the chart has settled (the Explorer's slip read 0.876 opaque 533 ms into it, measured 2026-11-01), so a line is read only once it, its subtree and every element above it are opaque and none is running an animation.
type Rest = { op: number; running: number };
const REST_OF = (selector: string, i: number): Payload<Rest> => `(() => {
  const el = document.querySelectorAll(${JSON.stringify(selector)})[${i}];
  let op = 1, running = el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length;
  for (let e = el; e; e = e.parentElement) {
    op *= parseFloat(getComputedStyle(e).opacity);
    if (e !== el) running += e.getAnimations().filter((a) => a.playState === "running").length;
  }
  return { op, running };
})()`;
const median = (xs: readonly number[]): number => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]!;

export async function slipInk(ctx: SuiteContext, pieces: readonly InkPiece[], id: string): Promise<InkRead[]> {
  const settle = makeSettle(ctx);
  const out: InkRead[] = [];
  for (const [piece, selector] of pieces) {
    const n = await ctx.evaluate(COUNT(selector));
    for (let i = 0; i < n; i++) {
      await settle(REST_OF(selector, i), (d) => d.op === 1 && d.running === 0, `${id}: ${piece} ${i} at rest`);
      const lines = await ctx.evaluate(LINES_OF(piece, selector, i));
      const grounds = await withStyle(ctx, id, HIDE_SLIP_TEXT, async () => {
        const g: Rgb[] = [];
        for (const l of lines) {
          const row = await sampleRow(ctx.send, l.x, l.row, l.w);
          g.push([0, 1, 2].map((c) => median(row.map((p) => p[c]!))) as Rgb);
        }
        return g;
      });
      for (const [k, l] of lines.entries()) {
        const ground = grounds[k]!;
        out.push({
          ...l,
          ground,
          ratio: contrast(l.ink, ground),
          panel: nearRgba([...ground, 255], tokenRgba("--parchment-panel")),
        });
      }
    }
  }
  return out;
}

export const inkFaults = (reads: readonly InkRead[]): string[] =>
  reads.flatMap((r) => [
    ...(r.seen ? [] : [`${r.piece} "${r.t}" is covered at its own line`]),
    ...(r.panel ? [] : [`${r.piece} "${r.t}" stands on ${r.ground.join(",")}, not the panel`]),
    ...(r.ratio >= FLOOR_PLAIN ? [] : [`${r.piece} "${r.t}" reads ${r.ratio.toFixed(2)}`]),
  ]);

export const inkBrief = (reads: readonly InkRead[]): string[] =>
  reads.map((r) => `${r.piece}${r.foot ? " (foot)" : ""} "${r.t}" ${r.ratio.toFixed(2)} on ${r.ground.join(",")}`);

const SB20_PIECES: readonly InkPiece[] = [
  ["note", ".slip .note"],
  ["fold", ".slip .slip-fold"],
];

export async function sb20SlipInk(k: SpecimenKit): Promise<void> {
  if ((await k.goto()) === null) throw new Error("SB20: the Book never came up at rest");
  await k.settle(FONTS_LOADED, (d) => d === "loaded", "SB20 fonts");
  await k.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
  const reads = await slipInk(k, SB20_PIECES, "sb20-hide");
  const faults = [
    ...inkFaults(reads),
    ...(reads.some((r) => r.piece === "note" && !r.foot) ? [] : ["no note line read in the slip's body"]),
    ...(reads.some((r) => r.piece === "note" && r.foot) ? [] : ["no note line read in the slip's foot"]),
    ...(reads.some((r) => r.piece === "fold") ? [] : ["no fold mark read"]),
  ];
  k.check(
    "SB20 the slip's note lines, in its body and in its foot, and its fold mark read at 4.5:1 or better against the ground painted under them, which is the panel, each brought into its own view first (Issue #1160)",
    faults.length === 0,
    JSON.stringify({ faults, reads: inkBrief(reads) }),
  );
}
