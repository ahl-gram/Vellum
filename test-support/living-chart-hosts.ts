// Hosts and recorders for the living-chart boundary tests (#191, widened at #319 when the
// scrubber became optional and the guards outgrew one file). Extracted so
// test/site/living-chart-boundary.test.ts and test/site/living-chart-no-bar.test.ts share
// one set of host shapes rather than two drifting copies.
//
// Everything here stands in for a HOST or for the environment, never for a module under
// test. The engine itself is imported DYNAMICALLY, inside the functions that need it, so
// that importing this helper cannot smuggle the engine into a test process before the
// #191 no-DOM import guard has had its say.
//
// Lives in test-support/ (not test/) because `node --test` with no path arg collects every
// file under test/, and a bare helper module there would run as a phantom 0-subtest "pass".
import type { LivingChart } from "../src/site/living-chart/index.ts";
import type { PlaceManifest } from "../src/render/place-manifest.ts";
import type { Survey } from "../src/render/survey.ts";
import type { El } from "./element-shim.ts";

/**
 * The engine's whole public surface: the arm / step / paint / reset / teardown entries plus
 * the e2e read hooks, capability-complete for the Explorer today and for the Reading Room's
 * subs (#192 address, #219 frame, #220 fused instrument, #221 page).
 *
 * #319 pins this list for BOTH host shapes: a bar-less host gets the SAME names, not a
 * second surface, and the optional bar earns no new method. The instrument-less
 * arm-at-rest entry a static host calls is `rearmVoyage`, which has been here since #191.
 * The length is asserted from the array, never quoted from a comment.
 */
export const API = [
  // #53 story cards
  "buildPlaceOverlay", "onDocKeydown", "onDocClick",
  // #220 the fused ages instrument
  "applyAges", "rearmAges", "exitAges", "clearAges",
  "agesSnapToRest", "agesState", "agesDragStart", "agesDragEnd",
  // #54 chronicle scrubber (chart side; the instrument names delegate to ages)
  "applyScrub", "exitScrub", "clearScrub", "cancelScrubRaf",
  "pauseScrub", "togglePlay", "onManualScrub", "scrubTo",
  "scrubSnapToPresent", "scrubState",
  // the Wayfarer's voyage
  "applyVoyage", "rearmVoyage", "exitVoyage", "clearVoyage", "cancelVoyageRaf",
  "voyageSnapToRest", "voyageStepTo", "voyagePaintAt",
  "voyagePlan", "voyageLog", "voyageLegGeometry", "syncRestingTrack",
  // lifecycle for an unmounting host
  "destroy",
] as const;

/** A plain empty element: construction may only STORE refs, so this is enough for it. */
export const bareEl = (): HTMLElement => ({}) as unknown as HTMLElement;

/**
 * A chart mount holding NOTHING, for tests that CALL into the engine rather than only
 * constructing it. Deliberately not a selector engine: every query answers "the mount is
 * empty", which is exactly true of a host that has never drawn, so no assertion can rest on
 * a hand-rolled matcher being right. It records what was ASKED, which is how a teardown
 * that silently skips a chart-side step becomes visible (a pure no-op exitAges asks
 * nothing).
 */
export function emptyMount(): { el: HTMLElement; asked: string[] } {
  const asked: string[] = [];
  const mount = {
    querySelector: (sel: string) => {
      asked.push(sel);
      return null;
    },
    querySelectorAll: (sel: string) => {
      asked.push(sel);
      return [] as unknown[];
    },
  };
  return { el: mount as unknown as HTMLElement, asked };
}

/**
 * A chart mount that ALREADY HOLDS two voyage overlays, for the #364 builder invariant.
 *
 * It answers `querySelectorAll` with a FIXED pair of stubs and records every call in one
 * ordered ledger, so a consuming test can read what the builder did to the mount and in
 * what order: `ask:<selector>`, one `remove:` per stale node it took off, and `append:` for
 * the overlay it added. Deliberately NOT a selector engine and NOT a widening of
 * element-shim.ts: nothing here matches a selector, it returns what it was built holding
 * and writes down what it was asked. The shim's blindness is what stops an assertion
 * resting on a hand-rolled matcher, and returning fixed stubs rests on none.
 *
 * What it makes provable, none of which a real-browser e2e with a single stale overlay can
 * see: that BOTH held nodes come off (a singular query would take one), that the wipe runs
 * BEFORE the append and not after (the order in the ledger), that the query goes to the
 * MOUNT and not to `document` (an empty ledger means it went somewhere else), and that a
 * build which bails early touches the mount not at all.
 */
