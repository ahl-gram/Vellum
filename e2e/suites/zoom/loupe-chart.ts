// The loupe against what the chart carries (Issue #751): the inked survey track it copies and follows, and the sheet's edge, past which the lens is dimmed so the chrome painted over it keeps its contrast.
import { nearRgba, sampleRect, tokenRgba, type Rgb } from "../../support/pixel.ts";
import { contrast } from "../cluster/trail.ts";
import { home, press } from "./hold.ts";
import { pollLast } from "./registration.ts";
import { CENTRE, LOADED, mouse, setLoupe, type Centre, type Point } from "./loupe.ts";
import type { ZoomKit } from "./kit.ts";

const AGES = (on: boolean): string =>
  `(()=>{const c=document.getElementById("ages");c.checked=${on};c.dispatchEvent(new Event("change",{bubbles:true}));})()`;
const TRACK_START = `(()=>{const o=document.querySelector("#map > .voyage-overlay");const t=o?o.querySelector(".voyage-track"):null;if(!o||!t)return null;const vb=o.viewBox.baseVal;const p=(t.getAttribute("points")||"").trim().split(/\\s+/)[0].split(",").map(Number);const r=o.getBoundingClientRect();return{x:r.left+p[0]*r.width/vb.width,y:r.top+p[1]*r.height/vb.height};})()`;
const TRACK_COPY = `(()=>{const src=document.querySelector("#map > .voyage-overlay .voyage-track");const c=document.querySelector(".loupe-sheet .voyage-overlay .voyage-track");const l=document.querySelector(".loupe");return{lens:!!l&&!l.hidden,copies:document.querySelectorAll(".loupe .voyage-overlay").length,same:!!c&&!!src&&c.getAttribute("points")===src.getAttribute("points"),stroke:c?getComputedStyle(c).stroke:"",srcStroke:src?getComputedStyle(src).stroke:null};})()`;

type TrackCopy = { lens: boolean; copies: number; same: boolean; stroke: string; srcStroke: string | null };
type Track = { copy: TrackCopy; gone: TrackCopy; back: TrackCopy; overlays: number };

async function trackRead(k: ZoomKit): Promise<Track> {
  try {
    await k.evaluate(AGES(true));
    await k.waitInked("zl6");
    await setLoupe(k, true);
    const at = await k.evaluate<Point | null>(TRACK_START);
    if (at) await mouse(k, at.x, at.y);
    const copy = await pollLast<TrackCopy>(k, TRACK_COPY, (d) => d.copies === 1, 40);
    await k.evaluate(AGES(false));
    const gone = await pollLast<TrackCopy>(k, TRACK_COPY, (d) => d.lens && d.copies === 0, 40);
    await k.evaluate(AGES(true));
    await k.waitInked("zl6-back");
    const back = await pollLast<TrackCopy>(k, TRACK_COPY, (d) => d.copies === 1 && d.same, 40);
    await setLoupe(k, false);
    return {
      copy,
      gone,
      back,
      overlays: await k.evaluate<number>(`document.querySelectorAll(".voyage-overlay").length`),
    };
  } finally {
    await setLoupe(k, false);
    await k.evaluate(AGES(false));
    await home(k);
  }
}

export async function zl6TrackRides(k: ZoomKit): Promise<void> {
  await home(k);
  const { copy, gone, back, overlays } = await trackRead(k);
  k.check(
    "ZL6 the inked survey track rides along in the lens, dressed as the chart's, leaves it and comes back with the chart's own as the survey is taken off and inked again with nothing moving, and the copy goes with the lens (Issue #751)",
    copy.copies === 1 &&
      copy.same &&
      copy.stroke !== "" &&
      copy.stroke === copy.srcStroke &&
      gone.lens &&
      gone.copies === 0 &&
      back.lens &&
      back.copies === 1 &&
      back.same &&
      overlays === 1,
    JSON.stringify({ copy, gone, back, overlays }),
  );
}

