import { test, before } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";
import { NAV_ITEMS } from "../../src/layouts/nav.ts";
import { CULTURES } from "../../src/society/names.ts";
import {
  FLOOR,
  all,
  sectionsOf,
  shapeFaults,
  sheetOf,
  slipOf,
  text,
} from "../../test-support/built-reads/documents.ts";

process.env.ASTRO_TELEMETRY_DISABLED = "1";

const root = (p = ""): string => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const BASE = root("out/test-built-pages");
const DIST = join(BASE, "dist");
const built = new Map<string, string>();

const pagesUnder = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? pagesUnder(join(dir, e.name)) : e.name === "index.html" ? [join(dir, e.name)] : [],
  );

before(
  async () => {
    rmSync(BASE, { recursive: true, force: true });
    mkdirSync(join(BASE, "public"), { recursive: true });
    const { build } = await import("astro");
    await build({
      root: root(),
      outDir: DIST,
      publicDir: join(BASE, "public"),
      cacheDir: join(BASE, "cache"),
      vite: { cacheDir: join(BASE, "cache", "vite") },
      logLevel: "error",
    });
    for (const file of pagesUnder(DIST))
      built.set(`/${relative(DIST, file).replace(/index\.html$/, "")}`, readFileSync(file, "utf8"));
  },
  { timeout: 180_000 },
);

const page = (route: string): string => {
  const html = built.get(route);
  assert.ok(html, `the build wrote ${route}`);
  return html;
};

test("the Glossary's index stands in the built page: a row for every section heading on the sheet, in order, every term link lands on an entry the page carries, and no row is inked before a script runs (Issue #462 ruling 1; from e2e IX6)", () => {
  const html = page("/glossary/");
  const sheet = sheetOf(html);
  const slip = slipOf(html);
  const heads = all(sheet, /<h2\b[^>]*\bid="([^"]+)"/g);
  assert.ok(heads.length > 1, `the sheet's section headings: ${heads.length}`);
  assert.deepEqual(all(slip, /<li data-sec="([^"]+)"/g), heads, "a row for every section heading, in order");
  const anchors = new Set(all(sheet, /\bid="([^"]+)"/g));
  const targets = all(slip, /<a href="#([^"]+)" data-for=/g);
  assert.ok(targets.length > heads.length, `term links: ${targets.length}`);
  assert.deepEqual(
    targets.filter((t) => !anchors.has(t)),
    [],
    "every term link lands on an entry",
  );
  assert.doesNotMatch(slip, /class="[^"]*\binked\b/, "no row is inked before a script runs");
});

test("the Glossary's and the Gallery's room name stands in a region landmark named for the room, as the Q & A's does (Alex, 2026-10-06, Issue #762; from e2e IX8, whose read of the accessibility tree stays on the Q & A)", () => {
  for (const [route, room] of [
    ["/glossary/", "The Glossary"],
    ["/gallery/", "The Gallery"],
  ] as const) {
    const folio = /<div class="chrome corner tr folio-room"([^>]*)>/.exec(page(route))?.[1];
    assert.equal(folio, ` role="region" aria-label="${room}"`, `${route}'s room folio`);
  }
});

test("the Glossary keeps its #353 shape in the built page: no section past 8 terms (Zoryan and Ordai to 10), the sections Issues #353 and #430 added 5 to 8 each, the chart section split in three, every term Vellum prints documented, no headword twice, terms alphabetical in each section, and a definition for every term (from e2e IX12)", () => {
  const sections = sectionsOf(sheetOf(page("/glossary/")));
  assert.ok(sections.filter((s) => s.terms.length > 0).length >= FLOOR, `sections read: ${sections.length}`);
  assert.deepEqual(shapeFaults(sections), []);
});

test("the Q & A and the Glossary state the ten-culture roster outright, and the Glossary's Words on your own map heads a section for every culture in CULTURES (Issues #289, #292; from e2e IX13)", () => {
  for (const route of ["/faq/", "/glossary/"])
    assert.ok(text(page(route)).includes("ten invented cultures"), `${route} states the roster`);
  const glossary = page("/glossary/");
  const names = glossary.indexOf('id="names"');
  assert.ok(names > -1, "the Glossary carries Words on your own map");
  const heads = all(glossary.slice(names), /<h3\b[^>]*>([\s\S]*?)<\/h3>/g).map((h) => text(h).toLowerCase());
  assert.deepEqual(
    CULTURES.map((c) => c.id).filter((id) => !heads.some((h) => h.includes(id))),
    [],
    "a section for every culture",
  );
});

test("every question on the Q & A and every term in the Glossary carries its own plain anchor, no two alike, so every index link lands on one entry (Issue #462 ruling 1; from e2e IX14)", () => {
  for (const [route, kind] of [
    ["/faq/", "q"],
    ["/glossary/", "term"],
  ] as const) {
    const ids = all(sheetOf(page(route)), new RegExp(`<[a-z0-9]+ class="${kind}" id="([^"]+)"`, "g"));
    assert.ok(ids.length > 1, `${route} entries: ${ids.length}`);
    assert.deepEqual(
      ids.filter((id) => !/^[a-z0-9-]+$/.test(id)),
      [],
      `${route}'s anchors are plain`,
    );
    assert.equal(new Set(ids).size, ids.length, `${route}'s anchors are unique`);
  }
});

test("every built page prefetches home and every room in the nav but itself, in the nav's order, so a first click commits at once (Issue #329; from e2e RH16)", () => {
  assert.ok(built.size >= 12, `pages built: ${built.size}`);
  for (const [route, html] of built) {
    const want = ["/", ...NAV_ITEMS.map((i) => i.href)].filter((h) => h !== route);
    assert.deepEqual(all(html, /<link rel="prefetch" href="([^"]+)"/g), want, `${route}'s prefetches`);
  }
});
