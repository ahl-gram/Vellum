// Daily Hunt e2e (H1-H12, HD, HG) on the seed-of-the-day page.
import { seedForDate } from "../../src/world/seed-of-the-day.ts";
import { dropExpectedCancellations } from "../support/console.ts";
import { onDay } from "../support/fixed-day.ts";
import { makeStep } from "../support/step.ts";
import type { SuiteContext } from "../types.ts";
import { FORMER_DAY, h5cFormerName } from "./hunt/former.ts";
import { huntQuarry, type Frac } from "./hunt/quarry.ts";
import { huntRoom } from "./hunt/room.ts";
import { hd1Dispatch, h8Reload } from "./hunt/solved.ts";
import { hg0Boots, hg1Zoom, hg2Taps, hg4Solves } from "./hunt/zoomed.ts";

export type Zoom = { k: number; x: number; y: number };
export type HuntKit = ReturnType<typeof huntKit>;
export type Quarry = Awaited<ReturnType<typeof huntQuarry>>;
type Guess = Awaited<ReturnType<HuntKit["clickHunt"]>>;
const bandRank = (s: string) =>
  /^Hot/.test(s) ? 3 : /^Warmer/.test(s) ? 2 : /^Cool/.test(s) ? 1 : /^Cold/.test(s) ? 0 : -1;
// 2026-10-26: the first day on or after FIXED_DAY whose hunt gives hunt H11 and H12 a clue each to check (count 1 and 1 on CI run 37646917465 of 2026-10-07; FIXED_DAY's world gives 0 and 0, run 37379661660).
const HUNT_DAY = Date.UTC(2026, 9, 7, 12);
const HUNT_SEED = seedForDate(new Date(HUNT_DAY));

export async function run(ctx: SuiteContext): Promise<void> {
  const step = makeStep(ctx);
  await onDay(ctx, HUNT_DAY, () => huntSuite(ctx));
  await onDay(ctx, FORMER_DAY, () => step("H5c", () => h5cFormerName(huntKit(ctx))));
}

async function huntSuite(ctx: SuiteContext): Promise<void> {
  const { consoleErrors, PORT } = ctx;
  const huntErrBase = consoleErrors.length;
  const HUNT_PAGE = `http://127.0.0.1:${PORT}/seed-of-the-day/`;
  const k = huntKit(ctx);
  const step = makeStep(ctx);
  await h1Opens(ctx, HUNT_PAGE);
  await huntRoom(ctx);
  await h2Clues(ctx);
  const tgt = await huntQuarry(ctx, HUNT_SEED);
  const miss = await h3Miss(k, tgt);
  await h3bWarmer(k, tgt, miss);
  await h4Solves(k, tgt);
  await hd1Dispatch(ctx, tgt);
  await h8Reload(ctx, HUNT_PAGE);
  await hg0Boots(ctx, HUNT_PAGE);
  await hg1Zoom(ctx);
  await step("HG2, HG3", () => hg2Taps(k, tgt));
  await step("HG4", () => hg4Solves(k, tgt));
  h9Clean(ctx, huntErrBase);
  h10LegendClear(ctx, tgt);
  await h11Labels(ctx);
  await h12Terrain(ctx, tgt);
}

