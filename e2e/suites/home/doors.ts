import type { Payload, SuiteContext } from "../../types.ts";
import { withScriptsOff } from "../../support/scripts-off.ts";
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

export async function h13dPrmDoors({ evaluate, send, check, sleep, PORT }: SuiteContext): Promise<void> {
  await send("Network.setBlockedURLs", { urls: ["*app.bundle.js*"] });
  await evaluate(`sessionStorage.clear()`);
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let prmDoors = false;
  for (let i = 0; i < 90; i++) {
    try {
      prmDoors = await evaluate(doorShown);
    } catch {}
    if (prmDoors === true) break;
    await sleep(150);
  }
  await send("Network.setBlockedURLs", { urls: [] });
  check(
    "H13d reduced motion keeps its doors on a dead bundle: the reveal is a timer, not motion the prm blanket may still",
    prmDoors === true,
    `doors shown=${prmDoors}`,
  );
}

export async function h13ePrmNoFlash({ evaluate, send, check, sleep, PORT }: SuiteContext): Promise<void> {
  // Mark the H13d page before leaving: without the marker the first samples race the navigation and read the OLD page's legitimately visible doors as a flash.
  await evaluate(`window.__h13d = 1`);
  // Throttle so the pre-.cam window is seconds wide: on an unthrottled localhost the module boots within a frame and a 75ms sampler proves nothing about a flash (skeptic round 3).
  await send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 200,
    downloadThroughput: 120000,
    uploadThroughput: 120000,
  });
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let prmFlash = false;
  let prmCam = false;
  let fresh = false;
  let afterCam = 0;
  for (let i = 0; i < 120; i++) {
    try {
      const s = await evaluate<{ old: boolean; ready: boolean; door: boolean; cam: boolean }>(
        `({ old: window.__h13d === 1, ready: !!document.getElementById("seed-form"), door: ${doorShown}, cam: !!document.querySelector("#lf-stage.cam") })`,
      );
      if (fresh) {
        if (s.door) prmFlash = true;
        if (s.cam) prmCam = true;
      } else {
        fresh = !s.old && s.ready;
      }
    } catch {}
    if (prmCam && ++afterCam > 4) break;
    await sleep(75);
  }
  await send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 0,
    downloadThroughput: -1,
    uploadThroughput: -1,
  });
  check(
    "H13e and never shows them on a healthy THROTTLED load: the pre-.cam window is seconds wide and no prm sample ever sees a door before the bundle provably boots",
    prmCam && !prmFlash,
    JSON.stringify({ prmCam, prmFlash }),
  );
}

export async function h13fNoScriptRead(ctx: SuiteContext) {
  const { evaluate, send, sleep, PORT } = ctx;
  // The round-2 blocker's live proof: script execution OFF plus reduced motion is the one visitor class where the noscript stand-down must out-cascade the prm exemption (both !important, specificity tied, document order decides).
  return withScriptsOff(send, async () => {
    let nojs = null;
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
    for (let i = 0; i < 90; i++) {
      try {
        nojs = await evaluate<{ navShown: boolean; howShown: boolean; door: boolean } | null>(`(() => {
          const nav = document.querySelector(".lf-noscript-rooms");
          const how = document.getElementById("lf-card-how");
          if (nav === null || how === null) return null;
          return { navShown: nav.offsetParent !== null, howShown: how.offsetParent !== null && getComputedStyle(how).visibility === "visible", door: ${doorShown} };
        })()`);
      } catch {}
      if (nojs !== null && nojs.door) break;
      await sleep(150);
    }
    return { nojs, shelf: await shelfWithoutScripts(ctx) };
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
      JSON.stringify(base.an) === JSON.stringify(["lf-doors-reveal", "0s", "10s", "forwards"]) &&
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

export function h13fNoScript({ check }: SuiteContext, nojs: NoJs["nojs"]): void {
  check(
    "H13f script-off plus reduced motion keeps the noscript doors alone past the 10s mark: the plain nav and the how prose stand, and no slip ever doubles them",
    nojs !== null && nojs.navShown && nojs.howShown && !nojs.door,
    JSON.stringify(nojs),
  );
}
