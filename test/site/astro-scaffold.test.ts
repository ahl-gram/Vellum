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
};

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
  for (const marker of ["<footer>", 'class="topnav"', 'property="og:title"', 'name="twitter:card"', "<title>"]) {
    assert.ok(layout.includes(marker), `BaseLayout.astro should own the shell marker ${marker}`);
  }
  assert.ok(layout.includes("NAV_ITEMS"), "the layout should render the typed nav data, not hand-authored items");

  for (const p of PAGES) {
    const source = readFileSync(root(`src/pages/${p.route.replace("index.html", "index.astro")}`), "utf8");
    // Meta-attribute forms: a bare "og:" false-positives on prose ("log:").
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

test("the canonical nav renders the typed items flat, root-absolute, one manicule-marked aria-current", () => {
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
    const navs = [...html.matchAll(/<nav class="topnav">([\s\S]*?)<\/nav>/g)];
    assert.equal(navs.length, 1, `${p.route} should have exactly one topnav (semantic <nav>)`);
    const nav = navs[0][1];

    const parts = [
      ...nav.matchAll(
        /<a href="([^"]+)">([^<]+)<\/a>|<span aria-current="page"><span class="manicule" aria-hidden="true">[^<]+<\/span>([^<]+)<\/span>/g,
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
        ? `${p.route} marks exactly its own page aria-current, as an unlinked manicule span`
        : `${p.route} is home: no nav item, so no aria-current`,
    );
    const manicules = nav.split('class="manicule"').length - 1;
    assert.equal(manicules, p.current ? 1 : 0, `${p.route} carries exactly one manicule, on the current page alone`);
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
    // With the manicule, the you-are-here marker never relies on color alone (#268).
    assert.match(
      css,
      /\.topnav\s+\[aria-current=(?:"page"|page)\]\s*\{[^}]*color:\s*var\(--ink-dark\)/,
      "the current label darkens to the shell's ink",
    );
    assert.match(
      css,
      /\.topnav\s+\[aria-current=(?:"page"|page)\]\s*\{[^}]*text-decoration(?:-line)?:\s*underline/,
      "the current label is underlined",
    );
    assert.match(
      css,
      /\.head-rule\s*\{[^}]*border-top:\s*1px solid var\(--ink-dark\)/,
      "the head rule draws its top hairline",
    );
    assert.match(
      css,
      /\.head-rule\s*\{[^}]*border-bottom:\s*1px solid var\(--ink-dark\)/,
      "the head rule draws its bottom hairline",
    );
    // Fell's manicule glyph coverage is inconsistent, so the manicule pins the plain serif stack.
    assert.match(
      css,
      /\.manicule\s*\{[^}]*font-family:\s*['"]?Iowan Old Style/,
      "the manicule never trusts the Fell font for its glyph",
    );
    assert.match(css, /\.wordmark\s*\{[^}]*letter-spacing:\s*0?\.3em/, "the wordmark alone is tracked out");
    // #288 swapped tags whose UA-default weights are the opposite of what renders (h1 bold, p normal); both pins keep the swap pixel-identical.
    assert.match(css, /\.wordmark\s*\{[^}]*font-weight:\s*700/, "the wordmark keeps the weight its h1 gave it");
    assert.match(css, /\.room-name\s*\{[^}]*font-weight:\s*400/, "the room name keeps the weight its p gave it");
    // Page css varies body line-height (1.6 on prose pages, unset elsewhere); the head pins the ratified 1.6 so its geometry matches on every page.
    for (const [label, sel] of [
      [".wordmark", "\\.wordmark"],
      [".room-name", "\\.room-name"],
      [".tagline", "\\.tagline"],
      [".topnav", "\\.topnav"],
    ] as const) {
      assert.match(
        css,
        new RegExp(`${sel}\\s*\\{[^}]*line-height:\\s*1\\.6`),
        `${label} pins line-height 1.6 so the head is identical on every page`,
      );
    }
  }
});

