// The chrome over a floored chart on a short window (Issue #762 pull request C; Alex, 2026-10-06, issuecomment-6010814718, "soft and lean"): the Press and the room folio stand on the cluster's blurred pool rather than a hard-edged panel, every chrome line over the sheet reads 4.5:1 as it is PAINTED, no backing lies over another piece's lines, and a risen Press that would reach the head cluster sheds its note.
import { makeSettle } from "../../support/settle.ts";
import { sampleRow } from "../../support/pixel.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { GLYPH_LINES_OVER_SHEET } from "./glyphs.ts";
import type { Glyph } from "./glyphs.ts";
import { CHART_ROOM_FLOOR, FLOOR_PLAIN, rest, stageFaults, withStyle } from "./stage.ts";

const NAMED_WORLD = "/print-room/#seed=20261006";
const SHORT: readonly (readonly [number, number])[] = [[1024, 540], [1024, 474], [1024, 430]];
const HIDE_TEXT = `header.chrome *, .legend *, .corner *, .strip * { color: transparent !important; text-decoration-color: transparent !important; }`;

type Backings = { under: boolean; press: string | null; folio: string | null; lean: boolean; pressTop: number | null; clusterFoot: number | null };

const BACKINGS: Payload<Backings> = `(() => {
  const legend = document.querySelector(".legend"), corner = document.querySelector(".corner.tr"), cluster = document.querySelector("header.chrome");
  const filter = (e) => { if (!e) return null; const ps = getComputedStyle(e, "::before"); return ps.content === "none" ? null : ps.filter; };
  return { under: document.body.classList.contains("stage-under"), press: filter(legend), folio: filter(corner), lean: !!legend && legend.classList.contains("lean"),
    pressTop: legend ? legend.getBoundingClientRect().top : null, clusterFoot: cluster ? cluster.getBoundingClientRect().bottom : null };
})()`;

const channel = (v: number): number => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const relative = ([r, g, b]: readonly [number, number, number]): number => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const ratio = (a: number, b: number): number => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const median = (xs: number[]): number => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]!; };

// Painted, not computed: a pool from another piece painted over a glyph dims the glyph itself, which a read of the computed ink against a text-hidden ground cannot see (the step 6 sitting read the Print Room's trail at 4.94 that way and 3.38 painted). The ink is the row's pixel farthest from the ground, after one hide and show, since the first hide changes how chrome text rasterises (the handbook/errata/guards.md row).
async function painted(ctx: SuiteContext, glyphs: readonly Glyph[]): Promise<{ piece: string; t: string; ratio: number }[]> {
  await withStyle(ctx, "ns1-warm", HIDE_TEXT, () => Promise.resolve());
  const shown: [number, number, number][][] = [];
  for (const g of glyphs) shown.push(await sampleRow(ctx.send, g.x, g.row, g.w));
  return withStyle(ctx, "ns1-hide", HIDE_TEXT, async () => {
    const out: { piece: string; t: string; ratio: number }[] = [];
    for (const [i, g] of glyphs.entries()) {
      const ground = median((await sampleRow(ctx.send, g.x, g.row, g.w)).map(relative));
      const ink = shown[i]!.map(relative).reduce((best: number, l: number) => (Math.abs(l - ground) > Math.abs(best - ground) ? l : best), ground);
      out.push({ piece: g.piece, t: g.t, ratio: ratio(ink, ground) });
    }
    return out;
  });
}

const size = (ctx: SuiteContext, w: number, h: number): Promise<unknown> => ctx.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });

export async function ns1Soft(ctx: SuiteContext): Promise<void> {
  await ctx.setTouch(false);
  const faults: string[] = [];
  const rows: string[] = [];
  let ribbonNav = false;
  for (const page of [...CHART_ROOM_FLOOR, NAMED_WORLD]) {
    for (const [i, [w, h]] of SHORT.entries()) {
      await size(ctx, w, h);
      if (i === 0) {
        await ctx.send("Page.navigate", { url: "about:blank" });
        await ctx.send("Page.navigate", { url: `http://127.0.0.1:${ctx.PORT}${page}` });
      }
      const s = await rest(ctx, w, h, `NS1 ${page} ${w}x${h}`);
      const b = await ctx.evaluate(BACKINGS);
      if (!s || !b.under) { rows.push(`${page} ${w}x${h} not floored`); continue; }
      const at = `${page} ${w}x${h}`;
      for (const [piece, f] of [["Press", b.press], ["room folio", b.folio]] as const) if (f !== null && !/blur/.test(f)) faults.push(`${at}: the ${piece} stands on a hard-edged panel (${f})`);
      faults.push(...stageFaults({ page, size: `${w}x${h}`, s }).filter((f) => /backing lies over/.test(f)));
      // Two rows in handbook/errata/site.md own what this leaves out, on main as here: the Glass's presses (PR #784, 2.63 to 3.23 over the chart) and the Specimen's disabled press, dimmed by the kit's opacity (PR #777, 3.33 to 3.41).
      const reads = await painted(ctx, (await ctx.evaluate(GLYPH_LINES_OVER_SHEET)).filter((g) => g.piece !== "Glass" && !g.disabled));
      faults.push(...reads.filter((g) => g.ratio < FLOOR_PLAIN).map((g) => `${at}: ${g.piece} "${g.t}" reads ${g.ratio.toFixed(2)} painted`));
      if (page === "/ribbon/") ribbonNav ||= reads.some((g) => g.piece === "cluster" && g.t.startsWith("Glossary"));
      rows.push(`${at} ${reads.length} lines, worst ${Math.min(...reads.map((g) => g.ratio)).toFixed(2)}`);
    }
  }
  ctx.check(
    "NS1 over a floored chart on a short window (1024x540, 1024x474 and 1024x430) the Press and the room folio stand on the cluster's blurred pool, not a hard-edged panel, no backing lies over another piece's lines, and every chrome line over the sheet but the Glass's and a disabled press's reads 4.5:1 or better as it is painted, in every chart room and the Print Room's named world, the Ribbon's \"Glossary\" beside its corner among them (Alex, 2026-10-06, Issue #762: soft)",
    faults.length === 0 && ribbonNav,
    `${rows.join(" | ")}; the Ribbon's Glossary read ${ribbonNav}${faults.length ? `; ${faults.length} faults: ${faults.slice(0, 8).join("; ")}` : ""}`,
  );
}

