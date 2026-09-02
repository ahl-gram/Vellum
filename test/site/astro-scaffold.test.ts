import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, rm } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";
import { NAV_ITEMS } from "../../src/layouts/nav.ts";
import { cleanPublicGenerated } from "../../scripts/clean-public-generated.ts";

// Scriptorium Sub 2 (#203): the Astro scaffold and shared layout. SPEC: the ratified 2026-07-21 comment on #202. Builds once into out/test-astro-build (gitignored) and asserts on the rendered output plus the committed sources.

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

// Per-page expectations (#268): room is the layout prop and title is COMPUTED from it; ogTitle feeds the og/twitter twins; current is the aria-current nav label, absent on home (the wordmark carries the home link).
type PageSpec = {
  route: string;
  dir: string;
  current?: string;
  room?: string;
  title: string;
  ogTitle: string;
  description: string;
  ogDescription?: string;
  tagline: string;
  /** App surfaces only: the is:inline bundle-twin script the page must keep. */
  scriptSrc?: string;
  /** The one stated content-page script exception (#289): home's seed-form intercept marker. */
  inlineScript?: string;
  /** #457's pre-paint veil script, home's re-ratified THIRD script (PR #467): must parse before the stage. */
  prePaintScript?: string;
  /** Sub 7 (#462, chart-room rulings 7 and 9): a chart room renders no band and no footer; the chart is the room. */
  chartRoom?: true;
  /** Sub 7 (#462): a document room's index script, an Astro-processed component script inlined into the page (the #483 shape); the marker must occur only inside it, and it is a pattern because the minifier picks the quote style. */
  pageScript?: RegExp;
};

/** The shell's binder, inlined into every page by Astro (#483); stripped before a page's OWN scripts are counted. */
const SHELL_SCRIPT = /<script type="module">(?:(?!<\/script>)[\s\S])*closesOnScroll(?:(?!<\/script>)[\s\S])*<\/script>/;