function huntKit(ctx: SuiteContext) {
  const { evaluate, send } = ctx;
  const clickHunt = (f: Frac) =>
    evaluate<{ status: string; solved: boolean }>(
      `(()=>{const svg=document.querySelector("#map svg");const r=svg.getBoundingClientRect();svg.dispatchEvent(new MouseEvent("click",{clientX:r.left+${f.fx}*r.width,clientY:r.top+${f.fy}*r.height,bubbles:true}));return{status:document.getElementById("hunt-status").textContent,solved:document.getElementById("map").classList.contains("solved")};})()`,
    );
  const mouseTap = async (x: number, y: number) => {
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", buttons: 1, clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", buttons: 0, clickCount: 1 });
  };
  const mouseDrag = async (x0: number, y0: number, x1: number, y1: number) => {
    await send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      x: x0,
      y: y0,
      button: "left",
      buttons: 1,
      clickCount: 1,
    });
    await send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: Math.round((x0 + x1) / 2),
      y: Math.round((y0 + y1) / 2),
      buttons: 1,
    });
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: x1, y: y1, buttons: 1 });
    await send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x: x1,
      y: y1,
      button: "left",
      buttons: 0,
      clickCount: 1,
    });
  };
  // The MISS tap frames the CAPITAL, never a viewport corner: classifyClick snaps to the nearest settlement with no distance cap, and the old farthest-corner scan was a per-day lottery that solved the hunt on linux CI (Issue #304). Since Issue #462 the sheet is fitted inside the stage, so the point is read off the svg's OWN rect at home, never as a fraction of the viewport.
  const framePoint = (k: number, fx: number, fy: number) =>
    evaluate<{ px: number; py: number; cx: number; cy: number; state: Zoom }>(`(()=>{
    const vp=document.getElementById("map-viewport"),W=vp.clientWidth,H=vp.clientHeight,k=${k};
    window.__vellumZoomTo({k:1,x:0,y:0});
    const svg=document.querySelector("#map svg"),home=svg.getBoundingClientRect(),vr=vp.getBoundingClientRect();
    const px0=home.left-vr.left+${fx}*home.width,py0=home.top-vr.top+${fy}*home.height;
    window.__vellumZoomTo({k,x:W/2-k*px0,y:H/2-k*py0});
    const sr=svg.getBoundingClientRect();
    return{px:Math.round(sr.left+${fx}*sr.width),py:Math.round(sr.top+${fy}*sr.height),
      cx:Math.round(vr.left+vr.width/2),cy:Math.round(vr.top+vr.height/2),state:window.__vellumZoomState()};
  })()`);
  return { ...ctx, clickHunt, mouseTap, mouseDrag, framePoint };
}

async function h1Opens({ evaluate, send, check, sleep }: SuiteContext, HUNT_PAGE: string): Promise<void> {
  try {
    await evaluate(`localStorage.removeItem("vellum.hunt.v1")`);
  } catch {}
  await send("Page.navigate", { url: HUNT_PAGE });
  let huntReady = false;
  for (let i = 0; i < 200; i++) {
    // evaluate can land in a context destroyed by the in-flight navigation; swallow and retry.
    let s = null;
    try {
      s = await evaluate<{ hunt: boolean | null; clues: number; map: boolean }>(
        `(()=>{const h=document.getElementById("hunt");const c=document.getElementById("clues");return{hunt:h&&!h.hidden,clues:c?c.children.length:0,map:!!document.querySelector("#map svg")};})()`,
      );
    } catch {}
    if (s && s.hunt && s.clues >= 3 && s.map) {
      huntReady = true;
      break;
    }
    await sleep(75);
  }
  check("H1 seed-of-the-day hunt card appears with >=3 clues over a rendered map", huntReady);
}

async function h2Clues({ evaluate, check }: SuiteContext): Promise<void> {
  const clueText = await evaluate<string>(
    `Array.from(document.getElementById("clues").children).map((li)=>li.textContent).join(" | ")`,
  );
  check("H2 clues never disclose ruin/abandon wording", !/ruin|abandon/i.test(clueText));
}

async function h3Miss({ evaluate, check, clickHunt }: HuntKit, tgt: Quarry): Promise<Guess> {
  const miss = await clickHunt(tgt.miss);
  check(
    "H3 a miss anchors the selected town to the click, reports warmer/colder prose, and does not solve (#327)",
    miss.status.length > 0 && !miss.solved && /You mark /.test(miss.status) && !/warmest sounding/.test(miss.status),
    JSON.stringify(miss),
  );

  const snd = await evaluate<{ dots: number; inSvg: boolean; pe: string | null }>(
    `(()=>{const d=document.querySelector("#map .sounding-dot");return{dots:document.querySelectorAll("#map .sounding-dot").length,inSvg:!!document.querySelector("#map svg .sounding-dot"),pe:d?getComputedStyle(d).pointerEvents:null};})()`,
  );
  check(
    "H3c a miss drops a pointer-transparent sounding over the map, never inside the SVG",
    snd.dots >= 1 && !snd.inSvg && snd.pe === "none",
    JSON.stringify(snd),
  );
  return miss;
}

