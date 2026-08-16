// Seed-of-the-day controller: today's UTC date is the seed, so a purely static page
// shows a fresh world each day, rendered inline on the main thread. The Daily Hunt is a
// deterministic click-to-find puzzle over that already-generated world.
import { defaultRecipe, generateWorld } from "../../world/generate.ts";
import { renderMap } from "../../render/map-renderer.ts";
import { seedForDate, capitalBlurb } from "../../world/seed-of-the-day.ts";
import { createRng } from "../../core/rng.ts";
import { createLoreWriter } from "../../society/lore.ts";
import {
  buildClues,
  chooseQuarry,
  classifyClick,
  legendExcluded,
  revealLore,
  TERRAIN_RADIUS,
  type TerrainBand,
} from "../../world/daily-hunt.ts";
import { createProjection, type Projection } from "../../render/transform.ts";
import { startArrival } from "../explorer/draw-ceremony.ts";
import { createZoomController } from "../shared/zoom-controller.ts";
import type { ZoomState } from "../shared/zoom-controller.ts";
import type { World } from "../../world/types.ts";

declare global {
  interface Window {
    __vellumZoomTo: (t: ZoomState) => void;
    __vellumZoomState: () => ZoomState;
    __vellumDispatchSvg?: () => string;
  }
}

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;

const now = new Date();
const seed = seedForDate(now);

const dateLabel = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
}).format(now);

$("dateline").textContent = `${dateLabel} · seed ${seed}`;
$<HTMLAnchorElement>("explore").href = `../explorer/#seed=${seed}&style=antique&legend=1`;
// #221: the cross-link carries the seed explicitly, so it keeps opening THIS page's world even after UTC midnight rolls the bare-visit default to a new day.
$<HTMLAnchorElement>("watch").href = `../reading-room/#seed=${seed}`;

// #167: the SAME shared zoom controller as the Explorer, bound to the STABLE #map-viewport (never wiped by the deferred render) with its live transform landing on #map.
// Deliberately NO onSettle: the Hunt is a FIXED world (#161); a semantic redraft would reveal new places and change clue difficulty, so the magnify stays purely geometric.
// The guess-click math needs no changes: it is ratio-based against getBoundingClientRect(), and d3-zoom's click-distance handling keeps a drag-pan from registering as a guess.
const zoomController = createZoomController({
  viewportEl: $("map-viewport"),
  targetEl: $("map"),
  scaleExtent: [1, 8],
});
zoomController.attach();
// Deterministic zoom hooks for the e2e, mirroring the Explorer's.
window.__vellumZoomTo = (t) => zoomController.zoomTo(t);
window.__vellumZoomState = () => zoomController.getState();

// Restart a one-shot CSS animation by toggling its trigger class across a reflow, so it replays even when the class is already present.
function restart(el: HTMLElement | null, cls: string): void {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth; // force reflow so re-adding the class restarts the animation
  el.classList.add(cls);
}

// Dry a text element in after the chart, at a small stagger delay.
function dryIn(el: HTMLElement | null, delay: string): void {
  if (!el) return;
  el.style.setProperty("--dry-delay", delay);
  el.classList.add("drying");
}

// Defer one macrotask so the "Drafting…" status paints before the main thread blocks on the render.
setTimeout(() => {
  try {
    const world = generateWorld(defaultRecipe(seed));
    $("map").innerHTML = renderMap(world, { style: "antique", legend: true });
    startArrival($("map").querySelector("svg"));

    dryIn($("caption"), "120ms");
    $("caption").textContent = world.title.title;
    dryIn($("survey"), "260ms");
    $("survey").textContent = world.title.subtitle;

    const capital =
      world.settlements.find((s) => s.kind === "capital") ?? world.settlements[0];
    if (capital) {
      const lore = createLoreWriter(world, createRng(seed).fork("seed-of-the-day"));
      dryIn($("blurb"), "400ms");
      $("blurb").textContent = capitalBlurb(capital, lore.settlementNote(capital));
    }
    $("status").textContent = "";
    setupHunt(world);
  } catch (err) {
    $("status").textContent = "The cartographer spilled the ink: " + (err as Error).message;
  }
}, 0);

const STORE_KEY = "vellum.hunt.v1";
const MARGIN = Math.round(1500 * 0.045);

// #123: everything the dispatch adds is inline-styled and font-independent, because a downloaded SVG travels with NO page CSS and no guaranteed fonts.
const SVG_NS = "http://www.w3.org/2000/svg";
const DISPATCH_BAND = 104; // extra sheet drawn below the plate to seat the caption

const svgEl = (name: string, attrs: Record<string, string | number>): SVGElement => {
  const e = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  return e;
};

