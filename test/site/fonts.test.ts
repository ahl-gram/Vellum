import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";
import { copyKitFonts, KIT_FONTS } from "../../scripts/kit-fonts.ts";
import { GENERATED_SUBTREES } from "../../scripts/clean-public-generated.ts";
import { atlasDocument, atlasPlateFilename, type AtlasDocumentData } from "../../src/atlas/document.ts";
import { buildGallery } from "../../src/cli/gallery.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { STYLES } from "../../src/render/style.ts";
import { startServer } from "../../e2e/site-server.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";

// The Punchcutter's Case (Issue #228): three self-hosted OFL faces for the site chrome; the charts' own SVG lettering is out of scope, so no chart byte moves.

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));

const WOFF2 = [
  "im-fell-english-sc-latin-400-normal.woff2",
  "im-fell-english-latin-400-italic.woff2",
  "eb-garamond-latin-400-normal.woff2",
  "eb-garamond-latin-400-italic.woff2",
  "eb-garamond-latin-600-normal.woff2",
  "eb-garamond-latin-700-normal.woff2",
] as const;

test("the self-hosted woff2 files and their OFL license live in design/kit/fonts/, the one copy the site builds from", () => {
  for (const file of WOFF2) {
    const path = root(`design/kit/fonts/${file}`);
    assert.ok(existsSync(path), `design/kit/fonts/${file} should exist`);
    const sig = readFileSync(path).subarray(0, 4).toString("latin1");
    assert.equal(sig, "wOF2", `${file} should be a real WOFF2 (wOF2 signature)`);
  }
  // OFL 1.1 requires the copyright + license accompany the redistributed fonts.
  const ofl = readFileSync(root("design/kit/fonts/OFL.txt"), "utf8");
  assert.match(ofl, /Open Font License/, "design/kit/fonts/OFL.txt should carry the OFL text");
  assert.equal(
    relative(root(""), KIT_FONTS),
    join("design", "kit", "fonts"),
    "every reader of the faces takes this path",
  );
  // 2026-10-02: this git ls-files answers in under 10 ms on a Mac; thirty seconds is a cap on a hang, not a budget.
  const tracked = spawnSync("git", ["ls-files", "--", "public/fonts"], {
    cwd: root(""),
    encoding: "utf8",
    timeout: 30_000,
  });
  assert.equal(tracked.status, 0, `git ls-files failed: ${tracked.stderr}`);
  assert.equal(tracked.stdout, "", "public/fonts/ is generated from the kit, so git tracks nothing there");
});

