import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Landfall Sub 4a (#470), ratified 2026-08-24: the failed-bundle doors. SPEC: the 2026-08-24 ratification comment on #470 and the re-baseline comment beneath it.

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");
const liveCss = (p: string): string => read(p).replace(/\/\*[\s\S]*?\*\//g, "");

const astro = read("src/pages/index.astro");
const css = liveCss("public/index.css");

const landfallAt = astro.indexOf('<section class="landfall"');
const section = astro.slice(landfallAt, astro.indexOf("</section>", landfallAt));

function stageCloseIndex(src: string): number {
  const classAt = src.indexOf('class="stage"');
  assert.ok(classAt >= 0, "the stage mounts");
  const start = src.lastIndexOf("<div", classAt);
  let depth = 0;
  for (const m of src.matchAll(/<(\/?)div\b/g)) {
    if (m.index === undefined || m.index < start) continue;
    depth += m[1] === "/" ? -1 : 1;
    if (depth === 0) return m.index;
  }
  assert.fail("the stage div never closes");
}

test("every slip stands outside #lf-stage, a later sibling the ~ combinator can reach (#470)", () => {
  const closeAt = stageCloseIndex(section);
  const firstCard = section.indexOf('class="lf-card"');
  assert.ok(firstCard >= 0, "the station slips mount");
  for (let at = firstCard; at >= 0; at = section.indexOf('class="lf-card', at + 1)) {
    assert.ok(at > closeAt, "no slip may live inside the stage: stage gestures must never see one, and the failed-bundle reveal must escape the stage's overflow clip");
  }
});

test("the failed-bundle reveal is pinned whole: selector polarity, the flow dress, and the pre-reveal invisibility (#470)", () => {
  const rule = css.match(/\.landfall \.stage:not\(\.cam\) ~ \.lf-card:not\(\.lf-card-how\)\[hidden\] \{([^}]*)\}/);
  assert.ok(rule, "the reveal keys on .stage:not(.cam) ~ .lf-card:not(.lf-card-how)[hidden]: :not(.cam) is the whole predicate (an inverted .cam would reveal on every healthy load), [hidden] keeps it off any slip the bundle opened, and the how panel is excluded (the ratification names the four station slips)");
  for (const decl of ["display: block", "position: static", "visibility: hidden", "max-height: 0", "padding: 0", "border-width: 0", "margin: 0 auto"]) {
    assert.ok(rule[1].includes(decl), `the failed-state base carries ${decl}: display flips immediately (an animation never starts on a display:none element), while zeroed height, margin, padding and border keep the pre-reveal page byte-identical in layout (a 2rem base margin held .landfall 128px taller than the stage on every load until .cam, skeptic round 1)`);
  }
  assert.match(
    rule[1],
    /animation:\s*lf-doors-reveal 0s linear 10s forwards;/,
    "the reveal statement is pinned whole: 0s duration (a discrete jump, nothing interpolates), the 10s delay, and forwards (without it the to-frame releases and the doors vanish again)",
  );
});

test("the reveal's to-frame restores exactly what the base zeroed, and the dead close control never shows (#470)", () => {
  const frames = css.match(/@keyframes lf-doors-reveal \{([\s\S]*?)\n\}/);
  assert.ok(frames, "the reveal keyframes exist");
  const to = frames[1].match(/to \{([^}]*)\}/);
  assert.ok(to, "with a 0s duration only the to-frame matters");
  for (const decl of ["visibility: visible", "max-height: 100rem", "margin-top: 2rem", "padding: 1.5rem 1.6rem 1.4rem", "border-width: 1px", "outline-width: 3px"]) {
    assert.ok(to[1].includes(decl), `the to-frame restores ${decl}`);
  }
  const narrow = css.match(/@media \(max-width: 900px\) \{\s*@keyframes lf-doors-reveal \{([\s\S]*?)\n  \}/);
  assert.ok(
    narrow && narrow[1].includes("padding: 1.2rem 1.3rem 1.1rem") && narrow[1].includes("visibility: visible"),
    "the narrow override redefines the keyframes AFTER the base (a definition before it in file order never wins), so revealed doors under 900px wear the narrow padding",
  );
  assert.match(
    css,
    /\.landfall \.stage:not\(\.cam\) ~ \.lf-card \.lf-card-close \{ display: none; \}/,
    "a revealed door hides its close button: without the bundle nothing listens to it",
  );
});

test("the 10s window is the veil's own, derived not duplicated by hand (#470)", () => {
  const delay = css.match(/animation:\s*lf-doors-reveal 0s linear (\d+)s forwards/);
  assert.ok(delay, "the reveal names its delay");
  const veil = astro.match(/if \(v\.dataset\.adopted === undefined\) v\.remove\(\); \}, (\d+)\);/);
  assert.ok(veil, "the veil's self-release timeout is readable");
  assert.equal(Number(delay[1]) * 1000, Number(veil[1]), "the doors and the unadopted veil share one self-release window (ratified 2026-08-24): a page whose veil just lifted must show its doors in the same breath, so a change to either constant must move both");
});

test("reduced motion keeps the 10s window: the house prm blanket is out-specified, not obeyed (#470 skeptic round 1)", () => {
  // The bug this pins: motion.css's `* { animation-delay: 0s !important }` prm blanket zeroed the reveal's delay, so every reduced-motion visitor got the four failure doors on every HEALTHY load until .cam arrived (measured: 8.7s of false doors on a throttled load).
  const motion = liveCss("public/motion.css");
  const blanket = motion.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/);
  assert.ok(
    blanket && /animation-delay:\s*0s !important/.test(blanket[1]),
    "motion.css's prm blanket still zeroes every animation-delay: that blanket is WHY the reveal owes its own exemption; if the blanket ever retires, retire the exemption with it",
  );
  const prm = css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/g)?.join("\n") ?? "";
  assert.ok(
    prm.includes(
      ".landfall .stage:not(.cam) ~ .lf-card:not(.lf-card-how)[hidden] { animation: lf-doors-reveal 0s linear 10s forwards !important; }",
    ),
    "index.css's own prm block re-states the reveal whole, !important included: same-origin !important falls back to specificity, and this selector beats the blanket's bare *, so the reveal is a timer that keeps its 10s window under reduced motion rather than motion to be stilled",
  );
});

test("a no-JS visitor keeps the noscript doors alone: the reveal stands down inside <noscript> (#470 skeptic round 1)", () => {
  const noscript = astro.match(/<noscript>[\s\S]*?<\/noscript>/);
  assert.ok(noscript, "the noscript block exists");
  assert.ok(
    noscript[0].includes(".landfall .stage:not(.cam) ~ .lf-card:not(.lf-card-how)[hidden] { animation: none; }"),
    "script-off never reaches .cam, so without this the slips would reveal at 10s on top of the noscript nav's own plain doors; the same-specificity rule wins by order because a noscript <style> parses after the linked sheet",
  );
});
