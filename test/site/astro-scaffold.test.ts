import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { NAV_ITEMS } from "../../src/layouts/nav.ts";

/**
 * Scriptorium Sub 2 (#203): the Astro scaffold and the shared layout. The spec is
 * the ratified Sub 1 decision doc (the 2026-07-21 comment on #202): home, FAQ, and
 * glossary render through one BaseLayout (head fan-out, canonical nav, constant
 * footer). Since Sub 5 (#206) retired docs/ and its dual-copy byte guards, the
 * committed sources are src/pages + public/ alone. Sub 8 (#254) ends the
 * app-shell exception: the Explorer, Print Room, and seed-of-the-day pages
 * render through the same BaseLayout, so ALL six pages are asserted here.
 *
 * The suite builds the Astro site once (into out/test-astro-build, left in place
 * for inspection; out/ is gitignored) and asserts against the rendered output plus
 * the committed sources.
 */

process.env.ASTRO_TELEMETRY_DISABLED = "1";

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const outDir = root("out/test-astro-build");

const normalize = (s: string) => s.replace(/\s+/g, " ").trim();
const decode = (s: string) =>
  s
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

// Per-page expectations. `title` is the head <title>; `ogTitle` feeds og:title AND
// twitter:title (FAQ's differ in punctuation: the og twins take the normalized
// form, never the &-form title). `description` feeds name=description;
// `ogDescription` (defaulting to it) feeds og:description AND twitter:description
// (seed-of-the-day's card copy is shorter than its search snippet). `h1` is the
// rendered header wordmark: the home link wraps VELLUM alone, the app surfaces'
// wordmark suffix stays outside it (Sub 8 #254 preserves the old shells' form).
type PageSpec = {
  route: string;
  dir: string;
  current: string;
  title: string;
  ogTitle: string;
  description: string;
  ogDescription?: string;
  h1: string;
  tagline: string;
  /** App surfaces only: the is:inline bundle-twin script the page must keep. */
  scriptSrc?: string;
};

const PAGES: readonly PageSpec[] = [
  {
    route: "index.html",
    dir: "/",
    current: "Home",
    title: "Vellum: an atelier of imaginary cartography",
    ogTitle: "Vellum: an atelier of imaginary cartography",
    description:
      "Procedurally generated fantasy atlases: deterministic worlds drawn as antique, topographic, ink, and nautical SVG charts.",
    h1: "<h1>VELLUM</h1>",
    tagline: "an atelier of imaginary cartography",
  },
  {
    route: "faq/index.html",
    dir: "/faq/",
    current: "FAQ",
    title: "Vellum: Questions & Answers",
    ogTitle: "Vellum: Questions and Answers",
    description:
      "How Vellum works: seeds, determinism, terrain and rivers, climate and styles, and how to make and reproduce your own maps.",
    h1: '<h1><a href="/">VELLUM</a></h1>',
    tagline: "questions &amp; answers",
  },
  {
    route: "glossary/index.html",
    dir: "/glossary/",
    current: "Glossary",
    title: "Vellum: Glossary",
    ogTitle: "Vellum: Glossary",
    description:
      "A glossary of the cartography, heraldry, and geography vocabulary printed on Vellum's charts, in its gazetteer, and across its realm names.",
    h1: '<h1><a href="/">VELLUM</a></h1>',
    tagline: "glossary",
  },
  {
    route: "explorer/index.html",
    dir: "/explorer/",
    current: "Explorer",
    title: "Vellum Explorer: draw your own imaginary world",
    ogTitle: "Vellum Explorer: draw your own imaginary world",
    description: "Generate procedural fantasy maps in your browser. Every seed is a world.",
    h1: '<h1><a href="/">VELLUM</a> EXPLORER</h1>',
    tagline: "every seed is a world, draw one",
    scriptSrc: "./app.bundle.js",
  },
  {
    route: "print-room/index.html",
    dir: "/print-room/",
    current: "Print Room",
    title: "Vellum: Print Room",
    ogTitle: "Vellum: Print Room",
    description:
      "The atelier's print room: bring a world in from the Explorer or call up a seed by number, pull a proof, and take the chart home.",
    h1: '<h1><a href="/">VELLUM</a> PRINT ROOM</h1>',
    tagline: "take a world home",
    scriptSrc: "./app.bundle.js",
  },
  {
    route: "seed-of-the-day/index.html",
    dir: "/seed-of-the-day/",
    current: "Today",
    title: "Vellum: the seed of the day",
    ogTitle: "Vellum: the seed of the day",
    description:
      "A new procedural world every day: today's date is the seed, drawn as an antique chart with a line from its gazetteer. Same day, same world, everywhere.",
    ogDescription:
      "A new procedural world every day: today's date is the seed, drawn as an antique chart with a line from its gazetteer.",
    h1: '<h1><a href="/">VELLUM</a></h1>',
    tagline: "the seed of the day",
    scriptSrc: "app.bundle.js",
  },
];

