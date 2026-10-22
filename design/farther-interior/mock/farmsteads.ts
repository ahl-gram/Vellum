// Issue #950 round, the finer tier: THE BREAKDOWN'S BOLD SUGGESTION, drawn here by the designer as a candidate for decision 9 and not ruled. From band 5 down a close-up gains named farmsteads, and a farmstead standing on a drawn river becomes a mill. They are grown the way the hamlets are (`placeHamlets` in `src/society/hamlets.ts`): on a fixed world-space lattice, each point forked off the seed by its lattice indices alone and screened on the WORLD grid, so a farmstead's existence, spot and name do not depend on the window or the path taken to it. The lattice is half a world cell, nested: the points on its whole-cell sub-lattice show from band 5, the rest join at band 6. That was meant to carry every band-5 farmstead to band 6, and it does not quite: the spacing test reads the window's own towns, hamlets and marks already placed, and the spot and the mill test read the window's own ground and rivers, so 2 of the 18 band-5 marks inside a band-6 window are lost there (measure/tier-monotone.txt). A build spaces the tier against its own lattice alone.
// Fords (where a drawn road crosses a drawn river) are NOT drawn: no close-up draws a road from band 5 down today (0 of 40 world roads at band 5, the breakdown's count), so a ford would stand on a road the sheet does not show. They wait on Sub 2.
// Mills stand on the rivers of river arm A, the sheet the tier is drawn on; they would follow whichever river method is ruled.
import { createRng } from "../../../src/core/rng.ts";
import { BIOMES } from "../../../src/climate/biomes.ts";
import { slopeField } from "../../../src/terrain/slope.ts";
import { BIOME_APPEAL, EDGE_MARGIN } from "../../../src/society/sites.ts";
import { hamletName, worldNameSet } from "../../../src/society/hamlets.ts";
import { landSnapRadius, snapToLand } from "../../../src/world/snap-to-land.ts";
import type { UvWindow } from "../../../src/terrain/heightfield.ts";
import { STYLES } from "../../../src/render/style.ts";
import type { NamedSettlement, World } from "../../../src/world/types.ts";

// STAND-INS, not ruled: the lattice in world cells, the chance a well-placed point holds a farmstead, how near a river a farmstead must stand to be a mill, how far one keeps from a town, a hamlet or another of its tier, the highest ground it takes (a share of the world's span above the sea, as the hamlets' `MAX_ELEV_BAND`), and the jitter inside a lattice cell (the hamlets' 0.7).
export const FARM_LATTICE_WORLD_CELLS = 0.5;
export const FARM_DENSITY = 0.11;
export const MILL_REACH_WORLD_CELLS = 0.18;
export const FARM_SPACING_WORLD_CELLS = 0.45;
const MAX_ELEV_BAND = 0.6;
const JITTER = 0.7;
export const FIRST_BAND = 5;

export type TierMark = { readonly name: string; readonly kind: "farmstead" | "mill"; readonly settlement: NamedSettlement };

const slopes = new WeakMap<World, ReturnType<typeof slopeField>>();

