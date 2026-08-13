import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { NAV_ITEMS } from "../../src/layouts/nav.ts";
import { GENERATED_SUBTREES } from "../../scripts/clean-public-generated.ts";
import {
  ATLAS_ROUTE,
  DISCOVERY_ROUTES,
  HOME_ROUTE,
  ROUTE_ENTRIES,
  configuredSite,
  generateDiscovery,
  llmsTxt,
  robotsTxt,
  sitemapXml,
} from "../../scripts/generate-discovery.ts";

// #286: sitemap.xml, robots.txt and llms.txt are GENERATED from NAV_ITEMS, so every route assertion iterates NAV_ITEMS; a hardcoded list here would rot like the hand-written files this replaces.
// The site origin is a PARAMETER, exercised with a non-Vellum domain so a hardcoded www.vellumworlds.com in a generator fails here; that the real origin comes from astro.config.ts is pinned separately.

const root = (p = "") => fileURLToPath(new URL(`../../${p}`, import.meta.url));

const TEST_SITE = "https://charts.example/";
const abs = (route: string) => new URL(route, TEST_SITE).href;

test("the route set is NAV_ITEMS plus the two routes the nav omits: home and the atlas", () => {
  assert.deepEqual(
    [...DISCOVERY_ROUTES],
    [HOME_ROUTE, ...NAV_ITEMS.map((i) => i.href), ATLAS_ROUTE],
    "the routes are derived, never restated: home, the nav in its order, then the atlas",
  );
  assert.equal(DISCOVERY_ROUTES.length, NAV_ITEMS.length + 2, "six nav items plus home plus the atlas");
  assert.equal(new Set(DISCOVERY_ROUTES).size, DISCOVERY_ROUTES.length, "no route may be listed twice");
  for (const route of DISCOVERY_ROUTES) {
    assert.match(route, /^\/([a-z0-9-]+\/)*$/, `${route} must be root-absolute trailing-slash form (constraint 8)`);
  }
});

test("every route carries a title and a blurb, so a new nav item cannot ship undescribed", () => {
  for (const route of DISCOVERY_ROUTES) {
    const entry = ROUTE_ENTRIES[route];
    assert.ok(entry, `${route} needs an entry in ROUTE_ENTRIES (add one when you add a nav item)`);
    assert.ok(entry.title.trim().length > 0, `${route} needs a title`);
    assert.ok(entry.blurb.trim().length > 20, `${route} needs a real one-line blurb, not a stub`);
  }
  for (const route of Object.keys(ROUTE_ENTRIES)) {
    assert.ok(DISCOVERY_ROUTES.includes(route), `ROUTE_ENTRIES has ${route}, which is not a route (stale entry)`);
  }
});

test("sitemap.xml lists every route, absolute against the site, and nothing else", () => {
  const xml = sitemapXml(TEST_SITE);
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>\n/, "a sitemap opens with the XML declaration");
  assert.ok(
    xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'),
    "the urlset must declare the sitemaps.org 0.9 namespace or crawlers reject it",
  );
  assert.ok(xml.trimEnd().endsWith("</urlset>"), "the urlset must close");

  for (const item of NAV_ITEMS) {
    assert.ok(xml.includes(`<loc>${abs(item.href)}</loc>`), `the sitemap must list the ${item.label} nav route`);
  }
  assert.ok(xml.includes(`<loc>${abs(HOME_ROUTE)}</loc>`), "the sitemap must list home, which has no nav item");
  assert.ok(xml.includes(`<loc>${abs(ATLAS_ROUTE)}</loc>`), "the sitemap must list the generated atlas");

  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
  assert.equal(locs.length, DISCOVERY_ROUTES.length, "exactly one <loc> per route, no duplicates, nothing invented");
  for (const loc of locs) {
    assert.ok(loc.startsWith("https://charts.example/"), `${loc} must be absolute against the passed site`);
    assert.ok(loc.endsWith("/"), `${loc} must keep the trailing-slash directory form`);
  }
  assert.ok(!xml.includes("vellumworlds"), "the origin is a parameter: no domain may be hardcoded in the generator");
});

