import type { SuiteContext } from "../../types.ts";
import type { ZoomKit } from "./kit.ts";
import type { Cam } from "./reads.ts";

export async function z15RegionCrop({ evaluate, check }: SuiteContext): Promise<void> {
  // The crop is proven by projected-settlement COUNT: integer counts are immune to the cross-engine float drift that bars an SVG byte compare here.
  const z15 = await evaluate<{ ok: boolean; hasSvg: boolean; stamped: boolean; regionSheet: boolean; windowEcho: boolean; bandEcho: boolean; parsed: boolean; manifestOk: boolean; isCrop: boolean; places: number; worldPlaces: number }>(
    `(async()=>{const win={u0:0.375,v0:0.375,u1:0.625,v1:0.625};` +
      `const r=await window.__vellumRunJob({kind:"region",seed:42,overrides:{},window:win,band:2,gridW:320,gridH:240,title:"Survey",render:{style:"antique",widthPx:1500,legend:true}});` +
      `const w=await window.__vellumRunJob({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}});` +
      `const {recipeFromSvg}=await import("./engine/render/recipe-meta.js");const p=recipeFromSvg(r.svg);` +
      `const places=Array.isArray(r.manifest.places)?r.manifest.places:[];const wPlaces=Array.isArray(w.manifest.places)?w.manifest.places.length:-1;` +
      `return{ok:r.ok,hasSvg:typeof r.svg==="string"&&r.svg.length>2000,stamped:r.svg.includes('data-vellum-region-u0='),` +
      `regionSheet:r.svg.includes('region-land-clip'),windowEcho:JSON.stringify(r.window)===JSON.stringify(win),bandEcho:r.band===2,` +
      `parsed:!!p&&!!p.region&&Math.abs(p.region.window.u0-win.u0)<1e-9,` +
      `manifestOk:places.length>0&&places.every(pl=>Number.isFinite(pl.nx)&&Number.isFinite(pl.ny)),` +
      `isCrop:places.length>0&&places.length<wPlaces,places:places.length,worldPlaces:wPlaces};})()`,
    true,
  );
  check(
    "Z15 a region job returns a stamped regional CROP of the world (AC1: subset of places, finer terrain unit-tested + in out/)",
    z15.ok && z15.hasSvg && z15.stamped && z15.regionSheet && z15.windowEcho && z15.bandEcho && z15.parsed && z15.manifestOk && z15.isCrop,
    JSON.stringify(z15),
  );
}

export async function z16CacheHit({ evaluate, check }: SuiteContext): Promise<void> {
  const z16 = await evaluate<{ aOk: boolean; bOk: boolean; aCached: boolean; bCached: boolean; sameSvg: boolean; ta: number; tb: number }>(
    `(async()=>{await window.__vellumRunJob({kind:"draw",seed:117,overrides:{},render:{style:"antique",widthPx:1500}});` +
      `const win={u0:0.375,v0:0.375,u1:0.625,v1:0.625};` +
      `const mk=()=>({kind:"region",seed:918273,overrides:{},window:win,band:2,gridW:320,gridH:240,title:"Survey",render:{style:"antique",widthPx:1500}});` +
      `const t0=performance.now();const a=await window.__vellumRunJob(mk());const t1=performance.now();const b=await window.__vellumRunJob(mk());const t2=performance.now();` +
      `return{aOk:a.ok,bOk:b.ok,aCached:a.cached,bCached:b.cached,sameSvg:a.svg===b.svg,ta:Math.round(t1-t0),tb:Math.round(t2-t1)};})()`,
    true,
  );
  check(
    "Z16 a repeat region job at the same seed skips generateWorld (AC2: cache hit via the cached flag)",
    z16.aOk && z16.bOk && z16.aCached === false && z16.bCached === true && z16.sameSvg,
    `miss=${z16.aCached} hit=${z16.bCached} sameSvg=${z16.sameSvg} (ta=${z16.ta}ms tb=${z16.tb}ms, timing is corroboration only)`,
  );
}

