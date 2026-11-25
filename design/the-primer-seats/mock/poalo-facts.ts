// Issue #1248 round: what seed 42 says about each place a home station's where-line names (Poalo first), so a caption or a where-line states only what the world holds. Reads the world through `defaultRecipe` then `generateWorld`, the one way to build it.
import { defaultRecipe, generateWorld } from "../../../src/world/generate.ts";

const w = generateWorld(defaultRecipe(42));
const gw = w.elev.w;
const realmOf = (x: number, y: number): string => {
  const id = w.realms.labels[Math.round(y) * gw + Math.round(x)] ?? -1;
  return id >= 0 ? (w.names.realms[id] ?? `realm ${id}`) : "no realm";
};
const names = process.argv.slice(2);
for (const s of w.settlements) {
  if (names.length > 0 && !names.includes(s.name)) continue;
  console.log(JSON.stringify({ name: s.name, kind: s.kind, harbor: s.harbor, onRiver: s.onRiver, realm: realmOf(s.x, s.y), x: s.x, y: s.y, gridW: gw, gridH: w.elev.h }));
}
console.log(JSON.stringify({ title: w.title.title, realms: w.names.realms, settlements: w.settlements.length }));
