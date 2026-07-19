// Seed-of-the-day controller. Draws today's world client-side: today's UTC date
// is the seed, so the page is purely static yet shows a fresh world each day
// (no rebuild needed). Reuses the same browser engine as the Explorer; one
// render, run inline on the main thread. On top of the render it wires the
// Daily Hunt: a deterministic click-to-find puzzle over the already-generated
// world (no extra world-gen, no worker, no seed re-roll).
import { defaultRecipe, generateWorld } from "../explorer/engine/world/generate.js";
import { renderMap } from "../explorer/engine/render/map-renderer.js";
import { seedForDate } from "../explorer/engine/world/seed-of-the-day.js";
import { createRng } from "../explorer/engine/core/rng.js";
import { createLoreWriter } from "../explorer/engine/society/lore.js";
import {
  buildClues,
  chooseQuarry,
  classifyClick,
  legendExcluded,
  pruneUnlabeledFeatureClues,
  revealLore,
} from "../explorer/engine/world/daily-hunt.js";
import { createProjection } from "../explorer/engine/render/transform.js";
// The #127/#129 arrival ceremony, shared with the Explorer (extracted in #183). This
// page has no Download or golden, so styling the live SVG is free; the ceremony only
// adds the .arriving class and animates the coastline dash, and each page's CSS decides
// what .arriving does (here it also runs paperSettle).
import { startArrival } from "../explorer/draw-ceremony.js";
// #167 The Surveyor's Glass, Sub 6: the SAME shared zoom controller the Explorer uses.
import { createZoomController } from "../shared/zoom-controller.js";

const $ = (id) => document.getElementById(id);

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
$("explore").href = `../explorer/#seed=${seed}&style=antique&legend=1`;

// --- The Surveyor's Glass, Sub 6 (#167): geometric pan/zoom on today's chart --
// The Hunt adopts the SAME shared controller the Explorer built in Sub 3, geometric-only.
// It binds to the STABLE #map-viewport (never wiped when the deferred render replaces
// #map's innerHTML) and lands its live CSS transform on #map, so the chart SVG and the
// %-positioned hunt star + soundings ride one composited frame with no redraw. Attached
// once at load: the world is fixed and always antique, so the glass is always live.
//
// Deliberately NO onSettle: the Hunt is a FIXED world (epic #161). A semantic redraft
// would reveal new places and change the clue difficulty, so it never imports the LOD or
// region-worker paths -- the magnify stays purely geometric. The guess-click math needs
// zero changes: it is ratio-based against getBoundingClientRect(), which reflects the live
// transform by definition, and d3-zoom's own click-distance handling makes a drag-pan never
// register as a guess (a moved gesture suppresses the trailing click). reducedMotion is left
// unset so the controller reads the OS setting live (the double-click zoom is the one
// animation it collapses).
const zoomController = createZoomController({
  viewportEl: $("map-viewport"),
  targetEl: $("map"),
  scaleExtent: [1, 8],
});
zoomController.attach();
// Deterministic zoom hooks for the e2e (mirror the Explorer's): zoomTo drives the camera
// through the same clamp a live gesture uses; zoomState reads back the settled {x,y,k}.
window.__vellumZoomTo = (t) => zoomController.zoomTo(t);
window.__vellumZoomState = () => zoomController.getState();

// --- The daily reveal (#129 arrival ceremony) --------------------------------

// Restart a one-shot CSS animation by toggling its trigger class across a reflow,
// so it replays even when the class is already present (a re-shown element).
function restart(el, cls) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth; // force reflow so re-adding the class restarts the animation
  el.classList.add(cls);
}

// Dry a text element in after the chart, at a small stagger delay.
function dryIn(el, delay) {
  if (!el) return;
  el.style.setProperty("--dry-delay", delay);
  el.classList.add("drying");
}

// Defer one macrotask so the "Drafting…" status paints before the main thread
// blocks on the render.
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
      $("blurb").textContent = `${capital.name}, the capital. ${lore.settlementNote(capital)}`;
    }
    $("status").textContent = "";
    setupHunt(world);
  } catch (err) {
    $("status").textContent = "The cartographer spilled the ink: " + err.message;
  }
}, 0);

// --- The Daily Hunt ----------------------------------------------------------

const STORE_KEY = "vellum.hunt.v1";
const MARGIN = Math.round(1500 * 0.045); // matches renderMap's default margin

const BAND_PROSE = {
  hot: "Hot. You are all but upon it.",
  warm: "Warmer. The place lies near.",
  cool: "Cool. You wander from it.",
  cold: "Cold. It lies well away.",
};

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function writeStore(obj) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(obj));
  } catch {
    /* private mode or storage disabled: the hunt still plays, just no streak */
  }
}

