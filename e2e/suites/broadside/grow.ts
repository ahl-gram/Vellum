// The Broadside grown into a tall window's free height (BR25 to BR25e, Issue #1260): every box is read from the run, and the literals are the ruled start, pace and stop.
import { sendClick, sendKey } from "../../support/input.ts";
import { withReducedMotion } from "../../support/reduced-motion.ts";
import { makeSettle, makeStable } from "../../support/settle.ts";
import type { Payload, Point } from "../../types.ts";
import type { BroadsideKit } from "./kit.ts";

// 2026-11-05: Alex's rulings 2 and 3, Issue #1260 comment 6666875967: the bill starts growing above a 768 page, takes two pixels per pixel, and stops opening at twice its own width.
const START = 768;
const PACE = 2;
const STOP = 2;
// 2026-11-05: a relation over at most eight rect edges, laid out in 1/64 px units, drifts at most 0.125 px; headroom 0.075, the largest read 0.03.
const NEAR = 0.2;
// 2026-11-05: the house's half-pixel relation for a foot against its floor; two edges drift at most 1/32 px, the largest read 0.02.
const ON = 0.5;

const DEFAULT = "#seed=20261105&style=antique";
const HELD = "#seed=20261105&style=antique&type=archipelago&islands=20";
const TEXAS = "ne-1159315211";

type Box = { t: number; b: number; h: number } | null;
type Bill = {
  w: number;
  h: number;
  fonts: string;
  floor: number;
  slip: { t: number; b: number; h: number; w: number };
  scrolls: boolean;
  paper: Box;
  flower: Box;
  hand: Box;
  imprint: Box;
  rowGap: number;
  groupGap: number;
  headTop: number;
  noteGap: number | null;
  opened: string[];
  zoomed: boolean;
  anims: number;
};

const BILL: Payload<Bill> = `(()=>{const s=document.getElementById("broadside"),b=s.querySelector(".slip-body"),pool=s.querySelector(".bill-paper"),svg=pool&&pool.querySelector("svg");
const r=(e)=>{if(!e||!e.getClientRects().length)return null;const x=e.getBoundingClientRect();return{t:+x.top.toFixed(2),b:+x.bottom.toFixed(2),h:+x.height.toFixed(2)};};
const q=(id)=>document.getElementById(id),sb=s.getBoundingClientRect();
const land=s.querySelector('[aria-labelledby="grp-land"] .ledger');
const held=q("strand-held"),note=q("strand-held-note");
const heldRows=held&&held.getClientRects().length?[...held.querySelectorAll(":scope > .l-row")].filter((x)=>!x.hidden):[];
const lastRow=heldRows.length?Math.max(...[...heldRows[heldRows.length-1].children].filter((c)=>c.getClientRects().length).map((c)=>c.getBoundingClientRect().bottom)):null;
return{w:innerWidth,h:innerHeight,fonts:document.fonts.status,
 floor:+(parseFloat(s.style.top)+parseFloat(s.style.maxHeight)).toFixed(2),slip:{t:+sb.top.toFixed(2),b:+sb.bottom.toFixed(2),h:+sb.height.toFixed(2),w:s.offsetWidth},
 scrolls:b.scrollHeight>b.clientHeight,paper:r(pool),flower:svg&&getComputedStyle(svg).visibility==="visible"?r(svg):null,
 hand:r(s.querySelector('.broadside > .panel[aria-labelledby="grp-hand"]')),imprint:r(s.querySelector(".imprint")),
 rowGap:+(r(q("band")).t-r(q("type")).b).toFixed(2),groupGap:+(r(q("grp-strand")).t-r(land).b).toFixed(2),
 headTop:+(r(s.querySelector(".slip-head .card-verb")).t-sb.top).toFixed(2),
 noteGap:lastRow!==null&&note&&note.getClientRects().length&&note.textContent?+(note.getBoundingClientRect().top-lastRow).toFixed(2):null,
 opened:["--bill-row","--bill-group","--bill-head","--bill-paper"].map((k)=>s.style.getPropertyValue(k)),
 zoomed:!!document.querySelector("#map-viewport.zoomed"),anims:s.getAnimations({subtree:true}).filter((a)=>a.playState==="running").length};})()`;

const CAMERA: Payload<{ k: number; x: number; y: number }> =
  `(()=>{const s=window.__vellumZoomState();return{k:+s.k.toFixed(4),x:+s.x.toFixed(2),y:+s.y.toFixed(2)};})()`;
