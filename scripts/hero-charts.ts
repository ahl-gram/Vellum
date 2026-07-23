import { defaultRecipe, generateWorld } from "../src/world/generate.ts";
import { renderMap } from "../src/render/map-renderer.ts";
import { armsSvgDocument, paletteForStyle } from "../src/render/layers/heraldry.ts";
import { STYLES } from "../src/render/style.ts";

/**
 * Single source of truth for the committed `docs/charts/*.svg` showcase: the
 * hero seed's four style charts plus its realm-arms strip for the landing page.
 *
 * Both `scripts/regen-hero-charts.ts` (which WRITES these files on a re-roll /
 * hero refresh, via `npm run charts:regen`) and the drift guard
 * `test/site/hero-charts.test.ts` (which byte-compares the committed files
 * against a fresh render) call this one function, so the two can never disagree
 * on how a hero chart is drawn. A render change that alters seed 42 now fails
 * the guard until `npm run charts:regen` regenerates.
 */

export const HERO_SEED = 42;
const HERO_STYLES = ["antique", "topographic", "ink", "nautical"] as const;
const ARMS_SIZE = 150;

/** Every committed hero SVG, keyed by its `docs/charts/` filename -> SVG text. */
export function heroChartSvgs(): Map<string, string> {
  const out = new Map<string, string>();
  const hero = generateWorld(defaultRecipe(HERO_SEED));
  for (const style of HERO_STYLES) {
    out.set(`chart-${HERO_SEED}-${style}.svg`, renderMap(hero, { style, legend: true }));
  }
  // the hero world's realm arms, for the landing page "Arms of the Realms" strip
  const armsPalette = paletteForStyle(STYLES.antique);
  for (let i = 0; i < hero.arms.length; i++) {
    out.set(
      `arms-${HERO_SEED}-${i}.svg`,
      armsSvgDocument(hero.arms[i]!, ARMS_SIZE, armsPalette, `hero${i}`),
    );
  }
  return out;
}
