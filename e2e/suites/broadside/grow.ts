// The Broadside grown into a tall window's free height (BR25 to BR25i, Issue #1260): every box is read from the run, and the literals are the ruled start, pace and stop.
import { ZOOM_STEP } from "../../../src/site/shared/zoom-keys.ts";
import { sendClick, sendKey } from "../../support/input.ts";
import { makeSettle, makeStable } from "../../support/settle.ts";
import type { Payload, Point } from "../../types.ts";
import { onSlipFloor, type BroadsideKit } from "./kit.ts";

// 2026-11-05: Alex's ruling 2, Issue #1260 comment 6666875967: the bill starts growing above a 768 page and takes two pixels per pixel.
const START = 768;
const PACE = 2;
// 2026-11-05: a relation over at most eight rect edges, laid out in 1/64 px units, drifts at most 0.125 px; headroom 0.075, the largest read 0.03.
const NEAR = 0.2;
// 2026-11-06: the house's half-pixel relation for a foot against its floor; the foot stands short of it by under a 64th for each share the room is divided into and one for the paper (22 held, 0.34 px) and two edges drift at most 1/32 px, the largest read 0.31 (Issue #1260 plan revision 3).
const ON = 0.5;

const DEFAULT = "#seed=20261105&style=antique";
const HELD = "#seed=20261105&style=antique&type=archipelago&islands=20";
const TEXAS = "ne-1159315211";

