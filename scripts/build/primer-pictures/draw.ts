import { renderMap, type RenderOptions } from "../../../src/render/map-renderer.ts";
import { overridesOfLand, readDressKeys, readWorldKeys } from "../../../src/site/shared/address-grammar.ts";
import { createFounder, type Founder } from "../../../src/site/shared/founding.ts";
import { readWritten } from "../../../src/site/shared/written-address.ts";
import { foundAddress } from "../../../src/site/shared/written-world.ts";
import { PICTURE_DRAW_WIDTH } from "../../../src/site/primer/pictures.ts";
import { defaultRecipe, generateWorld } from "../../../src/world/generate.ts";
import type { WorldRecipe } from "../../../src/world/types.ts";
import { committedGazetteer } from "../../../test-support/founding-gazetteer.ts";

export interface PictureJob {
  readonly seed: number;
  readonly overrides: Partial<WorldRecipe>;
  readonly render: RenderOptions;
}

export async function jobOf(picture: string, founder: Founder): Promise<PictureJob> {
  const at = picture.indexOf("#");
  if (at === -1) throw new Error(`${picture} carries no address after #`);
  const hash = picture.slice(at);
  const params = new URLSearchParams(hash.slice(1));
  const keys = readWorldKeys(params);
  const dress = readDressKeys(params);
  if (keys.style === null || dress.legend === null || dress.arms === null || dress.beasts === null) {
    throw new Error(`${picture} leaves its style, legend, arms or beasts to a default`);
  }
  const asked = readWritten(hash) !== null;
  const written = asked ? await foundAddress(hash, founder) : null;
  if (asked && written === null) throw new Error(`${picture} carries a sentence that founds no world`);
  const seed = written?.seed ?? keys.seed;
  if (seed === null) throw new Error(`${picture} names no world`);
  return {
    seed,
    overrides: written?.overrides ?? {
      ...(keys.type !== null ? { mapType: keys.type } : {}),
      ...(keys.band !== null ? { band: keys.band } : {}),
      ...overridesOfLand(keys),
    },
    render: {
      style: keys.style,
      widthPx: PICTURE_DRAW_WIDTH,
      legend: dress.legend,
      arms: dress.arms,
      beasts: dress.beasts,
      ...(dress.theme !== null ? { theme: dress.theme } : {}),
    },
  };
}

export const drawJob = (job: PictureJob): string =>
  renderMap(generateWorld(defaultRecipe(job.seed, job.overrides)), job.render);

export const committedFounder = (): Founder => createFounder(() => Promise.resolve(committedGazetteer()));
