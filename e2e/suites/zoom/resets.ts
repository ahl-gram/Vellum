import type { SuiteContext } from "../../types.ts";

export async function z5VersoHomes({ evaluate, check, shoot, sleep }: SuiteContext): Promise<void> {
  await evaluate(`window.__vellumZoomTo({k:3,x:-40,y:-30})`);
  await evaluate(`document.getElementById("verso-turn").click()`);
  await sleep(1300); // let the 1.2s flip land
  const z5 = await evaluate<{
    versoed: boolean;
    ghost: boolean;
    vis: string;
    k: number;
    x: number;
    y: number;
    cx: string | null;
  }>(
    `(()=>{const sh=document.getElementById("sheet");const st=window.__vellumZoomState();const p=new URLSearchParams(location.hash.slice(1));return{versoed:sh.classList.contains("versoed"),ghost:!!document.querySelector("#verso .verso-ghost"),vis:getComputedStyle(document.getElementById("verso")).visibility,k:st.k,x:st.x,y:st.y,cx:p.get("cx")};})()`,
  );
  check(
    "Z5 the verso flip snaps the camera home first, then flips (AC4 reset-on-verso; cx/cy/k cleared)",
    z5.versoed && z5.ghost && z5.vis === "visible" && z5.k === 1 && z5.x === 0 && z5.y === 0 && z5.cx === null,
    JSON.stringify(z5),
  );
  await shoot("explorer-zoom-verso.png");
  await evaluate(`document.getElementById("verso-turn").click()`);
  await sleep(1300);
}

export async function z14aDrawHomes({ evaluate, check, waitSettled }: SuiteContext): Promise<void> {
  await evaluate(`window.__vellumZoomTo({k:3,x:-60,y:-40})`);
  const r14a = await evaluate<number>(
    `(()=>{document.getElementById("draw").click();return window.__vellumZoomState().k;})()`,
  );
  await waitSettled("reset-on-draw");
  check("Z14a reset-on-draw: Draw snaps the camera home first (AC4)", r14a === 1, String(r14a));
}

export async function z14bTurnHomes({ evaluate, check, waitTurned }: SuiteContext): Promise<void> {
  await evaluate(`window.__vellumZoomTo({k:3,x:-60,y:-40})`);
  const r14b = await evaluate<number>(
    `(()=>{const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));return window.__vellumZoomState().k;})()`,
  );
  await waitTurned("reset-on-turn");
  check("Z14b reset-on-style-turn: a style change homes the camera before the turn (AC4)", r14b === 1, String(r14b));
  await evaluate(
    `(()=>{const s=document.getElementById("style");s.value="antique";s.dispatchEvent(new Event("change",{bubbles:true}));})()`,
  );
  await waitTurned("reset-on-turn-back-antique");
}

export async function z14cArmingHomes({ evaluate, check }: SuiteContext): Promise<void> {
  await evaluate(`window.__vellumZoomTo({k:3,x:-60,y:-40})`);
  const r14c = await evaluate<{ k: number; cx: string | null; cy: string | null; kp: string | null }>(
    `(()=>{const c=document.getElementById("ages");c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));const st=window.__vellumZoomState();const p=new URLSearchParams(location.hash.slice(1));return{k:st.k,cx:p.get("cx"),cy:p.get("cy"),kp:p.get("k")};})()`,
  );
  check(
    "Z14c reset-on-arming: entering the ages instrument homes the camera AND drops cx/cy/k from the hash (AC4)",
    r14c.k === 1 && r14c.cx === null && r14c.cy === null && r14c.kp === null,
    JSON.stringify(r14c),
  );
  await evaluate(
    `(()=>{const c=document.getElementById("ages");c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));})()`,
  );
}

export async function zrmReducedMotion({ evaluate, send, check }: SuiteContext): Promise<void> {
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const rmOn = await evaluate<boolean>(`matchMedia("(prefers-reduced-motion: reduce)").matches`);
  const zr = await evaluate<number>(
    `(()=>{const vp=document.getElementById("map-viewport");const r=vp.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2;vp.dispatchEvent(new MouseEvent("dblclick",{bubbles:true,cancelable:true,view:window,clientX:cx,clientY:cy}));return window.__vellumZoomState().k;})()`,
  );
  check(
    "Zrm reduced motion collapses the double-click zoom to instant (AC5: lands at k=2 in one turn)",
    rmOn === true && zr === 2,
    JSON.stringify({ rmOn, zr }),
  );
  await send("Emulation.setEmulatedMedia", { features: [] });
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
}

export async function z7TouchAction({ evaluate, check, waitTurned }: SuiteContext): Promise<void> {
  const z7a = await evaluate<string>(`getComputedStyle(document.getElementById("map-viewport")).touchAction`);
  await evaluate(
    `(()=>{const s=document.getElementById("style");s.value="nautical";s.dispatchEvent(new Event("change",{bubbles:true}));})()`,
  );
  await waitTurned("zoom-touch-nautical");
  const z7b = await evaluate<string>(`getComputedStyle(document.getElementById("map-viewport")).touchAction`);
  check(
    "Z7 touch-action:none holds on every style now that all four zoom (AC1 touch; Sub 3 revert superseded)",
    z7a === "none" && z7b === "none",
    JSON.stringify({ z7a, z7b }),
  );
}

