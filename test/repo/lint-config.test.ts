import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Linter } from "eslint";
import lintConfig from "../../eslint.config.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const blocks: readonly Linter.Config[] = lintConfig;
const nameOf = (b: Linter.Config): string => (b.name ?? "(unnamed)").replace(/^.* > /, "");

test("every block lets ESLint parse the program it lints: no block carries a processor, only the stylesheet block names a language, and only typescript-eslint's base layer names a parser (Issue #728)", () => {
  assert.ok(blocks.length > 0, "the config exports no blocks, so this guard is reading the wrong thing");
  assert.deepEqual(
    blocks.filter((b) => "processor" in b).map(nameOf),
    [],
    "a block hands its files to a processor, which can give ESLint no program for a subtree and pass every rule there unread",
  );
  assert.deepEqual(
    blocks.filter((b) => "language" in b).map((b) => b.files),
    [["public/**/*.css"]],
    "a block other than the stylesheet block names a language, so the files it matches are parsed as something the TypeScript rules never read",
  );
  assert.deepEqual(
    blocks.filter((b) => b.languageOptions?.parser !== undefined).map(nameOf),
    ["typescript-eslint/base"],
    "a block other than typescript-eslint's base layer sets a parser, which can swap the program the type-checked rules read for a subtree",
  );
});

test("no tracked file sits under a root .gitignore pattern, so the ignore list the lint reads hides nothing git tracks (Issue #728)", () => {
  const listed = spawnSync("git", ["ls-files", "-z", "-ci", "--exclude-from=.gitignore"], {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 30_000,
  });
  assert.equal(listed.status, 0, `git ls-files failed: ${listed.stderr}`);
  assert.deepEqual(
    listed.stdout.split("\0").filter(Boolean),
    [],
    "git tracks a file the root .gitignore matches, so the lint, which takes its ignores from that file, never reads it; untrack it or narrow the pattern. BLIND SPOT, declared: git's matching and includeIgnoreFile's translation of the same file could disagree on an unusual pattern, in either direction",
  );
});

const SIZE_CAPS = ["max-lines", "max-lines-per-function"];

const LIST_AT_REFORMAT: Readonly<Record<string, readonly [number, number]>> = {
  "e2e/harness.ts": [0, 1],
  "e2e/split-proof.ts": [1, 0],
  "e2e/suites/cards/cap.ts": [0, 3],
  "e2e/suites/cards/hold.ts": [1, 2],
  "e2e/suites/cards/overlay.ts": [0, 1],
  "e2e/suites/chart-drawer/drag.ts": [0, 2],
  "e2e/suites/chart-drawer/floor.ts": [0, 1],
  "e2e/suites/chart-drawer/homes.ts": [0, 1],
  "e2e/suites/chart-drawer/prospect.ts": [0, 4],
  "e2e/suites/corners/floor.ts": [1, 0],
  "e2e/suites/document-rooms.ts": [0, 1],
  "e2e/suites/fallback.ts": [0, 1],
  "e2e/suites/glass-ceremony.ts": [0, 1],
  "e2e/suites/home/stations.ts": [0, 1],
  "e2e/suites/hunt.ts": [1, 0],
  "e2e/suites/landfall/clamps.ts": [0, 1],
  "e2e/suites/landfall/controls.ts": [0, 1],
  "e2e/suites/landfall/kit.ts": [0, 2],
  "e2e/suites/landfall/page.ts": [0, 1],
  "e2e/suites/landfall/seed.ts": [0, 1],
  "e2e/suites/landfall/touch.ts": [0, 1],
  "e2e/suites/motion.ts": [0, 1],
  "e2e/suites/print-room/atlas.ts": [0, 3],
  "e2e/suites/print-room/link.ts": [0, 1],
  "e2e/suites/print-room/plates.ts": [0, 1],
  "e2e/suites/print-room/print.ts": [0, 2],
  "e2e/suites/print-room/redraw.ts": [0, 1],
  "e2e/suites/prospect.ts": [1, 3],
  "e2e/suites/reading-room/arm.ts": [0, 1],
  "e2e/suites/reading-room/colophon.ts": [0, 1],
  "e2e/suites/reading-room/kit.ts": [0, 1],
  "e2e/suites/render.ts": [0, 1],
  "e2e/suites/ribbon.ts": [0, 1],
  "e2e/suites/room-ink.ts": [0, 1],
  "e2e/suites/room-voyage-route.ts": [0, 2],
  "e2e/suites/runninghead/gallery.ts": [0, 1],
  "e2e/suites/specimen/desktop.ts": [0, 1],
  "e2e/suites/stage/short.ts": [0, 2],
  "e2e/suites/stage/stage.ts": [1, 0],
  "e2e/suites/survey/beat.ts": [0, 3],
  "e2e/suites/survey/mount.ts": [0, 2],
  "e2e/suites/survey/turn.ts": [0, 2],
  "e2e/suites/turn.ts": [0, 1],
  "e2e/suites/zoom-gestures.ts": [0, 1],
  "e2e/suites/zoom/bands.ts": [0, 1],
  "e2e/suites/zoom/kit.ts": [0, 1],
  "e2e/suites/zoom/resets.ts": [0, 1],
  "e2e/support/pace.ts": [0, 1],
  "scripts/lint/source-shape.ts": [1, 0],
  "scripts/region-detail-probes.ts": [0, 1],
  "scripts/region-detail-sweep-measure.ts": [0, 2],
  "scripts/region-detail-sweep.ts": [0, 1],
  "src/itinerary/dress/plate.ts": [0, 1],
  "src/itinerary/dress/strip.ts": [0, 1],
  "src/itinerary/events.ts": [0, 1],
  "src/prospect/dress/compose-e.ts": [0, 1],
  "src/prospect/dress/figures.ts": [1, 0],
  "src/prospect/dress/furniture.ts": [1, 0],
  "src/prospect/dress/rise.ts": [1, 2],
  "src/prospect/dress/townscape.ts": [1, 6],
  "src/render/layers/feature-labels.ts": [0, 1],
  "src/render/layers/frame.ts": [0, 1],
  "src/render/layers/legend-icons.ts": [0, 3],
  "src/render/layers/legend.ts": [0, 1],
  "src/site/explorer/app.ts": [1, 1],
  "src/site/explorer/chart-drawer-bind.ts": [0, 2],
  "src/site/explorer/lod-controller.ts": [0, 1],
  "src/site/explorer/sheet-turn.ts": [0, 1],
  "src/site/explorer/table-drag.ts": [0, 1],
  "src/site/explorer/verso.ts": [0, 1],
  "src/site/living-chart/place-overlay.ts": [1, 1],
  "src/site/print-room/app.ts": [0, 1],
  "src/site/print-room/contents-markup.ts": [0, 1],
  "src/site/reading-room/prospect-stage.ts": [0, 1],
  "src/society/names.ts": [1, 0],
  "src/terrain/contours.ts": [0, 1],
  "test/e2e/launch.test.ts": [1, 0],
  "test/e2e/suites.test.ts": [0, 1],
  "test/prospect/plate-e-world.test.ts": [0, 2],
  "test/repo/agent-sandbox-mutate.test.ts": [0, 2],
  "test/repo/agent-sandbox.test.ts": [1, 0],
  "test/repo/design-kit.test.ts": [1, 0],
  "test/repo/e2e-split-proof.test.ts": [1, 1],
  "test/repo/e2e-tiers.test.ts": [0, 1],
  "test/repo/footgun-gate.test.ts": [1, 0],
  "test/repo/lint-wiring.test.ts": [1, 2],
  "test/repo/prose-paths.test.ts": [0, 1],
  "test/repo/source-shape.test.ts": [1, 1],
  "test/site/app-bundles.test.ts": [0, 1],
  "test/site/astro-scaffold.test.ts": [0, 2],
  "test/site/atelier-kit.test.ts": [0, 1],
  "test/site/chart-drawer.test.ts": [1, 1],
  "test/site/contents-row.test.ts": [0, 1],
  "test/site/gallery-room.test.ts": [0, 1],
  "test/site/house-style.test.ts": [0, 1],
  "test/site/hunt-zoom.test.ts": [0, 1],
  "test/site/living-chart-css.test.ts": [0, 1],
  "test/site/living-chart-no-bar-card.test.ts": [1, 1],
  "test/site/print-room-contents.test.ts": [0, 1],
  "test/site/print-room-room.test.ts": [1, 1],
  "test/site/prospect-room.test.ts": [1, 2],
  "test/site/ribbon-room.test.ts": [0, 2],
  "test/site/room.test.ts": [0, 1],
  "test/site/table-address.test.ts": [1, 0],
};

