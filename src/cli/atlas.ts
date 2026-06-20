import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { escapeXml } from "../render/svg.ts";
import { composeAtlas } from "../atlas/compose.ts";
import { defaultRecipe, generateWorld } from "../world/generate.ts";
import type { World, WorldRecipe } from "../world/types.ts";

function indexHtml(
  world: World,
  themes: ReadonlyArray<{ file: string; title: string }>,
  regions: ReadonlyArray<{ file: string; title: string }>,
  bannersFragment: string,
  chronicleFragment: string,
  gazetteerFragment: string,
): string {
  const t = world.title;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeXml(t.title)} — a Vellum atlas</title>
<style>
  :root { color-scheme: light; }
  body {
    margin: 0; padding: 2.5rem 1.5rem 5rem;
    background: #efe6cf; color: #3d2f1f;
    font-family: 'Iowan Old Style', 'Palatino', Georgia, serif;
    max-width: 1080px; margin-inline: auto;
  }
  header { text-align: center; margin-bottom: 2rem; }
  h1 { font-size: 2.4rem; letter-spacing: 0.04em; margin: 0 0 0.4rem; }
  h2 { letter-spacing: 0.06em; border-bottom: 1px solid #b9a77f; padding-bottom: 0.3rem; margin-top: 3rem; }
  .subtitle { font-style: italic; color: #6b5a40; max-width: 46rem; margin-inline: auto; }
  .chartno { letter-spacing: 0.3em; font-size: 0.8rem; color: #857257; margin-top: 0.6rem; }
  figure { margin: 1.5rem 0; }
  figure img { width: 100%; height: auto; display: block;
    border: 1px solid #b9a77f; box-shadow: 0 10px 30px rgb(61 47 31 / 0.18); }
  figcaption { text-align: center; font-style: italic; color: #6b5a40; padding-top: 0.55rem; }
  .styles { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; }
  .themes { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.25rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
  th { text-align: left; border-bottom: 2px solid #4a3826; padding: 0.45rem 0.6rem; }
  td { border-bottom: 1px solid #cdbd97; padding: 0.45rem 0.6rem; vertical-align: top; }
  td.name { font-weight: 600; white-space: nowrap; }
  td.name.capital { text-transform: uppercase; letter-spacing: 0.06em; }
  td.note { font-style: italic; color: #54452f; }
  .realms { font-style: italic; color: #6b5a40; }
  .banners { display: flex; flex-wrap: wrap; gap: 1.1rem; justify-content: center; }
  .banner { width: 120px; text-align: center; }
  .banner svg { width: 100%; height: auto; }
  .banner figcaption { font-style: italic; color: #6b5a40; font-size: 0.85rem;
    padding-top: 0.35rem; }
  .chronicle-intro { font-style: italic; color: #6b5a40; }
  ol.chronicle { list-style: none; padding: 0; margin: 1rem 0 0;
    max-width: 48rem; }
  ol.chronicle li { padding: 0.4rem 0; border-bottom: 1px solid #cdbd97;
    display: flex; gap: 0.9rem; }
  ol.chronicle .year { flex: 0 0 3.2rem; text-align: right; font-variant-numeric: tabular-nums;
    font-weight: 600; color: #857257; }
  footer { margin-top: 4rem; text-align: center; letter-spacing: 0.25em;
    font-size: 0.75rem; color: #857257; }
  a { color: inherit; }
</style>
</head>
<body>
<header>
  <h1>${escapeXml(t.title)}</h1>
  <p class="subtitle">${escapeXml(t.subtitle)}</p>
  <p class="chartno">VELLUM · CHART № ${world.recipe.seed}</p>
</header>

<figure>
  <a href="world-antique.svg"><img src="world-antique.svg" alt="World chart, antique style"></a>
  <figcaption>The world chart, drawn in the antique manner</figcaption>
</figure>

<section>
<h2>Other Draughtings</h2>
<div class="styles">
  <figure><a href="world-topographic.svg"><img src="world-topographic.svg" alt="Topographic"></a>
    <figcaption>Topographic</figcaption></figure>
  <figure><a href="world-ink.svg"><img src="world-ink.svg" alt="Pen and ink"></a>
    <figcaption>Pen &amp; ink</figcaption></figure>
  <figure><a href="world-nautical.svg"><img src="world-nautical.svg" alt="Nautical"></a>
    <figcaption>Nautical</figcaption></figure>
</div>
</section>

<section>
<h2>Thematic Surveys</h2>
<div class="themes">
${themes
  .map(
    (t) => `  <figure><a href="${t.file}"><img src="${t.file}" alt="${escapeXml(t.title)}"></a>
    <figcaption>${escapeXml(t.title)}</figcaption></figure>`,
  )
  .join("\n")}
</div>
</section>

<section>
<h2>Regional Surveys</h2>
${regions
  .map(
    (r) => `<figure><a href="${r.file}"><img src="${r.file}" alt="${escapeXml(r.title)}"></a>
  <figcaption>${escapeXml(r.title)}</figcaption></figure>`,
  )
  .join("\n")}
</section>

${bannersFragment}

${chronicleFragment}

${gazetteerFragment}

<footer>DRAWN BY VELLUM · AN ATELIER OF IMAGINARY CARTOGRAPHY</footer>
</body>
</html>
`;
}

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

  await writeFile(join(dir, `world-${atlas.hero.key}.svg`), atlas.hero.svg, "utf8");
  for (const d of atlas.draughtings) {
    await writeFile(join(dir, `world-${d.key}.svg`), d.svg, "utf8");
  }

  const themes: Array<{ file: string; title: string }> = [];
  for (const t of atlas.themes) {
    const file = `${t.key}.svg`;
    await writeFile(join(dir, file), t.svg, "utf8");
    themes.push({ file, title: t.title });
  }

  const regions: Array<{ file: string; title: string }> = [];
  for (const r of atlas.regions) {
    const file = `${r.key}.svg`;
    await writeFile(join(dir, file), r.svg, "utf8");
    regions.push({ file, title: r.title });
  }

  await writeFile(
    join(dir, "index.html"),
    indexHtml(world, themes, regions, atlas.bannersHtml, atlas.chronicleHtml, atlas.gazetteerHtml),
    "utf8",
  );
  return dir;
}
