import test from "node:test";
import assert from "node:assert/strict";
import {
  HELD_NOTES,
  islandsWord,
  looseWord,
  nextChoice,
  raggedWord,
  seatOf,
  slidersOf,
  type LandRow,
  type RowState,
} from "../../src/site/explorer/land-rows.ts";
import { placeId } from "../../src/world/outline-ids.ts";

const TX = placeId("ne-1159315211");

const rows = (live: LandRow[], held: LandRow[], hidden: LandRow[]): Record<LandRow, RowState> => {
  const out = {} as Record<LandRow, RowState>;
  for (const r of live) out[r] = "live";
  for (const r of held) out[r] = "held";
  for (const r of hidden) out[r] = "hidden";
  return out;
};

test("the five ruled B states seat as the stills drew them (Issue #854)", () => {
  const plain = seatOf("", {});
  assert.deepEqual(plain.rows, rows(["place", "land", "coast"], ["looseness"], ["islands", "sizes", "ragged"]));
  assert.equal(plain.note, HELD_NOTES.plain);

  const exact = seatOf("island", { outline: TX });
  assert.deepEqual(exact.rows, rows(["place", "looseness"], ["land", "coast"], ["islands", "sizes", "ragged"]));
  assert.equal(exact.note, HELD_NOTES.exact);

  const loose = seatOf("island", { outline: TX, looseness: 0.75 });
  assert.deepEqual(loose.rows, rows(["place", "looseness", "coast"], ["land"], ["islands", "sizes", "ragged"]));
  assert.equal(loose.note, HELD_NOTES.loose);

  const counted = seatOf("archipelago", { islands: 20 });
  assert.deepEqual(counted.rows, rows(["place", "islands", "sizes", "ragged"], ["looseness", "land"], ["coast"]));
  assert.equal(counted.note, HELD_NOTES.counted);

  const onArch = seatOf("archipelago", { outline: TX, islands: 20 });
  assert.deepEqual(onArch.rows, rows(["place", "looseness"], ["islands", "sizes", "land", "coast"], ["ragged"]));
  assert.equal(onArch.note, HELD_NOTES.archExact);
});

test("the states no still drew follow from the same table (Issue #854)", () => {
  const archPlain = seatOf("archipelago", {});
  assert.deepEqual(archPlain.rows, rows(["place", "islands", "land", "coast"], ["looseness"], ["sizes", "ragged"]));
  assert.equal(archPlain.note, HELD_NOTES.plain);

  const archLoose = seatOf("archipelago", { outline: TX, looseness: 0.5, islands: 20 });
  assert.deepEqual(archLoose.rows, rows(["place", "looseness", "coast"], ["islands", "sizes", "land"], ["ragged"]));
  assert.equal(archLoose.note, HELD_NOTES.archLoose);

  assert.deepEqual(seatOf("island", { islands: 20 }), seatOf("island", {}));
  assert.deepEqual(seatOf("", { outline: TX }), seatOf("island", { outline: TX }));
  assert.deepEqual(seatOf("continent", { outline: TX }), seatOf("island", { outline: TX }));
});

test("every state holds a row, so the held box always shows (Issue #854)", () => {
  const states = [
    seatOf("", {}),
    seatOf("island", { outline: TX }),
    seatOf("island", { outline: TX, looseness: 0.75 }),
    seatOf("archipelago", { islands: 20 }),
    seatOf("archipelago", { outline: TX, islands: 20 }),
    seatOf("archipelago", {}),
    seatOf("archipelago", { outline: TX, looseness: 0.5, islands: 20 }),
    seatOf("island", { islands: 20 }),
    seatOf("", { outline: TX }),
    seatOf("continent", { outline: TX }),
  ];
  for (const s of states) assert.ok(Object.values(s.rows).includes("held"), JSON.stringify(s.rows));
});

test("the readouts say the ruled words at their switch points (Issue #854)", () => {
  const loose = [0, 0.01, 0.33, 0.34, 0.8, 0.81, 1].map(looseWord);
  assert.deepEqual(loose, [
    "exact",
    "soft edge",
    "soft edge",
    "looser",
    "looser",
    "nearly the seed's own",
    "nearly the seed's own",
  ]);
  assert.equal(islandsWord(1), "seed's choice");
  assert.equal(islandsWord(20), "about 20");
  assert.equal(raggedWord(0), "round");
  assert.equal(raggedWord(0.4), "ragged 0.40");
});

test("an edit makes a new choice and leaves the old one alone (Issue #854)", () => {
  const c = { islands: 20, isleSize: "varied", raggedness: 0.4 } as const;
  assert.deepEqual(nextChoice(c, { kind: "islands", slider: 1 }), { isleSize: "varied", raggedness: 0.4 });
  assert.deepEqual(c, { islands: 20, isleSize: "varied", raggedness: 0.4 });
  assert.deepEqual(nextChoice({ outline: TX, looseness: 0.5 }, { kind: "place", id: null }), { looseness: 0.5 });
  assert.deepEqual(nextChoice({ islands: 20 }, { kind: "place", id: TX }), { islands: 20, outline: TX });
  assert.deepEqual(nextChoice({ outline: TX, looseness: 0.5 }, { kind: "looseness", slider: 0 }), { outline: TX });
  assert.deepEqual(nextChoice({ outline: TX }, { kind: "looseness", slider: 67 }), { outline: TX, looseness: 0.67 });
  assert.deepEqual(nextChoice({ islands: 20, raggedness: 0.4 }, { kind: "raggedness", slider: 0 }), { islands: 20 });
  assert.deepEqual(nextChoice({ islands: 20 }, { kind: "raggedness", slider: 40 }), { islands: 20, raggedness: 0.4 });
  assert.deepEqual(nextChoice({ islands: 20 }, { kind: "size", size: "varied" }), { islands: 20, isleSize: "varied" });
  assert.deepEqual(nextChoice({}, { kind: "islands", slider: 7 }), { islands: 7 });
});

test("the sliders show the held choice, the seed's choice at the islands' far left (Issue #854)", () => {
  assert.deepEqual(slidersOf({}), { looseness: 0, islands: 1, raggedness: 0, size: "equal" });
  assert.equal(slidersOf({ outline: TX, looseness: 0.29 }).looseness, 29);
  assert.deepEqual(slidersOf({ islands: 20, isleSize: "varied", raggedness: 0.4 }), {
    looseness: 0,
    islands: 20,
    raggedness: 40,
    size: "varied",
  });
});
