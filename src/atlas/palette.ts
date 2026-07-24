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
} as const;

export function paletteRootCss(): string {
  const lines = Object.entries(SITE_PALETTE).map(([name, hex]) => `  ${name}: ${hex};`);
  return `:root {\n${lines.join("\n")}\n}`;
}
