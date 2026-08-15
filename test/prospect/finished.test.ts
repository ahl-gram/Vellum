import { test } from "node:test";
import assert from "node:assert/strict";
import { STYLES } from "../../src/render/style.ts";
import { el } from "../../src/render/svg.ts";
import type { Arms } from "../../src/society/heraldry.ts";
import { FOREGROUND_SAMPLES } from "../../src/prospect/transect.ts";
import { composeProspect } from "../../src/prospect/compose.ts";
import { prospectSvg } from "../../src/prospect/dress/plate.ts";
import type { Mass, ProspectGeometry } from "../../src/prospect/geometry.ts";
import { eraFor, plateCaption, type PlateEra } from "../../src/prospect/caption.ts";
import { plateKey } from "../../src/prospect/key.ts";
import { finishedPlateSvg } from "../../src/prospect/finished.ts";
import { bandOf, makeInput } from "../../test-support/prospect-fixtures.ts";
import { fnv1a, tokenColors } from "../../test-support/dress-svg.ts";

const f = (v: number): string => String(Math.round(v * 10) / 10);

const ARMS: Arms = { division: "perPale", field: ["azure", "argent"], charge: null };

test("the year resolves the era against the chronicle", () => {
  const dated = makeInput({ ruined: true, ruinedYear: 1150 });
  const eras: Array<[number, PlateEra]> = [
    [1099, "before-founding"],
    [1100, "standing"],
    [1149, "standing"],
    [1150, "ruined"],
    [1400, "ruined"],
  ];
  for (const [year, era] of eras) {
    assert.equal(eraFor(dated, year), era, `dated ruin at An. ${year}`);
  }
  assert.equal(eraFor(makeInput({}), 1400), "standing", "a sound town stands");
  // The #229 convention (2026-08-10): an undated ruin is ruined at any year after its founding.
  const undated = makeInput({ ruined: true, ruinedYear: null });
  assert.equal(eraFor(undated, 1100), "standing");
  assert.equal(eraFor(undated, 1101), "ruined");
});

test("the caption stacks title, founded line, epithet, and footer", () => {
  const input = makeInput({ harbor: true });
  const c = plateCaption(input, composeProspect(input), "standing", 1300, "The Great Woaku");
  assert.equal(c.title, "THE PROSPECT OF TESTHOLM");
  assert.equal(c.yearLine, "FOUNDED AN. 1100");
  assert.equal(c.epithet, "a harbour town upon the Great Woaku");
  assert.equal(c.footer, "VELLUM · CHART № 4242");
});

test("the epithet register keys on tier, realm, and drawn features", () => {
  const realm = { realmName: "The Chiefdom of Rekekoa" };
  const cases: Array<[Parameters<typeof makeInput>[0], string]> = [
    [{ kind: "capital", harbor: true, ...realm }, "chief port of the Chiefdom of Rekekoa"],
    [{ kind: "capital", ...realm }, "chief city of the Chiefdom of Rekekoa"],
    [{ kind: "seat", ...realm }, "seat of the Chiefdom of Rekekoa"],
    [{ kind: "town", onRiver: true }, "a bridge town upon the river"],
    [{ kind: "village", onRiver: true }, "a village at the weir"],
    [{ kind: "village", harbor: true }, "a fisher village of the strand"],
    [{ kind: "hamlet" }, "a hamlet of the open fields"],
    [
      { kind: "town", foreground: bandOf(["temperateForest", FOREGROUND_SAMPLES]) },
      "a market town under the greenwood",
    ],
  ];
  for (const [overrides, epithet] of cases) {
    const input = makeInput(overrides);
    const c = plateCaption(input, composeProspect(input), "standing", 1300, null);
    assert.equal(c.epithet, epithet, JSON.stringify(overrides));
  }
  const bridged = composeProspect(makeInput({ kind: "town", onRiver: true }));
  assert.ok(
    bridged.foreground.some((e) => e.kind === "bridge"),
    "premise: a river town composes a bridge",
  );
});