export async function z13DeepLink({
  evaluate,
  send,
  check,
  shoot,
  sleep,
  waitSettled,
  waitReady,
  PORT,
}: SuiteContext): Promise<void> {
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#seed=42&style=antique&cx=0.5&cy=0.5&k=4` });
  await waitReady();
  await evaluate(`window.__vellumSetRedraftEnabled(false)`); // Issue #169: a fresh page defaults ON; keep the geometric block clean before the deep-link settle fires
  await waitSettled("zoom-deeplink-load");
  await sleep(80);
  const z13 = await evaluate<{ k: number; x: number; W: number }>(
    `(()=>{const s=window.__vellumZoomState();const vp=document.getElementById("map-viewport");return{k:s.k,x:s.x,W:vp.clientWidth};})()`,
  );
  check(
    "Z13 a deep link #cx&cy&k restores the framing on load (AC3 load: k=4 and centre)",
    z13.k === 4 && Math.abs(z13.x - -1.5 * z13.W) < 1.5,
    JSON.stringify(z13),
  );
  await shoot("explorer-zoom-deeplink-k4.png");
}

export async function z13dRefitHolds({ evaluate, send, check, sleep }: SuiteContext): Promise<void> {
  // Issue #463: the chart room fits the sheet to the viewport, so a resize refits the box the camera is clamped against; the room holds the FRAMING (cx/cy/k) across the refit, never the raw transform, or a resize walks the camera and the settle re-drafts a different region (the G7 class, found by the harness's own screenshot resize).
  const sheetBefore = await evaluate<number>(`document.getElementById("sheet").getBoundingClientRect().width`);
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 600, deviceScaleFactor: 1, mobile: false });
  await sleep(400); // past the resize layout and the 250ms settle debounce
  const z13b = await evaluate<{ cx: string | null; cy: string | null; k: string | null; sk: number; sheet: number }>(
    `(()=>{const p=new URLSearchParams(location.hash.slice(1));const s=window.__vellumZoomState();return{cx:p.get("cx"),cy:p.get("cy"),k:p.get("k"),sk:s.k,sheet:document.getElementById("sheet").getBoundingClientRect().width};})()`,
  );
  await send("Emulation.clearDeviceMetricsOverride");
  await sleep(400);
  const z13c = await evaluate<{ cx: string | null; cy: string | null; k: string | null; sheet: number }>(
    `(()=>{const p=new URLSearchParams(location.hash.slice(1));return{cx:p.get("cx"),cy:p.get("cy"),k:p.get("k"),sheet:document.getElementById("sheet").getBoundingClientRect().width};})()`,
  );
  await evaluate(`document.querySelector("#broadside .slip-fold").click()`);
  await sleep(700); // the fold's 340ms settle, then the layout and the 250ms settle debounce
  const z13d = await evaluate<{
    cx: string | null;
    cy: string | null;
    k: string | null;
    sheet: number;
    folded: boolean;
  }>(
    `(()=>{const p=new URLSearchParams(location.hash.slice(1));return{cx:p.get("cx"),cy:p.get("cy"),k:p.get("k"),sheet:document.getElementById("sheet").getBoundingClientRect().width,folded:document.getElementById("broadside").classList.contains("folded")};})()`,
  );
  await evaluate(`document.querySelector(".slip-tab").click()`);
  await sleep(700);
  const z13e = await evaluate<{
    cx: string | null;
    cy: string | null;
    k: string | null;
    sheet: number;
    folded: boolean;
  }>(
    `(()=>{const p=new URLSearchParams(location.hash.slice(1));return{cx:p.get("cx"),cy:p.get("cy"),k:p.get("k"),sheet:document.getElementById("sheet").getBoundingClientRect().width,folded:document.getElementById("broadside").classList.contains("folded")};})()`,
  );
  // A refit is camera-side-effect-free: no settle, so no hash write (skeptic on PR #491: the fonts.ready refit before the boot wrote an empty seed and CI's bare visit landed on seed 0). The seed input is the tell: a hash write would carry its new value.
  await evaluate(`document.getElementById("seed").value = "777"`);
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 600, deviceScaleFactor: 1, mobile: false });
  await sleep(500);
  await send("Emulation.clearDeviceMetricsOverride");
  await sleep(500);
  const z13f = await evaluate<{ seed: string | null; k: string | null }>(
    `(()=>{const p=new URLSearchParams(location.hash.slice(1));document.getElementById("seed").value="42";return{seed:p.get("seed"),k:p.get("k")};})()`,
  );
  check(
    "Z13d a refit writes no hash: the seed input changed under a resize and the address kept the drawn seed and its camera (#463)",
    z13f.seed === "42" && z13f.k === "4.0000",
    JSON.stringify(z13f),
  );
  check(
    "Z13c a fold and an unfold refit the sheet and hold the framing too: the class, not the resize alone (#463)",
    z13d.folded &&
      z13d.sheet > sheetBefore &&
      z13d.cx === "0.5000" &&
      z13d.cy === "0.5000" &&
      z13d.k === "4.0000" &&
      !z13e.folded &&
      Math.abs(z13e.sheet - sheetBefore) < 1 &&
      z13e.cx === "0.5000" &&
      z13e.cy === "0.5000" &&
      z13e.k === "4.0000",
    JSON.stringify({ sheetBefore, z13d, z13e }),
  );
  check(
    "Z13b a resize refits the sheet but holds the camera's framing: cx/cy/k unchanged across a short viewport (height-bound fit) and back (#463)",
    z13b.sheet !== sheetBefore &&
      Math.abs(z13c.sheet - sheetBefore) < 1 &&
      z13b.cx === "0.5000" &&
      z13b.cy === "0.5000" &&
      z13b.k === "4.0000" &&
      z13b.sk === 4 &&
      z13c.cx === "0.5000" &&
      z13c.cy === "0.5000" &&
      z13c.k === "4.0000",
    JSON.stringify({ sheetBefore, z13b, z13c }),
  );
}
