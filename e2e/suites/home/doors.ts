import type { Payload, SuiteContext } from "../../types.ts";
import { withHeldBundle } from "../../site-server.ts";
import { withScriptsOff } from "../../support/scripts-off.ts";
import { makeSettle } from "../../support/settle.ts";
import { withBlockedUrls } from "../../support/network-state.ts";
import type { makeStep } from "../../support/step.ts";
import { doorShown } from "./reads.ts";

type Doors = Awaited<ReturnType<typeof h13cDoorsRead>>;
type NoJs = Awaited<ReturnType<typeof h13fNoScriptRead>>;

export async function h13aPrePaint({ evaluate, send, check, sleep, PORT }: SuiteContext): Promise<void> {
  await evaluate(`sessionStorage.clear()`);
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let preModule = null;
  for (let i = 0; i < 100; i++) {
    try {
      preModule = await evaluate<{
        veil: boolean;
        adopted: boolean;
        seedForm: boolean;
        doorsYet: boolean;
      } | null>(`(() => {
        const v = document.getElementById("lf-veil");
        if (!v) return null;
        return { veil: true, adopted: v.dataset.adopted !== undefined, seedForm: !!document.getElementById("seed-form"),
          doorsYet: getComputedStyle(document.getElementById("lf-card-explorer")).visibility === "visible" };
      })()`);
      if (preModule !== null && preModule.seedForm) break;
    } catch {}
    await sleep(60);
  }
  check(
    "H13a with the bundle unreachable the pre-paint veil still stands, unadopted, over an intact page, the doors not yet shown",
    preModule !== null && preModule.seedForm && !preModule.adopted && preModule.doorsYet === false,
    JSON.stringify(preModule),
  );
}

