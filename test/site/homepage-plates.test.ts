import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Consistency guard (#130 follow-up): every chart surface rests FLAT and tips on hover; guards the homepage plates against a regression to the old per-plate --tilt resting scatter.

const indexAstro = fileURLToPath(new URL("../../src/pages/index.astro", import.meta.url));
const motionCss = fileURLToPath(new URL("../../public/motion.css", import.meta.url));

test("homepage chart plates rest flat and tip on hover (consistent with the atlas)", async () => {
  const html = await readFile(indexAstro, "utf8");
  const css = await readFile(motionCss, "utf8");

  assert.ok(/class="plate"/.test(html), "the homepage plates should still be present");
  assert.ok(!/--tilt/.test(html), "no per-plate --tilt resting tilt should remain in the markup");

  const base = css.match(/\.plate\s*\{([^}]*)\}/);
  assert.ok(base, ".plate base rule should exist in motion.css");
  assert.ok(!/rotate\(/.test(base[1]), ".plate should rest flat (no resting rotate)");

  const hover = css.match(/\.plate:hover\s*\{([^}]*)\}/);
  assert.ok(hover, ".plate:hover rule should exist in motion.css");
  assert.ok(
    /rotate\(/.test(hover[1]) && /translateY\(/.test(hover[1]),
    ".plate should tip (rotate) and lift (translateY) under the hand",
  );
});

test("home's below-fold plates yield bandwidth to a clicked navigation (#329)", async () => {
  const html = await readFile(indexAstro, "utf8");
  const lazyPlates = html.match(/<img loading="lazy"[^>]*class="plate"[^>]*>|<img [^>]*class="plate"[^>]*loading="lazy"[^>]*>/g) ?? [];
  assert.ok(lazyPlates.length >= 3, `the three lazy style plates are present (got ${lazyPlates.length})`);
  for (const img of lazyPlates) {
    assert.ok(
      img.includes('fetchpriority="low"'),
      `a lazy megabyte plate must not outrank a clicked room's HTML: ${img}`,
    );
  }
  assert.ok(
    !/loading="eager"[^>]*fetchpriority="low"|fetchpriority="low"[^>]*loading="eager"/.test(html),
    "the eager hero keeps its natural priority",
  );
});

// A guard, green from the start: pins the #289 review call that the wordmark tips under the hand on room pages only; home's wordmark IS home.
test("the wordmark tips under the hand on room pages, and stays still on home", async () => {
  const css = await readFile(motionCss, "utf8");
  // Keyed on .wordmark, not h1 (#288): on a room page the h1 is the room name with no link to tip, so keying on h1 would silently select nothing.
  const hover = css.match(/body:has\(\.room-name\) \.wordmark a:hover\s*\{([^}]*)\}/);
  assert.ok(hover, "the room-scoped wordmark hover rule should exist in motion.css");
  assert.ok(
    /rotate\(/.test(hover[1]) && /translateY\(/.test(hover[1]),
    "the wordmark should tip (rotate) and lift (translateY) under the hand",
  );
  assert.ok(
    !/(?<!\(\.room-name\) )\.wordmark a:hover/.test(css.replace(/body:has\(\.room-name\) \.wordmark a:hover/g, "")),
    "no unscoped .wordmark a:hover may leak the tip onto home",
  );
});