const rendered = new Map<string, string>();

before(
  async () => {
    await rm(outDir, { recursive: true, force: true });
    const { build } = await import("astro");
    await build({ root: root(""), outDir, logLevel: "error" });
    for (const page of PAGES) {
      const path = join(outDir, page.route);
      if (existsSync(path)) rendered.set(page.route, readFileSync(path, "utf8"));
    }
  },
  { timeout: 180_000 },
);

const page = (route: string) => {
  const html = rendered.get(route);
  assert.ok(html, `${route} should have been rendered by astro build`);
  return html;
};

const headOf = (html: string) => {
  const m = html.match(/<head>([\s\S]*?)<\/head>/);
  assert.ok(m, "the page should have a <head>");
  return m[1];
};

const metaContent = (head: string, attr: "name" | "property", key: string) => {
  const m = head.match(new RegExp(`<meta ${attr}="${key.replace(/[:]/g, "[:]")}" content="([^"]*)"`));
  return m ? decode(m[1]) : undefined;
};

test("astro build emits all six pages in directory form", () => {
  for (const p of PAGES) {
    assert.ok(rendered.has(p.route), `astro build should emit ${p.route}`);
  }
  assert.match(page("index.html"), /^<!doctype html>/i, "the page should open with the doctype");
});

test("astro.config keeps the contractual shape (site, trailing slash, no fingerprinting knobs)", async () => {
  const config = (await import("../../astro.config.ts")).default;
  assert.equal(config.site, "https://vellum.route12b.net", "site drives og:url and must stay the custom domain");
  assert.equal(config.trailingSlash, "always", "every internal URL is trailing-slash directory form");
  assert.equal(config.compressHTML, false, "the migrated pages' markup must stay unminified (near-verbatim discipline)");
  assert.equal(config.build?.inlineStylesheets, "always", "the shell style must inline, never a fingerprinted file");
  assert.ok(!("base" in config), "base must stay the default '/' (root-absolute assets break otherwise)");
  assert.ok(!("outDir" in config), "outDir must stay the default ./dist (deploy.yml uploads path: dist)");
});

test("the shell is authored exactly once: pages carry no header/nav/footer/meta boilerplate", () => {
  const layout = readFileSync(root("src/layouts/BaseLayout.astro"), "utf8");
  for (const marker of ["<footer>", 'class="topnav"', 'property="og:title"', 'name="twitter:card"', "<title>"]) {
    assert.ok(layout.includes(marker), `BaseLayout.astro should own the shell marker ${marker}`);
  }
  assert.ok(layout.includes("NAV_ITEMS"), "the layout should render the typed nav data, not hand-authored items");

  for (const p of PAGES) {
    const source = readFileSync(root(`src/pages/${p.route.replace("index.html", "index.astro")}`), "utf8");
    // The og/twitter markers are the meta-attribute forms: the app pages' verbatim
    // content carries prose comments where a bare "og:" false-positives ("log:").
    for (const marker of ["<footer", "topnav", 'property="og:', 'name="twitter:', "<title", "<header", "<html", "<head"]) {
      assert.ok(!source.includes(marker), `${p.route} source should not duplicate the shell (found ${marker})`);
    }
  }
});

