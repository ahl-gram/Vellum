import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { foundWorld } from "../../src/world/founding/found.ts";
import { identityParams, writtenParams } from "../../src/site/shared/written-address.ts";
import { overridesOfLand, readWorldKeys } from "../../src/site/shared/address-grammar.ts";
import { useCommittedGazetteer } from "../../test-support/founding-gazetteer.ts";

const FLAGSHIP = "a cold archipelago of black pines, iron harbors, and a drowned kingdom";
const KEPT = JSON.parse(
  readFileSync(new URL("../world/founding-sample.json", import.meta.url), "utf8"),
) as ReadonlyArray<{ sentence: string }>;

test("a written world's link leads with its sentence and version, drops every identity key and keeps every other key in order, and a link with no sentence is left as it is", () => {
  const p = new URLSearchParams(
    "seed=5&style=ink&type=island&band=polar&land=300&coast=40&outline=ne-1159315211&looseness=50&islands=20&isleSize=varied&raggedness=10&theme=vegetation&legend=1&cx=0.5000&cy=0.5000&k=2.0000&survey=&table=k-s.seed-1",
  );
  assert.equal(
    writtenParams(p, { sentence: FLAGSHIP, version: 1 }).toString(),
    new URLSearchParams([
      ["found", FLAGSHIP],
      ["v", "1"],
      ["style", "ink"],
      ["theme", "vegetation"],
      ["legend", "1"],
      ["cx", "0.5000"],
      ["cy", "0.5000"],
      ["k", "2.0000"],
      ["survey", ""],
      ["table", "k-s.seed-1"],
    ]).toString(),
  );
  assert.equal(writtenParams(p, null), p);
  assert.equal(
    writtenParams(new URLSearchParams("found=old&v=1&style=ink"), { sentence: "new", version: 1 }).toString(),
    "found=new&v=1&style=ink",
  );
});

test("a written world's settings seat as the ordinary keys the Explorer's controls read, exactly, for every sentence of the founding sample", () => {
  useCommittedGazetteer();
  let seated = 0;
  let landed = 0;
  for (const row of KEPT) {
    const f = foundWorld(row.sentence);
    if (!f.ok) continue;
    const p = identityParams(new URLSearchParams("found=x&v=1&style=ink&theme=climate"), f.seed, f.overrides);
    const k = readWorldKeys(p);
    assert.equal(k.seed, f.seed, row.sentence);
    const { culture: _culture, ...want } = f.overrides;
    assert.deepEqual(
      {
        ...(k.type !== null ? { mapType: k.type } : {}),
        ...(k.band !== null ? { band: k.band } : {}),
        ...overridesOfLand(k),
      },
      want,
      row.sentence,
    );
    assert.equal(p.get("style"), "ink");
    assert.equal(p.get("theme"), "climate");
    assert.equal(p.has("found"), false);
    assert.equal(p.has("v"), false);
    seated++;
    if (f.overrides.landFraction !== undefined) landed++;
  }
  assert.ok(seated >= 150, `seated ${seated}`);
  assert.ok(landed >= 10, `sea levels ${landed}`);
});
