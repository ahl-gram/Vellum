import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import vm from "node:vm";
import { assertLaidOutAt, assertPageServed, captureParams, FULL_PAGE_CAP, parseShootArgs, parseShots, readProbe, servedUrl, withoutFavicon, withoutHash, type Shot } from "../../scripts/design/shoot.ts";
import { BAND, modeOf, parseSweepArgs, PIN, planSweep, PROBE, routesOf } from "../../scripts/design/oracle.ts";
import { aeOf, compareRows, failed, measureIn, parseCompareArgs, sizedAe, verdictOf, type Row } from "../../scripts/design/compare.ts";
import { stillArgs } from "../../scripts/design/stills.ts";

const REPO = resolve(import.meta.dirname, "..", "..");
const shot = (over: Partial<Shot> = {}): Shot => ({ url: "/faq/", width: 1280, height: 800, mobile: false, out: "out/x.png", ...over });

test("a full page is the one capture taken beyond the viewport, its height capped; a viewport or clip shot never is, and a clip origin clamps at zero", () => {
  assert.deepEqual(captureParams(shot({ full: true }), 3500), { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: 1280, height: 3500, scale: 1 } });
  assert.equal(captureParams(shot({ full: true, width: 390, height: 844 }), 22073).clip.height, FULL_PAGE_CAP);
  assert.equal(FULL_PAGE_CAP, 16000, "the archived sweep's cap");
  assert.deepEqual(captureParams(shot(), 3500), { format: "png", captureBeyondViewport: false, clip: { x: 0, y: 0, width: 1280, height: 800, scale: 1 } });
  assert.equal(captureParams(shot({ full: false }), 3500).captureBeyondViewport, false, "the sweep marks every head and view shot full: false");
  assert.deepEqual(captureParams(shot({ clip: { x: 0, y: 0, width: 1280, height: 122 } }), 3500), { format: "png", captureBeyondViewport: false, clip: { x: 0, y: 0, width: 1280, height: 122, scale: 1 } });
  assert.deepEqual(captureParams(shot({ clip: { x: -8, y: -4, width: 100, height: 50, scale: 3 } }), 3500).clip, { x: 0, y: 0, width: 92, height: 46, scale: 3 }, "the origin clamps and the far edge stays where it was");
});

test("a shot list is refused, naming the shot, wherever a job would otherwise run blind", () => {
  assert.deepEqual(parseShots([shot()]), [shot()]);
  assert.deepEqual(parseShots([shot({ waitMs: 0, scriptWaitMs: 0 })]), [shot({ waitMs: 0, scriptWaitMs: 0 })], "no wait at all is a wait");
  assert.throws(() => parseShots({ shots: [] }), /must be a JSON array/);
  const bad: [Record<string, unknown>, RegExp][] = [
    [{ ...shot(), out: undefined }, /shot 1: out/],
    [{ ...shot(), width: 390.5 }, /shot 1: width and height/],
    [{ ...shot(), height: 0 }, /shot 1: width and height/],
    [{ ...shot(), mobile: "yes" }, /shot 1: mobile/],
    [{ ...shot(), url: "" }, /shot 1: url/],
    [{ ...shot(), waitMs: -1 }, /shot 1: waitMs/],
    [{ ...shot(), waitMs: 1.5 }, /shot 1: waitMs/],
    [{ ...shot(), scriptWaitMs: 1.5 }, /shot 1: scriptWaitMs/],
    [{ ...shot(), scriptWaitMs: -1 }, /shot 1: scriptWaitMs/],
    [{ ...shot(), clip: { x: 0, y: 0, width: 10, height: 10, scale: Number.NaN } }, /shot 1: clip/],
    [{ ...shot(), clip: { x: 0, y: 0, width: 10, height: 10, scale: Number.POSITIVE_INFINITY } }, /shot 1: clip/],
    [{ ...shot(), clip: { x: 0, y: 0, width: 10, height: 10, scale: "2" } }, /shot 1: clip/],
    [{ ...shot(), clip: { x: 0, y: 0, width: 10, height: 10, scale: 0 } }, /shot 1: clip/],
    [{ ...shot(), clip: { x: 0, y: 0, width: 10, height: 10, scale: -1 } }, /shot 1: clip/],
    [{ ...shot(), waitMs: "100" }, /shot 1: waitMs/],
    [{ ...shot(), scriptWaitMs: "100" }, /shot 1: scriptWaitMs/],
    [{ ...shot(), script: "" }, /shot 1: script and probe/],
    [{ ...shot(), probe: 7 }, /shot 1: script and probe/],
    [{ ...shot(), full: "yes" }, /shot 1: full/],
    [{ ...shot(), clip: { x: 0, y: 0, width: 0, height: 10 } }, /shot 1: clip/],
    [{ ...shot(), clip: { x: "0", y: 0, width: 10, height: 10 } }, /shot 1: clip/],
    [{ ...shot(), clip: { x: 0, y: Number.NaN, width: 10, height: 10 } }, /shot 1: clip/],
    [{ ...shot(), full: true, clip: { x: 0, y: 0, width: 10, height: 10 } }, /shot 1: a full-page shot takes no clip/],
  ];
  for (const [job, message] of bad) assert.throws(() => parseShots([shot(), job]), message, JSON.stringify(job));
  assert.throws(() => parseShots([shot(), "x"]), /shot 1: each shot must be an object/);
});

