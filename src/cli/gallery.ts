import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { renderMap } from "../render/map-renderer.ts";
import { escapeXml } from "../render/svg.ts";
import type { StyleName } from "../render/style.ts";
import { createProjection, marginFor } from "../render/transform.ts";
import { defaultRecipe, generateWorld } from "../world/generate.ts";

export const GALLERY_SEED = 100;
export const GALLERY_COUNT = 12;
export const GALLERY_PLATE_WIDTH = 900;

const SEED_STRIDE = 7919; // a prime walk through seed space

export interface GalleryCard {
  readonly seed: number;
  readonly file: string;
  readonly title: string;
  readonly mapType: string;
  readonly band: string;
  /** MUST equal the svg root's rounded width/height (map-renderer.ts rounds the same projection). */
  readonly width: number;
  readonly height: number;
}

export function gallerySeeds(startSeed: number, count: number): readonly number[] {
  return Array.from({ length: count }, (_, i) => (startSeed + i * SEED_STRIDE) >>> 0);
}

const cardsMemo = new Map<string, readonly GalleryCard[]>();

export function galleryCards(startSeed: number, count: number): readonly GalleryCard[] {
  const key = `${startSeed}:${count}`;
  const memo = cardsMemo.get(key);
  if (memo) return memo;
  const cards = gallerySeeds(startSeed, count).map((seed) => {
    const world = generateWorld(defaultRecipe(seed));
    const proj = createProjection(
      world.elev.w,
      world.elev.h,
      GALLERY_PLATE_WIDTH,
      marginFor(GALLERY_PLATE_WIDTH),
    );
    return {
      seed,
      file: `chart-${seed}.svg`,
      title: world.title.title,
      mapType: world.recipe.mapType,
      band: world.recipe.band,
      width: Math.round(proj.widthPx),
      height: Math.round(proj.heightPx),
    };
  });
  cardsMemo.set(key, cards);
  return cards;
}

export function cardFigureHtml(card: GalleryCard): string {
  return `<figure>
  <a href="/explorer/#seed=${card.seed}&amp;style=antique&amp;legend=0"><img src="${card.file}" width="${card.width}" height="${card.height}" loading="lazy" decoding="async" alt="${escapeXml(card.title)}"></a>
  <figcaption><strong>${escapeXml(card.title)}</strong><br>
  <span>seed ${card.seed} · ${card.mapType} · ${card.band}</span></figcaption>
</figure>`;
}

/* Sub 9 (#464): the Gallery hangs its twelve plates on the deep, a chart room without a stage; the furniture is /atelier.css's, this sheet keeps the plates' layout. Shipped verbatim as public/gallery/index.css: no process prose here (test/site/gallery-room.test.ts carries the measurements). */
export const GALLERY_PAGE_CSS = `html:has(body.chart-room), body.chart-room { height: auto; overflow: visible; }
main { max-width: 1500px; box-sizing: border-box; padding: calc(var(--band-h) + 1.2rem) 2.2rem 9.5rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 2.4rem 2rem;
  animation: sheet-land 0.55s cubic-bezier(0.2, 0.7, 0.3, 1) both; }
figure { margin: 0; }
figure img { width: 100%; height: auto; display: block; border: 1px solid var(--line-tan);
  box-shadow: var(--sheet-shadow); transform-origin: bottom left;
  transition: transform var(--paper) var(--ease-paper),
              box-shadow var(--paper) var(--ease-paper); }
figure img:hover { transform: translateY(-4px) rotate(-1.4deg); box-shadow: var(--stage-shadow); }
figure img:active { transform: translateY(-1px) rotate(0deg); box-shadow: var(--sheet-shadow); }
figcaption { text-align: center; padding-top: 0.6rem; line-height: 1.45; color: var(--parchment); }
figcaption strong { font-family: var(--font-display, 'Iowan Old Style', 'Palatino', Georgia, serif); font-weight: 400; font-size: 0.92rem; letter-spacing: 0.08em; color: var(--parchment-bright); }
figcaption span { font-variant-caps: small-caps; font-size: 0.8rem; letter-spacing: 0.08em; }
.grid a { color: inherit; text-decoration: none; display: block; position: relative; }
.grid a::before { content: "Drafting…"; position: absolute; inset: 0; z-index: -1;
  display: grid; place-items: center; background: var(--parchment-panel);
  font-style: italic; color: var(--ink-faded); }
.legend { left: 50%; }
@media (max-width: 900px) {
  main { padding: calc(var(--band-h) + 0.8rem) 1rem 8rem; }
  .legend { display: block; }
}
@media print {
  main { padding: 0; max-width: none; }
  .grid { animation: none; }
  figure img { box-shadow: none; }
  figcaption { color: var(--ink-dark); }
  figcaption strong { color: var(--ink-dark); }
  figcaption span { color: var(--ink-brown); }
}
`;

export async function buildGallery(
  startSeed: number,
  opts: { count?: number; style?: StyleName; out?: string } = {},
): Promise<string> {
  const count = Math.min(opts.count ?? GALLERY_COUNT, 48);
  const style = opts.style ?? "antique";
  const dir = resolve(opts.out ?? `out/gallery-${startSeed}`);
  await mkdir(dir, { recursive: true });

  for (const seed of gallerySeeds(startSeed, count)) {
    const world = generateWorld(defaultRecipe(seed));
    const svg = renderMap(world, { style, widthPx: GALLERY_PLATE_WIDTH });
    await writeFile(join(dir, `chart-${seed}.svg`), svg, "utf8");
  }
  await writeFile(join(dir, "index.css"), GALLERY_PAGE_CSS, "utf8");
  return dir;
}
