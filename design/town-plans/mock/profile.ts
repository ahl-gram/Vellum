// Issue #793 round: the profile as it would take its skyline from a TownPlan. Today's E plate exactly (composeProspect, plateSurroundings, plateKey, plateCaption, engraveE), with only its masses and walls replaced by ones read off the plan: the rows where the plan's houses stand, gaps where its streets, river and market leave none, the keep and the church where the plan stands them, a gate in the near wall where a road comes in on that side, and the back rows standing taller where the plan's ground climbs.
import { renderSvg } from "../../../src/render/svg.ts";
import { STYLES } from "../../../src/render/style.ts";
import { createRng } from "../../../src/core/rng.ts";
import { minMax } from "../../../src/core/grid.ts";
import type { World } from "../../../src/world/types.ts";
import { buildProspectInput } from "../../../src/prospect/input.ts";
import { composeProspect } from "../../../src/prospect/compose.ts";
import { eraFor, plateCaption } from "../../../src/prospect/caption.ts";
import { plateKey } from "../../../src/prospect/key.ts";
import { plateSurroundings } from "../../../src/prospect/surroundings.ts";
import { engraveE } from "../../../src/prospect/dress/compose-e.ts";
import { BACK_ROW_RAISE, RIDGE_SCALE, VIEW_X0, VIEW_X1, WALLED_KEEP_RAISE, groundAt, type Mass, type ProspectGeometry, type WallSegment } from "../../../src/prospect/geometry.ts";
import { sampleBilinear, viewRight, TRANSECT_HALF_WIDTH } from "../../../src/prospect/transect.ts";
import type { P, TownPlan } from "../planner/types.ts";
import { housesOf } from "./houses.ts";
import type { Shore } from "./plan-view.ts";

type Kind = "capital" | "seat" | "town" | "village";
export type Width = "today" | "true";

// TIERS in src/prospect/masses.ts, copied so the plan's skyline keeps today's heights per kind.
const TIER = {
  capital: { hMin: 16, hMax: 30, keepW: 34 },
  seat: { hMin: 14, hMax: 25, keepW: 26 },
  town: { hMin: 13, hMax: 23, keepW: 0 },
  village: { hMin: 10, hMax: 16, keepW: 0 },
} as const;
// Picked to make the picture: px of extra height per unit of relative climb, as a share of the backdrop's own RIDGE_SCALE, and its cap.
const CLIMB_SHARE = 0.35;
const CLIMB_CAP = 22;
const HS = 1.1;

export type ProfileGeometry = { readonly g: ProspectGeometry; readonly k: number; readonly run: readonly [number, number] };

