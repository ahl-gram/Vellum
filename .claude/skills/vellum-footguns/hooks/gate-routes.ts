// Which gate an edit owes, read by footgun-gate.ts; the routes and their reasons are in README.md, and the rows that pin them are gate-routes.fixtures.ts.
export const EDIT_GATES: [string, RegExp, string][] = [
  ["guard", /(^|\/)test\/.*\.test\.ts$/, "Gate 1"],
  ["e2e", /(^|\/)(scripts|out|e2e)\/.*\.mjs$|(^|\/)(e2e|out)\/.*\.ts$/, "Gate 2"],
  ["css", /\.(css|astro)$/, "Gate 3"],
  ["render", /(^|\/)(src\/(render|world|society|core|noise|terrain|climate|hydrology)\/|src\/(atlas\/palette|cli\/raster)\.ts$|public\/(charts\/|og\.png$|favicon\.svg$|apple-touch-icon\.png$)|design\/kit\/fonts\/|scripts\/(hero-charts|regen-hero-charts|build-og|build-icons|glyph-outline|kit-fonts)\.ts$)/, "Gate 6"], // derived by walking imports, not guessed: src/render, generateWorld's seven-dir closure, the committed artifacts, and every module their writers reach
];
export const ROSTER_NEW_FILE = /(^|\/)(src\/pages\/|src\/site\/|e2e\/suites\/[^/]+\.ts$|public\/[^/]+\.css$)/;
export const UNIT_TEST = /\.test\.ts$/;
