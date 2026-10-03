// The Daily Hunt: a deterministic click-to-find puzzle over the world src/site/seed-of-the-day/app.ts has already drawn, set up once that chart is on the page.
import {
  buildClues,
  chooseQuarry,
  classifyClick,
  legendExcluded,
  revealLore,
  TERRAIN_RADIUS,
  type Quarry,
  type TerrainBand } from "../../world/daily-hunt.ts";
import { renderReveal } from "./reveal.ts";
import { huntDispatch, type Miss } from "./app-dispatch.ts";
import { createProjection, type Projection } from "../../render/transform.ts";
import { seedForDate } from "../../world/seed-of-the-day.ts";
import type { World } from "../../world/types.ts";

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;

// Restart a one-shot CSS animation by toggling its trigger class across a reflow, so it replays even when the class is already present.
function restart(el: HTMLElement | null, cls: string): void {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth; // force reflow so re-adding the class restarts the animation
  el.classList.add(cls);
}

const STORE_KEY = "vellum.hunt.v1";
const MARGIN = Math.round(1500 * 0.045);

const BAND_PROSE = {
  hot: "Hot. You are all but upon it.",
  warm: "Warmer. The place lies near.",
  cool: "Cool. You wander from it.",
  cold: "Cold. It lies well away.",
};

type HuntStore = { solved?: number; streak?: number };

function readStore(): HuntStore {
  try {
    return (JSON.parse(localStorage.getItem(STORE_KEY) || "{}") as HuntStore | null) || {};
  } catch {
    return {};
  }
}

function writeStore(obj: HuntStore): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(obj));
  } catch {
    /* private mode or storage disabled: the hunt still plays, just no streak */
  }
}

