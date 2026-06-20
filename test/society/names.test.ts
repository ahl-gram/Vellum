import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../src/core/rng.ts";
import {
  CULTURES,
  createNamer,
  makeMapTitle,
} from "../../src/society/names.ts";

test("there are at least four distinct cultures", () => {
  assert.ok(CULTURES.length >= 4);
  const ids = new Set(CULTURES.map((c) => c.id));
  assert.equal(ids.size, CULTURES.length);
});

test("namer is deterministic per seed", () => {
  const culture = CULTURES[0]!;
  const a = createNamer(createRng(42), culture);
  const b = createNamer(createRng(42), culture);
  for (let i = 0; i < 20; i++) {
    assert.equal(a.name("settlement"), b.name("settlement"));
  }
});

test("150 settlement names are unique, capitalized, and sane", () => {
  for (const culture of CULTURES) {
    const namer = createNamer(createRng(7), culture);
    const seen = new Set<string>();
    for (let i = 0; i < 150; i++) {
      const n = namer.name("settlement");
      assert.ok(!seen.has(n), `duplicate name: ${n}`);
      seen.add(n);
      assert.ok(n.length >= 3 && n.length <= 24, `bad length: "${n}"`);
      assert.equal(n[0], n[0]!.toUpperCase(), `not capitalized: ${n}`);
      assert.ok(!n.includes("  "), `double space in: ${n}`);
    }
  }
});

test("feature kinds produce flavored names", () => {
  const namer = createNamer(createRng(11), CULTURES[0]!);
  const river = namer.name("river");
  const sea = namer.name("sea");
  const peak = namer.name("peak");
  const forest = namer.name("forest");
  const realm = namer.name("realm");
  for (const n of [river, sea, peak, forest, realm]) {
    assert.ok(n.length >= 3);
    assert.equal(n[0], n[0]!.toUpperCase());
  }
  // each kind set is distinct
  assert.equal(new Set([river, sea, peak, forest, realm]).size, 5);
});

test("some settlement names carry a culture suffix", () => {
  const culture = CULTURES[0]!;
  const namer = createNamer(createRng(3), culture);
  let suffixed = 0;
  for (let i = 0; i < 100; i++) {
    const n = namer.name("settlement").toLowerCase();
    if (culture.townSuffixes.some((s) => n.endsWith(s))) suffixed++;
  }
  assert.ok(suffixed >= 10, `expected suffixes to appear, got ${suffixed}`);
});

// Independent full Levenshtein (not the implementation's early-exit check),
// so the test cannot share a bug with the screen it guards.
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0]![j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + cost);
    }
  }
  return dp[m]![n]!;
}

test("no two bare bases within a world are near-duplicates (edit distance >= 2)", () => {
  for (const culture of CULTURES) {
    for (const seed of [1, 2, 7, 42, 100]) {
      const namer = createNamer(createRng(seed).fork("names"), culture);
      const bases: string[] = [];
      for (let i = 0; i < 30; i++) bases.push(namer.name("bare").toLowerCase());
      for (let i = 0; i < bases.length; i++) {
        for (let j = i + 1; j < bases.length; j++) {
          // Roman-numeral fallbacks (e.g. "kara ii") are deliberately exempt:
          // the numeral disambiguates a genuinely tight namespace.
          if (/ [ivx]+$/.test(bases[i]!) || / [ivx]+$/.test(bases[j]!)) continue;
          assert.ok(
            levenshtein(bases[i]!, bases[j]!) >= 2,
            `${culture.id} seed ${seed}: "${bases[i]}" ~ "${bases[j]}"`,
          );
        }
      }
    }
  }
});

test("generated bases avoid common English words", () => {
  const sample = ["main", "deep", "reach", "run", "sand", "mine", "more", "rest"];
  for (const culture of CULTURES) {
    for (const seed of [1, 5, 13, 42, 99]) {
      const namer = createNamer(createRng(seed).fork("names"), culture);
      for (let i = 0; i < 40; i++) {
        const base = namer.name("bare").toLowerCase();
        assert.ok(!sample.includes(base), `${culture.id} seed ${seed}: plain word "${base}"`);
      }
    }
  }
});

test("the near-dup screen rarely forces the Roman-numeral fallback", () => {
  // a real world draws ~40 names from one namer; if the screen were too
  // aggressive (esp. for short-phoneme cultures) it would degrade output to
  // "Xxx II/III". Guard that the fallback stays well under 5%.
  const isFallback = (n: string) => / (II|III|IV|V|VI|VII|VIII|IX|X)$/.test(n);
  for (const culture of CULTURES) {
    let fallbacks = 0;
    let total = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const namer = createNamer(createRng(seed).fork("names"), culture);
      for (let i = 0; i < 40; i++) {
        if (isFallback(namer.name("settlement"))) fallbacks++;
        total++;
      }
    }
    assert.ok(fallbacks / total < 0.05, `${culture.id}: ${fallbacks}/${total} fallbacks`);
  }
});

test("map titles are deterministic and themed by map type", () => {
  const culture = CULTURES[1]!;
  const a = makeMapTitle(createRng(5), culture, "archipelago");
  const b = makeMapTitle(createRng(5), culture, "archipelago");
  assert.deepEqual(a, b);
  assert.ok(a.title.length > 5);
  assert.ok(a.subtitle.length > 10);
  assert.match(a.subtitle, /year \d+/i);

  const island = makeMapTitle(createRng(5), culture, "island");
  assert.notEqual(island.title, a.title);
});
