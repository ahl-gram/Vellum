// Which gate an edit owes, read by footgun-gate.ts; the routes and their reasons are in README.md, and the rows that pin them are gate-routes.fixtures.ts.
type Gate = readonly [stateKey: string, label: string];
const GUARD: Gate = ["guard", "Gate 1"];

const EDIT_GATES: [RegExp, readonly Gate[]][] = [
  [/(^|\/)(test\/(repo|site)\/.*\.test|test-support\/[^/]+)\.ts$/, [GUARD, ["scan", "Gate 7"]]],
  [/(^|\/)test\/.*\.test\.ts$/, [GUARD]],
  [/(^|\/)(scripts|out|e2e)\/.*\.mjs$|(^|\/)(e2e|out)\/.*\.ts$/, [["e2e", "Gate 2"]]],
  [/\.(css|astro)$/, [["css", "Gate 3"]]],
  [/(^|\/)(src\/(render|world|society|core|noise|terrain|climate|hydrology)\/|src\/(atlas\/palette|cli\/raster)\.ts$|public\/(charts\/|og\.png$|favicon\.svg$|apple-touch-icon\.png$)|design\/kit\/fonts\/|scripts\/(hero-charts|regen-hero-charts|build-og|build-icons|glyph-outline|kit-fonts)\.ts$)/, [["render", "Gate 6"]]], // derived by walking imports, not guessed: src/render, generateWorld's seven-dir closure, the committed artifacts, and every module their writers reach
];
export const ROSTER_NEW_FILE = /(^|\/)(src\/pages\/|src\/site\/|e2e\/suites\/[^/]+\.ts$|public\/[^/]+\.css$)/;
export const UNIT_TEST = /\.test\.ts$/;

export const dueGate = (path: string, shown: ReadonlySet<string>): Gate | undefined =>
  EDIT_GATES.find(([pattern]) => pattern.test(path))?.[1].find(([stateKey]) => !shown.has(stateKey));