const CENTRE = (id: string): Payload<Point> =>
  `(()=>{const r=document.getElementById("${id}").getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};})()`;

const win = (k: BroadsideKit, w: number, h: number): Promise<unknown> =>
  k.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });

function reader(k: BroadsideKit) {
  const stable = makeStable(makeSettle({ evaluate: k.evaluate, sleep: k.sleep }));
  return (w: number, h: number, label: string, also: (d: Bill) => boolean = () => true): Promise<Bill> =>
    stable(BILL, label, {
      departed: (d) => d.w === w && d.h === h && d.fonts === "loaded" && d.anims === 0 && also(d),
    });
}

async function pickTexas(k: BroadsideKit): Promise<void> {
  const settle = makeSettle({ evaluate: k.evaluate, sleep: k.sleep });
  await k.evaluate(`(()=>{document.getElementById("place").focus();return true;})()`);
  await k.send("Input.insertText", { text: "tex" });
  await settle<{ open: boolean; first: string }>(
    `(()=>{const p=document.getElementById("place-list"),n=document.querySelector("#place-options > li .pl-name");return{open:p.matches(":popover-open"),first:n?n.textContent:""};})()`,
    (d) => d.open && d.first === "Texas",
    "BR25 the list offers Texas",
  );
  await sendKey(k.send, "Enter", "Enter", 13);
  await settle<{ status: string; outline: string | null; land: boolean; strand: boolean }>(
    `(()=>{const s=document.querySelector("#map > svg[data-vellum-style]");const v=(id)=>{const e=document.getElementById(id);return !!e&&e.getClientRects().length>0;};return{status:document.getElementById("status").textContent,outline:s?s.getAttribute("data-vellum-outline"):null,land:v("land-held"),strand:v("strand-held")};})()`,
    (d) => d.status === "" && d.outline === TEXAS && d.land && d.strand,
    "BR25 the pick draws, both boxes held",
  );
  await k.evaluate(`(()=>{document.getElementById("place").blur();return true;})()`);
}

async function seatReads(k: BroadsideKit, seat: "default" | "held", sizes: readonly (readonly [number, number])[]) {
  const read = reader(k);
  await win(k, 1024, 768);
  await k.goto(k.EXP + (seat === "held" ? HELD : DEFAULT), `broadside-grow-${seat}`);
  if (seat === "held") await pickTexas(k);
  const reads: Record<string, Bill> = {};
  for (const [w, h] of sizes) {
    await win(k, w, h);
    reads[`${w}x${h}`] = await read(w, h, `BR25 the ${seat} seat at ${w}x${h}`);
  }
  return reads;
}

const zeroed = (g: Bill): boolean => g.opened.every((v) => v === "0px") && (g.paper?.h ?? 0) === 0;
const onFloor = (g: Bill): boolean => Math.abs(g.slip.b - g.floor) <= ON && !g.scrolls;

export async function br25Grows(k: BroadsideKit): Promise<void> {
  const { send, check } = k;
  const seats: Record<string, Record<string, Bill>> = {};
  try {
    seats["default"] = await seatReads(k, "default", [
      [1024, 768],
      [1280, 800],
      [1512, 882],
      [1280, 1200],
    ]);
    seats["held"] = await seatReads(k, "held", [
      [1024, 768],
      [1512, 882],
      [1280, 1200],
    ]);
  } finally {
    await send("Emulation.clearDeviceMetricsOverride");
  }
  const d = seats["default"];
  const pace = d["1280x800"]!.slip.h - d["1024x768"]!.slip.h;
  check(
    "BR25 at 1024 by 768 the Broadside opens no gap and lays no blank paper, in the default seat and with both held boxes shown, and above 768 it grows two pixels for every pixel of window (Alex, 2026-11-05, Issue #1260 rulings 1 and 2)",
    Object.values(seats).every((s) => zeroed(s["1024x768"]!)) && Math.abs(pace - PACE * (800 - START)) <= ON,
    JSON.stringify({ at768: Object.values(seats).map((s) => s["1024x768"]), pace }),
  );
  check(
    "BR25b on a window past the fill the Broadside's foot stands on its floor and nothing in it scrolls, a gap between the groups opens twice what a gap between rows opens, the masthead takes a row's share above it, and a held box's note stays tucked under its row, in both seats (rulings 1, 2 and 6)",
    Object.values(seats).every((s) => br25bHolds(s["1024x768"]!, s["1512x882"]!)),
    JSON.stringify(Object.values(seats).map((s) => s["1512x882"])),
  );
  check(
    "BR25c on a window past the stop the rows open no further than twice the Broadside's width, its border runs on to the floor, and the flower stands centred in the blank paper between the Hand and the printer's line, in both seats (rulings 3 and 4)",
    Object.values(seats).every((s) => br25cHolds(s["1280x1200"]!)),
    JSON.stringify(Object.values(seats).map((s) => s["1280x1200"])),
  );
}

