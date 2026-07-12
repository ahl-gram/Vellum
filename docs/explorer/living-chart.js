// The Living Chart overlay (epic #51): the per-draw DOM layer over the baked chart.
// It folds together two coupled features that share one overlay of invisible
// hit-targets positioned by manifest fractions (so they align at any width):
//   #53 story cards  - hover / tap / Tab-focus a place to unfurl a parchment card.
//   #54 year-scrubber - a year-slider + Play that animates the world growing,
//                       reusing the same hit-targets as time-controlled dots over
//                       the hidden baked layers.
// They are one module because they are coupled: the card is suppressed while
// scrubbing, and the scrubber drives the same hits. Card text is composed
// CLIENT-SIDE from the manifest (composePlaceCard), never createLoreWriter, whose
// order/rng-dependent prose would diverge from the gazetteer for the same town.
//
// app.js (the conductor) owns the listener wiring and calls the exports below;
// state (placeOverlay, scrub) is module-private here, so the suppress check is a
// plain within-module read and there is no cross-module cycle.
import { composePlaceCard, placeAriaLabel, cardSide } from "./engine/render/place-card.js";
import {
  scrubRange,
  buildScrubMarks,
  glyphVisibleAt,
  eventIsPast,
  buildSweepPlan,
  sweepYearAt,
} from "./engine/render/chronicle-scrubber.js";

const mapDiv = document.getElementById("map");
const scrubPanel = document.getElementById("scrubber");
const scrubPlayBtn = document.getElementById("scrub-play");
const scrubRangeEl = document.getElementById("scrub-range");
const scrubYearEl = document.getElementById("scrub-year");
const chronicleStrip = document.getElementById("chronicle-strip");

// #53 overlay state. Rebuilt every draw because mapDiv.innerHTML wipes #map's
// children. `pinned` keeps a tapped or Enter/Space card open (touch has no
// mouseleave); `currentIdx` is the place the card last previewed (moves on every
// hover/focus); `pinnedIdx` is the place a tap/Enter pinned. currentIdx and
// pinnedIdx MUST be distinct: a genuine click is always preceded by a preview of
// the same place, so keying the pin toggle off currentIdx would dismiss instead of
// switch when pinning B after A was pinned.
let placeOverlay = null; // { card, places, events, presentYear, currentIdx, pinned, pinnedIdx } | null

// #54 scrubber session (null when the toggle is off). Since #93 the sweep drives
// the REAL baked settlement glyphs (per-idx <g class="settlement">), not abstract
// dots: `groups` maps each world index to its glyph group, `roadsEl` is the baked
// road network shown only when parked at the present.
let scrub = null; // { marks, range, groups, roadsEl, strip, plan, playing, rafId, elapsed, year } | null

// --- #53 story cards --------------------------------------------------------

function showPlaceCard(idx) {
  if (!placeOverlay || scrub) return; // the hover card is suppressed while scrubbing
  const place = placeOverlay.places[idx];
  if (!place) return;
  const card = composePlaceCard(place, placeOverlay.events);
  const el = placeOverlay.card;
  const inner = el.querySelector(".pc-inner");
  // Rebuilt from textContent only (no innerHTML): the fields are plain strings.
  inner.replaceChildren();
  const name = document.createElement("strong");
  name.className = "pc-name";
  name.textContent = card.name;
  const rank = document.createElement("span");
  rank.className = "pc-rank";
  rank.textContent = card.rank;
  const founded = document.createElement("span");
  founded.className = "pc-founded";
  founded.textContent = card.foundedLine;
  inner.append(name, rank, founded);
  if (card.tale) {
    const tale = document.createElement("p");
    tale.className = "pc-tale";
    tale.textContent = card.tale;
    inner.append(tale);
  }
  el.style.left = `${place.nx * 100}%`;
  el.style.top = `${place.ny * 100}%`;
  const side = cardSide(place.nx, place.ny);
  el.classList.toggle("flip-h", side.h === "left");
  el.classList.toggle("flip-v", side.v === "above");
  // #128: a card pinned to THIS place plays the full unfurl grade; a hover/focus
  // preview (pinned false, or pinned to another place) runs the short grade.
  el.classList.toggle("pinned", placeOverlay.pinned && placeOverlay.pinnedIdx === idx);
  el.hidden = false;
  // Restart the unfurl cleanly at the current grade on every show. A CSS animation
  // would not otherwise replay while the card stays displayed across a content swap
  // (sweep or pin-from-preview), and a mid-flight grade change would leave a partial
  // roll; the none/reflow/restore reset guarantees a fresh roll every time. The short
  // hover grade keeps a fast sweep nimble.
  inner.style.animation = "none";
  void inner.offsetWidth;
  inner.style.animation = "";
  placeOverlay.currentIdx = idx;
}

