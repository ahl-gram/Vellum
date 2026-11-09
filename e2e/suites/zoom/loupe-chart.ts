// The loupe against what the chart carries (Issue #751): the inked survey track it copies and follows.
import { home } from "./hold.ts";
import { pollLast } from "./registration.ts";
import { mouse, setLoupe, type Point } from "./loupe.ts";
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
