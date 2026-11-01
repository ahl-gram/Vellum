import { foundWorld } from "../../../src/world/founding/found.ts";
import { HELD_NOTES, LAND_ROWS, WRITE_ANEW, seatOf } from "../../../src/site/explorer/land-rows.ts";
import { writtenHash } from "../../../src/site/shared/written-address.ts";
import { sendKey } from "../../support/home.ts";
import { makeSettle } from "../../support/settle.ts";
import type { WritingKit } from "./kit.ts";

const FLAGSHIP = "a cold archipelago of black pines, iron harbors, and a drowned kingdom";
const TEXAS = "tropical island in the shape of Texas";
const TEXAS_ID = "ne-1159315211";
const POLLS = 300;

type Chart = {
  readonly seed: string | null;
  readonly culture: string | null;
  readonly text: string | null;
  readonly style: string | null;
  readonly outline: string | null;
  readonly hash: Record<string, string>;
};

const EXPLORER_CHART = "#map > svg[data-vellum-style]";
const EXPLORER_SETTLED = `(!!document.getElementById("status") && document.getElementById("status").textContent === "" && !!document.getElementById("verso-turn") && !document.getElementById("verso-turn").disabled && !!document.querySelector("#map svg"))`;

const chartRead = (selector: string): string =>
  `(() => { const svg = document.querySelector(${JSON.stringify(selector)}); const a = (n) => (svg ? svg.getAttribute(n) : null); return { seed: a("data-vellum-seed"), culture: a("data-vellum-culture"), text: a("data-vellum-founding-text"), style: a("data-vellum-style"), outline: a("data-vellum-outline"), hash: Object.fromEntries(new URLSearchParams(location.hash.slice(1))) }; })()`;

const founded = (sentence: string) => {
  const f = foundWorld(sentence);
  if (!f.ok) throw new Error(`${sentence} did not found in Node`);
  return f;
};

function carryKit(k: WritingKit) {
  const settle = makeSettle({ evaluate: k.evaluate, sleep: k.sleep, tolerant: true });
  const until = async (expression: string, label: string): Promise<void> => {
    await settle<boolean>(`(${expression}) === true`, (d) => d, label, POLLS);
  };
  const visit = async (path: string): Promise<void> => {
    await k.send("Page.navigate", { url: "about:blank" });
    await k.send("Page.navigate", { url: `http://127.0.0.1:${k.PORT}${path}` });
  };
  const explorer = async (hash: string): Promise<void> => {
    await visit("/explorer/" + hash);
    await until(EXPLORER_SETTLED, `the Explorer settled at ${hash}`);
  };
  const press = async (x: number, y: number): Promise<void> => {
    await k.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", buttons: 1, clickCount: 1 });
    await k.send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x,
      y,
      button: "left",
      buttons: 0,
      clickCount: 1,
    });
  };
  return { settle, until, visit, explorer, press };
}

const IDENTITY = ["seed", "type", "band", "land", "coast", "outline", "looseness", "islands", "isleSize", "raggedness"];

function carriesFlagship(r: Chart): boolean {
  const f = founded(FLAGSHIP);
  return (
    r.seed === String(f.seed) &&
    r.culture === f.overrides.culture &&
    r.text === FLAGSHIP &&
    r.style === "ink" &&
    r.hash["found"] === FLAGSHIP &&
    r.hash["v"] === "1" &&
    r.hash["style"] === "ink" &&
    IDENTITY.every((key) => !(key in r.hash))
  );
}

export async function wr9Explorer(k: WritingKit): Promise<void> {
  const { explorer, until, settle } = carryKit(k);
  await explorer(writtenHash(FLAGSHIP, 1) + "&style=ink");
  const first = await k.evaluate<Chart>(chartRead(EXPLORER_CHART));
  await k.evaluate(
    `(() => { const l = document.getElementById("legend"); l.checked = !l.checked; l.dispatchEvent(new Event("change", { bubbles: true })); return true; })()`,
  );
  await until(
    `${EXPLORER_SETTLED} && new URLSearchParams(location.hash.slice(1)).get("legend") === "0"`,
    "the Explorer's redraw after the legend toggle",
  );
  const toggled = await k.evaluate<Chart>(chartRead(EXPLORER_CHART));
  await explorer(writtenHash(TEXAS, 1));
  const texas = await k.evaluate<Chart>(chartRead(EXPLORER_CHART));
  const place = await settle<string>(
    `document.getElementById("place").value`,
    (d, last) => d !== "" && d === last,
    "the shape box to name the founded place",
    POLLS,
  );
  k.check(
    "WR9 a written link opens the Explorer on its world beside the dress it carries, keeps the sentence in the Explorer's address through a dress change, and a sentence asking for a real place's shape draws the place",
    carriesFlagship(first) &&
      carriesFlagship(toggled) &&
      first.hash["legend"] === "1" &&
      toggled.hash["legend"] === "0" &&
      texas.outline === TEXAS_ID &&
      place === "Texas",
    `${JSON.stringify(first)} then ${JSON.stringify(toggled)}; Texas ${texas.outline} place "${place}"`,
  );
}

type Held = {
  readonly shown: boolean;
  readonly note: string;
  readonly state: Record<string, string>;
  readonly road: boolean;
  readonly bandHeld: boolean;
};

