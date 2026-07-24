import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { renderMap } from "../render/map-renderer.ts";
import { escapeXml } from "../render/svg.ts";
import type { StyleName } from "../render/style.ts";
import { defaultRecipe, generateWorld } from "../world/generate.ts";

/** The ratified contact sheet the deploy generates for /gallery/ (#205 decision D). */
export const GALLERY_SEED = 100;
export const GALLERY_COUNT = 12;

const SEED_STRIDE = 7919; // a prime walk through seed space

export interface GalleryCard {
  readonly seed: number;
  readonly file: string;
  readonly title: string;
  readonly mapType: string;
  readonly band: string;
}

export function gallerySeeds(startSeed: number, count: number): readonly number[] {
  return Array.from({ length: count }, (_, i) => (startSeed + i * SEED_STRIDE) >>> 0);
}

// The gallery page's frontmatter asks for the same cards on every dev-server
// render; worlds are deterministic, so memoizing the pure result is safe.
const cardsMemo = new Map<string, readonly GalleryCard[]>();

export function galleryCards(startSeed: number, count: number): readonly GalleryCard[] {
  const key = `${startSeed}:${count}`;
  const memo = cardsMemo.get(key);
  if (memo) return memo;
  const cards = gallerySeeds(startSeed, count).map((seed) => {
    const world = generateWorld(defaultRecipe(seed));
    return {
      seed,
      file: `chart-${seed}.svg`,
      title: world.title.title,
      mapType: world.recipe.mapType,
      band: world.recipe.band,
    };
  });
  cardsMemo.set(key, cards);
  return cards;
}

/**
 * One contact-sheet card. The /gallery/ Astro page composes its content from
 * exactly this markup (#268 re-shell), so the figures the site shows are the
 * standalone gallery's figures, adopted unchanged.
 */
export function cardFigureHtml(card: GalleryCard): string {
  return `<figure>
  <a href="${card.file}"><img src="${card.file}" loading="lazy" alt="${escapeXml(card.title)}"></a>
  <figcaption><strong>${escapeXml(card.title)}</strong><br>
  <span>seed ${card.seed} · ${card.mapType} · ${card.band}</span></figcaption>
</figure>`;
}

// The page css the composer writes beside the SVGs: the page-specific rules
// the old standalone shell carried. The shell rules and palette arrive
// through BaseLayout since #263/#268, consumed here as var().
export const GALLERY_PAGE_CSS = `body { padding: 2rem 1.5rem 4rem; }
main { max-width: 1500px; }
header { margin-bottom: 2rem; }
p.sub { text-align: center; font-style: italic; color: var(--ink-brown); margin-bottom: 2.5rem;
  font-family: var(--font-flourish, 'Iowan Old Style', 'Palatino', Georgia, serif); }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 1.5rem; }
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
.grid a { color: inherit; text-decoration: none; }
footer { margin-top: 3rem; }
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
    // use the default grid so a gallery seed matches its `chart` / Explorer render
    const world = generateWorld(defaultRecipe(seed));
    const svg = renderMap(world, { style, widthPx: 900 });
    await writeFile(join(dir, `chart-${seed}.svg`), svg, "utf8");
  }
  await writeFile(join(dir, "index.css"), GALLERY_PAGE_CSS, "utf8");
  return dir;
}
