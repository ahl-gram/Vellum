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
  const bodyLocked1d = await evaluate(`getComputedStyle(document.body).overflow`);
  check(
    "L1d at the stand-off clamp (0.65 of fit) a further wheel-out is released, not trapped, and the full-bleed page provably holds: the body is scroll-locked while the camera drives (#461; Sub 6a's release valve re-opens the scroll consequence)",
    floor !== null && Math.abs(floor.scale - floor.fit * 0.65) < 1e-6 && atMin.prevented === false
      && yBefore === 0 && Math.abs(atMin.cam.scale - floor.scale) < 1e-9 && atMin.y === 0 && bodyLocked1d === "hidden",
    JSON.stringify({ floor, yBefore, atMin, bodyLocked1d }),
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
      if (how !== null && how.open && how.focused && how.max > 0) break;
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

  const measureEnters = async (label) => {
    const boxes = [];
    let swallowed = null;
    for (const id of ["atlas", "explorer", "reading-room", "gallery"]) {
      // The legend stands down under 900px (#461 phone doors): narrow enters by the station pip, desktop keeps the legend chip it is really testing. The whole-sheet reset first, a real click, so every pip is on screen whatever camera the earlier flights left.
      if (label === "narrow") {
        const homePt = await evaluate(buttonPoint("#lf-home"));
        if (homePt !== null) await clickAt(Math.round(homePt.x), Math.round(homePt.y));
        await sleep(700);
      }
      const chipPt = await evaluate(buttonPoint(
        label === "narrow" ? `.lf-station[data-station="${id}"]` : `.lf-legend-btn[data-station="${id}"]`,
      ));
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
    "L4 (arm 3) wheel over an open station card is swallowed: no page scroll, no zoom step",
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
  // The drag heads INTO clamp headroom (+x,+y): the original (-x,-y) gesture aimed at the corner the camera was already parked on, so stillness held with every gate deleted (guard-prover round 2).
  const bodyLocked390 = await evaluate(`getComputedStyle(document.body).overflow`);
  const oneBefore = await camNow();
  if (stagePt9 !== null) {
    await touch("touchStart", [{ x: stagePt9.x, y: stagePt9.y, id: 0 }]);
    await touch("touchMove", [{ x: stagePt9.x + 60, y: stagePt9.y + 90, id: 0 }]);
    await touch("touchEnd", []);
  }
  await sleep(300);
  const oneAfter = await camNow();
  if (stagePt9 !== null) {
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: stagePt9.x, y: stagePt9.y, button: "left", buttons: 1, clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: stagePt9.x + 60, y: stagePt9.y + 90, button: "left", buttons: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: stagePt9.x + 60, y: stagePt9.y + 90, button: "left", clickCount: 1 });
  }
  await sleep(300);
  const mouseWitness = await camNow();
  check(
    "L9a one finger never drives the map, and the fixture can prove it: the touch drag leaves the whole camera untouched while the SAME drag by mouse carries the sheet, the stage declares pan-y, and the full-bleed 390 body is scroll-locked while the camera drives (the one-finger page-scroll residue now rests on the lock, not on document height; Sub 6a re-opens this arm with the release valve)",
    stagePt9 !== null && stillCam(oneBefore, oneAfter) && touchAction9 === "pan-y" && bodyLocked390 === "hidden"
      && mouseWitness !== null && oneAfter !== null && Math.abs(mouseWitness.x - oneAfter.x) > 30,
    JSON.stringify({ touchAction9, bodyLocked390, oneBefore, oneAfter, mouseWitness }),
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

  // L9c-L9g: the real two-finger contract (#475). Every pan read pins its fixture's clamp headroom first: the old L9c went green off a clamp-parked fixture (PR #474 skeptic finding 3), so an unproven fixture is the bug these arms exist to never repeat.
  const headroom = () => evaluate(`(() => {
    const stage = document.getElementById("lf-stage");
    const sheet = document.getElementById("lf-sheet");
    if (!stage || !sheet) return null;
    const r = stage.getBoundingClientRect();
    const m = new DOMMatrixReadOnly(getComputedStyle(sheet).transform);
    return { cx: m.e + (1500 * m.a) / 2, cy: m.f + (1157.931 * m.a) / 2, w: r.width, h: r.height };
  })()`);
  const roomy = (hr) => hr !== null && hr.cx > 50 && hr.cx < hr.w - 50 && hr.cy > 50 && hr.cy < hr.h - 50;
  // Ruling 3 on #475: at a limit the arm picks the drag direction FROM measured headroom and proves the room exists, instead of assuming an unparked centre.
  const roomDir = (hr) => {
    if (hr === null) return null;
    const sx = hr.w - hr.cx >= hr.cx ? 1 : -1;
    const sy = hr.h - hr.cy >= hr.cy ? 1 : -1;
    const roomX = sx > 0 ? hr.w - hr.cx : hr.cx;
    const roomY = sy > 0 ? hr.h - hr.cy : hr.cy;
    return roomX > 100 && roomY > 60 ? { sx, sy } : null;
  };
  const twoFingerDrag = async (p, sx = 1, sy = 1) => {
    await touch("touchStart", [{ x: p.x - 40, y: p.y, id: 0 }, { x: p.x + 40, y: p.y, id: 1 }]);
    await touch("touchMove", [{ x: p.x - 40 + sx * 40, y: p.y + sy * 30, id: 0 }, { x: p.x + 40 + sx * 40, y: p.y + sy * 30, id: 1 }]);
    await touch("touchEnd", []);
    await sleep(300);
  };
  const recenter = async () => {
    await evaluate(`document.getElementById("lf-stage")?.focus()`);
    await pressKey("0", "Digit0", 48);
    await sleep(1600);
  };

  await recenter();
  const room9c = await headroom();
  const startClear9c = stagePt9 === null ? null : await evaluate(`(() => {
    const hit = (x, y) => document.elementFromPoint(x, y)?.closest("button, a, input, select") ?? null;
    return hit(${stagePt9.x - 40}, ${stagePt9.y}) === null && hit(${stagePt9.x + 40}, ${stagePt9.y}) === null;
  })()`);
  const panBefore = await camNow();
  if (stagePt9 !== null) await twoFingerDrag(stagePt9);
  const panAfter = await camNow();
  const panDelta = panBefore !== null && panAfter !== null
    ? { dx: panAfter.x - panBefore.x, dy: panAfter.y - panBefore.y, sRatio: panAfter.scale / panBefore.scale } : null;
  check(
    "L9c two fingers PAN the map: at a proven off-clamp fixture whose finger points are PROVEN off every control, the sheet follows the midpoint, right direction and near-full magnitude, the scale exactly held",
    stagePt9 !== null && roomy(room9c) && startClear9c === true && panDelta !== null
      && panDelta.dx > 25 && panDelta.dx < 55 && panDelta.dy > 18 && panDelta.dy < 42
      && Math.abs(panDelta.sRatio - 1) < 1e-6,
    JSON.stringify({ room9c, startClear9c, panBefore, panAfter, panDelta }),
  );

  // Saturate to the close-in clamp by real pinches alone (no mouse mixing inside the touch block).
  let top9 = await camNow();
  for (let i = 0; i < 12 && stagePt9 !== null; i++) {
    await pinch(stagePt9.x, stagePt9.y, 60, 180);
    await sleep(200);
    const next = await camNow();
    if (next !== null && top9 !== null && Math.abs(next.scale - top9.scale) < 1e-9) { top9 = next; break; }
    top9 = next;
  }
  const room9d = await headroom();
  const dir9d = roomDir(room9d);
  // Before/after sampling is blind to a mid-gesture dip that saturates back to the ceiling (guard-prover round 2), so the arm watches every synchronous transform write and keeps the minimum.
  await evaluate(`(() => {
    const sheet = document.getElementById("lf-sheet");
    const scaleOf = (t) => { const m = /scale\\(([-\\d.e]+)\\)/.exec(t ?? ""); return m === null ? null : Number(m[1]); };
    window.__lfMinScale = scaleOf(sheet?.style.transform) ?? Infinity;
    window.__lfScaleWrites = 0;
    window.__lfScaleObs?.disconnect();
    window.__lfScaleObs = new MutationObserver((recs) => {
      window.__lfScaleWrites += recs.length;
      for (const r of recs) { const s = scaleOf(r.oldValue); if (s !== null && s < window.__lfMinScale) window.__lfMinScale = s; }
      const now = scaleOf(sheet?.style.transform); if (now !== null && now < window.__lfMinScale) window.__lfMinScale = now;
    });
    if (sheet) window.__lfScaleObs.observe(sheet, { attributes: true, attributeFilter: ["style"], attributeOldValue: true });
  })()`);
  const maxBefore = await camNow();
  if (stagePt9 !== null && dir9d !== null) await twoFingerDrag(stagePt9, dir9d.sx, dir9d.sy);
  const minScale9d = await evaluate(`(window.__lfScaleObs?.disconnect(), window.__lfMinScale)`);
  // A drag at the clamp writes the transform at least once (the pan half alone), so zero observed writes means the instrument never engaged, not a quiet gesture (guard-prover round 3).
  const writes9d = await evaluate(`window.__lfScaleWrites`);
  const maxAfter = await camNow();
  check(
    "L9d at the close-in clamp a two-finger drag still pans into PROVEN headroom, signed, and never collapses the zoom EVEN MID-GESTURE (PR #474 measured scale 7 falling to 4.53 here; a dip that saturates back by gesture end hides from before/after reads)",
    top9 !== null && Math.abs(top9.scale - 7) < 1e-6 && dir9d !== null && maxBefore !== null && maxAfter !== null
      && Math.abs(maxAfter.scale - 7) < 1e-6
      && typeof minScale9d === "number" && minScale9d > 7 - 1e-6
      && typeof writes9d === "number" && writes9d > 0
      && (maxAfter.x - maxBefore.x) * dir9d.sx > 25 && (maxAfter.x - maxBefore.x) * dir9d.sx < 55
      && (maxAfter.y - maxBefore.y) * dir9d.sy > 18 && (maxAfter.y - maxBefore.y) * dir9d.sy < 42,
    JSON.stringify({ room9d, dir9d, maxBefore, maxAfter, minScale9d, writes9d }),
  );

  // The from-start ratio's own contract: a clamped pinch-in owes its debt, so returning to the starting spread lands back on the clamp exactly (a per-frame relative ratio forgets the clamped half and undershoots).
  const debtBefore = await camNow();
  if (stagePt9 !== null) {
    await touch("touchStart", [{ x: stagePt9.x - 40, y: stagePt9.y, id: 0 }, { x: stagePt9.x + 40, y: stagePt9.y, id: 1 }]);
    await touch("touchMove", [{ x: stagePt9.x - 80, y: stagePt9.y, id: 0 }, { x: stagePt9.x + 80, y: stagePt9.y, id: 1 }]);
    await sleep(120);
    await touch("touchMove", [{ x: stagePt9.x - 40, y: stagePt9.y, id: 0 }, { x: stagePt9.x + 40, y: stagePt9.y, id: 1 }]);
    await sleep(120);
    await touch("touchEnd", []);
  }
  await sleep(300);
  const debtAfter = await camNow();
  check(
    "L9d2 the pinch owes its debt at the ceiling: one gesture that pinches in past the clamp and returns to its starting spread lands exactly back on 7",
    debtBefore !== null && debtAfter !== null && Math.abs(debtBefore.scale - 7) < 1e-6 && Math.abs(debtAfter.scale - 7) < 1e-6,
    JSON.stringify({ debtBefore, debtAfter }),
  );

  // Down to the stand-off clamp the same way.
  let floor9 = await camNow();
  for (let i = 0; i < 14 && stagePt9 !== null; i++) {
    await pinch(stagePt9.x, stagePt9.y, 180, 60);
    await sleep(200);
    const next = await camNow();
    if (next !== null && floor9 !== null && Math.abs(next.scale - floor9.scale) < 1e-9) { floor9 = next; break; }
    floor9 = next;
  }
  const room9e = await headroom();
  const dir9e = roomDir(room9e);
  const minBefore = await camNow();
  if (stagePt9 !== null && dir9e !== null) await twoFingerDrag(stagePt9, dir9e.sx, dir9e.sy);
  const minAfter = await camNow();
  check(
    "L9e at the stand-off clamp a two-finger drag holds the scale on its floor (PR #474 measured a 1.6x zoom-IN here) and pans into PROVEN headroom, signed",
    floor9 !== null && dir9e !== null && minBefore !== null && minAfter !== null
      && Math.abs(minBefore.scale - minBefore.fit * 0.65) < 1e-6
      && Math.abs(minAfter.scale - minBefore.scale) < 1e-9
      && (minAfter.x - minBefore.x) * dir9e.sx > 25 && (minAfter.x - minBefore.x) * dir9e.sx < 55
      && (minAfter.y - minBefore.y) * dir9e.sy > 18 && (minAfter.y - minBefore.y) * dir9e.sy < 42,
    JSON.stringify({ room9e, dir9e, minBefore, minAfter }),
  );

  // A gesture may BEGIN on a pip (PR #474 finding 2: the mouse-only capture rationale had gated all pointer types, deadening 47% of start points), and a plain touch TAP on that same pip must still open its card.
  await recenter();
  const pipPt9 = await evaluate(buttonPoint('.lf-station[data-station="how"]'));
  const room9f = await headroom();
  const onPipBefore = await camNow();
  // The second finger sits LEFT of the pip and the move stays horizontal: at 390 the pip rides near the stage's right and lower edges, and a finger dispatched off the stage never registers (touch pointers are uncaptured), which faked this arm's first red.
  if (pipPt9 !== null) {
    await touch("touchStart", [{ x: Math.round(pipPt9.x), y: Math.round(pipPt9.y), id: 0 }, { x: Math.round(pipPt9.x) - 80, y: Math.round(pipPt9.y), id: 1 }]);
    await touch("touchMove", [{ x: Math.round(pipPt9.x) + 40, y: Math.round(pipPt9.y), id: 0 }, { x: Math.round(pipPt9.x) - 40, y: Math.round(pipPt9.y), id: 1 }]);
    await touch("touchEnd", []);
  }
  await sleep(300);
  const onPipAfter = await camNow();
  const cardStayed = await evaluate(`(() => { const c = document.getElementById("lf-card-how"); return c !== null && c.hidden; })()`);
  check(
    "L9f a two-finger gesture that begins on a pip still drives the map, and the drag never reads as a tap (the slip stays shut)",
    pipPt9 !== null && roomy(room9f) && onPipBefore !== null && onPipAfter !== null
      && onPipAfter.x - onPipBefore.x > 25 && onPipAfter.x - onPipBefore.x < 55 && cardStayed === true,
    JSON.stringify({ pipPt9, room9f, onPipBefore, onPipAfter, cardStayed }),
  );

  const tapPt = await evaluate(buttonPoint('.lf-station[data-station="how"]'));
  if (tapPt !== null) {
    await touch("touchStart", [{ x: Math.round(tapPt.x), y: Math.round(tapPt.y), id: 0 }]);
    await touch("touchEnd", []);
  }
  let tapped = false;
  for (let i = 0; i < 60; i++) {
    try {
      tapped = await evaluate(`(() => { const c = document.getElementById("lf-card-how"); if (!c || c.hidden) return false; const cs = getComputedStyle(c); return cs.visibility !== "hidden" && Number(cs.opacity) > 0.95; })()`);
    } catch {}
    if (tapped === true) break;
    await sleep(75);
  }
  check(
    "L9g a plain touch tap on the pip still opens its slip: loosening the control guard for gestures never costs the tap",
    tapPt !== null && tapped === true,
    JSON.stringify({ tapPt, tapped }),
  );
  await pressKey("Escape", "Escape", 27);
  await sleep(400);

  await recenter();
  const inPt = await evaluate(buttonPoint("#lf-in"));
  const inBefore = await camNow();
  if (inPt !== null) {
    await touch("touchStart", [{ x: Math.round(inPt.x), y: Math.round(inPt.y), id: 0 }]);
    await touch("touchEnd", []);
  }
  let inAfter = null;
  for (let i = 0; i < 30; i++) {
    const c = await camNow();
    if (c !== null && inBefore !== null && c.scale > inBefore.scale * 1.4) { inAfter = c; break; }
    await sleep(100);
  }
  check(
    "L9h a one-finger touch tap on a camera button still zooms: the loosened control guard covers the controls, not just the pips (#475 ruling 2)",
    inPt !== null && inBefore !== null && inAfter !== null && inAfter.scale > inBefore.scale * 1.4,
    JSON.stringify({ inPt, inBefore, inAfter }),
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
      // The break must demand everything the check asserts: navigation COMMITS before the document parses, so a path-only break snapshots h1 null on a slow machine (CI 2026-08-25, locally unreproducible).
      if (nojs.path === "/explorer/" && (nojs.h1 ?? "").includes("Explorer")) break;
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