export async function z17Inset({ evaluate, check, shoot, sleep, rgn, goHome, enterAt, waitRedraft, captionMs, insetView }: ZoomKit): Promise<void> {
  // Warm up first: Z15/Z16 left another seed in the worker's single-entry world cache and the first region gen pays one-time JIT, so a cold run would not log the steady-state redraft ms.
  const warm0 = (await rgn()).redrafts;
  await enterAt(2, 0.4, 0.4);
  await waitRedraft(warm0);
  await goHome();
  const before17 = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  const s17 = await waitRedraft(before17);
  const drawMs17 = await captionMs();
  // The CAMERA is read at the commit, which is what this check is named for (a settle must not move it); the inset geometry cannot be, because insetView reads the FIRST .region-inset and during a crossing that is the OUTGOING sheet (Issue #400's held chain cache lands this band-1 draw in ~300ms, mid-crossfade, and the outgoing sheet is torn down only on the incoming's transitionend with a 700ms fallback), so geometry is read once the pair has resolved, and a pair left mounted for good still fails on the count.
  const atCommit = await insetView();
  let view17 = atCommit;
  for (let i = 0; i < 50 && view17.insets !== 1; i++) { await sleep(40); view17 = await insetView(); }
  const W17 = await evaluate<number>(`document.getElementById("map-viewport").clientWidth`);
  check(
    "Z17 a settle redrafts one finer survey as an inset; the camera does not move at the commit (AC1)",
    s17.band === 1 && s17.committed === true && /^The Environs of .+/.test(s17.title || "") &&
      s17.redrafts === before17 + 1 && view17.worldMounted && view17.insets === 1 && view17.stamped &&
      Math.abs(view17.insetLeft - 25) < 0.01 && Math.abs(view17.insetW - 50) < 0.01 &&
      view17.hits > 0 && /drawn in \d+ms/.test(view17.caption) &&
      atCommit.zk === 2 && Math.abs(atCommit.zx - -W17 / 2) < 0.5,
    `${JSON.stringify(s17)} inset=${view17.insets}(at commit ${atCommit.insets})@${view17.insetLeft}%/${view17.insetW}% stamped=${view17.stamped} world=${view17.worldMounted} ` +
      `hits=${view17.hits} camera k=${atCommit.zk} x=${atCommit.zx} (expected ${-W17 / 2}) settle->sheet=${drawMs17}ms (AC3 target ~400ms desktop)`,
  );
  await sleep(400); // let the crossfade land so the artifact shows the committed (opaque) inset
  await shoot("explorer-sub8-region-band1.png");
}

export async function zInsetContextShot({ shoot, sleep, enterAt }: ZoomKit): Promise<void> {
  await enterAt(1.35, 0.5, 0.5);
  await sleep(600);
  await shoot("explorer-sub8-inset-context.png");
}

export async function z18Pan({ evaluate, check, sleep, rgn, goHome, enterAt, waitRedraft }: ZoomKit): Promise<void> {
  await goHome();
  const before18 = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  const enter18 = await waitRedraft(before18); // window A, band 1, centred 0.5
  await enterAt(2.2, 0.5, 0.5);
  await sleep(500); // well past the 250ms settle debounce; assert NO new commit
  const same18 = await rgn();
  await enterAt(2, 0.42, 0.42);
  const new18 = await waitRedraft(same18.redrafts);
  const pan18 = await evaluate<Cam>(`window.__vellumZoomState()`);
  const W18 = await evaluate<number>(`document.getElementById("map-viewport").clientWidth`);
  const pannedTo = -0.34 * W18; // x = W/2 - 0.42*2*W
  check(
    "Z18 pan works at a committed band and re-drafts only on a new quantized window (AC2 + review quirk 1)",
    same18.redrafts === enter18.redrafts && new18.redrafts === same18.redrafts + 1 &&
      JSON.stringify(new18.window) !== JSON.stringify(enter18.window) &&
      new18.band === 1 && Math.abs(pan18.x - pannedTo) < 0.5,
    `A=${JSON.stringify(enter18.window)} inWindow=${same18.redrafts}(==${enter18.redrafts}) B=${JSON.stringify(new18.window)} ` +
      `pan x=${pan18.x} (expected ${pannedTo}, a dead pan would sit at ${-0.5 * W18})`,
  );
}

export async function z19RapidSettles({ evaluate, check, sleep, rgn, goHome, waitRedraft }: ZoomKit): Promise<void> {
  await goHome();
  const before19 = (await rgn()).redrafts;
  await evaluate(
    `(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;` +
      `const z=(cu,cv)=>window.__vellumZoomTo({k:2,x:W/2-cu*2*W,y:H/2-cv*2*H});z(0.35,0.35);z(0.5,0.5);z(0.62,0.62);})()`,
  );
  const s19 = await waitRedraft(before19);
  await sleep(500); // any superseded straggler would land here; assert it did not
  const after19 = await rgn();
  check(
    "Z19 rapid settles commit only the last (AC2: one redraft despite three framings)",
    s19.redrafts === before19 + 1 && after19.redrafts === before19 + 1 && after19.band === 1,
    `redrafts ${before19}->${after19.redrafts} (expected +1), band=${after19.band}`,
  );
}