// The witnesses, swept 2026-10-06 on this branch: the Print Room's risen Press, slip open, stands 34px under the cluster's foot at 1024x400 and sheds from 1024x380 down on both worlds, and unshed at 360 it would reach 5.6px over the foot; the Seed of the Day's, unshed at 1024x388, stands 16.3px under the foot, outside the gap, while its soft pool's 1.3rem would reach 4.5px over the cluster's last line. The PR #777 row's 932x430 is the 1024x430 page under the floor, clear by 64px with no shed.
const LEAN_H = 360;
const REACH_H = 388;
export async function na4Lean(ctx: SuiteContext): Promise<void> {
  await ctx.setTouch(false);
  const settle = makeSettle(ctx);
  const faults: string[] = [];
  const rows: string[] = [];
  for (const page of ["/print-room/", NAMED_WORLD]) {
    await size(ctx, 1024, LEAN_H);
    await ctx.send("Page.navigate", { url: "about:blank" });
    await ctx.send("Page.navigate", { url: `http://127.0.0.1:${ctx.PORT}${page}` });
    const s = await rest(ctx, 1024, LEAN_H, `NA4 ${page}`);
    const leans: boolean[] = [];
    for (const w of [1024, 1025, 1024, 1025, 1024]) {
      await size(ctx, w, LEAN_H);
      await rest(ctx, w, LEAN_H, `NA4 ${page} ${w}`);
      leans.push((await settle(BACKINGS, (d, last) => last !== null && JSON.stringify(d) === JSON.stringify(last), `NA4 ${page} ${w} read`)).lean);
    }
    const b = await ctx.evaluate(BACKINGS);
    if (!b.lean) faults.push(`${page}: the risen Press keeps its note at 1024x${LEAN_H}`);
    if (new Set(leans).size !== 1) faults.push(`${page}: the shed changes across a resize and back (${leans.join(", ")})`);
    if (b.pressTop !== null && b.clusterFoot !== null && b.pressTop < b.clusterFoot) faults.push(`${page}: the Press's top ${b.pressTop.toFixed(1)} stands over the cluster's foot ${b.clusterFoot.toFixed(1)}`);
    if (s) faults.push(...stageFaults({ page, size: `1024x${LEAN_H}`, s }).filter((f) => /header\.chrome/.test(f)));
    rows.push(`${page} lean ${b.lean}, Press top ${b.pressTop?.toFixed(1)} under the cluster's foot ${b.clusterFoot?.toFixed(1)}`);
  }
  await size(ctx, 1024, REACH_H);
  await ctx.send("Page.navigate", { url: "about:blank" });
  await ctx.send("Page.navigate", { url: `http://127.0.0.1:${ctx.PORT}/seed-of-the-day/` });
  const sd = await rest(ctx, 1024, REACH_H, "NA4 the Seed of the Day");
  const day = await ctx.evaluate(BACKINGS);
  if (!day.lean) faults.push(`the Seed of the Day's risen Press keeps its head at 1024x${REACH_H}, where its pool would reach the cluster`);
  if (sd) faults.push(...stageFaults({ page: "/seed-of-the-day/", size: `1024x${REACH_H}`, s: sd }).filter((f) => /header\.chrome/.test(f)));
  rows.push(`/seed-of-the-day/ at 1024x${REACH_H} lean ${day.lean}, Press top ${day.pressTop?.toFixed(1)}`);
  await size(ctx, 1024, 474);
  await ctx.send("Page.navigate", { url: "about:blank" });
  await ctx.send("Page.navigate", { url: `http://127.0.0.1:${ctx.PORT}/explorer/` });
  await rest(ctx, 1024, 474, "NA4 the Explorer");
  const explorer = await ctx.evaluate(BACKINGS);
  if (!explorer.under) faults.push("the Explorer at 1024x474 is not floored, so the no-shed arm reads nothing");
  if (explorer.lean) faults.push("the Explorer's risen Press sheds at 1024x474, where it stands clear of the cluster");
  ctx.check(
    "NA4 a risen Press that would reach the head cluster, by its own top or by the soft pool it stands on, sheds its note and every head line holding no control, and stands clear of the cluster's foot with no backing over the cluster's lines: the Print Room at 1024x360 with its slip open, on the fixed day's world and 2026-10-06's, the same shed on every read across a resize and back twice, and the Seed of the Day at 1024x388, where only the pool would reach; while the Explorer's floored Press at 1024x474, clear of the cluster, keeps its head (Alex, 2026-10-06, Issue #762: lean)",
    faults.length === 0,
    `${rows.join(" | ")}; the Explorer lean ${explorer.lean}${faults.length ? `; ${faults.slice(0, 6).join("; ")}` : ""}`,
  );
}
