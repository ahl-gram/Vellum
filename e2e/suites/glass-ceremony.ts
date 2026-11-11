// Glass ceremony e2e (G, Issue #170): the antique voice on the zoom cluster, the voiced glide, and the redraft ink-in; asserts the PLUMBING (classes and inline dash props) while the choreography is eyeballed via out/ screenshots. Ground truth at seed 42 (2026-07-19 scan): the world sheet labels 25 of 26 settlements, the band-1 window at (0.5, 0.5) newly labels exactly Lokai.
import { makeSettle, makeStable } from "../support/settle.ts";
import { makeStep } from "../support/step.ts";
import type { Payload, SuiteContext } from "../types.ts";
import { REDRAFT_TRIES, zoomTo } from "./zoom/kit.ts";

export const HASH: Payload<{ cx: string | null; cy: string | null; k: string | null }> =
  `(()=>{const p=new URLSearchParams(location.hash.slice(1));return{cx:p.get("cx"),cy:p.get("cy"),k:p.get("k")};})()`;

export type GlassKit = ReturnType<typeof glassKit>;

export async function run(ctx: SuiteContext): Promise<void> {
  const { evaluate } = ctx;
  const step = makeStep(ctx);
  const k = glassKit(ctx);

  await step("G setup", () => gSetup(k));
  await g2aGlides(k);
  await g2bCompounds(k);
  await step("G2c", () => g2cKeys(k));
  await g3ReducedMotion(k);
  await evaluate(`window.__vellumSetRedraftEnabled(true)`);
  await g4InksIn(k);
  await g8WholeSheet(k);
  await g6ReducedCeremony(k);
  await step("G restore", () => gRestore(k));
}

function glassKit(ctx: SuiteContext) {
  const { evaluate, sleep } = ctx;
  const st = () => evaluate<{ k: number; x: number; y: number }>(`window.__vellumZoomState()`);
  const settleK = async (target: number) => {
    for (let i = 0; i < 100; i++) {
      const s = await st();
      if (Math.abs(s.k - target) < 1e-6) return s;
      await sleep(40);
    }
    return await st();
  };
  const settleHome = async () => {
    for (let i = 0; i < 100; i++) {
      const s = await st();
      if (s.k === 1 && s.x === 0 && s.y === 0) return s;
      await sleep(40);
    }
    return await st();
  };
  const rgn = () =>
    evaluate<{ band: number; redrafts: number; committed: boolean; title: string | null }>(`window.__vellumRegion()`);
  const enterAt = zoomTo(evaluate);
  const waitRedraft = async (prev: number, wantBand: number) => {
    // 15s, not 4s (the derivation at `REDRAFT_TRIES` in `e2e/suites/zoom/kit.ts`): Issue #400's detailed draw outran the old budget on CI and G6 read band 2. The waiter also demands the band its caller asserts: a stale in-flight survey (G8's glide debounce) can commit FIRST and increment redrafts at the wrong band (CI 2026-08-25).
    for (let i = 0; i < REDRAFT_TRIES; i++) {
      const s = await rgn();
      if (s.redrafts > prev && s.band === wantBand) return s;
      await sleep(40);
    }
    return await rgn();
  };
  return { ...ctx, settleK, settleHome, rgn, enterAt, waitRedraft };
}

async function gSetup({ evaluate, waitSettled }: GlassKit): Promise<void> {
  await evaluate(
    `(()=>{for(const id of ["ages"]){const c=document.getElementById(id);if(c.checked){c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));}}document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("draw").click();})()`,
  );
  await waitSettled("glass-ceremony-base");
  await evaluate(`window.__vellumSetRedraftEnabled(false)`);
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
}

async function g2aGlides({ evaluate, check, settleK }: GlassKit): Promise<void> {
  const g2aNow = await evaluate<number>(
    `(()=>{document.getElementById("zoom-in").click();return window.__vellumZoomState().k;})()`,
  );
  const g2aEnd = await settleK(1.4);
  check(
    "G2a a zoom button glides: mid-flight short of the step, settles exactly at 1.4 (#170 voiced glide)",
    g2aNow < 1.4 - 1e-6 && Math.abs(g2aEnd.k - 1.4) < 1e-6,
    `immediately=${g2aNow} settled=${g2aEnd.k}`,
  );
}

async function g2bCompounds({ evaluate, check, settleK }: GlassKit): Promise<void> {
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  await evaluate(`(()=>{const b=document.getElementById("zoom-in");b.click();b.click();})()`);
  const g2b = await settleK(1.96);
  check(
    "G2b rapid presses compound to 1.96 (the glide flies to a pending absolute target, #170)",
    Math.abs(g2b.k - 1.96) < 1e-6,
    `settled=${g2b.k}`,
  );

  // d3 starts a superseding transition one frame after scheduling it, interrupting its predecessor, whose end/interrupt handler must NOT clear the newer press's pending target (the glideSeq guard).
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  await evaluate(
    `(async()=>{const b=document.getElementById("zoom-in");const wait=(ms)=>new Promise(r=>setTimeout(r,ms));` +
      `b.click();await wait(60);b.click();await wait(60);b.click();})()`,
    true,
  );
  const g2b2 = await settleK(2.744);
  check(
    "G2b2 a cross-frame burst still compounds: three presses at ~60ms land exactly 1.4^3 (the glideSeq guard, #170)",
    Math.abs(g2b2.k - 2.744) < 1e-6,
    `settled=${g2b2.k}`,
  );
}