const PATCH_PX = 16;
const INSIDE_PX = 30;
const OFF_PX = 40;
const ON_PX = 40;
// 3 lies between `--line-tan` over bare chart paper (1.94) and over chart ink (5.48), computed 2026-10-21.
const UNDIMMED_UNDER = 3;
// Blink lays a box out in 1/64 px units, so two rects read against each other err by at most two of them.
const ROOM_SLACK_PX = 1 / 32;
const QUIET = `(()=>{const s=document.createElement("style");s.id="zl7-quiet";s.textContent="header.chrome,.corner,.legend,.slip,.slip-tab,.fog{visibility:hidden!important}";document.head.appendChild(s);})()`;
const UNQUIET = `(()=>{const s=document.getElementById("zl7-quiet");if(s)s.remove();})()`;
const DEPTH_2 = `(()=>{const v=document.getElementById("map-viewport");const W=v.clientWidth,H=v.clientHeight;window.__vellumZoomTo({k:2,x:W/2-W,y:H/2-H});})()`;
const ROOM = `(()=>{const r=document.querySelector(".loupe-room");const v=document.getElementById("map-viewport");if(!r||!v)return null;const a=r.getBoundingClientRect(),b=v.getBoundingClientRect();return Math.max(Math.abs(a.left-b.left),Math.abs(a.top-b.top),Math.abs(a.width-b.width),Math.abs(a.height-b.height));})()`;
const COVERS = `(()=>{const l=document.querySelector(".loupe");const g=l?l.querySelector(".loupe-glass"):null;const r=l?l.querySelector(".loupe-room"):null;if(!l||l.hidden||!g||!r)return false;const a=g.getBoundingClientRect(),b=r.getBoundingClientRect();return b.left<=a.left&&b.top<=a.top&&b.right>=a.right&&b.bottom>=a.bottom;})()`;

type Probe = { at: Point; off: Point; on: Point };
type Dim = { found: boolean; loaded: boolean; off: Rgb; on: Rgb; room: number | null; covers: boolean };

function probeAt(b: Centre): Probe | null {
  const x = b.L + (b.W * 3) / 4;
  const bottom = b.T + b.H;
  if (b.ih - bottom >= OFF_PX + PATCH_PX)
    return {
      at: { x, y: bottom - INSIDE_PX },
      off: { x, y: bottom + OFF_PX },
      on: { x, y: bottom - INSIDE_PX - ON_PX },
    };
  if (b.T >= OFF_PX + PATCH_PX)
    return { at: { x, y: b.T + INSIDE_PX }, off: { x, y: b.T - OFF_PX }, on: { x, y: b.T + INSIDE_PX + ON_PX } };
  return null;
}

async function patch(k: ZoomKit, p: Point): Promise<Rgb> {
  const x = Math.round(p.x - PATCH_PX / 2);
  const y = Math.round(p.y - PATCH_PX / 2);
  const px = (await sampleRect(k.send, x, y, PATCH_PX, PATCH_PX)).flat();
  const mid = (c: 0 | 1 | 2): number => px.map((q) => q[c]).sort((a, b) => a - b)[Math.floor(px.length / 2)] ?? 0;
  return [mid(0), mid(1), mid(2)];
}

async function dimReads(k: ZoomKit): Promise<Dim> {
  const none: Dim = { found: false, loaded: false, off: [0, 0, 0], on: [0, 0, 0], room: null, covers: false };
  try {
    await home(k);
    await setLoupe(k, true);
    const p = probeAt(await k.evaluate<Centre>(CENTRE));
    if (!p) return none;
    await k.evaluate(QUIET);
    await mouse(k, p.at.x, p.at.y);
    const loaded = await pollLast<boolean>(k, LOADED, (d) => d, 40);
    const off = await patch(k, p.off);
    const on = await patch(k, p.on);
    const room = await k.evaluate<number | null>(ROOM);
    await press(k);
    await k.evaluate(DEPTH_2);
    const covers = await pollLast<boolean>(k, COVERS, (d) => d, 40);
    return { found: true, loaded, off, on, room, covers };
  } finally {
    await k.evaluate(UNQUIET);
    await setLoupe(k, false);
    await home(k);
  }
}

export async function zl7DarkPastSheet(k: ZoomKit): Promise<void> {
  const d = await dimReads(k);
  const [r, g, b] = tokenRgba("--line-tan");
  const ink: Rgb = [r, g, b];
  const offRatio = contrast(ink, d.off);
  const onRatio = contrast(ink, d.on);
  k.check(
    "ZL7 where the lens lies past the sheet it shows the desk's own chart ink, bounded by the sheet's rect exactly, where it lies on the sheet it is not darkened, and at twice the depth, the sheet filling the box, nothing in it is (Issue #751)",
    d.found &&
      d.loaded &&
      nearRgba([...d.off, 255], tokenRgba("--chart-ink")) &&
      onRatio < UNDIMMED_UNDER &&
      d.room !== null &&
      d.room <= ROOM_SLACK_PX &&
      d.covers,
    JSON.stringify({ ...d, offRatio, onRatio }),
  );
}
