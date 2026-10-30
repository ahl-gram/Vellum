// Issue #1104 round: can one deepest-band window hold a capital and a seat, or either beside a town? The nearest pairs over a run of seeds, in world grid cells, against the band-5 window's width, height and diagonal.
// usage: node out/1104/measure/seat-spacing.ts <fromSeed> <toSeed>
import { defaultRecipe, generateWorld } from "../../../src/world/generate.ts";
import { LOD_BANDS } from "../../../src/world/lod.ts";

const from = Number(process.argv[2] ?? 1);
const to = Number(process.argv[3] ?? 150);
const size = LOD_BANDS[5]!.sizeUV;
let best = { seatSeat: Infinity, bigTown: Infinity, bigVillage: Infinity };
const wCellsMax = size * 319;
const hCellsMax = size * 239;
let townPairsThatFit = 0;
const where: Record<string, string> = {};
for (let seed = from; seed <= to; seed++) {
  const w = generateWorld(defaultRecipe(seed));
  const big = w.settlements.map((s, i) => ({ s, i })).filter(({ s, i }) => s.kind === "capital" || w.realms.seats.includes(i));
  const d = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);
  for (let a = 0; a < big.length; a++)
    for (let b = a + 1; b < big.length; b++) {
      const dd = d(big[a]!.s, big[b]!.s);
      if (dd < best.seatSeat) {
        best = { ...best, seatSeat: dd };
        where["seatSeat"] = `seed ${seed}: ${big[a]!.s.name} and ${big[b]!.s.name}`;
      }
    }
  for (const { s: bs } of big)
    w.settlements.forEach((s, i) => {
      if (big.some((x) => x.i === i)) return;
      const dd = d(bs, s);
      if (s.kind === "town" && Math.abs(bs.x - s.x) < wCellsMax && Math.abs(bs.y - s.y) < hCellsMax) {
        townPairsThatFit++;
        console.error(`fits: seed ${seed} ${bs.name} (${bs.x},${bs.y}) and ${s.name} (${s.x},${s.y})`);
      }
      if (s.kind === "town" && dd < best.bigTown) {
        best = { ...best, bigTown: dd };
        where["bigTown"] = `seed ${seed}: ${bs.name} and ${s.name}`;
      }
      if (s.kind === "village" && dd < best.bigVillage) {
        best = { ...best, bigVillage: dd };
        where["bigVillage"] = `seed ${seed}: ${bs.name} and ${s.name}`;
      }
    });
}
const wCells = size * 319;
const hCells = size * 239;
console.log(
  JSON.stringify(
    {
      seeds: `${from}..${to}`,
      band5Window: { widthCells: +wCells.toFixed(2), heightCells: +hCells.toFixed(2), diagonalCells: +Math.hypot(wCells, hCells).toFixed(2) },
      nearestCapitalOrSeatPair: { cells: +best.seatSeat.toFixed(2), where: where["seatSeat"] },
      nearestCapitalOrSeatToTown: { cells: +best.bigTown.toFixed(2), where: where["bigTown"] },
      nearestCapitalOrSeatToVillage: { cells: +best.bigVillage.toFixed(2), where: where["bigVillage"] },
      capitalOrSeatTownPairsWithinOneWindowsSpan: townPairsThatFit,
    },
    null,
    1,
  ),
);
