// The Print Room's road order (Issue #433, pull request 2): the head's second dropdown lays the road from the capital on the sheet and the four presses take its sizes; the bound atlas's road page and the head keep each other in step; a capital with no road is never offered one.
import { bounce } from "../../support/nav.ts";
import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import type { PrintRoomKit } from "./kit.ts";

const PLATE_ASPECT = 1060 / 740;
const CHART_ASPECT = 1500 / 1157.931;
const ROAD = "the road from Laukuwelua to Homaitani";
const ROAD_PRESSES = [
  ["ribbon", "1060 px", "Ribbon"],
  ["desk", "2400 px", "Desk"],
  ["wall", "3300 px", "Wall"],
  ["grand", "4200 px", "Grand"],
];
const POSTER_PRESSES = [
  ["chart", "1500 px", "Chart"],
  ["desk", "2400 px", "Desk"],
  ["wall", "3300 px", "Wall"],
  ["grand", "4200 px", "Grand"],
];
const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

type Counter = {
  value: string | null;
  ratio: number;
  turned: boolean;
  proofHidden: boolean;
  line: string | null;
  presses: (string | null)[][];
  nav: string | null;
  row: string | null;
  note: string | null;
  on: string | null;
  here: string | null;
};
const COUNTER: Payload<Counter> = String.raw`(() => { const t = (e) => e ? e.textContent.replace(/\s+/g, " ").trim() : null; const sel = document.getElementById("pr-pressing"), s = document.getElementById("sheet").getBoundingClientRect(), tu = document.getElementById("pr-turned"), nav = document.querySelector("nav.legend"), row = nav.querySelector(".legend-row");
  return { value: sel ? sel.value : null, ratio: s.width / s.height, turned: !tu.hidden && /^blob:/.test(tu.src), proofHidden: document.getElementById("pr-preview").hidden, line: t(document.getElementById("pr-plate-line")), presses: [...row.querySelectorAll("[data-poster]")].map((b) => [b.dataset.poster, t(b.querySelector(".verb")), t(b.querySelector(".room"))]), nav: nav.getAttribute("aria-label"), row: row.getAttribute("aria-label"), note: t(nav.querySelector(".legend-note")), on: (document.querySelector("#pr-contents li.on .cr-num") || { textContent: null }).textContent, here: (document.querySelector("#pr-contents .plates figure.here") || { dataset: {} }).dataset.plate || null }; })()`;
const ROAD_READY: Payload<boolean> = `(() => { const o = document.querySelector('#pr-pressing option[value="road"]'); return !!o && !o.disabled; })()`;
const choose = (value: string): Payload<boolean> =>
  `(() => { const s = document.getElementById("pr-pressing"); s.value = "${value}"; s.dispatchEvent(new Event("change")); return true; })()`;
type Print = {
  stage: string;
  turned: string;
  pos: string;
  h: number;
  w: number;
  proof: string;
  atlasEmpty: boolean;
};
const PRINT: Payload<Print> = `(() => { const cs = (e) => getComputedStyle(e), tu = document.getElementById("pr-turned"); return { stage: cs(document.querySelector(".stage")).display, turned: cs(tu).display, pos: cs(tu).position, h: Math.round(tu.getBoundingClientRect().height), w: Math.round(tu.getBoundingClientRect().width), proof: cs(document.getElementById("pr-preview")).display, atlasEmpty: document.getElementById("pr-atlas").children.length === 0 }; })()`;
const ROAD_OPTION: Payload<{ disabled: boolean; text: string; value: string } | null> =
  `(() => { const o = document.querySelector('#pr-pressing option[value="road"]'); return o ? { disabled: o.disabled, text: o.textContent, value: document.getElementById("pr-pressing").value } : null; })()`;
const PROOF_ON_DESK: Payload<{ seed: number | null; status: string; open: boolean }> =
  `(() => { const s = window.__vellumPrintRoomState, g = document.querySelector('[data-poster="grand"]'); return { seed: s ? s().seed : null, status: document.getElementById("pr-status").textContent, open: !!g && !g.disabled }; })()`;
const NO_ROAD_WITNESS: Payload<{ threw: boolean; message?: string }> =
  `(async () => { const g = await import("/explorer/engine/world/generate.js"); const j = await import("/explorer/engine/site/explorer/ribbon-job.js"); const w = g.generateWorld(g.defaultRecipe(1, { mapType: "archipelago", islands: 100 })); try { j.ribbonResultFor(w, { from: null, to: null, dress: "antique" }); return { threw: false }; } catch (e) { return { threw: true, message: e.message }; } })()`;
const LAST_POSTER: Payload<boolean> = `!!window.__vellumLastPoster`;
const TURNED_LOADED: Payload<boolean> = `(() => { const t = document.getElementById("pr-turned"); return !t.hidden && t.complete && t.naturalWidth > 0; })()`;
const pressOf = (key: string): Payload<boolean> =>
  `(() => { document.getElementById("pr-format").value = "svg"; window.__vellumLastPoster = undefined; const b = document.querySelector('[data-poster="${key}"]'); if (!b) return false; b.click(); return true; })()`;

