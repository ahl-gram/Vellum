// Shared hosts and recorders for the living-chart boundary suites; lives outside test/ so node --test does not collect it.
// The engine is imported DYNAMICALLY inside the functions that need it, so importing this helper cannot smuggle the engine past the #191 no-DOM import guard.
import type { LivingChart } from "../src/site/living-chart/index.ts";
import type { PlaceManifest } from "../src/render/place-manifest.ts";
import type { Survey } from "../src/render/survey.ts";
import type { El } from "./element-shim.ts";

/** The engine's whole public surface; #319 pins the SAME list for both host shapes, and the length is asserted from the array, never quoted from a comment. */
export const API = [
  "buildPlaceOverlay", "onDocKeydown", "onDocClick",
  "applyAges", "rearmAges", "exitAges", "clearAges",
  "agesSnapToRest", "agesState", "agesDragStart", "agesDragEnd",
  "applyScrub", "exitScrub", "clearScrub", "cancelScrubRaf",
  "pauseScrub", "togglePlay", "onManualScrub", "scrubTo",
  "scrubSnapToPresent", "scrubState",
  "applyVoyage", "rearmVoyage", "exitVoyage", "clearVoyage", "cancelVoyageRaf",
  "voyageSnapToRest", "voyageStepTo", "voyagePaintAt",
  "voyagePlan", "voyageLog", "voyageLegGeometry", "syncRestingTrack",
  "destroy",
] as const;

/** A plain empty element: construction may only STORE refs, so this is enough for it. */
export const bareEl = (): HTMLElement => ({}) as unknown as HTMLElement;

/** An empty chart mount that records what was ASKED; deliberately not a selector engine. */
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

/** A mount pre-holding two voyage overlay stubs (#364), recording an ordered ask/remove/append ledger; deliberately not a selector engine. */
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
    // Answers the SINGULAR form too: a mount that lacked the method would red the querySelector mutation with a TypeError, proving the double incomplete rather than the behaviour wrong.
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

/** Recording stand-in for an ages chamber painter: every property logs its own name, so the EXACT delegation set is assertable. */
export function recordingChamber(): { calls: string[]; as<T>(): T } {
  const calls: string[] = [];
  const proxy = new Proxy({}, { get: (_t, prop: string) => () => calls.push(prop) });
  return { calls, as: <T,>() => proxy as T };
}

/** A scrubber whose elements record writes: enough to tell the REAL instrument and journal from the #319 no-DOM stand-ins. */
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

// A REAL seed-42 world: a synthetic grid would route zero legs and pass proving nothing; the ~1.5s generation is paid once, lazily, and the world is never mutated.
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