test("each rendered head carries the canonical meta with the ratified prop fan-out", () => {
  for (const p of PAGES) {
    const head = headOf(page(p.route));
    const title = head.match(/<title>([\s\S]*?)<\/title>/);
    assert.ok(title, `${p.route} should have a <title>`);
    assert.equal(decode(title[1]), p.title, `${p.route} title`);

    for (const [attr, key, want] of [
      ["name", "description", p.description],
      ["property", "og:description", p.ogDescription ?? p.description],
      ["name", "twitter:description", p.ogDescription ?? p.description],
      ["property", "og:title", p.ogTitle],
      ["name", "twitter:title", p.ogTitle],
      ["property", "og:url", `https://vellum.route12b.net${p.dir}`],
      ["property", "og:type", "website"],
      ["property", "og:site_name", "Vellum"],
      ["property", "og:image", "https://vellum.route12b.net/og.png"],
      ["property", "og:image:width", "1200"],
      ["property", "og:image:height", "630"],
      ["property", "og:image:alt", "A Vellum antique chart beside the Vellum wordmark."],
      ["name", "twitter:card", "summary_large_image"],
      ["name", "twitter:image", "https://vellum.route12b.net/og.png"],
      ["name", "twitter:image:alt", "A Vellum antique chart beside the Vellum wordmark."],
    ] as const) {
      assert.equal(metaContent(head, attr, key), want, `${p.route} ${attr}=${key}`);
    }

    assert.ok(
      head.includes('<link rel="icon" type="image/svg+xml" href="/favicon.svg">'),
      `${p.route} should keep the favicon link`,
    );
    const fonts = head.indexOf('<link rel="stylesheet" href="/fonts.css">');
    const motion = head.indexOf('<link rel="stylesheet" href="/motion.css">');
    const pageCss = head.indexOf('<link rel="stylesheet" href="index.css">');
    assert.ok(fonts >= 0 && motion > fonts && pageCss > motion, `${p.route} stylesheet links keep today's order`);
  }
});

test("no head member arrives beyond the canonical set (nothing injected, nothing invented)", () => {
  const expectedMeta = new Set([
    "charset",
    "name:viewport",
    "name:description",
    "name:twitter:card",
    "name:twitter:title",
    "name:twitter:description",
    "name:twitter:image",
    "name:twitter:image:alt",
    "property:og:type",
    "property:og:site_name",
    "property:og:url",
    "property:og:title",
    "property:og:description",
    "property:og:image",
    "property:og:image:width",
    "property:og:image:height",
    "property:og:image:alt",
  ]);
  for (const p of PAGES) {
    const head = headOf(page(p.route));
    const seen = [...head.matchAll(/<meta\s+([^>]*?)\/?>/g)].map(([, attrs]) => {
      if (/charset=/.test(attrs)) return "charset";
      const m = attrs.match(/(name|property)="([^"]+)"/);
      return m ? `${m[1]}:${m[2]}` : `unrecognized: ${attrs}`;
    });
    assert.deepEqual(new Set(seen), expectedMeta, `${p.route} meta set should be exactly the canonical one`);
    assert.equal(seen.length, expectedMeta.size, `${p.route} should carry no duplicate meta`);
    assert.ok(!/<link(?![^>]*(?:rel="icon"|rel="stylesheet"))/.test(head), `${p.route} has only icon/stylesheet links`);
    assert.ok(!head.includes("canonical"), "no canonical tags exist today and the layout must not invent them");
  }
});