type Pulled = { filename: string; width: number; same: boolean; status: string; open: boolean } | null;
const PULLED: Payload<Pulled> = `(async () => { const p = window.__vellumLastPoster; if (!p) return null; const sheet = await (await fetch(document.getElementById("pr-turned").src)).text(); return { filename: p.filename, width: p.width, same: p.svg === sheet, status: document.getElementById("pr-poster-status").textContent, open: !document.querySelector('[data-poster="ribbon"]').disabled }; })()`;
type Grand = { filename: string; width: number; root: string; rest: boolean };
const GRAND: Payload<Grand> = `(async () => { const p = window.__vellumLastPoster, sheet = await (await fetch(document.getElementById("pr-turned").src)).text(); return { filename: p.filename, width: p.width, root: p.svg.slice(0, p.svg.indexOf(">") + 1), rest: p.svg.slice(p.svg.indexOf(">")) === sheet.slice(sheet.indexOf(">")) }; })()`;

const near = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;

export async function prRoadUnbound(k: PrintRoomKit): Promise<void> {
  await roadLaid(k);
  await roadPrinted(k);
  await roadPulled(k);
  await roadPressedAtGrand(k);
  await roadBack(k);
}

async function roadLaid({ evaluate, check, sleep }: PrintRoomKit): Promise<void> {
  const settle = makeSettle({ evaluate, sleep });
  await settle(ROAD_READY, (ready) => ready, "print-room-road-ready");
  // Wiring, not the claim: the head's value is set and its change dispatched as a reader's choice fires it (a press is clicked as PR12 does); the claim is what the room lays on the sheet and presses.
  await evaluate(choose("road"));
  const on = await evaluate(COUNTER);
  check(
    "PR41 the head lays the road from the capital on the sheet and the four presses take its sizes (Issue #433 rulings 1, 2 and 4): the sheet at the road's own 1060 by 740, the folio's line names the road, Ribbon 1060 then Desk, Wall and Grand, the row named for the road, the caveat's last sentence the road's",
    on.value === "road" &&
      near(on.ratio, PLATE_ASPECT) &&
      on.turned &&
      on.proofHidden &&
      on.line === ROAD &&
      same(on.presses, ROAD_PRESSES) &&
      on.nav === "The road from the capital" &&
      on.row === "The road from the capital" &&
      !!on.note?.endsWith(" The road is pressed either way."),
    JSON.stringify(on),
  );
}

async function roadPrinted({ evaluate, send, check, sleep }: PrintRoomKit): Promise<void> {
  const settle = makeSettle({ evaluate, sleep });
  await settle(TURNED_LOADED, (loaded) => loaded, "print-room-road-turned-loaded");
  await send("Emulation.setEmulatedMedia", { media: "print" });
  let printed: Print;
  try {
    printed = await evaluate(PRINT);
  } finally {
    await send("Emulation.setEmulatedMedia", { media: "" });
  }
  check(
    "PR42 with the road on the sheet and nothing bound, print is the road: the stage in flow, the road at its own proportion, the proof and the document as nothing",
    printed.stage !== "none" &&
      printed.turned === "block" &&
      printed.pos === "static" &&
      printed.h > 0 &&
      near(printed.w / printed.h, PLATE_ASPECT) &&
      printed.proof === "none" &&
      printed.atlasEmpty,
    JSON.stringify(printed),
  );
}

async function roadPulled(k: PrintRoomKit): Promise<void> {
  const { evaluate, check, sleep } = k;
  const settle = makeSettle({ evaluate, sleep });
  // Wiring, not the claim: a press is clicked as PR12 does; the claim is the file the order pulls.
  const asked = await evaluate(pressOf("ribbon"));
  if (asked) await settle(LAST_POSTER, (done) => done, "print-room-road-pulled");
  const pulled = asked ? await evaluate(PULLED, true) : null;
  check(
    "PR43 the Ribbon press pulls the road on the sheet byte for byte as the engraving, named for the road",
    asked === true &&
      !!pulled &&
      pulled.filename === "vellum-road-42-antique-1060.svg" &&
      pulled.width === 1060 &&
      pulled.same &&
      pulled.status === "Ribbon plate pulled: vellum-road-42-antique-1060.svg" &&
      pulled.open,
    JSON.stringify({ asked, pulled }),
  );

  const png = await k.orderPng("png1", "ribbon");
  check(
    "PR44 the road honours the PNG format: the Ribbon press's impression is 1060 by 740 (the Chart's SVG-only posture is set aside for the road, Issue #433 ruling of 2026-10-20)",
    !!png &&
      png.type === "image/png" &&
      png.width === 1060 &&
      png.height === 740 &&
      png.clamped === false &&
      png.filename === "vellum-road-42-antique-1060.png" &&
      png.status === "Ribbon plate pressed: vellum-road-42-antique-1060.png",
    JSON.stringify(png),
  );
}