test("a probe that hands back nothing stops the run instead of writing an undefined row", () => {
  assert.throws(() => readProbe(undefined, "out/a.png"), /out\/a\.png/);
  assert.equal(readProbe('{"cw":390}', "out/a.png"), '{"cw":390}');
  assert.equal(readProbe({ cw: 390 }, "out/a.png"), '{"cw":390}');
});

test("a path is served by the run's own server and any other address is taken as given", () => {
  assert.equal(servedUrl("/faq/", 8123), "http://127.0.0.1:8123/faq/");
  assert.equal(servedUrl("file:///a/b/explorer.html?dir=a&state=three", 8123), "file:///a/b/explorer.html?dir=a&state=three");
  assert.equal(servedUrl("file:///a/b/../c.html", 8123), "file:///a/c.html", "taken in the form the browser reports it, or the commit witness never matches");
  assert.throws(() => servedUrl("faq/", 8123), /Invalid URL/);
  assert.equal(withoutHash("http://127.0.0.1:8123/explorer/#seed=20261002&style=antique"), "http://127.0.0.1:8123/explorer/", "a page that writes its address into the hash at boot has still arrived");
});

test("a shot that did not lay out at the width it asked for stops the run, since its picture would be of another viewport", () => {
  assert.doesNotThrow(() => assertLaidOutAt(shot({ width: 390, height: 844, mobile: true }), 390));
  assert.throws(() => assertLaidOutAt(shot({ width: 390, height: 844, mobile: true, out: "out/kit.png" }), 980), /out\/kit\.png laid out 980px wide, not the 390px/);
  assert.throws(() => assertLaidOutAt(shot({ width: 390, height: 844, mobile: true }), 320), /laid out 320px wide/, "narrower is another viewport too");
});

test("a shot of a page that answered with an error stops the run, and a missing resource on a served page does not", () => {
  const faq = "http://127.0.0.1:8123/faq/";
  assert.throws(() => assertPageServed(shot({ out: "out/faq.png" }), faq, ["404 http://127.0.0.1:8123/faq/"]), /out\/faq\.png would photograph an error page: the page itself answered 404/);
  assert.throws(() => assertPageServed(shot(), `${faq}#seed=1`, ["404 http://127.0.0.1:8123/faq/"]), /error page/);
  assert.throws(() => assertPageServed(shot(), faq, ["404 http://127.0.0.1:8123/fonts/late.woff2", "404 http://127.0.0.1:8123/faq/"]), /error page/, "the page's own answer can arrive after another request's");
  assert.doesNotThrow(() => assertPageServed(shot(), faq, ["404 http://127.0.0.1:8123/fonts/x.woff2", "404 http://127.0.0.1:8123/faq/other/"]));
});

