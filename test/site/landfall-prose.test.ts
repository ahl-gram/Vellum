import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SHEET } from "../../src/site/home/camera.ts";
import { homeStations, howStation } from "../../src/site/home/stations.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { createProjection, marginFor } from "../../src/render/transform.ts";

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
  assert.ok(
    layer.includes("{[...stations, how].map("),
    "the pip rides the one station template, folded into the map (#470): the hand-copied fifth block drifted from stations.map by construction",
  );
  assert.ok(
    layer.includes("class={`lf-station${s.sea ? \" at-sea\" : \"\"}`}"),
    "the template derives the at-sea dress from s.sea for every pip, the how pip included: no hand-written at-sea class remains to go silently wrong",
  );
  assert.ok(!astro.includes('class="lf-station at-sea"'), "the literal at-sea twin is gone with the fold");
  assert.equal(howStation().sea, true, "the how pip declares the at-sea round; the terrain test below is what earns it");
  assert.ok(
    astro.includes('id="lf-card-how"'),
    "the panel's id is lf-card-<the pip's data-station>: cards.ts wires them by that concatenation, and a rename on either side dies silently (skeptic round 3 finding 2)",
  );
});

test("every pip's at-sea dress is earned from the terrain, not asserted by hand (#470 deferred small; swept class-wide at skeptic round 2)", () => {
  const world = generateWorld(defaultRecipe(42));
  const proj = createProjection(world.recipe.gridW, world.recipe.gridH, SHEET.w, marginFor(SHEET.w));
  for (const s of [...homeStations(), howStation()]) {
    const gx = Math.round((s.nx * SHEET.w - proj.margin) / proj.scale);
    const gy = Math.round((s.ny * proj.heightPx - proj.margin) / proj.scale);
    assert.ok(world.elev.inBounds(gx, gy), `${s.id}: the anchor projects back inside the grid`);
    const elev = world.elev.at(gx, gy);
    assert.equal(
      elev < world.seaLevel,
      s.sea,
      `${s.id}: the sea flag is the terrain's own verdict (measured 2026-08-24: elev ${elev.toFixed(4)} against seaLevel ${world.seaLevel.toFixed(4)}; gallery -0.1389 and how -0.0048 are the two at sea); if this reds after a regen or re-anchor, the dress must be re-decided, not the assertion loosened`,
    );
  }
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
  for (const room of ["explorer/", "reading-room/", "atlas/", "gallery/"]) {
    assert.ok(
      noscript[0].includes(`href="${room}"`),
      `the noscript carries a visible door to ${room}: retiring Go Deeper removed the last human-visible room links, and the Atlas is out of the nav by ratified #202, so without this a no-JS visitor cannot reach it at all (skeptic round 5 finding 1)`,
    );
  }
});