export async function h13bRelease({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  let released = null;
  for (let i = 0; i < 200; i++) {
    try {
      released = await evaluate<{ veil: boolean; seedForm: boolean }>(
        `({ veil: !!document.getElementById("lf-veil"), seedForm: !!document.getElementById("seed-form") })`,
      );
    } catch {}
    if (released !== null && !released.veil) break;
    await sleep(100);
  }
  check(
    "H13b the safety release lifts an unadopted veil: a failed bundle never traps the page",
    released !== null && !released.veil && released.seedForm,
    JSON.stringify(released),
  );
}

export async function h13cDoorsRead({ evaluate, sleep }: SuiteContext) {
  let doors = null;
  for (let i = 0; i < 80; i++) {
    try {
      doors = await evaluate<{
        shown: boolean[];
        hrefs: (string | null)[];
        closesHidden: boolean;
        howHidden: boolean;
        scrollW: number;
        innerWidth: number;
      } | null>(`(() => {
        const ids = ["explorer", "reading-room", "atlas", "gallery"];
        const cards = ids.map((id) => document.getElementById("lf-card-" + id));
        if (cards.some((c) => c === null)) return null;
        const shown = cards.map((c) => {
          const cs = getComputedStyle(c);
          const r = c.getBoundingClientRect();
          return cs.visibility === "visible" && cs.position === "static" && r.height > 40;
        });
        const hrefs = cards.map((c) => c.querySelector(".lf-card-enter")?.getAttribute("href") ?? null);
        const how = document.getElementById("lf-card-how");
        return { shown, hrefs,
          closesHidden: cards.every((c) => getComputedStyle(c.querySelector(".lf-card-close")).display === "none"),
          howHidden: how !== null && how.offsetParent === null,
          scrollW: document.documentElement.scrollWidth, innerWidth: window.innerWidth };
      })()`);
      if (doors !== null && doors.shown.every(Boolean)) break;
    } catch {}
    await sleep(150);
  }
  return doors;
}

export async function h13DeadBundle(ctx: SuiteContext, step: ReturnType<typeof makeStep>): Promise<Doors> {
  return withBlockedUrls(ctx.send, ["*app.bundle.js*"], async () => {
    await h13aPrePaint(ctx);
    const doorBase = await h13gDoorBase(ctx);
    await h13bRelease(ctx);
    // The doors share the veil's 10s window (Issue #470, ratified 2026-08-24), so after H13b's release they are due at once; the poll absorbs animation-fill timing, and the bundle stays blocked until the doors are read.
    const doors = await h13cDoorsRead(ctx);
    await step("H13g", () => h13gDoorFrame(ctx, doorBase));
    return doors;
  });
}

export async function h13cStaticDoors({ check, shoot }: SuiteContext, doors: Doors): Promise<void> {
  check(
    "H13c a dead bundle reveals the four slips as plain static doors: each visible in flow with its room's own door, the dead close controls hidden, the how panel and the sideways scroll unmoved",
    doors !== null &&
      doors.shown.every(Boolean) &&
      JSON.stringify(doors.hrefs) === JSON.stringify(["explorer/", "reading-room/", "atlas/", "gallery/"]) &&
      doors.closesHidden &&
      doors.howHidden &&
      doors.scrollW === doors.innerWidth,
    JSON.stringify(doors),
  );
  await shoot("home-failed-bundle-doors.png");
}

const REVEAL_MS = 10_000;
const REVEAL_STATEMENT = ["lf-doors-reveal", "0s", "10s", "forwards"] as const;
const PAST_REVEAL_MS = 2 * REVEAL_MS;
const FAST = 10;
type PageClock = { t: number; start: number | null };
const PAGE_CLOCK: Payload<PageClock> = `(() => { const a = document.getElementById("lf-card-explorer")?.getAnimations()[0]; return { t: Number(document.timeline.currentTime), start: a && a.startTime !== null ? Number(a.startTime) : null }; })()`;

async function pastTheReveal(
  { evaluate, send, sleep }: Pick<SuiteContext, "evaluate" | "send" | "sleep">,
  label: string,
): Promise<PageClock> {
  await send("Animation.enable");
  try {
    // The rate is the document's own: sent before a navigation it reads 1 on the new page (measured 2026-10-29, handbook/plans/1000/1068/1068-plan.md), so it is sent after.
    await send("Animation.setPlaybackRate", { playbackRate: FAST });
    return await makeSettle({ evaluate, sleep, tolerant: true })(PAGE_CLOCK, (d) => d.t >= PAST_REVEAL_MS, label);
  } finally {
    await send("Animation.setPlaybackRate", { playbackRate: 1 });
    await send("Animation.disable");
  }
}

export async function h13dPrmDoors({ evaluate, send, check, sleep, PORT }: SuiteContext): Promise<void> {
  await send("Network.setBlockedURLs", { urls: ["*app.bundle.js*"] });
  try {
    await evaluate(`sessionStorage.clear()`);
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
    const clock = await pastTheReveal({ evaluate, send, sleep }, "h13d-past-the-reveal");
    const prmDoors = await evaluate(doorShown);
    check(
      "H13d reduced motion keeps its doors on a dead bundle: the reveal is a timer, not motion the prm blanket may still",
      prmDoors === true,
      JSON.stringify({ prmDoors, ...clock }),
    );
  } finally {
    await send("Network.setBlockedURLs", { urls: [] });
  }
}

// 2026-11-01, Issue #1172: the planner's probe held 21 to 27 samples in the 2s window and read .cam 84 to 167 ms after the release, 7.8s inside the 10s reveal; HELD_TRIES is three times the samples it used and CAM_TRIES twenty times.
const HELD_MS = 2000;
const HELD_TRIES = 80;
const CAM_TRIES = 40;
const SAMPLE_MS = 75;
const AFTER_CAM = 4;
type NoFlash = { t: number; old: boolean; ready: boolean; door: boolean; cam: boolean; reveal: string[] | null };
const NO_FLASH: Payload<NoFlash> = `({ t: performance.now(), old: window.__h13d === 1, ready: !!document.getElementById("seed-form"), door: ${doorShown}, cam: !!document.querySelector("#lf-stage.cam"), reveal: (() => { const c = document.getElementById("lf-card-explorer"); if (!c) return null; const s = getComputedStyle(c); return [s.animationName, s.animationDuration, s.animationDelay, s.animationFillMode]; })() })`;

export async function h13ePrmNoFlash(ctx: SuiteContext): Promise<void> {
  const { evaluate, send, check, PORT } = ctx;
  // Mark the H13d page before leaving: without the marker the first samples race the navigation and read the OLD page's legitimately visible doors as a flash.
  await evaluate(`window.__h13d = 1`);
  // Hold home's bundle on the server so the pre-.cam window is 2s of the page's clock on any runner: unthrottled the module boots within a frame and a 75ms sampler proves nothing (skeptic round 3), and a network throttle's window was every byte the page fetches over its rate, which ran the sampler out (Issue #1172).
  const { held, after } = await withHeldBundle(async (release) => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
    const heldSamples = await heldWindow(ctx);
    release();
    return { held: heldSamples, after: await afterRelease(ctx) };
  });
  const cam = after.find((s) => s.cam);
  const prmFlash = [...held, ...after].some((s) => s.door);
  const heldNoCam = held.every((s) => !s.cam);
  const reveal = [...new Set(held.map((s) => (s.reveal ?? ["none"]).join(" ")))];
  check(
    "H13e and never shows them on a healthy load whose bundle comes late: while the server holds home's bundle for 2s of the page's clock no prm sample sees .cam or a door, each reads the reveal still the 10s timer, and no sample sees a door once the released bundle boots (Issue #1172)",
    cam !== undefined && !prmFlash && heldNoCam && reveal.length === 1 && reveal[0] === REVEAL_STATEMENT.join(" "),
    JSON.stringify({
      prmCam: cam !== undefined,
      prmFlash,
      held: held.length,
      heldNoCam,
      reveal,
      releasedAt: Math.round(held[held.length - 1]!.t),
      camAt: cam === undefined ? null : Math.round(cam.t),
    }),
  );
}

