import { makeSettle, makeStable } from "../../support/settle.ts";
import { countEvents } from "../../support/witness.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import type { HuntKit, Quarry, Zoom } from "../hunt.ts";

const CLICKS = countEvents(["click"]);
export const HG2_READ: Payload<{ clicks: number; dots: number; inSvg: boolean; solved: boolean; status: string }> =
  `(()=>({clicks:${CLICKS.seen},dots:document.querySelectorAll("#map .sounding-dot").length,inSvg:!!document.querySelector("#map svg .sounding-dot"),solved:document.getElementById("map").classList.contains("solved"),status:document.getElementById("hunt-status").textContent}))()`;
export const HG4_READ: Payload<{ clicks: number; solved: boolean; status: string; star: boolean }> =
  `(()=>({clicks:${CLICKS.seen},solved:document.getElementById("map").classList.contains("solved"),status:document.getElementById("hunt-status").textContent,star:!!document.querySelector("#map .hunt-star")}))()`;

export async function hg0Boots({ evaluate, send, check, sleep }: SuiteContext, HUNT_PAGE: string): Promise<void> {
  // HG uses REAL CDP mouse input so d3-zoom's own click-distance handling runs: a clean tap (no move) fires the guess click, a moved drag suppresses the trailing click.
  try {
    await evaluate(`localStorage.removeItem("vellum.hunt.v1")`);
  } catch {}
  await send("Page.navigate", { url: HUNT_PAGE });
  let hgReady = false;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try {
      s = await evaluate<{ hunt: boolean | null; map: boolean; hook: boolean }>(
        `(()=>{const h=document.getElementById("hunt");return{hunt:h&&!h.hidden,map:!!document.querySelector("#map svg"),hook:typeof window.__vellumZoomTo==="function"};})()`,
      );
    } catch {}
    if (s && s.hunt && s.map && s.hook) {
      hgReady = true;
      break;
    }
    await sleep(75);
  }
  check("HG0 the Hunt boots with the shared zoom controller wired (__vellumZoomTo present)", hgReady);
}

export async function hg1Zoom({ evaluate, check }: SuiteContext): Promise<void> {
  const hg1 = await evaluate<{
    idle: { inline: string; matrix: string; zoomed: boolean; zoomable: boolean; touch: string };
    s: Zoom;
    matrix: string;
    origin: string;
    zoomed: boolean;
  }>(`(()=>{
    const vp=document.getElementById("map-viewport"),m=document.getElementById("map");
    const idle={inline:m.style.transform,matrix:getComputedStyle(m).transform,zoomed:vp.classList.contains("zoomed"),zoomable:vp.classList.contains("zoomable"),touch:getComputedStyle(vp).touchAction};
    window.__vellumZoomTo({k:3,x:-20,y:-15});
    const s=window.__vellumZoomState();const cs=getComputedStyle(m);
    return{idle,s,matrix:cs.transform,origin:cs.transformOrigin,zoomed:vp.classList.contains("zoomed")};
  })()`);
  check(
    "HG1 geometric zoom like the Explorer: idle byte-identical at home, .zoomable/touch-action on, zoomTo lands the matrix",
    hg1.idle.inline === "" &&
      hg1.idle.matrix === "none" &&
      hg1.idle.zoomed === false &&
      hg1.idle.zoomable === true &&
      hg1.idle.touch === "none" &&
      hg1.matrix === "matrix(3, 0, 0, 3, -20, -15)" &&
      hg1.origin === "0px 0px" &&
      hg1.zoomed === true &&
      hg1.s.k === 3 &&
      hg1.s.x === -20 &&
      hg1.s.y === -15,
    JSON.stringify(hg1),
  );
}

export async function hg2Taps(
  { evaluate, check, sleep, mouseTap, mouseDrag, framePoint }: HuntKit,
  tgt: Quarry,
): Promise<void> {
  const stable = makeStable(makeSettle({ evaluate, sleep }));
  const fr = await framePoint(2, tgt.miss.fx, tgt.miss.fy);

  await evaluate(CLICKS.arm);
  await mouseTap(fr.px, fr.py);
  const hg2 = await stable(HG2_READ, "HG2 the miss tap handled", { departed: (d) => d.clicks > 0 });
  check(
    "HG2 a miss tap while zoomed drops a sounding at the tapped spot over #map, and does not solve (AC2)",
    hg2.dots >= 1 && !hg2.inSvg && !hg2.solved && hg2.status.length > 0,
    JSON.stringify(hg2),
  );

  const before = await evaluate<{ solved: boolean; status: string; dots: number }>(
    `(()=>({solved:document.getElementById("map").classList.contains("solved"),status:document.getElementById("hunt-status").textContent,dots:document.querySelectorAll("#map .sounding-dot").length}))()`,
  );
  await mouseDrag(fr.cx, fr.cy, fr.cx + 150, fr.cy + 95);
  await sleep(100, "window: a drag must not solve in it");
  const after = await evaluate<{ solved: boolean; status: string; dots: number }>(
    `(()=>({solved:document.getElementById("map").classList.contains("solved"),status:document.getElementById("hunt-status").textContent,dots:document.querySelectorAll("#map .sounding-dot").length}))()`,
  );
  check(
    "HG3 a drag-pan while zoomed never registers as a guess (AC2: not solved, warmth + soundings unchanged)",
    after.solved === false && after.status === before.status && after.dots === before.dots,
    JSON.stringify({ before, after }),
  );
}

export async function hg4Solves(
  { evaluate, check, shoot, sleep, mouseTap, framePoint }: HuntKit,
  tgt: Quarry,
): Promise<void> {
  const stable = makeStable(makeSettle({ evaluate, sleep }));
  const fr2 = await framePoint(2, tgt.hit.fx, tgt.hit.fy);
  await evaluate(CLICKS.arm);
  await mouseTap(fr2.px, fr2.py);
  const hg4 = await stable(HG4_READ, "HG4 the guess tap handled", { departed: (d) => d.clicks > 0 });
  check(
    "HG4 a guess tap resolves to the correct settlement while zoomed (AC2: solves at k=2 via a real tap)",
    hg4.solved === true && /found it/i.test(hg4.status) && hg4.star === true,
    JSON.stringify({ hg4, state: fr2.state }),
  );
  await shoot("hunt-seed-of-the-day-zoomed.png");
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
}