test("stage gestures cannot begin on a slip because no slip lives in the stage; the wheel policy rides each slip (#459 skeptic rounds 1 and 2, reshaped at #470; one-finger touch on the fixed sheets is #460's recorded non-provable arm)", () => {
  // Source pin only; the real-input arms are recorded on #460 for Sub 5's suite.
  const input = read("src/site/home/input.ts");
  const cards = read("src/site/home/cards.ts");
  assert.ok(!input.includes("lf-card"), "input.ts carries no card guard: the slips left the stage, and dead code that LOOKS like a guard is worse than none");
  // Slice each handler to the NEXT addEventListener registration: an indexOf("});") terminator overshoots the multi-arg wheel listener and reads the following handler's guard as its own (pr-skeptic finding 1 on PR #469).
  const handlerOf = (source: string, gesture: string): string => {
    const at = source.indexOf(`"${gesture}"`);
    assert.ok(at >= 0, `the ${gesture} binding exists`);
    const next = source.indexOf("addEventListener", at);
    return next === -1 ? source.slice(at) : source.slice(at, next);
  };
  assert.match(
    cards,
    /for \(const slip of slips\(doc\)\) \{\s*slip\.addEventListener\(\s*"wheel"/,
    "the wheel listener binds on EVERY slip from slips(doc): the binding target sits above the handler slice, and narrowing the collection would silently unguard the station cards (skeptic round 5 finding 3)",
  );
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
  assert.match(
    cards,
    /if \(e\.target instanceof Element && e\.target\.closest\("button, a"\) !== null\) return;/,
    "the stage's tap-to-close guard is pinned whole: buttons and links inside the stage must not close the open slip, and its old .lf-card arm retired with the in-stage slips (skeptic round 2: this line changed unpinned)",
  );
});

test("the opened slip receives focus once visible, into its scroller when it has one (#459 skeptic rounds, #460 measurement)", () => {
  const cards = read("src/site/home/cards.ts");
  assert.match(
    cards,
    /onStart: \(\) => \{\s*gsap\.set\(card, \{ visibility: "inherit" \}\);\s*focusInto\(card\);\s*\},/,
    "the onStart body is pinned whole: autoAlpha's from-state is visibility:hidden, so focus must fire inside onStart after visibility is restored, and a focusInto moved back to the open tick leaves the bare onStart token green (skeptic round 5 finding 2)",
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

test("the slips' positioning box is the stage's (#459 skeptic round 2 finding 6; depth-scanned, not indentation-keyed, at #470)", () => {
  assert.match(css, /\.landfall \{[^}]*position:\s*relative/, ".landfall is the slips' containing block");
  const sectionAt = astro.indexOf('<section class="landfall"');
  const section = astro.slice(sectionAt, astro.indexOf("</section>", sectionAt));
  const stageClass = section.indexOf('class="stage"');
  const stageOpen = section.lastIndexOf("<div", stageClass);
  let divDepth = 0;
  let stageClose = -1;
  for (const m of section.matchAll(/<(\/?)div\b/g)) {
    if (m.index === undefined || m.index < stageOpen) continue;
    divDepth += m[1] === "/" ? -1 : 1;
    if (divDepth === 0) {
      stageClose = m.index;
      break;
    }
  }
  assert.ok(stageClose > 0, "the stage div closes");
  const after = section.slice(stageClose + "</div>".length);
  let depth = 0;
  const siblings: string[] = [];
  for (const m of after.matchAll(/<(\/?)(div|aside|form|nav|noscript|section|figure)\b/g)) {
    if (m[1] === "/") depth--;
    else {
      if (depth === 0) siblings.push(m[2]);
      depth++;
    }
  }
  assert.deepEqual(
    siblings,
    ["form", "aside", "aside", "noscript"],
    "after the stage: the floating seed form, the mapped station slips, the how panel, and the noscript doors, nothing else; the slips' top:0/bottom:0/max-height resolve against .landfall, which coincides with the stage only while nothing else FLOWS in the section",
  );
  const seed = css.match(/\.lf-seed \{([^}]*)\}/);
  assert.ok(seed && /position:\s*absolute/.test(seed[1]), "the seed form floats out of flow, so it never stretches .landfall past the stage");
  const card = css.match(/\.lf-card \{([^}]*)\}/);
  assert.ok(card && /position:\s*absolute/.test(card[1]), "the slips float out of flow for the same reason (the failed-bundle reveal is the one pinned exception, and it holds only while nothing JS-dependent is on screen)");
  assert.ok(
    card && card[1].includes("max-height: calc(100% - 2rem)") && card[1].includes("overflow: hidden"),
    "the desktop cap replaces the containment the stage's own overflow used to give an over-tall slip: without it a slip escapes the stage box (plate control: 3000px of injected content clamps to landfall minus 2rem with the Enter door still reachable); the narrow block lifts it, pinned in landfall-doors",
  );
});

test("the corner chrome passes clicks through and keeps its text on its own ground (#470 plate-reader findings)", () => {
  const seed = css.match(/\.lf-seed \{([^}]*)\}/);
  assert.ok(seed, ".lf-seed dresses in index.css");
  assert.match(seed[1], /pointer-events:\s*none/, "the chrome's text and wash pass clicks through: at 390px the corner covered the how pip's entire 34px hit box and the pip has no legend fallback (measured 2026-08-24, all 5 sample points)");
  const controls = css.match(/\.seed-controls \{([^}]*)\}/);
  assert.ok(controls && /pointer-events:\s*auto/.test(controls[1]), "the seed input and Draw it take their clicks back, the legend's exact pattern");
  assert.match(
    seed[1],
    /background: linear-gradient\(to bottom, rgb\(from var\(--chart-ink\) r g b \/ 0\.85\), rgb\(from var\(--chart-ink\) r g b \/ 0\.72\)\);/,
    "the wash is pinned whole, both alphas: past a fade-to-transparent the gloss measured 1.46:1 over bare chart, and under ~0.7 ink no permitted text color clears the 4.5:1 small-text floor (plate-reader 2026-08-24)",
  );
  const gloss = css.match(/\.seed-gloss \{([^}]*)\}/);
  assert.ok(gloss && /color:\s*var\(--parchment\)/.test(gloss[1]), "the gloss wears parchment, not the mockup's ink-faded: 3.72:1 on --parchment, 4.33:1 even on --parchment-bright, so ink-faded cannot clear the floor on ANY ground this design permits (the #459 lf-card-where precedent)");
  const hook = css.match(/\.seed-hook \{([^}]*)\}/);
  assert.ok(hook && /color:\s*var\(--parchment\)/.test(hook[1]), "the hook keeps parchment on the wash (measured 5.66:1)");
  const primary = css.match(/\.lf-seed \.primary \{([^}]*)\}/);
  assert.ok(
    primary && /white-space:\s*nowrap/.test(primary[1]),
    "Draw it never wraps: inside the 12rem narrow corner the flex fit broke the phrase across two lines, and nowrap makes the input the flex member that yields (skeptic round 2, visible in the 390 plates)",
  );
  const control = css.match(/\.lf-seed \.control \{([^}]*)\}/);
  assert.ok(
    control && /min-width:\s*0/.test(control[1]),
    "and the input CAN yield: flex refuses to shrink an input below its default min-width, so with nowrap alone the row overflowed the panel's left edge by 9.67px at 390 and painted the input over raw map (plate round 3); e2e H3 measures the containment live",
  );
  const legendHead = css.match(/\.lf-legend-head \{([^}]*)\}/);
  assert.ok(legendHead && /color:\s*var\(--parchment\)/.test(legendHead[1]), "the legend's head line wears parchment, the one face with the rooms' legend-head: ink-faded measured 2.78:1 on the deep (plate read 2026-08-29; the sitting's ruling 11, 2026-09-03 on #454)");
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
  // The voice the #324 re-ratification comment names (2026-08-24): the mockup's own, not archivist-head.
  const head = css.match(/\.stamp-head \{([^}]*)\}/);
  assert.ok(head, ".stamp-head dresses in index.css");
  assert.match(head[1], /font-size:\s*0\.72rem/, "the head keeps the mockup's 0.72rem");
  assert.match(head[1], /letter-spacing:\s*0\.28em/, "and its 0.28em tracking");
  assert.match(head[1], /color:\s*var\(--line-tan\)/, "and line-tan on the deep");
  assert.ok(!head[1].includes("text-transform"), "title case as written: no transform, the mockup has none");
  const body = css.match(/\.stamp-body \{([^}]*)\}/);
  assert.ok(body && /font-style:\s*italic/.test(body[1]) && /var\(--ink-faded\)/.test(body[1]), "the body keeps the mockup's flourish italic in ink-faded");
  const narrow = css.match(/@media \(max-width: 900px\) \{([\s\S]*?)\n\}/);
  assert.ok(
    narrow && /\.notice-stamp[^{]*\{[^}]*display:\s*none/.test(narrow[1]),
    "the narrow sheet stands the stamp down, as the mockup does",
  );
});