test("the build copies every file of the kit into the site's fonts, byte for byte", async () => {
  const dir = root("out/test-kit-fonts");
  const from = join(dir, "kit");
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(from, { recursive: true });
  writeFileSync(join(from, "face.woff2"), "wOF2 face");
  writeFileSync(join(from, "OFL.txt"), "SIL Open Font License");
  try {
    await copyKitFonts(join(dir, "public"), from);
    assert.ok(existsSync(join(dir, "public", "fonts")), "the copy wrote no public/fonts/");
    const copied = readdirSync(join(dir, "public", "fonts")).sort();
    assert.deepEqual(copied, ["OFL.txt", "face.woff2"]);
    for (const f of copied)
      assert.deepEqual(readFileSync(join(dir, "public", "fonts", f)), readFileSync(join(from, f)), f);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  assert.ok(
    GENERATED_SUBTREES.includes("fonts"),
    "public/fonts/ is generated, so the clean before regeneration owns it",
  );
  // 2026-10-02: this git check-ignore answers in under 10 ms on a Mac; thirty seconds is a cap on a hang, not a budget.
  const generated = ["OFL.txt", ...WOFF2].map((f) => `public/fonts/${f}`);
  const ignored = spawnSync("git", ["check-ignore", "--no-index", "--", ...generated], {
    cwd: root(""),
    encoding: "utf8",
    timeout: 30_000,
  });
  assert.ok(
    ignored.status === 0 || ignored.status === 1,
    `git check-ignore failed (${ignored.status}): ${ignored.stderr}`,
  );
  assert.deepEqual(
    ignored.stdout.split("\n").filter(Boolean).sort(),
    [...generated].sort(),
    "git does not ignore every generated face, so one could be committed beside the kit's",
  );
});

test("npm run astro:generate's fonts step copies the real kit into the public directory it is given", () => {
  const dir = root("out/test-kit-fonts-cli");
  rmSync(dir, { recursive: true, force: true });
  try {
    // 2026-10-02: the step runs in about 0.1 s here; a minute is a cap on a hang, not a budget.
    const run = spawnSync("node", ["scripts/kit-fonts.ts", dir], { cwd: root(""), encoding: "utf8", timeout: 60_000 });
    assert.equal(run.status, 0, `the step failed: ${run.stderr}`);
    assert.deepEqual(readdirSync(join(dir, "fonts")).sort(), ["OFL.txt", ...WOFF2].sort());
    for (const f of WOFF2)
      assert.deepEqual(readFileSync(join(dir, "fonts", f)), readFileSync(root(`design/kit/fonts/${f}`)), f);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("atlasDocument: the deployed page joins the Case; the offline download falls back", () => {
  const fixture: AtlasDocumentData = {
    title: "The Isle of Café",
    subtitle: "surveyed in the year of the long tide",
    seed: 7,
    hero: { key: "antique", title: "hero", svg: "<svg></svg>" },
    draughtings: [{ key: "ink", title: "Pen & ink", svg: "<svg></svg>" }],
    themes: [{ key: "theme-vegetation", title: "Vegetation", svg: "<svg></svg>" }],
    regions: [{ key: "region-1", title: "Environs", svg: "<svg></svg>" }],
    prospects: [{ key: "prospect-capital", title: "The Prospect of Café", svg: "<svg></svg>" }],
    bannersHtml: "<section></section>",
    chronicleHtml: "<section></section>",
    gazetteerHtml: "<section></section>",
  };

  const deployed = atlasDocument(fixture, (p, s) => atlasPlateFilename(p, s), { anchor: true, motion: true });
  assert.match(deployed, /<link rel="stylesheet" href="\/fonts\.css">/, "the deployed atlas should link /fonts.css");
  assert.match(deployed, /var\(--font-body/, "atlas body chrome should use the body role var");

  const offline = atlasDocument(fixture, (p) => `data:${p.key}`, { anchor: false, motion: false });
  assert.doesNotMatch(offline, /href="\/fonts\.css"/, "the self-contained download links nothing external");
  assert.match(offline, /var\(--font-body,[^)]*serif/, "the download must fall back to the serif stack");
});

test("the gallery page css defers the sub's voice to the house intro role (#324)", async () => {
  const dir = "out/test-fonts-gallery";
  await rm(dir, { recursive: true, force: true });
  try {
    await buildGallery(100, { count: 1, out: dir });
    const css = await readFile(join(dir, "index.css"), "utf8").catch(() => "");
    assert.ok(
      !/p\.sub[^{]*\{[^}]*font-family/.test(css),
      "the sub's voice belongs to /house.css, not the generated css",
    );
    assert.ok(!existsSync(join(dir, "index.html")), "buildGallery must not write the standalone shell anymore");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("the e2e harness serves .woff2 with a real font MIME (no false-positive fallback)", async () => {
  const site = mkdtempSync(join(tmpdir(), "vellum-woff2-"));
  writeFileSync(join(site, "face.woff2"), "wOF2");
  const server = await startServer(site, 0);
  try {
    const address = server.address();
    assert.ok(address !== null && typeof address === "object", "the server listens on a port");
    const res = await fetch(`http://127.0.0.1:${address.port}/face.woff2`);
    await res.arrayBuffer();
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("content-type"), "font/woff2", "the harness should serve .woff2 as font/woff2");
  } finally {
    await new Promise((done) => server.close(done));
    rmSync(site, { recursive: true, force: true });
  }
});

test("boundary: the chart SVG lettering is untouched by the site's Punchcutter faces", () => {
  const svg = renderMap(generateWorld(defaultRecipe(42)), { style: "antique", widthPx: 480 });
  assert.doesNotMatch(svg, /IM Fell|EB Garamond/, "chart <text> must not adopt the site chrome faces");

  assert.ok(
    STYLES.antique.fontFamily.startsWith("'Iowan Old Style'"),
    "the SVG font stack stays the Iowan serif (byte-determinism)",
  );
  for (const [name, style] of Object.entries(STYLES)) {
    assert.doesNotMatch(JSON.stringify(style), /IM Fell|EB Garamond/, `no site-chrome face should leak into ${name}`);
  }
});
