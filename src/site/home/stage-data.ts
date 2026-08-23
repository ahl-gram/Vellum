import { defaultRecipe, generateWorld } from "../../world/generate.ts";
import { buildPlaceManifest } from "../../render/place-manifest.ts";

export type StageDot = {
  readonly name: string;
  readonly nx: number;
  readonly ny: number;
  readonly ruined: boolean;
  readonly capital: boolean;
};

export type StageData = {
  readonly sheetW: number;
  readonly sheetH: number;
  readonly title: string;
  readonly capital: StageDot;
  readonly dots: ReadonlyArray<StageDot>;
};

// Build-time only (the .astro frontmatter): app.ts must never import this module,
// or the whole engine graph rides into the home bundle.
const SHEET_W = 1500;

let cached: StageData | undefined;

export function homeStage(): StageData {
  if (cached !== undefined) return cached;
  const world = generateWorld(defaultRecipe(42));
  const manifest = buildPlaceManifest(world, SHEET_W);
  const dots = manifest.places.map((p) => ({
    name: p.name,
    nx: p.nx,
    ny: p.ny,
    ruined: p.ruined,
    capital: p.kind === "capital",
  }));
  const capital = dots.find((d) => d.capital);
  if (capital === undefined) throw new Error("seed 42 has no capital mark");
  cached = { sheetW: SHEET_W, sheetH: manifest.heightPx, title: world.title.title, capital, dots };
  return cached;
}
