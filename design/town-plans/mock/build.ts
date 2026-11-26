// Issue #793 round: renders every still into the main checkout's out/793/stills/ and records each one's bytes and render time. OUT_ROOT is absolute on purpose: the code runs from the designer's tree, the stills land where Alex looks. Run: node out/793/mock/build.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { STYLES } from "../../../src/render/style.ts";
import { prospectPlate } from "../../../src/prospect/finished.ts";
import { sceneFor } from "../ccam/data.ts";
import { ANTIQUE_COLOURED, INK, type Dress } from "../ccam/dress.ts";
import { plateC, plateCWith } from "../ccam/direction-c.ts";
import { planTown } from "../planner/plan.ts";
import type { StreetSystem, TownPlan } from "../planner/types.ts";
import { planViewPlate } from "./plan-view.ts";
import { planLayer } from "./birdseye.ts";
import { profilePlate, type Width } from "./profile.ts";
import { closeupBand, closeupSvg } from "./closeup.ts";
import { DIRECTIONS, PLACES, type Place } from "./places.ts";
import { OUT_ROOT } from "./root.ts";

const STILLS = `${OUT_ROOT}stills/`;
mkdirSync(STILLS, { recursive: true });

const DRESS: Record<"antique" | "ink", Dress> = { antique: ANTIQUE_COLOURED, ink: INK };
const LABEL: Record<StreetSystem, string> = { land: "the streets laid with the land", grid: "the streets laid on a grid" };

type Row = { file: string; place: string; view: string; arm: string; dress: string; kind: string; bytes: number; ms: number };
const rows: Row[] = [];

function write(file: string, place: Place, view: string, arm: string, dress: string, render: () => string): void {
  const t0 = performance.now();
  const svg = render();
  const ms = performance.now() - t0;
  writeFileSync(`${STILLS}${file}`, svg);
  rows.push({ file, place: place.slug, view, arm, dress, kind: place.kind, bytes: Buffer.byteLength(svg, "utf8"), ms });
}

type PlanRow = { place: string; direction: string; ms: number; gates: number; streets: number; blocks: number; vertices: number; landmarks: string };
const planRows: PlanRow[] = [];

function plansFor(place: Place): Record<StreetSystem, TownPlan> {
  const world = sceneFor(place.seed, place.index).world;
  const out = {} as Record<StreetSystem, TownPlan>;
  for (const { key } of DIRECTIONS) {
    const t0 = performance.now();
    const plan = planTown(world, place.index, key);
    const ms = performance.now() - t0;
    out[key] = plan;
    const vertices = (plan.wall?.length ?? 0) + plan.streets.reduce((a, s) => a + s.length, 0) + plan.blocks.reduce((a, b) => a + b.length, 0) + plan.landmarks.length + plan.gates.length;
    planRows.push({ place: place.slug, direction: key, ms, gates: plan.gates.length, streets: plan.streets.length, blocks: plan.blocks.length, vertices, landmarks: plan.landmarks.map((l) => l.kind).join(" ") });
  }
  return out;
}

for (const place of PLACES) {
  const scene = sceneFor(place.seed, place.index);
  const plans = plansFor(place);
  for (const dress of ["antique", "ink"] as const) {
    const d = DRESS[dress];
    write(`plan-control-${place.slug}-${dress}.svg`, place, "plan", "control", dress, () => closeupSvg(scene.world, place.index, place.kind, dress, 520));
    write(`bird-control-${place.slug}-${dress}.svg`, place, "bird", "control", dress, () => plateC(d, scene));
    write(`prof-control-${place.slug}-${dress}.svg`, place, "prof", "control", dress, () => prospectPlate(scene.world, place.index, STYLES[dress], scene.world.title.year));
    for (const { key } of DIRECTIONS) {
      const plan = plans[key];
      write(`plan-${key}-${place.slug}-${dress}.svg`, place, "plan", key, dress, () => planViewPlate(d, scene, plan, place.kind, { shore: "closed", label: LABEL[key] }));
      write(`bird-${key}-${place.slug}-${dress}.svg`, place, "bird", key, dress, () => plateCWith(d, scene, planLayer(scene.world, plan, place.kind, "closed", `The bird's-eye of ${place.title}, ${LABEL[key]}`)));
      write(`prof-${key}-${place.slug}-${dress}.svg`, place, "prof", key, dress, () => profilePlate(scene.world, place.index, plan, place.kind, dress, "today", "closed"));
    }
  }
  if (place.slug === "capital-laukuwelua" || place.slug === "town-tau" || place.slug === "seat-mectlan") {
    for (const { key } of DIRECTIONS)
      write(`bird-${key}-lean-${place.slug}-antique.svg`, place, "bird", `${key}-lean`, "antique", () => plateCWith(DRESS.antique, scene, planLayer(scene.world, plans[key], place.kind, "closed", `The bird's-eye of ${place.title}, lean`, "lean")));
  }
  if (place.slug === "capital-laukuwelua" || place.slug === "town-tau") {
    const plan = plans.land;
    const d = DRESS.antique;
    write(`plan-land-open-${place.slug}-antique.svg`, place, "plan", "land-open", "antique", () => planViewPlate(d, scene, plan, place.kind, { shore: "open", label: `${LABEL.land}, open to the water` }));
    write(`bird-land-open-${place.slug}-antique.svg`, place, "bird", "land-open", "antique", () => plateCWith(d, scene, planLayer(scene.world, plan, place.kind, "open", `The bird's-eye of ${place.title}, open to the water`)));
  }
  if (place.slug === "capital-laukuwelua" || place.slug === "town-tau" || place.slug === "village-lokai" || place.slug === "capital-grurgthohold") {
    const widths: Width[] = ["true"];
    for (const w of widths) write(`prof-land-${w}-${place.slug}-antique.svg`, place, "prof", `land-${w}`, "antique", () => profilePlate(scene.world, place.index, plans.land, place.kind, "antique", w, "closed"));
  }
  console.log(`${place.slug}: done (close-up band ${closeupBand(place.kind)})`);
}

writeFileSync(`${OUT_ROOT}sizes.json`, JSON.stringify({ stills: rows, plans: planRows }, null, 1));
console.log(`${rows.length} stills written to ${STILLS}`);
