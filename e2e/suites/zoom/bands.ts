import type { ZoomKit } from "./kit.ts";

type Target21 = Awaited<ReturnType<typeof z21Target>>;
type Deep21 = Awaited<ReturnType<typeof z21Hamlets>>;

export async function z20dInkDrops({ evaluate, check, waitInked, rgn, goHome, enterAt, waitRedraft }: ZoomKit): Promise<void> {
  await goHome();
  const before20d = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  await waitRedraft(before20d);
  await evaluate(`(()=>{const c=document.getElementById("ages");c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitInked("z20d-survey-ink"); // Issue #300: the ink lands a beat after the tick, so wait for it rather than sleeping
  const chron = await evaluate<{ band: number; committed: boolean; noStamp: boolean; insets: number; trackShown: boolean }>(
    `(()=>{const s=window.__vellumRegion();const svg=document.querySelector("#map > svg");` +
      `return{band:s.band,committed:s.committed,noStamp:!!svg&&!svg.hasAttribute("data-vellum-region-u0"),` +
      `insets:document.querySelectorAll("#map .region-inset").length,trackShown:!!document.querySelector("#map .voyage-overlay .voyage-track")};})()`,
  );
  check(
    "Z20d inking the survey drops the inset back to the bare world sheet (mutual exclusion, no region while the track is inked)",
    chron.band === 0 && chron.committed === false && chron.noStamp && chron.insets === 0 && chron.trackShown,
    JSON.stringify(chron),
  );
  await evaluate(`(()=>{const c=document.getElementById("ages");c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));})()`);
}

export async function z20eCardSurvives({ evaluate, check, sleep, rgn, goHome, enterAt, waitRedraft }: ZoomKit): Promise<void> {
  await goHome();
  const before20e = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  const e20e1 = await waitRedraft(before20e);
  const pinnedName = await evaluate<string | null>(`(()=>{
    const hits=[...document.querySelectorAll("#map .place-hit")];
    if(!hits.length) return null;
    const vp=document.getElementById("map-viewport").getBoundingClientRect();
    const cx=vp.left+vp.width/2, cy=vp.top+vp.height/2;
    let best=null,bd=1e9;
    for(const h of hits){const r=h.getBoundingClientRect();const d=Math.hypot(r.left+r.width/2-cx,r.top+r.height/2-cy);if(d<bd){bd=d;best=h;}}
    best.click();
    const nm=document.querySelector("#place-card .pc-name");
    return nm?nm.textContent:null;
  })()`);
  await enterAt(3.6, 0.5, 0.5); // past the 1/2 up-cross: the next finer band, same centre
  await waitRedraft(e20e1.redrafts);
  await sleep(80);
  const kept = await evaluate<{ hidden: boolean; name: string | null; zoomK: string }>(
    `(()=>{const card=document.getElementById("place-card");const nm=card.querySelector(".pc-name");` +
      `return{hidden:card.hidden,name:nm?nm.textContent:null,zoomK:card.style.getPropertyValue("--zoom-k")};})()`,
  );
  check(
    "Z20e a pinned card survives a redraft keyed by NAME and keeps its counter-scale (fresh card carries --zoom-k)",
    !!pinnedName && kept.hidden === false && kept.name === pinnedName && kept.zoomK === "3.6",
    `pinned=${JSON.stringify(pinnedName)} afterRedraft=${JSON.stringify(kept)} (zoomK expected "3.6")`,
  );
  await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))`);
}

export async function z20fStepsDown({ check, sleep, rgn, goHome, enterAt, waitRedraft, insetView }: ZoomKit): Promise<void> {
  await goHome();
  const before20f = (await rgn()).redrafts;
  await enterAt(8, 0.5, 0.5);
  const deep20f = await waitRedraft(before20f);
  await enterAt(4, 0.5, 0.5);
  const step20f = await waitRedraft(deep20f.redrafts);
  let view20f = await insetView();
  for (let i = 0; i < 50 && view20f.insets !== 1; i++) { await sleep(40); view20f = await insetView(); }
  check(
    "Z20f a partial zoom-out steps down ONE band in place: inset swaps, world sheet visible, camera un-snapped (review quirk 3)",
    deep20f.band === 3 && step20f.band === 2 && step20f.committed === true &&
      view20f.insets === 1 && view20f.stamped && view20f.worldMounted && view20f.zk === 4,
    `band ${deep20f.band}->${step20f.band} insets=${view20f.insets} world=${view20f.worldMounted} k=${view20f.zk} (expected 4)`,
  );
}

