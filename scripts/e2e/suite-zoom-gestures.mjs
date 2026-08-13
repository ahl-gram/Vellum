// Glass gestures e2e (#166): suite-zoom's behaviour re-proven through REAL CDP input (mouse wheel, touch, device metrics); runs right after suite-zoom and restores its clean desktop home before suite-cards.
// d3-zoom binds its touch listeners ONLY when the page BOOTS as a touch device (defaultTouchable reads navigator.maxTouchPoints at attach time), so the touch block enables emulation and then RELOADS.
// NEVER dispatch a real touch while touch emulation is off: it wedges Chrome's touch input pipeline for the WHOLE session (every later touch is silently dropped, even after emulation is enabled); a real mouse wheel is safe, only touch poisons.
// NEVER change the emulation config after dispatching a real touch: later touches route to native page pinch-zoom instead of the DOM and a clear+reload does NOT recover it, so ALL touch checks run under ONE phone-metric emulation set once and left alone.
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitReady, waitSettled, wheel, pinch, touchPan, setMobileViewport, clearMobile, PORT } = ctx;

  async function reloadHome(label) {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#seed=42&style=antique` });
    await waitReady();
    await evaluate(`window.__vellumSetRedraftEnabled(false)`);
    await waitSettled(label);
  }
  const vpRect = () => evaluate(`(()=>{const v=document.getElementById("map-viewport");const r=v.getBoundingClientRect();return{L:r.left,T:r.top,W:v.clientWidth,H:v.clientHeight};})()`);
  const state = () => evaluate(`window.__vellumZoomState()`);

  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  let r = await vpRect();
  const px = Math.round(r.W * 0.3), py = Math.round(r.H * 0.5);
  await wheel(r.L + px, r.T + py, -240);
  await sleep(80);
  const zg1 = await state();
  check(
    "ZG1 a real mouse wheel zooms in about the cursor (AC1: exact pointer-fixed transform)",
    zg1.k > 1.05 && Math.abs(zg1.x - px * (1 - zg1.k)) < 1 && Math.abs(zg1.y - py * (1 - zg1.k)) < 1,
    JSON.stringify({ zg1, predictedX: px * (1 - zg1.k), predictedY: py * (1 - zg1.k) }),
  );
  await shoot("explorer-gesture-wheel.png"); // manual: a real wheel-zoom framed on the cursor

  r = await vpRect();
  await wheel(r.L + px, r.T + py, 600);
  await sleep(80);
  const zg1b = await state();
  check(
    "ZG1b a real wheel the other way zooms back out (k decreases toward the floor)",
    zg1b.k < zg1.k,
    JSON.stringify(zg1b),
  );

  await setMobileViewport(390, 780);
  await reloadHome("gesture-mobile-boot");
  const touchAction = await evaluate(`getComputedStyle(document.getElementById("map-viewport")).touchAction`);
  const scaleAtBoot = await evaluate(`visualViewport.scale`);
  const scrollToMap = () => evaluate(`document.getElementById("map-viewport").scrollIntoView({block:"center"})`);
  await scrollToMap();
  await sleep(60);

  r = await vpRect();
  let cx = Math.round(r.L + r.W * 0.5), cy = Math.round(r.T + r.H * 0.5);
  await pinch(cx, cy, 70, 170);
  await sleep(100);
  const zg2 = await state();
  check(
    "ZG2 a real two-finger pinch zooms the map (AC1: k = start_k * spread ratio, 70->170 ≈ 2.43)",
    Math.abs(zg2.k - 170 / 70) < 0.15,
    JSON.stringify(zg2),
  );
  await shoot("explorer-gesture-pinch.png"); // manual: a real pinch magnify on a phone-sized sheet

  const before = await state();
  await touchPan(cx, cy, cx - 80, cy - 60);
  await sleep(100);
  const after = await state();
  check(
    "ZG3 a real one-finger drag pans by the screen delta (AC1)",
    Math.abs(after.x - before.x - -80) < 2 && Math.abs(after.y - before.y - -60) < 2 && after.k === before.k,
    JSON.stringify({ before, after }),
  );

  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  await scrollToMap();
  await sleep(60);
  r = await vpRect();
  cx = Math.round(r.L + r.W * 0.5), cy = Math.round(r.T + r.H * 0.5);
  const scrollBefore = await evaluate(`window.scrollY`);
  await pinch(cx, cy, 70, 180);
  await sleep(100);
  const zg4 = await state();
  const page = await evaluate(`({scrolled:(window.scrollY - ${scrollBefore}), vs:visualViewport.scale})`);
  check(
    "ZG4 a pinch under mobile viewport zooms the map without page pinch-zoom (AC2 touch-action wiring)",
    touchAction === "none" && Math.abs(scaleAtBoot - 1) < 0.01 && zg4.k > 1.3 && Math.abs(page.vs - 1) < 0.01,
    JSON.stringify({ touchAction, scaleAtBoot, k: zg4.k, page }),
  );
  await shoot("explorer-gesture-mobile-pinch.png"); // manual: a pinch on a phone-sized sheet

  await clearMobile();
  await reloadHome("gesture-restore");
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  await evaluate(`(()=>{const c=document.getElementById("ages");if(c&&c.checked){c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));}document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("draw").click();})()`);
  await waitSettled("post-gesture-restore");
}
