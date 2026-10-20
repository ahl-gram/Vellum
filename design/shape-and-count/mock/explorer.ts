// Issue #849: the Explorer mock. It photographs the LIVE built Explorer (the tree's dist/, built by `npm run build` at
// 581a6de3) with a shot script that seats the proposed rows in the Broadside's Land panel, so the rows wear the live
// kit's sheets and the room's script-placed chrome exactly as a build would; the rows' own dress is one small sheet,
// land-mock.css, the stand-in for what Sub 6 adds to `src/styles/explorer/broadside.css`. EVERY WORD on the rows is a
// stand-in for the sitting to name. The chart behind each shot is the live engine's draw of that seed, which cannot draw
// a shape or a count yet: the shaped and counted worlds are the round's contact sheets.
// Run from the tree: node out/844/mock/explorer.ts, then shoot explorer-shots.json with --site <tree>/dist.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const OUT = "/Users/ahl/CodeProjects/Vellum/out/844/explorer";
const HERE = new URL("./", import.meta.url).pathname;
// The room's width: measured from the live page (explorer/width-sweep-result.json). The slip and the Land panel are 384 and 331 px wide at every width from 1024 to 2560 and nothing caps the page; the chart sheet stops growing at 1440 for a 900-tall window, so 1440 is the widest width at which the room still changes its layout.
export const ROOM_WIDTHS = [1024, 1440] as const;

const css = readFileSync(`${HERE}explorer/land-mock.css`, "utf8");
const rows = readFileSync(`${HERE}explorer/land-rows.html`, "utf8");

type State = { key: string; hash: string; title: string; shape: string; isles: number | null; size: "alike" | "every"; stood: boolean; typeNote: string | null };
const STATES: ReadonlyArray<State> = [
  { key: "a-plain", hash: "seed=30&type=island", title: "A plain world: the new rows at rest, every slider live", shape: "", isles: null, size: "alike", stood: false, typeNote: null },
  { key: "b-shaped", hash: "seed=30&type=island", title: "A shaped world: Texas picked, the sliders still live (the coast wobbles the outline)", shape: "texas", isles: null, size: "alike", stood: false, typeNote: null },
  { key: "c-counted", hash: "seed=1&type=archipelago", title: "A counted archipelago: about 20 islands, the sea level and the coast stood down", shape: "", isles: 20, size: "alike", stood: true, typeNote: null },
  { key: "d-counted-continent", hash: "seed=5&type=continent", title: "A count on a continent (D14): the islands row shows on every type, with the type's measured meaning", shape: "", isles: 100, size: "every", stood: true, typeNote: "on a continent: one great land, and islets for the rest" },
];

function script(s: State): string {
  const payload = JSON.stringify({ css, rows, shape: s.shape, isles: s.isles, size: s.size, stood: s.stood, typeNote: s.typeNote });
  return `(() => {
  const p = ${payload};
  const style = document.createElement("style");
  style.textContent = p.css;
  document.head.appendChild(style);
  const ledger = document.querySelector("[aria-labelledby=grp-land] .ledger");
  const bandCtl = document.getElementById("band").closest(".l-ctl");
  const holder = document.createElement("template");
  holder.innerHTML = p.rows;
  bandCtl.after(holder.content);
  document.getElementById("shape").value = p.shape;
  const isles = document.getElementById("isles");
  const readout = document.getElementById("isles-readout");
  if (p.isles === null) { isles.value = "8"; isles.classList.add("untouched"); readout.textContent = "seed's choice"; }
  else { isles.value = String(p.isles); readout.textContent = "about " + p.isles; }
  document.getElementById(p.size === "alike" ? "isle-alike" : "isle-every").checked = true;
  if (p.typeNote) { const n = document.getElementById("isles-note"); n.textContent = p.typeNote; n.hidden = false; }
  if (p.stood) {
    const land = document.getElementById("land");
    const first = land.previousElementSibling.previousElementSibling;
    const box = document.createElement("div");
    box.className = "stood";
    box.setAttribute("role", "group");
    box.setAttribute("aria-label", "held by the count");
    const parts = [];
    for (let el = first; el; el = el.nextElementSibling) parts.push(el);
    for (const el of parts) box.appendChild(el);
    const note = document.createElement("span");
    note.className = "stood-note";
    note.textContent = "the count holds the sea and the shore; set the islands back to the seed's choice to free them";
    box.appendChild(note);
    ledger.appendChild(box);
    document.getElementById("land-readout").textContent = "held";
    document.getElementById("coast-readout").textContent = "held";
  }
  return "seated";
})()`;
}

const PROBE = `(() => { const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; }; const slip = document.getElementById("broadside"); const scroller = slip && (slip.querySelector(".slip-body") || slip); return JSON.stringify({ scrollWidth: document.documentElement.scrollWidth, slip: r(slip), land: r(document.querySelector("[aria-labelledby=grp-land]")), isles: r(document.getElementById("isles")), landRange: r(document.getElementById("land")), coastRange: r(document.getElementById("coast")), stood: r(document.querySelector(".stood")), slipScroll: scroller ? [scroller.scrollHeight, scroller.clientHeight] : null, shapeFont: document.getElementById("shape") ? getComputedStyle(document.getElementById("shape")).fontSize : null, typeFont: getComputedStyle(document.getElementById("type")).fontSize, drawerTab: r(document.getElementById("chart-drawer-tab")), folioTitle: r(document.querySelector(".folio-title, .chart-folio h2, .chart-folio .folio-title")) }); })()`;

type Shot = { url: string; width: number; height: number; mobile: false; out: string; waitMs: number; script: string; scriptWaitMs: number; probe: string; clip?: { x: number; y: number; width: number; height: number; scale: number } };
const shots: Shot[] = [];
for (const s of STATES) {
  for (const w of ROOM_WIDTHS) {
    shots.push({ url: `/explorer/#${s.hash}`, width: w, height: 900, mobile: false, out: `${OUT}/explorer-${s.key}-${w}.png`, waitMs: 5000, script: script(s), scriptWaitMs: 800, probe: PROBE });
  }
  // 2x crop of the slip at 1024: its rect is read from the width sweep (x 608, y 147, 384 wide) and the panel grows downward.
  shots.push({ url: `/explorer/#${s.hash}`, width: 1024, height: 900, mobile: false, out: `${OUT}/explorer-${s.key}-land-crop2x.png`, waitMs: 5000, script: script(s), scriptWaitMs: 800, probe: PROBE, clip: { x: 600, y: 240, width: 400, height: 420, scale: 2 } });
}
// The desk frame's window (1024 by 768, `handbook/specs/ui-design.md`), for the tallest panel.
shots.push({ url: `/explorer/#${STATES[3]!.hash}`, width: 1024, height: 768, mobile: false, out: `${OUT}/explorer-d-counted-continent-1024x768.png`, waitMs: 5000, script: script(STATES[3]!), scriptWaitMs: 800, probe: PROBE });
// The controls: today's live page with nothing seated, for the slip's height and scroll at both window heights.
for (const [w, h] of [[1024, 900], [1024, 768]] as const) shots.push({ url: `/explorer/#${STATES[3]!.hash}`, width: w, height: h, mobile: false, out: `${OUT}/explorer-control-today-${w}x${h}.png`, waitMs: 5000, script: "\"nothing seated\"", scriptWaitMs: 0, probe: PROBE });
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/explorer-shots.json`, JSON.stringify(shots, null, 1));
writeFileSync(`${OUT}/states.json`, JSON.stringify(STATES, null, 1));
console.log(`${shots.length} shots in ${OUT}/explorer-shots.json`);