test("robots.txt allows everyone, forbids nobody, and its real payload is the Sitemap: line", () => {
  const txt = robotsTxt(TEST_SITE);
  assert.match(txt, /^User-agent: \*$/m, "one record, for every agent");
  assert.match(txt, /^Allow: \/$/m, "explicitly allow all: absence of the file already means allow, so say it plainly");
  assert.ok(!/^Disallow:\s*\S/m.test(txt), "nothing is disallowed, AI crawlers included (#286 requirement)");
  assert.match(
    txt,
    new RegExp(`^Sitemap: ${abs("/sitemap.xml").replace(/[.]/g, "[.]")}$`, "m"),
    "the file exists FOR this line: discovery is the problem, not crawl permission",
  );
  assert.ok(!txt.includes("vellumworlds"), "the origin is a parameter here too");
});

test("llms.txt follows the llmstxt.org shape: H1, blockquote summary, then linked sections", () => {
  const txt = llmsTxt(TEST_SITE);
  assert.match(txt, /^# Vellum\n/, "llmstxt.org requires an H1 with the project name, first");
  const summary = txt.match(/^> (.+)$/m);
  assert.ok(summary, "llmstxt.org requires a blockquote summary immediately after the H1");
  assert.ok(summary[1].length > 60, "the summary should actually describe the site");
  assert.match(txt, /^## /m, "the links must live under at least one H2 section");

  for (const route of DISCOVERY_ROUTES) {
    const entry = ROUTE_ENTRIES[route];
    assert.ok(entry, `${route} needs a ROUTE_ENTRIES entry`);
    assert.ok(
      txt.includes(`- [${entry.title}](${abs(route)}): ${entry.blurb}`),
      `llms.txt must link ${route} in the name-url-description form llmstxt.org specifies`,
    );
  }
  assert.ok(!txt.includes("vellumworlds"), "the origin is a parameter here too");
  assert.ok(!txt.includes("--"), "no em-dashes or double hyphens in published copy");
});

test("the generator writes exactly the three files, into any root", async () => {
  const tmp = root("out/test-discovery");
  rmSync(tmp, { recursive: true, force: true });
  await generateDiscovery(tmp, TEST_SITE);

  for (const name of ["sitemap.xml", "robots.txt", "llms.txt"]) {
    const path = join(tmp, name);
    assert.ok(existsSync(path), `${name} should be written`);
    assert.ok(readFileSync(path, "utf8").length > 0, `${name} should not be empty`);
  }
  assert.equal(readFileSync(join(tmp, "sitemap.xml"), "utf8"), sitemapXml(TEST_SITE), "the file IS the pure output");
  assert.equal(readFileSync(join(tmp, "robots.txt"), "utf8"), robotsTxt(TEST_SITE));
  assert.equal(readFileSync(join(tmp, "llms.txt"), "utf8"), llmsTxt(TEST_SITE));
});

test("the real origin comes from astro.config.ts, so a domain move updates all three for free", async () => {
  const config = (await import("../../astro.config.ts")).default;
  assert.equal(await configuredSite(), config.site, "configuredSite must read the one source of truth, never a copy");
  assert.ok(sitemapXml(await configuredSite()).includes(`<loc>${config.site}/</loc>`), "home resolves against it");
});

// The wiring pins: a correct generator never wired into astro:generate would pass every test above while the live site serves 404s; these close that gap (content correct, step wired, Astro copies public/ verbatim).
test("astro:generate ends by generating the discovery files into public/", () => {
  const pkg = JSON.parse(readFileSync(root("package.json"), "utf8"));
  assert.ok(
    pkg.scripts["astro:generate"].includes("node scripts/generate-discovery.ts"),
    "astro:generate must run the discovery step or dist/ has no sitemap",
  );
  assert.ok(
    pkg.scripts["astro:generate"].indexOf("generate-discovery") >
      pkg.scripts["astro:generate"].indexOf("clean-public-generated"),
    "it must run AFTER the clean step, which removes the previous run's files",
  );
});

test("the generated discovery files are gitignored in public/, like every other generated file", () => {
  const lines = readFileSync(root(".gitignore"), "utf8").split("\n");
  for (const line of ["public/sitemap.xml", "public/robots.txt", "public/llms.txt"]) {
    assert.ok(lines.includes(line), `.gitignore should carry the exact line ${line}`);
  }
});

test("clean-before-regen covers them, so a retired route cannot linger in a local build", () => {
  for (const file of ["sitemap.xml", "robots.txt", "llms.txt"]) {
    assert.ok(GENERATED_SUBTREES.includes(file), `GENERATED_SUBTREES must include ${file}`);
  }
});
