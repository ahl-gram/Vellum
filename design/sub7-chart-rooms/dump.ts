import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { capitalBlurb } from "../../src/world/seed-of-the-day.ts";
import { createRng } from "../../src/core/rng.ts";
import { createLoreWriter } from "../../src/society/lore.ts";
import { buildClues } from "../../src/world/daily-hunt-clues.ts";
import { chooseQuarry, revealLore } from "../../src/world/daily-hunt.ts";
import { buildVoyageLog } from "../../src/world/voyage-log.ts";

const seed = 20260829;
const world = generateWorld(defaultRecipe(seed));
const capital = world.settlements.find((s) => s.kind === "capital") ?? world.settlements[0];
const lore = createLoreWriter(world, createRng(seed).fork("seed-of-the-day"));
const quarry = chooseQuarry(world)!;
const clues = buildClues(world, quarry);
const events = world.history.events;
const ports = world.settlements
  .map((s, idx) => ({ s, idx }))
  .filter(({ s }) => !s.ruined && (s.kind === "capital" || s.kind === "town" || s.kind === "seat"))
  .slice(0, 6)
  .map(({ s, idx }, i) => ({ idx, name: s.name, kind: s.kind, founded: s.founded, arrivalMode: i === 0 ? null : (i % 2 ? "sea" : "road") as any, inlandHandoff: false, legLength: i === 0 ? 0 : 40 + i * 23 }));
const log = buildVoyageLog(ports, world.history.presentYear ?? (events.at(-1)?.year ?? 0), seed, world.title.subtitle, { arrivalMode: "sea", inlandHandoff: false, legLength: 60 });
console.log(JSON.stringify({
  title: world.title,
  capital: capital.name,
  blurb: capitalBlurb(capital, lore.settlementNote(capital)),
  quarry: { name: quarry.settlement.name, kind: quarry.settlement.kind },
  reveal: revealLore(world, quarry),
  clues,
  presentYear: (world.history as any).presentYear,
  events: events.map((e) => ({ year: e.year, kind: (e as any).kind, text: (e as any).text ?? e })),
  log,
  settlements: world.settlements.slice(0, 12).map((s) => ({ name: s.name, kind: s.kind, ruined: s.ruined })),
}, null, 1));