export function finerTier(world: World, window: UvWindow, band: number, region: World): TierMark[] {
  if (band < FIRST_BAND) return [];
  const { gridW, gridH } = world.recipe;
  let slope = slopes.get(world);
  if (slope === undefined) {
    slope = slopeField(world.elev);
    slopes.set(world, slope);
  }
  let worldMax = -Infinity;
  for (const v of world.elev.data) worldMax = Math.max(worldMax, v);
  const span = Math.max(1e-9, worldMax - world.seaLevel);
  const taken = worldNameSet(world);
  const root = createRng(world.recipe.seed);
  const stepU = FARM_LATTICE_WORLD_CELLS / (gridW - 1);
  const stepV = FARM_LATTICE_WORLD_CELLS / (gridH - 1);
  const du = window.u1 - window.u0;
  const dv = window.v1 - window.v0;
  const inset = 0.02;
  const u0 = window.u0 + du * inset;
  const u1 = window.u1 - du * inset;
  const v0 = window.v0 + dv * inset;
  const v1 = window.v1 - dv * inset;
  const rW = region.elev.w;
  const rH = region.elev.h;
  const radius = landSnapRadius(rW, window, gridW);
  const cellsPerWorld = (rW - 1) / (du * (gridW - 1));
  const riverPts = region.rivers.flatMap((r) => r.points);
  const others = region.settlements;
  const out: TierMark[] = [];
  for (let iy = Math.max(0, Math.floor(v0 / stepV) - 1); iy <= Math.floor(v1 / stepV) + 1; iy++) {
    for (let ix = Math.max(0, Math.floor(u0 / stepU) - 1); ix <= Math.floor(u1 / stepU) + 1; ix++) {
      const coarse = ix % 2 === 0 && iy % 2 === 0;
      if (!coarse && band < FIRST_BAND + 1) continue;
      const r = root.fork(`farmstead:${ix},${iy}`);
      const roll = r.next();
      const ju = r.next();
      const jv = r.next();
      const u = (ix + 0.5 + (ju - 0.5) * JITTER) * stepU;
      const v = (iy + 0.5 + (jv - 0.5) * JITTER) * stepV;
      if (u < u0 || u > u1 || v < v0 || v > v1) continue;
      const wx = Math.round(u * (gridW - 1));
      const wy = Math.round(v * (gridH - 1));
      if (wx < EDGE_MARGIN || wy < EDGE_MARGIN || wx >= gridW - EDGE_MARGIN || wy >= gridH - EDGE_MARGIN) continue;
      const wi = wx + wy * gridW;
      const e = world.elev.data[wi] as number;
      if (e <= world.seaLevel) continue;
      const biome = world.biomes[wi] as number;
      if (biome === BIOMES.snow || biome === BIOMES.alpine) continue;
      if ((e - world.seaLevel) / span > MAX_ELEV_BAND) continue;
      const score = 1 - Math.min(1, (slope.data[wi] as number) * 8) + (BIOME_APPEAL[biome] ?? 0.3);
      if (roll >= FARM_DENSITY * score) continue;
      const gx = Math.round(((u - window.u0) / du) * (rW - 1));
      const gy = Math.round(((v - window.v0) / dv) * (rH - 1));
      const cell = snapToLand(region.elev, region.seaLevel, gx, gy, radius);
      if (cell === null) continue;
      const tooNear = [...others, ...out.map((m) => m.settlement)].some((s) => Math.hypot(s.x - cell.x, s.y - cell.y) < FARM_SPACING_WORLD_CELLS * cellsPerWorld);
      if (tooNear) continue;
      const base = hamletName(r.fork("name"), world.culture, taken);
      if (base === null) continue;
      const mill = riverPts.some((p) => Math.hypot(p.x - cell.x, p.y - cell.y) <= MILL_REACH_WORLD_CELLS * cellsPerWorld);
      const name = mill ? `${base} Mill` : base;
      const settlement: NamedSettlement = { x: cell.x, y: cell.y, kind: "hamlet", harbor: false, onRiver: mill, score, name, founded: world.title.year - 1, ruined: false };
      out.push({ name, kind: mill ? "mill" : "farmstead", settlement });
    }
  }
  return out;
}

/** The marks drawn through the engine's own settlement layer as hamlets, so their labels claim room the way every label does, then given their own glyph: a farmstead is a small filled square, a mill a wheel. STAND-IN glyphs, drawn for the sitting. */
export function withTierGlyphs(svg: string, marks: ReadonlyArray<TierMark>, widthPx: number): { svg: string; swapped: number } {
  const k = widthPx / 1500;
  const { ink, labelHalo } = STYLES.antique;
  let out = svg;
  let swapped = 0;
  for (const m of marks) {
    const esc = m.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(<g class="settlement" data-idx="\\d+" data-tier="hamlet" data-name="${esc}">)<circle cx="([^"]+)" cy="([^"]+)"[^>]*/>`);
    out = out.replace(re, (_all, open: string, cx: string, cy: string) => {
      swapped++;
      const x = Number(cx);
      const y = Number(cy);
      if (m.kind === "farmstead") {
        const s = 3.4 * k;
        return `${open}<rect x="${(x - s / 2).toFixed(2)}" y="${(y - s / 2).toFixed(2)}" width="${s.toFixed(2)}" height="${s.toFixed(2)}" fill="${ink}" stroke="${labelHalo}" stroke-width="${(0.8 * k).toFixed(2)}"/>`;
      }
      const r = 3.2 * k;
      const spokes = [
        [1, 0],
        [Math.SQRT1_2, Math.SQRT1_2],
        [0, 1],
        [-Math.SQRT1_2, Math.SQRT1_2],
      ]
        .map(([c, sn]) => `M${(x - r * c!).toFixed(2)} ${(y - r * sn!).toFixed(2)}L${(x + r * c!).toFixed(2)} ${(y + r * sn!).toFixed(2)}`)
        .join("");
      return `${open}<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${r.toFixed(2)}" fill="${labelHalo}" stroke="${ink}" stroke-width="${(1 * k).toFixed(2)}"/><path d="${spokes}" stroke="${ink}" stroke-width="${(0.7 * k).toFixed(2)}"/>`;
    });
  }
  return { svg: out, swapped };
}