export async function z20gInkBlocks({ evaluate, check, sleep, waitInked, rgn, goHome, enterAt, waitRedraft }: ZoomKit): Promise<void> {
  await goHome();
  const before20g = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  const reg20g = await waitRedraft(before20g);
  await evaluate(`(()=>{const v=document.getElementById("ages");v.checked=true;v.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitInked("z20g-survey-ink"); // Issue #300: as Z20d, the ink is a beat behind the tick
  const von = await evaluate<{ band: number; committed: boolean; insets: number; track: boolean; k: number }>(
    `(()=>{const s=window.__vellumRegion();return{band:s.band,committed:s.committed,` +
      `insets:document.querySelectorAll("#map .region-inset").length,track:!!document.querySelector("#map .voyage-overlay"),` +
      `k:window.__vellumZoomState().k};})()`,
  );
  await enterAt(2, 0.35, 0.35); // a settle while the track is inked: must NOT redraft
  await sleep(600); // past the debounce + any would-be dispatch
  const vsettle = await rgn();
  await evaluate(`(()=>{const v=document.getElementById("ages");v.checked=false;v.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  check(
    "Z20g the survey ink drops the inset, homes the camera on arming (ratified 2026-07-26), and blocks the redraft",
    von.band === 0 && von.committed === false && von.insets === 0 && von.track && von.k === 1 &&
      vsettle.redrafts === reg20g.redrafts && vsettle.band === 0,
    `on-toggle ${JSON.stringify(von)} settleWhileInked redrafts=${vsettle.redrafts}(==${reg20g.redrafts}) band=${vsettle.band}`,
  );
}

export async function z21Target({ evaluate, goHome }: ZoomKit) {
  await goHome();
  const target21 = await evaluate<{ cx: number; cy: number; n: number }>(
    `(async()=>{const {defaultRecipe,generateWorld}=await import("/explorer/engine/world/generate.js");` +
      `const {hamletCandidates}=await import("/explorer/engine/society/hamlets.js");` +
      `const {quantizeCenter,lodWindowFor,LOD_BANDS}=await import("/explorer/engine/world/lod.js");` +
      `const {marginFor}=await import("/explorer/engine/render/transform.js");` +
      `const world=generateWorld(defaultRecipe(42,{gridW:320,gridH:240}));` +
      `const size=LOD_BANDS[LOD_BANDS.length-1].sizeUV;let best=null;` +
      `for(const s of world.settlements){` +
      `const q=quantizeCenter(s.x/(world.recipe.gridW-1),s.y/(world.recipe.gridH-1),size);` +
      `const n=hamletCandidates(world,lodWindowFor(q.cx,q.cy,size)).length;` +
      `if(!best||n>best.n)best={q,n};}` +
      `const svg=document.querySelector("#map > svg");const vb=svg.getAttribute("viewBox").split(" ").map(Number);` +
      `const m=marginFor(vb[2]);const mx=m/vb[2],my=m/vb[3];` +
      `return {cx:mx+best.q.cx*(1-2*mx),cy:my+best.q.cy*(1-2*my),n:best.n};})()`,
    true,
  );
  return target21;
}

export async function z21Hamlets({ evaluate, check, shoot, sleep, rgn, enterAt, waitRedraft, insetView }: ZoomKit, target21: Target21) {
  const before21 = (await rgn()).redrafts;
  await enterAt(8, target21.cx, target21.cy);
  const deep21 = await waitRedraft(before21);
  let view21 = await insetView();
  for (let i = 0; i < 50 && view21.insets !== 1; i++) { await sleep(40); view21 = await insetView(); }
  await shoot("explorer-hamlets-band3.png");
  const dom21 = await evaluate<{ err?: "no inset"; hamlets?: number; expected?: number; ordered?: boolean; outside?: number; namesMatch?: boolean }>(
    `(async()=>{const isvg=document.querySelector("#map .region-inset svg");if(!isvg)return{err:"no inset"};` +
      `const win={u0:+isvg.getAttribute("data-vellum-region-u0"),v0:+isvg.getAttribute("data-vellum-region-v0"),` +
      `u1:+isvg.getAttribute("data-vellum-region-u1"),v1:+isvg.getAttribute("data-vellum-region-v1")};` +
      `const tiers=[...isvg.querySelectorAll("g.settlement")].map(g=>g.dataset.tier);` +
      `const RANK={capital:0,seat:1,town:2,village:3,hamlet:4};` +
      `const ordered=tiers.every((t,i)=>i===0||RANK[t]>=RANK[tiers[i-1]]);` +
      `const domNames=[...isvg.querySelectorAll('g.settlement[data-tier="hamlet"]')].map(g=>g.dataset.name);` +
      `const outside=document.querySelectorAll('#map > svg g.settlement[data-tier="hamlet"]').length;` +
      `const {defaultRecipe,generateWorld}=await import("/explorer/engine/world/generate.js");` +
      `const {generateRegionWorld}=await import("/explorer/engine/world/region.js");` +
      `const world=generateWorld(defaultRecipe(42,{gridW:320,gridH:240}));` +
      `const region=generateRegionWorld(world,{window:win,gridW:320,gridH:240,title:"parity",detail:true});` + // Issue #400: the Glass draws every region band detailed, so the parity arm must too
      `const engine=region.settlements.filter(s=>s.kind==="hamlet").map(s=>s.name);` +
      `const names=new Set(engine);` +
      `return {hamlets:domNames.length,expected:engine.length,ordered,outside,` +
      `namesMatch:domNames.every(n=>names.has(n))};})()`,
    true,
  );
  check(
    "Z21 hamlets: the deepest band grows the smallest tier, engine count/name parity over the stamped window, tier order held",
    deep21.band === 3 && dom21.hamlets! >= 3 && dom21.hamlets === dom21.expected &&
      dom21.namesMatch && dom21.ordered && dom21.outside === 0,
    `band=${deep21.band} dom=${dom21.hamlets} engine=${dom21.expected} ordered=${dom21.ordered} ` +
      `namesMatch=${dom21.namesMatch} worldSheetHamlets=${dom21.outside} (scouted n=${target21.n})`,
  );
  return deep21;
}

export async function z21bOneBandUp({ evaluate, check, sleep, enterAt, waitRedraft, insetView }: ZoomKit, target21: Target21, deep21: Deep21): Promise<void> {
  await enterAt(4, target21.cx, target21.cy);
  const step21 = await waitRedraft(deep21.redrafts);
  let view21b = await insetView();
  for (let i = 0; i < 50 && view21b.insets !== 1; i++) { await sleep(40); view21b = await insetView(); }
  const shallow21 = await evaluate<number>(
    `(()=>{const isvg=document.querySelector("#map .region-inset svg");` +
      `return isvg?isvg.querySelectorAll('g.settlement[data-tier="hamlet"]').length:-1;})()`,
  );
  check(
    "Z21b hamlets vanish one band up: the band-2 survey of the same centre draws none",
    step21.band === 2 && shallow21 === 0,
    `band=${step21.band} band2Hamlets=${shallow21}`,
  );
}

export async function zRestore({ evaluate, waitSettled, goHome }: ZoomKit): Promise<void> {
  await goHome();
  await evaluate(`window.__vellumSetRedraftEnabled(false)`); // Issue #169: geometric-only again for the suites that follow

  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  await evaluate(`(()=>{const c=document.getElementById("ages");if(c.checked){c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));}document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("draw").click();})()`);
  await waitSettled("post-zoom-restore");
}