function br25bHolds(at768: Bill, at882: Bill): boolean {
  const rowGain = at882.rowGap - at768.rowGap;
  const groupGain = at882.groupGap - at768.groupGap;
  const headGain = at882.headTop - at768.headTop;
  const note = at882.noteGap !== null && at768.noteGap !== null ? at882.noteGap - at768.noteGap : NaN;
  return (
    onFloor(at882) &&
    rowGain > 1 &&
    Math.abs(groupGain - 2 * rowGain) <= NEAR &&
    Math.abs(headGain - rowGain) <= NEAR &&
    Math.abs(note) <= NEAR
  );
}

function br25cHolds(g: Bill): boolean {
  const { paper: p, flower: f } = g;
  if (p === null || f === null || g.hand === null || g.imprint === null) return false;
  return (
    Math.abs(g.slip.h - p.h - STOP * g.slip.w) <= ON &&
    Math.abs(g.slip.b - g.floor) <= ON &&
    p.t >= g.hand.b - ON &&
    p.b <= g.imprint.t + ON &&
    f.h > 0 &&
    f.t >= p.t - ON &&
    f.b <= p.b + ON &&
    Math.abs((f.t + f.b) / 2 - (p.t + p.b) / 2) <= ON
  );
}

async function pressAndRest(k: BroadsideKit, id: string, label: string): Promise<void> {
  const stable = makeStable(makeSettle({ evaluate: k.evaluate, sleep: k.sleep }));
  const from = JSON.stringify(await k.evaluate(CAMERA));
  const c = await k.evaluate(CENTRE(id));
  await sendClick(k.send, c.x, c.y);
  await stable(CAMERA, label, { departed: (d) => JSON.stringify(d) !== from });
}

export async function br25dZoomed(k: BroadsideKit): Promise<void> {
  await br25dZoom(k);
  await br25eReduced(k);
}

async function br25dZoom(k: BroadsideKit): Promise<void> {
  const { send, check, goto, EXP } = k;
  const read = reader(k);
  try {
    await win(k, 1024, 768);
    await goto(EXP + DEFAULT, "broadside-grow-zoom");
    const h0 = (await read(1024, 768, "BR25d the bill at 1024x768")).slip.h;
    await win(k, 1512, 882);
    const rest = await read(1512, 882, "BR25d the bill at rest at 1512x882");
    await pressAndRest(k, "zoom-in", "BR25d the camera at rest after the first press");
    const zoomed = await read(1512, 882, "BR25d the bill zoomed", (d) => d.zoomed);
    await pressAndRest(k, "zoom-reset", "BR25d the camera at rest on the whole sheet");
    const home = await read(1512, 882, "BR25d the bill back on the whole sheet", (d) => !d.zoomed);
    check(
      "BR25d zoomed in, the Broadside stands at its content's height, as at 1024 by 768, and at the whole sheet it grows back to its floor (ruling 5)",
      Math.abs(zoomed.slip.h - h0) <= ON && zoomed.opened.every((v) => v === "0px") && onFloor(rest) && onFloor(home),
      JSON.stringify({ h0, rest, zoomed, home }),
    );
  } finally {
    await send("Emulation.clearDeviceMetricsOverride");
  }
}

async function br25eReduced(k: BroadsideKit): Promise<void> {
  const { send, check, goto, EXP } = k;
  const read = reader(k);
  try {
    await withReducedMotion(k, async () => {
      await win(k, 1280, 800);
      await goto(EXP + DEFAULT, "broadside-grow-reduced");
      await read(1280, 800, "BR25e the bill at 1280x800");
      await win(k, 1512, 882);
      const grown = await read(1512, 882, "BR25e the bill at 1512x882");
      check(
        "BR25e under reduced motion a window grown taller lays the Broadside's foot on its floor: no gap it opens runs as a transition (handbook/specs/cascade-traps.md)",
        onFloor(grown),
        JSON.stringify(grown),
      );
    });
  } finally {
    await send("Emulation.clearDeviceMetricsOverride");
  }
}