function hidePlaceCard() {
  if (!placeOverlay) return;
  placeOverlay.pinned = false;
  placeOverlay.pinnedIdx = -1;
  placeOverlay.card.hidden = true;
}

// After each draw: lay invisible focusable hit-targets over the baked glyphs (the
// chart exposes no per-feature ids) and feed one reused parchment card.
export function buildPlaceOverlay(manifest) {
  if (!manifest || !manifest.places) return;
  const overlay = document.createElement("div");
  overlay.className = "place-overlay";
  const card = document.createElement("div");
  card.id = "place-card";
  // role=tooltip + aria-describedby (set per hit below) is the robust path: it
  // reads the card as the focused hit's description. No aria-live, which on a
  // populate-while-hidden region announces unreliably and would double up.
  card.setAttribute("role", "tooltip");
  card.hidden = true;
  // #128: the paper sheet is a persistent inner wrapper. Content is swapped into it
  // per place, but the element is stable, so the unfurl animation replays only on a
  // real unhide (display:none -> block on the card), not on a content swap.
  const inner = document.createElement("div");
  inner.className = "pc-inner";
  card.appendChild(inner);
  placeOverlay = { card, places: manifest.places, events: manifest.events, presentYear: manifest.presentYear, currentIdx: -1, pinned: false, pinnedIdx: -1 };
  manifest.places.forEach((place, idx) => {
    const hit = document.createElement("button");
    hit.type = "button";
    hit.className = "place-hit";
    hit.dataset.idx = String(idx);
    hit.setAttribute("aria-label", placeAriaLabel(place));
    hit.setAttribute("aria-describedby", "place-card");
    hit.style.left = `${place.nx * 100}%`;
    hit.style.top = `${place.ny * 100}%`;
    // Hover / keyboard focus previews the card; the preview can move the open
    // card between places, and the pin only governs whether leaving dismisses it.
    hit.addEventListener("mouseenter", () => showPlaceCard(idx));
    hit.addEventListener("focus", () => showPlaceCard(idx));
    hit.addEventListener("mouseleave", () => { if (!placeOverlay.pinned) placeOverlay.card.hidden = true; });
    hit.addEventListener("blur", () => { if (!placeOverlay.pinned) placeOverlay.card.hidden = true; });
    // Tap / Enter / Space all fire a button click: pin the card open, or switch
    // the pin to this place. Activating the already-pinned place toggles it off.
    hit.addEventListener("click", () => {
      if (placeOverlay.pinned && placeOverlay.pinnedIdx === idx) { hidePlaceCard(); return; }
      placeOverlay.pinned = true;
      placeOverlay.pinnedIdx = idx;
      showPlaceCard(idx);
    });
    overlay.appendChild(hit);
  });
  mapDiv.appendChild(overlay);
  mapDiv.appendChild(card);
}

// Document-level dismiss, wired once in app.js: Escape or a click/tap off any mark
// closes a pinned card. A click on a hit or the card itself is ignored here (the
// hit's own handler owns pinning).
export function onDocKeydown(e) {
  if (e.key === "Escape" && placeOverlay && !placeOverlay.card.hidden) hidePlaceCard();
}

export function onDocClick(e) {
  if (!placeOverlay || placeOverlay.card.hidden) return;
  const t = e.target;
  if (t && t.closest && (t.closest(".place-hit") || t.closest("#place-card"))) return;
  hidePlaceCard();
}