async function h3bWarmer({ check, clickHunt }: HuntKit, tgt: Quarry, miss: Guess): Promise<void> {
  // The probe sits at 0.4 of the way, NOT halfway: the exact midpoint ties capital vs quarry and float noise in the rect roundtrip can snap it to the quarry (~1 day in 5), silently solving and vacating H4's coverage.
  const near = {
    fx: tgt.miss.fx + 0.4 * (tgt.hit.fx - tgt.miss.fx),
    fy: tgt.miss.fy + 0.4 * (tgt.hit.fy - tgt.miss.fy),
  };
  const nearMiss = await clickHunt(near);
  check(
    "H3b a click nearer the quarry never reads colder than a far click, and a new warmest stays silent (#327)",
    !nearMiss.solved &&
      bandRank(nearMiss.status) >= bandRank(miss.status) &&
      bandRank(nearMiss.status) >= 0 &&
      !/warmest sounding/.test(nearMiss.status),
    JSON.stringify({ far: miss.status, near: nearMiss.status }),
  );

  const warmName = (nearMiss.status.match(/You mark ([^.]+)\./) || [])[1] || "";
  const again = await clickHunt(tgt.miss);
  const wantTrail = warmName !== "" && warmName !== tgt.missName;
  check(
    "H3d a colder miss cites the warmest sounding by name, silent on a same-town repeat (#327)",
    !again.solved &&
      again.status.includes(`You mark ${tgt.missName}.`) &&
      (wantTrail
        ? again.status.includes(`Your warmest sounding yet fell at ${warmName}.`)
        : !/warmest sounding/.test(again.status)),
    JSON.stringify({ again: again.status, warmName, missName: tgt.missName }),
  );
}

async function h4Solves({ evaluate, check, clickHunt }: HuntKit, tgt: Quarry): Promise<void> {
  const won = await clickHunt(tgt.hit);
  check(
    "H4 clicking the quarry snaps to it and solves the hunt",
    won.solved === true && /found it/i.test(won.status),
    JSON.stringify(won),
  );

  const post = await evaluate<{
    reveal: boolean | null;
    revealText: string;
    star: boolean;
    share: boolean | null;
    streak: string;
    ls: string | null;
  }>(
    `(()=>{const rev=document.getElementById("reveal");const star=document.querySelector("#map .hunt-star");const share=document.getElementById("share");return{reveal:rev&&!rev.hidden,revealText:rev?rev.textContent:"",star:!!star,share:share&&!share.hidden,streak:document.getElementById("streak").textContent,ls:localStorage.getItem("vellum.hunt.v1")};})()`,
  );
  check(
    "H5 reveal names the found place and its founding year",
    post.reveal && post.revealText.includes(tgt.name) && /founded in the year/i.test(post.revealText),
    post.revealText.slice(0, 80),
  );
  check(
    "H5b the reveal names what the place was once called, or says nothing (#49)",
    tgt.formerName ? post.revealText.includes(`Once called ${tgt.formerName}.`) : !/Once called/.test(post.revealText),
    JSON.stringify({ formerName: tgt.formerName ?? null, text: post.revealText.slice(0, 120) }),
  );
  check("H6 a win marker overlays the map and the Share button appears", post.star && post.share);
  check(
    "H7 streak + localStorage persist, keyed on the day's seed",
    /Streak: 1 day/.test(post.streak) && new RegExp(`"solved":${tgt.seed},"streak":1`).test(post.ls || ""),
    `${post.streak} | ${post.ls}`,
  );

  const wire = await evaluate<{
    starStamp: boolean;
    starAnim: string | null;
    revUnfurl: boolean;
    revAnim: string | null;
  }>(
    `(()=>{const s=document.querySelector("#map .hunt-star");const rev=document.getElementById("reveal");return{starStamp:!!(s&&s.classList.contains("stamp")),starAnim:s?getComputedStyle(s).animationName:null,revUnfurl:!!(rev&&rev.classList.contains("unfurl")),revAnim:rev?getComputedStyle(rev).animationName:null};})()`,
  );
  check(
    "H6b a live solve wires the win ceremony (star stamps in, reveal unfurls)",
    wire.starStamp && wire.starAnim === "huntStarIn" && wire.revUnfurl && wire.revAnim === "paperUnfurl",
    JSON.stringify(wire),
  );
}