export function planGeometry(world: World, index: number, plan: TownPlan, kind: Kind, width: Width, shore: Shore): ProfileGeometry {
  const input = buildProspectInput(world, index);
  const g0 = composeProspect({ ...input, ruined: false });
  const right = viewRight(input.view),
    view = input.view,
    c = plan.centre;
  const span = minMax(world.elev).max - world.seaLevel || 1;
  const rel = (p: P): number => (sampleBilinear(world.elev, p.x, p.y) - world.seaLevel) / span;
  const uv = (p: P) => ({ u: (p.x - c.x) * right.dx + (p.y - c.y) * right.dy, v: (p.x - c.x) * view.dx + (p.y - c.y) * view.dy });
  const houses = housesOf(plan, kind).map((h) => ({ ...uv(h.at), e: rel(h.at) }));
  const outline = plan.wall ?? plan.blocks.flat();
  const us = outline.map((p) => uv(p).u);
  const umin = Math.min(...us),
    umax = Math.max(...us);
  const xs = [...g0.masses.map((m) => m.x), ...g0.walls.map((w) => w.x0)],
    xe = [...g0.masses.map((m) => m.x + m.w), ...g0.walls.map((w) => w.x1)];
  const t0 = Math.min(...xs),
    t1 = Math.max(...xe);
  const k = width === "today" ? (t1 - t0) / (umax - umin || 1) : (VIEW_X1 - VIEW_X0) / (2 * TRANSECT_HALF_WIDTH);
  const mid = width === "today" ? (t0 + t1) / 2 : (VIEW_X0 + VIEW_X1) / 2;
  const um = width === "today" ? (umin + umax) / 2 : 0;
  const X = (u: number): number => Math.max(VIEW_X0 + 4, Math.min(VIEW_X1 - 4, mid + (u - um) * k));
  const vs = [...houses.map((h) => h.v)].sort((a, b) => a - b);
  const vSplit = vs.length > 0 ? vs[Math.floor(vs.length / 2)]! : 0;
  const eLow = houses.length > 0 ? Math.min(...houses.map((h) => h.e)) : 0;
  const climb = (e: number): number => Math.max(0, Math.min(CLIMB_CAP, (e - eLow) * RIDGE_SCALE * CLIMB_SHARE));
  const rng = createRng(plan.seed).fork(`mock-profile:${plan.index}:${plan.direction}:${width}`);
  const tier = TIER[kind];
  const ground = g0.ground;
  const row = (front: boolean): Mass[] => {
    const out: Mass[] = [];
    const run = houses.filter((h) => (front ? h.v < vSplit : h.v >= vSplit));
    let x = X(umin);
    const end = X(umax);
    while (x < end) {
      const w = (15 + rng.next() * 13) * Math.min(1, k / 12 + 0.45);
      const here = run.filter((h) => {
        const hx = X(h.u);
        return hx >= x && hx < x + w;
      });
      const form: Mass["form"] = rng.next() < 0.55 ? "gable" : "ridge";
      const h0 = (tier.hMin + rng.next() * (tier.hMax - tier.hMin)) * HS * (front ? 1 : 0.8);
      if (here.length > 0) {
        const up = front ? 0 : climb(Math.max(...here.map((q) => q.e)));
        const raise = front ? 0 : BACK_ROW_RAISE;
        out.push({ form, x, w, h: h0 + up, base: groundAt(ground, x + w / 2) - raise, raise, broken: false });
      }
      x += w * (0.62 + rng.next() * 0.28);
    }
    return out;
  };
  const back = row(false);
  const front = row(true);
  const landmark = (kindOf: string) => plan.landmarks.find((l) => l.kind === kindOf);
  const verticals: Mass[] = [];
  const keepAt = landmark("keep");
  const keeps: Mass[] = [];
  if (keepAt && tier.keepW > 0) {
    const q = { ...uv(keepAt.at), e: rel(keepAt.at) };
    const w = tier.keepW * Math.min(1, k / 12 + 0.45);
    const x = X(q.u) - w / 2;
    const raise = q.v < vSplit ? WALLED_KEEP_RAISE : BACK_ROW_RAISE;
    keeps.push({ form: "keep", x, w, h: (tier.hMax + (w > 30 ? 16 : 10)) * HS + climb(q.e), base: groundAt(ground, x + w / 2) - raise, raise, broken: false });
  }
  const churchAt = landmark("church");
  if (churchAt) {
    const q = { ...uv(churchAt.at), e: rel(churchAt.at) };
    const x = X(q.u);
    const raise = q.v < vSplit ? 0 : BACK_ROW_RAISE;
    const nave = 22 * Math.min(1, k / 12 + 0.45);
    front.push({ form: "ridge", x: x - nave / 2, w: nave, h: tier.hMax * 0.8 * HS + climb(q.e), base: groundAt(ground, x) - raise, raise, broken: false });
    verticals.push({ form: "spire", x: x - nave / 2 + 3, w: 10, h: (tier.hMax + 10 + rng.next() * 6) * HS + climb(q.e), base: groundAt(ground, x - nave / 2 + 8) - raise, raise, broken: false });
  }
  const walls = plan.wall === null ? [] : nearWall(plan, uv, X, kind, shore, umin, umax);
  return { g: { ...g0, masses: [...back, ...keeps, ...front, ...verticals], walls }, k, run: [X(umin), X(umax)] };
}

function nearWall(plan: TownPlan, uv: (p: P) => { u: number; v: number }, X: (u: number) => number, kind: Kind, shore: Shore, umin: number, umax: number): WallSegment[] {
  if (shore === "open" && plan.quay.length > 0 && plan.landmarks.some((l) => l.kind === "harbour")) return [];
  const h = kind === "capital" ? 13 : 10;
  const near = plan.gates
    .map((g) => uv(g.at))
    .filter((q) => q.v < 0)
    .map((q) => X(q.u))
    .sort((a, b) => a - b)
    .filter((x, i, a) => i === 0 || x - a[i - 1]! > 14);
  const x0 = X(umin),
    x1 = X(umax);
  if (near.length === 0) return [{ x0, x1, h, gate: false, heel: 0 }];
  const out: WallSegment[] = [];
  let cur = x0;
  near.forEach((gx, i) => {
    const nextB = i + 1 < near.length ? (gx + near[i + 1]!) / 2 : x1;
    const hw = Math.max(6, Math.min(gx - cur, nextB - gx));
    if (gx - hw > cur + 2) out.push({ x0: cur, x1: gx - hw, h, gate: false, heel: 0 });
    out.push({ x0: gx - hw, x1: gx + hw, h, gate: true, heel: 0 });
    cur = gx + hw;
  });
  if (x1 > cur + 2) out.push({ x0: cur, x1, h, gate: false, heel: 0 });
  return out;
}

export function profilePlate(world: World, index: number, plan: TownPlan | null, kind: Kind, dress: "antique" | "ink", width: Width, shore: Shore): string {
  const input = buildProspectInput(world, index);
  const year = world.title.year;
  const era = eraFor(input, year);
  const surroundings = plateSurroundings(world, index, year);
  const g = plan === null ? composeProspect(era === "ruined" ? input : { ...input, ruined: false }) : planGeometry(world, index, plan, kind, width, shore).g;
  const caption = plateCaption(input, g, era, year, surroundings.seaName);
  const key = plateKey(g, { input, surroundings, era });
  const suffix = `prof-${dress}-${input.seed}-${index}-${plan === null ? "control" : `${plan.direction}-${width}-${shore}`}`;
  return renderSvg(engraveE(STYLES[dress], { input, g, era, year, caption, key, surroundings, suffix }).node);
}