// --- #54 chronicle scrubber -------------------------------------------------
// Reveals the world over time using the #52 manifest; never re-renders. Since #93
// it toggles each baked settlement's own <g class="settlement" data-idx> by year
// (real castles/towns/labels, not dots), plus the baked #layer-roads as a whole.
// Download SVG saves lastSvg (the string), never the DOM, so the export is
// unaffected no matter the scrubbed frame.

// The road network carries no per-settlement founding year, so it cannot time-
// reveal; show it only when parked at the present (toggle-on, a manual scrub to
// the present, end-of-Play) and hide it whenever the shown year is in the past,
// so roads to not-yet-founded towns never appear. Restore by CLEARING the inline
// style, never setting "block": an SVG <g> does not take display:block.
function setRoadsVisible(visible) {
  if (scrub && scrub.roadsEl) scrub.roadsEl.style.display = visible ? "" : "none";
}

export function cancelScrubRaf() {
  if (scrub && scrub.rafId) {
    cancelAnimationFrame(scrub.rafId);
    scrub.rafId = 0;
  }
}

function setPlayLabel(playing) {
  // The label swap (Play/Pause) IS the state for AT; no aria-pressed, which on a
  // label-swapping control announces a contradictory "Pause, pressed" while playing.
  scrubPlayBtn.textContent = playing ? "Pause" : "Play";
}

function buildStrip(events) {
  chronicleStrip.replaceChildren();
  const rows = [];
  for (const e of events) {
    const li = document.createElement("li");
    const year = document.createElement("span");
    year.className = "cr-year";
    year.textContent = String(e.year);
    const text = document.createElement("span");
    text.className = "cr-text";
    text.textContent = e.text; // textContent: event prose is plain text
    li.append(year, text);
    chronicleStrip.appendChild(li);
    rows.push({ li, year: e.year });
  }
  return rows;
}

// Paint one frame: the year readout, the slider thumb, each settlement glyph's
// visibility, the roads, and which chronicle rows have come to pass. Setting
// .value here does NOT fire the slider's input event, so Play never trips the
// manual-scrub handler.
function paintScrub(year) {
  if (!scrub) return;
  scrub.year = year;
  scrubRangeEl.value = String(year);
  // Year on the slider's aria-valuetext (like the sea-level slider), NOT a live
  // region: programmatic value changes during Play stay silent, while a keyboard
  // scrub announces "year N" once per arrow press. The #scrub-year span is visual.
  scrubRangeEl.setAttribute("aria-valuetext", `year ${year}`);
  scrubYearEl.textContent = `year ${year}`;
  for (const m of scrub.marks) {
    const g = scrub.groups.get(m.idx);
    if (g) g.style.display = glyphVisibleAt(m, year) ? "" : "none";
  }
  setRoadsVisible(year >= scrub.range.max); // roads only at the present-day park
  for (const row of scrub.strip) {
    row.li.classList.toggle("past", eventIsPast(row.year, year));
  }
}

// Enter (or re-apply, after a redraw) scrub mode for the current overlay. Since
// #93 it drives the baked settlement glyphs directly, so no style/colour is needed.
export function applyScrub() {
  if (!placeOverlay || !placeOverlay.places || !placeOverlay.places.length) return;
  cancelScrubRaf();
  hidePlaceCard();
  const { places, events, presentYear } = placeOverlay;
  const overlayEl = mapDiv.querySelector(".place-overlay");
  const hits = overlayEl ? [...overlayEl.querySelectorAll(".place-hit")] : [];
  // The overlay hits stay as invisible focus targets but go inert while scrubbing
  // (the CSS scopes pointer-events off behind .scrub); the dated chronicle strip
  // below narrates the headline events (a capped subset) as readable text.
  if (overlayEl) overlayEl.classList.add("scrub");
  for (const h of hits) h.tabIndex = -1;
  // Address every baked settlement glyph by its world index (== manifest idx) so a
  // year can show/hide each one; the roads layer reveals only at the present park.
  const groups = new Map();
  const settleLayer = mapDiv.querySelector("#layer-settlements");
  if (settleLayer) {
    for (const g of settleLayer.querySelectorAll("g.settlement")) {
      groups.set(Number(g.dataset.idx), g);
    }
  }
  const range = scrubRange(places, presentYear);
  scrubRangeEl.min = String(range.min);
  scrubRangeEl.max = String(range.max);
  scrubRangeEl.step = "1";
  scrub = {
    marks: buildScrubMarks(places, events, presentYear),
    range,
    groups,
    roadsEl: mapDiv.querySelector("#layer-roads"),
    strip: buildStrip(events),
    plan: null,
    playing: false,
    rafId: 0,
    elapsed: 0,
    year: range.max,
  };
  scrubPanel.hidden = false;
  setPlayLabel(false);
  paintScrub(range.max); // park at the present: the world exactly as just drawn
}

