import { test } from "node:test";
import assert from "node:assert/strict";
import { STYLES } from "../../src/render/style.ts";
import type { Arms } from "../../src/society/heraldry.ts";
import { FOREGROUND_SAMPLES } from "../../src/prospect/transect.ts";
import { composeProspect } from "../../src/prospect/compose.ts";
import type { Mass, ProspectGeometry } from "../../src/prospect/geometry.ts";
import { eraFor, plateCaption, type PlateEra } from "../../src/prospect/caption.ts";
import { plateKey } from "../../src/prospect/key.ts";
import { engravePlate, finishedPlateSvg } from "../../src/prospect/finished.ts";
import { INNER } from "../../src/prospect/dress/furniture.ts";
import { NO_SURROUNDINGS, type Surroundings } from "../../src/prospect/surroundings.ts";
import { layoutRun } from "../../src/prospect/letter/letter.ts";
import { GRID } from "../../src/prospect/letter/face.ts";
import { renderSvg } from "../../src/render/svg.ts";
import { bandOf, makeInput } from "../../test-support/prospect-fixtures.ts";
import { fnv1a } from "../../test-support/dress-svg.ts";

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
  // Convention (Issue #229): an undated ruin is ruined at any year after its founding.
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
    [{ kind: "capital", realmName: null, harbor: true }, "a chief city upon the sea"],
    [{ kind: "capital", realmName: null }, "a chief city of the open fields"],
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

