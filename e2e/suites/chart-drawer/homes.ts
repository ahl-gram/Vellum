import type { Payload } from "../../types.ts";
import type { TableKit } from "./kit.ts";
import { DRAWN, DRESS, ONE, READ } from "./reads.ts";

const LAY: Payload<{ w: number; box: number[] } | null> =
  `(() => { const e = document.getElementById("pp-lay"); if (!e) return null; const b = e.getBoundingClientRect(); return { w: b.width, box: [b.x, b.y, b.width, b.height].map((n) => +n.toFixed(2)) }; })()`;
export const layPressRested = (k: Pick<TableKit, "stable">, label: string) =>
  k.stable(LAY, label, { departed: (d) => d.w > 0 });

export async function cd36GoldPress({
  evaluate,
  check,
  sleep,
  go,
  reachedExplorer,
  openDrawer,
  pressById,
}: TableKit): Promise<void> {
  await go(`${DRESS}&table=${ONE}`);
  await openDrawer();
  const road = await pressById("table-road");
  for (let i = 0; i < 200; i++) {
    await sleep(100);
    if (await evaluate<boolean>(`!!window.__vellumPortfolio`)) break;
  }
  // Wait out the folio's own drafting before pressing home. The press is not racing it, but the worker drawing a
  // region sheet is real work on this machine, and on 2026-09-19 the arrival at the other end of this press took
  // longer than its 30s poll exactly once, with nothing else in the suite slow (flake-record.md carries the row).
  // Pressing from a finished page removes the contention rather than widening a budget against it.
  for (let i = 0; i < DRAWN; i++) {
    await sleep(50);
    const s = await evaluate<number>(
      `(() => { const p = window.__vellumPortfolio ? window.__vellumPortfolio() : null; return p ? p.drawn : -1; })()`,
    );
    if (s >= 1) break;
  }
  // The HREF is the measurement, taken before the press: once the table has a second home, pressing a bare ../ ALSO lands on a populated drawer, so a check that only counted cuttings afterwards would pass for the wrong reason forever. What the address carries is the only thing that reaches a reader on another device.
  const home = await evaluate<{ href: string | null; hash: string } | null>(
    `(() => { const a = document.getElementById("pf-explorer"); return a ? { href: a.getAttribute("href"), hash: location.hash } : null; })()`,
  );
  const back = await pressById("pf-explorer");
  const arrived = await reachedExplorer();
  const landed = arrived.reached ? await evaluate(READ) : { cuttings: -1, rawHash: "", hashTable: null };
  check(
    "CD36 the Portfolio's gold press back carries the gathering AND the world it was gathered from: the road in hands over the Explorer's whole address, so the press home names the seed and the sheets rather than dropping the reader on the seed of the day with a bare table (#634 defect 1, ruled 2026-09-19)",
    road.hit &&
      back.hit &&
      arrived.reached &&
      !!home &&
      home.hash.indexOf(`table=${ONE}`) !== -1 &&
      home.hash.indexOf("seed=42") !== -1 &&
      typeof home.href === "string" &&
      home.href.indexOf(`table=${ONE}`) !== -1 &&
      home.href.indexOf("seed=42") !== -1 &&
      landed.cuttings === 1 &&
      landed.rawHash.indexOf("seed=42") !== -1 &&
      landed.hashTable === ONE,
    JSON.stringify({ road, back, home, arrived, landedHash: landed.rawHash, cuttings: landed.cuttings }),
  );
}

export async function cd37BackCached({
  evaluate,
  check,
  sleep,
  settle,
  stable,
  go,
  STORE,
  restedAtExplorer,
  pressById,
}: TableKit): Promise<void> {
  await go(`${DRESS}&table=${ONE}`);
  // Planted so the check can say WHICH road it measured: a page served from the browser's cache comes back with this
  // marker alive and runs no boot code at all, which is the road no load-time rule can reach.
  await evaluate(`window.__cd634 = "warm"`);
  await evaluate(`location.href = "/prospect/" + location.hash + "&i=0"`);
  for (let i = 0; i < 300; i++) {
    await sleep(100);
    if (await evaluate<boolean>(`!!(window.__vellumProspectState && window.__vellumProspectState())`)) break;
  }
  await layPressRested({ stable }, "CD37 the lay press shown and still on the Prospect page");
  const lay = await pressById("pp-lay");
  const filed = await settle<{ table: string | null; stored: string | null }>(
    `(() => ({ table: new URLSearchParams(location.hash.slice(1)).get("table"), stored: ${STORE} }))()`,
    (d) => typeof d.table === "string" && d.table.split("_").length === 2,
    "prospect-filed-for-back",
  );
  await evaluate(`history.back()`);
  const home = await restedAtExplorer();
  check(
    "CD37 the browser's own BACK button brings the filed prospect home: the page comes back from the browser's cache with no boot code running at all, so the drawer is re-seated from the device and the address is written back to agree (#634 defect 2, ruled 2026-09-19)",
    lay.hit &&
      filed.stored === filed.table &&
      home.marker === "warm" &&
      home.cuttings === 2 &&
      typeof home.hashTable === "string" &&
      home.hashTable.split("_").length === 2,
    JSON.stringify({
      lay,
      filedTable: filed.table,
      stored: filed.stored,
      marker: home.marker,
      cuttings: home.cuttings,
      hashTable: home.hashTable,
    }),
  );
}

export async function cd38BackRebuilt({
  evaluate,
  check,
  sleep,
  settle,
  stable,
  go,
  atExplorer,
  restedAtExplorer,
  pressById,
}: TableKit): Promise<void> {
  await go(`${DRESS}&table=${ONE}`);
  // The same road with the cache REFUSED, which is the other half and needs a deliberately artificial instrument
  // (Gate 2 item 14): desktop Chrome will not cache a page carrying an unload listener. The check asserts its own
  // premise, that the document really was re-created, so a browser that caches it anyway reds here instead of
  // quietly measuring CD37 a second time.
  await evaluate(`(() => { window.__cd634 = "cold"; window.addEventListener("unload", () => {}); })()`);
  await evaluate(`location.href = "/prospect/" + location.hash + "&i=0"`);
  for (let i = 0; i < 300; i++) {
    await sleep(100);
    if (await evaluate<boolean>(`!!(window.__vellumProspectState && window.__vellumProspectState())`)) break;
  }
  await layPressRested({ stable }, "CD38 the lay press shown and still on the Prospect page");
  await pressById("pp-lay");
  await settle<{ table: string | null }>(
    `(() => ({ table: new URLSearchParams(location.hash.slice(1)).get("table") }))()`,
    (d) => typeof d.table === "string" && d.table.split("_").length === 2,
    "prospect-filed-for-cold-back",
  );
  await evaluate(`history.back()`);
  await atExplorer();
  const home = await restedAtExplorer();
  check(
    "CD38 the same road with the browser's cache refused: the document is REBUILT and reads the stale address, so the table comes back from the device by the navigation type instead, and the sheet filed on the Prospect page survives either way (#634, both roads measured)",
    home.marker === null &&
      home.navType === "back_forward" &&
      home.cuttings === 2 &&
      typeof home.hashTable === "string" &&
      home.hashTable.split("_").length === 2,
    JSON.stringify({ marker: home.marker, navType: home.navType, cuttings: home.cuttings, hashTable: home.hashTable }),
  );
}