export function exitScrub() {
  cancelScrubRaf();
  scrubPanel.hidden = true;
  const overlayEl = mapDiv.querySelector(".place-overlay");
  if (overlayEl) {
    overlayEl.classList.remove("scrub");
    for (const h of overlayEl.querySelectorAll(".place-hit")) h.removeAttribute("tabindex");
  }
  // #93: the sweep may have hidden individual glyph groups; restore the full
  // present-day chart by clearing every inline display it set (never "block": an
  // SVG <g> does not take it), plus the roads.
  const settleLayer = mapDiv.querySelector("#layer-settlements");
  if (settleLayer) for (const g of settleLayer.querySelectorAll("g.settlement")) g.style.display = "";
  const roads = mapDiv.querySelector("#layer-roads");
  if (roads) roads.style.display = "";
  scrub = null;
}

// Drop the scrub session without restoring layers: used after a redraw with the
// toggle off, where mapDiv.innerHTML already replaced the baked layers fresh.
export function clearScrub() {
  scrub = null;
}

export function pauseScrub() {
  if (!scrub) return;
  cancelScrubRaf();
  scrub.playing = false;
  setPlayLabel(false);
}

function playScrub() {
  if (!scrub) return;
  scrub.plan = buildSweepPlan(scrub.range, placeOverlay.events.map((e) => e.year));
  if (scrub.year >= scrub.range.max) scrub.elapsed = 0; // at the end: replay from the start
  const begin = performance.now() - scrub.elapsed;
  scrub.playing = true;
  setPlayLabel(true);
  const tick = (now) => {
    if (!scrub || !scrub.playing) return;
    const elapsed = now - begin;
    scrub.elapsed = elapsed;
    if (elapsed >= scrub.plan.totalMs) {
      scrub.elapsed = scrub.plan.totalMs;
      paintScrub(scrub.range.max);
      pauseScrub(); // auto-pause at the present year, button back to "Play"
      return;
    }
    paintScrub(sweepYearAt(scrub.plan, elapsed));
    scrub.rafId = requestAnimationFrame(tick);
  };
  scrub.rafId = requestAnimationFrame(tick);
}

// The Play/Pause button: toggle the sweep. No-op when not scrubbing.
export function togglePlay() {
  if (!scrub) return;
  if (scrub.playing) pauseScrub();
  else playScrub();
}

// #180: flipping the sheet snaps the scrubber to the PRESENT. The verso ghost is a Blob of
// the chart as the WORKER drew it; the scrubber mutates the baked recto (per-glyph display),
// which the <img> ghost cannot mirror. Parking at the present clears every mutation
// (glyphVisibleAt is true for all marks, setRoadsVisible(year >= max) is true), so the recto
// then IS the chart the ghost already holds: both faces agree by construction, with zero
// ghost work. It also pauses a running Play, matching voyage.js voyageSnapToRest() and the
// drag-pauses-Play idiom. paintScrub is module-private, so this is the seam that exposes the
// park. No-op when the chronicle is off.
export function scrubSnapToPresent() {
  if (!scrub) return;
  pauseScrub();
  paintScrub(scrub.range.max);
}

// A manual drag/keyboard scrub on the slider: pause Play and rebase it so the next
// Play restarts from the earliest founding, then paint the dragged year.
export function onManualScrub() {
  if (!scrub) return;
  if (scrub.playing) pauseScrub();
  scrub.elapsed = 0;
  paintScrub(Number(scrubRangeEl.value));
}
