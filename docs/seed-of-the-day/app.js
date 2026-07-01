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

// Defer one macrotask so the "Drafting…" status paints before the main thread
// blocks on the render.
setTimeout(() => {
  try {
    const world = generateWorld(defaultRecipe(seed));
    $("map").innerHTML = renderMap(world, { style: "antique", legend: true });
    $("caption").textContent = world.title.title;
    $("survey").textContent = world.title.subtitle;

    const capital =
      world.settlements.find((s) => s.kind === "capital") ?? world.settlements[0];
    if (capital) {
      const lore = createLoreWriter(world, createRng(seed).fork("seed-of-the-day"));
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
// mobile bar, so the latest feedback stays in view without scrolling.
function setHuntStatus(text) {
  $("hunt-status").textContent = text;
  const sticky = $("hunt-sticky");
  if (!sticky) return;
  sticky.textContent = text;
  sticky.classList.toggle("active", text.length > 0);
  sticky.hidden = text.length === 0;
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
  for (const c of pruneUnlabeledFeatureClues(buildClues(world, quarry), isLabeled)) {
    const li = document.createElement("li");
    li.textContent = c.text;
    list.appendChild(li);
  }
  hunt.hidden = false;

  let guesses = 0;

  const placeStar = () => {
    if ($("map").querySelector(".hunt-star")) return;
    const star = document.createElement("div");
    star.className = "hunt-star";
    star.textContent = "★";
    star.style.left = `${(proj.px(quarry.settlement.x) / proj.widthPx) * 100}%`;
    star.style.top = `${(proj.py(quarry.settlement.y) / proj.heightPx) * 100}%`;
    $("map").appendChild(star);
  };

  const showReveal = () => {
    const r = revealLore(world, quarry);
    const reveal = $("reveal");
    reveal.replaceChildren();
    const head = document.createElement("strong");
    head.textContent = `${r.name}, founded in the year ${r.founded}.`;
    const body = document.createElement("p");
    body.textContent = r.line;
    reveal.append(head, body);
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
    placeStar();
    showReveal();
    $("share").hidden = false;
    setHuntStatus(
      fromClick
        ? `Found it in ${guesses} ${guesses === 1 ? "guess" : "guesses"}.`
        : "Already found today. Come back tomorrow for a new world.",
    );
    updateStreak();
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
      // Continuous heat (from the click's own distance to the quarry) plus the
      // name of the mark the click selected, so a cluster of identical village
      // glyphs no longer reads as an indistinguishable dead-end.
      const tail = feedback.pickedName ? ` The nearest mark is ${feedback.pickedName}.` : "";
      setHuntStatus(`${BAND_PROSE[feedback.band]}${tail}`);
    }
  });
}