const readList = (): Record<string, Record<string, { count: number }>> => {
  const file = join(ROOT, "eslint-suppressions.json");
  assert.ok(
    existsSync(file),
    "eslint-suppressions.json is missing, so the overruns the reformat made fail the lint or were lifted some other way",
  );
  return JSON.parse(readFileSync(file, "utf8")) as Record<string, Record<string, { count: number }>>;
};

test("eslint-suppressions.json lists only the two size caps, each over a tracked file, so the list of overruns Alex ruled holds nothing else and names no file that is gone (Alex, 2026-10-07, Issue #779)", () => {
  const list = readList();
  const listed = spawnSync("git", ["ls-files", "-z"], { cwd: ROOT, encoding: "utf8", timeout: 30_000 });
  assert.equal(listed.status, 0, `git ls-files failed: ${listed.stderr}`);
  const tracked = new Set(listed.stdout.split("\0").filter(Boolean));
  assert.ok(
    Object.keys(list).length > 0,
    "the list is empty, so either every overrun was split (delete the file, its rulebook paragraph and this test) or this reader is looking at the wrong shape",
  );
  assert.deepEqual(
    Object.keys(list).filter((f) => !tracked.has(f)),
    [],
    "the list names a file git does not track; ESLint refuses a stale entry only for a file it lints, so remove the entry by hand",
  );
  assert.deepEqual(
    Object.entries(list).flatMap(([f, rules]) =>
      Object.keys(rules)
        .filter((r) => !SIZE_CAPS.includes(r))
        .map((r) => `${f}: ${r}`),
    ),
    [],
    "the list suppresses a rule other than the two size caps, which nobody ruled; fix the code or put the skip to Alex",
  );
});

test("eslint-suppressions.json only shrinks: no file joins it, and no file's count for either cap passes its count at the reformat (Alex, 2026-10-07, Issue #779)", () => {
  const grown = Object.entries(readList()).flatMap(([file, rules]) => {
    const [lines, functions] = LIST_AT_REFORMAT[file] ?? [0, 0];
    const now = [rules["max-lines"]?.count ?? 0, rules["max-lines-per-function"]?.count ?? 0] as const;
    return now[0] > lines || now[1] > functions
      ? [`${file}: ${now.join(", ")} against ${lines}, ${functions} at the reformat`]
      : [];
  });
  assert.deepEqual(
    grown,
    [],
    "a file joined the list or a count grew, so an overrun nobody ruled was recorded, most likely by a re-run of eslint --suppress-rule: split the code instead. A split lowers its file's entry here in the same change. BLIND SPOTS, declared, erring toward passing: the list counts overruns, not sizes, so a listed file or function that grows while already over its cap passes; and an entry here left above its file's count lets a new overrun in that file return up to it",
  );
});
