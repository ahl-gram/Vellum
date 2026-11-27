import type { World } from "../../world/types.ts";
import { createRng } from "../../core/rng.ts";
import { r3 } from "../../core/math.ts";
import type { ProspectInput } from "../input.ts";
import { eraFor } from "../caption.ts";
import type { PlateKeyEntry } from "../key.ts";
import type { Surroundings } from "../surroundings.ts";
import { planTown } from "../town-plan/plan.ts";
import type { BirdseyeGeometry } from "./types.ts";
import { buildWindow, projector } from "./window.ts";
import { coastSegments, hillStrokes, landStrips } from "./terrain.ts";
import { waysIn } from "./ways.ts";
import { scatterIn } from "./scatter.ts";
import { townLayer } from "./town.ts";
import { harbourOf } from "./harbour.ts";
import { KEY_ENTRIES, TAG_LIFT, neighboursIn, planKey, seaBands, seaRise } from "./names.ts";

/** Every number in the geometry to three decimals, so the plate's bytes are a function of rounded values: libm drift in world.elev moves one only where it sits within that much of a boundary. */
export function quantized<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_k: string, v: unknown): unknown => (typeof v === "number" ? r3(v) : v)),
  ) as T;
}

export function composeBirdseye(
  world: World,
  input: ProspectInput,
  year: number,
  surroundings: Surroundings,
): BirdseyeGeometry {
  const era = eraFor(input, year);
  const plan = planTown(world, input.index);
  const kind = input.kind;
  if (kind === "hamlet")
    throw new RangeError(`a bird's-eye is drawn for a capital, seat, town or village, not ${input.name}`);
  const s = world.settlements[input.index]!;
  const w = buildWindow(world, { x: s.x, y: s.y }, input.view);
  const to = projector(world, w);
  const town = townLayer(world, w, plan, kind, era);
  const scatter = scatterIn(
    w,
    createRng(input.seed).fork(`prospect:${input.index}:c:land`),
    town === null ? 0 : plan.radius,
    town?.keepOut ?? [],
  );
  const { hatch, shade } = hillStrokes(w, input.siteRel);
  const { rivers, roads } = waysIn(world, w);
  const sea = input.harbor ? surroundings.seaName : null;
  const key: PlateKeyEntry[] =
    era === "before-founding"
      ? []
      : planKey(world, plan, kind, sea, surroundings.riverName)
          .filter((d) => era === "standing" || d.of === "world" || (era === "ruined" && d.of === "bridge"))
          .slice(0, KEY_ENTRIES)
          .map((d, i): PlateKeyEntry => {
            const a = d.at === null ? null : to(d.at);
            return {
              letter: String(i + 1),
              label: d.label,
              x: a?.x ?? null,
              y: a === null ? null : a.y - TAG_LIFT[d.of],
              town: null,
            };
          });
  return quantized({
    seed: input.seed,
    index: input.index,
    kind,
    era,
    strips: landStrips(w),
    coast: coastSegments(w),
    hatch,
    shade,
    rivers,
    roads,
    scatter,
    town,
    harbour: harbourOf(world, w, plan, kind, era),
    neighbours: neighboursIn(
      world,
      w,
      input.index,
      year,
      createRng(input.seed).fork(`prospect:${input.index}:c:neighbours`),
    ),
    seaName: sea === null ? null : { text: sea.toUpperCase(), bands: seaBands(w, seaRise(sea.toUpperCase())) },
    key,
  });
}
