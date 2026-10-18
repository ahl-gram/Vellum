import { test } from "node:test";
import assert from "node:assert/strict";

// The Reading Room's frame (Issue #219): host-agnostic, the first non-Explorer host of the Issue #191 engine; ratified 2026-07-27 (https://github.com/ahl-gram/Vellum/issues/219#issuecomment-5097366231): no Explorer watch view, and the log FLOWS at every width, bounded by construction. The frame BUILDS DOM, so the element shim stands in for the environment, never the module under test.
import { El, el, installShim, walk } from "../../test-support/element-shim.ts";

installShim();

test("the frame mounts and hands the engine a complete host (#219, the first non-Explorer host)", async () => {
  const { createReadingFrame } = await import("../../src/site/shared/reading-frame/index.ts");
  const mount = new El("div");
  const frame = createReadingFrame(mount as unknown as HTMLElement);

  assert.equal(mount.children.length, 1, "the frame mounts its root into the element it was given");
  assert.equal(mount.children[0], frame.root as unknown as El, "the mounted root is the frame's root");

  const host = frame.host;
  for (const [name, node] of [
    ["mapEl", host.mapEl],
    ["statusEl", host.statusEl],
    ["scrubber.panel", host.scrubber.panel],
    ["scrubber.playBtn", host.scrubber.playBtn],
    ["scrubber.range", host.scrubber.range],
    ["scrubber.year", host.scrubber.year],
    ["scrubber.sig", host.scrubber.sig],
    ["scrubber.strip", host.scrubber.strip],
  ] as const) {
    assert.ok(node instanceof El, `the host supplies a real element for ${name}`);
    assert.ok(
      walk(frame.root as unknown as El).includes(node),
      `${name} is part of the frame's own tree, not a detached stub`,
    );
  }

  const { createLivingChart } = await import("../../src/site/shared/living-chart/index.ts");
  const lc = createLivingChart(host);
  for (const method of [
    "applyAges",
    "agesState",
    "applyScrub",
    "scrubTo",
    "applyVoyage",
    "voyagePaintAt",
    "scrubState",
    "destroy",
  ]) {
    assert.equal(
      typeof (lc as Record<string, unknown>)[method],
      "function",
      `the engine drives the frame: ${method}()`,
    );
  }
});

test("the reading frame's chart mount carries the engine's class beside its own, for any host that mounts it (#302)", async () => {
  const { createReadingFrame } = await import("../../src/site/shared/reading-frame/index.ts");
  const frame = createReadingFrame(new El("div") as unknown as HTMLElement);
  const mapEl = frame.host.mapEl as unknown as El;
  assert.ok(mapEl.classes.has("rf-chart"), "the mount keeps the frame's own class");
  assert.ok(mapEl.classes.has("living-chart"), "and carries living-chart beside it");
});

test("#402/#442 the frame forwards onAgesTold to the scrubber host beside onPark", async () => {
  const { createReadingFrame } = await import("../../src/site/shared/reading-frame/index.ts");
  const onAgesTold = (): void => {};
  const onPark = (): void => {};
  const frame = createReadingFrame(new El("div") as unknown as HTMLElement, { onPark, onAgesTold });
  assert.equal(frame.host.scrubber.onAgesTold, onAgesTold, "the told signal reaches the engine's deps");
  assert.equal(frame.host.scrubber.onPark, onPark, "onPark still rides beside it");
});

test("#442 the bar and the live row share ONE wrapper, inside the panel, above the journal", async () => {
  const { createReadingFrame } = await import("../../src/site/shared/reading-frame/index.ts");
  const frame = createReadingFrame(new El("div") as unknown as HTMLElement);
  const panel = frame.host.scrubber.panel as unknown as El;
  const strip = frame.strip as unknown as El;

  assert.equal(strip.className, "rf-instrument-strip");
  assert.ok(
    walk(panel).includes(strip),
    "the strip nests inside the panel the engine hides, so a teardown takes it too",
  );
  assert.deepEqual(
    strip.children.map((c) => c.className),
    ["rf-instrument", "rf-told"],
    "the wrapper holds the bar and the live row, in that order",
  );
  assert.deepEqual(
    panel.children.map((c) => c.className),
    ["rf-instrument-strip", "rf-log"],
    "and the wrapper sits above the one journal",
  );
  assert.equal(
    (frame.told as unknown as El).hidden,
    true,
    "the live row rests hidden: a plain arrival tells nothing yet",
  );
  assert.equal(
    (frame.told as unknown as El).getAttribute("aria-hidden"),
    "true",
    "it mirrors a row already in the document, so it is not announced twice",
  );
});

test("#442 setTold mirrors either half's row, and clears rather than lingering", async () => {
  const { createReadingFrame } = await import("../../src/site/shared/reading-frame/index.ts");
  const frame = createReadingFrame(new El("div") as unknown as HTMLElement);
  const told = frame.told as unknown as El;
  const parts = () => told.children.map((s) => ({ cls: s.className, text: s.textContent }));

  frame.setTold({ chamber: "survey", row: 3, index: 7, day: 61, text: "we came to Theril." });
  assert.equal(told.hidden, false);
  assert.deepEqual(
    parts(),
    [
      { cls: "cr-year", text: "day 61" },
      { cls: "cr-text", text: "we came to Theril." },
    ],
    "the survey half counts days, the gutter the prologue rows already use",
  );

  frame.setTold({ chamber: "ages", year: 900, text: "Gamma fell to ruin." });
  assert.deepEqual(
    parts(),
    [
      { cls: "cr-year", text: "900" },
      { cls: "cr-text", text: "Gamma fell to ruin." },
    ],
    "the chronicle half carries the annal's year",
  );

  frame.setTold(null);
  assert.equal(told.hidden, true, "nothing told, nothing shown");
  assert.deepEqual(
    parts(),
    [
      { cls: "cr-year", text: "" },
      { cls: "cr-text", text: "" },
    ],
    "and the prose is cleared, so a hidden row holds no stale world's line",
  );
});