// A five-pointed vector star: a polygon renders identically in any SVG viewer, without depending on a "★" glyph being present in the reader's installed fonts.
const starNode = (cx: number, cy: number, fill: string): SVGElement => {
  const rOuter = 26, rInner = 11, pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5; // first point straight up
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return svgEl("polygon", {
    "data-dispatch-star": "",
    points: pts.join(" "),
    style: `fill:${fill};stroke:#fff7e4;stroke-width:1.5`,
  });
};

const BAND_PROSE = {
  hot: "Hot. You are all but upon it.",
  warm: "Warmer. The place lies near.",
  cool: "Cool. You wander from it.",
  cold: "Cold. It lies well away.",
};

type HuntStore = { solved?: number; streak?: number };

function readStore(): HuntStore {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {};
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
  if (text.length > 0) restart(line, "wet"); // #129 visual-only ink-dry blur
  const sticky = $("hunt-sticky");
  if (!sticky) return;
  const show = text.length > 0;
  sticky.textContent = text;
  sticky.classList.toggle("active", show);
  sticky.hidden = !show;
  // Slide up only on the hidden -> shown transition, never on every miss; aria-hidden stays true (the bar mirrors the aria-live line above).
  if (show && !stickyShown) restart(sticky, "rise");
  stickyShown = show;
}