export function stackedMount(): { el: HTMLElement; ledger: string[] } {
  const ledger: string[] = [];
  const held = ["first", "second"].map((name) => ({
    remove: () => ledger.push(`remove:${name}`),
  }));
  const mount = {
    querySelectorAll: (sel: string) => {
      ledger.push(`ask:${sel}`);
      return held;
    },
    // The SINGULAR form answers too, with the first node held, because the mutation this
    // double exists to catch is a builder that reaches for `querySelector` and takes one.
    // A mount that simply lacked the method would red that mutation with a TypeError, which
    // proves the double incomplete rather than the behaviour wrong.
    querySelector: (sel: string) => {
      ledger.push(`ask1:${sel}`);
      return held[0]!;
    },
    appendChild: (kid: { getAttribute(name: string): string | null }) => {
      ledger.push(`append:${kid.getAttribute("class")}`);
      return kid;
    },
  };
  return { el: mount as unknown as HTMLElement, ledger };
}

/** The host's optional verso surface (#174), recording so a paint or clear is provable. */
export function recordingSink(): {
  sink: { paint(p: string, v: string): void; clear(): void };
  calls: string[];
} {
  const calls: string[] = [];
  return {
    calls,
    sink: {
      paint: (p: string, v: string) => calls.push(`paint:${p}|${v}`),
      clear: () => calls.push("clear"),
    },
  };
}

/**
 * A recording stand-in for one of the ages driver's two chamber painters. Every property
 * answers as a function that logs its own name, so a test can assert the EXACT set of
 * delegations a driver member makes, including the empty set. These are the driver's
 * injected collaborators, never the module under test.
 */
export function recordingChamber(): { calls: string[]; as<T>(): T } {
  const calls: string[] = [];
  const proxy = new Proxy({}, { get: (_t, prop: string) => () => calls.push(prop) });
  return { calls, as: <T,>() => proxy as T };
}

/**
 * A scrubber whose elements record what was written to them. Enough to tell the REAL
 * instrument and journal apart from the #319 stand-ins with no DOM at all: only the real
 * createAges clears the bar's aria-valuetext on exit, and only the real log panel empties
 * the journal strip and the signature line.
 */
export function recordingBar(): { bar: Record<string, unknown>; writes: string[] } {
  const writes: string[] = [];
  const node = (name: string) => ({
    hidden: undefined as boolean | undefined,
    textContent: undefined as string | undefined,
    min: "",
    max: "",
    step: "",
    replaceChildren: () => writes.push(`${name}.replaceChildren`),
    removeAttribute: (attr: string) => writes.push(`${name}.removeAttribute:${attr}`),
    setAttribute: (attr: string) => writes.push(`${name}.setAttribute:${attr}`),
    appendChild: () => writes.push(`${name}.appendChild`),
  });
  return {
    writes,
    bar: {
      panel: node("panel"),
      playBtn: node("playBtn"),
      range: node("range"),
      year: node("year"),
      sig: node("sig"),
      strip: node("strip"),
    },
  };
}

// #319 acceptance 1 needs the chart side to RUN, not merely construct, so it needs an
// environment and a world. The fixture is a REAL world, the house pattern from
// test/render/voyage-travel.test.ts: a synthetic grid would route zero legs, paintFrame
// would take its legCount <= 0 branch, and the "painted" track would be the origin point,
// which is a pass proving nothing. Seed 42 is the golden world, so the numbers a consuming
// test asserts are reproducible. The ~1.5s generation is paid once, lazily, and the world
// object is never mutated.
let world42: { manifest: PlaceManifest; survey: Survey } | null = null;

/** The seed-42 manifest + survey, with the element shim installed. Memoized. */
export async function realWorld(): Promise<{ manifest: PlaceManifest; survey: Survey }> {
  if (world42) return world42;
  const [{ installShim }, { defaultRecipe, generateWorld }, { buildPlaceManifest }, { buildSurvey }] =
    await Promise.all([
      import("./element-shim.ts"),
      import("../src/world/generate.ts"),
      import("../src/render/place-manifest.ts"),
      import("../src/render/survey.ts"),
    ]);
  installShim();
  const world = generateWorld(defaultRecipe(42));
  world42 = {
    manifest: buildPlaceManifest(world, 1500),
    survey: buildSurvey(world.elev, world.seaLevel, world.roads),
  };
  return world42;
}

/** A bar-less host over a shim mount, with a recording verso sink. */
export async function barlessHost(): Promise<{ lc: LivingChart; mount: El; calls: string[] }> {
  const [{ El }, { createLivingChart }] = await Promise.all([
    import("./element-shim.ts"),
    import("../src/site/living-chart/index.ts"),
  ]);
  await realWorld(); // installs the shim before any element is built
  const mount = new El("div");
  const { sink, calls } = recordingSink();
  const lc = createLivingChart({
    mapEl: mount as unknown as HTMLElement,
    statusEl: new El("p") as unknown as HTMLElement,
    restingTrackSink: sink,
  });
  return { lc, mount, calls };
}