async function heldWindow({ evaluate, sleep }: Pick<SuiteContext, "evaluate" | "sleep">): Promise<NoFlash[]> {
  const first = await makeSettle({ evaluate, sleep, tolerant: true })(
    NO_FLASH,
    (d) => !d.old && d.ready,
    "h13e-fresh-page",
  );
  const held = [first];
  for (let i = 1; i < HELD_TRIES && held[held.length - 1]!.t < HELD_MS; i++) {
    await sleep(SAMPLE_MS, "window: the pre-.cam window the held bundle keeps open, read for a door");
    held.push(await evaluate(NO_FLASH));
  }
  if (held[held.length - 1]!.t < HELD_MS)
    throw new Error(
      `h13e-held-window never reached ${HELD_MS} ms of the page's clock: ${JSON.stringify(held[held.length - 1])}`,
    );
  return held;
}

async function afterRelease({ evaluate, sleep }: Pick<SuiteContext, "evaluate" | "sleep">): Promise<NoFlash[]> {
  const after: NoFlash[] = [];
  for (let i = 0; i < CAM_TRIES && !after.some((s) => s.cam); i++) {
    await sleep(SAMPLE_MS, "pace: the released bundle's boot, read for a door until .cam");
    after.push(await evaluate(NO_FLASH));
  }
  if (!after.some((s) => s.cam))
    throw new Error(`h13e-released-boot never saw .cam: ${JSON.stringify(after[after.length - 1] ?? null)}`);
  for (let i = 0; i < AFTER_CAM; i++) {
    await sleep(SAMPLE_MS, "window: four samples after .cam, read for a door");
    after.push(await evaluate(NO_FLASH));
  }
  return after;
}

export async function h13fNoScriptRead(ctx: SuiteContext) {
  const { evaluate, send, sleep, PORT } = ctx;
  // The round-2 blocker's live proof: script execution OFF plus reduced motion is the one visitor class where the noscript stand-down must out-cascade the prm exemption (both !important, specificity tied, document order decides).
  return withScriptsOff(send, async () => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
    const clock = await pastTheReveal({ evaluate, send, sleep }, "h13f-past-the-reveal");
    const nojs = await evaluate<{ navShown: boolean; howShown: boolean; door: boolean } | null>(`(() => {
      const nav = document.querySelector(".lf-noscript-rooms");
      const how = document.getElementById("lf-card-how");
      if (nav === null || how === null) return null;
      return { navShown: nav.offsetParent !== null, howShown: how.offsetParent !== null && getComputedStyle(how).visibility === "visible", door: ${doorShown} };
    })()`);
    return { nojs, shelf: await shelfWithoutScripts(ctx), clock };
  });
}

