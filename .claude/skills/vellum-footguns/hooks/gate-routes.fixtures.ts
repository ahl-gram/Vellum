// The edit-routing rows (gate-routes.ts), as data: footgun-gate.selftest.ts fills <ROOT> (the checkout), sends each row's text as the Write's content or the Edit's new string, and reads the decision for the needle and the absent text.
export type RouteRow = readonly [name: string, tool: "Edit" | "Write", path: string, text: string, want: "context" | null, needle: string, absent?: string];

const GATE6_ARMS: [string, string][] = [
  ["render", "src/render/style.ts"], ["world", "src/world/generate.ts"], ["society", "src/society/history.ts"],
  ["core", "src/core/grid.ts"], ["noise", "src/noise/simplex.ts"], ["terrain", "src/terrain/heightfield.ts"],
  ["climate", "src/climate/wind.ts"], ["hydrology", "src/hydrology/rivers.ts"],
  ["atlas/palette", "src/atlas/palette.ts"], ["cli/raster", "src/cli/raster.ts"],
  ["charts/", "public/charts/chart-42-antique.svg"], ["og.png", "public/og.png"],
  ["favicon.svg", "public/favicon.svg"], ["apple-touch-icon.png", "public/apple-touch-icon.png"],
  ["hero-charts", "scripts/hero-charts.ts"], ["regen-hero-charts", "scripts/regen-hero-charts.ts"],
  ["build-og", "scripts/build-og.ts"], ["build-icons", "scripts/build-icons.ts"],
  ["glyph-outline", "scripts/glyph-outline.ts"], ["kit-fonts", "scripts/kit-fonts.ts"],
  ["design/kit/fonts/", "design/kit/fonts/im-fell-english-sc-latin-400-normal.woff2"],
];

export const ROUTE_ROWS: ReadonlyArray<RouteRow> = [
  ["the lane driver gets gate 2", "Edit", "e2e/lanes.ts", "x", "context", "## Gate 2"],
  ["the runner gets gate 2", "Edit", "e2e/run.ts", "x", "context", "## Gate 2"],
  ["a moved e2e helper that was under src/cli gets gate 2", "Edit", "e2e/support/suites.ts", "x", "context", "## Gate 2"],
  ["the retired runner path under scripts/ gets no gate 2", "Edit", "scripts/e2e-lanes.ts", "x", null, ""],
  ["a scripts .mjs draft still gets gate 2", "Write", "scripts/draft.mjs", "x", "context", "## Gate 2"],
  ["an e2e .mjs draft gets gate 2 as well", "Write", "e2e/draft.mjs", "x", "context", "## Gate 2"],
  ["a unit test under test/e2e gets gate 1, the first match", "Edit", "test/e2e/lanes.test.ts", "x", "context", "## Gate 1"],
  ["a non-e2e scripts .ts gets no gate 2", "Edit", "scripts/agent-sandbox.ts", "x", null, ""],
  ["unit test file gets gate 1", "Edit", "test/site/thing.test.ts", "assert.ok(1);", "context", "## Gate 1"],
  ["stylesheet gets gate 3", "Edit", "public/atelier.css", ".a { color: red }", "context", "## Gate 3"],
  ["new page gets gate 4", "Write", "src/pages/never-exists-zz/index.astro", "---\n---", "context", "## Gate 4"],
  ["a new e2e suite gets gate 4", "Write", "e2e/suites/never-exists-zz.ts", "x", "context", "## Gate 4"],
  ["a new part in a suite's folder gets gate 2 and no gate 4", "Write", "e2e/suites/never-exists-zz/part.ts", "x", "context", "## Gate 2", "## Gate 4"],
  ["a new unit test under test/e2e/suites gets gate 1 and no gate 4", "Write", "test/e2e/suites/never-exists-zz.test.ts", "x", "context", "## Gate 1", "## Gate 4"],
  ["a new unit test under test/src/site gets gate 1 and no gate 4", "Write", "test/src/site/never-exists-zz.test.ts", "x", "context", "## Gate 1", "## Gate 4"],
  ["a new unit test under test/src/pages gets gate 1 and no gate 4", "Write", "test/src/pages/never-exists-zz.test.ts", "x", "context", "## Gate 1", "## Gate 4"],
  ["a new unit test on the absolute path a real call passes gets gate 1 and no gate 4", "Write", "<ROOT>/test/src/site/never-exists-zz.test.ts", "x", "context", "## Gate 1", "## Gate 4"],
  ["a new unit test beside a suite gets gate 2 and no gate 4", "Write", "e2e/suites/never-exists-zz.test.ts", "x", "context", "## Gate 2", "## Gate 4"],
  ["a new unit test beside a site module gets no gate at all", "Write", "src/site/never-exists-zz.test.ts", "x", null, ""],
  ["a new unit test beside a page gets no gate at all", "Write", "src/pages/never-exists-zz.test.ts", "x", null, ""],
  ["a new suite whose name ends in test still gets gate 4", "Write", "e2e/suites/never-exists-latest.ts", "x", "context", "## Gate 4"],
  ["a new site module whose name ends in test still gets gate 4", "Write", "src/site/a-room/never-exists-contest.ts", "x", "context", "## Gate 4"],
  // One fixture per ARM of the Gate 6 regex, because a roster is only as good as its least-swept alternative: the prover found 10 of 19 arms had no fixture, so a typo in any of them shipped silent.
  ...GATE6_ARMS.map(([arm, path]): RouteRow => [`gate 6 arm: ${arm}`, "Edit", path, "x", "context", "## Gate 6"]),
  ["gate 6 on the ABSOLUTE path a real tool call passes", "Edit", "<ROOT>/src/render/style.ts", "x", "context", "## Gate 6"],
  ["an earlier gate still wins a path that matches BOTH", "Edit", "src/render/x.css", ".a{}", "context", "## Gate 3"],
  ["site source is not chart work", "Edit", "src/site/explorer/app.ts", "const x = 1;", null, ""],
  ["a cli module other than the rasteriser is not chart work", "Edit", "src/cli/main.ts", "x", null, ""],
];