test("a ruined era keeps the founding in the year line and carries the ruin in the epithet", () => {
  const ruinCases: Array<[Parameters<typeof makeInput>[0], string]> = [
    [{ kind: "town" }, "ruined An. 1150"],
    [{ kind: "capital" }, "thrown down An. 1150"],
    [
      { kind: "village", foreground: bandOf(["marsh", FOREGROUND_SAMPLES]) },
      "lost to the waters An. 1150",
    ],
  ];
  for (const [overrides, epithet] of ruinCases) {
    const input = makeInput({ ...overrides, ruined: true, ruinedYear: 1150 });
    const c = plateCaption(input, composeProspect(input), "ruined", 1400, null);
    assert.equal(c.epithet, epithet, JSON.stringify(overrides));
    assert.equal(c.yearLine, "FOUNDED AN. 1100");
  }
  const undated = makeInput({ ruined: true, ruinedYear: null });
  const c = plateCaption(undated, composeProspect(undated), "ruined", 1400, null);
  assert.equal(c.epithet, "ruined in a year unrecorded");
});

test("before the founding the caption names the ground and drops the year line", () => {
  const input = makeInput({});
  const g = composeProspect(input, { era: "before-founding" });
  const c = plateCaption(input, g, "before-founding", 1040, null);
  assert.equal(c.title, "THE PROSPECT OF TESTHOLM");
  assert.equal(c.yearLine, null);
  assert.equal(c.epithet, "the ground where Testholm will rise · An. 1040");
});

test("the key indexes only drawn features, by rank then west to east, at most four", () => {
  const harborCapital = composeProspect(
    makeInput({ kind: "capital", harbor: true, foreground: bandOf(["beach", FOREGROUND_SAMPLES]) }),
  );
  const kinds = new Set(harborCapital.foreground.map((e) => e.kind));
  assert.ok(kinds.has("quay") && kinds.has("mole"), "premise: the capital fronts quay and mole");
  assert.deepEqual(
    plateKey(harborCapital).map((e) => `${e.letter}. ${e.label}`),
    ["A. The Keep", "B. The Quay", "C. The Mole"],
  );

  const keep: Mass = { form: "keep", x: 300, w: 30, h: 40, base: 232, raise: 0, broken: false };
  const gate: Mass = { form: "tower", x: 120, w: 12, h: 22, base: 228, raise: 0, broken: false };
  const crowded: ProspectGeometry = {
    seed: 1,
    index: 0,
    ground: { base: 232, rise: 0, line: [] },
    ridge: null,
    water: { kind: "river", y0: 238, y1: 276 },
    masses: [keep],
    walls: [],
    foreground: [
      { kind: "jetty", x0: 60, y0: 237, x1: 90, y1: 240, posts: [] },
      {
        kind: "mill",
        house: { form: "gable", x: 400, w: 22, h: 15, base: 267, raise: 0, broken: false },
        wheel: { cx: 396, cy: 259, r: 6 },
      },
      { kind: "weir", x0: 180, x1: 240, y: 239 },
      { kind: "bridge", x0: 130, x1: 260, deckY: 227, waterY: 253, arches: 3, gateTower: gate },
      {
        kind: "quay",
        x0: 150,
        x1: 280,
        y: 238,
        bollards: [],
        steps: { x: 270, y: 238, count: 3 },
        arcade: { x0: 160, x1: 220, arches: 3 },
      },
      { kind: "mole", rootX: 487, headX: 470, headY: 248 },
    ],
  };
  assert.deepEqual(
    plateKey(crowded).map((e) => `${e.letter}. ${e.label}`),
    ["A. The Keep", "B. The Bridge Gate", "C. The Quay", "D. The Mole"],
    "rank order wins and the fifth and later features are cut",
  );

  const twoQuays: ProspectGeometry = {
    ...crowded,
    masses: [],
    foreground: [
      {
        kind: "quay",
        x0: 300,
        x1: 340,
        y: 238,
        bollards: [],
        steps: { x: 330, y: 238, count: 3 },
        arcade: { x0: 305, x1: 335, arches: 2 },
      },
      {
        kind: "quay",
        x0: 40,
        x1: 90,
        y: 238,
        bollards: [],
        steps: { x: 80, y: 238, count: 3 },
        arcade: { x0: 45, x1: 85, arches: 2 },
      },
    ],
  };
  const [west, east] = plateKey(twoQuays);
  assert.ok(west && east && west.x < east.x, "same rank letters west to east");

  assert.deepEqual(plateKey(composeProspect(makeInput({ kind: "hamlet" }))), []);
});

