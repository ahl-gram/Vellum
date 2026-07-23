import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { NAV_ITEMS } from "../../src/layouts/nav.ts";

/**
 * Scriptorium Sub 2 (#203): the Astro scaffold and the shared layout. The spec is
 * the ratified Sub 1 decision doc (the 2026-07-21 comment on #202): home, FAQ, and
 * glossary render through one BaseLayout (head fan-out, canonical nav, constant
 * footer) while their body content stays near-verbatim against docs/, and the
 * legacy docs/ build keeps working untouched until Sub 5 cuts over.
 *
 * The suite builds the Astro site once (into out/test-astro-build, left in place
 * for inspection; out/ is gitignored) and asserts against the rendered output plus
 * the committed sources. The public/-vs-docs/ byte guards are green from the start
 * by design (boundary guards, not red-green).
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
// form, never the &-form title). `description` feeds name=description,
// og:description, AND twitter:description.
const PAGES = [
  {
    route: "index.html",
    docs: "docs/index.html",
    dir: "/",
    current: "Home",
    title: "Vellum: an atelier of imaginary cartography",
    ogTitle: "Vellum: an atelier of imaginary cartography",
    description:
      "Procedurally generated fantasy atlases: deterministic worlds drawn as antique, topographic, ink, and nautical SVG charts.",
  },
  {
    route: "faq/index.html",
    docs: "docs/faq/index.html",
    dir: "/faq/",
    current: "FAQ",
    title: "Vellum: Questions & Answers",
    ogTitle: "Vellum: Questions and Answers",
    description:
      "How Vellum works: seeds, determinism, terrain and rivers, climate and styles, and how to make and reproduce your own maps.",
  },
  {
    route: "glossary/index.html",
    docs: "docs/glossary/index.html",
    dir: "/glossary/",
    current: "Glossary",
    title: "Vellum: Glossary",
    ogTitle: "Vellum: Glossary",
    description:
      "A glossary of the cartography, heraldry, and geography vocabulary printed on Vellum's charts, in its gazetteer, and across its realm names.",
  },
] as const;

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

test("astro build emits the three content pages in directory form", () => {
  for (const p of PAGES) {
    assert.ok(rendered.has(p.route), `astro build should emit ${p.route}`);
  }
  assert.match(page("index.html"), /^<!doctype html>/i, "the page should open with the doctype");
});

test("astro.config keeps the contractual shape (site, trailing slash, no fingerprinting knobs)", async () => {
  const config = (await import("../../astro.config.ts")).default;
  assert.equal(config.site, "https://vellum.route12b.net", "site drives og:url and must stay the custom domain");
  assert.equal(config.trailingSlash, "always", "every internal URL is trailing-slash directory form");
  assert.equal(config.compressHTML, false, "output must stay near-verbatim against docs/ (no minification)");
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
    for (const marker of ["<footer", "topnav", "og:", "twitter:", "<title", "<header", "<html", "<head"]) {
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
      ["property", "og:description", p.description],
      ["name", "twitter:description", p.description],
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
  const home = page("index.html");
  assert.match(home, /<h1>VELLUM<\/h1>/, "home's h1 stays unlinked");
  const homeHeader = home.match(/<header>([\s\S]*?)<\/header>/);
  assert.ok(homeHeader, "home should have a header");
  const order = ["<h1>", 'class="tagline"', 'class="lede"', 'class="seedline"', '<nav class="topnav">'];
  let at = -1;
  for (const marker of order) {
    const next = homeHeader[1].indexOf(marker);
    assert.ok(next > at, `home header keeps its order at ${marker}`);
    at = next;
  }
  assert.ok(homeHeader[1].includes("an atelier of imaginary cartography"), "home tagline");

  for (const [route, tagline] of [
    ["faq/index.html", "questions &amp; answers"],
    ["glossary/index.html", "glossary"],
  ] as const) {
    const html = page(route);
    assert.match(html, /<h1><a href="\/">VELLUM<\/a><\/h1>/, `${route} wordmark links home root-absolute`);
    assert.ok(html.includes(`<p class="tagline">${tagline}</p>`), `${route} keeps its tagline`);
  }
});

test("the footer is constant and appears exactly once per page", () => {
  for (const p of PAGES) {
    const footers = [...page(p.route).matchAll(/<footer>([\s\S]*?)<\/footer>/g)];
    assert.equal(footers.length, 1, `${p.route} has exactly one footer`);
    assert.equal(normalize(footers[0][1]), "VELLUM · AN ATELIER OF IMAGINARY CARTOGRAPHY");
  }
});

test("content parity: everything between the shell renders verbatim against docs/", async () => {
  for (const p of PAGES) {
    const slice = (html: string) => {
      const start = html.indexOf("</header>");
      const end = html.indexOf("<footer");
      assert.ok(start >= 0 && end > start, `${p.route} should have a header-to-footer content region`);
      return normalize(html.slice(start + "</header>".length, end));
    };
    const docsHtml = await readFile(root(p.docs), "utf8");
    assert.equal(slice(page(p.route)), slice(docsHtml), `${p.route} content should match ${p.docs}`);
  }
  // Home's lede + seedline live inside the header (above the nav), so the slice
  // above excludes them; hold them to the same verbatim standard here.
  const docsHome = await readFile(root("docs/index.html"), "utf8");
  const home = page("index.html");
  for (const cls of ["lede", "seedline"]) {
    const m = docsHome.match(new RegExp(`<p class="${cls}">[\\s\\S]*?</p>`));
    assert.ok(m, `docs home should carry the ${cls} paragraph`);
    assert.ok(normalize(home).includes(normalize(m[0])), `home keeps the ${cls} paragraph verbatim`);
  }
});

// Green from the start by design (a guard, not red-green): the parity slice above
// runs header-to-footer, so this pins the skeleton OUTSIDE it. <main> is
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

test("every internal link and embed on the rendered pages resolves", () => {
  // Since Sub 3 the app surfaces ship from public/ (their shells resolve there);
  // the per-deploy generated pair resolves only against the allowlist (atlas/ and
  // gallery/ are generated into the output by Sub 4, absent on a fresh checkout).
  const generated = ["/atlas/", "/gallery/"];
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

test("boundary guard: the public/ support set is byte-identical to docs/ (home css excepted by one line)", () => {
  const identical = [
    "faq/index.css",
    "glossary/index.css",
    "motion.css",
    "fonts.css",
    "favicon.svg",
    "og.png",
    ...readdirSync(root("docs/fonts")).map((f) => `fonts/${f}`),
    ...readdirSync(root("docs/charts")).map((f) => `charts/${f}`),
  ];
  for (const file of identical) {
    assert.ok(existsSync(root(`public/${file}`)), `public/${file} should exist`);
    assert.ok(
      readFileSync(root(`docs/${file}`)).equals(readFileSync(root(`public/${file}`))),
      `public/${file} must stay byte-identical to docs/${file} until Sub 5 retires docs/`,
    );
  }
  // Home's css differs ONLY by the margin-bottom keeping the old p.topnav's UA
  // paragraph margin through the semantic p -> nav change (plus its comment).
  const publicCss = readFileSync(root("public/index.css"), "utf8");
  const docsCss = readFileSync(root("docs/index.css"), "utf8");
  const undone = publicCss
    .replace(/\/\* margin-bottom keeps[\s\S]*?\*\/\n/, "")
    .replace(" margin-bottom: 1em;", "");
  assert.equal(undone, docsCss, "public/index.css must differ from docs/index.css only by the nav margin line");
});

test("the hero charts and arms the home page embeds all resolve in public/charts", () => {
  const embeds = [...page("index.html").matchAll(/src="(charts\/[^"]+)"/g)].map(([, u]) => u);
  assert.equal(new Set(embeds).size, 7, "home embeds the 7 committed goldens (4 charts + 3 arms)");
  for (const embed of embeds) {
    assert.ok(existsSync(root(`public/${embed}`)), `public/${embed} should exist`);
  }
});

test("the legacy deploy build stays wired in parallel until Sub 5 cuts over", async () => {
  const pkg = JSON.parse(await readFile(root("package.json"), "utf8"));
  // npm run site retired in Sub 4 (#205, decision D): charts:regen + the
  // astro:generate showcase step own its jobs now. The DEPLOY build survives.
  assert.equal(pkg.scripts.site, undefined, "npm run site stays retired");
  assert.equal(
    pkg.scripts.build,
    "node scripts/build-dist.ts && tsc -p tsconfig.browser.json --outDir dist/explorer/engine && node scripts/build-explorer-bundle.ts dist",
    "npm run build must keep assembling the legacy dist/ the deploy publishes",
  );
  assert.equal(
    pkg.scripts["astro:build"],
    "npm run astro:generate && astro build",
    "the Astro build regenerates the public/ runtime trees first (Sub 3)",
  );
});