// Yesterday's seed in UTC, for the consecutive-day streak test. Seeds are
// YYYYMMDD integers, so step back one calendar day via a UTC Date.
function prevSeed(s) {
  const y = Math.floor(s / 10000);
  const m = (Math.floor(s / 100) % 100) - 1;
  const d = s % 100;
  const dt = new Date(Date.UTC(y, m, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return seedForDate(dt);
}

// Read the rendered legend's box in the chart's pixel space (via the same
// client-rect mapping the click handler uses) and ask the engine which
// settlements fall under it. Empty if the legend isn't drawn or measurable.
function legendExclusions(world, svg, proj) {
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

// Show the warmer/colder line in its panel slot AND mirror it into the fixed
// mobile bar, so the latest feedback stays in view without scrolling. The panel
// line is the aria-live region, so its textContent swap is what a screen reader
// announces; #129 adds a visual-only drying blur on that rendered text and slides
// the mobile bar up the first time it appears.
let stickyShown = false;
function setHuntStatus(text) {
  const line = $("hunt-status");
  line.textContent = text;
  if (text.length > 0) restart(line, "wet"); // #129 visual-only ink-dry blur
  const sticky = $("hunt-sticky");
  if (!sticky) return;
  const show = text.length > 0;
  sticky.textContent = text;
  sticky.classList.toggle("active", show);
  sticky.hidden = !show;
  // Slide up only on the hidden -> shown transition, never on every miss. aria-hidden
  // stays true (the bar mirrors the aria-live panel line above; see index.css).
  if (show && !stickyShown) restart(sticky, "rise");
  stickyShown = show;
}

function setupHunt(world) {
  const hunt = $("hunt");
  const svg = $("map").querySelector("svg");
  if (!hunt || !svg) return;

  const proj = createProjection(world.elev.w, world.elev.h, 1500, MARGIN);
  const quarry = chooseQuarry(world, { exclude: legendExclusions(world, svg, proj) });
  if (!quarry) return;

  // clues: a plain antique ordered list. Prune any river/lake clue whose name
  // the chart never labeled (short/collision-skipped courses), so the hunt never
  // cites a feature the player cannot find. The rendered SVG is the source of
  // truth for what was drawn: a label emits as ">Name<" in the markup.
  const isLabeled = (name) => svg.outerHTML.includes(`>${name}<`);
  const list = $("clues");
  list.replaceChildren();
  // #129: each slip staggers in (--i drives the per-item delay in index.css).
  pruneUnlabeledFeatureClues(buildClues(world, quarry), isLabeled).forEach((c, i) => {
    const li = document.createElement("li");
    li.textContent = c.text;
    li.style.setProperty("--i", String(i));
    list.appendChild(li);
  });
  hunt.hidden = false;

  let guesses = 0;

  // #129: on a LIVE solve the star stamps in (.stamp); on a solved-day reload it is
  // placed still (no .stamp), so the win no longer replays its animation on reload.
  const placeStar = (ceremony) => {
    if ($("map").querySelector(".hunt-star")) return;
    const star = document.createElement("div");
    star.className = ceremony ? "hunt-star stamp" : "hunt-star";
    star.textContent = "★";
    star.style.left = `${(proj.px(quarry.settlement.x) / proj.widthPx) * 100}%`;
    star.style.top = `${(proj.py(quarry.settlement.y) / proj.heightPx) * 100}%`;
    $("map").appendChild(star);
  };

  const showReveal = (ceremony) => {
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

  const win = (fromClick) => {
    $("map").classList.add("solved");
    placeStar(fromClick);
    showReveal(fromClick);
    const share = $("share");
    share.hidden = false;
    if (fromClick) restart(share, "rise"); // #129: the share button rises on a live solve
    setHuntStatus(
      fromClick
        ? `Found it in ${guesses} ${guesses === 1 ? "guess" : "guesses"}.`
        : "Already found today. Come back tomorrow for a new world.",
    );
    updateStreak();
    if (fromClick) restart($("streak"), "stamp"); // #129: the streak stamps on increment
  };

  $("share").addEventListener("click", () => {
    const name = quarry.settlement.name;
    const tally = guesses > 0 ? ` in ${guesses} ${guesses === 1 ? "guess" : "guesses"}` : "";
    const text = `Vellum Daily Hunt: I found ${name}${tally}. Seed ${seed}. ${location.href}`;
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

  // #129: drop a sounding at the click point over the map (a spreading ring + a
  // graphite pencil dot that lingers, then fades). Overlay divs on #map only; the
  // SVG is never touched, and both are pointer-transparent + self-removing.
  const mapEl = $("map");
  const spawnSounding = (clientX, clientY) => {
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
      spawnSounding(ev.clientX, ev.clientY); // #129: a sounding at the miss point
      // Continuous heat (from the click's own distance to the quarry) plus the
      // name of the mark the click selected, so a cluster of identical village
      // glyphs no longer reads as an indistinguishable dead-end.
      const tail = feedback.pickedName ? ` The nearest mark is ${feedback.pickedName}.` : "";
      setHuntStatus(`${BAND_PROSE[feedback.band]}${tail}`);
    }
  });
}
