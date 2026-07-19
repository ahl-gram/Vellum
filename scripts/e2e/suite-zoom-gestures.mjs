// The Surveyor's Glass, Sub 5 (#166): real-input coverage of the glass. suite-zoom
// proves the zoom/pan behaviour through the deterministic __vellumZoomTo / scaleBy /
// panBy hooks and synthetic DOM events; this suite proves the SAME behaviour through
// REAL browser input synthesized over CDP (Input.dispatchMouseEvent type mouseWheel,
// Input.dispatchTouchEvent, Emulation device metrics), which run d3-zoom's own wheel and
// touch handlers exactly as a user's finger or wheel would. It runs right after
// suite-zoom, inheriting the clean antique seed-42 desktop home it leaves, and restores
// that same home before handing off to suite-cards.
//
// Three hard-won constraints shape the structure:
//   1. d3-zoom binds its touch listeners ONLY when the page BOOTS as a touch device
//      (defaultTouchable reads navigator.maxTouchPoints at attach time). So the touch
//      block enables touch emulation and then RELOADS, faithfully exercising the real
//      mobile boot path rather than a desktop with touch bolted on after the fact.
//   2. NEVER dispatch a real touch while touch emulation is off. A touch sent to a
//      non-touch browser wedges Chrome's touch input pipeline for the WHOLE session:
//      every later touch (even after emulation is enabled) is silently dropped. This is
//      why there is no "touch does nothing on desktop" negative check here -- it would
//      sabotage every touch check that follows. A real mouse WHEEL is safe; only touch
//      poisons. All of suite-zoom's prior checks use synthetic DOM events (not CDP
//      Input), so nothing upstream poisons the pipeline either.
//   3. NEVER change the emulation config after dispatching a real touch. Dispatching a
//      touch and then switching the device-metrics/touch override routes every later
//      touch to native page pinch-zoom instead of the DOM, and a clear+reload does not
//      recover it. So ALL touch checks run under ONE phone-metric emulation set once and
//      left alone; only the final clear (with no touch after it) tears it down.
//
// This increment is characterization: the behaviour already shipped in Subs 3-4, and the
// AC is that real events reproduce it. So these go green on first run by design; the RED
// that justified the reload-before-touch design (a pinch with touch emulation off no-ops
// because d3 never bound) was demonstrated during development, not committed (see 2).
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitReady, waitSettled, wheel, pinch, touchPan, setMobileViewport, clearMobile, PORT } = ctx;

  // Reload to a clean antique seed-42 home under whatever emulation is currently set, so
  // d3-zoom re-binds with the current touch capability. about:blank first forces a full
  // reload (suite-zoom's Z13 / the print-room suite use the same idiom).
  async function reloadHome(label) {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#seed=42&style=antique` });
    await waitReady();
    // #169: this suite characterizes the GEOMETRIC gesture behaviour (Sub 5); a fresh page defaults
    // the Sub 8 semantic redraft ON, so turn it OFF so a real wheel/pinch/drag settle does not swap
    // the sheet mid-assertion. (suite-zoom left it off, but each reload here resets it.)
    await evaluate(`window.__vellumSetRedraftEnabled(false)`);
    await waitSettled(label);
  }
  // The map-viewport's viewport-relative rect + its live size, for placing input at CSS
  // page coordinates the browser will hit-test onto the chart.
  const vpRect = () => evaluate(`(()=>{const v=document.getElementById("map-viewport");const r=v.getBoundingClientRect();return{L:r.left,T:r.top,W:v.clientWidth,H:v.clientHeight};})()`);
  const state = () => evaluate(`window.__vellumZoomState()`);

  // ZG1 (AC1): a REAL mouse wheel magnifies about the CURSOR. d3 keeps the world point
  // under the pointer fixed, so from home (k=1, no offset) the resulting transform is
  // exactly x = px*(1-k), y = py*(1-k). The pointer is placed left-of-centre, clear of
  // the top-right zoom cluster (which stopPropagations wheel as of Sub 4). k is read back
  // from state so the assertion holds for whatever d3's wheelDelta constant yields.
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

  // ZG1b: a real wheel the other way zooms back out (k floors at 1, snapping home).
  r = await vpRect();
  await wheel(r.L + px, r.T + py, 600);
  await sleep(80);
  const zg1b = await state();
  check(
    "ZG1b a real wheel the other way zooms back out (k decreases toward the floor)",
    zg1b.k < zg1.k,
    JSON.stringify(zg1b),
  );

  // ---- touch gestures, ALL under ONE mobile emulation (see the header note) -----------
  // Every touch check runs under a single phone-metric emulation and never switches the
  // emulation config afterwards. This is deliberate: dispatching a real touch and THEN
  // changing the device-metrics/touch config corrupts Chrome's touch input pipeline for
  // the rest of the session (subsequent touches route to native page pinch-zoom instead
  // of the DOM, and a clear+reload does NOT recover it). Proving pinch/drag on the phone
  // metric covers AC1 (the behaviour is viewport-size independent) and sets up AC2, with
  // no second config to switch to. The wheel above stays desktop (real mouse is immune).
  await setMobileViewport(390, 780);
  await reloadHome("gesture-mobile-boot");
  const touchAction = await evaluate(`getComputedStyle(document.getElementById("map-viewport")).touchAction`);
  const scaleAtBoot = await evaluate(`visualViewport.scale`);
  // On a narrow phone the controls stack tall (the <=560px layout) and push the sheet
  // below the fold, so bring it on screen before touching it. visualViewport.scale is 1,
  // so the getBoundingClientRect layout px equal the px CDP hit-tests the touch against.
  const scrollToMap = () => evaluate(`document.getElementById("map-viewport").scrollIntoView({block:"center"})`);
  await scrollToMap();
  await sleep(60);

  // ZG2 (AC1): a real two-finger pinch OUT magnifies. d3 sets k to k_old * (endSpread /
  // startSpread) about the centroid, so from home a 70->170px spread lands k ≈ 2.43. The
  // pinch is centred on the sheet; the buttons in the top-right cluster stopPropagation
  // touchstart, but the two points are far apart so at most one can graze the cluster and
  // the other still carries the 2-touch touchstart into d3.
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

  // ZG3 (AC1): a real one-finger drag pans by the screen delta. Only meaningful while
  // zoomed (at k=1 the constrain snaps any pan home), so it rides the ZG2 pinch. Drag by
  // (-80,-60) screen px; d3 translates the sheet by exactly that, k unchanged.
  const before = await state();
  await touchPan(cx, cy, cx - 80, cy - 60);
  await sleep(100);
  const after = await state();
  check(
    "ZG3 a real one-finger drag pans by the screen delta (AC1)",
    Math.abs(after.x - before.x - -80) < 2 && Math.abs(after.y - before.y - -60) < 2 && after.k === before.k,
    JSON.stringify({ before, after }),
  );

  // ZG4 (AC2): the touch-action:none wiring holds at a real phone metric, so a pinch zooms
  // the MAP and never lets the browser pinch-zoom the PAGE. Home the camera, then pinch and
  // confirm: touch-action was none at mobile load, the map's k grew, and the page's own
  // visual-viewport scale stayed 1 (no native page zoom leaked through). Re-scroll first
  // in case ZG3's pan nudged the layout.
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

  // ---- restore: clear all emulation and reload a pristine desktop antique home so the
  // suites after this (cards onward) inherit the clean base they expect. Mirrors
  // suite-zoom's tail (chronicle off, seed 42, antique, camera home).
  await clearMobile();
  await reloadHome("gesture-restore");
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  await evaluate(`(()=>{const c=document.getElementById("chronicle");if(c&&c.checked){c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));}document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("draw").click();})()`);
  await waitSettled("post-gesture-restore");
}
