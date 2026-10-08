import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { engravedProspectPlate, prospectPlate } from "../../src/prospect/finished.ts";
import { createRng } from "../../src/core/rng.ts";
import { createLoreWriter } from "../../src/society/lore.ts";
import { roadMask, roadReachable } from "../../src/itinerary/route.ts";
import { STYLES, type StyleName } from "../../src/render/style.ts";
import type { World } from "../../src/world/types.ts";
import { plateDressFor } from "../../src/prospect/dress/context.ts";
import { resolveProspectIndex, prospectResultFor } from "../../src/site/explorer/prospect-job.ts";
import {
  runInline,
  runJob,
  type AtlasJob,
  type DrawJob,
  type ProspectJob,
  type RenderJob,
} from "../../src/site/explorer/worker-client.ts";

const world = generateWorld(defaultRecipe(42));
const capital = world.settlements.findIndex((s) => s.kind === "capital");

test("plateDressFor maps every chart style to a ratified plate dress: ink to ink, every other style to antique (#237 fallback rule)", () => {
  const styles = Object.keys(STYLES) as StyleName[];
  assert.ok(styles.length >= 4, "the style roster is the domain being swept");
  for (const name of styles) {
    assert.equal(
      plateDressFor(name),
      name === "ink" ? "ink" : "antique",
      `a ${name} chart opens a ${name === "ink" ? "ink" : "antique"} plate`,
    );
  }
});

test("resolveProspectIndex passes a valid index through and falls back to the capital otherwise", () => {
  assert.ok(capital >= 0, "seed 42 has a capital");
  assert.equal(resolveProspectIndex(world, 1), 1, "a valid non-capital index is honored");
  assert.equal(resolveProspectIndex(world, null), capital, "no index means the capital");
  assert.equal(resolveProspectIndex(world, world.settlements.length), capital, "past-the-end falls back");
  assert.equal(resolveProspectIndex(world, -1), capital, "negative falls back");
  // Every generated world seats its capital at index 0 (measured, seeds 1-30), so only a reordered synthetic fixture can tell the kind lookup from a bare return 0.
  const shuffled = { ...world, settlements: [world.settlements[1]!, world.settlements[0]!] } as World;
  assert.equal(resolveProspectIndex(shuffled, null), 1, "the capital is found by kind, not by sitting at index 0");
});

test("prospectResultFor renders through prospectPlate byte-for-byte and defaults the year to the present", () => {
  const res = prospectResultFor(world, { index: 1, dress: "ink", year: null });
  assert.equal(res.svg, prospectPlate(world, 1, STYLES.ink, world.title.year));
  assert.equal(res.year, world.title.year, "a null year is the present year");
  assert.equal(res.presentYear, world.title.year);
  assert.equal(res.name, world.settlements[1]!.name);
  assert.equal(res.index, 1);
  assert.equal(res.title, world.title.title);
});

test("prospectResultFor honors an explicit viewing year (the year is a pure era filter, #241)", () => {
  const res = prospectResultFor(world, { index: 1, dress: "antique", year: 300 });
  assert.equal(res.svg, prospectPlate(world, 1, STYLES.antique, 300));
  assert.equal(res.year, 300);
});

test("prospectResultFor with no index opens the capital's plate", () => {
  const res = prospectResultFor(world, { index: null, dress: "antique", year: null });
  assert.equal(res.index, capital);
  assert.equal(res.name, world.settlements[capital]!.name);
  assert.equal(res.svg, prospectPlate(world, capital, STYLES.antique, world.title.year));
});

test("prospectResultFor carries the former name through to the page (#49)", () => {
  const i = world.settlements.findIndex((s) => s.formerName !== undefined);
  assert.equal(
    prospectResultFor(world, { index: i, dress: "antique", year: null }).formerName,
    world.settlements[i]!.formerName,
  );
  const j = world.settlements.findIndex((s) => s.formerName === undefined && !s.ruined);
  const plain = prospectResultFor(world, { index: j, dress: "antique", year: null });
  assert.equal(plain.formerName, undefined);
  assert.ok(!("formerName" in plain), "an absent former name should not leave the key behind");
});

// The note is Today's card's (Issue #494 ruling 4 was made on a preview carrying it), NOT the bound atlas's gazetteer note for the same town, which the same writer only reaches after walking the rows before it.
test("prospectResultFor carries the engraver's note: the era, the epithet, the founding, the lettered key and Today's card's note for the town", () => {
  const res = prospectResultFor(world, { index: 1, dress: "ink", year: null });
  const e = engravedProspectPlate(world, 1, STYLES.ink, world.title.year);
  assert.equal(res.era, e.era);
  assert.equal(res.epithet, e.caption.epithet);
  assert.equal(res.founded, world.settlements[1]!.founded);
  assert.deepEqual(
    res.key,
    e.key.map((k) => ({ letter: k.letter, label: k.label })),
    "the key rows, letter and label only (the plate keeps the coordinates)",
  );
  assert.ok(res.key.length > 0, "premise: the plate has a key to list");
  const todays = (i: number) =>
    createLoreWriter(world, createRng(42).fork("seed-of-the-day")).settlementNote(world.settlements[i]!);
  assert.equal(res.note, todays(1));
  assert.equal(
    prospectResultFor(world, { index: capital, dress: "antique", year: null }).note,
    todays(capital),
    "the capital's note is the line Today's card shows for this seed",
  );
  assert.notEqual(res.note, todays(capital), "premise: the fork is not handing every town one note");
  const early = prospectResultFor(world, { index: 1, dress: "antique", year: 300 });
  assert.equal(early.era, "before-founding");
  const town = new Set([
    "The Keep",
    "The Bridge Gate",
    "The Quay",
    "The Mole",
    "The Jetty",
    "The Weir Mill",
    "The Weir",
  ]);
  assert.equal(early.key[0]?.label, world.names.sea, "the bare ground keys the sea it stands on");
  assert.ok(
    early.key.every((k) => !town.has(k.label) && !k.label.startsWith("The road to ")),
    "and the world alone: no town and no road yet",
  );
});