const HELD_READ = `(() => {
  const ledger = document.querySelector('[aria-labelledby="grp-land"] .ledger'), box = document.getElementById("land-held");
  const state = {};
  for (const row of ${JSON.stringify(LAND_ROWS)}) {
    const r = ledger.querySelector('.l-row[data-row="' + row + '"]');
    const shown = !!r && !!r.firstElementChild && r.firstElementChild.getClientRects().length > 0;
    state[row] = !shown ? "hidden" : box.contains(r) ? "held" : "live";
  }
  return { shown: box.getClientRects().length > 0, note: document.getElementById("land-held-note").textContent, state, road: !!document.getElementById("land-held-road"), bandHeld: !!document.getElementById("band").closest(".held") };
})()`;

export async function wr10Hold(k: WritingKit): Promise<void> {
  const { explorer, until } = carryKit(k);
  await explorer(writtenHash(FLAGSHIP, 1));
  const held = await k.evaluate<Held>(HELD_READ);
  const wanted = seatOf("archipelago", {}, { sentence: FLAGSHIP, version: 1 }).rows;
  const refused = await k.evaluate<{ band: string; status: string }>(
    `(() => { const b = document.getElementById("band"); b.value = "tropical"; b.dispatchEvent(new Event("change", { bubbles: true })); return { band: b.value, status: document.getElementById("status").textContent }; })()`,
  );
  const stood = await k.evaluate<{ band: string | null; text: string | null }>(
    `(() => { const svg = document.querySelector(${JSON.stringify(EXPLORER_CHART)}); return { band: svg.getAttribute("data-vellum-band"), text: svg.getAttribute("data-vellum-founding-text") }; })()`,
  );
  await k.evaluate(
    `(() => { const s = document.getElementById("seed"); s.value = "42"; s.focus(); return document.activeElement === s; })()`,
  );
  await sendKey(k.send, "Enter", "Enter", 13);
  await until(
    `${EXPLORER_SETTLED} && document.querySelector(${JSON.stringify(EXPLORER_CHART)}).getAttribute("data-vellum-seed") === "42" && new URLSearchParams(location.hash.slice(1)).get("seed") === "42"`,
    "the Explorer's draw of chart number 42",
  );
  const released = await k.evaluate<Chart>(chartRead(EXPLORER_CHART));
  const freed = await k.evaluate<Held>(HELD_READ);
  const sameRows = LAND_ROWS.every((row) => held.state[row] === wanted[row]);
  k.check(
    "WR10 a written world holds the Explorer's Land panel under the sentence's note and refuses a climate change, and a new chart number lets it go with its settings",
    held.shown &&
      held.note === `${HELD_NOTES.written} ${WRITE_ANEW}` &&
      held.road &&
      sameRows &&
      refused.band === "polar" &&
      refused.status === "" &&
      stood.band === "polar" &&
      stood.text === FLAGSHIP &&
      released.seed === "42" &&
      released.culture === null &&
      released.text === null &&
      released.hash["seed"] === "42" &&
      released.hash["type"] === "archipelago" &&
      released.hash["band"] === "polar" &&
      !("found" in released.hash) &&
      !freed.bandHeld &&
      !freed.road,
    `${JSON.stringify(held)} refused ${JSON.stringify(refused)} stood ${JSON.stringify(stood)}; released ${JSON.stringify(released)} then ${JSON.stringify(freed)}`,
  );
}

const ROAD_READ = `(() => { const a = document.getElementById("land-held-road"); if (!a) return null; const r = a.getClientRects()[0]; const x = r.left + r.width / 2, y = r.top + r.height / 2; const top = document.elementFromPoint(x, y); return { href: a.getAttribute("href"), text: a.textContent, x, y, hit: !!top && (top === a || a.contains(top)) }; })()`;

export async function wr14Road(k: WritingKit): Promise<void> {
  const { explorer, until, press } = carryKit(k);
  await explorer(writtenHash(FLAGSHIP, 1));
  const road = await k.evaluate<{ href: string; text: string; x: number; y: number; hit: boolean } | null>(ROAD_READ);
  if (road === null) {
    k.check("WR14 the held note's closing words are the road back to the Writing Room", false, "no #land-held-road");
    return;
  }
  await press(road.x, road.y);
  await until(
    `location.pathname === "/writing-room/" && !!window.__vellumWritingRoom && window.__vellumWritingRoom().n >= 1`,
    "the Writing Room after the road",
  );
  const room = await k.evaluate<{ line: string; seed: string | null }>(
    `({ line: document.getElementById("wr-line").value, seed: (document.querySelector("#map svg") || { getAttribute: () => null }).getAttribute("data-vellum-seed") })`,
  );
  k.check(
    "WR14 the held note's closing words are the road back to the Writing Room, and pressing them opens the room with the sentence in its line",
    road.href === "/writing-room/" + writtenHash(FLAGSHIP, 1) &&
      road.text === WRITE_ANEW &&
      road.hit &&
      room.line === FLAGSHIP &&
      room.seed === String(founded(FLAGSHIP).seed),
    `${JSON.stringify(road)} then ${JSON.stringify(room)}`,
  );
}
