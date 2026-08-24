import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SHEET } from "../../src/site/home/camera.ts";
import { homeStations, howStation } from "../../src/site/home/stations.ts";

// Landfall Sub 4 (#459): the prose finds a home. Ratified on #459's comments (2026-08-24): the How It Works prose and underhood links live in a panel opened from a dedicated pip on the chart, never the legend; the text ships hidden but indexable; the Notice to Mariners is the mockup's decorative stamp on the deep, stamp only.

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");
const liveCss = (p: string): string => read(p).replace(/\/\*[\s\S]*?\*\//g, "");

const astro = read("src/pages/index.astro");
const css = liveCss("public/index.css");

test("the How It Works pip moors at the title cartouche, chart only, never the legend (#459)", () => {
  const how = howStation();
  assert.equal(how.id, "how");
  assert.equal(how.name, "How It Works");
  assert.equal(how.verb, "See how");
  assert.equal(how.where, "at the title cartouche");

  const svg = read("public/charts/chart-42-antique.svg");
  const frame = svg.match(/id="layer-cartouche"><rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/);
  assert.ok(frame, "chart 42 carries its cartouche frame; a regen that moves it re-anchors the pip");
  const [x, y, w, h] = frame.slice(1).map(Number);
  assert.ok(Math.abs(how.nx - (x + w / 2) / SHEET.w) < 0.002, "the pip rides the cartouche frame's bottom-center");
  assert.ok(Math.abs(how.ny - (y + h) / SHEET.h) < 0.002, "the pip hangs from the frame's lower rule");

  assert.ok(
    homeStations().every((s) => s.id !== "how"),
    "the pip is no mode of encounter: the legend derives from homeStations and must never list it (ratified 2026-08-24)",
  );

  const layerAt = astro.indexOf('class="lf-stations"');
  assert.ok(layerAt >= 0, "the station layer mounts");
  const layer = astro.slice(layerAt, astro.indexOf("</div>", layerAt));
  assert.ok(layer.includes('data-station="how"'), "the pip stands in the station layer, so the card machinery binds it unchanged");
  const pipAt = layer.indexOf('data-station="how"');
  const pip = layer.slice(layer.lastIndexOf("<button", pipAt), layer.indexOf("</button>", pipAt));
  assert.match(pip, /class="lf-station\b/, "the pip wears the station dress: the motion/house button exclusions come with it");
  assert.ok(pip.includes("data-nx={String(how.nx)}"), "the anchor rides at full precision, never the styled percent");
  assert.ok(pip.includes("lf-station-slip"), "the pip names itself on hover like every station");
});

test("the panel is a card slip carrying the prose, hidden in the HTML so it stays indexable (#459)", () => {
  const panelAt = astro.indexOf('id="lf-card-how"');
  assert.ok(panelAt >= 0, "the panel mounts");
  const panel = astro.slice(astro.lastIndexOf("<aside", panelAt), astro.indexOf("</aside>", panelAt));
  assert.match(panel, /class="lf-card lf-card-how"/, "the panel is a card slip: bindStations opens and closes it with no new code");
  assert.match(panel, /\bhidden\b/, "the prose ships hidden until opened: indexable, with the search-weight tradeoff accepted (ratified 2026-08-23)");
  assert.ok(panel.includes('class="lf-card-close"'), "the panel closes like every slip");
  const flat = panel.replace(/\s+/g, " ");
  for (const marker of [
    "Vellum surveys worlds",
    "raises land out of noise",
    "Towns settle where any founder would",
    "drafting table",
    "ten invented languages, one per culture",
    "Under the hood",
    "priority-flood",
    "README",
  ]) {
    assert.ok(flat.includes(marker), `the panel carries the prose at "${marker}"`);
  }
  assert.ok(!panel.includes("lf-card-enter"), "the panel is not a room: no door");
  assert.ok(!astro.includes("<h2>How It Works</h2>"), "the old section is gone; the panel is the prose's one home");

  const rule = css.match(/\.lf-card-how \{([^}]*)\}/);
  assert.ok(rule, ".lf-card-how sizes the long prose");
  assert.match(rule[1], /overflow-y:\s*auto/, "the prose scrolls inside the slip, never burying the stage");
  assert.match(rule[1], /max-height/, "the slip caps its height against the stage");
});

test("stage gestures never act through an open card slip (#459 plate-reader: wheel over the panel zoomed the chart under it)", () => {
  // Source-level pin only: the real-input e2e guard belongs to Sub 5's suite (#460), specced by out/459/wheel-target-probe.mjs.
  const input = read("src/site/home/input.ts");
  const onCard = input.match(/const onCard = [^;]*\.closest\("\.lf-card"\)[^;]*;/);
  assert.ok(onCard, "input.ts carries an onCard guard keyed on .lf-card");
  for (const gesture of ["wheel", "pointerdown", "dblclick"]) {
    const at = input.indexOf(`"${gesture}"`);
    assert.ok(at >= 0, `the ${gesture} binding exists`);
    const handler = input.slice(at, input.indexOf("});", at));
    assert.match(handler, /if \(onCard\(e\)\) return;/, `${gesture} stands down inside a card slip`);
  }
});

test("the Notice to Mariners is the mockup's stamp on the deep, and only the stamp (#459)", () => {
  const stampAt = astro.indexOf('class="notice-stamp"');
  assert.ok(stampAt >= 0, "the stamp mounts");
  const stageAt = astro.indexOf('class="stage"');
  assert.ok(stampAt > stageAt && stampAt < astro.indexOf("</section>", stageAt), "the stamp rides the stage, on the deep");
  const stamp = astro.slice(astro.lastIndexOf("<aside", stampAt), astro.indexOf("</aside>", stampAt));
  assert.ok(stamp.includes('aria-hidden="true"'), "decorative: screen readers pass it by, search engines still read it (ratified 2026-08-23)");
  assert.ok(stamp.includes("Notice to Mariners"), "the head keeps the mockup's words");
  assert.ok(
    stamp.includes("No feature on this chart exists.") && stamp.includes("Soundings are imaginary."),
    "the body keeps the mockup's two lines",
  );
  assert.ok(!astro.includes("Navigation of these waters"), "the panel's third sentence retired with it: the stamp is the mockup's, whole");
  assert.equal(astro.split("No feature on this chart exists").length - 1, 1, "stamp only: no readable copy elsewhere (ratified)");

  const rule = css.match(/\.notice-stamp \{([^}]*)\}/);
  assert.ok(rule, ".notice-stamp dresses in index.css");
  assert.match(rule[1], /rotate\(-5deg\)/, "the stamp tilts as the mockup stamps it");
  assert.match(rule[1], /3px double/, "the stamp wears the mockup's double rule");
  assert.match(rule[1], /pointer-events:\s*none/, "the stamp is decoration, never a control");
  const narrow = css.match(/@media \(max-width: 900px\) \{([\s\S]*?)\n\}/);
  assert.ok(
    narrow && /\.notice-stamp[^{]*\{[^}]*display:\s*none/.test(narrow[1]),
    "the narrow sheet stands the stamp down, as the mockup does",
  );
});
