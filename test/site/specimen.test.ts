import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { NAV_ITEMS } from "../../src/layouts/nav.ts";
import { DISCOVERY_ROUTES } from "../../scripts/generate-discovery.ts";

// The Specimen Book (#487 item 4, cut at #465 ruling 6): every piece of the Atelier Kit at its real seat on one chart-room page, the closing review's screenshot oracle and the live sitting's bench. Off the nav, off the sitemap, unindexed.
const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");
const PAGE = "src/pages/specimen/index.astro";

test("SB1 the route is a chart room off the nav, off the sitemap and unindexed", () => {
  assert.ok(existsSync(resolve(REPO, PAGE)), "the page exists");
  const src = read(PAGE);
  assert.match(src, /path="\/specimen\/"/);
  assert.match(src, /\bchartRoom\b/);
  assert.match(src, /\bnoindex\b/);
  assert.ok(!NAV_ITEMS.some((i) => i.href === "/specimen/"), "not a room in the nav");
  assert.ok(!DISCOVERY_ROUTES.includes("/specimen/"), "not in the sitemap, robots.txt or llms.txt");
  const layout = read("src/layouts/BaseLayout.astro");
  assert.match(layout, /noindex\?: true/, "the shell takes the flag");
  assert.match(layout, /\{noindex && <meta name="robots" content="noindex">\}/, "and renders the robots meta for it alone");
});

test("SB2 the page stands every kit component from the kit, in every state the dress can show", () => {
  const src = read(PAGE);
  for (const c of ["Fog", "Vignettes", "ChartStage", "Glass", "ChartFolio", "LegendButton", "Slip", "RoomFolio"]) {
    assert.match(src, new RegExp(`import ${c} from "\\.\\./\\.\\./layouts/${c}\\.astro"`), `${c} is imported from the kit`);
    assert.match(src, new RegExp(`<${c}\\b`), `${c} is rendered`);
  }
  assert.match(src, /<LegendButton [^>]*\bgold\b/, "a gold road");
  assert.match(src, /<LegendButton (?![^>]*\bgold\b)[^>]*href=/, "a plain road");
  assert.match(src, /<button class="legend-btn" type="button" disabled>/, "a disabled press in the legend dress (the Print Room's poster shape)");
  assert.match(src, /<Fragment slot="foot">/, "the slip's foot");
  assert.match(src, /contentsRowHtml/, "the contents rows come from the kit's builder");
  assert.match(src, /<ol class="index">/, "the index's shape");
  for (const state of ["inked", "now", "hit"]) assert.match(src, new RegExp(`class="[^"]*\\b${state}\\b`), `the index shows ${state}`);
  assert.match(src, /<p class="status" id="sb-status"[^>]*>[^<]+</, "the status pill carries text, so it shows (:empty hides it)");
  for (const c of ["control", "dice", "primary"]) assert.match(src, new RegExp(`class="${c}"`), `the corner's ${c}`);
  assert.match(src, /<select id="sb-state" class="control"/, "the room's one live control: the state");
});

test("SB3 the conductor is a bundle twin like every chart room's, wired through the kit's own binders", () => {
  const app = read("src/site/specimen/app.ts");
  for (const m of ["bindRoom", "createZoomController", "bindGlassKeys"]) assert.ok(app.includes(m), `app.ts uses ${m}`);
  assert.match(read("scripts/build-app-bundles.ts"), /\{ entry: "src\/site\/specimen\/app\.ts", twin: "specimen\/app\.bundle\.js" \}/);
  assert.match(read("scripts/clean-public-generated.ts"), /"specimen\/app\.bundle\.js"/);
  assert.match(read(".gitignore"), /^public\/specimen\/app\.bundle\.js$/m);
  assert.match(read(PAGE), /<script type="module" src="\.\/app\.bundle\.js" is:inline><\/script>/);
});