export async function z19bSupersession({ evaluate, check, sleep, rgn, goHome, enterAt }: ZoomKit): Promise<void> {
  await goHome();
  const before19b = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  await sleep(350); // past the debounce: the region job is now in flight in the worker
  await goHome(); // bumps regionGen mid-flight; the job's commit must be dropped
  await sleep(1200); // the worker resolved long since; assert the result went nowhere
  const after19b = await rgn();
  const insets19b = await evaluate<number>(`document.querySelectorAll("#map .region-inset").length`);
  check(
    "Z19b a home while a redraft is in flight drops the resolved job (the regionGen supersession guard)",
    after19b.redrafts === before19b && after19b.band === 0 && after19b.committed === false && insets19b === 0,
    `redrafts ${before19b}->${after19b.redrafts} (expected unchanged) band=${after19b.band} insets=${insets19b}`,
  );
}

export async function z20ZoomOutDrops({ evaluate, check, sleep, rgn, goHome, enterAt, waitRedraft, insetView }: ZoomKit): Promise<void> {
  await goHome();
  const before20 = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  const reg20 = await waitRedraft(before20);
  const regionCommitted = reg20.committed === true && reg20.band === 1 && /^The Environs of .+/.test(reg20.title || "");
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`); // under the 0/1 down-cross
  let world20 = reg20;
  for (let i = 0; i < 100; i++) { world20 = await rgn(); if (world20.band === 0) break; await sleep(40); }
  let gone20 = -1; // the inset teardown trails the revert by the fade; poll it to zero
  for (let i = 0; i < 50; i++) { gone20 = await evaluate<number>(`document.querySelectorAll("#map .region-inset").length`); if (gone20 === 0) break; await sleep(40); }
  const worldView = await insetView();
  check(
    "Z20 a zoom-out drops the inset over the always-present world sheet (committed state reverts, camera un-snapped)",
    regionCommitted && world20.band === 0 && world20.committed === false && gone20 === 0 &&
      worldView.worldMounted && worldView.hits > 0 && worldView.zk === 1,
    `committedRegion=${regionCommitted} -> band=${world20.band} committed=${world20.committed} insets=${gone20} world=${worldView.worldMounted} hits=${worldView.hits} k=${worldView.zk}`,
  );
}

export async function z20bReducedMotion({ evaluate, send, check, rgn, goHome, enterAt, waitRedraft }: ZoomKit): Promise<void> {
  await goHome();
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const beforeRm = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  const rm = await waitRedraft(beforeRm);
  const rmView = await evaluate<{ count: number; opaque: boolean }>(
    `(()=>{const ins=[...document.querySelectorAll("#map .region-inset")];` +
      `return{count:ins.length,opaque:ins.length===1&&ins[0].classList.contains("in")};})()`,
  );
  check(
    "Z20b reduced motion redrafts instantly (AC4: one inset, committed opaque, no transition path)",
    rm.band === 1 && rm.redrafts === beforeRm + 1 && rmView.count === 1 && rmView.opaque,
    `band=${rm.band} redrafts ${beforeRm}->${rm.redrafts} insets=${JSON.stringify(rmView)}`,
  );
  await send("Emulation.setEmulatedMedia", { features: [] });
}

export async function z20cThrottle({ send, check, rgn, goHome, enterAt, waitRedraft, captionMs }: ZoomKit): Promise<void> {
  // CDP's setCPUThrottlingRate does NOT slow the Web Worker, so this mainly proves the redraft never blocks the main thread; the ms is corroboration.
  await goHome();
  await send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const beforePerf = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  const perf = await waitRedraft(beforePerf);
  const perfMs = await captionMs();
  await send("Emulation.setCPUThrottlingRate", { rate: 1 });
  check(
    "Z20c settle-to-sheet is measured under a 4x CPU throttle (AC3: ~1.5s mid-mobile target)",
    perf.redrafts === beforePerf + 1 && perfMs >= 0 && perfMs < 4000,
    `drawn in ${perfMs}ms under 4x throttle (target ~1.5s; 4000ms ceiling is a flake guard, not the target)`,
  );
}