test("the canonical nav renders the typed items flat, root-absolute, one aria-current", () => {
  assert.deepEqual(
    NAV_ITEMS.map((i) => i.label),
    ["Home", "Today", "Explorer", "Print Room", "FAQ", "Glossary"],
    "the flat six (Reading Room arrives later as the 7th)",
  );
  for (const item of NAV_ITEMS) {
    assert.match(item.href, /^\/([a-z0-9-]+\/)*$/, `${item.label} href must be root-absolute directory form`);
  }
  for (const p of PAGES) {
    const html = page(p.route);
    const navs = [...html.matchAll(/<nav class="topnav">([\s\S]*?)<\/nav>/g)];
    assert.equal(navs.length, 1, `${p.route} should have exactly one topnav (semantic <nav>)`);
    const nav = navs[0][1];

    const parts = [...nav.matchAll(/<a href="([^"]+)">([^<]+)<\/a>|<span aria-current="page">([^<]+)<\/span>/g)];
    assert.deepEqual(
      parts.map((m) => m[2] ?? m[3]),
      NAV_ITEMS.map((i) => i.label),
      `${p.route} nav renders every item in NAV_ITEMS order`,
    );
    for (const m of parts) {
      if (m[2] !== undefined) {
        const item = NAV_ITEMS.find((i) => i.label === m[2]);
        assert.equal(m[1], item?.href, `${p.route} nav link ${m[2]} uses the root-absolute href`);
      }
    }
    const currents = parts.filter((m) => m[3] !== undefined);
    assert.deepEqual(
      currents.map((m) => m[3]),
      [p.current],
      `${p.route} marks exactly its own page aria-current, as an unlinked span`,
    );
    assert.equal(nav.split(" · ").length, NAV_ITEMS.length, `${p.route} items are separated by the middle dot`);
  }
});

test("the layout ships the two ratified shell rules: 0.82rem unification + aria-current inline-block", () => {
  for (const p of PAGES) {
    const head = headOf(page(p.route));
    const style = head.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    assert.ok(style, `${p.route} should inline the shell <style>`);
    // The inlined shell CSS arrives minified, so tolerate .82rem and bare attr values.
    const css = style[1];
    assert.match(
      css,
      /\.topnav\s*\{[^}]*font-size:\s*0?\.82rem/,
      "one nav font size everywhere (FAQ/glossary's 0.8rem was drift, unified by ratified decision B)",
    );
    assert.match(
      css,
      /\.topnav\s+\[aria-current=(?:"page"|page)\]\s*\{[^}]*display:\s*inline-block/,
      "the current label joins motion.css's inline-block rule so a multi-word label cannot wrap mid-label",
    );
  }
});

test("the header keeps each page's identity: wordmark link, tagline, home's extras in order", () => {
  for (const p of PAGES) {
    const html = page(p.route);
    assert.ok(
      html.includes(p.h1),
      `${p.route} h1 should be exactly ${p.h1} (home unlinked; VELLUM alone carries the home link; a wordmark suffix stays outside it)`,
    );
    assert.ok(html.includes(`<p class="tagline">${p.tagline}</p>`), `${p.route} keeps its tagline`);
  }

  const homeHeader = page("index.html").match(/<header>([\s\S]*?)<\/header>/);
  assert.ok(homeHeader, "home should have a header");
  const order = ["<h1>", 'class="tagline"', 'class="lede"', 'class="seedline"', '<nav class="topnav">'];
  let at = -1;
  for (const marker of order) {
    const next = homeHeader[1].indexOf(marker);
    assert.ok(next > at, `home header keeps its order at ${marker}`);
    at = next;
  }
});

test("the footer is constant and appears exactly once per page", () => {
  for (const p of PAGES) {
    const footers = [...page(p.route).matchAll(/<footer>([\s\S]*?)<\/footer>/g)];
    assert.equal(footers.length, 1, `${p.route} has exactly one footer`);
    assert.equal(normalize(footers[0][1]), "VELLUM · AN ATELIER OF IMAGINARY CARTOGRAPHY");
  }
});

// Green from the start by design (a guard, not red-green): the shell tests above
// cover header-to-footer, so this pins the skeleton OUTSIDE it. <main> is
// load-bearing (the page CSS centers via `main { max-width ... }`), and the
// end-anchored close means nothing can be injected after the footer unseen.
test("the body skeleton pins the load-bearing <main> wrapper at both ends", () => {
  for (const p of PAGES) {
    const html = page(p.route);
    assert.match(html, /<body>\s*<main>\s*<header>/, `${p.route} body must open body > main > header`);
    assert.match(
      html,
      /<\/footer>\s*<\/main>\s*<\/body>\s*<\/html>\s*$/,
      `${p.route} must close footer, main, body, html with nothing after`,
    );
  }
});