async function roadPressedAtGrand({ evaluate, check, sleep }: PrintRoomKit): Promise<void> {
  const settle = makeSettle({ evaluate, sleep });
  // Wiring, not the claim: a press is clicked as PR12 does; the claim is the file the order pulls.
  await evaluate(pressOf("grand"));
  await settle(LAST_POSTER, (done) => done, "print-room-grand-road-pulled");
  const grand = await evaluate(GRAND, true);
  check(
    "PR45 the Grand press pulls the same drawing at 4200: only the root's width and height change",
    grand.filename === "vellum-road-42-antique-4200.svg" &&
      grand.width === 4200 &&
      grand.root.includes(' width="4200" height="2932.08" viewBox="0 0 1060 740"') &&
      grand.rest,
    JSON.stringify(grand),
  );
}

async function roadBack({ evaluate, check }: PrintRoomKit): Promise<void> {
  // Wiring, not the claim: the head's value is set and its change dispatched as a reader's choice fires it; the claim is what the room lays on the sheet and presses.
  await evaluate(choose("poster"));
  const back = await evaluate(COUNTER);
  check(
    "PR46 the head back to a poster plate puts the proof on the sheet and the presses back to the chart's sizes, the row and the caveat the poster's",
    back.value === "poster" &&
      near(back.ratio, CHART_ASPECT) &&
      !back.turned &&
      !back.proofHidden &&
      back.line === "" &&
      same(back.presses, POSTER_PRESSES) &&
      back.nav === "A poster plate" &&
      back.row === "A poster plate" &&
      !!back.note?.endsWith(" The chart is pulled only as the engraving."),
    JSON.stringify(back),
  );
}

const TURN_THUMB = (selector: string): Payload<Counter | null> =>
  String.raw`(() => { const b = document.querySelector(${JSON.stringify(selector)}); if (!b) return null; b.click(); return ${COUNTER}; })()`;

export async function prRoadBound({ evaluate, check }: SuiteContext): Promise<void> {
  // Wiring, not the claim: the contents' thumbnail and its turn button are clicked as PR31 does; the claim is what the head, the presses and the sheet read after the turn.
  const a = await evaluate(TURN_THUMB('#pr-contents .plates figure[data-plate="ribbon-capital"] .thumb'));
  const b = await evaluate(TURN_THUMB('#pr-contents .turn[data-plate="theme-climate"]'));
  check(
    "PR47 turning the bound atlas's road page sets the head and the presses to the road, and turning another page sets them back (Issue #433 ruling 3)",
    !!a &&
      a.value === "road" &&
      same(a.presses, ROAD_PRESSES) &&
      a.line === "plate ix of the bound atlas · " + ROAD &&
      a.on === "ix" &&
      near(a.ratio, PLATE_ASPECT) &&
      !!b &&
      b.value === "poster" &&
      same(b.presses, POSTER_PRESSES) &&
      b.on === "iv",
    JSON.stringify({ a, b }),
  );

  // Wiring, not the claim: the head's value is set and its change dispatched as a reader's choice fires it; the claim is what the room lays on the sheet and presses.
  await evaluate(choose("road"));
  const c = await evaluate(COUNTER);
  // Wiring, not the claim: the head's value is set and its change dispatched as a reader's choice fires it; the claim is what the room lays on the sheet and presses.
  await evaluate(choose("poster"));
  const d = await evaluate(COUNTER);
  check(
    "PR48 while the atlas is bound, the head turns it: the road to row ix, a poster plate back to plate i",
    c.value === "road" &&
      c.on === "ix" &&
      c.here === "ribbon-capital" &&
      d.value === "poster" &&
      d.on === "i" &&
      /^plate i of the bound atlas · /.test(d.line ?? ""),
    JSON.stringify({ c, d }),
  );
}

export async function pr49NoRoad({ evaluate, send, check, sleep, PORT }: SuiteContext): Promise<void> {
  const settle = makeSettle({ evaluate, sleep, tolerant: true });
  await bounce(send, `http://127.0.0.1:${PORT}/print-room/#seed=1&style=antique&type=archipelago&islands=100`);
  await settle(PROOF_ON_DESK, (d) => d.seed === 1 && d.status === "" && d.open, "print-room-no-road-proof", 160);
  await settle(
    ROAD_OPTION,
    (o) => o.text !== "The road from the capital" || !o.disabled,
    "print-room-no-road-answered",
  );
  const witness = await evaluate(NO_ROAD_WITNESS, true);
  const option = await evaluate(ROAD_OPTION);
  check(
    "PR49 a world whose capital has no road never offers it: the head's road option stays closed and says so (engine-invariants: a surface offering the road from X checks X has a road)",
    witness.threw &&
      /no road leaves this place/.test(witness.message ?? "") &&
      !!option &&
      option.disabled &&
      option.text === "The road from the capital: none for this world" &&
      option.value === "poster",
    JSON.stringify({ witness, option }),
  );
}
