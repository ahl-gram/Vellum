import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SHEET } from "../../src/site/home/camera.ts";
import { homeStations, howStation } from "../../src/site/home/stations.ts";

// Landfall Sub 4 (#459): the prose finds a home. Ratified in the 2026-08-24 decision-2 comment on #454 (restated on #459): the How It Works prose and underhood links live in a panel opened from a dedicated pip on the chart, never the legend; the text ships hidden but indexable; the Notice to Mariners is the mockup's decorative stamp on the deep, stamp only.

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
  const pipStation = layer.match(/data-station="(\w+)"/);
  assert.ok(pipStation && pipStation[1] === "how", "the pip stands in the station layer, so the card machinery binds it unchanged");
  assert.ok(
    astro.includes(`id="lf-card-${pipStation[1]}"`),
    "the panel's id is lf-card-<the pip's data-station>: cards.ts wires them by that concatenation, and a rename on either side dies silently (skeptic round 3 finding 2)",
  );
  const pipAt = layer.indexOf('data-station="how"');
  const pip = layer.slice(layer.lastIndexOf("<button", pipAt), layer.indexOf("</button>", pipAt));
  assert.match(pip, /class="lf-station at-sea"/, "the pip wears the at-sea round, not the land diamond: the cartouche is placed over open water by construction, planCartouche picks the least-land corner (skeptic round 4, elev -0.0048 against seaLevel 0.4389 at the anchor)");
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

  const closeAt = panel.indexOf('class="lf-card-close"');
  const scrollAt = panel.indexOf('class="lf-card-scroll"');
  assert.ok(scrollAt >= 0, "the prose rides an inner scroll region");
  assert.ok(closeAt >= 0 && closeAt < scrollAt, "the close button stands OUTSIDE the scroller, so it can never scroll away with the prose (skeptic finding 2)");
  assert.ok(panel.indexOf('class="lf-card-where"') < scrollAt, "the head (verb, title, where) stays put above the scroller");

  const rule = css.match(/\.lf-card-how \{([^}]*)\}/);
  assert.ok(rule, ".lf-card-how sizes the long prose");
  assert.match(rule[1], /max-height/, "the slip caps its height against the stage");
  assert.ok(
    !rule[1].includes("width"),
    "the panel keeps the slips' 22rem width: the station flight's framing clears the anchor only at that width (skeptic round 3: a 30rem panel covered the cartouche from 901 to 1034px)",
  );
  const scroll = css.match(/\.lf-card-scroll \{([^}]*)\}/);
  assert.ok(scroll, ".lf-card-scroll dresses the scroll region");
  assert.match(scroll[1], /overflow-y:\s*auto/, "the prose scrolls inside the slip, never burying the stage");
  assert.match(scroll[1], /overscroll-behavior:\s*contain/, "an exhausted scroll never chains to the page under the slip");

  const narrowBlock = css.match(/@media \(max-width: 900px\) \{([\s\S]*?)\n\}/);
  const narrowHow = narrowBlock && narrowBlock[1].match(/\.lf-card-how\s*\{[^}]*max-height:\s*([\d.]+vh)/);
  assert.ok(narrowHow, "the narrow bottom sheet caps its own height inside the media query");
  assert.equal(
    narrowHow[1],
    "45vh",
    "the narrow cap is the measured value, not merely present: at 62vh the sheet rose past the flight's 0.36 anchor line and buried the cartouche it had just centered (skeptic round 3, sweep at 390x844)",
  );

  const noscript = astro.match(/<noscript>[\s\S]*?<\/noscript>/);
  assert.ok(noscript, "a no-JS visitor still reads the prose (skeptic finding 4: the pip and panel only exist under .cam)");
  assert.match(noscript[0], /#lf-card-how\[hidden\]\s*\{[^}]*display:\s*block/, "the no-JS reveal targets the hidden attribute itself, flowing the panel statically");
});