test("the running head: uniform wordmark link, room name + tagline, double rule, then the nav band (#268)", () => {
  // Astro entity-encodes text expressions: & and apostrophes arrive escaped.
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/'/g, "&#39;");
  for (const p of PAGES) {
    const html = page(p.route);
    assert.ok(
      html.includes('<a href="/">VELLUM</a>'),
      `${p.route} wordmark must be the home link on every page, home included`,
    );
    if (p.room) {
      assert.ok(
        html.includes(`<h1 class="room-name">${esc(p.room)}</h1>`),
        `${p.route} names its room on the running head, as the page's h1 (#288)`,
      );
    } else {
      // Match the markup form, not the bare class: the shell css mentions .room-name on every page.
      assert.ok(
        !html.includes('<h1 class="room-name">'),
        `${p.route} is home: the atelier is not a room, the tagline stands alone`,
      );
    }
    assert.ok(html.includes(`<p class="tagline">${esc(p.tagline)}</p>`), `${p.route} keeps its tagline`);

    const [head, rule, nav] = ['class="running-head"', 'class="head-rule"', 'class="topnav"'].map((m) =>
      html.indexOf(m),
    );
    assert.ok(head > -1 && head < rule && rule < nav, `${p.route} keeps the order: running head, double rule, nav band`);
  }

  const homeHeader = page("index.html").match(/<header>([\s\S]*?)<\/header>/);
  assert.ok(homeHeader, "home should have a header");
  const order = ['class="wordmark"', 'class="tagline"', '<nav class="topnav">'];
  let at = -1;
  for (const marker of order) {
    const next = homeHeader[1].indexOf(marker);
    assert.ok(next > at, `home header keeps its order at ${marker}`);
    at = next;
  }
  for (const gone of ['class="lede"', 'class="seedline"']) {
    assert.ok(!page("index.html").includes(gone), `home retired its ${gone} banner (#289 cartouche hero)`);
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
      p.room ?? "VELLUM",
      `${p.route} h1 must name the page itself, not the masthead`,
    );

    const firstHeading = html.search(/<h[1-6]\b/);
    assert.equal(firstHeading, html.search(/<h1\b/), `${p.route} h1 is the first heading on the page`);
    const [headOpen, headClose] = [html.indexOf("<header>"), html.indexOf("</header>")];
    assert.ok(
      headOpen > -1 && firstHeading > headOpen && firstHeading < headClose,
      `${p.route} keeps its h1 inside the running head`,
    );
  }

  for (const p of PAGES) {
    const html = page(p.route);
    const tag = p.room ? "p" : "h1";
    assert.ok(
      html.includes(`<${tag} class="wordmark"><a href="/">VELLUM</a></${tag}>`),
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
      assert.ok(open[1].includes(`room="${p.room}"`), `${p.route} passes its room to the layout`);
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

test("the footer is constant and appears exactly once per page", () => {
  for (const p of PAGES) {
    const footers = [...page(p.route).matchAll(/<footer>([\s\S]*?)<\/footer>/g)];
    assert.equal(footers.length, 1, `${p.route} has exactly one footer`);
    assert.equal(normalize(footers[0][1]), "VELLUM · AN ATELIER OF IMAGINARY CARTOGRAPHY");
  }
});

// A guard, green from the start: <main> is load-bearing (page CSS centers via it) and the end-anchored close means nothing can be injected after the footer unseen.
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
  // The app entry stays the Vite-pressed twin; a module script is deferred by spec, so rendering inside <main> is behavior-identical to the old after-main position.
  for (const p of PAGES) {
    const tag = `<script type="module" src="${p.scriptSrc}"></script>`;
    if (p.scriptSrc === undefined && p.inlineScript === undefined) {
      assert.ok(!page(p.route).includes("<script"), `${p.route} is a content page and ships no script`);
      continue;
    }
    const html = page(p.route);
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
    assert.ok(html.indexOf(tag) < html.indexOf("<footer>"), `${p.route} script renders inside <main>, before the footer`);
    assert.doesNotMatch(html, /src="(\.\/)?app\.js"/, `${p.route} must not load the raw ESM entry`);
  }
});

test("the cartouche hero: frame, hook, seed form, chart plate, fused caption, in order (#289)", () => {
  // normalize: prose markers must not break on source-line reflow.
  const html = normalize(decode(page("index.html")));
  const order = [
    'class="cartouche"',
    "Give Vellum a number.",
    "It gives you back a world.",
    'class="divider"',
    'id="seed-form"',
    'value="42"',
    "Draw it",
    "Every chart is reproducible from the number in its margin",
    "chart-42-antique.svg",
    "drawn in the antique manner",
    "stroke for stroke",
  ];
  // Anchored at the cartouche and resuming after each marker: the stage above legitimately embeds the hero chart's src first (#455).
  let at = html.indexOf('class="cartouche"') - 1;
  for (const marker of order) {
    const next = html.indexOf(marker, at + 1);
    assert.ok(next > at, `home hero keeps its order at ${marker}`);
    at = next;
  }
  // The frame carries all four corner flourishes (D6: at every width).
  const flourishes = [...html.matchAll(/class="flourish/g)];
  assert.equal(flourishes.length, 4, "the cartouche keeps its four corner flourishes");
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

test("the hero charts and arms the home page embeds all resolve in public/charts", () => {
  const embeds = [...page("index.html").matchAll(/src="(charts\/[^"]+)"/g)].map(([, u]) => u);
  assert.equal(new Set(embeds).size, 7, "home embeds the 7 committed goldens (4 charts + 3 arms)");
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
