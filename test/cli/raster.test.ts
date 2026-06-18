import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import {
  findBrowser,
  printToPdf,
  rasterizeSvg,
  svgDimensions,
} from "../../src/cli/raster.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";

test("svgDimensions reads the root width/height", () => {
  assert.deepEqual(
    svgDimensions(`<svg xmlns="x" width="800" height="600" viewBox="0 0 800 600">`),
    { width: 800, height: 600 },
  );
  const world = generateWorld(defaultRecipe(1, { gridW: 80, gridH: 60 }));
  const real = renderMap(world, { widthPx: 640 });
  assert.equal(svgDimensions(real).width, 640);
  assert.throws(() => svgDimensions("<div>nope</div>"), /width\/height/);
});

test("rasterizeSvg produces a real PNG (skipped without a browser)", async (t) => {
  // CI runners ship a browser, but headless screenshotting there is flaky;
  // this test validates rasterization locally, so skip it under CI.
  const browser = process.env["CI"] ? null : findBrowser();
  if (!browser) {
    t.skip("no browser, or running in CI: skipping real PNG rasterization");
    return;
  }
  await mkdir("out/test-tmp", { recursive: true });
  const svgPath = "out/test-tmp/tiny.svg";
  const pngPath = "out/test-tmp/tiny.png";
  await writeFile(
    svgPath,
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="90">` +
      `<rect width="120" height="90" fill="#f2e8cf"/></svg>`,
    "utf8",
  );
  await rasterizeSvg(browser, svgPath, pngPath, 1);
  const png = await readFile(pngPath);
  assert.ok(png.length > 100, "png suspiciously small");
  assert.deepEqual(
    [...png.subarray(0, 4)],
    [0x89, 0x50, 0x4e, 0x47],
    "missing PNG magic bytes",
  );
  await rm("out/test-tmp", { recursive: true, force: true });
});

test("printToPdf produces a real PDF (skipped without a browser)", async (t) => {
  // Same rationale as the PNG test: the browser path is validated locally and
  // skipped under CI (headless browser there is flaky).
  const browser = process.env["CI"] ? null : findBrowser();
  if (!browser) {
    t.skip("no browser, or running in CI: skipping real PDF printing");
    return;
  }
  await mkdir("out/test-tmp-pdf", { recursive: true });
  const htmlPath = "out/test-tmp-pdf/doc.html";
  const pdfPath = "out/test-tmp-pdf/doc.pdf";
  await writeFile(
    htmlPath,
    `<!doctype html><html><head><meta charset="utf-8"><title>t</title></head>` +
      `<body><h1>Vellum test page</h1></body></html>`,
    "utf8",
  );
  await printToPdf(browser, htmlPath, pdfPath);
  const pdf = await readFile(pdfPath);
  assert.ok(pdf.length > 100, "pdf suspiciously small");
  assert.deepEqual(
    [...pdf.subarray(0, 5)],
    [0x25, 0x50, 0x44, 0x46, 0x2d], // "%PDF-"
    "missing PDF magic bytes",
  );
  await rm("out/test-tmp-pdf", { recursive: true, force: true });
});