export async function g2cKeys({ evaluate, check, sleep, settleK, settleHome }: GlassKit): Promise<void> {
  const stable = makeStable(makeSettle({ evaluate, sleep }));
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  await evaluate(
    `(()=>{const vp=document.getElementById("map-viewport");vp.focus();vp.dispatchEvent(new KeyboardEvent("keydown",{key:"+",bubbles:true}));})()`,
  );
  const g2cIn = await settleK(1.4);
  await stable(HASH, "G2c the settle writes the hash at 1.4", { departed: (d) => Number(d.k) === 1.4 });
  await evaluate(
    `(()=>{const vp=document.getElementById("map-viewport");vp.dispatchEvent(new KeyboardEvent("keydown",{key:"0",bubbles:true}));})()`,
  );
  const g2cHome = await settleHome();
  let g2cHash: { cx: string | null; k: string | null } | null = null;
  for (let i = 0; i < 50; i++) {
    g2cHash = await evaluate<{ cx: string | null; k: string | null }>(
      `(()=>{const p=new URLSearchParams(location.hash.slice(1));return{cx:p.get("cx"),k:p.get("k")};})()`,
    );
    if (g2cHash.cx === null && g2cHash.k === null) break;
    await sleep(40);
  }
  check(
    "G2c the keys glide too; 0 glides home and the hash drops cx/cy/k at the landing (#170)",
    Math.abs(g2cIn.k - 1.4) < 1e-6 &&
      g2cHome.k === 1 &&
      g2cHome.x === 0 &&
      g2cHome.y === 0 &&
      g2cHash!.cx === null &&
      g2cHash!.k === null,
    `in=${g2cIn.k} home=${JSON.stringify(g2cHome)} hash=${JSON.stringify(g2cHash)}`,
  );
}

async function g3ReducedMotion({ evaluate, send, check }: GlassKit): Promise<void> {
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const g3 = await evaluate<{ stepK: number; home: { k: number; x: number; y: number }; cx: string | null }>(`(()=>{
    window.__vellumZoomTo({k:1,x:0,y:0});
    document.getElementById("zoom-in").click();
    const stepK=window.__vellumZoomState().k;
    const vp=document.getElementById("map-viewport");vp.focus();
    vp.dispatchEvent(new KeyboardEvent("keydown",{key:"0",bubbles:true}));
    const s=window.__vellumZoomState();
    const p=new URLSearchParams(location.hash.slice(1));
    return{stepK,home:{k:s.k,x:s.x,y:s.y},cx:p.get("cx")};
  })()`);
  check(
    "G3 reduced motion collapses the glide: step and home land in the same turn (#170 AC2)",
    Math.abs(g3.stepK - 1.4) < 1e-6 && g3.home.k === 1 && g3.home.x === 0 && g3.home.y === 0 && g3.cx === null,
    JSON.stringify(g3),
  );
  await send("Emulation.setEmulatedMedia", { features: [] });
}

async function g4ReadInk({ evaluate }: Pick<GlassKit, "evaluate">) {
  const g4 = await evaluate<
    | { svg: false }
    | {
        svg: true;
        redrafting: boolean;
        dashed: boolean;
        drawLen: boolean;
        dryCount: number;
        dryNames: string[];
        dryAllNew: boolean;
        dryTiers: string[];
        persistingCount: number;
        persistingStill: boolean;
      }
  >(`(()=>{
    const worldTexts=new Set([...document.querySelectorAll("#map > svg g.settlement text")].map(t=>t.textContent));
    const inset=document.querySelector("#map .region-inset");
    const svg=inset?inset.querySelector("svg"):null;
    if(!svg)return{svg:false};
    const coast=svg.querySelector("#layer-land path");
    const groups=[...svg.querySelectorAll("g.settlement[data-name]")];
    const labeled=groups.filter(g=>g.querySelector("text"));
    const dry=labeled.filter(g=>g.classList.contains("dry-in"));
    const dryNames=dry.map(g=>g.dataset.name);
    const dryAllNew=dryNames.every(n=>!worldTexts.has(n)&&!worldTexts.has(n.toUpperCase()));
    const persisting=labeled.filter(g=>worldTexts.has(g.dataset.name)||worldTexts.has(g.dataset.name.toUpperCase()));
    const persistingStill=persisting.every(g=>!g.classList.contains("dry-in"));
    return{svg:true,redrafting:svg.classList.contains("redrafting"),
      dashed:!!(coast&&coast.style.strokeDasharray),drawLen:!!(coast&&coast.style.getPropertyValue("--draw-len")),
      dryCount:dry.length,dryNames,dryAllNew,dryTiers:dry.map(g=>g.dataset.tier),
      persistingCount:persisting.length,persistingStill};
  })()`);
  return g4;
}

