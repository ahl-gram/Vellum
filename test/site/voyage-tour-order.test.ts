import { test } from "node:test";
import assert from "node:assert/strict";
import { realWorld } from "../../test-support/living-chart-hosts.ts";
import { buildVoyagePlan, reorderPlanByTravel } from "../../src/render/voyage.ts";
import { prepareVoyageRouter } from "../../src/render/voyage-route.ts";
import { tourOrderFor } from "../../src/site/explorer/tour-job.ts";
import { createTourOrder } from "../../src/site/explorer/tour-order.ts";
import type { PlaceManifest } from "../../src/render/place-manifest.ts";
import type { Survey } from "../../src/render/survey.ts";

// #373: the #184 travel matrix is 96.7-98.0% of the ~0.9-1.2s the arm blocks the main thread for (measured across five seeds), and that block lands on the #127 arrival ceremony.
// It moves to the render worker. The engine keeps ONE routing path and asks an injected source for the order; a source with nothing ready leaves every non-Explorer host computing it inline exactly as before.

const SUBTITLE = "as surveyed by Taiki the Wayfarer";
const SEED = 42;

function portsOf(manifest: PlaceManifest): number[] {
  return buildVoyagePlan(manifest.places, manifest.presentYear).ports.map((p) => p.idx);
}

function sitesOf(manifest: PlaceManifest) {
  return manifest.places.map((p) => ({ idx: p.idx, x: p.gx, y: p.gy }));
}

/** A valid tour that is NOT the travel order: same port set, same origin, everything after it reversed. */
function reversedTour(ports: ReadonlyArray<number>): number[] {
  return [ports[0] as number, ...ports.slice(1).reverse()];
}

// Memoized: the matrix this issue exists to move costs ~0.9s a call, and every test below wants the same world's answer.
let travelOrder: number[] | null = null;
function travelOrderOf(manifest: PlaceManifest, survey: Survey): number[] {
  if (!travelOrder) {
    const straight = buildVoyagePlan(manifest.places, manifest.presentYear);
    const router = prepareVoyageRouter(sitesOf(manifest), survey);
    travelOrder = reorderPlanByTravel(straight, router.legLength).ports.map((p) => p.idx);
  }
  return travelOrder;
}

async function builderWith(tourOrder?: {
  get(seed: number, survey: Survey, ports: ReadonlyArray<number>): ReadonlyArray<number> | null;
}) {
  const [{ createSessionBuilder }, { barlessLogPanel }, { El }] = await Promise.all([
    import("../../src/site/living-chart/voyage-session.ts"),
    import("../../src/site/living-chart/no-bar.ts"),
    import("../../test-support/element-shim.ts"),
  ]);
  const { manifest, survey } = await realWorld(); // installs the element shim the overlay svg needs
  const sessions = createSessionBuilder({
    mapEl: new El("div") as unknown as HTMLElement,
    logPanel: barlessLogPanel(),
    ...(tourOrder ? { tourOrder } : {}),
  });
  return { sessions, manifest, survey };
}

test("#373 the builder takes its travel order from the injected source", async () => {
  const { manifest, survey } = await realWorld();
  const wanted = reversedTour(portsOf(manifest));
  assert.notDeepEqual(wanted, travelOrderOf(manifest, survey), "the fixture order really is not what the matrix computes");

  const { sessions } = await builderWith({ get: () => wanted });
  const session = sessions.build(manifest, survey, SEED, SUBTITLE);

  assert.ok(session, "the fixture world routes a survey");
  assert.deepEqual(session.plan.ports.map((p) => p.idx), wanted, "the source's order is the one the session sails");
});

test("#373 the source is asked with THIS build's seed, survey and straight-line port set", async () => {
  const { manifest, survey } = await realWorld();
  const asked: Array<{ seed: number; survey: Survey; ports: ReadonlyArray<number> }> = [];

  const { sessions } = await builderWith({
    get: (seed, s, ports) => {
      asked.push({ seed, survey: s, ports });
      return null;
    },
  });
  sessions.build(manifest, survey, SEED, SUBTITLE);

  assert.equal(asked.length, 1, "asked exactly once");
  assert.equal(asked[0]!.seed, SEED, "the seed the build was given");
  assert.equal(asked[0]!.survey, survey, "the survey the build was given, by identity");
  // The host derives the same port set independently (it holds the manifest, not the plan); a drift here is what makes every get() miss and silently restores the block.
  assert.deepEqual([...asked[0]!.ports], portsOf(manifest), "the straight-line port set, before any reorder");
});

test("#373 a source with nothing ready leaves the inline computation exactly as it was", async () => {
  const { manifest, survey } = await realWorld();
  const { sessions } = await builderWith({ get: () => null });

  const session = sessions.build(manifest, survey, SEED, SUBTITLE);

  assert.ok(session);
  assert.deepEqual(
    session.plan.ports.map((p) => p.idx),
    travelOrderOf(manifest, survey),
    "a host with no worker (and every host with no source at all) still sails the travel order",
  );
});

test("#373 a quiet build with nothing ready still takes the straight-line tour", async () => {
  const { manifest, survey } = await realWorld();
  const { sessions } = await builderWith({ get: () => null });

  const session = sessions.build(manifest, survey, SEED, SUBTITLE, true);

  assert.ok(session);
  assert.deepEqual(
    session.plan.ports.map((p) => p.idx),
    portsOf(manifest),
    "a mid-drag frame never pays the matrix, source or no source",
  );
});

