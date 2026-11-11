import assert from "node:assert/strict";
import { test } from "node:test";
import { functionsIn } from "../../scripts/copy-hunt/functions.ts";
import { CUT, exactPairs, jaccard, similarPairs } from "../../scripts/copy-hunt/pairs.ts";
import {
  ALPHA,
  ALPHA_COPY,
  ALPHA_NEAR,
  fnOf,
  KINDS,
  LONG,
  LONG_NEAR,
  OTHER,
  TINY,
} from "../../test-support/copy-hunt-fixtures.ts";

test("similarity is the share of names two functions hold in common, and 0.6 itself is in", () => {
  assert.equal(jaccard(["a", "b", "c"], ["b", "c", "d"]), 0.5);
  assert.equal(jaccard(["a"], ["a"]), 1);
  assert.equal(jaccard(["a"], ["b"]), 0);
  const S = ["s1", "s2", "s3", "s4", "s5", "s6"];
  const x = fnOf("src/x.ts", 1, "x", [...S, "a1", "a2"]);
  const y = fnOf("src/y.ts", 1, "y", [...S, "b1", "b2"]);
  const z = fnOf("src/z.ts", 1, "z", [...S, "c1", "c2", "c3"]);
  assert.deepEqual(
    similarPairs([x, y, z], () => true),
    [{ x: 0, y: 1, similarity: 0.6 }],
  );
});

test("an exact copy is the same text in any two functions of 6 or more names, at any length, and only where one side is hunted", () => {
  const fns = [
    ...functionsIn("src/a.ts", ALPHA),
    ...functionsIn("src/b.ts", ALPHA_COPY),
    ...functionsIn("src/e.ts", TINY),
    ...functionsIn("src/f.ts", TINY),
    ...functionsIn("src/l.ts", LONG),
    ...functionsIn("src/m.ts", LONG),
  ];
  assert.deepEqual(
    exactPairs(fns, () => true),
    [
      { x: 0, y: 1, similarity: 1 },
      { x: 4, y: 5, similarity: 1 },
    ],
  );
  assert.deepEqual(
    exactPairs(fns, (i) => i === 5),
    [{ x: 4, y: 5, similarity: 1 }],
  );
  assert.deepEqual(
    exactPairs(fns, () => false),
    [],
  );
});

test("a similar pair is two comparable functions at 0.6 or more, not the same text, not nested, at most 6,000 characters each, one of them hunted", () => {
  const fns = [
    ...functionsIn("src/a.ts", ALPHA),
    ...functionsIn("src/b.ts", ALPHA_COPY),
    ...functionsIn("src/c.ts", ALPHA_NEAR),
    ...functionsIn("src/d.ts", OTHER),
    ...functionsIn("src/k.ts", KINDS),
    ...functionsIn("src/l.ts", LONG),
    ...functionsIn("src/n.ts", LONG_NEAR),
  ];
  const all = similarPairs(fns, () => true);
  assert.deepEqual(
    all.map((p) => [p.x, p.y]),
    [
      [0, 2],
      [1, 2],
    ],
  );
  for (const p of all) assert.equal(p.similarity, 7 / 11);
  assert.deepEqual(
    similarPairs(fns, (i) => i === 0).map((p) => [p.x, p.y]),
    [[0, 2]],
  );
  assert.ok(jaccard(fns[10]!.tokens, fns[11]!.tokens) >= CUT, "the nested pair would pass the cut");
  assert.ok(jaccard(fns[12]!.tokens, fns[13]!.tokens) >= CUT, "the long pair would pass the cut");
});