test("gestures never act through a card slip, wherever the slip lives (#459 skeptic rounds 1 and 2)", () => {
  // Source pin only; the real-input arms are recorded on #460 for Sub 5's suite.
  const input = read("src/site/home/input.ts");
  const cards = read("src/site/home/cards.ts");
  const onCard = input.match(/const onCard = [^;]*\.closest\("\.lf-card"\)[^;]*;/);
  assert.ok(onCard, "input.ts carries an onCard guard keyed on .lf-card");
  assert.match(onCard[0], /!== null;$/, "and its polarity is on-the-card, not off it: a flipped comparison passes every presence pin (skeptic round 4 mutant C)");
  // Slice each handler to the NEXT addEventListener registration: an indexOf("});") terminator overshoots the multi-arg wheel listener and reads the following handler's guard as its own (pr-skeptic finding 1 on PR #469).
  const handlerOf = (source: string, gesture: string): string => {
    const at = source.indexOf(`"${gesture}"`);
    assert.ok(at >= 0, `the ${gesture} binding exists`);
    const next = source.indexOf("addEventListener", at);
    return next === -1 ? source.slice(at) : source.slice(at, next);
  };
  for (const gesture of ["pointerdown", "dblclick"]) {
    assert.match(handlerOf(input, gesture), /if \(onCard\(e\)\) return;/, `${gesture} stands down inside a card slip`);
  }
  assert.match(handlerOf(input, "wheel"), /if \(onCard\(e\)\) return;/, "the stage never zooms through a slip it contains");
  const wheel = handlerOf(cards, "wheel");
  const wheelBody = wheel.slice(wheel.indexOf("{", wheel.indexOf("=>")) + 1);
  assert.match(
    wheelBody.trimStart(),
    /^const scroller =/,
    "the handler's FIRST statement is the scroller lookup: an unconditional bail above it would leave every check below as dead text these pins still match (guard-prover round 4 hole)",
  );
  assert.match(
    wheel,
    /\.closest\("\.lf-card-scroll"\)/,
    "a wheel over a slip reaches native scroll only over a live scroller under the cursor",
  );
  assert.match(
    wheel,
    /if \(scroller !== null && scroller\.scrollHeight > scroller\.clientHeight\) return;/,
    "the native-bypass statement is pinned whole, polarity and return included: dropping the return or flipping either comparison re-introduces a blocking regression while every presence pin stays green (skeptic round 4 mutants A and B)",
  );
  assert.match(
    wheel,
    /e\.preventDefault\(\);/,
    "anywhere else on the slip the wheel is swallowed: no zoom-through, and no page scrolling the slip out from under the cursor",
  );
  assert.match(wheel, /passive: false/, "the slip's wheel listener is non-passive or its preventDefault is ignored");
});

test("the opened slip receives focus once visible, into its scroller when it has one (#459 skeptic rounds, #460 measurement)", () => {
  const cards = read("src/site/home/cards.ts");
  assert.match(
    cards,
    /onStart:/,
    "focus waits for the open tween to start: autoAlpha's from-state is visibility:hidden, so a same-tick focus silently fails and the keyboard lands on the page instead of the prose",
  );
  assert.match(cards, /querySelector[^;]*\.lf-card-scroll/, "the focus target prefers the slip's scroller, so arrow keys scroll the prose");
  assert.match(cards, /\(scroller \?\? card\)\.focus/, "scroller first, card as the fallback: the reversed coalesce always picks the card and no presence pin sees it");
  const astro2 = read("src/pages/index.astro");
  assert.match(astro2, /class="lf-card-scroll"[^>]*tabindex="0"/, "the scroller is keyboard-reachable on its own (a scrollable region needs tab access)");
  assert.match(
    astro2,
    /class="lf-card-scroll"[^>]*role="region"/,
    "the focus target carries a real role: aria-label is not permitted on a bare div's generic role, so the opened panel would announce nothing (skeptic round 3, AX-tree measurement)",
  );
});

test("the panel's positioning box is the stage's (#459 skeptic round 2 finding 6)", () => {
  assert.match(css, /\.landfall \{[^}]*position:\s*relative/, ".landfall is the out-of-stage panel's containing block");
  const sectionAt = astro.indexOf('<section class="landfall"');
  const section = astro.slice(sectionAt, astro.indexOf("</section>", sectionAt));
  const children = [...section.matchAll(/^  <([a-z]+)/gm)].map((m) => m[1]);
  assert.deepEqual(
    children,
    ["div", "aside", "noscript"],
    "the stage stays .landfall's lone in-flow box: the panel's top:0/bottom:0/max-height resolve against .landfall, which coincides with the stage only while nothing else flows in the section",
  );
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