function setupHunt(world: World): void {
  const hunt = $("hunt");
  const svg = $("map").querySelector("svg");
  if (!hunt || !svg) return;

  const proj = createProjection(world.elev.w, world.elev.h, 1500, MARGIN);
  const quarry = chooseQuarry(world, { exclude: legendExclusions(world, svg, proj) });
  if (!quarry) return;

  // The rendered SVG is the source of truth for what was drawn: the findability gates read it and run BEFORE selection (#335), so a clue never cites a name or terrain the player cannot find.
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
  // #129: each slip staggers in (--i drives the per-item delay in index.css).
  buildClues(world, quarry, { isLabeled, hasGlyphNear }).forEach((c, i) => {
    const li = document.createElement("li");
    li.textContent = c.text;
    li.style.setProperty("--i", String(i));
    list.appendChild(li);
  });
  hunt.hidden = false;

  let guesses = 0;
  const missRoute: { gx: number; gy: number }[] = []; // #123: each miss as {gx,gy} in GRID space, re-projected at draft time
  // #327: the session's warmest sounding (smallest click-to-quarry distance), so a colder miss can point back at it; ties keep the earlier one, forgotten on reload.
  let warmest: { readonly dist: number; readonly name: string } | null = null;

  // #129: a LIVE solve stamps the star in (.stamp); a solved-day reload places it still, so the win never replays its animation on reload.
  const placeStar = (ceremony: boolean) => {
    if ($("map").querySelector(".hunt-star")) return;
    const star = document.createElement("div");
    star.className = ceremony ? "hunt-star stamp" : "hunt-star";
    star.textContent = "★";
    star.style.left = `${(proj.px(quarry.settlement.x) / proj.widthPx) * 100}%`;
    star.style.top = `${(proj.py(quarry.settlement.y) / proj.heightPx) * 100}%`;
    $("map").appendChild(star);
  };

  const showReveal = (ceremony: boolean) => {
    const r = revealLore(world, quarry);
    const reveal = $("reveal");
    reveal.replaceChildren();
    const head = document.createElement("strong");
    head.textContent = `${r.name}, founded in the year ${r.founded}.`;
    const body = document.createElement("p");
    body.textContent = r.line;
    reveal.append(head, body);
    reveal.classList.toggle("unfurl", !!ceremony); // #129: unroll on a live solve only
    reveal.hidden = false;
  };

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

  const win = (fromClick: boolean) => {
    $("map").classList.add("solved");
    placeStar(fromClick);
    showReveal(fromClick);
    const share = $("share");
    share.hidden = false;
    if (fromClick) restart(share, "rise"); // #129: the share button rises on a live solve
    // #123: only a LIVE win has a route in memory to plot; the restored-solve path leaves the Draft dispatch button hidden.
    if (fromClick) $("dispatch").hidden = false;
    setHuntStatus(
      fromClick
        ? `Found it in ${guesses} ${guesses === 1 ? "guess" : "guesses"}.`
        : "Already found today. Come back tomorrow for a new world.",
    );
    updateStreak();
    if (fromClick) restart($("streak"), "stamp"); // #129: the streak stamps on increment
  };

  // #123 the Surveyor's Dispatch: clone today's actual chart (keeping its data-vellum-* recipe, so the artifact stays reproducible like every Vellum export) and append one survey overlay plus a caption band.
  // The route is stored in GRID space and re-projected HERE, at draft time, so it is identical no matter the window size when each guess was clicked.
  const dispatchCaption = () => {
    const n = guesses;
    const streak = readStore().streak || 0;
    const soundings = `${n} ${n === 1 ? "sounding" : "soundings"}`;
    const tail = streak > 0 ? ` · streak ${streak} ${streak === 1 ? "day" : "days"}` : "";
    return `Quarry taken in ${soundings} · CHART № ${seed}${tail}`;
  };

  const buildDispatchSvg = () => {
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.removeAttribute("class"); // drop any transient arrival class; the chart draws CSS-free
    // The background paper is a DIRECT child rect (the defs/pattern rects are nested), so :scope > rect selects the plate colour, not a texture tile.
    const paper = clone.querySelector(":scope > rect")?.getAttribute("fill") || "#f4ecd8";
    const bandTop = proj.heightPx;
    const vbH = proj.heightPx + DISPATCH_BAND;
    clone.setAttribute("viewBox", `0 0 ${proj.widthPx} ${vbH}`);
    clone.setAttribute("height", String(Math.round(vbH)));
    clone.appendChild(svgEl("rect", { x: 0, y: bandTop, width: proj.widthPx, height: DISPATCH_BAND, fill: paper }));

    const INK = "#4a3826", STAR = "#7a1f12";
    const g = svgEl("g", { "data-vellum-dispatch": "" });

    const misses = missRoute.map((m) => [proj.px(m.gx), proj.py(m.gy)]);
    const qx = proj.px(quarry.settlement.x), qy = proj.py(quarry.settlement.y);

    if (misses.length > 0) {
      g.appendChild(svgEl("polyline", {
        points: [...misses, [qx, qy]].map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" "),
        style: `fill:none;stroke:${INK};stroke-width:3;stroke-dasharray:1 13;stroke-linecap:round;opacity:0.8`,
      }));
    }
    misses.forEach(([x, y], i) => {
      g.appendChild(svgEl("circle", {
        "data-dispatch-station": "",
        cx: x.toFixed(2), cy: y.toFixed(2), r: 17,
        style: `fill:${paper};stroke:${INK};stroke-width:2.5`,
      }));
      const label = svgEl("text", {
        x: x.toFixed(2), y: y.toFixed(2),
        style: `fill:${INK};font:600 22px Georgia,'Times New Roman',serif;text-anchor:middle;dominant-baseline:central`,
      });
      label.textContent = String(i + 1);
      g.appendChild(label);
    });
    g.appendChild(starNode(qx, qy, STAR)); // a star at the find

    const cap = svgEl("text", {
      x: (proj.widthPx / 2).toFixed(2),
      y: (bandTop + DISPATCH_BAND / 2).toFixed(2),
      style: `fill:${INK};font:italic 30px Georgia,'Times New Roman',serif;text-anchor:middle;dominant-baseline:central;letter-spacing:0.03em`,
    });
    cap.textContent = dispatchCaption();
    g.appendChild(cap);

    clone.appendChild(g);
    return new XMLSerializer().serializeToString(clone);
  };
  window.__vellumDispatchSvg = buildDispatchSvg; // #123 e2e hook (inspect without a real download)

  $("dispatch").addEventListener("click", () => {
    const blob = new Blob([buildDispatchSvg()], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const slug = quarry.settlement.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.download = `vellum-dispatch-${seed}-${slug}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  $("share").addEventListener("click", () => {
    const name = quarry.settlement.name;
    const soundings = `${guesses} ${guesses === 1 ? "sounding" : "soundings"}`;
    const text = `Vellum Daily Hunt: I took ${name} in ${soundings}. Seed ${seed}. Can you beat it? ${location.href}`;
    if (navigator.share) {
      navigator.share({ title: "Vellum Daily Hunt", text }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setHuntStatus("Copied your result to the clipboard.");
        })
        .catch(() => {});
    }
  });

  if (readStore().solved === seed) {
    win(false); // restore the solved state on reload
    return;
  }

  $("share").hidden = true;
  updateStreak();

  // #129: a sounding at the click point (a spreading ring + a lingering pencil dot). Overlay divs on #map only; the SVG is never touched, and both are pointer-transparent + self-removing.
  const mapEl = $("map");
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

  svg.addEventListener("click", (ev) => {
    if (readStore().solved === seed) return; // already won this session
    const rect = svg.getBoundingClientRect();
    const px = ((ev.clientX - rect.left) / rect.width) * proj.widthPx;
    const py = ((ev.clientY - rect.top) / rect.height) * proj.heightPx;
    const gx = (px - MARGIN) / proj.scale;
    const gy = (py - MARGIN) / proj.scale;

    const feedback = classifyClick(world, quarry, { x: gx, y: gy });
    guesses++;
    if (feedback.kind === "hit") {
      recordSolve();
      win(true);
    } else {
      missRoute.push({ gx, gy }); // #123: record the route in GRID space (resize-proof)
      spawnSounding(ev.clientX, ev.clientY); // #129: a sounding at the miss point
      // #327: "You mark X" anchors the name to the CLICK (a "nearest mark" read as nearest-to-quarry contradicted colder bands); a miss that fails to beat the session's warmest sounding points back at it instead of repeating itself.
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
  });
}
