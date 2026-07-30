// The site's named parchment/ink palette (#263, extended at the PR #269
// review). The generated atlas and gallery cannot render through BaseLayout,
// and the single-file atlas download links nothing external, so each composed
// document declares these tokens in its own :root via paletteRootCss().
// test/site/shell-css.test.ts pins this module and BaseLayout's global style
// to the same names and values, so the two cannot drift apart.
export const SITE_PALETTE = {
  "--ink-dark": "#4a3826",
  "--ink-brown": "#6b5a40",
  "--ink-faded": "#857257",
  "--line-tan": "#b9a77f",
  "--parchment": "#efe6cf",
  "--parchment-panel": "#f4ecd8",
  "--parchment-bright": "#fff7e4",
  "--parchment-deep": "#e6d9b8",
  "--line-faint": "#cdbd97",
  // The Specimen Book (#324, ratified 2026-07-30). The manuscript journal's
  // three hands (#312 candidate D values, formerly duplicated raw across the
  // Explorer and the reading frame):
  "--ink-annals": "#3f3122",
  "--ink-surveyor": "#7a5f38",
  "--ink-surveyor-faded": "#99855f",
  // The control idiom's cream, press-down, and the featured link's golds
  // (#133/#199); the tale/note ink shared by place cards and atlas notes.
  "--control-cream": "#f8f1e0",
  "--ink-press": "#5d4831",
  "--control-gold": "#f0e3bd",
  "--control-gold-lit": "#f7edcd",
  "--ink-tale": "#54452f",
  // The site's ink red (hunt star, statuses), moved here from motion.css: it
  // is a color, not a timing.
  "--iron-red": "#7a1f12",
  // The --chart-* namespace: values QUOTED from the render side, named so the
  // exception declares itself. test/site/house-style.test.ts asserts each
  // equals the render/style.ts constant it quotes; a divergence there is a
  // render-side change that owes a conscious re-quote, never a silent drift.
  "--chart-paper": "#f2e8cf",
  "--chart-ink": "#3d2f1f",
} as const;

export function paletteRootCss(): string {
  const lines = Object.entries(SITE_PALETTE).map(([name, hex]) => `  ${name}: ${hex};`);
  return `:root {\n${lines.join("\n")}\n}`;
}
