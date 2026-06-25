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
  classifyDistanceBand,
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

function setupHunt(world) {
  const quarry = chooseQuarry(world);
  const hunt = $("hunt");
  const svg = $("map").querySelector("svg");
  if (!quarry || !hunt || !svg) return;

  // clues: a plain antique ordered list
  const list = $("clues");
  list.replaceChildren();
  for (const c of buildClues(world, quarry)) {
    const li = document.createElement("li");
    li.textContent = c.text;
    list.appendChild(li);
  }
  hunt.hidden = false;

  const proj = createProjection(world.elev.w, world.elev.h, 1500, MARGIN);
  const diagonal = Math.hypot(world.elev.w - 1, world.elev.h - 1);
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
    $("hunt-status").textContent = fromClick
      ? `Found it in ${guesses} ${guesses === 1 ? "guess" : "guesses"}.`
      : "Already found today. Come back tomorrow for a new world.";
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
          $("hunt-status").textContent = "Copied your result to the clipboard.";
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

    let nearest = -1;
    let nd = Infinity;
    world.settlements.forEach((st, i) => {
      const d = Math.hypot(st.x - gx, st.y - gy);
      if (d < nd) {
        nd = d;
        nearest = i;
      }
    });
    if (nearest < 0) return;

    guesses++;
    if (nearest === quarry.idx) {
      recordSolve();
      win(true);
    } else {
      const ns = world.settlements[nearest];
      const dist = Math.hypot(ns.x - quarry.settlement.x, ns.y - quarry.settlement.y);
      $("hunt-status").textContent = BAND_PROSE[classifyDistanceBand(dist, diagonal)];
    }
  });
}