function crowdedGeometry(): ProspectGeometry {
  const keep: Mass = { form: "keep", x: 300, w: 30, h: 40, base: 232, raise: 0, broken: false };
  const gate: Mass = { form: "tower", x: 120, w: 12, h: 22, base: 228, raise: 0, broken: false };
  return {
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
}

function twoQuaysOf(crowded: ProspectGeometry): ProspectGeometry {
  return {
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
}

test("the key numbers only drawn features, by rank then west to east, at most four of them", () => {
  const harborCapital = composeProspect(
    makeInput({ kind: "capital", harbor: true, foreground: bandOf(["beach", FOREGROUND_SAMPLES]) }),
  );
  const kinds = new Set(harborCapital.foreground.map((e) => e.kind));
  assert.ok(kinds.has("quay") && kinds.has("mole"), "premise: the capital fronts quay and mole");
  assert.deepEqual(
    plateKey(harborCapital).map((e) => `${e.letter}. ${e.label}`),
    ["1. The Keep", "2. The Quay", "3. The Mole"],
  );

  const crowded = crowdedGeometry();
  assert.deepEqual(
    plateKey(crowded).map((e) => `${e.letter}. ${e.label}`),
    ["1. The Keep", "2. The Bridge Gate", "3. The Quay", "4. The Mole"],
    "rank order wins and the fifth and later features are cut",
  );

  const twoQuays = twoQuaysOf(crowded);
  const [west, east] = plateKey(twoQuays);
  assert.ok(west?.x != null && east?.x != null && west.x < east.x, "same rank numbered west to east");

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

test("every place in a realm hangs the realm's arms in its wreath, from its founding (ruling D2, which overrules Issue #237's capitals and seats)", () => {
  for (const kind of ["capital", "seat", "town", "village", "hamlet"] as const) {
    assert.ok(finishedPlateSvg(makeInput({ kind, arms: ARMS }), STYLES.antique, 1300).includes('class="vellum-arms"'), `a ${kind} hangs its realm's arms`);
  }
  assert.ok(!finishedPlateSvg(makeInput({ kind: "capital", arms: ARMS }), STYLES.antique, 1040).includes('class="vellum-arms"'), "no realm yet, no arms");
  assert.ok(!finishedPlateSvg(makeInput({ kind: "town", arms: null }), STYLES.antique, 1300).includes('class="vellum-arms"'), "no realm, no arms");
  assert.ok(!finishedPlateSvg(makeInput({ kind: "town", arms: ARMS }), STYLES.antique, 1300, { surroundings: { ...NO_SURROUNDINGS, realmProclaimed: false } }).includes('class="vellum-arms"'), "a realm not yet proclaimed hangs no arms");
});

test("the plate wears its named furniture: the name alone in the cartouche, the epithet and founding on the banderole, the footer, the double frame", () => {
  const capital = finishedPlateSvg(makeInput({ kind: "capital", harbor: true }), STYLES.antique, 1300);
  assert.ok(capital.includes('aria-label="TESTHOLM"'), "the cartouche holds the name alone");
  assert.ok(capital.includes('aria-label="chief port of Testrealm, founded An. 1100"'), "the banderole carries the epithet and the founding");
  assert.ok(capital.includes('aria-label="FOUNDED AN. 1100 · VELLUM · CHART № 4242"'), "the footer");
  assert.ok(capital.includes('width="500"') && capital.includes('width="492"'), "the double-rule frame");
  assert.ok(!/<text\b/.test(capital), "every run is engraved, none left as device text");
});

test("the key panel renders when entries exist and is omitted when empty", () => {
  const keyed = finishedPlateSvg(makeInput({ kind: "capital", harbor: true, foreground: bandOf(["beach", FOREGROUND_SAMPLES]) }), STYLES.antique, 1300);
  assert.ok(keyed.includes('aria-label="1. The Keep"'), "the panel numbers the keep");
  const bare = finishedPlateSvg(makeInput({ kind: "hamlet", realmName: null }), STYLES.antique, 1300);
  assert.ok(!/aria-label="1\. /.test(bare), "a hamlet with nothing to key draws no panel");
});

test("a very long name shrinks its title and its cartouche stays inside the inner frame, while a name that fits keeps the round's full title size", () => {
  const name = "Weluarapa-upon-Woaku-by-the-Strand-of-Hakoawelua";
  const plate = engravePlate(makeInput({ name }), STYLES.antique, 1300);
  const cartouche = plate.furniture.cartouche;
  assert.ok(cartouche.length > 0, "the cartouche reports its boxes");
  for (const b of cartouche) assert.ok(b.x0 >= INNER.x0 && b.x1 <= INNER.x1, `a cartouche box runs past the frame: ${JSON.stringify(b)}`);
  const titleScale = (text: string, svg: string): number => Number(new RegExp(`aria-label="${text}" fill="[^"]*" transform="translate\\([^)]*\\) scale\\(([0-9.e-]+)\\)"`).exec(svg)?.[1]);
  const full = layoutRun({ text: "TESTHOLM", x: 0, y: 0, size: 13, fill: "#000" }).scale * GRID;
  assert.ok(Math.abs(titleScale("TESTHOLM", finishedPlateSvg(makeInput({}), STYLES.antique, 1300)) - full) < 1e-5, "a name that fits is set at the round's title size, 13");
  assert.ok(titleScale(name.toUpperCase(), renderSvg(plate.node)) < full * 0.9, "the long name is set smaller");
});

test("the two ratified dresses render; the others refuse", () => {
  const input = makeInput({});
  assert.ok(finishedPlateSvg(input, STYLES.antique, 1300).startsWith("<svg"));
  assert.ok(finishedPlateSvg(input, STYLES.ink, 1300).startsWith("<svg"));
  assert.throws(() => finishedPlateSvg(input, STYLES.topographic, 1300), RangeError);
  assert.throws(() => finishedPlateSvg(input, STYLES.nautical, 1300), RangeError);
});

test("the picture lies under the parchment grain; the named furniture rides above it", () => {
  const antique = finishedPlateSvg(makeInput({}), STYLES.antique, 1300);
  const rise = antique.indexOf(`fill="${STYLES.antique.limner!.grassDeep}"`);
  const grain = antique.indexOf("filter=\"url(#prospect-parch-");
  const furniture = antique.indexOf("class=\"pc-");
  assert.ok(rise >= 0 && grain >= 0 && furniture >= 0, JSON.stringify({ rise, grain, furniture }));
  assert.ok(rise < grain && grain < furniture, "the rise, then the grain, then the cartouche");
});

test("the same finished tuple renders byte-identically", () => {
  const input = makeInput({ kind: "capital", harbor: true, arms: ARMS });
  for (const style of [STYLES.antique, STYLES.ink]) {
    assert.equal(finishedPlateSvg(input, style, 1300), finishedPlateSvg(input, style, 1300), `${style.name}: the finish is pure`);
  }
});

/** A world's facts as plain data, so the pins cover the road towns, the beast and the cast's rider without a world (and its libm) behind them. */
const SURROUNDED: Surroundings = {
  seaName: "The Great Woaku",
  riverName: "The Waters of Lalo",
  rangeName: null,
  roadTowns: [{ index: 1, name: "Haireno", kind: "town", lateral: 0.39, dist: 21 }, { index: 2, name: "Nanawotani", kind: "village", lateral: -0.5, dist: 30 }],
  roadCount: 3,
  beast: { name: "Kaipu", epithet: "the Weed That Wakes", lateral: -0.2 },
  realmProclaimed: true,
};

// Re-pinned 2026-10-06 for E (Issue #754): armless synthetic fixtures only (the arms spend render/layers/heraldry, whose charges carry libm ancestry), so these bytes cannot drift across platforms. A deliberate plate change re-pins these with the cause named in the commit.
const PINNED: ReadonlyArray<{ name: string; year: number; style: "antique" | "ink"; sum: number }> = [
  { name: "harborCapital", year: 1300, style: "antique", sum: 1782288422 },
  { name: "harborCapital", year: 1300, style: "ink", sum: 1277032137 },
  { name: "harborCapital", year: 1040, style: "ink", sum: 1669871168 },
  { name: "ruinedTown", year: 1200, style: "antique", sum: 4087823426 },
  { name: "ruinedTown", year: 1120, style: "ink", sum: 699834108 },
  { name: "riverVillage", year: 1300, style: "antique", sum: 4107077100 },
  { name: "riverVillage", year: 1300, style: "ink", sum: 159481560 },
  { name: "fieldsHamlet", year: 1300, style: "antique", sum: 1603591529 },
  { name: "fieldsHamlet", year: 1300, style: "ink", sum: 2085009582 },
  { name: "drownedVillage", year: 1300, style: "antique", sum: 3771020040 },
  { name: "drownedVillage", year: 1300, style: "ink", sum: 2915606114 },
];

test("finished plates are byte-pinned across the eras and the dresses", () => {
  const fixtures = {
    harborCapital: { input: makeInput({ kind: "capital", harbor: true, foreground: bandOf(["beach", FOREGROUND_SAMPLES]) }), surroundings: SURROUNDED },
    ruinedTown: { input: makeInput({ ruined: true, ruinedYear: 1150 }), surroundings: undefined },
    riverVillage: { input: makeInput({ kind: "village", onRiver: true }), surroundings: undefined },
    fieldsHamlet: { input: makeInput({ kind: "hamlet" }), surroundings: undefined },
    drownedVillage: { input: makeInput({ kind: "village", ruined: true, foreground: bandOf(["marsh", FOREGROUND_SAMPLES]) }), surroundings: undefined },
  };
  assert.ok(PINNED.length >= 8, "the pins cover every fixture in both dresses and the eras");
  for (const { name, year, style, sum } of PINNED) {
    const fx = fixtures[name as keyof typeof fixtures];
    const svg = finishedPlateSvg(fx.input, STYLES[style], year, fx.surroundings === undefined ? {} : { surroundings: fx.surroundings });
    assert.equal(fnv1a(svg), sum, `${name}/${style}/An. ${year}: pinned plate checksum`);
  }
});