type Box = { t: number; b: number; h: number } | null;
export type Bill = {
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
  bodyFoot: number;
  tracks: number;
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
 bodyFoot:b.getBoundingClientRect().bottom-s.querySelector(".imprint").getBoundingClientRect().bottom,tracks:getComputedStyle(land).gridTemplateRows.split(" ").filter(Boolean).length,
 opened:["--bill-row","--bill-group","--bill-head","--bill-paper"].map((k)=>s.style.getPropertyValue(k)),
 zoomed:!!document.querySelector("#map-viewport.zoomed"),anims:s.getAnimations({subtree:true}).filter((a)=>a.playState==="running").length};})()`;

const CAMERA: Payload<{ k: number; x: number; y: number }> =
  `(()=>{const s=window.__vellumZoomState();return{k:+s.k.toFixed(4),x:+s.x.toFixed(2),y:+s.y.toFixed(2)};})()`;
// A change made in the page, not a press of the select: only so do its handler and the read share one task, and the draw's landing lays the room out again and would hide refreshLand's own call (Issue #1260 plan revision 3).
const CHOOSE_ARCHIPELAGO: Payload<Bill> = `(()=>{const e=document.getElementById("type");e.value="archipelago";e.dispatchEvent(new Event("change",{bubbles:true}));return ${BILL};})()`;
type Frame = { k: number; h: number };
const FRAMES_ON: Payload<boolean> = `(()=>{const s=document.getElementById("broadside"),f=[];window.__billFrames=f;window.__billFramesOn=true;window.__billWrites=0;window.__billWatch=new MutationObserver((rs)=>{window.__billWrites+=rs.length;});window.__billWatch.observe(document.getElementById("map"),{attributes:true,attributeFilter:["style"]});const tick=()=>{if(!window.__billFramesOn)return;f.push({k:window.__vellumZoomState().k,h:s.getBoundingClientRect().height});requestAnimationFrame(tick);};requestAnimationFrame(tick);return true;})()`;
const FRAMES_OFF: Payload<Frame[]> =
  `(()=>{window.__billFramesOn=false;window.__billWatch.disconnect();return window.__billFrames;})()`;
export type Landing = { k: number; x: number; y: number; writes: number; frame: number };
const LANDING: Payload<Landing> = `(()=>{const s=window.__vellumZoomState();return{k:+s.k.toFixed(4),x:+s.x.toFixed(2),y:+s.y.toFixed(2),writes:window.__billWrites,frame:window.__billFrames.length};})()`;
export const landed = (d: Landing, last: Landing): boolean =>
  d.k === last.k && d.x === last.x && d.y === last.y && d.writes === last.writes && d.frame > last.frame;
// The wheel is dispatched in the page in the task that presses The whole sheet, so it lands before the glide's first frame however slow the runner: only so is an interrupted home glide reached every run (Issue #1260 plan revision 4).
const HOME_THEN_WHEEL: Payload<boolean> = `(()=>{const v=document.getElementById("map-viewport"),r=document.getElementById("sheet").getBoundingClientRect();document.getElementById("zoom-reset").click();v.dispatchEvent(new WheelEvent("wheel",{deltaY:100,clientX:r.left+r.width/2,clientY:r.top+r.height/2,bubbles:true,cancelable:true}));return true;})()`;
const ADDRESS: Payload<string> = `(()=>location.hash)()`;
const CENTRE = (id: string): Payload<Point> =>
  `(()=>{const r=document.getElementById("${id}").getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};})()`;

const win = (k: BroadsideKit, w: number, h: number): Promise<unknown> =>
  k.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });

export const laidOut =
  (w: number, h: number, also: (d: Bill) => boolean = () => true) =>
  (d: Bill): boolean =>
    d.w === w && d.h === h && d.fonts === "loaded" && d.anims === 0 && onSlipFloor(d.floor, h) && also(d);

function reader(k: BroadsideKit) {
  const stable = makeStable(makeSettle({ evaluate: k.evaluate, sleep: k.sleep }));
  return (w: number, h: number, label: string, also: (d: Bill) => boolean = () => true): Promise<Bill> =>
    stable(BILL, label, { departed: laidOut(w, h, also) });
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
    ]);
    seats["held"] = await seatReads(k, "held", [
      [1024, 768],
      [1512, 882],
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
    "BR25b at 1512 by 882, past the fill, the Broadside's foot stands on its floor with nothing in it scrolling, a gap between the groups opens twice what a gap between rows opens, the masthead takes a row's share above it, and a held box's note stays tucked under its row, in both seats (rulings 1, 2 and 6)",
    Object.values(seats).every((s) => br25bHolds(s["1024x768"]!, s["1512x882"]!)),
    JSON.stringify({
      at768: Object.values(seats).map((s) => s["1024x768"]),
      at882: Object.values(seats).map((s) => s["1512x882"]),
    }),
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

async function moveAndRest(k: BroadsideKit, move: () => Promise<unknown>, label: string): Promise<Frame[]> {
  const stable = makeStable(makeSettle({ evaluate: k.evaluate, sleep: k.sleep }));
  await k.evaluate(FRAMES_ON);
  const from = await k.evaluate(LANDING);
  await move();
  await stable(LANDING, label, {
    departed: (d) => d.k !== from.k || d.x !== from.x || d.y !== from.y,
    same: landed,
  });
  return k.evaluate(FRAMES_OFF);
}

const pressing = (k: BroadsideKit, id: string) => async (): Promise<void> => {
  const c = await k.evaluate(CENTRE(id));
  await sendClick(k.send, c.x, c.y);
};

const wheeling = (k: BroadsideKit, notches: number) => async (): Promise<void> => {
  const c = await k.evaluate(CENTRE("sheet"));
  for (let i = 0; i < Math.abs(notches); i++) await k.wheel(c.x, c.y, -100 * Math.sign(notches));
};

const partway = (frames: readonly Frame[], natural: number, grown: number): boolean =>
  frames.some((f) => f.k > 1 && f.k < ZOOM_STEP && f.h > natural + ON && f.h < grown - ON);
const shut = (frames: readonly Frame[], natural: number): boolean =>
  frames.some((f) => f.k > 1) && frames.every((f) => f.k === 1 || Math.abs(f.h - natural) <= ON);
const shallow = (g: Bill, cam: { k: number }, natural: number): boolean =>
  cam.k > 1 && cam.k < ZOOM_STEP && Math.abs(g.slip.h - natural) <= ON && g.opened.every((v) => v === "0px");

export async function br25dZoomed(k: BroadsideKit): Promise<void> {
  await br25dZoom(k);
}

async function br25dZoom(k: BroadsideKit) {
  const { send, check, goto, EXP } = k;
  const read = reader(k);
  try {
    await win(k, 1024, 768);
    await goto(EXP + DEFAULT, "broadside-grow-zoom");
    const h0 = (await read(1024, 768, "BR25d the bill at 1024x768")).slip.h;
    await win(k, 1512, 882);
    const rest = await read(1512, 882, "BR25d the bill at rest at 1512x882");
    const pressed = await moveAndRest(k, pressing(k, "zoom-in"), "BR25d the camera at rest after the first press");
    const zoomed = await read(1512, 882, "BR25d the bill zoomed", (d) => d.zoomed);
    const homed = await moveAndRest(k, pressing(k, "zoom-reset"), "BR25d the camera at rest on the whole sheet");
    const home = await read(1512, 882, "BR25d the bill back on the whole sheet", (d) => !d.zoomed);
    check(
      "BR25d zoomed in, the Broadside stands at its content's height, as at 1024 by 768, and at the whole sheet it grows back to its floor (ruling 5)",
      Math.abs(zoomed.slip.h - h0) <= ON && zoomed.opened.every((v) => v === "0px") && onFloor(rest) && onFloor(home),
      JSON.stringify({ h0, rest, zoomed, home }),
    );
    await br25hGlides(k, { h0, grown: rest.slip.h, pressed, homed });
    const chosen = await k.evaluate(CHOOSE_ARCHIPELAGO);
    await k.waitSettled("BR25f the archipelago's draw lands");
    check(
      "BR25f a choice that adds rows to the Land lays the Broadside back on its floor in the task that makes it, before its draw lands, with nothing in it scrolling (Alex, 2026-11-05, Issue #1260 comment 6668005484, P6)",
      chosen.tracks > home.tracks && onFloor(chosen),
      JSON.stringify({ home, chosen }),
    );
  } finally {
    await send("Emulation.clearDeviceMetricsOverride");
  }
}

async function br25hGlides(
  k: BroadsideKit,
  { h0, grown, pressed, homed }: { h0: number; grown: number; pressed: Frame[]; homed: Frame[] },
) {
  const wheeled = await br25hRests(k);
  const interrupted = await br25iInterrupted(k);
  k.check(
    "BR25h the first press closes the Broadside, and The whole sheet opens it, part way on a frame of their glide, in step with the chart, where a wheel closes it in the frame the chart first zooms and a press of Draw back from a deeper rest keeps it closed throughout (Alex, 2026-11-05, Issue #1260 comment 6668005484, P5, and 2026-11-06, comment 6684513791)",
    partway(pressed, h0, grown) &&
      partway(homed, h0, grown) &&
      shut(wheeled.inFrames, h0) &&
      shut(wheeled.backFrames, h0),
    JSON.stringify({ h0, grown, pressed, homed, wheel: wheeled.inFrames, drawBack: wheeled.backFrames }),
  );
  k.check(
    "BR25i a wheel that interrupts The whole sheet's glide and comes to rest short of the first press's depth leaves the Broadside at its content's height with nothing opened once the camera settles (Alex, 2026-11-06, Issue #1260 comment 6684513791)",
    shallow(interrupted.bill, interrupted.at, h0),
    JSON.stringify({ h0, ...interrupted }),
  );
}

async function br25hRests(k: BroadsideKit): Promise<{ inFrames: Frame[]; backFrames: Frame[] }> {
  const read = reader(k);
  const inFrames = await moveAndRest(k, wheeling(k, 1), "BR25h the camera at rest a wheel's notch in");
  await read(1512, 882, "BR25h the bill a wheel's notch in", (d) => d.zoomed);
  await moveAndRest(k, wheeling(k, -1), "BR25h the camera wheeled back to the whole sheet");
  await read(1512, 882, "BR25h the bill wheeled back to the whole sheet");
  await moveAndRest(k, wheeling(k, 4), "BR25h the camera four notches in");
  await read(1512, 882, "BR25h the bill four notches in", (d) => d.zoomed);
  const backFrames = await moveAndRest(k, pressing(k, "zoom-out"), "BR25h the camera drawn back from four notches in");
  await read(1512, 882, "BR25h the bill drawn back short of the first press's depth", (d) => d.zoomed);
  await moveAndRest(k, pressing(k, "zoom-reset"), "BR25h the camera home again");
  await read(1512, 882, "BR25h the bill home again", (d) => !d.zoomed);
  return { inFrames, backFrames };
}

async function br25iInterrupted(k: BroadsideKit) {
  const read = reader(k);
  const settle = makeSettle({ evaluate: k.evaluate, sleep: k.sleep });
  await moveAndRest(k, pressing(k, "zoom-in"), "BR25i the camera at the first press's depth");
  await read(1512, 882, "BR25i the bill at the first press's depth", (d) => d.zoomed);
  await moveAndRest(
    k,
    () => k.evaluate(HOME_THEN_WHEEL),
    "BR25i the camera at rest after a wheel interrupts The whole sheet",
  );
  const at = await k.evaluate(CAMERA);
  await settle(
    ADDRESS,
    (h) => h.includes(`k=${at.k.toFixed(4)}`),
    "BR25i the camera's settle writes its depth to the address",
  );
  const bill = await read(1512, 882, "BR25i the bill once the camera settles", (d) => d.zoomed);
  await moveAndRest(k, pressing(k, "zoom-reset"), "BR25i the camera home again");
  await read(1512, 882, "BR25i the bill home again", (d) => !d.zoomed);
  return { at, bill };
}