test("the camera takes one list of shots, a site and the reduced-motion switch, and refuses anything else by name", () => {
  assert.deepEqual(parseShootArgs(["shots.json"]), { list: "shots.json", site: undefined, reducedMotion: false });
  assert.deepEqual(parseShootArgs(["--site", "dist", "shots.json", "--reduced-motion"]), { list: "shots.json", site: "dist", reducedMotion: true });
  assert.throws(() => parseShootArgs(["shots.json", "--reduce-motion"]), /--reduce-motion is not one of its flags/);
  assert.throws(() => parseShootArgs(["shots.json", "--motion"]), /--motion is not one of its flags/, "the sweep's flag means the opposite here");
  assert.throws(() => parseShootArgs(["shots.json", "--site", "--reduced-motion"]), /not one of its flags/, "a flag is not a site");
  assert.throws(() => parseShootArgs(["shots.json", "more.json"]), /usage/);
  assert.throws(() => parseShootArgs(["--site", "a", "--site", "b", "shots.json"]), /--site is given twice/);
  assert.throws(() => parseShootArgs([]), /usage/);
});

test("a shot's missing resources are recorded, the browser's own favicon request aside, as e2e N2 reads them", () => {
  assert.deepEqual(withoutFavicon(["404 http://127.0.0.1:8123/favicon.ico", "404 http://127.0.0.1:8123/FAVICON.ICO", "404 http://127.0.0.1:8123/fonts/eb-garamond-latin-600-normal.woff2"]), ["404 http://127.0.0.1:8123/fonts/eb-garamond-latin-600-normal.woff2"]);
});

