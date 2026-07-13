import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { composeAtlas } from "../atlas/compose.ts";
import { atlasDocument, atlasPlateFilename, type AtlasDocumentData } from "../atlas/document.ts";
import { defaultRecipe, generateWorld } from "../world/generate.ts";
import type { WorldRecipe } from "../world/types.ts";

export async function buildAtlas(
  seed: number,
  opts: { out?: string; width?: number; recipe?: Partial<WorldRecipe> } = {},
): Promise<string> {
  const width = opts.width ?? 1500;
  const recipe = defaultRecipe(seed, opts.recipe ?? {});
  const world = generateWorld(recipe);
  const atlas = composeAtlas(world, { width });

  const dir = resolve(opts.out ?? `out/atlas-${seed}`);
  await mkdir(dir, { recursive: true });

  // Write every plate to the file the document will reference. The filename scheme lives
  // in one place now (atlasPlateFilename), shared by this write loop and the document, so
  // the two can never disagree on a plate's name.
  await writeFile(join(dir, atlasPlateFilename(atlas.hero, "hero")), atlas.hero.svg, "utf8");
  for (const d of atlas.draughtings) {
    await writeFile(join(dir, atlasPlateFilename(d, "draughting")), d.svg, "utf8");
  }
  for (const t of atlas.themes) {
    await writeFile(join(dir, atlasPlateFilename(t, "theme")), t.svg, "utf8");
  }
  for (const r of atlas.regions) {
    await writeFile(join(dir, atlasPlateFilename(r, "region")), r.svg, "utf8");
  }

  // The header fields the document needs, drawn from the World here (the browser download
  // path reads them off serializableAtlas instead, which carries the same three).
  const data: AtlasDocumentData = {
    title: world.title.title,
    subtitle: world.title.subtitle,
    seed: world.recipe.seed,
    hero: atlas.hero,
    draughtings: atlas.draughtings,
    themes: atlas.themes,
    regions: atlas.regions,
    bannersHtml: atlas.bannersHtml,
    chronicleHtml: atlas.chronicleHtml,
    gazetteerHtml: atlas.gazetteerHtml,
  };

  await writeFile(
    join(dir, "index.html"),
    atlasDocument(data, atlasPlateFilename, { anchor: true, motion: true }),
    "utf8",
  );
  return dir;
}
