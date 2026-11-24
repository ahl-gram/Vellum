import { renderMap, type RenderOptions } from "../../src/render/map-renderer.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import type { WorldRecipe } from "../../src/world/types.ts";
import { createFounder, type Founder } from "../../src/site/shared/founding.ts";
import { committedGazetteer } from "../../test-support/founding-gazetteer.ts";

export interface PictureJob {
  readonly seed: number;
  readonly overrides: Partial<WorldRecipe>;
  readonly render: RenderOptions;
}

export async function jobOf(_picture: string, _founder: Founder): Promise<PictureJob> {
  return { seed: 0, overrides: {}, render: {} };
}

export const drawJob = (job: PictureJob): string =>
  renderMap(generateWorld(defaultRecipe(job.seed, job.overrides)), job.render);

export const committedFounder = (): Founder => createFounder(() => Promise.resolve(committedGazetteer()));