test("#442 the live row is a MIRROR: it never writes into the journal the engine owns", async () => {
  const { createReadingFrame } = await import("../../src/site/shared/reading-frame/index.ts");
  const frame = createReadingFrame(new El("div") as unknown as HTMLElement);
  const strip = frame.host.scrubber.strip as unknown as El;
  frame.log.render([{ year: 214, text: "Aldmarch is founded." }]);
  const before = strip.children.map((li) => ({ cls: li.className, text: li.textContent }));

  frame.setTold({ chamber: "ages", year: 214, text: "Aldmarch is founded." });
  frame.setTold({ chamber: "survey", row: 0, index: 0, day: 1, text: "set out from Aldmarch." });
  frame.setTold(null);

  assert.deepEqual(
    strip.children.map((li) => ({ cls: li.className, text: li.textContent })),
    before,
    "the journal strip is byte-identical after three told paints: the mirror owns its own element",
  );
  assert.equal(
    walk(strip).includes(frame.told as unknown as El),
    false,
    "and the live row is not inside the journal at all",
  );
});

test("#442 the mirror takes its SOURCE's voice: a day row is told in the surveyor's prologue, an annal in the chronicler's", async () => {
  const { createReadingFrame } = await import("../../src/site/shared/reading-frame/index.ts");
  const frame = createReadingFrame(new El("div") as unknown as HTMLElement);
  const told = frame.told as unknown as El;

  frame.setTold({ chamber: "survey", row: 3, index: 7, day: 61, text: "we came to Theril." });
  assert.equal(told.classes.has("prologue"), true, "a day row is the surveyor's hand, the class the journal uses");
  frame.setTold({ chamber: "ages", year: 900, text: "Gamma fell to ruin." });
  assert.equal(
    told.classes.has("prologue"),
    false,
    "an annal is the chronicler's, and must not inherit the survey voice",
  );
  frame.setTold(null);
});

test("the instrument panel starts hidden and the ONE journal nests inside it (#219, fused at #220)", async () => {
  const { createReadingFrame } = await import("../../src/site/shared/reading-frame/index.ts");
  const frame = createReadingFrame(new El("div") as unknown as HTMLElement);
  assert.equal((frame.host.scrubber.panel as unknown as El).hidden, true, "the instrument starts hidden");
  // The journal must ride INSIDE the panel the engine hides, or turning the instrument off would leave a stale strip on screen.
  const panel = frame.host.scrubber.panel as unknown as El;
  assert.ok(
    walk(panel).includes(frame.host.scrubber.strip as unknown as El),
    "the journal strip lives inside the panel the engine hides",
  );
  assert.ok(
    walk(panel).includes(frame.host.scrubber.sig as unknown as El),
    "the signature line lives inside the same panel",
  );
});

test("the frame sets no element id on anything it builds: identity stays the host's namespace, and vellum/frame-no-id-lookup keeps its source from looking one up (#191, #219)", async () => {
  const { createReadingFrame } = await import("../../src/site/shared/reading-frame/index.ts");
  const frame = createReadingFrame(new El("div") as unknown as HTMLElement);
  for (const node of walk(frame.root as unknown as El)) {
    assert.ok(
      !node.attrs.has("id"),
      `the frame set an id on <${node.tagName.toLowerCase()}>; a second frame on one page would collide`,
    );
  }
});

test("destroy() unmounts the frame (a page host that leaves takes its DOM with it)", async () => {
  const { createReadingFrame } = await import("../../src/site/shared/reading-frame/index.ts");
  const mount = new El("div");
  const frame = createReadingFrame(mount as unknown as HTMLElement);
  frame.destroy();
  assert.equal(mount.children.length, 0, "destroy() removes the frame's root from its mount");
});

test("#493 the pace stands at the readout's right: three presses 1x 2x 4x in one group, the slowest pressed at rest, and the frame moves the press", async () => {
  const { createReadingFrame } = await import("../../src/site/shared/reading-frame/index.ts");
  const frame = createReadingFrame(el());
  const instrument = (frame.strip as unknown as El).children[0]!;
  assert.deepEqual(
    instrument.children.map((c) => c.className),
    ["rf-play", "rf-range ages-range", "rf-year", "rf-pace"],
    "Play, the bar, the readout, the pace",
  );
  const pace = instrument.children[3]!;
  assert.equal(pace.getAttribute("role"), "group");
  assert.equal(pace.getAttribute("aria-label"), "The pace");
  assert.deepEqual(
    pace.children.map((b) => [b.tagName, b.textContent, b.dataset.pace, b.getAttribute("aria-pressed")]),
    [
      ["BUTTON", "1×", "1", "true"],
      ["BUTTON", "2×", "2", "false"],
      ["BUTTON", "4×", "4", "false"],
    ],
    "the mockup's three presses, the default (1x, ruled 2026-09-02) pressed",
  );
  assert.deepEqual([...frame.paceButtons.keys()], [1, 2, 4], "the room reaches each press by its pace");
  frame.markPace(4);
  assert.deepEqual(
    pace.children.map((b) => b.getAttribute("aria-pressed")),
    ["false", "false", "true"],
  );
  frame.markPace(1);
  assert.deepEqual(
    pace.children.map((b) => b.getAttribute("aria-pressed")),
    ["true", "false", "false"],
    "and back",
  );
});
