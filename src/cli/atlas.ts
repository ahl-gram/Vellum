import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createRng } from "../core/rng.ts";
import { renderMap } from "../render/map-renderer.ts";
import { escapeXml } from "../render/svg.ts";
import { createLoreWriter } from "../society/lore.ts";
import { defaultRecipe, generateWorld } from "../world/generate.ts";
import { generateRegionWorld, windowAround } from "../world/region.ts";
import type { World, WorldRecipe } from "../world/types.ts";

const KIND_LABEL: Record<string, string> = {
  capital: "Capital",
  town: "Town",
  village: "Village",
};

function gazetteerHtml(world: World): string {
  const lore = createLoreWriter(world, createRng(world.recipe.seed).fork("lore"));
  const order = { capital: 0, town: 1, village: 2 };
  const sorted = [...world.settlements].sort(
    (a, b) => order[a.kind] - order[b.kind] || a.name.localeCompare(b.name),
  );

  const rows = sorted
    .map((s) => {
      const realmId = world.realms.labels[s.x + s.y * world.elev.w] as number;
      const realm =
        realmId >= 0 && world.names.realms.length > 0
          ? (world.names.realms[realmId] ?? "—")
          : "—";
      const note = lore.settlementNote(s);
      return `<tr>
  <td class="name ${s.kind}">${escapeXml(s.name)}</td>
  <td>${KIND_LABEL[s.kind]}</td>
  <td>${escapeXml(realm)}</td>
  <td class="note">${escapeXml(note)}</td>
</tr>`;
    })
    .join("\n");

  const realmLines =
    world.names.realms.length > 1
      ? `<p class="realms">${world.names.realms
          .map((r) => escapeXml(lore.realmNote(r)))
          .join(" ")}</p>`
      : "";

  return `<section>
<h2>Gazetteer</h2>
${realmLines}
<table>
<thead><tr><th>Place</th><th>Rank</th><th>Realm</th><th>Travelers' notes</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
</section>`;
}

function indexHtml(
  world: World,
  regions: ReadonlyArray<{ file: string; title: string }>,
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
  .styles { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
  th { text-align: left; border-bottom: 2px solid #4a3826; padding: 0.45rem 0.6rem; }
  td { border-bottom: 1px solid #cdbd97; padding: 0.45rem 0.6rem; vertical-align: top; }
  td.name { font-weight: 600; white-space: nowrap; }
  td.name.capital { text-transform: uppercase; letter-spacing: 0.06em; }
  td.note { font-style: italic; color: #54452f; }
  .realms { font-style: italic; color: #6b5a40; }
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
    <figcaption>Topographic survey</figcaption></figure>
  <figure><a href="world-ink.svg"><img src="world-ink.svg" alt="Pen and ink"></a>
    <figcaption>Pen &amp; ink</figcaption></figure>
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

${gazetteerHtml(world)}

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

  const dir = resolve(opts.out ?? `out/atlas-${seed}`);
  await mkdir(dir, { recursive: true });

  for (const style of ["antique", "topographic", "ink"] as const) {
    const svg = renderMap(world, { style, widthPx: width });
    await writeFile(join(dir, `world-${style}.svg`), svg, "utf8");
  }

  // regional surveys: the capital's environs + the farthest town's
  const capital = world.settlements.find((s) => s.kind === "capital");
  const regions: Array<{ file: string; title: string }> = [];
  if (capital) {
    const targets = [
      { anchor: capital, label: `The Environs of ${capital.name}` },
    ];
    const towns = world.settlements.filter((s) => s.kind === "town");
    if (towns.length > 0) {
      const far = towns.reduce((a, b) =>
        Math.hypot(b.x - capital.x, b.y - capital.y) >
        Math.hypot(a.x - capital.x, a.y - capital.y)
          ? b
          : a,
      );
      targets.push({ anchor: far, label: `The Environs of ${far.name}` });
    }

    for (const [i, t] of targets.entries()) {
      const region = generateRegionWorld(world, {
        window: windowAround(world, t.anchor, 0.38),
        gridW: recipe.gridW,
        gridH: recipe.gridH,
        title: t.label,
      });
      const svg = renderMap(region, { style: "antique", widthPx: width });
      const file = `region-${i + 1}.svg`;
      await writeFile(join(dir, file), svg, "utf8");
      regions.push({ file, title: t.label });
    }
  }

  await writeFile(join(dir, "index.html"), indexHtml(world, regions), "utf8");
  return dir;
}
