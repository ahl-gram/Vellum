import { test, before } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";
import { NAV_ITEMS } from "../../src/layouts/nav.ts";
import { CULTURES } from "../../src/society/names.ts";
import { documentOf } from "../../test-support/built-dom.ts";
import { br1Faults, br11Faults, br9Faults, cd55Faults } from "../../test-support/built-reads/explorer.ts";
import { l13Faults, l14Faults, l15Faults, l16Faults, l17Faults } from "../../test-support/built-reads/home.ts";
import { pr36Faults } from "../../test-support/built-reads/print-room.ts";
import { pb12Faults, pb16Faults, rb11Faults } from "../../test-support/built-reads/prospect-ribbon.ts";
import { hg6Faults, r16Faults, rr38Faults } from "../../test-support/built-reads/rooms.ts";
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

// The text of a file the build serves (a path without its leading slash), or null.
const served = (path: string): string | null => {
  const file = join(DIST, path);
  return existsSync(file) ? readFileSync(file, "utf8") : null;
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

test("the Explorer wears the engine's host contract in the built page: the mount carries the class, the page links the sheet, and the built tree's sheet is the engine's own, read as data (from e2e R16, whose read of the loaded sheet went to the file)", () => {
  assert.deepEqual(r16Faults(documentOf(page("/explorer/")), served), []);
});

test("the Reading Room as authored in the built page: the folio's one h1 and its tagline, the colophon's one control group, the Journal slip, the strip after it, the stage's gesture box, the Glass and the chart folio's two lines (from e2e RR38)", () => {
  assert.deepEqual(rr38Faults(documentOf(page("/reading-room/"))), []);
});

test("the Print Room as authored in the built page: the folio's one h1 and its tagline with no retired furniture, the control row in order, the Bound Atlas slip before the chart folio, the legend row (the head's own dropdown before Pressed-as, the caveat, four plates ascending and closed, the gold road last), the stage's gesture box, the pill, the warning and the notice, the Glass, the folio's lines, the hidden document and the measure box (from e2e PR36, less the dropdowns' resolved 16px size, which no built page carries)", () => {
  assert.deepEqual(pr36Faults(documentOf(page("/print-room/"))), []);
});

test("the Prospect's markup in the built page: the folio's one h1 and tagline, the year control a form whose label names the year field, the engraver's note slip in order with its filing press before the chart folio, the roads out, the plate the transform target's one face, the pill, the warning and the notice in the stage, the folio's lines (from e2e PB12, less the year field's accessible name and the Ribbon road's script-written verb)", () => {
  assert.deepEqual(pb12Faults(documentOf(page("/prospect/"))), []);
});

test("the Prospect as authored in the built page: the filing press faced with the constant the script paints with, the note's where line, the roads' authored hrefs, the plate hidden with an empty alt, and the scripts-off notice in the stage (from e2e PB16, less the plate's resolved display and the notice's box inside the stage)", () => {
  assert.deepEqual(pb16Faults(documentOf(page("/prospect/"))), []);
});

test("the Ribbon's markup in the built page: the folio's one h1 and tagline, the journey row a group of two labelled selects with Turn about outside it, the itinerary slip in order before the chart folio, the roads out, the scroll the transform target's one face, the pill, the warning and the notice in the stage, the Glass, the folio's lines (from e2e RB11, less the reachable-only fill of bound-for and the Prospect road's script-written verb)", () => {
  assert.deepEqual(rb11Faults(documentOf(page("/ribbon/"))), []);
});

test("every Explorer control stands in its wiring-truth group in the built page: the seed row in the folio, the Land, the Strand and the Hand on the slip, the Press as the legend row, the four heads reading The Land, The Strand, The Hand and The Press (from e2e BR1)", () => {
  assert.deepEqual(br1Faults(documentOf(page("/explorer/"))), []);
});

test("the Explorer as authored in the built page: the folio's one h1 and tagline with the seed row its one control group, the groups in reading order, the Broadside slip with its three panels, six seals, seven footnote marks and notes and its printer's line, the Press as the legend row, the stage's leaf with the empty gesture box and the hidden verso, the Glass outside it, the status pill and the chart folio's three empty lines (from e2e BR9, less the slip's accessible name, whose aria-labelledby stays asserted)", () => {
  assert.deepEqual(br9Faults(documentOf(page("/explorer/"))), []);
});

test("every value the Explorer's style, type, climate and theme pickers offer is one the Chart Table's grammar files, so no link the Explorer writes is dropped on arrival (from e2e BR11)", () => {
  assert.deepEqual(br11Faults(documentOf(page("/explorer/"))), []);
});

test("the Portfolio's where-line ships promising the sheets gathered at the Explorer (from e2e CD55, less the script's bare voice written over it, which only a running browser has)", () => {
  assert.deepEqual(cd55Faults(documentOf(page("/explorer/portfolio/"))), []);
});

test("home's stations are real buttons outside the marks' aria shroud, one per station and the how pip from one template, each with its anchor at full precision and its sea flag's dress, each with its slip, while the marks are every manifest place the stations leave unclaimed (from e2e L13)", () => {
  assert.deepEqual(l13Faults(documentOf(page("/"))), []);
});

test("home's legend glosses the encounters once, at its head, and lists one press per station in the roster's order, the how pip none; every station slip runs its close, verb, title, where and prose (the Atlas its three arms) and ends at its room's door (from e2e L14)", () => {
  assert.deepEqual(l14Faults(documentOf(page("/")), page("/")), []);
});

test("home's shelf is plain flow after the landfall section: its heading and exactly the three survey plates, each linking its own served chart under its caption, lazy and low priority, wearing the plate tip, its size attributes the served SVG's own, nothing on it hidden (from e2e L15, less the network answer, read as the served file's presence)", () => {
  assert.deepEqual(l15Faults(documentOf(page("/")), served), []);
});

test("home's Notice to Mariners is the mockup's stamp on the deep, decorative and the only copy of its words; the how panel is a card slip shipped hidden above a keyboard-reachable region that carries the prose, with no door; the noscript carries the four doors and its own sheet (from e2e L16, less the sheet's not being fetched, a resource timing)", () => {
  assert.deepEqual(l16Faults(documentOf(page("/")), page("/")), []);
});

test("home's corner hook is the share card's, line for line, broken where the card breaks it (from e2e L17)", () => {
  assert.deepEqual(l17Faults(documentOf(page("/"))), []);
});

test("the Hunt's skeleton in the built page: the stage holds the gesture box, the gesture box the transform target alone, the target the chart's own sheet alone; the box is a focusable application; no caption; the folio stands outside the stage after it, its first line the title (from e2e HG6)", () => {
  assert.deepEqual(hg6Faults(documentOf(page("/seed-of-the-day/"))), []);
});