test("prospectResultFor says whether a road leaves the place: yes for a roaded town, no for seed 42's orphan", () => {
  const mask = roadMask(world);
  const orphan = world.settlements.findIndex((_, i) => roadReachable(world, mask, i).length === 0);
  assert.ok(orphan >= 0, "premise: seed 42 has a settlement no road leaves");
  assert.equal(prospectResultFor(world, { index: 1, dress: "antique", year: null }).roads, true);
  assert.equal(prospectResultFor(world, { index: orphan, dress: "antique", year: null }).roads, false);
  assert.equal(
    prospectResultFor(world, { index: capital, dress: "antique", year: null }).roads,
    true,
    "the capital is the road network's root",
  );
});

type Answer = { readonly id?: number; readonly ready?: boolean; readonly ok?: boolean; readonly error?: string };
const answers: Answer[] = [];
const waiting = new Map<number, (a: Answer) => void>();
const scope: {
  onmessage: ((e: { data: RenderJob & { id: number } }) => void) | null;
  postMessage: (m: Answer) => void;
} = {
  onmessage: null,
  postMessage: (m) => {
    answers.push(m);
    if (m.id !== undefined) waiting.get(m.id)?.(m);
  },
};
let booted: Promise<void> | null = null;
const theWorker = (): Promise<void> =>
  (booted ??= (async () => {
    Object.assign(globalThis, { self: scope });
    await import("../../src/site/explorer/worker.ts");
    assert.deepEqual(
      answers[0],
      { ready: true },
      "the worker did not hand-shake through the stand-in for its scope, so every answer read below would be read from nothing",
    );
  })());
let lastId = 0;
const post = (job: RenderJob): { readonly id: number; readonly answered: Promise<Answer> } => {
  const id = ++lastId;
  const answered = new Promise<Answer>((settle) => waiting.set(id, settle));
  scope.onmessage!({ data: { ...job, id } });
  return { id, answered };
};
const PROSPECT: ProspectJob = { kind: "prospect", seed: 42, overrides: {}, index: 1, dress: "ink", year: 300 };
const ATLAS: AtlasJob = { kind: "atlas", seed: 42, overrides: {}, width: 1500, bannerStyle: "ink" };
const DRAW: DrawJob = {
  kind: "draw",
  seed: 42,
  overrides: {},
  render: { style: "antique", widthPx: 1500, legend: true },
};

test("the worker answers in the order it was asked, a plate job waiting on its code included (Issue #801)", async () => {
  await theWorker();
  for (const plate of [PROSPECT, ATLAS]) {
    const first = post(plate);
    const second = post(DRAW);
    const both = await Promise.all([first.answered, second.answered]);
    assert.deepEqual(
      both.map((a) => a.ok),
      [true, true],
      `the ${plate.kind} job or the draw behind it failed: ${both.map((a) => a.error ?? "ok").join(", ")}`,
    );
    assert.deepEqual(
      answers.map((a) => a.id).filter((id) => id === first.id || id === second.id),
      [first.id, second.id],
      `a draw posted behind a ${plate.kind} job was answered first`,
    );
  }
});

const BROKEN = { ...DRAW, render: undefined } as unknown as RenderJob;

test("a job that fails comes back as its own error and leaves the jobs behind it unharmed, from the worker and from the backup copy (Issue #801)", async () => {
  await theWorker();
  const failed = post(BROKEN);
  const next = post(DRAW);
  const good = await next.answered;
  const bad = answers.find((a) => a.id === failed.id);
  assert.ok(bad, "the worker never answered the job that threw, though it answered the one posted behind it");
  assert.equal(bad.ok, false, "the worker answered a job that threw as if it had drawn");
  assert.equal(typeof bad.error, "string", "the worker's failure answer carries no error text");
  assert.equal(good.ok, true, `the job posted behind a failure failed too: ${good.error ?? ""}`);
  await assert.rejects(runJob(BROKEN), "the backup copy resolved a job that threw");
  assert.equal(
    await runJob(DRAW).then(
      (r) => r.ok,
      (err: unknown) => String(err),
    ),
    true,
    "a job run by the backup copy after a failed one failed too",
  );
});

test("the worker and the backup copy answer a plate job alike, byte for byte (Issue #801)", async () => {
  await theWorker();
  for (const plate of [PROSPECT, ATLAS]) {
    const { id, answered } = post(plate);
    assert.deepEqual(
      await answered,
      { id, ...(await runInline(plate)) },
      `the worker's ${plate.kind} answer differs from the backup copy's`,
    );
  }
});