function h9Clean(ctx: SuiteContext, huntErrBase: number): void {
  const { check, consoleErrors } = ctx;
  const huntErrs = dropExpectedCancellations(consoleErrors.slice(huntErrBase));
  check(
    "H9 the hunt run logged no JS exceptions or console errors",
    huntErrs.length === 0,
    huntErrs.join(" | ") || "clean",
  );
}

function h10LegendClear({ check }: SuiteContext, tgt: Quarry): void {
  const hitInLegend =
    !!tgt.legFrac &&
    tgt.hit.fx >= tgt.legFrac.x0 &&
    tgt.hit.fx <= tgt.legFrac.x1 &&
    tgt.hit.fy >= tgt.legFrac.y0 &&
    tgt.hit.fy <= tgt.legFrac.y1;
  check(
    "H10 the day's quarry sits clear of the rendered legend",
    !!tgt.legFrac && !hitInLegend,
    JSON.stringify({ leg: tgt.legFrac, hit: tgt.hit }),
  );
}

async function h11Labels({ evaluate, check }: SuiteContext): Promise<void> {
  // Capital/seat labels render .toUpperCase() (settlementsLayer), so the name check accepts either spelling.
  const labelCheck = await evaluate<{ count: number; missing: string[] }>(`(()=>{
    const svg=document.querySelector("#map svg");
    const html=svg?svg.outerHTML:"";
    const lis=Array.from(document.getElementById("clues").children).map((li)=>li.textContent);
    const names=[];
    for(const t of lis){
      let m=t.match(/within sight of the river (.+)\\.$/);
      if(m){names.push(m[1]);continue;}
      m=t.match(/takes in the waters of (.+)\\.$/);
      if(m){names.push(m[1]);continue;}
      m=t.match(/within \\d+ leagues of (.+)\\.$/);
      if(m){names.push(m[1]);}
    }
    const missing=names.filter((n)=>!html.includes(">"+n+"<")&&!html.includes(">"+n.toUpperCase()+"<"));
    return{count:names.length,missing};
  })()`);
  check(
    "H11 every displayed river/lake/near clue names something the chart labeled, and the hunt's day shows at least one",
    labelCheck.count >= 1 && labelCheck.missing.length === 0,
    JSON.stringify(labelCheck),
  );
}

async function h12Terrain({ evaluate, check }: SuiteContext, tgt: Quarry): Promise<void> {
  const terrainCheck = await evaluate<{ count: number; missing: string[] }>(`(()=>{
    const TEXTS={
      "It sits in the shadow of the mountains.":"gl-mtn",
      "Hill country rises all about it.":"gl-hill",
      "Deep woods stand close about it.":"gl-tree",
      "Marshland lies hard by its bounds.":"gl-marsh",
      "Desert sands lie hard by its bounds.":"gl-dune"};
    const svg=document.querySelector("#map svg");
    if(!svg)return{count:0,missing:["no svg"]};
    const lis=Array.from(document.getElementById("clues").children).map((li)=>li.textContent);
    const bands=lis.filter((t)=>TEXTS[t]).map((t)=>TEXTS[t]);
    if(bands.length===0)return{count:0,missing:[]};
    const qx=${tgt.hit.fx}*${tgt.wpx};
    const qy=${tgt.hit.fy}*${tgt.hpx};
    const radius=4*${tgt.scale};
    const uses=Array.from(svg.querySelectorAll("#layer-glyphs use")).map((u)=>{
      const m=/translate\\((-?[\\d.]+) (-?[\\d.]+)\\)/.exec(u.getAttribute("transform")||"");
      return m?{href:u.getAttribute("href")||"",x:+m[1],y:+m[2]}:null;
    }).filter(Boolean);
    const missing=bands.filter((p)=>!uses.some((u)=>u.href.startsWith("#"+p)&&Math.hypot(u.x-qx,u.y-qy)<=radius));
    return{count:bands.length,missing};
  })()`);
  check(
    "H12 every displayed terrain clue has its glyphs drawn near the quarry, and the hunt's day shows at least one",
    terrainCheck.count >= 1 && terrainCheck.missing.length === 0,
    JSON.stringify(terrainCheck),
  );
}