test("#373 a quiet build DOES take a ready order: a drag release inherits the cached tour", async () => {
  const { manifest, survey } = await realWorld();
  const wanted = reversedTour(portsOf(manifest));
  const { sessions } = await builderWith({ get: () => wanted });

  const session = sessions.build(manifest, survey, SEED, SUBTITLE, true);

  assert.ok(session);
  assert.deepEqual(session.plan.ports.map((p) => p.idx), wanted, "quiet skips the COMPUTE, not the answer");
});

test("#373 the off-thread job returns the order the inline computation would have", async () => {
  const { manifest, survey } = await realWorld();

  const order = tourOrderFor({ sites: sitesOf(manifest), survey, ports: portsOf(manifest) });

  // The Explorer would otherwise sail a different itinerary from the Reading Room and from every unit suite, for the same world.
  assert.deepEqual([...order], travelOrderOf(manifest, survey), "one tour, whichever thread computed it");
});

test("#373 the job leaves a two-port tour alone, as reorderPlanByTravel does", async () => {
  const { manifest, survey } = await realWorld();
  const ports = portsOf(manifest).slice(0, 2);

  assert.deepEqual([...tourOrderFor({ sites: sitesOf(manifest), survey, ports })], ports);
});

/** A tour-order module over a fake transport: `answer` decides what the "worker" returns for a job. */
function tourHarness(answer: (ports: ReadonlyArray<number>) => ReadonlyArray<number> | Error) {
  const jobs: Array<{ seed: number; ports: ReadonlyArray<number> }> = [];
  let release: (() => void) | null = null;
  const orders = createTourOrder({
    runJob: (job) => {
      jobs.push({ seed: job.seed, ports: job.ports });
      const out = answer(job.ports);
      const settle = out instanceof Error ? Promise.reject(out) : Promise.resolve({ ok: true as const, order: out });
      return new Promise((resolve, reject) => {
        release = () => settle.then(resolve, reject);
      });
    },
  });
  return { orders, jobs, release: () => { const r = release; release = null; if (r) r(); } };
}

test("#373 a primed order reaches the builder: the host and the engine agree on the key", async () => {
  const { manifest, survey } = await realWorld();
  const wanted = reversedTour(portsOf(manifest));
  const h = tourHarness(() => wanted);

  const primed = h.orders.prime(manifest, survey, SEED);
  h.release();
  await primed;

  const { sessions } = await builderWith(h.orders);
  const session = sessions.build(manifest, survey, SEED, SUBTITLE);

  assert.ok(session);
  // Deliberately NOT the travel order: were the host's key to disagree with the engine's inputs, get() would miss and the builder would compute the REAL order, which no assertion against the real order could tell from a hit.
  assert.deepEqual(session.plan.ports.map((p) => p.idx), wanted, "the primed order, not one the engine computed");
});

test("#373 nothing is cached until the job lands", async () => {
  const { manifest, survey } = await realWorld();
  const h = tourHarness(() => reversedTour(portsOf(manifest)));

  const primed = h.orders.prime(manifest, survey, SEED);
  assert.equal(h.orders.get(SEED, survey, portsOf(manifest)), null, "an in-flight order is not an answer");
  h.release();
  await primed;
  assert.ok(h.orders.get(SEED, survey, portsOf(manifest)), "and is one once it lands");
});

test("#373 two primes for one world share a single job", async () => {
  const { manifest, survey } = await realWorld();
  const h = tourHarness(() => reversedTour(portsOf(manifest)));

  const a = h.orders.prime(manifest, survey, SEED);
  const b = h.orders.prime(manifest, survey, SEED);
  h.release();
  await Promise.all([a, b]);

  // A sea-level drag fires a prime per release; one job per frame would starve the single worker queue the Glass redrafts through.
  assert.equal(h.jobs.length, 1, "the second prime joins the first");
});

test("#373 a primed order is not re-fetched", async () => {
  const { manifest, survey } = await realWorld();
  const h = tourHarness(() => reversedTour(portsOf(manifest)));

  const first = h.orders.prime(manifest, survey, SEED);
  h.release();
  await first;
  await h.orders.prime(manifest, survey, SEED);

  assert.equal(h.jobs.length, 1, "a cached world is answered without the worker");
});

test("#373 a different world is a different job", async () => {
  const { manifest, survey } = await realWorld();
  const h = tourHarness(() => reversedTour(portsOf(manifest)));

  const a = h.orders.prime(manifest, survey, SEED);
  h.release();
  await a;
  const b = h.orders.prime(manifest, survey, SEED + 1);
  h.release();
  await b;

  assert.equal(h.jobs.length, 2, "the seed is part of what is being asked");
  assert.ok(h.orders.get(SEED + 1, survey, portsOf(manifest)), "the newest world is the one held");
  assert.equal(h.orders.get(SEED, survey, portsOf(manifest)), null, "single-entry, like the worker's own world cache");
});

test("#373 a tour job that fails leaves the engine to compute the order inline", async () => {
  const { manifest, survey } = await realWorld();
  const h = tourHarness(() => new Error("the render worker crashed"));

  const primed = h.orders.prime(manifest, survey, SEED);
  h.release();
  await primed; // the arm must proceed, not hang, on a dead worker

  assert.equal(h.orders.get(SEED, survey, portsOf(manifest)), null, "no order to hand over");
  const { sessions } = await builderWith(h.orders);
  const session = sessions.build(manifest, survey, SEED, SUBTITLE);
  assert.ok(session);
  assert.deepEqual(
    session.plan.ports.map((p) => p.idx),
    travelOrderOf(manifest, survey),
    "the survey still sails the travel order, on the main thread, as it did before #373",
  );
});

test("#373 a one-port world asks the worker for nothing", async () => {
  const { survey } = await realWorld();
  const h = tourHarness(() => []);

  await h.orders.prime(null, survey, SEED);

  assert.equal(h.jobs.length, 0, "no manifest, no tour");
});
