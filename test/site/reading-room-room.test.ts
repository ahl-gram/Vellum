import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { El, installShim } from "../../test-support/element-shim.ts";
import type { RoomFurniture } from "../../src/site/reading-room/seats.ts";

// The Reading Room is a chart room on the Issue #462 pattern (Issue #463): the chart full-bleed on the deep, the name and its one control top right, the Journal on a slip that scrolls, the dated log's instrument as a bottom strip, no band, no footer, no roads out.
const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");
const app = read("src/site/reading-room/app.ts");
const seats = read("src/site/reading-room/seats.ts");

test("RR-room 2 the runtime colophon builder stays retired: app.ts builds no colophon of its own (kept for Issue #779 part 2i: a retired name a page cannot show)", () => {
  assert.ok(
    !app.includes("createColophon") && !app.includes("colophon.ts"),
    "the runtime colophon builder retires: the page seats the row",
  );
});

test("RR-room 5 seats.ts imports the shared room, the shared camera and the kit's keys (kept for Issue #779 part 2i by ruling 3 of issuecomment-6098118329; what they bind is read by RR36, RR39 and RR40)", () => {
  assert.match(seats, /import\s*\{\s*bindRoom, type Room\s*\}\s*from\s*"\.\.\/shared\/room\.ts"/, "the shared room");
  assert.match(
    seats,
    /import\s*\{\s*createZoomController\s*\}\s*from\s*"\.\.\/shared\/zoom-controller\.ts"/,
    "the Glass is the shared controller",
  );
  assert.match(
    seats,
    /import\s*\{\s*bindGlassKeys\s*\}\s*from\s*"\.\.\/shared\/glass-keys\.ts"/,
    "its keys and buttons are the kit's",
  );
});

test("RR-room 5b seatFrame seats the frame's parts: chart and status in the stage; strip, slip AND its tab inside the panel the engine hides, since a part seated outside it stands through every teardown; log and plate in the slip", async () => {
  const g = globalThis as Record<string, unknown>;
  const [had, prior] = ["document" in g, g.document];
  installShim();
  try {
    const [{ createReadingFrame }, { createProspectStage }, { seatFrame }] = await Promise.all([
      import("../../src/site/reading-frame/index.ts"),
      import("../../src/site/reading-room/prospect-stage.ts"),
      import("../../src/site/reading-room/seats.ts"),
    ]);
    const frame = createReadingFrame(new El("div") as unknown as HTMLElement);
    const plate = createProspectStage();
    const parts = [
      "stage",
      "sheet",
      "viewport",
      "strip",
      "scale",
      "slip",
      "tab",
      "journalDock",
      "folioTitle",
      "folioSub",
    ];
    const room = Object.fromEntries(parts.map((part) => [part, new El("div")])) as Record<string, El>;
    const rangeStood = (frame.host.scrubber.range as unknown as El).parentNode;
    seatFrame(frame, plate, room as unknown as RoomFurniture);
    const parentOf = (node: unknown) => (node as El).parentNode;
    const panel = frame.host.scrubber.panel as unknown as El;
    for (const part of ["strip", "slip", "tab"])
      assert.equal(room[part]!.parentNode, panel, `the ${part} stands in the panel`);
    const seated = panel.children.filter((c) => c === room.strip || c === room.slip || c === room.tab);
    assert.deepEqual(seated, [room.strip, room.slip, room.tab], "in the order the panel is read: strip, slip, tab");
    assert.equal(parentOf(frame.host.mapEl), room.viewport, "the chart in the stage's viewport");
    assert.equal(parentOf(frame.host.statusEl), room.stage, "the status in the stage");
    assert.equal(parentOf(frame.strip), room.strip, "the frame's strip in the room's");
    assert.equal(parentOf(plate.root), room.journalDock, "the plate in the slip");
    assert.equal(parentOf(frame.log.panel), room.journalDock, "and the log beside it");
    const well = parentOf(frame.host.scrubber.range);
    assert.ok(well?.classes.has("scale-well"), "the range stands in the scale's well");
    assert.ok(rangeStood, "the frame built its range inside its own tree");
    assert.equal(well?.parentNode, rangeStood, "and the well stands where the range stood");
    assert.equal(room.scale!.parentNode, well, "beside the scale");
  } finally {
    if (had) g.document = prior;
    else delete g.document;
  }
});

test("RR-room 7 a pace press tells the engine before it marks the frame's face (kept for Issue #779 part 2i: two synchronous writes in one handler no reader can order; RS29, RS30 and RA10 read what the press does)", () => {
  assert.match(
    app,
    /for \(const \[k, btn\] of frame\.paceButtons\)\s*btn\.addEventListener\("click", \(\) => \{\s*lc\.setPace\(k\);\s*frame\.markPace\(k\);\s*\}\);/,
    "one listener per press, the engine first, then the strip's face",
  );
});

// Issue #520 ruling B (2026-09-07): the room's writers each build a FRESH URLSearchParams and finalize it, so any key they do not know dies on a copied link. RA9 reads both writers carrying the table; this census of the writers and of where a hash is built is what no browser can read (kept for Issue #779 part 2i).
test("every hash the Reading Room builds is built inside one of its two known writers (#520 ruling B)", () => {
  const src = read("src/site/reading-room/app.ts");
  const decls = [
    ...src.matchAll(/function (\w+)\([^)]*\)[^{]*\{([\s\S]*?)\n\}/g),
    ...src.matchAll(/const (\w+)\s*=\s*(?:async\s*)?\([^)]*\)[^=]*=>\s*\{([\s\S]*?)\n\};/g),
  ];
  const writers = decls.filter(([, , body]) => /new URLSearchParams\(\s*(?:""|'')?\s*\)/.test(body!));
  assert.deepEqual(
    writers.map(([, name]) => name).sort(),
    ["prospectHrefFor", "syncHash"],
    "the writers this guard knows; a new one must be added here deliberately, having carried the key",
  );

  // Comments are blanked rather than cut, so every index still lines up with the source: prose apostrophes and a '#' inside a comment would otherwise read as string literals.
  const code = src.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, (c) => " ".repeat(c.length));
  const spans = writers.map((m) => [m.index, m.index + m[0].length] as const);
  for (const hit of code.matchAll(/history\.replaceState\(|["`][^"`\n]*#[^"`\n]*["`]/g)) {
    const at = hit.index;
    assert.ok(
      spans.some(([a, b]) => at >= a && at < b),
      `a hash is built at index ${at} (${JSON.stringify(code.slice(at, at + 44))}) outside every writer this guard knows, so nothing checks that it carries the table`,
    );
  }
});
