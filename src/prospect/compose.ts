import { createRng, type Rng } from "../core/rng.ts";
import type { ProspectInput } from "./input.ts";
import { type ForegroundElement, type ProspectGeometry, type Water, VIEW_X0 } from "./geometry.ts";
import { buildGround, buildRidge } from "./ground.ts";
import { composeTownscape, type Townscape } from "./masses.ts";
import {
  composeBirds,
  composeLandDressing,
  composeRiverFront,
  composeSeaFront,
  riverWater,
  seaWater,
  treatmentFor,
  type Treatment,
} from "./foreground.ts";
import { composeCollapseField, composeDrowned } from "./ruin.ts";

export type ComposeOptions = { readonly era?: "standing" | "before-founding" };

const SERPENT_ODDS = 1 / 12;

type GeometryBase = Pick<ProspectGeometry, "seed" | "index" | "ground" | "ridge">;
type Scene = {
  readonly input: ProspectInput;
  readonly treatment: Treatment;
  readonly sea: boolean;
  readonly river: boolean;
  readonly water: Water | null;
};

function beforeFoundingGeometry(base: GeometryBase, scene: Scene, rDecor: Rng): ProspectGeometry {
  const { input, treatment, sea, river, water } = scene;
  const land =
    sea || river
      ? []
      : composeLandDressing(treatment, input.kind, base.ground, rDecor, {
          built: false,
          frontRow: [],
        });
  return {
    ...base,
    water,
    masses: [],
    walls: [],
    foreground: [...land, ...(sea ? [composeBirds(2, rDecor)] : [])],
  };
}

function drownedGeometry(base: GeometryBase, rDecor: Rng): ProspectGeometry {
  const drowned = composeDrowned(base.ground, rDecor);
  return {
    ...base,
    water: drowned.water,
    masses: [],
    walls: [],
    foreground: [...drowned.elements, composeBirds(6, rDecor)],
  };
}

function townForeground(
  scene: Scene,
  base: GeometryBase,
  town: Townscape,
  rDecor: Rng,
  rDelight: Rng,
): ForegroundElement[] {
  const { input, treatment, sea, river, water } = scene;
  const ground = base.ground;
  const foreground: ForegroundElement[] = [];
  if (!sea && !river) {
    foreground.push(
      ...composeLandDressing(treatment, input.kind, ground, rDecor, {
        built: !input.ruined,
        frontRow: town.front,
      }),
    );
  }
  if (sea) foreground.push(...composeSeaFront(input.kind, input.ruined, water!, rDecor));
  if (river) foreground.push(...composeRiverFront(input.kind, input.ruined, water!, rDecor));
  if (input.ruined) {
    foreground.push(...composeCollapseField(ground, town.front, town.runX0, town.runX1, rDecor));
  }
  if (sea && !input.ruined && rDelight.next() < SERPENT_ODDS) {
    foreground.push({ kind: "seaSerpent", x: VIEW_X0 + 74, y: water!.y0 + 24, s: 0.55 });
  }
  if (input.ruined) foreground.push(composeBirds(6, rDecor));
  else if (sea) foreground.push(composeBirds(2, rDecor));
  return foreground;
}

export function composeProspect(input: ProspectInput, opts: ComposeOptions = {}): ProspectGeometry {
  const era = opts.era ?? "standing";
  const treatment = treatmentFor(input.foreground);
  const ground = buildGround(input);
  const ridge = buildRidge(input, ground);
  const base = { seed: input.seed, index: input.index, ground, ridge };

  const rng = createRng(input.seed);
  const rGeo = rng.fork(`prospect:${input.index}:masses`);
  const rDecor = rng.fork(`prospect:${input.index}:decor`);
  const rDelight = rng.fork(`prospect:${input.index}:delight`);

  const sea = input.harbor;
  const river = !sea && input.onRiver;
  const water = sea ? seaWater(ground) : river ? riverWater(ground) : null;
  const scene = { input, treatment, sea, river, water };

  if (era === "before-founding") return beforeFoundingGeometry(base, scene, rDecor);
  if (input.ruined && treatment === "marsh" && !sea) return drownedGeometry(base, rDecor);

  const town = composeTownscape(input.kind, input.score, input.ruined, treatment === "marsh", ground, rGeo);
  const foreground = townForeground(scene, base, town, rDecor, rDelight);
  return { ...base, water, masses: town.masses, walls: town.walls, foreground };
}
