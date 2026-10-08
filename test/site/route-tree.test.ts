import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { NAV_ITEMS, ROUTE_CHILDREN, ROUTE_NAMES, aliasesOf, seatOf, trailFor } from "../../src/layouts/nav.ts";
import { ATLAS_ROUTE, DISCOVERY_ROUTES, HOME_ROUTE, ROUTE_ENTRIES } from "../../scripts/generate-discovery.ts";

// The route tree the trail reads (Issue #668, the tree ruled on Issue #667). The trails, the children and the unseated routes are LITERAL, since a roster taken from the data it checks would be circular; only the top line is read from NAV_ITEMS, and TRAILS' literal keys red if the nav grows.

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));

const UNDER_THE_EXPLORER = ["/prospect/", "/ribbon/", "/explorer/portfolio/"];
const SEATED = [...NAV_ITEMS.map((i) => i.href), ...UNDER_THE_EXPLORER];
const UNSEATED = ["/", "/specimen/", "/atlas/"];

type Want = { crumbs: [string, string][]; current: boolean; also: [string, string][] };
const TRAILS: Record<string, Want> = {
  "/seed-of-the-day/": {
    crumbs: [
      ["Vellum", "/"],
      ["The Seed of the Day", "/seed-of-the-day/"],
    ],
    current: false,
    also: [],
  },
  "/explorer/": {
    crumbs: [
      ["Vellum", "/"],
      ["The Explorer", "/explorer/"],
    ],
    current: false,
    also: [],
  },
  "/reading-room/": {
    crumbs: [
      ["Vellum", "/"],
      ["The Reading Room", "/reading-room/"],
    ],
    current: false,
    also: [],
  },
  "/print-room/": {
    crumbs: [
      ["Vellum", "/"],
      ["The Print Room", "/print-room/"],
    ],
    current: false,
    also: [],
  },
  "/gallery/": {
    crumbs: [
      ["Vellum", "/"],
      ["The Gallery", "/gallery/"],
    ],
    current: false,
    also: [],
  },
  "/faq/": {
    crumbs: [
      ["Vellum", "/"],
      ["Questions & Answers", "/faq/"],
    ],
    current: false,
    also: [],
  },
  "/glossary/": {
    crumbs: [
      ["Vellum", "/"],
      ["The Glossary", "/glossary/"],
    ],
    current: false,
    also: [],
  },
  "/prospect/": {
    crumbs: [
      ["Vellum", "/"],
      ["The Explorer", "/explorer/"],
      ["The Prospect", "/prospect/"],
    ],
    current: true,
    also: [["The Reading Room", "/reading-room/"]],
  },
  "/ribbon/": {
    crumbs: [
      ["Vellum", "/"],
      ["The Explorer", "/explorer/"],
      ["The Wayfarer's Ribbon", "/ribbon/"],
    ],
    current: true,
    also: [],
  },
  "/explorer/portfolio/": {
    crumbs: [
      ["Vellum", "/"],
      ["The Explorer", "/explorer/"],
      ["The Portfolio", "/explorer/portfolio/"],
    ],
    current: true,
    also: [],
  },
};

test("the tree's top line IS the nav: every nav route is seated at the top, and home, the Specimen and the atlas have no seat", () => {
  for (const item of NAV_ITEMS) assert.equal(seatOf(item.href), null, `${item.href} is seated at the top`);
  for (const route of UNSEATED) assert.equal(seatOf(route), undefined, `${route} has no seat`);
});

test("a route's seat is its FIRST appearance: the Prospect hangs off the Explorer, not off the Reading Room that also carries it", () => {
  assert.ok(
    ROUTE_CHILDREN["/reading-room/"]?.includes("/prospect/"),
    "precondition: the Reading Room carries the Prospect too, or the first-appearance rule is untested",
  );
  for (const child of UNDER_THE_EXPLORER)
    assert.equal(seatOf(child), "/explorer/", `${child} is seated under the Explorer`);
});

test("an alias is every later appearance: the Prospect alone has one, the Reading Room", () => {
  assert.deepEqual(aliasesOf("/prospect/"), ["/reading-room/"]);
  for (const route of SEATED.filter((r) => r !== "/prospect/"))
    assert.deepEqual(aliasesOf(route), [], `${route} has no alias`);
});