test("each app page keeps its bundle-twin module script, rendered verbatim inside <main>", () => {
  // Sub 8 (#254): the shells render through the layout, but the app entry stays
  // the Vite-pressed twin (#208), loaded by an is:inline script Astro must leave
  // alone. A module script is deferred by spec, so living at the end of the page
  // content (inside <main>, before the footer) is behavior-identical to the old
  // shells' after-</main> position, and the end-anchored skeleton pin above
  // keeps holding for every page.
  for (const p of PAGES) {
    const tag = `<script type="module" src="${p.scriptSrc}"></script>`;
    if (p.scriptSrc === undefined) {
      assert.ok(!page(p.route).includes("<script"), `${p.route} is a content page and ships no script`);
      continue;
    }
    const html = page(p.route);
    assert.ok(html.includes(tag), `${p.route} should load its bundle twin via ${tag}`);
    assert.ok(html.indexOf(tag) < html.indexOf("<footer>"), `${p.route} script renders inside <main>, before the footer`);
    assert.doesNotMatch(html, /src="(\.\/)?app\.js"/, `${p.route} must not load the raw ESM entry`);
  }
});

test("every internal link and embed on the rendered pages resolves", () => {
  // The per-deploy generated set resolves only against the allowlist: atlas/ and
  // gallery/ are generated into the output by Sub 4, and the app pages' bundle
  // twins are pressed into public/ by astro:generate (#208); all are gitignored
  // and absent on a fresh checkout (CI runs npm test before npm run build).
  const generated = [
    "/atlas/",
    "/gallery/",
    "/explorer/app.bundle.js",
    "/print-room/app.bundle.js",
    "/seed-of-the-day/app.bundle.js",
  ];
  const routes = new Set<string>(PAGES.map((p) => p.dir));
  for (const p of PAGES) {
    const html = page(p.route);
    for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:)?\/\//.test(url) || url.startsWith("mailto:")) continue;
      if (url.startsWith("#")) {
        assert.ok(html.includes(`id="${url.slice(1)}"`), `${p.route} fragment ${url} should exist on the page`);
        continue;
      }
      const path = new URL(url, `https://v.test${p.dir}`).pathname;
      if (routes.has(path)) continue;
      if (generated.includes(path)) continue;
      const target = path.endsWith("/") ? `${path}index.html` : path;
      assert.ok(existsSync(root(`public${target}`)), `${p.route} links ${url}: public${target} should exist`);
    }
  }
});

test("the support set the pages depend on is committed in public/", () => {
  // The docs/-vs-public/ byte guards retired with docs/ at Sub 5; existence of
  // the root-absolute support files is still worth pinning (og:image and the
  // fonts.css url()s are meta/CSS references the link-resolver test cannot see).
  for (const file of ["motion.css", "fonts.css", "favicon.svg", "og.png", "index.css"]) {
    assert.ok(existsSync(root(`public/${file}`)), `public/${file} should exist`);
  }
});

test("the hero charts and arms the home page embeds all resolve in public/charts", () => {
  const embeds = [...page("index.html").matchAll(/src="(charts\/[^"]+)"/g)].map(([, u]) => u);
  assert.equal(new Set(embeds).size, 7, "home embeds the 7 committed goldens (4 charts + 3 arms)");
  for (const embed of embeds) {
    assert.ok(existsSync(root(`public/${embed}`)), `public/${embed} should exist`);
  }
});

test("the deploy build IS the Astro build (Sub 5 cutover, #206)", async () => {
  const pkg = JSON.parse(await readFile(root("package.json"), "utf8"));
  // npm run site retired in Sub 4 (#205, decision D): charts:regen + the
  // astro:generate showcase step own its jobs now.
  assert.equal(pkg.scripts.site, undefined, "npm run site stays retired");
  assert.equal(
    pkg.scripts.build,
    "npm run astro:generate && astro build",
    "npm run build must assemble dist/ via Astro (deploy.yml runs it unchanged)",
  );
  assert.equal(pkg.scripts["astro:build"], undefined, "astro:build folds into build at the cutover");
  assert.equal(pkg.scripts.serve, undefined, "npm run serve retires with docs/ (use npm run dev)");
  assert.equal(pkg.engines?.node, ">=24", "Astro does not support odd Node majors; 23 is odd");
});
