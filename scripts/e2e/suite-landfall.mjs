// Landfall hardening e2e (#460, second suite by ratification 2026-08-25): the wheel consumed-vs-released contract at both zoom clamps (L1), the six panel arms from the superseding 2026-08-24T18:53 spec plus the sixth-arm clearance (L2-L7), the Enter links as 44px touch targets (L8), touch two-finger-drives vs one-finger-page-scroll under one emulation set (L9), and the seed form's no-JS GET fallback with its bare-visit control (L10-L11). Every gesture is REAL dispatched input; suite-home's plumbing arrives via home-support.mjs.
import { readCam, atLandfall, readXform, buttonPoint, makeStage } from "./home-support.mjs";
import { scopedHealth } from "./room-support.mjs";

export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, wheel, touch, pinch, setMobileViewport, clearMobile, PORT } = ctx;
  const { pressKey, clickAt, settleHome } = makeStage(ctx);
  const gate = scopedHealth(ctx);

  // e.defaultPrevented read at the window AFTER the stage's own listener ran, so the log records exactly what input.ts decided; passive, so the probe cannot itself consume.
  const armWheelLog = () =>
    evaluate(`(window.__lfWheel = [], window.addEventListener("wheel", (e) => window.__lfWheel.push(e.defaultPrevented), { passive: true }), true)`);
  const lastWheel = () => evaluate(`window.__lfWheel[window.__lfWheel.length - 1] ?? null`);
  const camNow = () => evaluate(readCam);
  const camScale = async () => { const c = await camNow(); return c === null ? null : c.scale; };
  const scrollY = () => evaluate(`window.scrollY`);
  // Every element probe returns null instead of throwing, and every dispatch is gated on it: an unguarded deref here turns a product regression into a HARNESS ERROR that prints zero checks (skeptic round 1, proven against an empty site dir), which the lane driver reserves for the browser never coming up.
  const centerOf = (selector) => evaluate(`(() => {
    const el = document.querySelector('${selector}');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
  })()`);
  const wheelAt = async (p, dy) => { if (p !== null) await wheel(p.x, p.y, dy); };

  const stagePoint = `(() => { const s = document.getElementById("lf-stage"); if (!s) return null; const r = s.getBoundingClientRect(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; })()`;

  // #456's visual-review checklist item 2 is the spec here: at the limits the wheel hands scrolling back to the page.
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  const settled1 = await settleHome();
  await armWheelLog();
  const pt = await evaluate(stagePoint);

  await wheelAt(pt, -120);
  await sleep(150);
  const mid = { prevented: await lastWheel(), cam: await camNow() };
  check(
    "L1a mid-range a real wheel is consumed: the zoom steps and the event is defaultPrevented",
    atLandfall(settled1) && mid.prevented === true && mid.cam !== null && mid.cam.scale > settled1.scale * 1.05,
    JSON.stringify({ settled1, mid }),
  );

  let sat = await camNow();
  for (let i = 0; i < 24 && pt !== null; i++) {
    await wheelAt(pt, -480);
    await sleep(90);
    const next = await camNow();
    if (next !== null && sat !== null && Math.abs(next.scale - sat.scale) < 1e-9) { sat = next; break; }
    sat = next;
  }
  await evaluate(`window.__lfWheel = []`);
  await wheelAt(pt, -120);
  await sleep(150);
  const atMax = { prevented: await lastWheel(), cam: await camNow(), y: await scrollY() };
  check(
    "L1b at the close-in clamp (scale 7) a further wheel-in is released: no zoom step, not defaultPrevented, and the page holds (nothing above to scroll to)",
    sat !== null && Math.abs(sat.scale - 7) < 1e-6 && atMax.prevented === false && Math.abs(atMax.cam.scale - 7) < 1e-6 && atMax.y === 0,
    JSON.stringify({ sat, atMax }),
  );

  await wheelAt(pt, 120);
  await sleep(150);
  const backOff = await camNow();
  check(
    "L1c the release is limit-specific, not a dead zone: the very next wheel-out zooms again",
    backOff !== null && backOff.scale < 7 - 1e-6,
    JSON.stringify({ backOff }),
  );

  let floor = await camNow();
  for (let i = 0; i < 24 && pt !== null; i++) {
    await wheelAt(pt, 480);
    await sleep(90);
    const next = await camNow();
    if (next !== null && floor !== null && Math.abs(next.scale - floor.scale) < 1e-9) { floor = next; break; }
    floor = next;
  }
  // The saturation loop's released wheels already scrolled the page to its floor, so the probe POLLS its way back to top (a one-shot reset raced still-in-flight wheels and certified L1d from 44px, skeptic round 1) and re-reads the stage point at that scroll, or it proves nothing.
  for (let i = 0; i < 30; i++) {
    await evaluate(`window.scrollTo(0, 0)`);
    await sleep(120);
    if ((await scrollY()) === 0) break;
  }
  const pt2 = await evaluate(stagePoint);
  await evaluate(`window.__lfWheel = []`);
  const yBefore = await scrollY();
  await wheelAt(pt2, 120);
  await sleep(250);
  const atMin = { prevented: await lastWheel(), cam: await camNow(), y: await scrollY() };
  check(
    "L1d at the stand-off clamp (0.65 of fit) a further wheel-out is released and the page genuinely scrolls from a proven top: the wheel is handed back, not trapped",
    floor !== null && Math.abs(floor.scale - floor.fit * 0.65) < 1e-6 && atMin.prevented === false
      && yBefore === 0 && Math.abs(atMin.cam.scale - floor.scale) < 1e-9 && atMin.y > yBefore,
    JSON.stringify({ floor, yBefore, atMin }),
  );
  await evaluate(`window.scrollTo(0, 0)`);

  // The how flight stops the idle drift and re-arms its 9s timer, so every scale read below brackets its own gesture tightly, tolerating only sub-step drift (a wheel step is ~19%, the drift tween 1.5% over 14s).
  const settled2 = await settleHome();
  const howPt = await evaluate(buttonPoint('.lf-station[data-station="how"]'));
  if (howPt !== null) await clickAt(Math.round(howPt.x), Math.round(howPt.y));
  let how = null;
  for (let i = 0; i < 80; i++) {
    try {
      how = await evaluate(`(() => {
        const card = document.getElementById("lf-card-how");
        const scroller = card ? card.querySelector(".lf-card-scroll") : null;
        if (!card || !scroller) return null;
        const cs = getComputedStyle(card);
        return { open: !card.hidden && cs.visibility !== "hidden" && Number(cs.opacity) > 0.95,
          focused: document.activeElement === scroller,
          scrollTop: scroller.scrollTop, max: scroller.scrollHeight - scroller.clientHeight };
      })()`);
      if (how !== null && how.open && how.focused) break;
    } catch {}
    await sleep(75);
  }
  check(
    "L5 (arm 4) a real click opens the how panel and focus lands on its scroller, not the clicked pip",
    how !== null && how.open && how.focused && how.max > 0,
    JSON.stringify({ settled2: !!settled2, howPt, how }),
  );
  // The slip opens mid-flight (the open tween starts while the camera still eases to the station framing), so every scale-unchanged read below first waits for the flight to land or it blames the flight's own tail on the gesture.
  for (let i = 0; i < 40; i++) {
    const a = await evaluate(readXform);
    await sleep(250);
    if (a !== null && a === (await evaluate(readXform))) break;
  }

  const y5 = await scrollY();
  await pressKey("ArrowDown", "ArrowDown", 40);
  await sleep(200);
  const arrowed = await evaluate(`document.querySelector("#lf-card-how .lf-card-scroll")?.scrollTop ?? null`);
  check(
    "L5b ArrowDown scrolls the prose at once, the page unmoved",
    how !== null && arrowed !== null && arrowed > how.scrollTop && (await scrollY()) === y5,
    JSON.stringify({ from: how?.scrollTop, arrowed }),
  );

  const proseBox = await centerOf("#lf-card-how .lf-card-scroll");
  const closeBox0 = await evaluate(`(() => { const el = document.querySelector("#lf-card-how .lf-card-close"); if (!el) return null; const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })()`);
  const scale2a = await camScale();
  let prose = null;
  for (let i = 0; i < 30 && proseBox !== null; i++) {
    await wheelAt(proseBox, 240);
    await sleep(90);
    prose = await evaluate(`(() => { const s = document.querySelector("#lf-card-how .lf-card-scroll"); if (!s) return null; return { top: s.scrollTop, max: s.scrollHeight - s.clientHeight }; })()`);
    if (prose === null || prose.top >= prose.max - 0.5) break;
  }
  const after2 = { scale: await camScale(), y: await scrollY() };
  check(
    "L2 (arm 1) wheel over the prose scrolls it to its end: no zoom step, no page scroll",
    prose !== null && prose.top >= prose.max - 0.5 && after2.y === y5
      && scale2a !== null && after2.scale !== null && Math.abs(after2.scale / scale2a - 1) < 0.005,
    JSON.stringify({ prose, scale2a, after2 }),
  );

  const closeBox1 = await evaluate(`(() => { const el = document.querySelector("#lf-card-how .lf-card-close"); if (!el) return null; const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })()`);
  check(
    "L6 (arm 5) the head never scrolls away: the close button's box is unchanged after the prose reaches its end, overscroll contained",
    closeBox0 !== null && closeBox1 !== null && JSON.stringify(closeBox0) === JSON.stringify(closeBox1) && (await scrollY()) === y5,
    JSON.stringify({ closeBox0, closeBox1 }),
  );

  const headBox = await centerOf("#lf-card-how .lf-card-title");
  const scale3a = await camScale();
  await wheelAt(headBox, 120);
  await sleep(200);
  const after3 = { scale: await camScale(), y: await scrollY() };
  check(
    "L3 (arm 2) wheel over the panel's non-scrolling head is swallowed whole: no page scroll, no zoom step (the round-2 regression scrolled 120px a tick here)",
    headBox !== null && after3.y === y5 && scale3a !== null && after3.scale !== null && Math.abs(after3.scale / scale3a - 1) < 0.005,
    JSON.stringify({ scale3a, after3 }),
  );

  const clear6 = await evaluate(`(() => {
    const btn = document.querySelector('.lf-station[data-station="how"]');
    const stage = document.getElementById("lf-stage");
    const sheet = document.getElementById("lf-sheet");
    const card = document.getElementById("lf-card-how");
    if (!btn || !stage || !sheet || !card) return null;
    const sr = stage.getBoundingClientRect();
    const m = new DOMMatrixReadOnly(getComputedStyle(sheet).transform);
    const cr = card.getBoundingClientRect();
    return { anchorX: sr.left + Number(btn.dataset.nx) * 1500 * m.a + m.e, cardLeft: cr.left, innerWidth: window.innerWidth };
  })()`);
  check(
    "L7 (arm 6, wide) after the how flight the pip's clamp-dominated anchor stays clear west of the open panel (clearance, never the 0.4 framing literal)",
    clear6 !== null && clear6.innerWidth === 1280 && clear6.anchorX < clear6.cardLeft,
    JSON.stringify({ clear6 }),
  );
  await shoot("landfall-how-panel.png");
  await pressKey("Escape", "Escape", 27);
  await sleep(500);

  // Each station card in turn via its legend chip, so one loop pays for both the wheel-swallow arm and the touch-target sweep.
  const measureEnters = async (label) => {
    const boxes = [];
    let swallowed = null;
    for (const id of ["atlas", "explorer", "reading-room", "gallery"]) {
      const chipPt = await evaluate(buttonPoint(`.lf-legend-btn[data-station="${id}"]`));
      if (chipPt !== null) await clickAt(Math.round(chipPt.x), Math.round(chipPt.y));
      let open = false;
      for (let i = 0; i < 80; i++) {
        try {
          open = await evaluate(`(() => { const c = document.getElementById("lf-card-${id}"); if (!c || c.hidden) return false; const cs = getComputedStyle(c); return cs.visibility !== "hidden" && Number(cs.opacity) > 0.95; })()`);
        } catch {}
        if (open === true) break;
        await sleep(75);
      }
      await sleep(400);
      const box = await evaluate(`(() => { const a = document.querySelector("#lf-card-${id} .lf-card-enter"); if (!a) return null; const r = a.getBoundingClientRect(); return { id: "${id}", open: ${open}, w: r.width, h: r.height }; })()`);
      boxes.push(box);
      if (id === "atlas" && label === "desktop") {
        const cardPt = await centerOf("#lf-card-atlas .lf-card-prose");
        const yA = await scrollY();
        const sA = await camScale();
        await wheelAt(cardPt, 120);
        await sleep(200);
        swallowed = { yA, sA, y: await scrollY(), scale: await camScale() };
      }
      await pressKey("Escape", "Escape", 27);
      await sleep(400);
    }
    return { boxes, swallowed };
  };
  const desktop8 = await measureEnters("desktop");
  const enters = desktop8.boxes;
  const swallowed4 = desktop8.swallowed;
  check(
    "L4 (arm 3) wheel over an open station card is swallowed: no page scroll, no zoom step (before the fix this gesture stepped the zoom)",
    swallowed4 !== null && swallowed4.y === swallowed4.yA
      && swallowed4.sA !== null && swallowed4.scale !== null && Math.abs(swallowed4.scale / swallowed4.sA - 1) < 0.005,
    JSON.stringify({ swallowed4 }),
  );
  check(
    "L8 every slip's Enter link is a 44px touch target, measured open (#460 ratification 2)",
    enters.length === 4 && enters.every((b) => b !== null && b.open && b.h >= 44 && b.w >= 44),
    JSON.stringify({ enters }),
  );

  // L7 narrow + L9: ONE mobile emulation set for everything touch (the suite-zoom-gestures trap: enable BEFORE the navigate that boots, never change after the first real touch).
  await setMobileViewport(390, 844);
  const settled9 = await settleHome();
  const howPt9 = await evaluate(buttonPoint('.lf-station[data-station="how"]'));
  if (howPt9 !== null) await clickAt(Math.round(howPt9.x), Math.round(howPt9.y));
  let narrow6 = null;
  for (let i = 0; i < 80; i++) {
    try {
      narrow6 = await evaluate(`(() => {
        const card = document.getElementById("lf-card-how");
        const btn = document.querySelector('.lf-station[data-station="how"]');
        const stage = document.getElementById("lf-stage");
        const sheet = document.getElementById("lf-sheet");
        if (!card || !btn || !stage || !sheet) return null;
        const cs = getComputedStyle(card);
        if (card.hidden || cs.visibility === "hidden" || Number(cs.opacity) <= 0.95) return null;
        const sr = stage.getBoundingClientRect();
        const m = new DOMMatrixReadOnly(getComputedStyle(sheet).transform);
        const cr = card.getBoundingClientRect();
        return { anchorY: sr.top + Number(btn.dataset.ny) * 1157.931 * m.a + m.f, sheetTop: cr.top, innerWidth: window.innerWidth };
      })()`);
      if (narrow6 !== null) break;
    } catch {}
    await sleep(75);
  }
  await sleep(700);
  check(
    "L7b (arm 6, narrow) at 390 the flown-to anchor rides clear above the bottom sheet",
    narrow6 !== null && narrow6.innerWidth === 390 && narrow6.anchorY < narrow6.sheetTop,
    JSON.stringify({ settled9: !!settled9, narrow6 }),
  );
  await pressKey("Escape", "Escape", 27);
  await sleep(500);

  // The 390 sweep runs BEFORE any real touch (mouse clicks only), keeping the one-emulation-set rule whole; the narrow media block already trims a sibling control's padding, so the touch-target ruling is pinned on the one viewport where it binds.
  const narrow8 = await measureEnters("narrow");
  check(
    "L8b at 390 the touch targets hold: every Enter link is still 44px under the narrow media rules",
    narrow8.boxes.length === 4 && narrow8.boxes.every((b) => b !== null && b.open && b.h >= 44 && b.w >= 44),
    JSON.stringify({ enters390: narrow8.boxes }),
  );

  const stagePt9 = await evaluate(stagePoint);
  const stillCam = (a, b) =>
    a !== null && b !== null && Math.abs(b.scale - a.scale) < 1e-9 && Math.abs(b.x - a.x) < 1e-9 && Math.abs(b.y - a.y) < 1e-9;
  const touchAction9 = await evaluate(`(() => { const s = document.getElementById("lf-stage"); return s ? getComputedStyle(s).touchAction : null; })()`);
  const oneBefore = await camNow();
  if (stagePt9 !== null) {
    await touch("touchStart", [{ x: stagePt9.x, y: stagePt9.y, id: 0 }]);
    await touch("touchMove", [{ x: stagePt9.x - 60, y: stagePt9.y - 90, id: 0 }]);
    await touch("touchEnd", []);
  }
  await sleep(300);
  const oneAfter = await camNow();
  check(
    "L9a one finger never drives the map: a real touch drag leaves the whole camera untouched, scale and translate, and the stage still declares pan-y so the page keeps the gesture (#455 touch policy)",
    stagePt9 !== null && stillCam(oneBefore, oneAfter) && touchAction9 === "pan-y",
    JSON.stringify({ touchAction9, oneBefore, oneAfter }),
  );

  const twoBefore = await camNow();
  if (stagePt9 !== null) await pinch(stagePt9.x, stagePt9.y, 60, 180);
  await sleep(300);
  const twoAfter = await camNow();
  check(
    "L9b two fingers drive the map: a real pinch-out zooms the sheet in",
    twoBefore !== null && twoAfter !== null && twoAfter.scale > twoBefore.scale * 1.3,
    JSON.stringify({ twoBefore, twoAfter }),
  );

  // Two-finger PAN works, measured against the derivation that said it could not: touch points arrive as sequential per-finger pointer moves, so each intermediate ratio is not 1 and the out-then-in about moving midpoints nets to a translate while the spread-constant scale multiplies back exactly. The mockup's fixed start anchor genuinely no-ops; the shipped incremental form pans, the better half of "#455 two fingers drive the map", pinned here as live behavior.
  const panBefore = await camNow();
  if (stagePt9 !== null) {
    await touch("touchStart", [{ x: stagePt9.x - 40, y: stagePt9.y, id: 0 }, { x: stagePt9.x + 40, y: stagePt9.y, id: 1 }]);
    await touch("touchMove", [{ x: stagePt9.x, y: stagePt9.y + 30, id: 0 }, { x: stagePt9.x + 80, y: stagePt9.y + 30, id: 1 }]);
    await touch("touchEnd", []);
  }
  await sleep(300);
  const panAfter = await camNow();
  check(
    "L9c a two-finger drag carries the sheet: the translate follows the fingers while the spread-constant gesture leaves the scale exactly where it stood",
    stagePt9 !== null && panBefore !== null && panAfter !== null
      && Math.abs(panAfter.x - panBefore.x) > 10 && Math.abs(panAfter.y - panBefore.y) > 10
      && Math.abs(panAfter.scale / panBefore.scale - 1) < 1e-6,
    JSON.stringify({ panBefore, panAfter }),
  );
  await clearMobile();

  // L10/L11: the seed form's no-JS GET fallback (#454: "no-JS GET fallback degrading to today's world"), then the JS-on control proving the Explorer ignores the query (bare visit and ?seed=777 visit must show the SAME seed; comparing to 777's absence would flake the day the daily seed IS 777).
  await send("Emulation.setScriptExecutionDisabled", { value: true });
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let formReady = false;
  for (let i = 0; i < 120; i++) {
    try {
      formReady = await evaluate(`(() => {
        const i2 = document.getElementById("seed-input");
        if (!i2) return false;
        const r = i2.getBoundingClientRect();
        const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return hit === i2;
      })()`);
    } catch {}
    if (formReady === true) break;
    await sleep(150);
  }
  let drawPt = null;
  if (formReady === true) {
    await evaluate(`(() => { const i2 = document.getElementById("seed-input"); if (i2) i2.value = "777"; })()`);
    drawPt = await centerOf("#seed-form button.primary");
    if (drawPt !== null) await clickAt(drawPt.x, drawPt.y);
  }
  let nojs = null;
  for (let i = 0; i < 120 && drawPt !== null; i++) {
    try {
      nojs = await evaluate(`({ path: location.pathname, search: location.search, hash: location.hash, h1: document.querySelector("h1")?.textContent ?? null })`);
      if (nojs.path === "/explorer/") break;
    } catch {}
    await sleep(100);
  }
  await send("Emulation.setScriptExecutionDisabled", { value: false });
  check(
    "L10 scripts off, the seed form still delivers: a real click submits the native GET to explorer/?seed=777, no hash, the Explorer shell standing",
    formReady === true && nojs !== null && nojs.path === "/explorer/" && nojs.search === "?seed=777" && nojs.hash === "" && (nojs.h1 ?? "").includes("Explorer"),
    JSON.stringify({ formReady, drawPt, nojs }),
  );

  const seedShown = async () => {
    for (let i = 0; i < 200; i++) {
      let s = null;
      try {
        s = await evaluate(`(() => {
          const svg = document.querySelector("#map svg");
          const status = document.getElementById("status");
          const seed = document.getElementById("seed");
          if (!svg || !status || status.textContent !== "" || !seed || seed.value === "") return null;
          return seed.value;
        })()`);
      } catch {}
      if (s !== null) return s;
      await sleep(75);
    }
    return null;
  };
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/` });
  const bareSeed = await seedShown();
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/?seed=777` });
  const querySeed = await seedShown();
  const queryKept = await evaluate(`location.search`);
  check(
    "L11 with scripts on the Explorer ignores the query and degrades to today's world: the ?seed=777 visit draws the same seed the bare visit does",
    bareSeed !== null && querySeed === bareSeed && queryKept === "?seed=777",
    JSON.stringify({ bareSeed, querySeed, queryKept }),
  );

  gate.check("L12 the landfall hardening flow is clean (no console errors, no new 4xx)");
}
