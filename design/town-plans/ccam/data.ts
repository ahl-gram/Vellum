// What a plate can truthfully name, read from the world: the sea, the river under the town, the range and forest, the realm, and the neighbours that stand on the horizon in the direction the plate looks.
import { defaultRecipe, generateWorld } from "../../../src/world/generate.ts";
import type { World } from "../../../src/world/types.ts";
import { buildProspectInput, type ProspectInput } from "../../../src/prospect/input.ts";
import { composeProspect } from "../../../src/prospect/compose.ts";
import { eraFor, plateCaption, type PlateCaption, type PlateEra } from "../../../src/prospect/caption.ts";
import { plateKey, type PlateKeyEntry } from "../../../src/prospect/key.ts";
import type { ProspectGeometry } from "../../../src/prospect/geometry.ts";
import { viewRight } from "../../../src/prospect/transect.ts";
import { largestBlob } from "../../../src/render/blobs.ts";
import { BIOMES } from "../../../src/climate/biomes.ts";

export type Neighbour = {
  readonly index: number;
  readonly name: string;
  readonly kind: string;
  readonly dist: number;
  /** -1 far left to +1 far right across the plate, from the dot with the view's right vector. */
  readonly lateral: number;
  /** Positive when it stands behind the town (deeper into the view), negative when behind the viewer. */
  readonly depth: number;
};

export type Scene = {
  readonly world: World;
  readonly input: ProspectInput;
  readonly geometry: ProspectGeometry;
  readonly era: PlateEra;
  readonly year: number;
  readonly caption: PlateCaption;
  readonly key: ReadonlyArray<PlateKeyEntry>;
  readonly seaName: string;
  readonly riverName: string | null;
  readonly rangeName: string | null;
  readonly forestName: string | null;
  readonly neighbours: ReadonlyArray<Neighbour>;
  readonly roadsOut: number;
  readonly cardinals: { readonly left: string; readonly right: string; readonly far: string; readonly near: string };
  readonly chronicle: ReadonlyArray<string>;
  /** The world's sea beast when its haunt lies within forty cells and seaward of the town: Cadiz drew the creature of the place in the foreground. */
  readonly beast: { readonly name: string; readonly epithet: string; readonly dist: number; readonly lateral: number } | null;
  /** The town's run across the plate in plate x, from the composed masses. */
  readonly townRun: readonly [number, number];
  /** True when the named range's alpine blob has its centre within sixty cells and behind the town, so the ridge may be named for it. */
  readonly rangeInView: boolean;
};

function rangeBehind(world: World, x: number, y: number, view: { dx: number; dy: number }): boolean {
  if (!world.names.range) return false;
  const { w, h } = world.elev;
  const blob = largestBlob(w, h, (i) => {
    const b = world.biomes[i] as number;
    return b === BIOMES.alpine || b === BIOMES.snow;
  });
  if (blob.length < 10) return false;
  let sx = 0, sy = 0;
  for (const i of blob) { sx += i % w; sy += Math.floor(i / w); }
  const cx = sx / blob.length - x, cy = sy / blob.length - y;
  const dist = Math.sqrt(cx * cx + cy * cy);
  return dist <= 60 && cx * view.dx + cy * view.dy > 0;
}

const worlds = new Map<number, World>();
export function worldFor(seed: number): World {
  const w = worlds.get(seed) ?? generateWorld(defaultRecipe(seed));
  worlds.set(seed, w);
  return w;
}

function riverNameAt(world: World, x: number, y: number): string | null {
  let best: { name: string; d: number } | null = null;
  for (const [idx, name] of world.names.rivers.entries()) {
    const river = world.rivers[idx];
    if (!river) continue;
    for (const p of river.points) {
      const d = Math.abs(p.x - x) + Math.abs(p.y - y);
      if (d <= 3 && (best === null || d < best.d)) best = { name, d };
    }
  }
  return best?.name ?? null;
}

/** Grid space: x east, y south. The view vector points from the viewer into the picture. */
function cardinalWords(view: { dx: number; dy: number }): Scene["cardinals"] {
  const word = (dx: number, dy: number): string => {
    if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? "Oriens" : "Occidens";
    return dy > 0 ? "Meridies" : "Septentrio";
  };
  const right = viewRight(view);
  return { far: word(view.dx, view.dy), near: word(-view.dx, -view.dy), right: word(right.dx, right.dy), left: word(-right.dx, -right.dy) };
}

export function sceneFor(seed: number, index: number, yearOverride?: number): Scene {
  const world = worldFor(seed);
  const input = buildProspectInput(world, index);
  const year = yearOverride ?? world.title.year;
  const era = eraFor(input, year);
  const geometry = era === "before-founding"
    ? composeProspect(input, { era: "before-founding" })
    : composeProspect(era === "ruined" ? input : { ...input, ruined: false });
  const caption = plateCaption(input, geometry, era, year, world.names.sea);
  const key = plateKey(geometry);
  const s = world.settlements[index]!;
  const right = viewRight(input.view);
  const neighbours: Neighbour[] = world.settlements
    .map((n, i) => {
      const ox = n.x - s.x, oy = n.y - s.y;
      const dist = Math.sqrt(ox * ox + oy * oy);
      return { index: i, name: n.name, kind: n.kind, dist, lateral: (ox * right.dx + oy * right.dy) / 40, depth: ox * input.view.dx + oy * input.view.dy };
    })
    .filter((n) => n.index !== index && n.dist <= 40 && n.depth > 2 && Math.abs(n.lateral) <= 1 && world.settlements[n.index]!.founded <= year)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 4);
  const roadsOut = world.roads.filter((r) => {
    const a = r.points[0]!, b = r.points[r.points.length - 1]!;
    return (Math.abs(a.x - s.x) <= 1 && Math.abs(a.y - s.y) <= 1) || (Math.abs(b.x - s.x) <= 1 && Math.abs(b.y - s.y) <= 1);
  }).length;
  const chronicle = world.history.events.filter((e) => e.settlement === index).map((e) => `${e.year}: ${e.text}`);
  const beast = world.beasts
    .map((b) => {
      const ox = b.x - s.x, oy = b.y - s.y;
      return { name: b.name, epithet: b.epithet, dist: Math.sqrt(ox * ox + oy * oy), lateral: (ox * right.dx + oy * right.dy) / 40, depth: ox * input.view.dx + oy * input.view.dy };
    })
    .filter((b) => b.dist <= 40 && b.depth < 0 && s.harbor)
    .sort((a, b) => a.dist - b.dist)[0] ?? null;
  const rangeInView = rangeBehind(world, s.x, s.y, input.view);
  const xs = geometry.masses.map((m) => m.x).concat(geometry.walls.map((w) => w.x0));
  const xe = geometry.masses.map((m) => m.x + m.w).concat(geometry.walls.map((w) => w.x1));
  const townRun: readonly [number, number] = xs.length > 0 ? [Math.min(...xs), Math.max(...xe)] : [260, 260];
  return {
    beast, townRun, rangeInView,
    world, input, geometry, era, year, caption, key,
    seaName: world.names.sea,
    riverName: s.onRiver ? riverNameAt(world, s.x, s.y) : null,
    rangeName: world.names.range,
    forestName: world.names.forest,
    neighbours, roadsOut,
    cardinals: cardinalWords(input.view),
    chronicle,
  };
}
