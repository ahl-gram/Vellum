// Shoot the atelier-map concept: plain viewport captures (captureBeyondViewport
// would resize the layout viewport and re-clamp the camera mid-shot).
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { findBrowser } from "../../src/cli/raster.ts";
import { start, cleanup } from "../../scripts/e2e/harness.mjs";

const DIR = fileURLToPath(new URL(".", import.meta.url)).replace(/\/$/, "");
const PORT = 8811, DPORT = 9311;
const results = [], consoleErrors = [], http4xx = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const h = await start({
  browser: findBrowser(), SITE: DIR, OUT: DIR, PORT, DPORT,
  PAGE: `http://127.0.0.1:${PORT}/index.html`,
  results, consoleErrors, http4xx,
});

async function viewportShot(file) {
  const r = await h.send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(DIR, file), Buffer.from(r.data, "base64"));
  console.log("  shot ->", file);
}

await h.send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
await h.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/index.html` });
await sleep(1300);
await viewportShot("shot-1-veil.png");
await sleep(4700);
await viewportShot("shot-2-landfall.png");
await h.evaluate(`document.querySelectorAll(".legend-btn")[0].click()`);
await sleep(2200);
await viewportShot("shot-3-station-card.png");
await h.evaluate(`document.getElementById("card-close").click()`);
await h.evaluate(`document.getElementById("zoom-in").click()`);
await sleep(1100);
await viewportShot("shot-4-close-in.png");
await h.setMobileViewport(390, 844);
await h.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/index.html` });
await sleep(6500);
await viewportShot("shot-5-mobile.png");
await h.evaluate(`document.querySelectorAll(".legend-btn")[2].click()`);
await sleep(2200);
await viewportShot("shot-6-mobile-card.png");

console.log("consoleErrors:", JSON.stringify(consoleErrors));
console.log("http4xx:", JSON.stringify(http4xx));
await cleanup();