test("the sweep reads its pages from the built tree: every index.html, and nothing else", () => {
  const dir = join(REPO, "out", "test-design-kit-routes");
  rmSync(dir, { recursive: true, force: true });
  for (const f of ["index.html", "faq/index.html", "explorer/portfolio/index.html", "gallery/chart-1.html", "gallery/chart-index.html", "explorer/app.bundle.js", "fonts/OFL.txt"]) {
    mkdirSync(dirname(join(dir, f)), { recursive: true });
    writeFileSync(join(dir, f), "x");
  }
  try {
    assert.deepEqual(routesOf(dir), ["/", "/explorer/portfolio/", "/faq/"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a page that runs a live chart app is framed by its head box, home and the Specimen Book keep the archive's framing, and the rest are whole pages", () => {
  const archive: Record<string, string> = {
    "/": "full", "/faq/": "full", "/glossary/": "full", "/gallery/": "full",
    "/explorer/": "head", "/reading-room/": "head", "/print-room/": "head", "/prospect/": "head", "/ribbon/": "head", "/seed-of-the-day/": "head",
    "/specimen/": "view",
  };
  for (const [route, mode] of Object.entries(archive)) assert.equal(modeOf(route), mode, `${route}, as the sweep this ports framed it (PR #509)`);
  assert.equal(modeOf("/explorer/portfolio/"), "head", "the Portfolio runs a live chart app");
  assert.equal(modeOf("/atlas/"), "full", "the Atlas is a document");
});

test("every page is shot at a desktop window and at 1024, the narrowest the site is laid out for, under the archive's file names (Issue #764 ruling 1A: a narrower window keeps the 1024 page and scrolls sideways, so a 390 shot photographed its left edge)", () => {
  const plan = planSweep(["/", "/atlas/", "/explorer/", "/explorer/portfolio/", "/specimen/"], "out/s");
  const byName = new Map(plan.map((s) => [s.name, s]));
  assert.deepEqual(plan.map((s) => s.name).sort(), [
    "atlas-1024.png", "atlas-1280.png", "explorer-1024-head.png", "explorer-1280-head.png",
    "explorerportfolio-1024-head.png", "explorerportfolio-1280-head.png", "home-1024.png", "home-1280.png", "specimen-1024.png", "specimen-1280.png",
  ]);
  for (const s of plan) {
    assert.equal(s.mobile, false, `${s.name} mobile`);
    assert.equal(s.height, s.width === 1024 ? 768 : 800, `${s.name} height`);
    assert.equal(s.full, s.mode === "full", `${s.name} full`);
    assert.equal(s.waitMs, s.mode === "head" ? 4500 : 2500, `${s.name} wait`);
    assert.equal(s.script, PIN, `${s.name} pins the caption`);
    assert.equal(s.scriptWaitMs, 200, `${s.name} waits after the pin as the archive did`);
    assert.equal(s.probe, PROBE, `${s.name} records the archive's probe`);
    assert.equal(s.url, s.route, `${s.name} photographs its own page`);
    assert.equal(s.out, join("out/s", s.name));
    assert.deepEqual(s.clip, s.mode === "head" ? { x: 0, y: 0, width: s.width, height: BAND } : undefined, `${s.name} clip`);
  }
  assert.equal(BAND, 122, "the head cluster's band, as the archive clipped it");
  assert.throws(() => planSweep(["/a/b/", "/ab/"], "out/s"), /\/a\/b\/ and \/ab\/ would both be shot as ab-1280\.png/);
  assert.equal(byName.get("explorer-1024-head.png")?.url, "/explorer/");
});

test("the sweep's probe reads the document element's box under the archive's keys", () => {
  const document = { documentElement: { clientWidth: 1, scrollWidth: 2, scrollHeight: 3 }, body: { clientWidth: 7, scrollWidth: 8, scrollHeight: 9 } };
  assert.deepEqual(JSON.parse(vm.runInNewContext(PROBE, { document, JSON }) as string), { cw: 1, sw: 2, sh: 3 });
});

test("the sweep runs with motion reduced unless it is asked for motion", () => {
  assert.deepEqual(parseSweepArgs(["dist", "out/a", "main-1"]), { dist: "dist", out: "out/a", label: "main-1", reducedMotion: true });
  assert.deepEqual(parseSweepArgs(["dist", "out/a", "--motion"]), { dist: "dist", out: "out/a", label: undefined, reducedMotion: false });
  assert.deepEqual(parseSweepArgs(["--motion", "dist", "out/a", "main-1"]), { dist: "dist", out: "out/a", label: "main-1", reducedMotion: false });
  assert.throws(() => parseSweepArgs(["dist"]), /usage/);
  assert.throws(() => parseSweepArgs(["dist", "out/a", "--motoin"]), /usage/, "a mistyped flag would leave motion reduced unnoticed");
  assert.throws(() => parseSweepArgs(["dist", "out/a", "--reduced-motion"]), /usage/, "the camera's flag means the opposite here");
  assert.throws(() => parseSweepArgs(["dist", "out/a", "main-1", "extra"]), /usage/);
  assert.throws(() => parseSweepArgs(["dist", "out/a", "--motion", "--motoin"]), /usage/, "a known flag does not excuse an unknown one");
});

test("the caption pin rewrites every timing on every element the archive pinned, in the page itself, and touches nothing else", () => {
  const arms = [`[id$="-status"]`, ".status", ".rf-status", "#pressed", "#folio-sub"];
  const els = new Map([...arms, "#caption"].map((arm) => [arm, { textContent: "drawn in 412 ms, pressed in 9ms" }]));
  const document = { querySelectorAll: (sel: string) => sel.split(",").map((a) => a.trim()).flatMap((a) => (els.has(a) ? [els.get(a)!] : [])) };
  assert.equal(vm.runInNewContext(PIN, { document }), true);
  for (const arm of arms) assert.equal(els.get(arm)!.textContent, "drawn in NNNms, pressed in NNNms", arm);
  assert.equal(els.get("#caption")!.textContent, "drawn in 412 ms, pressed in 9ms", "an element the archive did not pin keeps its timing");
});

const row = (over: Partial<Row>): Row => ({ name: "a.png", present: [true, true, true], control: 0, branch: 0, errors: [], ...over });

test("a row is trusted only where the unchanged build matched itself, and a difference under one pixel still counts", () => {
  assert.equal(aeOf("0.075817 (4.20085e-08)"), 0.075817);
  assert.equal(aeOf("0 (0)"), 0);
  assert.throws(() => aeOf("compare: unable to open image"), /no AE/);
  assert.equal(verdictOf(row({})), "same");
  assert.equal(verdictOf(row({ branch: 0.075817 })), "differs");
  assert.equal(verdictOf(row({ control: 46, branch: null })), "untrusted");
  assert.equal(verdictOf(row({ errors: ["404 http://127.0.0.1/fonts/x.woff2"] })), "errors");
  assert.equal(verdictOf(row({ control: 46, branch: null, errors: ["console.error: x"] })), "errors", "an error fails a row whether or not its control was stable");
  assert.equal(verdictOf(row({ present: [false, false, true], control: null, branch: null })), "new");
  assert.equal(verdictOf(row({ present: [true, true, false], branch: null })), "gone");
  assert.equal(verdictOf(row({ present: [true, false, true], control: null, branch: null })), "missing");
});

test("a page counts as shot only where that run's manifest lists it, controls are measured against each other and the branch against the second control", () => {
  const listed = (...names: string[]) => names.map((name) => ({ name }));
  const calls: string[] = [];
  const measure = (from: 0 | 1, to: 1 | 2, name: string): number => {
    calls.push(`${from}${to} ${name}`);
    return name === "flip.png" && from === 0 ? 46 : name === "moved.png" && to === 2 ? 12 : 0;
  };
  const rows = compareRows([listed("a.png", "flip.png", "gone.png", "half.png", "moved.png"), listed("a.png", "flip.png", "gone.png", "moved.png"), listed("a.png", "flip.png", "half.png", "moved.png", "new.png")], measure);
  assert.deepEqual(Object.fromEntries(rows.map((r) => [r.name, verdictOf(r)])), { "a.png": "same", "flip.png": "untrusted", "gone.png": "gone", "half.png": "missing", "moved.png": "differs", "new.png": "new" });
  assert.deepEqual(calls.sort(), ["01 a.png", "01 flip.png", "01 moved.png", "12 a.png", "12 moved.png"], "an untrusted, lost, half-shot or new page is never measured");
  assert.deepEqual(rows.map((r) => r.name), ["a.png", "flip.png", "gone.png", "half.png", "moved.png", "new.png"], "the report reads in name order");
  assert.equal(sizedAe("1280 800", "1280 840", () => 0), Number.POSITIVE_INFINITY, "a page that only grew at the bottom scores 0 against its own edge");
  assert.equal(sizedAe("1280 800", "1264 800", () => 0), Number.POSITIVE_INFINITY, "a width change too");
  assert.equal(sizedAe("1280 800", "1280 800", () => 7), 7);
  assert.equal(verdictOf(row({ branch: Number.POSITIVE_INFINITY })), "differs");
  assert.equal(verdictOf(row({ control: Number.POSITIVE_INFINITY, branch: null })), "untrusted");
});

test("a row carries the branch shot's own missing resources and console errors, and nothing from the controls", () => {
  const manifests = [
    [{ name: "a.png", consoleErrors: ["console.error: control only"] }, { name: "b.png" }],
    [{ name: "a.png" }, { name: "b.png" }],
    [{ name: "a.png" }, { name: "b.png", http4xx: ["404 http://127.0.0.1/fonts/x.woff2"], consoleErrors: ["console.error: y"] }],
  ] as const;
  const rows = compareRows(manifests, () => 0);
  assert.deepEqual(rows.map((r) => [r.name, r.errors, verdictOf(r)]), [
    ["a.png", [], "same"],
    ["b.png", ["404 http://127.0.0.1/fonts/x.woff2", "console.error: y"], "errors"],
  ]);
});

test("a page laid out differently is a difference however its pixels compare, past the 16000px cap included, and a new page with errors fails", () => {
  const at = (name: string, sh: number) => ({ name, probe: JSON.stringify({ cw: 390, sw: 390, sh }) });
  const measured: string[] = [];
  const rows = compareRows([[at("glossary-390.png", 22073), at("flip.png", 900)], [at("glossary-390.png", 22073), at("flip.png", 920)], [at("glossary-390.png", 22100), at("flip.png", 900)]], (from, to, name) => (measured.push(`${from}${to} ${name}`), 0));
  assert.deepEqual(rows.map((r) => [r.name, r.control, r.branch, verdictOf(r)]), [
    ["flip.png", Number.POSITIVE_INFINITY, null, "untrusted"],
    ["glossary-390.png", 0, Number.POSITIVE_INFINITY, "differs"],
  ]);
  assert.deepEqual(measured, ["01 glossary-390.png"], "a pair whose layouts differ is never measured");
  const newWithError = { name: "a.png", present: [false, false, true] as const, control: null, branch: null, errors: ["404 http://127.0.0.1:8123/fonts/x.woff2"] };
  assert.equal(verdictOf(newWithError), "errors", "a page with nothing to compare against can still carry a missing face");
  assert.equal(failed([row({}), newWithError]), true);
});

test("the compare takes three sweeps, two of them distinct controls, and refuses anything else", () => {
  assert.deepEqual(parseCompareArgs(["out/a", "out/b", "out/br"]), ["out/a", "out/b", "out/br"]);
  assert.throws(() => parseCompareArgs(["out/a", "out/b", "out/br", "out/c"]), /usage/);
  assert.throws(() => parseCompareArgs(["out/a", "out/b", "out/br", "--fuzz"]), /usage/);
  assert.throws(() => parseCompareArgs(["out/a", "--fuzz", "out/br"]), /usage/, "a flag is never a sweep");
  assert.throws(() => parseCompareArgs(["out/a", "out/b"]), /usage/);
  assert.throws(() => parseCompareArgs(["out/a", "out/a/", "out/br"]), /both controls/);
  assert.throws(() => parseCompareArgs(["out/a", "out/b", "./out/b/"]), /the branch and a control/);
  assert.throws(() => parseCompareArgs(["out/a", "out/b", "out/a"]), /the branch and a control/);
});

test("the controls and the branch are measured as the files in their own directories", () => {
  const seen: string[] = [];
  const measure = measureIn(["out/c-a", "out/c-b", "out/br"], (a, b) => (seen.push(`${a} ${b}`), 0));
  measure(0, 1, "home-1280.png");
  measure(1, 2, "home-1280.png");
  assert.deepEqual(seen, [`${join("out/c-a", "home-1280.png")} ${join("out/c-b", "home-1280.png")}`, `${join("out/c-b", "home-1280.png")} ${join("out/br", "home-1280.png")}`]);
});

test("a comparison fails on a trusted difference, an error, a lost or half-shot page, or when it trusted no row at all", () => {
  assert.equal(failed([row({}), row({ control: 46, branch: null })]), false, "an untrusted row is reported, not failed");
  assert.equal(failed([row({}), row({ present: [false, false, true], control: null, branch: null })]), false, "a new page is reported, not failed");
  assert.equal(failed([row({}), row({ branch: 0.075817 })]), true);
  assert.equal(failed([row({}), row({ errors: ["console.error: x"] })]), true);
  assert.equal(failed([row({}), row({ present: [true, true, false], branch: null })]), true);
  assert.equal(failed([row({}), row({ present: [true, false, true], control: null, branch: null })]), true);
  assert.equal(failed([row({ control: 46, branch: null }), row({ control: 3, branch: null })]), true, "a run that trusted nothing compared nothing");
});

test("a still is palette-reduced with its date chunks stripped, so a re-run writes the same bytes", () => {
  assert.deepEqual(stillArgs("a.png", "s/a.png"), ["a.png", "-colors", "256", "-define", "png:exclude-chunks=date", "+set", "date:create", "+set", "date:modify", "PNG8:s/a.png"]);
});

const CODE = new Set([".js", ".mjs", ".cjs", ".jsx", ".ts", ".mts", ".cts", ".tsx"]);
const codeIn = (paths: readonly string[]): string[] => paths.filter((p) => CODE.has(extname(p).toLowerCase()));

test("design/kit/ holds content and no code, since code there escapes npm run check and npm run lint and would be a second home for tools beside scripts/design/", () => {
  assert.deepEqual(codeIn(["design/kit/a.js", "design/kit/b.MJS", "design/kit/c.cjs", "design/kit/d.jsx", "design/kit/e.ts", "design/kit/f.mts", "design/kit/g.cts", "design/kit/h.tsx", "design/kit/fonts.css", "design/kit/fonts/x.woff2"]).length, 8);
  // 2026-10-02: this git ls-files answers in under 10 ms on a Mac; thirty seconds is a cap on a hang, not a budget.
  const listing = spawnSync("git", ["ls-files", "-z", "--", "design/kit"], { cwd: REPO, encoding: "utf8", timeout: 30_000 });
  assert.equal(listing.status, 0, `git ls-files failed: ${listing.stderr}`);
  const kit = listing.stdout.split("\0").filter(Boolean);
  assert.ok(kit.includes("design/kit/fonts/OFL.txt"), "the kit's fonts are not tracked, so this scan reads an empty kit");
  assert.deepEqual(codeIn(kit), []);
});
