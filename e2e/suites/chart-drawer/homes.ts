import { TABLE_STORE_KEY } from "../../../src/site/shared/table-store.ts";
import type { TableKit } from "./kit.ts";
import { DRAWN, DRESS, ONE, READ } from "./reads.ts";
import type { Read, Stored } from "./reads.ts";

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
  await sleep(400);
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
  await sleep(400);
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

export async function cd39LinkBeatsDevice(
  { evaluate, send, check, PORT, settle, STORE, atExplorer }: TableKit,
  TWO: string,
): Promise<void> {
  // Seeded on the site's own origin: about:blank has no storage to seed, so this write happens before the hop.
  await evaluate(`localStorage.setItem(${JSON.stringify(TABLE_STORE_KEY)}, ${JSON.stringify(TWO)})`);
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#${DRESS}&table=${ONE}` });
  await atExplorer();
  const arrived = await settle<Read & Stored>(
    `(() => ({ ...${READ}, stored: ${STORE} }))()`,
    (d) => d.cuttings > 0,
    "chart-drawer-link-beats-device",
    DRAWN,
  );
  check(
    "CD39 a link beats the device, and a visit does not become the reader's own: an address naming ONE sheet shows exactly that sheet over two held here, and what this browser was gathering is still untouched afterwards (#634 rulings 1 and 2, 2026-09-19)",
    arrived.cuttings === 1 && arrived.hashTable === ONE && arrived.stored === TWO,
    JSON.stringify({ cuttings: arrived.cuttings, hashTable: arrived.hashTable, stored: arrived.stored }),
  );
}

export async function cd40EmptySticks({
  evaluate,
  send,
  check,
  PORT,
  settle,
  go,
  STORE,
  atExplorer,
  openDrawer,
}: TableKit): Promise<void> {
  await go(`${DRESS}&table=${ONE}`);
  await openDrawer();
  await evaluate(`document.querySelector("#cuttings .off").click()`);
  const emptied = await settle<Read & Stored>(
    `(() => ({ ...${READ}, stored: ${STORE} }))()`,
    (d) => d.cuttings === 0,
    "chart-drawer-emptied",
  );
  // The key is read directly because a bare table alone cannot tell an ABSENT key from an empty one, and the empty
  // one is exactly what would hand the table back on the next keyless arrival.
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/${emptied.rawHash}` });
  await atExplorer();
  const still = await evaluate<Read & Stored>(`(() => ({ ...${READ}, stored: ${STORE} }))()`);
  check(
    "CD40 emptying the table STICKS: taking the last sheet off removes the device's key rather than storing an empty one, so the address that carries no table and the device that holds none agree, and a reload comes back bare instead of resurrecting the sheet (#634)",
    emptied.cuttings === 0 &&
      emptied.hashTable === null &&
      emptied.stored === null &&
      still.cuttings === 0 &&
      still.stored === null &&
      still.rawHash.indexOf("table=") === -1,
    JSON.stringify({
      emptied: { cuttings: emptied.cuttings, hashTable: emptied.hashTable, stored: emptied.stored },
      still: { cuttings: still.cuttings, stored: still.stored, hash: still.rawHash },
    }),
  );
}

export async function cd41CachedReturn({
  evaluate,
  check,
  sleep,
  go,
  STORE,
  restedAtExplorer,
}: TableKit): Promise<void> {
  // The road the first draft of this fix BROKE, and which nothing here could reach: every other Back check files a sheet on the Prospect page first, so the device is never empty at a restore. A reader whose storage is blocked, and anyone who opened a folio someone shared with them, comes back to exactly this: sheets in the address, none on the device. The first draft emptied the drawer and then wrote an address with no table key at all, losing them from both homes in one gesture (the cold review on PR #635).
  await go(`${DRESS}&table=${ONE}`);
  await evaluate(`window.__cd634 = "bare"`);
  const before = await evaluate<Read & Stored>(`(() => ({ ...${READ}, stored: ${STORE} }))()`);
  // Any same-origin page away and back makes the entry: the claim is about the RESTORE, and the Prospect page's own
  // plate render would buy nothing here and cost the lane a real worker job. The FAQ is the cheapest door out.
  await evaluate(`location.href = "/faq/"`);
  for (let i = 0; i < 200; i++) {
    await sleep(50);
    if (await evaluate<boolean>(`location.pathname === "/faq/" && document.readyState === "complete"`)) break;
  }
  await evaluate(`history.back()`);
  const home = await restedAtExplorer();
  check(
    "CD41 a cached return with NOTHING on the device keeps the table the ADDRESS is carrying: the reader whose storage is blocked, and the reader who opened a folio someone shared, meet this road and the restore must leave them exactly where they were (#634, the cold review's finding on PR #635)",
    before.cuttings === 1 &&
      before.stored === null &&
      home.marker === "bare" &&
      home.cuttings === 1 &&
      home.hashTable === ONE &&
      home.stored === null,
    JSON.stringify({
      before: { cuttings: before.cuttings, stored: before.stored },
      home: { marker: home.marker, cuttings: home.cuttings, hashTable: home.hashTable, stored: home.stored },
    }),
  );

  // The cell where two of the rulings collide, RULED on 2026-09-19 and pinned so nobody restores the other reading on
  // finding it surprising: a traversal into a page carrying someone ELSE'S folio takes the device's table, and rewrites
  // that page's address with it. The fixture is a device holding sheets the address names none of, which is what tells
  // the ruling from the rejected alternative; CD41's own leg above cannot, since its device is empty. It reuses this
  // Explorer rather than booting another, because a second boot would cost the lane seconds and prove nothing more.
  // DISJOINT from ONE, which the address is still carrying: TWO would not do, since it contains ONE and is therefore
  // the stale-snapshot shape that the rejected alternative answers the same way.
  const OTHERS = [
    "k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-1.lx-4.ly-4",
    "k-p.seed-42.style-antique.i-3.year-1059",
  ].join("_");
  await evaluate(`localStorage.setItem(${JSON.stringify(TABLE_STORE_KEY)}, ${JSON.stringify(OTHERS)})`);
  await evaluate(`location.href = "/faq/"`);
  for (let i = 0; i < 200; i++) {
    await sleep(50);
    if (await evaluate<boolean>(`location.pathname === "/faq/" && document.readyState === "complete"`)) break;
  }
  await evaluate(`history.back()`);
  const theirs = await restedAtExplorer();
  check(
    "CD42 a traversal into a page carrying someone ELSE'S folio takes what this device holds, and rewrites that page's address with it: ruling 1 read literally, which narrows ruling 2's 'exactly as sent' to an arrival by link (ruled 2026-09-19, with the cost that the sender's link leaves that tab)",
    theirs.marker === "bare" &&
      theirs.cuttings === 2 &&
      theirs.stored === OTHERS &&
      theirs.hashTable === OTHERS &&
      OTHERS.split("_").every((sheet) => ONE.indexOf(sheet) === -1),
    JSON.stringify({
      marker: theirs.marker,
      cuttings: theirs.cuttings,
      hashTable: theirs.hashTable,
      stored: theirs.stored,
    }),
  );
}