test("every seated route's trail runs from Vellum down to the page; home, the Specimen and the atlas draw none", () => {
  assert.deepEqual(Object.keys(TRAILS).sort(), [...SEATED].sort(), "the literal covers every seat");
  for (const [route, want] of Object.entries(TRAILS)) {
    const got = trailFor(route);
    assert.ok(got, `${route} draws a trail`);
    assert.deepEqual(
      got.crumbs.map((c) => [c.name, c.href]),
      want.crumbs,
      `${route} crumbs`,
    );
    assert.equal(got.current, want.current, `${route} carries the page mark exactly when the nav cannot`);
    assert.deepEqual(
      got.also.map((c) => [c.name, c.href]),
      want.also,
      `${route} also reached from`,
    );
  }
  for (const route of UNSEATED) assert.equal(trailFor(route), null, `${route} draws no trail`);
});

test("one mark per page: the nav carries it when the page is on the nav, the trail when it is not, and an unseated page carries none", () => {
  for (const route of [...DISCOVERY_ROUTES, "/specimen/"]) {
    const marks = Number(NAV_ITEMS.some((i) => i.href === route)) + Number(trailFor(route)?.current === true);
    assert.equal(marks, SEATED.includes(route) ? 1 : 0, `${route} carries ${marks} marks`);
  }
});

test("one source of names: every seat and the root is named, nothing else is, and each discovery title is the same name", () => {
  assert.deepEqual(Object.keys(ROUTE_NAMES).sort(), [HOME_ROUTE, ...SEATED].sort());
  for (const route of [HOME_ROUTE, ...SEATED]) {
    assert.equal(ROUTE_ENTRIES[route]?.title, ROUTE_NAMES[route], `${route}: the discovery title is the trail's name`);
  }
});

test("the tree and discovery agree: every discovery route but home and the atlas is seated, and every seat is discoverable", () => {
  assert.deepEqual(
    DISCOVERY_ROUTES.filter((r) => seatOf(r) === undefined).sort(),
    [ATLAS_ROUTE, HOME_ROUTE].sort(),
    "a new destination is seated or named beside the atlas here",
  );
  for (const route of Object.values(ROUTE_CHILDREN).flat())
    assert.ok(DISCOVERY_ROUTES.includes(route), `${route} is seated, so it is discoverable`);
});

test("every route the tree names is a page", () => {
  const named = [
    ...NAV_ITEMS.map((i) => i.href),
    ...Object.keys(ROUTE_CHILDREN),
    ...Object.values(ROUTE_CHILDREN).flat(),
  ];
  assert.ok(named.length > NAV_ITEMS.length, "precondition: the tree seats children, or this reads the nav alone");
  for (const route of named)
    assert.ok(existsSync(root(`src/pages${route}index.astro`)), `src/pages${route}index.astro exists`);
});

test("no shipped file names the Portfolio's old address but the tombstone that cleans it (Issue #669)", () => {
  const files = execFileSync("git", ["ls-files", "src", "scripts", "e2e", "public"], {
    cwd: root(""),
    encoding: "utf8",
    timeout: 30_000,
  })
    .split("\n")
    .filter(Boolean);
  assert.ok(
    files.includes("src/site/explorer/app.ts") && files.includes("public/house.css"),
    "precondition: git listed the shipped trees, or this scan reads nothing",
  );
  // Blind spot, erring toward a miss: a RELATIVE road to the old address never spells it out, which the built-page resolver, the road pins and the e2e walks cover instead.
  const hits = files.flatMap((f) =>
    readFileSync(root(f), "utf8")
      .split("\n")
      .filter((line) => line.includes("print-room/portfolio"))
      .map((line) => `${f}: ${line.trim()}`),
  );
  assert.deepEqual(
    hits,
    ['scripts/clean-public-generated.ts: "print-room/portfolio/app.bundle.js",'],
    "only the tombstone in GENERATED_SUBTREES may name the Portfolio's old address; anything else is a road to a page that no longer exists",
  );
});
