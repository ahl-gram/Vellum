import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { paletteRootCss } from "../atlas/palette.ts";
import { renderMap } from "../render/map-renderer.ts";
import { escapeXml } from "../render/svg.ts";
import type { StyleName } from "../render/style.ts";
import { defaultRecipe, generateWorld } from "../world/generate.ts";

const SEED_STRIDE = 7919; // a prime walk through seed space

export async function buildGallery(
  startSeed: number,
  opts: { count?: number; style?: StyleName; out?: string } = {},
): Promise<string> {
  const count = Math.min(opts.count ?? 12, 48);
  const style = opts.style ?? "antique";
  const dir = resolve(opts.out ?? `out/gallery-${startSeed}`);
  await mkdir(dir, { recursive: true });

  const cards: string[] = [];
  for (let i = 0; i < count; i++) {
    const seed = (startSeed + i * SEED_STRIDE) >>> 0;
    // use the default grid so a gallery seed matches its `chart` / Explorer render
    const world = generateWorld(defaultRecipe(seed));
    const svg = renderMap(world, { style, widthPx: 900 });
    const file = `chart-${seed}.svg`;
    await writeFile(join(dir, file), svg, "utf8");
    cards.push(`<figure>
  <a href="${file}"><img src="${file}" loading="lazy" alt="${escapeXml(world.title.title)}"></a>
  <figcaption><strong>${escapeXml(world.title.title)}</strong><br>
  <span>seed ${seed} · ${world.recipe.mapType} · ${world.recipe.band}</span></figcaption>
</figure>`);
  }

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vellum gallery: ${count} worlds from seed ${startSeed}</title>
<link rel="stylesheet" href="/fonts.css">
<link rel="stylesheet" href="/motion.css">
<style>
${paletteRootCss()}
  body { margin: 0; padding: 2rem 1.5rem 4rem; background: var(--parchment); color: var(--ink-dark);
    font-family: var(--font-body, 'Iowan Old Style', 'Palatino', Georgia, serif); }
  /* The Punchcutter's Case (#228): display title, italic flourish subtitle. */
  h1 { text-align: center; letter-spacing: 0.05em;
    font-family: var(--font-display, 'Iowan Old Style', 'Palatino', Georgia, serif); }
  p.sub { text-align: center; font-style: italic; color: var(--ink-brown); margin-bottom: 2.5rem;
    font-family: var(--font-flourish, 'Iowan Old Style', 'Palatino', Georgia, serif); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
    gap: 1.5rem; max-width: 1500px; margin-inline: auto; }
  figure { margin: 0; }
  /* The contact-sheet tiles tip like loose plates in a drawer: picked up from a
     corner (transform-origin) with a real tilt, distinct from the atlas's gentle
     centred lift. Timing/easing come from /motion.css; the reduced-motion collapse
     there snaps this to its end state (no animated tip). */
  figure img { width: 100%; height: auto; display: block; border: 1px solid var(--line-tan);
    box-shadow: 0 6px 18px rgb(61 47 31 / 0.15); transform-origin: bottom left;
    transition: transform var(--paper) var(--ease-paper),
                box-shadow var(--paper) var(--ease-paper); }
  figure img:hover { transform: translateY(-4px) rotate(-1.4deg);
    box-shadow: 0 16px 34px rgb(61 47 31 / 0.26); }
  figure img:active { transform: translateY(-1px) rotate(0deg);
    box-shadow: 0 5px 14px rgb(61 47 31 / 0.16); }
  figcaption { text-align: center; padding-top: 0.5rem; line-height: 1.45; }
  figcaption span { font-size: 0.8rem; color: var(--ink-faded); letter-spacing: 0.08em; }
  a { color: inherit; text-decoration: none; }
</style>
</head>
<body>
<h1>A Gallery of Imaginary Worlds</h1>
<p class="sub">${count} charts drawn by Vellum, beginning at seed ${startSeed}</p>
<div class="grid">
${cards.join("\n")}
</div>
</body>
</html>
`;
  await writeFile(join(dir, "index.html"), html, "utf8");
  return dir;
}