test("the finished plate honors the year in ground and lettering", () => {
  const input = makeInput({ ruined: true, ruinedYear: 1150 });
  const before = finishedPlateSvg(input, STYLES.antique, 1040);
  const standing = finishedPlateSvg(input, STYLES.antique, 1120);
  const fallen = finishedPlateSvg(input, STYLES.antique, 1200);

  assert.ok(before.includes("will rise"), "pre-founding note");
  assert.ok(!before.includes("FOUNDED"), "no founded line before the founding");
  assert.ok(standing.includes("FOUNDED AN. 1100"), "standing plate records the founding");
  assert.ok(!standing.includes("ruined An."), "no ruin phrase before the ruin");
  assert.ok(fallen.includes("ruined An. 1150"), "fallen plate records the ruin");

  const skyline = composeProspect({ ...input, ruined: false });
  const m = skyline.masses[0]!;
  const foot = `M${f(m.x)} ${f(m.base)}`;
  assert.ok(standing.includes(foot), "the standing skyline is drawn");
  assert.ok(!before.includes(foot), "the pre-founding ground is bare");
  assert.notEqual(fallen, standing, "the ruin changes the plate");
});

test("the finished plate wears its furniture, and only capitals and seats hang arms", () => {
  const capital = finishedPlateSvg(makeInput({ kind: "capital", arms: ARMS }), STYLES.antique, 1300);
  assert.ok(capital.includes("THE PROSPECT OF TESTHOLM"), "title");
  assert.ok(capital.includes("FOUNDED AN. 1100"), "year line");
  assert.ok(capital.includes("VELLUM · CHART № 4242"), "footer");
  assert.ok(capital.includes('width="500"') && capital.includes('width="492"'), "double-rule frame");
  assert.ok(capital.includes('class="vellum-arms"'), "a capital hangs its arms");

  const seat = finishedPlateSvg(makeInput({ kind: "seat", arms: ARMS }), STYLES.antique, 1300);
  assert.ok(seat.includes('class="vellum-arms"'), "a seat hangs its arms");

  const town = finishedPlateSvg(makeInput({ kind: "town", arms: ARMS }), STYLES.antique, 1300);
  assert.ok(!town.includes('class="vellum-arms"'), "a mere town hangs none (GO condition 2)");

  const unfounded = finishedPlateSvg(makeInput({ kind: "capital", arms: ARMS }), STYLES.antique, 1040);
  assert.ok(!unfounded.includes('class="vellum-arms"'), "no realm yet, no arms");
});

test("the key strip renders when entries exist and is omitted when empty", () => {
  const keyed = finishedPlateSvg(
    makeInput({ kind: "capital", harbor: true, foreground: bandOf(["beach", FOREGROUND_SAMPLES]) }),
    STYLES.antique,
    1300,
  );
  assert.ok(keyed.includes("A. The Keep."), "the strip letters the keep");
  const bare = finishedPlateSvg(makeInput({ kind: "hamlet" }), STYLES.antique, 1300);
  assert.ok(!bare.includes("A. The "), "a hamlet's key is omitted, not empty");
});

