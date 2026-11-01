import { foundWorld } from "../../../src/world/founding/found.ts";
import { HELD_NOTES, LAND_ROWS, WRITE_ANEW, seatOf } from "../../../src/site/explorer/land-rows.ts";
import { recipeOverrides } from "../../../src/site/shared/founding.ts";
import { SHAPE_KEYS } from "../../../src/site/shared/shape-address.ts";
import { writtenHash } from "../../../src/site/shared/written-address.ts";
import { SEAT, holdFaults } from "../broadside/shape.ts";
import { sendKey } from "../../support/home.ts";
import { CHART_SVG } from "../../support/room.ts";
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

const IDENTITY = ["seed", "type", "band", "land", "coast", ...SHAPE_KEYS];

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

type Held = { readonly shown: boolean; readonly road: string | null; readonly bandHeld: boolean };

const HELD_READ = `(() => {
  const a = document.getElementById("land-held-road"), n = a && a.closest(".held-note");
  return { shown: document.getElementById("land-held").getClientRects().length > 0, road: a ? (n ? n.id : "") : null, bandHeld: !!document.getElementById("band").closest(".held") };
})()`;

export async function wr10Hold(k: WritingKit): Promise<void> {
  const { explorer, until } = carryKit(k);
  await explorer(writtenHash(FLAGSHIP, 1));
  const held = await k.evaluate<Held>(HELD_READ);
  const seat = await k.evaluate(SEAT);
  const wanted = seatOf("archipelago", {}, { sentence: FLAGSHIP, version: 1 }).rows;
  const refused = await k.evaluate<{ band: string; type: string; status: string }>(
    `(() => { const b = document.getElementById("band"), t = document.getElementById("type"); b.value = "tropical"; b.dispatchEvent(new Event("change", { bubbles: true })); t.value = "island"; t.dispatchEvent(new Event("change", { bubbles: true })); return { band: b.value, type: t.value, status: document.getElementById("status").textContent }; })()`,
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
  const sameRows = LAND_ROWS.every((row) => seat.state[row] === wanted[row]);
  k.check(
    "WR10 a written world holds the Explorer's Land and Strand under the sentence's note, which stands once, under the Strand's box, and refuses a change of its type or its climate, and a new chart number lets it go with its settings",
    held.shown &&
      seat.notes.land === "" &&
      seat.notes.strand === `${HELD_NOTES.written} ${WRITE_ANEW}` &&
      held.road === "strand-held-note" &&
      holdFaults(seat).length === 0 &&
      sameRows &&
      refused.band === "polar" &&
      refused.type === "archipelago" &&
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
      freed.road === null,
    `${JSON.stringify({ held, seat })} refused ${JSON.stringify(refused)} stood ${JSON.stringify(stood)}; released ${JSON.stringify(released)} then ${JSON.stringify(freed)}`,
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

type Place = { readonly value: string; readonly held: boolean; readonly status: string };

const PLACE_READ = `(() => { const b = document.getElementById("place"); return { value: b.value, held: !!b.closest(".held"), status: document.getElementById("status").textContent }; })()`;

export async function wr15PlaceHeld(k: WritingKit): Promise<void> {
  const { explorer, settle } = carryKit(k);
  await explorer(writtenHash(TEXAS, 1));
  const named = await settle<string>(
    `document.getElementById("place").value`,
    (d, last) => d !== "" && d === last,
    "the shape box to name the founded place",
    POLLS,
  );
  await k.evaluate(
    `(() => { const b = document.getElementById("place"); b.focus(); return document.activeElement === b; })()`,
  );
  await k.send("Input.insertText", { text: "x" });
  const typed = await k.evaluate<Place>(PLACE_READ);
  await sendKey(k.send, "Enter", "Enter", 13);
  const entered = await k.evaluate<Place>(PLACE_READ);
  // Emptied by script: it stands for a box focused before the first draw named its place, a window no natural gesture reaches on demand.
  await k.evaluate(`(() => { document.getElementById("place").value = ""; return true; })()`);
  await sendKey(k.send, "Enter", "Enter", 13);
  const emptied = await k.evaluate<Place>(PLACE_READ);
  k.check(
    "WR15 a written world's held shape box names its place and keeps it through a refused keystroke, and Enter in it neither clears the place nor starts a draw, even with the box emptied",
    named === "Texas" &&
      typed.held &&
      typed.value === "Texas" &&
      entered.value === "Texas" &&
      entered.status === "" &&
      emptied.value === "Texas" &&
      emptied.status === "",
    `named "${named}"; typed ${JSON.stringify(typed)}; Enter ${JSON.stringify(entered)}; emptied, then Enter ${JSON.stringify(emptied)}`,
  );
}

const PRINT_SETTLED = (seed: number): string =>
  `(typeof window.__vellumPrintRoomState === "function" && document.getElementById("pr-status").textContent === "" && !!document.querySelector("#pr-preview svg") && window.__vellumPrintRoomState().seed === ${seed})`;
const READING_SETTLED = `(typeof window.__vellumReadingRoomUsesWorker === "function" && !!document.querySelector(${JSON.stringify(CHART_SVG)}) && (document.querySelector(".rf-status") || {}).textContent === "")`;

export async function wr11PrintRoom(k: WritingKit): Promise<void> {
  const { visit, until } = carryKit(k);
  const f = founded(FLAGSHIP);
  await visit("/print-room/" + writtenHash(FLAGSHIP, 1) + "&style=ink");
  await until(PRINT_SETTLED(f.seed), "the Print Room's proof of the written world");
  const chart = await k.evaluate<Chart>(chartRead("#pr-preview svg"));
  const road = await k.evaluate<string | null>(`document.getElementById("pr-explorer").getAttribute("href")`);
  const wantRoad =
    "../explorer/#" +
    new URLSearchParams([
      ["found", FLAGSHIP],
      ["v", "1"],
      ["style", "ink"],
      ["legend", "1"],
      ["arms", "0"],
      ["beasts", "0"],
    ]).toString();
  k.check(
    "WR11 the Print Room presses a written world, beside its dress, and its road back carries the sentence",
    chart.seed === String(f.seed) &&
      chart.culture === f.overrides.culture &&
      chart.text === FLAGSHIP &&
      chart.style === "ink" &&
      chart.hash["found"] === FLAGSHIP &&
      chart.hash["v"] === "1" &&
      chart.hash["style"] === "ink" &&
      !("seed" in chart.hash) &&
      road === wantRoad,
    `${JSON.stringify(chart)} road ${road}`,
  );
}

export async function wr12ReadingRoom(k: WritingKit): Promise<void> {
  const { visit, until } = carryKit(k);
  const f = founded(FLAGSHIP);
  await visit("/reading-room/" + writtenHash(FLAGSHIP, 1));
  await until(READING_SETTLED, "the Reading Room's telling of the written world");
  const chart = await k.evaluate<Chart>(chartRead(CHART_SVG));
  k.check(
    "WR12 the Reading Room tells a written world and keeps its sentence in the address",
    chart.seed === String(f.seed) &&
      chart.culture === f.overrides.culture &&
      chart.text === FLAGSHIP &&
      chart.hash["found"] === FLAGSHIP &&
      chart.hash["v"] === "1" &&
      !("seed" in chart.hash),
    JSON.stringify(chart),
  );
}

type Named = { readonly index: number; readonly name: string };
type Links = { readonly hash: string; readonly road: string | null };

const MIXED = "&seed=5&type=island";

const writtenOnly = (link: string | null): boolean => {
  const p = new URLSearchParams((link ?? "").split("#")[1] ?? "");
  return p.get("found") === FLAGSHIP && IDENTITY.every((key) => !p.has(key));
};

export async function wr13Names(k: WritingKit): Promise<void> {
  const { visit, until, explorer } = carryKit(k);
  const f = founded(FLAGSHIP);
  await explorer(writtenHash(FLAGSHIP, 1));
  const names = await k.evaluate<Record<string, string>>(
    `(() => { const r = window.__vellumRunInline({ kind: "draw", seed: ${f.seed}, overrides: ${JSON.stringify(recipeOverrides(f))}, render: { style: "antique", widthPx: 1500, legend: true } }); return Object.fromEntries(r.manifest.places.map((p) => [String(p.idx), p.name])); })()`,
  );
  const ready = (state: string, status: string): string =>
    `(${state} !== null && document.getElementById(${JSON.stringify(status)}).textContent === "")`;
  await visit("/prospect/" + writtenHash(FLAGSHIP, 1) + MIXED);
  await until(
    ready(`(window.__vellumProspectState ? window.__vellumProspectState() : null)`, "pp-status"),
    "the Prospect's plate",
  );
  const plate = await k.evaluate<Named & Links>(
    `(() => { const s = window.__vellumProspectState(); return { index: s.index, name: s.name, hash: location.hash, road: document.getElementById("pp-chart-link").getAttribute("href") }; })()`,
  );
  await visit("/ribbon/" + writtenHash(FLAGSHIP, 1) + MIXED);
  await until(
    ready(`(window.__vellumRibbonState ? window.__vellumRibbonState() : null)`, "rb-status"),
    "the Ribbon's route",
  );
  const ribbon = await k.evaluate<{ from: number; to: number; fromName: string; toName: string } & Links>(
    `(() => { const s = window.__vellumRibbonState(); const pick = (id) => { const o = document.getElementById(id).selectedOptions[0]; return o ? o.textContent : null; }; return { from: s.from, to: s.to, fromName: pick("rb-from"), toName: pick("rb-to"), hash: location.hash, road: document.getElementById("rb-chart-link").getAttribute("href") }; })()`,
  );
  k.check(
    "WR13 the Prospect and the Ribbon draw a written world's places by its own names from a link that also carries a chart number and a type, and write neither key beside the sentence in their address or their road to the Explorer",
    plate.name === names[String(plate.index)] &&
      writtenOnly(plate.hash) &&
      writtenOnly(plate.road) &&
      ribbon.fromName === names[String(ribbon.from)] &&
      ribbon.toName === names[String(ribbon.to)] &&
      writtenOnly(ribbon.hash) &&
      writtenOnly(ribbon.road),
    `prospect ${JSON.stringify(plate)} against ${names[String(plate.index)]}; ribbon ${JSON.stringify(ribbon)} against ${names[String(ribbon.from)]} and ${names[String(ribbon.to)]}`,
  );
}

const CLIMATE = "Upon the frozen roof of the world the herdsmen of Vael keep their reindeer and their grudges.";
const ROAD_HREF = `document.getElementById("wr-explorer").getAttribute("href")`;

export async function wr8Road(k: WritingKit): Promise<void> {
  const { until } = carryKit(k);
  const c = founded(CLIMATE);
  await k.goto(writtenHash(FLAGSHIP, 1));
  const flagship = await k.evaluate<string | null>(ROAD_HREF);
  const opened = await k.goto(writtenHash(CLIMATE, 1));
  const onPlate = await k.evaluate<string | null>(ROAD_HREF);
  await k.pressAt("#wr-plate");
  await k.settledAfter(opened.n, "the plate lifted");
  const lifted = await k.evaluate<string | null>(ROAD_HREF);
  await k.goto(writtenHash(CLIMATE, 1));
  await k.pressAt("#wr-explorer");
  await until(`location.pathname === "/explorer/" && ${EXPLORER_SETTLED}`, "the Explorer after the road is pressed");
  const arrived = await k.evaluate<Chart & { theme: string; field: boolean }>(
    `(() => { const c = ${chartRead(EXPLORER_CHART)}; return { ...c, theme: document.getElementById("theme").value, field: !!document.querySelector("#map svg #layer-field") }; })()`,
  );
  k.check(
    "WR8 the Writing Room's road to the Explorer carries the written world, the vegetation plate with it while it is laid on, and pressing it opens the Explorer on that world",
    flagship === "../explorer/" + writtenHash(FLAGSHIP, 1) &&
      onPlate === "../explorer/" + writtenHash(CLIMATE, 1) + "&theme=vegetation" &&
      lifted === "../explorer/" + writtenHash(CLIMATE, 1) &&
      arrived.seed === String(c.seed) &&
      arrived.culture === c.overrides.culture &&
      arrived.text === CLIMATE &&
      arrived.theme === "vegetation" &&
      arrived.field,
    `${flagship} | ${onPlate} | ${lifted}; the Explorer ${JSON.stringify(arrived)}`,
  );
}