type Shelf = { shelf: string; figures: boolean[]; scrolled: number } | null;

const SHELF_SHOWN: Payload<Omit<NonNullable<Shelf>, "scrolled"> | null> =
  `(() => { const s = document.querySelector(".lf-shelf"); if (!s) return null;
  return { shelf: getComputedStyle(s).display, figures: [...s.querySelectorAll("figure")].map((f) => f.offsetParent !== null && f.getBoundingClientRect().height > 0 && getComputedStyle(f).visibility === "visible") }; })()`;

// A real wheel with no script on the page to answer it: whatever moves is the page's own scroll.
async function shelfWithoutScripts({ evaluate, send, sleep }: SuiteContext): Promise<Shelf> {
  const shown = await evaluate(SHELF_SHOWN).catch(() => null);
  const at = await evaluate<{ x: number; y: number }>(
    `({ x: Math.round(innerWidth / 2), y: Math.round(innerHeight / 2) })`,
  );
  await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: at.x, y: at.y, deltaX: 0, deltaY: 300 });
  let scrolled = 0;
  for (let i = 0; i < 20 && scrolled === 0; i++) {
    await sleep(100);
    scrolled = await evaluate<number>(`scrollY`);
  }
  await evaluate(`scrollTo(0, 0)`);
  return shown && { ...shown, scrolled };
}

export function h13hShelf({ check }: SuiteContext, shelf: Shelf): void {
  check(
    "H13h with scripts off home still scrolls to its shelf, which stands in flow with its three plates laid out and visible: nothing on it waits for the bundle, and nothing the scripts-off sheet adds locks the page (#472)",
    !!shelf &&
      shelf.shelf !== "none" &&
      shelf.figures.length === 3 &&
      shelf.figures.every(Boolean) &&
      shelf.scrolled > 0,
    JSON.stringify(shelf),
  );
}

type Door = {
  at: number;
  d: string;
  p: string;
  v: string;
  mh: string;
  pad: string;
  bw: string;
  ow: string;
  mt: string;
  an: string[];
};

const DOOR: Payload<Door | null> = `(() => { const c = document.getElementById("lf-card-explorer"); if (!c) return null; const s = getComputedStyle(c);
  return { at: performance.now(), d: s.display, p: s.position, v: s.visibility, mh: s.maxHeight, pad: s.padding, bw: s.borderTopWidth, ow: s.outlineWidth, mt: s.marginTop,
    an: [s.animationName, s.animationDuration, s.animationDelay, s.animationFillMode] }; })()`;

export async function h13gDoorBase({ evaluate }: SuiteContext): Promise<Door | null> {
  return evaluate(DOOR).catch(() => null);
}

export async function h13gDoorFrame({ evaluate, check }: SuiteContext, base: Door | null): Promise<void> {
  const frame = await evaluate(DOOR);
  check(
    "H13g a dead bundle's door waits laid out but zeroed, hidden in flow with no height, padding, border, outline or margin, on a statement pinned whole (the reveal at 0s, after 10s, held forwards), then stands at the full frame: visible, its height capped at 100rem, 2rem above, the slip's padding, border and double rule back (#470)",
    !!base &&
      base.at < 10000 &&
      base.d === "block" &&
      base.p === "static" &&
      base.v === "hidden" &&
      [base.mh, base.pad, base.bw, base.ow, base.mt].every((x) => x === "0px") &&
      JSON.stringify(base.an) === JSON.stringify(REVEAL_STATEMENT) &&
      !!frame &&
      frame.v === "visible" &&
      frame.mh === "1600px" &&
      frame.mt === "32px" &&
      frame.pad === "24px 25.6px 22.4px" &&
      frame.bw === "1px" &&
      frame.ow === "3px",
    JSON.stringify({ base, frame }),
  );
}

export function h13fNoScript({ check }: SuiteContext, nojs: NoJs["nojs"], clock: NoJs["clock"]): void {
  check(
    "H13f script-off plus reduced motion keeps the noscript doors alone past the 10s mark: the plain nav and the how prose stand, and no slip ever doubles them",
    nojs !== null && nojs.navShown && nojs.howShown && !nojs.door,
    JSON.stringify({ nojs, clock }),
  );
}