test("the two ratified dresses render; the others refuse", () => {
  const input = makeInput({});
  assert.ok(finishedPlateSvg(input, STYLES.antique, 1300).startsWith("<svg"));
  assert.ok(finishedPlateSvg(input, STYLES.ink, 1300).startsWith("<svg"));
  assert.throws(() => finishedPlateSvg(input, STYLES.topographic, 1300), RangeError);
  assert.throws(() => finishedPlateSvg(input, STYLES.nautical, 1300), RangeError);
});

test("engraved nodes sit under the parchment grain; furniture rides above it", () => {
  const g = composeProspect(makeInput({}));
  const opts = {
    idSuffix: "probe",
    engraved: [el("circle", { id: "probe-under" })],
    furniture: [el("circle", { id: "probe-over" })],
  };
  const antique = prospectSvg(g, STYLES.antique, opts);
  const under = antique.indexOf('id="probe-under"');
  const grain = antique.indexOf('filter="url(#prospect-parch-probe)"');
  const over = antique.indexOf('id="probe-over"');
  assert.ok(under >= 0 && grain >= 0 && over >= 0, "all three render");
  assert.ok(under < grain, "engraved work lies under the grain");
  assert.ok(grain < over, "furniture rides above the grain");

  const ink = prospectSvg(g, STYLES.ink, opts);
  const iU = ink.indexOf('id="probe-under"');
  const iO = ink.indexOf('id="probe-over"');
  assert.ok(iU >= 0 && iO >= 0 && iU < iO, "ink keeps the order without grain");
});

// Armless on purpose: the arms spend the heraldic palette, which is its own token set.
test("finished plates spend only style tokens", () => {
  for (const style of [STYLES.antique, STYLES.ink]) {
    const svg = finishedPlateSvg(
      makeInput({ kind: "capital", harbor: true, foreground: bandOf(["beach", FOREGROUND_SAMPLES]) }),
      style,
      1300,
    );
    const inks = (svg.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).filter((c) =>
      /^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3,5})?$/.test(c),
    );
    assert.ok(inks.length >= 3, `${style.name}: the plate carries ink`);
    const allowed = tokenColors(style);
    for (const c of inks) {
      assert.ok(allowed.has(c.toLowerCase()), `${style.name}: ${c} is not a token`);
    }
  }
});

test("the same finished tuple renders byte-identically", () => {
  const input = makeInput({ kind: "capital", harbor: true, arms: ARMS });
  for (const style of [STYLES.antique, STYLES.ink]) {
    assert.equal(
      finishedPlateSvg(input, style, 1300),
      finishedPlateSvg(input, style, 1300),
      `${style.name}: the finish is pure`,
    );
  }
});

// Pinned 2026-08-14 from a measured run; armless synthetic fixtures only (the arms spend
// render/layers/heraldry, whose charges carry libm ancestry), so these bytes cannot drift
// across platforms. A deliberate plate change re-pins these with the cause named in the commit.
const PINNED: ReadonlyArray<{ name: string; year: number; style: "antique" | "ink"; sum: number }> = [
  { name: "harborCapital", year: 1300, style: "antique", sum: 3845457821 },
  { name: "harborCapital", year: 1300, style: "ink", sum: 2154475468 },
  { name: "ruinedTown", year: 1200, style: "antique", sum: 2254064444 },
  { name: "ruinedTown", year: 1120, style: "ink", sum: 1578688448 },
  { name: "harborCapital", year: 1040, style: "ink", sum: 289721786 },
];

test("finished plates are byte-pinned across the eras", () => {
  const fixtures = {
    harborCapital: makeInput({
      kind: "capital",
      harbor: true,
      foreground: bandOf(["beach", FOREGROUND_SAMPLES]),
    }),
    ruinedTown: makeInput({ ruined: true, ruinedYear: 1150 }),
  };
  for (const { name, year, style, sum } of PINNED) {
    const svg = finishedPlateSvg(fixtures[name as keyof typeof fixtures], STYLES[style], year);
    assert.equal(fnv1a(svg), sum, `${name}/${style}/An. ${year}: pinned plate checksum`);
  }
});