const PAGES: readonly PageSpec[] = [
  {
    route: "index.html",
    dir: "/",
    title: "Vellum · an atelier of imaginary cartography",
    ogTitle: "Vellum · an atelier of imaginary cartography",
    description:
      "Procedurally generated fantasy atlases: deterministic worlds drawn as antique, topographic, ink, and nautical SVG charts.",
    tagline: "an atelier of imaginary cartography",
    // Occurs ONLY inside the script (the form tag's own id would match anywhere): proves the intercept exists, not merely the form.
    inlineScript: 'getElementById("seed-form")',
    // Landfall Sub 1 (#455): home is an app surface now (the stage camera) AND keeps the #289 intercept exception.
    scriptSrc: "app.bundle.js",
    // Landfall Sub 2 (#457): the ceremony veil must dress FIRST PAINT, which no deferred module can; ratified at PR #467 after the incognito flash.
    prePaintScript: 'v.id = "lf-veil"',
  },
  {
    route: "faq/index.html",
    dir: "/faq/",
    current: "Q & A",
    room: "Questions & Answers",
    title: "Questions & Answers · Vellum",
    ogTitle: "Questions and Answers · Vellum",
    description:
      "How Vellum works: seeds, determinism, terrain and rivers, climate and styles, and how to make and reproduce your own maps.",
    tagline: "how the worlds are made",
    pageScript: /classList\.toggle\([`"']inked[`"']/,
  },
  {
    route: "glossary/index.html",
    dir: "/glossary/",
    current: "Glossary",
    room: "The Glossary",
    title: "The Glossary · Vellum",
    ogTitle: "The Glossary · Vellum",
    description:
      "A glossary of the cartography, heraldry, seamanship, and geography vocabulary printed on Vellum's charts, in its gazetteer, its voyage journal, and across its realm names.",
    tagline: "the words on the charts",
    pageScript: /classList\.toggle\([`"']inked[`"']/,
  },
  {
    route: "explorer/index.html",
    dir: "/explorer/",
    current: "Explorer",
    room: "The Explorer",
    title: "The Explorer · Vellum",
    ogTitle: "The Explorer · Vellum",
    description: "Generate procedural fantasy maps in your browser. Every seed is a world.",
    tagline: "every seed is a world, draw one",
    scriptSrc: "./app.bundle.js",
    chartRoom: true,
  },
  {
    route: "print-room/index.html",
    dir: "/print-room/",
    current: "Print Room",
    room: "The Print Room",
    title: "The Print Room · Vellum",
    ogTitle: "The Print Room · Vellum",
    description:
      "The atelier's print room: bring a world in from the Explorer or call up a seed by number, pull a proof, and take the chart home.",
    tagline: "take a world home",
    scriptSrc: "./app.bundle.js",
    chartRoom: true,
  },
  {
    route: "reading-room/index.html",
    dir: "/reading-room/",
    current: "Reading Room",
    room: "The Reading Room",
    title: "The Reading Room · Vellum",
    ogTitle: "The Reading Room · Vellum",
    description:
      "The atelier's reading room: sit with any seed's world and watch its founding voyage flow into its recorded ages on one continuous timeline.",
    tagline: "watch a world live",
    scriptSrc: "./app.bundle.js",
    chartRoom: true,
  },
  {
    route: "seed-of-the-day/index.html",
    dir: "/seed-of-the-day/",
    current: "Today",
    room: "The Seed of the Day",
    title: "The Seed of the Day · Vellum",
    ogTitle: "The Seed of the Day · Vellum",
    description:
      "A new procedural world every day: today's date is the seed, drawn as an antique chart with a line from its gazetteer. Same day, same world, everywhere.",
    ogDescription:
      "A new procedural world every day: today's date is the seed, drawn as an antique chart with a line from its gazetteer.",
    tagline: "today's date is the seed",
    scriptSrc: "app.bundle.js",
    chartRoom: true,
  },
  {
    route: "prospect/index.html",
    dir: "/prospect/",
    room: "The Prospect",
    title: "The Prospect · Vellum",
    ogTitle: "The Prospect · Vellum",
    description:
      "Any settlement's engraved townscape plate: the second camera beside the chart, drawn side-on from the place's own ground.",
    tagline: "the second camera",
    scriptSrc: "./app.bundle.js",
    chartRoom: true,
  },
  {
    route: "ribbon/index.html",
    dir: "/ribbon/",
    room: "The Wayfarer's Ribbon",
    title: "The Wayfarer's Ribbon · Vellum",
    ogTitle: "The Wayfarer's Ribbon · Vellum",
    description:
      "Any road journey unrolled as an itinerary strip chart: the way drawn league by league up the scroll, with a compass turning to keep true north.",
    tagline: "the road, unrolled",
    scriptSrc: "./app.bundle.js",
    chartRoom: true,
  },
  {
    route: "gallery/index.html",
    dir: "/gallery/",
    current: "Gallery",
    room: "The Gallery",
    title: "The Gallery · Vellum",
    ogTitle: "The Gallery · Vellum",
    description:
      "A contact sheet of twelve imaginary worlds, drawn by Vellum as antique charts and hung for viewing.",
    tagline: "a dozen worlds, hung for viewing",
    chartRoom: true,
  },
];

const rendered = new Map<string, string>();

before(
  async () => {
    await rm(outDir, { recursive: true, force: true });
    // Clean the generated trees so the dist-audit test sees a deploy-fresh checkout, not stale local files.
    await cleanPublicGenerated(root("public"));
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

/** A page with the shell's sitewide binder taken out, so a count is of the page's OWN scripts (#483). */
const ownScripts = (route: string) => page(route).replace(SHELL_SCRIPT, "");

const headOf = (html: string) => {
  const m = html.match(/<head>([\s\S]*?)<\/head>/);
  assert.ok(m, "the page should have a <head>");
  return m[1];
};

const metaContent = (head: string, attr: "name" | "property", key: string) => {
  const m = head.match(new RegExp(`<meta ${attr}="${key.replace(/[:]/g, "[:]")}" content="([^"]*)"`));
  return m ? decode(m[1]) : undefined;
};

test("astro build emits every page in directory form", () => {
  for (const p of PAGES) {
    assert.ok(rendered.has(p.route), `astro build should emit ${p.route}`);
  }
  assert.match(page("index.html"), /^<!doctype html>/i, "the page should open with the doctype");
});

test("astro.config keeps the contractual shape (site, trailing slash, no fingerprinting knobs)", async () => {
  const config = (await import("../../astro.config.ts")).default;
  assert.equal(config.site, "https://www.vellumworlds.com", "site drives og:url and must stay the custom domain");
  assert.equal(config.trailingSlash, "always", "every internal URL is trailing-slash directory form");
  assert.equal(config.compressHTML, false, "the migrated pages' markup must stay unminified (near-verbatim discipline)");
  assert.equal(config.build?.inlineStylesheets, "always", "the shell style must inline, never a fingerprinted file");
  assert.ok(!("base" in config), "base must stay the default '/' (root-absolute assets break otherwise)");
  assert.ok(!("outDir" in config), "outDir must stay the default ./dist (deploy.yml uploads path: dist)");
});

test("BaseLayout prefetches the room shells so a first click commits instantly (#329)", () => {
  const layout = readFileSync(root("src/layouts/BaseLayout.astro"), "utf8");
  assert.ok(layout.includes('rel="prefetch"'), "the shell prefetches sibling rooms");
  assert.match(
    layout,
    /NAV_ITEMS[\s\S]{0,200}rel="prefetch"|rel="prefetch"[\s\S]{0,200}NAV_ITEMS/,
    "the prefetch list derives from NAV_ITEMS, never a hand-copied route list",
  );
});

test("the shell is authored exactly once: pages carry no header/nav/footer/meta boilerplate", () => {
  const layout = readFileSync(root("src/layouts/BaseLayout.astro"), "utf8");
  for (const marker of ["<footer>", 'class="rooms"', 'property="og:title"', 'name="twitter:card"', "<title>"]) {
    assert.ok(layout.includes(marker), `BaseLayout.astro should own the shell marker ${marker}`);
  }
  assert.ok(layout.includes("NAV_ITEMS"), "the layout should render the typed nav data, not hand-authored items");

  for (const p of PAGES) {
    const source = readFileSync(root(`src/pages/${p.route.replace("index.html", "index.astro")}`), "utf8");
    // Meta-attribute forms: a bare "og:" false-positives on prose ("log:").
    for (const marker of ["<footer", 'class="rooms"', 'property="og:', 'name="twitter:', "<title", "<header", "<html", "<head"]) {
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
      ["property", "og:url", `https://www.vellumworlds.com${p.dir}`],
      ["property", "og:type", "website"],
      ["property", "og:site_name", "Vellum"],
      ["property", "og:image", "https://www.vellumworlds.com/og.png"],
      ["property", "og:image:width", "1200"],
      ["property", "og:image:height", "630"],
      ["property", "og:image:alt", "A Vellum antique chart beside the Vellum wordmark."],
      ["name", "twitter:card", "summary_large_image"],
      ["name", "twitter:image", "https://www.vellumworlds.com/og.png"],
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
    assert.ok(!/<link(?![^>]*(?:rel="icon"|rel="stylesheet"|rel="prefetch"))/.test(head), `${p.route} has only icon/stylesheet/prefetch links`);
    assert.ok(!head.includes("canonical"), "no canonical tags exist today and the layout must not invent them");
  }
});

test("the canonical nav renders the typed items flat, root-absolute, one aria-current span (#461 ruling 1)", () => {
  assert.deepEqual(
    NAV_ITEMS.map((i) => i.label),
    ["Today", "Explorer", "Reading Room", "Print Room", "Gallery", "Q & A", "Glossary"],
    "the Running Head six (#268) plus the Reading Room (#221), seated beside the Explorer it watches",
  );
  for (const item of NAV_ITEMS) {
    assert.match(item.href, /^\/([a-z0-9-]+\/)*$/, `${item.label} href must be root-absolute directory form`);
  }
  assert.ok(!NAV_ITEMS.some((i) => i.href === "/"), "there is no Home item: the wordmark carries the home link");
  // The Fell SC cut sets the small caps, so nav labels stay mixed-case strings.
  for (const item of NAV_ITEMS) {
    assert.doesNotMatch(item.label, /[A-Z]{2,}/, `${item.label} must not be hand-uppercased`);
  }
  for (const p of PAGES) {
    const html = page(p.route);
    const navs = [...html.matchAll(/<nav class="rooms" aria-label="The rooms">([\s\S]*?)<\/nav>/g)];
    assert.equal(navs.length, 1, `${p.route} should have exactly one rooms nav (semantic <nav>)`);
    const nav = navs[0][1];

    const parts = [
      ...nav.matchAll(
        /<a href="([^"]+)">([^<]+)<\/a>|<span aria-current="page">([^<]+)<\/span>/g,
      ),
    ];
    assert.deepEqual(
      parts.map((m) => decode(m[2] ?? m[3])),
      NAV_ITEMS.map((i) => i.label),
      `${p.route} nav renders every item in NAV_ITEMS order`,
    );
    for (const m of parts) {
      if (m[2] !== undefined) {
        const item = NAV_ITEMS.find((i) => i.label === decode(m[2]));
        assert.equal(m[1], item?.href, `${p.route} nav link ${m[2]} uses the root-absolute href`);
      }
    }
    const currents = parts.filter((m) => m[3] !== undefined);
    assert.deepEqual(
      currents.map((m) => decode(m[3])),
      p.current ? [p.current] : [],
      p.current
        ? `${p.route} marks exactly its own page aria-current, as an unlinked span (brightened AND underlined, never color alone)`
        : `${p.route} is not a nav item, so no aria-current`,
    );
    assert.ok(!nav.includes("manicule"), `${p.route}: the manicule retired with the folio band (#461 ruling 1)`);
    const seps = nav.split('<span class="sep" aria-hidden="true">').length - 1;
    assert.equal(seps, NAV_ITEMS.length - 1, `${p.route} items are dotted apart by hidden separator spans`);
  }
});

test("the layout ships the cluster's ratified pins: leading, weight, the aria-current span (#461)", () => {
  for (const p of PAGES) {
    const head = headOf(page(p.route));
    const style = head.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    assert.ok(style, `${p.route} should inline the shell <style>`);
    // The inlined shell CSS arrives minified, so tolerate .72rem and bare attr values.
    const css = style[1];
    assert.match(
      css,
      /\.rooms\s*\{[^}]*font-size:\s*0?\.72rem/,
      "one nav font size everywhere (the mockup's 0.72rem cluster nav)",
    );
    assert.match(
      css,
      /\.rooms\s+\[aria-current=(?:"page"|page)\]\s*\{[^}]*display:\s*inline-block/,
      "the current label joins motion.css's inline-block rule so a multi-word label cannot wrap mid-label",
    );
    // The you-are-here marker never relies on color alone (#268, re-ratified at #461): brightened AND underlined.
    assert.match(
      css,
      /\.rooms\s+\[aria-current=(?:"page"|page)\]\s*\{[^}]*color:\s*var\(--parchment-bright\)/,
      "the current label brightens against the deep",
    );
    assert.match(
      css,
      /\.rooms\s+\[aria-current=(?:"page"|page)\]\s*\{[^}]*text-decoration(?:-line)?:\s*underline/,
      "the current label is underlined",
    );
    // The second addendum on #461: the cluster must NOT inherit the page's reading line-height; page css sets body leading per page and the cluster pins its own.
    assert.match(
      css,
      /(?:header\.chrome|\.chrome)\s*\{[^}]*line-height:\s*normal/,
      "the cluster pins line-height normal so the page's 1.6 cannot inflate its gaps",
    );
    assert.match(css, /\.wordmark\s*\{[^}]*line-height:\s*1\.15/, "the wordmark pins the mockup's 1.15");
    assert.match(css, /\.wordmark\s*\{[^}]*letter-spacing:\s*0?\.12em/, "the wordmark wears the mockup's tracking");
    // #288's tag swap still means the wordmark is h1 on home and p on rooms, opposite UA weights, no bold cut in the face: both weights stay pinned.
    assert.match(css, /\.wordmark\s*\{[^}]*font-weight:\s*400/, "the wordmark pins the cluster's 400 against the h1 UA bold");
    assert.match(css, /\.room-name\s*\{[^}]*font-weight:\s*400/, "the room name pins 400 against its h1's UA bold");
    assert.ok(!css.includes(".head-rule"), "the folio's double rule retired with the band (#461 ruling 1)");
    assert.ok(!css.includes(".manicule"), "the manicule retired with the folio nav (#461 ruling 1)");
    assert.ok(!css.includes(".topnav"), "the folio topnav retired; the cluster's .rooms nav replaced it");
  }
});

test("the phone doors: EVERY shelled page renders the rooms reveal ahead of its nav (#461, then #483's option-1 ruling)", () => {
  // The mockup's under-900px nav stand-down stranded four rooms (the legend carries four doors, not seven); the ruled replacement is a no-JS checkbox burger revealing the same nav. Home-only until Sub 6c, when the drawer became the shell's and every room's nav folds down the same way.
  for (const p of PAGES) {
    const html = page(p.route);
    const reveal = html.indexOf('class="rooms-reveal"');
    assert.ok(reveal > -1, `${p.route} renders the rooms reveal: one drawer, the same on every page`);
    assert.match(html, /<input type="checkbox"[^>]*class="rooms-reveal"[^>]*aria-label/, `${p.route}'s reveal is a labelled native checkbox (keyboard-operable with no bundle)`);
    assert.ok(reveal < html.indexOf('<nav class="rooms"'), `${p.route}'s reveal precedes the nav it reveals (the ~ combinator needs the order)`);
  }
});

test("a page whose markup carries the survey sheet passes desk open (#461, the interim rule's converse)", () => {
  // The layout throws on desk without room, but nothing stopped a converted page from forgetting desk="open" and shipping a desk panel wrapped around a full-bleed sheet (skeptic finding 9).
  // The survey sheet is the BARE <div class="sheet">; the Explorer's chart mount is class="sheet" id="sheet", a different animal (sheet-frame.test.ts keys the same way).
  for (const p of PAGES) {
    if (p.route === "index.html") continue;
    const source = readFileSync(root(`src/pages/${p.route.replace("index.html", "index.astro")}`), "utf8");
    if (source.includes('<div class="sheet">')) {
      assert.match(source, /desk="open"/, `${p.route} carries the survey sheet, so its layout call must open the desk`);
    } else {
      assert.ok(!source.includes('desk="open"'), `${p.route} has no survey sheet, so it keeps the interim desk panel`);
    }
  }
});

test("the head cluster: wordmark, the atelier tagline, then the rooms nav, fixed on the deep (#461 ruling 1)", () => {
  // Astro entity-encodes text expressions: & and apostrophes arrive escaped.
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/'/g, "&#39;");
  for (const p of PAGES) {
    const html = page(p.route);
    assert.ok(
      html.includes('<a href="/">Vellum</a>'),
      `${p.route} wordmark must be the home link on every page, home included (mixed case: Fell SC sets the small caps)`,
    );
    if (p.room) {
      assert.ok(
        html.includes(`<h1 class="room-name">${esc(p.room)}</h1>`),
        `${p.route} names its room as the page's h1, standing in the page (#288, re-ratified at #461)`,
      );
      assert.ok(
        html.includes(`<p class="room-tagline">${esc(p.tagline)}</p>`),
        `${p.route} keeps its flourish line under the room name`,
      );
      assert.equal(
        html.includes('<div class="band" aria-hidden="true">'),
        p.chartRoom !== true,
        p.chartRoom
          ? `${p.route} is a chart room: the chart runs under the cluster with no band (#462 ruling 7)`
          : `${p.route} reserves the walnut band the cluster stands on (#461 ruling 5)`,
      );
    } else {
      // Match the markup form, not the bare class: the shell css mentions .room-name on every page.
      assert.ok(
        !html.includes('<h1 class="room-name">'),
        `${p.route} is home: the atelier is not a room`,
      );
      assert.ok(
        !html.includes('class="band"'),
        `${p.route} is home: the full-bleed stage needs no band (nothing scrolls beneath the cluster)`,
      );
    }
    // The cluster's tagline is the SITE line on every page; the per-page flourish moved under the room name.
    assert.ok(
      html.includes('<p class="tagline">an atelier of imaginary cartography</p>'),
      `${p.route} carries the atelier tagline in the cluster`,
    );
    const [head, tag, nav] = ['<header class="chrome">', 'class="tagline"', '<nav class="rooms"'].map((m) =>
      html.indexOf(m),
    );
    assert.ok(head > -1 && head < tag && tag < nav, `${p.route} keeps the cluster order: wordmark head, tagline, rooms nav`);
    for (const gone of ['class="running-head"', 'class="head-rule"', 'class="topnav"']) {
      assert.ok(!html.includes(gone), `${p.route}: the folio ${gone} retired with the cluster (#461)`);
    }
  }
  // .plate left this list at #472: the shelf revived the survey plates (as .lf-shelf-grid, so grid3 stays a tombstone).
  for (const gone of ['class="lede"', 'class="seedline"', 'class="cartouche"', 'class="banners"', 'class="grid3"']) {
    assert.ok(!page("index.html").includes(gone), `home retired its ${gone} section (#289 hero, then the #470 below-stage removals)`);
  }
});

test("every page's h1 names the page: the room on room pages, the wordmark on home (#288)", () => {
  const decodeAll = (s: string) => decode(s.replace(/<[^>]*>/g, ""));
  for (const p of PAGES) {
    const html = page(p.route);
    const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
    assert.equal(h1s.length, 1, `${p.route} has exactly one h1`);
    assert.equal(
      normalize(decodeAll(h1s[0][1])),
      p.room ?? "Vellum",
      `${p.route} h1 must name the page itself, not the masthead`,
    );

    const firstHeading = html.search(/<h[1-6]\b/);
    assert.equal(firstHeading, html.search(/<h1\b/), `${p.route} h1 is the first heading on the page`);
    if (p.room) {
      // #461 ruling 1 keeps #288 in the new form: the room name is the h1, standing in the page (on the sheet or the desk panel), not in the fixed cluster.
      const [mainOpen, mainClose] = [html.search(/<main\b/), html.indexOf("</main>")];
      assert.ok(
        mainOpen > -1 && firstHeading > mainOpen && firstHeading < mainClose,
        `${p.route} keeps its h1 standing in the page (inside <main>)`,
      );
    } else {
      const [headOpen, headClose] = [html.indexOf('<header class="chrome">'), html.indexOf("</header>")];
      assert.ok(
        headOpen > -1 && firstHeading > headOpen && firstHeading < headClose,
        `${p.route} is home: the wordmark h1 lives in the cluster`,
      );
    }
  }

  for (const p of PAGES) {
    const html = page(p.route);
    const tag = p.room ? "p" : "h1";
    assert.ok(
      html.includes(`<${tag} class="wordmark"><a href="/">Vellum</a></${tag}>`),
      `${p.route} carries the wordmark as a <${tag} class="wordmark">`,
    );
  }
});

test("titles are computed in the layout from the room, never hand-set (#268)", () => {
  const layout = readFileSync(root("src/layouts/BaseLayout.astro"), "utf8");
  assert.ok(!layout.includes("wordmarkSuffix"), "wordmarkSuffix is retired (#268 reverses the #254 parameterization)");
  assert.ok(layout.includes(" · Vellum"), "the layout owns the title scheme");

  for (const p of PAGES) {
    if (p.room) {
      assert.equal(p.title, `${p.room} · Vellum`, `${p.route} title follows the room scheme`);
    }
    const source = readFileSync(root(`src/pages/${p.route.replace("index.html", "index.astro")}`), "utf8");
    const open = source.match(/<BaseLayout([\s\S]*?)>/);
    assert.ok(open, `${p.route} renders through BaseLayout`);
    for (const gone of ["title=", "ogTitle=", "wordmarkSuffix="]) {
      assert.ok(!open[1].includes(gone), `${p.route} must not hand-set ${gone.slice(0, -1)} (the layout computes it)`);
    }
    if (p.room) {
      // The page hoists the room to a const and hands the SAME value to the layout (the title) and to RoomFolio (the h1), so the two cannot drift.
      assert.ok(source.includes(`const room = "${p.room}"`), `${p.route} hoists its room to a const`);
      assert.ok(open[1].includes("room={room}"), `${p.route} passes the const to the layout`);
      assert.ok(source.includes(`const tagline = "${p.tagline}"`), `${p.route} hoists its tagline to a const`);
      // #462: a converted room stands its name in the RoomFolio corner; the RoomHead on the sheet retired with the last conversion (#464).
      assert.ok(source.includes("<RoomFolio room={room} tagline={tagline}>"), `${p.route} stands its RoomFolio in the page`);
    } else {
      assert.ok(!open[1].includes("room="), `${p.route} is home and passes no room`);
    }
    if (p.ogTitle !== p.title) {
      const normalized = p.ogTitle.replace(" · Vellum", "");
      assert.ok(open[1].includes(`ogRoom="${normalized}"`), `${p.route} normalizes its og twin via ogRoom`);
    } else {
      assert.ok(!open[1].includes("ogRoom="), `${p.route} needs no ogRoom (its room is already normalized)`);
    }
  }
});

test("the footer is constant and appears exactly once per page; a chart room alone has none (#462 ruling 9)", () => {
  for (const p of PAGES) {
    const footers = [...page(p.route).matchAll(/<footer>([\s\S]*?)<\/footer>/g)];
    if (p.chartRoom) {
      assert.equal(footers.length, 0, `${p.route} is a chart room: the bottom band is the legend row's`);
      continue;
    }
    assert.equal(footers.length, 1, `${p.route} has exactly one footer`);
    assert.equal(normalize(footers[0][1]), "Vellum · an atelier of imaginary cartography");
  }
});

// A guard, green from the start: <main> is load-bearing (page CSS centers via it) and the end-anchored close means nothing can be injected after the footer unseen.
test("the body skeleton pins the shell order: band, cluster, main, footer on the deep (#461)", () => {
  for (const p of PAGES) {
    const html = page(p.route);
    if (p.chartRoom) {
      assert.match(html, /<body class="room chart-room">\s*<header class="chrome">/, `${p.route} is a chart room: no band, the cluster floats over the chart`);
      assert.match(
        html,
        /<\/main>\s*<script type="module">[\s\S]*?<\/script>\s*<\/body>\s*<\/html>\s*$/,
        `${p.route} must close main, then the shell's own script, then body and html with nothing after: no footer on a chart room`,
      );
      continue;
    }
    if (p.room) {
      assert.match(
        html,
        /<body class="room">\s*<div class="band" aria-hidden="true"><\/div>\s*<header class="chrome">/,
        `${p.route} body must open body.room > band > cluster`,
      );
    } else {
      assert.match(html, /<body>\s*<header class="chrome">/, `${p.route} is home: no band, the cluster floats on the stage`);
    }
    assert.match(
      html,
      /<\/main>\s*<footer>[\s\S]*?<\/footer>\s*<script type="module">[\s\S]*?<\/script>\s*<\/body>\s*<\/html>\s*$/,
      `${p.route} must close main, then the footer on the deep, then the shell's own script, then body and html with nothing after`,
    );
  }
});

test("the shell's own script rides every page, inlined by Astro rather than emitted as a file (#483 ruling, option 1)", () => {
  // The ruling's preferred form, taken by measurement: the chunk is under Vite's 4096-byte inline limit, so Astro writes it into the html and emits nothing. "the deploy artifact serves no raw app source" below is what reds if it ever crosses.
  for (const p of PAGES) {
    const html = page(p.route);
    const shell = html.match(SHELL_SCRIPT);
    assert.ok(shell, `${p.route} carries the shell's script: the drawer's manners are the same on every page`);
    assert.ok(html.indexOf(shell[0]) > html.indexOf(p.chartRoom ? "</main>" : "</footer>"), `${p.route} runs it last, after everything it binds`);
  }
});

test("each app page keeps its bundle-twin module script, rendered verbatim inside <main>", () => {
  // The app entry stays the Vite-pressed twin; a module script is deferred by spec, so rendering inside <main> is behavior-identical to the old after-main position. The shell's script is every page's and is taken out first, so these counts stay the page's OWN.
  for (const p of PAGES) {
    const tag = `<script type="module" src="${p.scriptSrc}"></script>`;
    if (p.pageScript !== undefined) {
      // Inlined, never a file: an emitted _astro/*.js would be raw app source in the artifact (the "no raw app source" audit below is the cliff).
      const html = ownScripts(p.route);
      const scripts = [...html.matchAll(/<script\b[^>]*>/g)].map((m) => m[0]);
      assert.deepEqual(scripts, ['<script type="module">'], `${p.route} carries exactly one script of its own, inlined by Astro`);
      assert.match(html, p.pageScript, `${p.route}'s script binds the index`);
      assert.ok(html.indexOf("<script") < html.indexOf("<footer>"), `${p.route} script renders inside <main>, before the footer`);
      continue;
    }
    if (p.scriptSrc === undefined && p.inlineScript === undefined) {
      assert.ok(!ownScripts(p.route).includes("<script"), `${p.route} is a content page and ships no script of its own`);
      continue;
    }
    const html = ownScripts(p.route);
    if (p.inlineScript !== undefined) {
      const scripts = [...html.matchAll(/<script\b/g)];
      const expected = (p.scriptSrc === undefined ? 1 : 2) + (p.prePaintScript === undefined ? 0 : 1);
      assert.equal(scripts.length, expected, `${p.route} carries exactly ${expected} script(s)`);
      assert.ok(html.includes(p.inlineScript), `${p.route} script targets ${p.inlineScript}`);
      if (p.prePaintScript !== undefined) {
        assert.ok(html.includes(p.prePaintScript), `${p.route} carries the pre-paint veil script (${p.prePaintScript})`);
        assert.ok(
          html.indexOf(p.prePaintScript) < html.indexOf('class="landfall"'),
          `${p.route}'s pre-paint script parses before the stage, so first paint wears the veil`,
        );
      }
      assert.ok(html.indexOf("<script") < html.indexOf("<footer>"), `${p.route} script renders inside <main>, before the footer`);
      if (p.scriptSrc === undefined) {
        assert.ok(!html.includes('type="module"'), `${p.route} ships no module bundle, only the inline intercept`);
        continue;
      }
    }
    assert.ok(html.includes(tag), `${p.route} should load its bundle twin via ${tag}`);
    assert.ok(html.indexOf(tag) < html.indexOf(p.chartRoom ? "</main>" : "<footer>"), `${p.route} script renders inside <main>`);
    assert.doesNotMatch(html, /src="(\.\/)?app\.js"/, `${p.route} must not load the raw ESM entry`);
  }
});

// #487 (the Atelier Kit's one PR before #465): the five shapes the rooms pasted are components, and the BUILT html carries each as one shape. Measured 2026-09-02 against the #464 tree's build: home, the FAQ, the Gallery, the Glossary and the atlas byte-identical; the Print Room, the Reading Room and Today identical after collapsing whitespace between tags; the Prospect and the Ribbon the same plus one apostrophe entity each (Astro escapes a prop's text); the Explorer the same plus data-zoom on its three presses, which nothing on that page reads (its glass.ts binds by id).
const KIT_FOG = '<div class="fog a" aria-hidden="true"></div><div class="fog b" aria-hidden="true"></div>';
const KIT_VIGNETTES = '<div class="vignette top" aria-hidden="true"></div><div class="vignette bottom" aria-hidden="true"></div>';
const KIT_GLASS = (id: string) => `<div class="chrome corner br zoomery"${id} role="group" aria-label="The Surveyor's Glass">
  <button id="zoom-in" class="zoom-btn" type="button" data-zoom="in" aria-label="Lean closer (zoom in)" title="Lean closer"><svg aria-hidden="true" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="6.8" cy="6.8" r="4.2"></circle><path d="M9.9 9.9l3.7 3.7"></path><path d="M6.8 4.9v3.8M4.9 6.8h3.8"></path></svg></button>
  <button id="zoom-reset" class="zoom-btn" type="button" data-zoom="fit" aria-label="The full sheet (reset the view)" title="The full sheet"><svg aria-hidden="true" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.4 2.6h6.6l2.6 2.6v8.2H3.4z"></path><path d="M10 2.6v2.6h2.6"></path><path d="M5.3 9.7c1-.9 1.9.5 2.9-.3.8-.7 1.5-.2 2.2-.7"></path></svg></button>
  <button id="zoom-out" class="zoom-btn" type="button" data-zoom="out" aria-label="Stand back (zoom out)" title="Stand back"><svg aria-hidden="true" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="6.8" cy="6.8" r="4.2"></circle><path d="M9.9 9.9l3.7 3.7"></path><path d="M4.9 6.8h3.8"></path></svg></button>
  <div class="zoom-keys" aria-hidden="true">
    <span><kbd>+</kbd> <kbd>&#8722;</kbd> lean closer, stand back</span>
    <span><kbd>&#8592;&#8593;&#8594;&#8595;</kbd> pan the sheet</span>
    <span><kbd>0</kbd> the full sheet</span>
  </div>
</div>`;
const ROAD = /<a( id="[\w-]+")? class="legend-btn( gold)?"( data-road="[\w-]+")? href="[^"]+"><span class="verb"( id="[\w-]+")?>[^<]+<\/span><span class="room">[^<]+<\/span><\/a>/;

test("the kit's lifted shapes render one shape on every page that wears them: the fog, the vignettes, the Glass, the chart folio's lines, a road out (#487)", () => {
  const chartRooms = PAGES.filter((p) => p.chartRoom && p.dir !== "/gallery/");
  for (const p of PAGES.filter((q) => q.room)) {
    const html = page(p.route);
    assert.equal(html.split(KIT_FOG).length - 1, 1, `${p.route} wears the fog pair once`);
  }
  for (const p of chartRooms) {
    assert.equal(page(p.route).split(KIT_VIGNETTES).length - 1, 1, `${p.route} wears the vignette pair once`);
  }
  assert.ok(!page("gallery/index.html").includes('class="vignette'), "the Gallery wears no vignettes (#464: its captions scroll through a fixed band)");
  for (const p of chartRooms) {
    const html = page(p.route);
    const glass = KIT_GLASS(p.dir === "/explorer/" ? ' id="zoom-controls"' : "");
    assert.ok(html.includes(glass), `${p.route} carries the Glass as the kit renders it`);
    const folio = html.match(/<div class="chrome corner bl folio">([\s\S]*?)<\/div>/);
    assert.ok(folio, `${p.route} carries the chart folio`);
    const lines = folio![1]!.trim();
    assert.match(lines, /^(<p class="[\w -]+" id="[\w-]+"><\/p>)+$/, `${p.route}'s folio holds nothing but its lines: ${lines}`);
    assert.match(lines, /^<p class="folio-title" id="folio-title"><\/p>/, `${p.route}'s folio leads with the world's name`);
  }
  assert.ok(!page("index.html").includes(KIT_FOG) && !page("index.html").includes('class="zoomery'), "home keeps its own stage dress (#461)");
  for (const p of PAGES) {
    const html = page(p.route);
    for (const [road] of html.matchAll(/<a[^>]*class="legend-btn[^>]*>[\s\S]*?<\/a>/g)) {
      assert.match(road, ROAD, `${p.route}: a road out is the kit's shape: ${road}`);
    }
    // The gold variant reaches the build (guard-prover, 2026-09-02): every road the page marks gold renders gold, and no other does.
    const source = readFileSync(root(`src/pages/${p.route.replace("index.html", "index.astro")}`), "utf8");
    const goldTags = [...source.matchAll(/<LegendButton [^>]*\bgold\b/g)].length;
    assert.equal(html.split('class="legend-btn gold"').length - 1, goldTags, `${p.route} renders exactly the gold roads its source marks`);
  }
  assert.ok(page("prospect/index.html").includes('class="legend-btn gold"'), "the Prospect's road back to the Explorer is gold (a known gold call site, so the count above is not vacuous)");
});

test("the seed form floats on the stage as the mockup's corner chrome, its ratified semantics whole (#470, was the #289 cartouche hero)", () => {
  // normalize: prose markers must not break on source-line reflow.
  const html = normalize(decode(page("index.html")));
  const order = [
    'class="landfall"',
    'id="seed-form"',
    "Give Vellum a number.",
    "It gives you back a world.",
    'id="seed-input"',
    'value="42"',
    "Draw it",
    "every chart is reproducible from the number in its margin",
  ];
  let at = html.indexOf('class="landfall"') - 1;
  for (const marker of order) {
    const next = html.indexOf(marker, at + 1);
    assert.ok(next > at, `the floating seed form keeps its order at ${marker}`);
    at = next;
  }
  assert.ok(at < html.indexOf("</section>", html.indexOf('class="landfall"')), "the form rides the landfall section: the map is the page now");
  // The ratified semantics (#455, restated at #470): digits pattern, GET fallback, the intercept's marker; the PAGES table pins the intercept script itself.
  const form = html.slice(html.indexOf("<form"), html.indexOf("</form>"));
  assert.ok(form.includes('action="explorer/"') && form.includes('method="get"'), "the no-JS GET fallback survives the move");
  assert.ok(form.includes('name="seed"'), "the fallback still names its query");
  assert.ok(form.includes('pattern="[0-9]*"') && form.includes('inputmode="numeric"'), "the digits-only pattern and keypad survive the move");
  assert.ok(!html.includes('class="flourish'), "the cartouche frame retired with its section: the corner chrome is the mockup's, unframed");
});

test("the Notice stamps the deep before the panel's prose; the count is ten (#289, reshaped at #459)", () => {
  // normalize: prose markers must not break on source-line reflow.
  const html = normalize(decode(page("index.html")));
  const order = [
    "Notice to Mariners",
    "No feature on this chart exists.",
    "Soundings are imaginary.",
    "Vellum surveys worlds that don't exist",
    "ten invented languages, one per culture",
    "Under the hood",
  ];
  let at = -1;
  for (const marker of order) {
    const next = html.indexOf(marker);
    assert.ok(next > at, `home keeps its prose order at ${marker}`);
    at = next;
  }
  assert.ok(html.includes("quarrelsome realms"), "the lede's realms survive the merge into the borders sentence");
  assert.ok(!html.includes("six invented"), "the six-language miscount is gone from home (#289)");
});

test("every internal link and embed on the rendered pages resolves", () => {
  // Generated per deploy and gitignored (absent on a fresh checkout; CI runs npm test before npm run build), so these resolve only against this allowlist.
  const generated = [
    "/atlas/",
    "/gallery/index.css",
    "/explorer/app.bundle.js",
    "/print-room/app.bundle.js",
    "/seed-of-the-day/app.bundle.js",
    "/reading-room/app.bundle.js",
    "/prospect/app.bundle.js",
    "/ribbon/app.bundle.js",
    "/app.bundle.js",
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
      if (/^\/gallery\/chart-\d+\.svg$/.test(path)) continue;
      const target = path.endsWith("/") ? `${path}index.html` : path;
      assert.ok(existsSync(root(`public${target}`)), `${p.route} links ${url}: public${target} should exist`);
    }
  }
});

test("the support set the pages depend on is committed in public/", () => {
  // og:image and the fonts.css url()s are references the link-resolver test cannot see, so pin their existence here.
  for (const file of ["motion.css", "fonts.css", "favicon.svg", "og.png", "index.css"]) {
    assert.ok(existsSync(root(`public/${file}`)), `public/${file} should exist`);
  }
});

test("the deploy artifact serves no raw app source, no .d.ts, and no engine emit (#260)", async () => {
  // Since #260 every served .js is a pressed twin or a chunk; the before() clean means this audits exactly what COMMITTED public/ contributes.
  const files: string[] = [];
  const walk = async (dir: string): Promise<void> => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) await walk(p);
      else files.push(relative(outDir, p));
    }
  };
  await walk(outDir);
  assert.ok(!existsSync(join(outDir, "explorer", "engine")), "no /explorer/engine/ tree may ship");
  const offenders = files.filter(
    (f) => (f.endsWith(".js") && !f.endsWith(".bundle.js") && !f.startsWith(join("explorer", "chunks") + "/")) || f.endsWith(".d.ts"),
  );
  assert.deepEqual(offenders, [], "no raw .js source or .d.ts may reach the artifact");
});

test("the charts and arms the home page embeds all resolve in public/charts", () => {
  const embeds = [...page("index.html").matchAll(/src="(charts\/[^"]+)"/g)].map(([, u]) => u);
  assert.equal(new Set(embeds).size, 7, "home embeds 7 committed goldens (the stage chart + 3 arms + the shelf's 3 plates, revived at #472)");
  for (const embed of embeds) {
    assert.ok(existsSync(root(`public/${embed}`)), `public/${embed} should exist`);
  }
});

test("the deploy build IS the Astro build (Sub 5 cutover, #206)", async () => {
  const pkg = JSON.parse(await readFile(root("package.json"), "utf8"));
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
