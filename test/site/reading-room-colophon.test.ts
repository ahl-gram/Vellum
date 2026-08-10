import { test } from "node:test";
import assert from "node:assert/strict";
import { El, installShim, walk } from "../../test-support/element-shim.ts";

/**
 * The colophon dice (#318, Survey and Story Sub 1): a seed counter at the Reading
 * Room journal's foot, so the room is self-sufficient for wandering worlds. The two
 * open decisions were taken with Alex's approval as the issue's recommendations, as
 * refined by the 2026-08-08 read-over comment on #318:
 *   1. A colophon at the journal's foot, mounted as a SIBLING of the instrument
 *      panel (.rf-ages) inside the reading column, never inside it: `armAges` and
 *      `clearAges` in `src/site/living-chart/ages.ts` drive `panel.hidden` through
 *      every teardown, so furniture nested in the panel would vanish on each counter
 *      draw and be absent before the first arm.
 *   2. Always visible, which the sibling placement makes true by construction.
 *
 * Like the frame, the colophon BUILDS its DOM, so this file installs the same
 * element shim (test-support/element-shim.ts). The redraw path the colophon drives
 * (drawGen supersession, the present-park rest, hash re-serialization) runs a real
 * worker and browser, so it lives in the e2e (suite-reading-room RR16-RR21), not here.
 */

installShim();

test("the colophon builds the invitation: a seed input, the dice, and Read (#318)", async () => {
  const { createColophon } = await import("../../src/site/reading-room/colophon.ts");
  const c = createColophon();
  const root = c.root as unknown as El;

  assert.ok(root.classes.has("rr-colophon"), "the root carries the rr-colophon class the page css dresses");
  assert.equal(root.hidden, false, "the colophon is visible from the moment it is built (open decision 2)");
  assert.equal(root.getAttribute("role"), "group", "the counter is a grouped control, like the Print Room's");
  assert.ok(root.getAttribute("aria-label"), "and the group is named for assistive tech");
  assert.match(root.textContent, /Read another/i, "the invitation reads as the issue wrote it");

  const nodes = walk(root);
  for (const [name, node] of [
    ["seedInput", c.seedInput],
    ["diceBtn", c.diceBtn],
    ["readBtn", c.readBtn],
  ] as const) {
    assert.ok(nodes.includes(node as unknown as El), `${name} is part of the colophon's own tree`);
  }

  const input = c.seedInput as unknown as El;
  assert.equal(input.type, "number", "the seed input is numeric");
  assert.equal(input.min, "0", "a seed is a uint32: no negatives");
  assert.equal(input.max, "4294967295", "capped at the uint32 ceiling, the Print Room's bound");
  assert.equal(input.step, "1", "whole numbers only");
  assert.equal((input.parentNode as El).tagName, "LABEL", "the input rides inside its label");
  assert.match((input.parentNode as El).textContent, /seed/, "and the label names it in the counter idiom");

  const dice = c.diceBtn as unknown as El;
  const read = c.readBtn as unknown as El;
  assert.equal(dice.type, "button", "the dice never submits a form");
  assert.equal(read.type, "button", "nor does Read");
  assert.ok(dice.classes.has("rr-dice"), "the dice carries the class the e2e clicks");
  assert.ok(read.classes.has("rr-read"), "Read carries the class the e2e clicks");
  assert.equal(dice.textContent, "\u{1F3B2}", "the dice shows the die, the Print Room's glyph");
  assert.ok(dice.getAttribute("aria-label"), "the glyph button is named for assistive tech");
  assert.match(read.textContent, /read/i, "the read action says what it does");
});

test("the colophon mounts as the panel's SIBLING at the journal's foot, outside every teardown (#318)", async () => {
  const { createReadingFrame } = await import("../../src/site/reading-frame/index.ts");
  const { createColophon } = await import("../../src/site/reading-room/colophon.ts");
  const frame = createReadingFrame(new El("div") as unknown as HTMLElement);

  assert.ok(frame.reading, "the frame exposes its reading column as the host's furniture mount");
  const reading = frame.reading as unknown as El;
  assert.ok(
    walk(frame.root as unknown as El).includes(reading),
    "the reading column is part of the frame's own tree",
  );
  const panel = frame.host.scrubber.panel as unknown as El;
  assert.ok(reading.children.includes(panel), "the instrument panel lives in the reading column");

  // Mount exactly as the room's conductor does, then assert the ratified placement.
  const c = createColophon();
  frame.reading.appendChild(c.root);
  const root = c.root as unknown as El;

  assert.equal(root.parentNode, reading, "the colophon mounts in the reading column");
  assert.equal(root.parentNode, panel.parentNode, "as the panel's SIBLING");
  assert.ok(!walk(panel).includes(root), "never inside the panel the engine hides on every teardown");
  assert.ok(
    reading.children.indexOf(root) > reading.children.indexOf(panel),
    "below the panel: the journal's foot, where one story ends and the next is invited",
  );

  // The whole point of the placement: the engine's teardown (panel.hidden = true in
  // exitAges/clearAges) cannot touch the colophon, so "always visible" is structural.
  panel.hidden = true;
  assert.equal(root.hidden, false, "hiding the panel leaves the colophon standing");
});