async function g4InksIn({ evaluate, check, shoot, sleep, rgn, enterAt, waitRedraft }: GlassKit): Promise<void> {
  const before4 = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  const s4 = await waitRedraft(before4, 1);
  const g4 = await g4ReadInk({ evaluate });
  check(
    "G4 the redraft inks in: .redrafting + dashed coast at commit; only newly labeled names tagged .dry-in, persisting names untouched (#170 AC1)",
    s4.band === 1 &&
      g4.svg &&
      g4.redrafting &&
      g4.dashed &&
      g4.drawLen &&
      g4.dryCount > 0 &&
      g4.dryAllNew &&
      g4.persistingCount > 0 &&
      g4.persistingStill,
    `band=${s4.band} ${JSON.stringify(g4)} (expected dry-in exactly ["Lokai"] at seed 42)`,
  );
  await shoot("explorer-sub9-redraft-inking.png");
  await sleep(600, "window: the dry-in shot lands with the newly revealed name mid-dry");
  await shoot("explorer-sub9-redraft-dryin.png");
}

async function g8WholeSheet({ evaluate, check, sleep, settleHome }: GlassKit): Promise<void> {
  await evaluate(`document.getElementById("zoom-reset").click()`);
  const g8cam = await settleHome();
  let g8: { band: number; committed: boolean; insets: number; hits: number; cx: string | null } | null = null;
  for (let i = 0; i < 50; i++) {
    g8 = await evaluate<{ band: number; committed: boolean; insets: number; hits: number; cx: string | null }>(
      `(()=>{const s=window.__vellumRegion();const p=new URLSearchParams(location.hash.slice(1));return{band:s.band,committed:s.committed,insets:document.querySelectorAll("#map .region-inset").length,hits:document.querySelectorAll("#map .place-hit").length,cx:p.get("cx")};})()`,
    );
    if (g8.insets === 0 && g8.cx === null) break;
    await sleep(40);
  }
  check(
    "G8 the whole sheet returns on one press: glide home, inset faded off, hash clean, world overlay back (#170; home's voice since #505)",
    g8cam.k === 1 &&
      g8cam.x === 0 &&
      g8cam.y === 0 &&
      g8!.band === 0 &&
      g8!.committed === false &&
      g8!.insets === 0 &&
      g8!.hits > 0 &&
      g8!.cx === null,
    `cam=${JSON.stringify(g8cam)} ${JSON.stringify(g8)}`,
  );
}

async function g6ReducedCeremony({ evaluate, send, check, sleep, rgn, enterAt, waitRedraft }: GlassKit): Promise<void> {
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  // G8's voiced glide home starts inside band 1, and a survey its settle debounce dispatched on the way may still be in flight here and commit after before6 is sampled, so wait for the region state to go quiet first: two reads a debounce apart with the same count, and nothing on screen.
  for (let i = 0; i < 100; i++) {
    const a = await rgn();
    await sleep(300);
    const b = await rgn();
    if (a.redrafts === b.redrafts && b.band === 0) break;
  }
  const before6 = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  const s6 = await waitRedraft(before6, 1);
  const g6 = await evaluate<
    { svg: false } | { svg: true; redrafting: boolean; dashed: boolean; dry: number; hits: number }
  >(`(()=>{
    const svg=document.querySelector("#map .region-inset svg");
    if(!svg)return{svg:false};
    const coast=svg.querySelector("#layer-land path");
    return{svg:true,redrafting:svg.classList.contains("redrafting"),dashed:!!(coast&&coast.style.strokeDasharray),
      dry:svg.querySelectorAll("g.settlement.dry-in").length,hits:document.querySelectorAll("#map .place-hit").length};
  })()`);
  check(
    "G6 reduced motion collapses the ceremony to an instant swap with zero functional loss (#170 AC2)",
    s6.band === 1 &&
      /^The Environs of .+/.test(s6.title || "") &&
      g6.svg &&
      g6.redrafting === false &&
      g6.dashed === false &&
      g6.dry === 0 &&
      g6.hits > 0,
    `band=${s6.band} title=${JSON.stringify(s6.title)} ${JSON.stringify(g6)}`,
  );
  await send("Emulation.setEmulatedMedia", { features: [] });
}

async function gRestore({ evaluate, waitSettled, settleHome }: GlassKit): Promise<void> {
  await evaluate(`document.getElementById("zoom-reset").click()`);
  await settleHome();
  await evaluate(`window.__vellumSetRedraftEnabled(false)`);
  await evaluate(
    `(()=>{document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("draw").click();})()`,
  );
  await waitSettled("glass-ceremony-restore");
}
