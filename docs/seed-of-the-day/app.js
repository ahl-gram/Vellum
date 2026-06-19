// Seed-of-the-day controller. Draws today's world client-side: today's UTC date
// is the seed, so the page is purely static yet shows a fresh world each day
// (no rebuild needed). Reuses the same browser engine as the Explorer; one
// render, run inline on the main thread.
import { defaultRecipe, generateWorld } from "../explorer/engine/world/generate.js";
import { renderMap } from "../explorer/engine/render/map-renderer.js";
import { seedForDate } from "../explorer/engine/world/seed-of-the-day.js";
import { createRng } from "../explorer/engine/core/rng.js";
import { createLoreWriter } from "../explorer/engine/society/lore.js";

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
  } catch (err) {
    $("status").textContent = "The cartographer spilled the ink: " + err.message;
  }
}, 0);