// Seeds are YYYYMMDD integers, so step back one calendar day via a UTC Date.
function prevSeed(s: number): number {
  const y = Math.floor(s / 10000);
  const m = (Math.floor(s / 100) % 100) - 1;
  const d = s % 100;
  const dt = new Date(Date.UTC(y, m, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return seedForDate(dt);
}

// Read the rendered legend's box in chart pixel space (the same client-rect mapping the click handler uses) and ask the engine which settlements fall under it.
function legendExclusions(world: World, svg: SVGSVGElement, proj: Projection): ReadonlySet<number> {
  const el = svg.querySelector("#layer-legend");
  const sr = svg.getBoundingClientRect();
  if (!el || !sr.width || !sr.height) return new Set();
  const lr = el.getBoundingClientRect();
  const box = {
    x: ((lr.left - sr.left) / sr.width) * proj.widthPx,
    y: ((lr.top - sr.top) / sr.height) * proj.heightPx,
    width: (lr.width / sr.width) * proj.widthPx,
    height: (lr.height / sr.height) * proj.heightPx,
  };
  return legendExcluded(world, box, proj.widthPx);
}

// The panel line is the aria-live region (its textContent swap is what a screen reader announces); the fixed mobile bar mirrors it visual-only so the latest feedback stays in view without scrolling.
let stickyShown = false;
function setHuntStatus(text: string): void {
  const line = $("hunt-status");
  line.textContent = text;
  if (text.length > 0) restart(line, "wet"); // visual-only ink-dry blur
  const sticky = $("hunt-sticky");
  const show = text.length > 0;
  sticky.textContent = text;
  sticky.classList.toggle("active", show);
  sticky.hidden = !show;
  // Slide up only on the hidden -> shown transition, never on every miss; aria-hidden stays true (the bar mirrors the aria-live line above).
  if (show && !stickyShown) restart(sticky, "rise");
  stickyShown = show;
}

function huntClues(world: World, quarry: Readonly<Quarry>, svg: SVGSVGElement, proj: Readonly<Projection>): void {
  // The rendered SVG is the source of truth for what was drawn: the findability gates read it and run BEFORE selection (Issue #335), so a clue never cites a name or terrain the player cannot find.
  // A label emits as ">Name<" except capital and seat labels, which `settlementsLayer` in `src/render/layers/settlements.ts` renders .toUpperCase(), so both spellings are checked.
  const markup = svg.outerHTML;
  const isLabeled = (name: string) =>
    markup.includes(`>${name}<`) || markup.includes(`>${name.toUpperCase()}<`);
  // Only DRAWN glyphs count (the glyph field shuffles and caps its candidates): parse the glyph layer's <use> translates back to render-pixel space and test against the quarry.
  const glyphs = Array.from(svg.querySelectorAll("#layer-glyphs use")).flatMap((u) => {
    const m = /translate\((-?[\d.]+) (-?[\d.]+)\)/.exec(u.getAttribute("transform") ?? "");
    return m ? [{ href: u.getAttribute("href") ?? "", x: Number(m[1]), y: Number(m[2]) }] : [];
  });
  const GLYPH_PREFIX: Record<TerrainBand, string> = {
    mountains: "#gl-mtn",
    hills: "#gl-hill",
    forest: "#gl-tree",
    marsh: "#gl-marsh",
    dunes: "#gl-dune",
  };
  const qpx = proj.px(quarry.settlement.x);
  const qpy = proj.py(quarry.settlement.y);
  const hasGlyphNear = (band: TerrainBand) =>
    glyphs.some(
      (g) =>
        g.href.startsWith(GLYPH_PREFIX[band]) &&
        Math.hypot(g.x - qpx, g.y - qpy) <= TERRAIN_RADIUS * proj.scale,
    );
  const list = $("clues");
  list.replaceChildren();
  // Each slip staggers in (--i drives the per-item delay in index.css).
  buildClues(world, quarry, { isLabeled, hasGlyphNear }).forEach((c, i) => {
    const li = document.createElement("li");
    li.textContent = c.text;
    li.style.setProperty("--i", String(i));
    list.appendChild(li);
  });
}

function huntReveal(world: World, quarry: Readonly<Quarry>, proj: Readonly<Projection>) {
  // A LIVE solve stamps the star in (.stamp); a solved-day reload places it still, so the win never replays its animation on reload.
  const placeStar = (ceremony: boolean) => {
    if ($("sheet").querySelector(".hunt-star")) return;
    const star = document.createElement("div");
    star.className = ceremony ? "hunt-star stamp" : "hunt-star";
    star.textContent = "★";
    star.style.left = `${(proj.px(quarry.settlement.x) / proj.widthPx) * 100}%`;
    star.style.top = `${(proj.py(quarry.settlement.y) / proj.heightPx) * 100}%`;
    $("sheet").appendChild(star);
  };

  const showReveal = (ceremony: boolean) => {
    const reveal = $("reveal");
    renderReveal(reveal, revealLore(world, quarry));
    reveal.classList.toggle("unfurl", !!ceremony); // unroll on a live solve only
    reveal.hidden = false;
  };
  return { placeStar, showReveal };
}

function huntStreak(seed: number) {
  const updateStreak = () => {
    const n = readStore().streak || 0;
    $("streak").textContent = n > 0 ? `Streak: ${n} ${n === 1 ? "day" : "days"}.` : "";
  };

  const recordSolve = () => {
    const s = readStore();
    if (s.solved === seed) return; // idempotent: re-solving today never inflates
    const streak = s.solved === prevSeed(seed) ? (s.streak || 0) + 1 : 1;
    writeStore({ solved: seed, streak });
  };
  return { updateStreak, recordSolve };
}

function huntSounding(mapEl: HTMLElement) {
  // A sounding at the click point (a spreading ring + a lingering pencil dot). Overlay divs on the sheet only; the SVG is never touched, and both are pointer-transparent + self-removing.
  const spawnSounding = (clientX: number, clientY: number) => {
    const r = mapEl.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const lx = ((clientX - r.left) / r.width) * 100;
    const ly = ((clientY - r.top) / r.height) * 100;
    for (const cls of ["sounding-ring", "sounding-dot"]) {
      const el = document.createElement("div");
      el.className = cls;
      el.style.left = `${lx}%`;
      el.style.top = `${ly}%`;
      el.addEventListener("animationend", () => el.remove());
      mapEl.appendChild(el);
    }
  };
  return { spawnSounding };
}

function winShare(fromClick: boolean): void {
  const share = $("share");
  share.hidden = false;
  if (fromClick) restart(share, "rise"); // the share button rises on a live solve
  // Only a LIVE win has a route in memory to plot; the restored-solve path leaves the Draft dispatch button hidden.
  if (fromClick) $("dispatch").hidden = false;
}

function clickGrid(ev: MouseEvent, svg: SVGSVGElement, proj: Readonly<Projection>): { gx: number; gy: number } {
  const rect = svg.getBoundingClientRect();
  const px = ((ev.clientX - rect.left) / rect.width) * proj.widthPx;
  const py = ((ev.clientY - rect.top) / rect.height) * proj.heightPx;
  const gx = (px - MARGIN) / proj.scale;
  const gy = (py - MARGIN) / proj.scale;
  return { gx, gy };
}

type Tally = { guesses: () => number; missRoute: ReadonlyArray<Miss>; bumpGuesses: () => void; pushMissRoute: (item: Miss) => void; win: (fromClick: boolean) => void };

function huntTally(placeStar: (ceremony: boolean) => void, showReveal: (ceremony: boolean) => void, updateStreak: () => void): Tally {
  let guesses = 0;
  const missRoute: { gx: number; gy: number }[] = []; // each miss as {gx,gy} in GRID space, re-projected at draft time

  const win = (fromClick: boolean) => {
    $("map").classList.add("solved");
    placeStar(fromClick);
    showReveal(fromClick);
    winShare(fromClick);
    setHuntStatus(
      fromClick
        ? `Found it in ${guesses} ${guesses === 1 ? "guess" : "guesses"}.`
        : "Already found today. Come back tomorrow for a new world.",
    );
    updateStreak();
    if (fromClick) restart($("streak"), "stamp"); // the streak stamps on increment
  };
  const bumpGuesses = (): void => { guesses++; };
  const pushMissRoute = (item: Miss): void => { missRoute.push(item); };
  return { guesses: (): number => guesses, missRoute, bumpGuesses, pushMissRoute, win };
}

function huntGuess(world: World, quarry: Readonly<Quarry>, svg: SVGSVGElement, proj: Readonly<Projection>, seed: number, recordSolve: () => void, win: (fromClick: boolean) => void, spawnSounding: (clientX: number, clientY: number) => void, bumpGuesses: () => void, pushMissRoute: (item: Miss) => void) {
  // The session's warmest sounding (smallest click-to-quarry distance), so a colder miss can point back at it; ties keep the earlier one, forgotten on reload.
  let warmest: { readonly dist: number; readonly name: string } | null = null;

  const onClick = (ev: MouseEvent) => {
    if (readStore().solved === seed) return; // already won this session
    const { gx, gy } = clickGrid(ev, svg, proj);

    const feedback = classifyClick(world, quarry, { x: gx, y: gy });
    bumpGuesses();
    if (feedback.kind === "hit") {
      recordSolve();
      win(true);
    } else {
      pushMissRoute({ gx, gy }); // record the route in GRID space (resize-proof)
      spawnSounding(ev.clientX, ev.clientY); // a sounding at the miss point
      // "You mark X" anchors the name to the CLICK (a "nearest mark" read as nearest-to-quarry contradicted colder bands); a miss that fails to beat the session's warmest sounding points back at it instead of repeating itself.
      const marked = feedback.pickedName ? ` You mark ${feedback.pickedName}.` : "";
      const beaten = warmest !== null && feedback.dist < warmest.dist;
      const trail =
        warmest !== null && !beaten && warmest.name !== feedback.pickedName
          ? ` Your warmest sounding yet fell at ${warmest.name}.`
          : "";
      if (feedback.pickedName && (warmest === null || beaten)) {
        warmest = { dist: feedback.dist, name: feedback.pickedName };
      }
      setHuntStatus(`${BAND_PROSE[feedback.band]}${marked}${trail}`);
    }
  };
  return { onClick };
}

function huntCaption(seed: number, guesses: () => number) {
  const dispatchCaption = () => {
    const n = guesses();
    const streak = readStore().streak || 0;
    const soundings = `${n} ${n === 1 ? "sounding" : "soundings"}`;
    const tail = streak > 0 ? ` · streak ${streak} ${streak === 1 ? "day" : "days"}` : "";
    return `Quarry taken in ${soundings} · CHART № ${seed}${tail}`;
  };
  return { dispatchCaption };
}

function listenDispatch(buildDispatchSvg: () => string, quarry: Readonly<Quarry>, seed: number): void {
  $("dispatch").addEventListener("click", () => {
    const blob = new Blob([buildDispatchSvg()], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const slug = quarry.settlement.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.download = `vellum-dispatch-${seed}-${slug}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

function listenShare(quarry: Readonly<Quarry>, guesses: () => number, seed: number): void {
  $("share").addEventListener("click", () => {
    const name = quarry.settlement.name;
    const soundings = `${guesses()} ${guesses() === 1 ? "sounding" : "soundings"}`;
    const text = `Vellum Daily Hunt: I took ${name} in ${soundings}. Seed ${seed}. Can you beat it? ${location.href}`;
    if ((navigator as Partial<Navigator>).share) {
      navigator.share({ title: "Vellum Daily Hunt", text }).catch(() => {});
    } else if ((navigator as Partial<Navigator>).clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setHuntStatus("Copied your result to the clipboard.");
        })
        .catch(() => {});
    }
  });
}

export function setupHunt(world: World, seed: number): void {
  const svg = $("sheet").querySelector("svg");
  if (!svg) return;

  const proj = createProjection(world.elev.w, world.elev.h, 1500, MARGIN);
  const quarry = chooseQuarry(world, { exclude: legendExclusions(world, svg, proj) });
  if (!quarry) return;

  huntClues(world, quarry, svg, proj);

  const { placeStar, showReveal } = huntReveal(world, quarry, proj);
  const { updateStreak, recordSolve } = huntStreak(seed);
  const { guesses, missRoute, bumpGuesses, pushMissRoute, win } = huntTally(placeStar, showReveal, updateStreak);
  const { dispatchCaption } = huntCaption(seed, guesses);
  const { buildDispatchSvg } = huntDispatch(svg, proj, quarry, missRoute, dispatchCaption);
  window.__vellumDispatchSvg = buildDispatchSvg; // e2e hook (inspect without a real download)

  listenDispatch(buildDispatchSvg, quarry, seed);
  listenShare(quarry, guesses, seed);

  if (readStore().solved === seed) {
    win(false); // restore the solved state on reload
    return;
  }

  $("share").hidden = true;
  updateStreak();

  const mapEl = $("sheet");
  const { spawnSounding } = huntSounding(mapEl);
  const { onClick } = huntGuess(world, quarry, svg, proj, seed, recordSolve, win, spawnSounding, bumpGuesses, pushMissRoute);
  svg.addEventListener("click", onClick);
}