// Gate 7's rows (Issue #782): the selftest edits each row's paths in order in one session and judges the last decision.
export type SequenceRow = readonly [name: string, paths: readonly string[], want: "context" | null, needle: string, absent?: string];

const REPO = "test/repo/never-exists-zz.test.ts";
const SITE = "test/site/never-exists-zz.test.ts";
const RENDER = "test/render/never-exists-zz.test.ts";

export const SEQUENCE_ROWS: ReadonlyArray<SequenceRow> = [
  ["a first edit to a test under test/repo gets gate 1 and not gate 7", [REPO], "context", "## Gate 1", "## Gate 7"],
  ["a second edit to a test under test/repo gets gate 7 and not gate 1", [REPO, REPO], "context", "## Gate 7", "## Gate 1"],
  ["a second edit to a test under test/site gets gate 7 and not gate 1", [SITE, SITE], "context", "## Gate 7", "## Gate 1"],
  ["a second edit to a test-support helper gets gate 7 and not gate 1", ["test-support/never-exists-zz.ts", "test-support/never-exists-zz.ts"], "context", "## Gate 7", "## Gate 1"],
  ["a second edit on the absolute path a real call passes gets gate 7", [`<ROOT>/${SITE}`, `<ROOT>/${SITE}`], "context", "## Gate 7", "## Gate 1"],
  ["an edit under test/site after gate 1 was shown for test/render gets gate 7 at once", [RENDER, SITE], "context", "## Gate 7", "## Gate 1"],
  ["a third edit to a test under test/repo gets nothing", [REPO, REPO, REPO], null, ""],
  ["a second edit to a test under test/render gets nothing", [RENDER, RENDER], null, ""],
  ["a second edit to a test under test/src/site gets nothing", ["test/src/site/never-exists-zz.test.ts", "test/src/site/never-exists-zz.test.ts"], null, ""],
  ["a second edit to a unit test under test/e2e gets nothing, not gate 2", ["test/e2e/never-exists-zz.test.ts", "test/e2e/never-exists-zz.test.ts"], null, ""],
  ["a helper one folder down in test-support gets no gate, as ruled", ["test-support/a-folder/never-exists-zz.ts"], null, ""],
  ["a file in test-support that only begins like a helper gets no gate", ["test-support/never-exists-zz.ts.orig"], null, ""],
];
