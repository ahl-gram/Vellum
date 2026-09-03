// The floating seed chrome (H0-H6, #289 semantics relanded at #470), the ceremony (H7-H13, #457), the failed-bundle doors (H13c, #470), and the stations, cards, and idle drift (H14-H17, #458): the homepage frame at desktop and a real 390px viewport, the corner form, the seed form's real promise (the chart number in the baked cartouche IS the seed, so the drawn SVG identifies its world), the veil's arrival, skips in both phases, sitting memory, reduced-motion and narrow-viewport stories, and the station flights driven by REAL dispatched input; deltas scoped per flow, plumbing shared via home-support.mjs (#460).
import { readCam, atLandfall, readXform, buttonPoint, makeStage } from "./home-support.mjs";

export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, setMobileViewport, clearMobile, consoleErrors, http4xx, PORT } = ctx;

  const { pressKey, clickAt, settleHome } = makeStage(ctx);

  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  const errBase = consoleErrors.length;
  const httpBase = http4xx.length;

  let ready = false;
  for (let i = 0; i < 100; i++) {
    let ok = null;
    try { ok = await evaluate(`document.readyState === "complete" && !!document.getElementById("seed-form")`); } catch {}
    if (ok) { ready = true; break; }
    await sleep(75);
  }
  check("H0 the homepage loads with the seed form present", ready, "readyState complete + #seed-form");

  // First arrival raises the veil (H7 proves it); settle it with a REAL key so H1-H5 and their plates measure the page. Synthetic .click() dispatches no pointerdown, and a key thrown before the module arms the skip hits nothing, so press until it lands.
  if (ready) {
    for (let i = 0; i < 40; i++) {
      await pressKey("Escape", "Escape", 27);
      await sleep(150);
      let up = true;
      try { up = await evaluate(`!!document.getElementById("lf-veil")`); } catch {}
      if (!up) break;
    }
  }

  // Gold compared NUMERICALLY: Chromium serializes var() colors as rgb()/color(srgb ...), so the channels, not the spelling, are under test (#324).
  const controlGold = (bg) => {
    if (!bg) return false;
    let m = bg.match(/^rgb\((\d+), (\d+), (\d+)\)$/);
    if (m) return +m[1] === 240 && +m[2] === 227 && +m[3] === 189;
    m = bg.match(/^color\(srgb ([0-9.]+) ([0-9.]+) ([0-9.]+)\)$/);
    return !!m && Math.round(m[1] * 255) === 240 && Math.round(m[2] * 255) === 227 && Math.round(m[3] * 255) === 189;
  };
  const frame = ready ? await evaluate(`(() => {
    const form = document.getElementById("seed-form");
    const stage = document.getElementById("lf-stage");
    if (!form || !stage) return null;
    const f = form.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    const cs = getComputedStyle(form);
    const btn = form.querySelector("button.primary");
    return { pos: cs.position, right: s.right - f.right, top: f.top - s.top,
      inside: f.left > s.left && f.right < s.right + 1 && f.top > s.top && f.bottom < s.bottom,
      gold: btn ? getComputedStyle(btn).backgroundColor : null,
      doorsHidden: ["explorer", "reading-room", "atlas", "gallery"].every((id) => {
        const c = document.getElementById("lf-card-" + id);
        return c !== null && c.offsetParent === null;
      }) };
  })()`) : null;
  check(
    "H1 the seed form floats as the mockup's corner chrome: absolute in the stage's top-right, the gold Draw it, and no door slip showing on a healthy load",
    !!frame && frame.pos === "absolute" && frame.inside && frame.right > 10 && frame.right < 60
      && frame.top > 10 && frame.top < 60 && controlGold(frame.gold) && frame.doorsHidden,
    JSON.stringify(frame),
  );

  const hero = ready ? await evaluate(`(() => {
    const hook = document.querySelector(".lf-seed .seed-hook");
    const input = document.getElementById("seed-input");
    const line = document.querySelector(".lf-seed .seed-gloss");
    return { hook: hook ? hook.innerText : null, seed: input ? input.value : null,
      lineStyle: line ? getComputedStyle(line).fontStyle : null };
  })()`) : null;
  check(
    "H2 the hook reads as ratified, the seed input is prefilled 42, the gloss is italic",
    !!hero && /Give Vellum a number\./.test(hero.hook) && /It gives you back a world\./.test(hero.hook) && hero.seed === "42" && hero.lineStyle === "italic",
    JSON.stringify(hero),
  );
  await shoot("home-seed-chrome.png");

  await setMobileViewport(390, 900);
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let mobileReady = false;
  for (let i = 0; i < 100; i++) {
    let ok = null;
    try { ok = await evaluate(`document.readyState === "complete" && !!document.getElementById("seed-form")`); } catch {}
    if (ok) { mobileReady = true; break; }
    await sleep(75);
  }
  const mobile = mobileReady ? await evaluate(`(() => {
    const form = document.getElementById("seed-form");
    const gloss = document.querySelector(".lf-seed .seed-gloss");
    const input = document.getElementById("seed-input");
    const btn = form ? form.querySelector("button.primary") : null;
    if (!form || !gloss || !input || !btn) return null;
    const f = form.getBoundingClientRect();
    const i = input.getBoundingClientRect();
    const r = new Range();
    r.selectNodeContents(btn);
    return { innerWidth: window.innerWidth, scrollW: document.documentElement.scrollWidth,
      inViewport: f.left >= 0 && f.right <= 390.5, glossShown: getComputedStyle(gloss).display,
      inputInsidePanel: i.left >= f.left - 0.5 && i.right <= f.right + 0.5,
      drawItLines: r.getClientRects().length };
  })()`) : null;
  check(
    "H3 at 390px the corner form stays whole in the viewport, its controls whole inside the panel, Draw it on one line, the gloss stood down, nothing scrolling sideways",
    !!mobile && mobile.innerWidth === 390 && mobile.scrollW === 390 && mobile.inViewport
      && mobile.inputInsidePanel && mobile.drawItLines === 1 && mobile.glossShown === "none",
    JSON.stringify(mobile),
  );
  await shoot("home-seed-chrome-390.png");
  await clearMobile();
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  ready = false;
  for (let i = 0; i < 100; i++) {
    let ok = null;
    try { ok = await evaluate(`document.readyState === "complete" && !!document.getElementById("seed-form")`); } catch {}
    if (ok) { ready = true; break; }
    await sleep(75);
  }

  if (ready) {
    await evaluate(`(() => {
      const i = document.getElementById("seed-input");
      i.value = "777";
      document.querySelector("#seed-form button").click();
    })()`);
  }
  // The Explorer canonicalizes a bare #seed=N on boot, so accept any hash keeping seed=777; the intercept itself is proven by the SEARCH staying empty (a ?seed= GET would mean the inline script never ran).
  let landed = null;
  let drew = false;
  for (let i = 0; i < 200; i++) {
    try {
      landed = await evaluate(`location.pathname + location.search + location.hash`);
      if (/^\/explorer\/#(.*&)?seed=777(&|$)/.test(landed)) {
        drew = await evaluate(`(() => {
          const svg = document.querySelector("#map svg");
          const status = document.getElementById("status");
          return !!svg && !!status && status.textContent === "" && svg.textContent.includes("CHART № 777");
        })()`);
        if (drew) break;
      }
    } catch {}
    await sleep(75);
  }
  check(
    "H4 Draw it lands on explorer/#seed=777 (hash form, no ?seed= GET) and that exact world is drawn",
    !!landed && /^\/explorer\/#(.*&)?seed=777(&|$)/.test(landed) && drew,
    `landed at ${landed}`,
  );
  await shoot("home-drawit-777.png");

  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let backHome = false;
  for (let i = 0; i < 100; i++) {
    let ok = null;
    try { ok = await evaluate(`document.readyState === "complete" && !!document.getElementById("seed-form")`); } catch {}
    if (ok) { backHome = true; break; }
    await sleep(75);
  }
  // Navigation never commits inside the click's own task, so the "stayed" read must come AFTER a settle or the check is vacuous.
  let refused = null;
  if (backHome) {
    try {
      refused = await evaluate(`(() => {
        const i = document.getElementById("seed-input");
        i.value = "not a seed";
        document.querySelector("#seed-form button").click();
        return { flagged: !i.validity.valid };
      })()`);
      await sleep(600);
      const stayed = await evaluate(`location.pathname === "/" && !!document.getElementById("seed-form")`);
      refused = refused ? { ...refused, stayed } : null;
    } catch { refused = null; }
  }
  check(
    "H5a garbage input is refused in place by the pattern (native hint, no navigation)",
    !!refused && refused.stayed && refused.flagged,
    JSON.stringify(refused),
  );
  let degraded = null;
  if (backHome) {
    try {
      await evaluate(`(() => {
        const i = document.getElementById("seed-input");
        i.value = "";
        document.querySelector("#seed-form button").click();
      })()`);
    } catch {}
    for (let i = 0; i < 100; i++) {
      try {
        degraded = await evaluate(`location.pathname + location.search + location.hash`);
        if (degraded.startsWith("/explorer/")) break;
      } catch {}
      await sleep(75);
    }
  }
  check(
    "H5b an empty seed reaches the intercept and degrades to the bare Explorer (no ?seed= GET)",
    !!degraded && degraded.startsWith("/explorer/") && !degraded.includes("?"),
    `landed at ${degraded}`,
  );

  // "AbortError: Transition was skipped": motion.css opts the site into cross-document view transitions, and a navigation landing while a prior one settles surfaces this stock abort as an unhandled rejection; the folio's expected cancellation, not an app error.
  const errDelta = consoleErrors
    .slice(errBase)
    .filter((e) => !e.includes("AbortError: Transition was skipped"));
  const httpDelta = http4xx.slice(httpBase).filter((u) => !/favicon/i.test(u));
  check(
    "H6 the home flow is clean (no console errors, no new 4xx)",
    errDelta.length === 0 && httpDelta.length === 0,
    [...errDelta, ...httpDelta].join(" | ") || "clean",
  );

  // The ceremony (#457). Clearing the sitting makes the next arrival first again.
  const errBase2 = consoleErrors.length;
  const httpBase2 = http4xx.length;
  await evaluate(`sessionStorage.clear()`);
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let veiled = null;
  for (let i = 0; i < 100; i++) {
    try {
      veiled = await evaluate(`(() => {
        const v = document.getElementById("lf-veil");
        if (!v) return null;
        return {
          status: v.querySelector(".veil-status")?.textContent ?? null,
          rose: !!v.querySelector(".veil-rose .rose-needle"),
          wordmark: v.querySelector(".veil-wordmark")?.textContent ?? null,
        };
      })()`);
      if (veiled !== null && /^Sounding · \d+ fathom$/.test(veiled.status ?? "")) break;
    } catch {}
    await sleep(60);
  }
  check(
    "H7a a first arrival raises the veil: wordmark, rose, and the sounding line counting fathoms",
    veiled !== null && veiled.rose && veiled.wordmark === "Vellum" && /^Sounding · \d+ fathom$/.test(veiled.status ?? ""),
    JSON.stringify(veiled),
  );
  await shoot("home-veil.png");

  let landed7 = null;
  for (let i = 0; i < 160; i++) {
    try { landed7 = await evaluate(readCam); } catch {}
    if (atLandfall(landed7)) break;
    await sleep(75);
  }
  check(
    "H7b the veil lifts on its own and the flight settles on the isle at the landfall scale",
    atLandfall(landed7),
    JSON.stringify(landed7),
  );
  await shoot("home-landfall.png");

  // H8's teeth: before the key the camera provably sits at the wide anchorage (0.78 of fit), so the jump to the landfall scale can only come from the skip's land(0). The poll waits for the ANCHORAGE, not merely the veil: the pre-paint veil stands before the module boots, and a key in that window has no skip listener to hit (CI caught exactly that).
  await evaluate(`sessionStorage.clear()`);
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  const anchored = (s) => s !== null && s.veil && Math.abs(s.scale - s.fit * 0.78) < 1e-3;
  let before8 = null;
  for (let i = 0; i < 150; i++) {
    try { before8 = await evaluate(readCam); } catch {}
    if (anchored(before8)) break;
    await sleep(60);
  }
  const anchored8 = anchored(before8);
  await pressKey("Escape", "Escape", 27);
  await sleep(120);
  let skipped = null;
  try { skipped = await evaluate(readCam); } catch {}
  check(
    "H8 a real key skips the sounding: the veil is gone at once and the camera jumps from the anchorage to its destination",
    anchored8 && atLandfall(skipped),
    JSON.stringify({ before8, skipped }),
  );

  // The other half of the ratified class: a skip AFTER the sounding, while Landfall is read (the hold or the lift), must also land settled, not mid-flight.
  await evaluate(`sessionStorage.clear()`);
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let at8b = null;
  for (let i = 0; i < 400; i++) {
    try { at8b = await evaluate(readCam); } catch {}
    if (at8b !== null && at8b.veil && at8b.status === "Landfall") break;
    await sleep(25);
  }
  const held8b = at8b !== null && at8b.veil && at8b.status === "Landfall" && !at8b.lifting;
  await pressKey("Escape", "Escape", 27);
  await sleep(120);
  let after8b = null;
  try { after8b = await evaluate(readCam); } catch {}
  // The skip must CANCEL the armed hold timer, not just close the veil: move the camera with a real "+" zoom, then prove no phantom lift flies it back (guard-prover round 2: land(0)'s deletion went red here, but an uncancelled holdTimer escaped, because its stray flight targets the destination the camera already holds and only a moved camera can see it).
  await evaluate(`document.getElementById("lf-stage").focus()`);
  await pressKey("+", "Equal", 187);
  await sleep(1400);
  let zoomed8b = null;
  try { zoomed8b = await evaluate(readCam); } catch {}
  const zoomHeld = zoomed8b !== null && !zoomed8b.veil && Math.abs(zoomed8b.scale - zoomed8b.expected * 1.5) < 1e-3;
  check(
    "H8b a real key during the Landfall hold jumps straight to the settled view, and the cancelled ceremony never steals the camera back from a later gesture",
    held8b && atLandfall(after8b) && zoomHeld,
    JSON.stringify({ at8b, after8b, zoomed8b }),
  );

  // H9/H10 poll for the settled state rather than reading once after a fixed sleep (a one-shot read caught a still-loading page on a busy CI lane and saw transform none), and their teeth move to the invariant that NO sample ever sees the veil. The about:blank bounce (the suite-zoom Z13 idiom) keeps the first samples off the previous page, which already sits at the landfall scale.
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let returning = null;
  let sawVeil9 = false;
  for (let i = 0; i < 200; i++) {
    try { returning = await evaluate(readCam); } catch {}
    if (returning !== null && returning.veil) sawVeil9 = true;
    if (atLandfall(returning)) break;
    await sleep(75);
  }
  check(
    "H9 within a sitting the ceremony stands down: no sample ever sees a veil and the camera settles straight on the isle",
    atLandfall(returning) && !sawVeil9,
    JSON.stringify({ returning, sawVeil9 }),
  );

  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await evaluate(`sessionStorage.clear()`);
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let reduced10 = null;
  let sawVeil10 = false;
  for (let i = 0; i < 200; i++) {
    try { reduced10 = await evaluate(readCam); } catch {}
    if (reduced10 !== null && reduced10.veil) sawVeil10 = true;
    if (atLandfall(reduced10)) break;
    await sleep(75);
  }
  await send("Emulation.setEmulatedMedia", { features: [] });
  check(
    "H10 reduced motion asks for no ceremony at all: no sample ever sees a veil, the camera settles straight on the isle (#457)",
    atLandfall(reduced10) && !sawVeil10,
    JSON.stringify({ reduced10, sawVeil10 }),
  );

  // The veil at a REAL narrow viewport (skeptic finding 7 on PR #467): full coverage, no sideways scroll under it, and the narrow landfall after a real-key skip.
  await setMobileViewport(390, 844);
  await evaluate(`sessionStorage.clear()`);
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let narrow12 = null;
  for (let i = 0; i < 100; i++) {
    try {
      narrow12 = await evaluate(`(() => {
        const v = document.getElementById("lf-veil");
        if (!v) return null;
        const r = v.getBoundingClientRect();
        const corners = [[1, 1], [389, 1], [1, 843], [389, 843], [195, 422]]
          .every(([x, y]) => { const el = document.elementFromPoint(x, y); return el !== null && v.contains(el); });
        return { w: r.width, h: r.height, x: r.x, y: r.y, corners,
          innerWidth: window.innerWidth, scrollW: document.documentElement.scrollWidth };
      })()`);
      if (narrow12 !== null) break;
    } catch {}
    await sleep(60);
  }
  check(
    "H12a at 390px the veil covers the whole viewport, corners included, and nothing scrolls sideways beneath it",
    narrow12 !== null && narrow12.corners && narrow12.x === 0 && narrow12.y === 0
      && Math.abs(narrow12.w - 390) < 0.5 && Math.abs(narrow12.h - 844) < 0.5
      && narrow12.innerWidth === 390 && narrow12.scrollW === 390,
    JSON.stringify(narrow12),
  );
  await shoot("home-veil-390.png");
  let armed12 = null;
  for (let i = 0; i < 150; i++) {
    try { armed12 = await evaluate(readCam); } catch {}
    if (anchored(armed12)) break;
    await sleep(60);
  }
  await pressKey("Escape", "Escape", 27);
  let narrowLand = null;
  for (let i = 0; i < 40; i++) {
    try { narrowLand = await evaluate(readCam); } catch {}
    if (atLandfall(narrowLand)) break;
    await sleep(60);
  }
  check(
    "H12b the narrow skip lands at the narrow landfall framing (1.6 of fit under a 900px viewport)",
    anchored(armed12) && atLandfall(narrowLand) && narrowLand.expected < narrowLand.fit * 1.65,
    JSON.stringify({ armed12, narrowLand }),
  );
  // #505: the camera's seat is home's own (ruled 2026-09-02), read against the stage at 390 here and at the wide sheet after the viewport clears.
  const camSeat = () => evaluate(`(() => { const c = document.getElementById("lf-controls"); const s = document.getElementById("lf-stage"); if (!c || !s || !c.classList.contains("on")) return null; const r = c.getBoundingClientRect(), sr = s.getBoundingClientRect(); const cs = getComputedStyle(c); return { pos: cs.position, z: cs.zIndex, right: sr.right - r.right, bottom: sr.bottom - r.bottom, pe: cs.pointerEvents, anim: cs.animationName, top: r.top, vw: innerWidth }; })()`);
  const seatOk = (s) => !!s && s.pos === "absolute" && s.z === "auto" && s.anim === "none" && s.pe === "auto" && Math.abs(s.right - 25.6) < 0.6 && Math.abs(s.bottom - 22.4) < 0.6;
  const seat390 = await camSeat();
  await clearMobile();
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let seatWide = null;
  for (let i = 0; i < 120; i++) { try { seatWide = await camSeat(); } catch {} if (seatWide) break; await sleep(50); }
  await evaluate(`window.scrollTo(0, 600)`);
  await sleep(80);
  const camScrolled = await evaluate(`(() => { const r = document.getElementById("lf-controls").getBoundingClientRect(); return { top: r.top, y: scrollY }; })()`);
  await evaluate(`window.scrollTo(0, 0)`);
  check(
    "H18 the camera's seat is home's own (#505): absolute in the stage, 1.6rem from its right edge and 1.4rem up at the wide sheet and at 390, no depth, no ink-in, the container taking the pointer, and it scrolls away with the stage",
    seatOk(seatWide) && seatOk(seat390) && seatWide.vw >= 1024 && seat390.vw === 390 && !!camScrolled && camScrolled.y > 0 && Math.abs((seatWide.top - camScrolled.top) - camScrolled.y) < 2,
    JSON.stringify({ seatWide, seat390, camScrolled }),
  );

  const errDelta2 = consoleErrors.slice(errBase2).filter((e) => !e.includes("AbortError: Transition was skipped"));
  const httpDelta2 = http4xx.slice(httpBase2).filter((u) => !/favicon/i.test(u));
  check(
    "H11 the ceremony flow is clean (no console errors, no new 4xx)",
    errDelta2.length === 0 && httpDelta2.length === 0,
    [...errDelta2, ...httpDelta2].join(" | ") || "clean",
  );

  // H13 runs AFTER the clean check on purpose: blocking the bundle logs an expected load error. It proves the pre-paint story (#457, the incognito flash): the inline script dresses first paint without the module, and an unadopted veil releases itself rather than trapping the page.
  await send("Network.setBlockedURLs", { urls: ["*app.bundle.js*"] });
  await evaluate(`sessionStorage.clear()`);
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let preModule = null;
  for (let i = 0; i < 100; i++) {
    try {
      preModule = await evaluate(`(() => {
        const v = document.getElementById("lf-veil");
        if (!v) return null;
        return { veil: true, adopted: v.dataset.adopted !== undefined, seedForm: !!document.getElementById("seed-form"),
          doorsYet: getComputedStyle(document.getElementById("lf-card-explorer")).visibility === "visible" };
      })()`);
      if (preModule !== null && preModule.seedForm) break;
    } catch {}
    await sleep(60);
  }
  check(
    "H13a with the bundle unreachable the pre-paint veil still stands, unadopted, over an intact page, the doors not yet shown",
    preModule !== null && preModule.seedForm && !preModule.adopted && preModule.doorsYet === false,
    JSON.stringify(preModule),
  );
  let released = null;
  for (let i = 0; i < 200; i++) {
    try { released = await evaluate(`({ veil: !!document.getElementById("lf-veil"), seedForm: !!document.getElementById("seed-form") })`); } catch {}
    if (released !== null && !released.veil) break;
    await sleep(100);
  }
  check(
    "H13b the safety release lifts an unadopted veil: a failed bundle never traps the page",
    released !== null && !released.veil && released.seedForm,
    JSON.stringify(released),
  );
  // The doors share the veil's 10s window (#470, ratified 2026-08-24), so after H13b's release they are due at once; the poll absorbs animation-fill timing, and the bundle stays blocked until the doors are read.
  let doors = null;
  for (let i = 0; i < 80; i++) {
    try {
      doors = await evaluate(`(() => {
        const ids = ["explorer", "reading-room", "atlas", "gallery"];
        const cards = ids.map((id) => document.getElementById("lf-card-" + id));
        if (cards.some((c) => c === null)) return null;
        const shown = cards.map((c) => {
          const cs = getComputedStyle(c);
          const r = c.getBoundingClientRect();
          return cs.visibility === "visible" && cs.position === "static" && r.height > 40;
        });
        const hrefs = cards.map((c) => c.querySelector(".lf-card-enter")?.getAttribute("href") ?? null);
        const how = document.getElementById("lf-card-how");
        return { shown, hrefs,
          closesHidden: cards.every((c) => getComputedStyle(c.querySelector(".lf-card-close")).display === "none"),
          howHidden: how !== null && how.offsetParent === null,
          scrollW: document.documentElement.scrollWidth, innerWidth: window.innerWidth };
      })()`);
      if (doors !== null && doors.shown.every(Boolean)) break;
    } catch {}
    await sleep(150);
  }
  await send("Network.setBlockedURLs", { urls: [] });
  check(
    "H13c a dead bundle reveals the four slips as plain static doors: each visible in flow with its room's own door, the dead close controls hidden, the how panel and the sideways scroll unmoved",
    doors !== null && doors.shown.every(Boolean)
      && JSON.stringify(doors.hrefs) === JSON.stringify(["explorer/", "reading-room/", "atlas/", "gallery/"])
      && doors.closesHidden && doors.howHidden && doors.scrollW === doors.innerWidth,
    JSON.stringify(doors),
  );
  await shoot("home-failed-bundle-doors.png");

  // Reduced motion crosses the doors both ways (#470 skeptic round 1: motion.css's prm blanket zeroed the 10s delay, so prm visitors got the failure doors on every HEALTHY load).
  // Both halves matter: a display:none card still computes visibility:visible, and a pre-reveal card is display:block with visibility:hidden.
  const doorShown = `(() => { const c = document.getElementById("lf-card-explorer"); return c !== null && c.offsetParent !== null && getComputedStyle(c).visibility === "visible"; })()`;
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await send("Network.setBlockedURLs", { urls: ["*app.bundle.js*"] });
  await evaluate(`sessionStorage.clear()`);
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let prmDoors = false;
  for (let i = 0; i < 90; i++) {
    try { prmDoors = await evaluate(doorShown); } catch {}
    if (prmDoors === true) break;
    await sleep(150);
  }
  await send("Network.setBlockedURLs", { urls: [] });
  check(
    "H13d reduced motion keeps its doors on a dead bundle: the reveal is a timer, not motion the prm blanket may still",
    prmDoors === true,
    `doors shown=${prmDoors}`,
  );
  // Mark the H13d page before leaving: without the marker the first samples race the navigation and read the OLD page's legitimately visible doors as a flash.
  await evaluate(`window.__h13d = 1`);
  // Throttle so the pre-.cam window is seconds wide: on an unthrottled localhost the module boots within a frame and a 75ms sampler proves nothing about a flash (skeptic round 3).
  await send("Network.emulateNetworkConditions", { offline: false, latency: 200, downloadThroughput: 120000, uploadThroughput: 120000 });
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let prmFlash = false;
  let prmCam = false;
  let fresh = false;
  let afterCam = 0;
  for (let i = 0; i < 120; i++) {
    try {
      const s = await evaluate(`({ old: window.__h13d === 1, ready: !!document.getElementById("seed-form"), door: ${doorShown}, cam: !!document.querySelector("#lf-stage.cam") })`);
      if (fresh) {
        if (s.door) prmFlash = true;
        if (s.cam) prmCam = true;
      } else {
        fresh = !s.old && s.ready;
      }
    } catch {}
    if (prmCam && ++afterCam > 4) break;
    await sleep(75);
  }
  await send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  check(
    "H13e and never shows them on a healthy THROTTLED load: the pre-.cam window is seconds wide and no prm sample ever sees a door before the bundle provably boots",
    prmCam && !prmFlash,
    JSON.stringify({ prmCam, prmFlash }),
  );

  // The round-2 blocker's live proof: script execution OFF plus reduced motion is the one visitor class where the noscript stand-down must out-cascade the prm exemption (both !important, specificity tied, document order decides).
  await send("Emulation.setScriptExecutionDisabled", { value: true });
  let nojs = null;
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  for (let i = 0; i < 90; i++) {
    try {
      nojs = await evaluate(`(() => {
        const nav = document.querySelector(".lf-noscript-rooms");
        const how = document.getElementById("lf-card-how");
        if (nav === null || how === null) return null;
        return { navShown: nav.offsetParent !== null, howShown: how.offsetParent !== null && getComputedStyle(how).visibility === "visible", door: ${doorShown} };
      })()`);
    } catch {}
    if (nojs !== null && nojs.door) break;
    await sleep(150);
  }
  await send("Emulation.setScriptExecutionDisabled", { value: false });
  await send("Emulation.setEmulatedMedia", { features: [] });
  check(
    "H13f script-off plus reduced motion keeps the noscript doors alone past the 10s mark: the plain nav and the how prose stand, and no slip ever doubles them",
    nojs !== null && nojs.navShown && nojs.howShown && !nojs.door,
    JSON.stringify(nojs),
  );

  // Stations, cards, and the drift (#458) at the ratified 1280x800 (the harness's tall default hides the short-viewport collisions the plate-reader measured). Every gesture is REAL dispatched input (#460): pointer capture retargets clicks, so synthetic .click() proves nothing here.
  const errBase3 = consoleErrors.length;
  const httpBase3 = http4xx.length;
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  const settled14 = await settleHome();
  const atlasPt = await evaluate(buttonPoint('.lf-station[data-station="atlas"]'));
  if (atlasPt !== null) await clickAt(Math.round(atlasPt.x), Math.round(atlasPt.y));
  let visited = null;
  for (let i = 0; i < 80; i++) {
    try {
      visited = await evaluate(`(() => {
        const stage = document.getElementById("lf-stage");
        const sheet = document.getElementById("lf-sheet");
        const btn = document.querySelector('.lf-station[data-station="atlas"]');
        const card = document.getElementById("lf-card-atlas");
        if (!stage || !sheet || !btn || !card) return null;
        const r = stage.getBoundingClientRect();
        const fit = Math.min(r.width / 1500, r.height / 1157.931) * 0.92;
        const m = new DOMMatrixReadOnly(getComputedStyle(sheet).transform);
        const cs = getComputedStyle(card);
        const anchorX = Number(btn.dataset.nx) * 1500 * m.a + m.e;
        const anchorY = Number(btn.dataset.ny) * 1157.931 * m.a + m.f;
        const cr = card.getBoundingClientRect();
        const reach = (el) => {
          if (!el) return false;
          const b = el.getBoundingClientRect();
          const hit = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
          return hit !== null && (hit === el || el.contains(hit));
        };
        const anchorVX = r.left + anchorX, anchorVY = r.top + anchorY;
        return {
          scale: m.a, fit,
          anchorX, anchorY, stageW: r.width, stageH: r.height,
          open: !card.hidden && cs.visibility !== "hidden" && Number(cs.opacity) > 0.95,
          contained: cr.top >= r.top - 0.5 && cr.bottom <= r.bottom + 0.5 && cr.left >= r.left - 0.5 && cr.right <= r.right + 0.5,
          anchorClear: !(anchorVX >= cr.left && anchorVX <= cr.right && anchorVY >= cr.top && anchorVY <= cr.bottom),
          enterReach: reach(card.querySelector(".lf-card-enter")), closeReach: reach(card.querySelector(".lf-card-close")),
          controlsReach: reach(document.getElementById("zoom-in")) && reach(document.getElementById("zoom-out")),
          title: card.querySelector(".lf-card-title")?.textContent ?? null,
          enter: card.querySelector(".lf-card-enter")?.getAttribute("href") ?? null,
          arms: card.querySelectorAll(".lf-card-arms img").length,
        };
      })()`);
      if (visited !== null && visited.open && Math.abs(visited.scale - visited.fit * 2.6) < 1e-3) break;
    } catch {}
    await sleep(75);
  }
  check(
    "H14a a real click on the Atlas station flies the camera to 2.6 of fit, the anchor at 0.4 of the stage clear of the slip, the slip whole inside the stage with its enter, close, and the zoom controls all under the hand, arms aboard",
    visited !== null && visited.open && Math.abs(visited.scale - visited.fit * 2.6) < 1e-3
      && Math.abs(visited.anchorX - visited.stageW * 0.4) < 2 && Math.abs(visited.anchorY - visited.stageH / 2) < 2
      && visited.contained && visited.anchorClear && visited.enterReach && visited.closeReach && visited.controlsReach
      && visited.title === "The Atlas of Rahai" && visited.enter === "atlas/" && visited.arms === 3,
    JSON.stringify({ settled14: !!settled14, atlasPt, visited }),
  );
  await shoot("home-station-card.png");

  await pressKey("Escape", "Escape", 27);
  let closed14 = null;
  for (let i = 0; i < 30; i++) {
    try { closed14 = await evaluate(`document.getElementById("lf-card-atlas").hidden`); } catch {}
    if (closed14 === true) break;
    await sleep(75);
  }
  check("H14b a real Escape sets the slip aside", closed14 === true, `hidden=${closed14}`);

  // The house button lift must never reach a station (its anchor transform IS its position and counter-scale): a real hover once shifted the pip 17px and shrank it to the raw camera scale.
  const pipBox = `(() => {
    const btn = document.querySelector('.lf-station[data-station="atlas"]');
    const b = btn.getBoundingClientRect();
    const g = btn.querySelector(".lf-station-glyph").getBoundingClientRect();
    return { cx: b.x + b.width / 2, cy: b.y + b.height / 2, w: b.width, glyphW: g.width,
      btnBg: getComputedStyle(btn).backgroundColor };
  })()`;
  // A real 0 flies the camera home first so the pip sits at a deterministic on-screen spot: one CI lane caught the camera slid to its left clamp edge here (x-only, cause unrecorded), and a hover dispatched at an off-viewport pip proves nothing. The Escape above also refocused its opener, so the hover claim needs a bare rest state.
  await evaluate(`document.getElementById("lf-stage").focus()`);
  await pressKey("0", "Digit0", 48);
  await sleep(1700);
  await evaluate(`document.activeElement instanceof HTMLElement && document.activeElement.blur()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 20, y: 20, button: "none" });
  await sleep(450);
  const pipRest = await evaluate(pipBox);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: Math.round(pipRest.cx), y: Math.round(pipRest.cy), button: "none" });
  await sleep(450);
  const pipHover = await evaluate(pipBox);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 20, y: 20, button: "none" });
  await sleep(450);
  check(
    "H14d a real hover keeps the pip on its anchor at its size, its button square unpainted, while the glyph grows the mockup's quarter",
    pipRest !== null && pipHover !== null
      && Math.abs(pipHover.cx - pipRest.cx) < 0.5 && Math.abs(pipHover.cy - pipRest.cy) < 0.5
      && Math.abs(pipHover.w - pipRest.w) < 0.5 && Math.abs(pipRest.w - 34) < 0.5
      && Math.abs(pipHover.glyphW / pipRest.glyphW - 1.25) < 0.02
      && pipHover.btnBg === "rgba(0, 0, 0, 0)",
    JSON.stringify({ pipRest, pipHover }),
  );

  const legendPt = await evaluate(buttonPoint('.lf-legend-btn[data-station="reading-room"]'));
  if (legendPt !== null) await clickAt(Math.round(legendPt.x), Math.round(legendPt.y));
  let legendCard = null;
  for (let i = 0; i < 80; i++) {
    try {
      legendCard = await evaluate(`(() => {
        const card = document.getElementById("lf-card-reading-room");
        if (!card) return null;
        const cs = getComputedStyle(card);
        return { open: !card.hidden && cs.visibility !== "hidden" && Number(cs.opacity) > 0.95,
          title: card.querySelector(".lf-card-title")?.textContent ?? null };
      })()`);
      if (legendCard !== null && legendCard.open) break;
    } catch {}
    await sleep(75);
  }
  check(
    "H14c the legend strip is a real alternative: a real click on its Reading Room entry unfurls that slip",
    legendCard !== null && legendCard.open && legendCard.title === "The Reading Room",
    JSON.stringify({ legendPt, legendCard }),
  );
  await pressKey("Escape", "Escape", 27);
  await sleep(500);

  await sleep(9600);
  const drift1 = await evaluate(readXform);
  await sleep(900);
  const drift2 = await evaluate(readXform);
  const clampHeld = await evaluate(`(() => {
    const stage = document.getElementById("lf-stage");
    const sheet = document.getElementById("lf-sheet");
    const r = stage.getBoundingClientRect();
    const fit = Math.min(r.width / 1500, r.height / 1157.931) * 0.92;
    const m = new DOMMatrixReadOnly(getComputedStyle(sheet).transform);
    const cx = m.e + (1500 * m.a) / 2, cy = m.f + (1157.931 * m.a) / 2;
    return m.a >= fit * 0.65 - 1e-6 && m.a <= 7 + 1e-6 && cx >= -1 && cx <= r.width + 1 && cy >= -1 && cy <= r.height + 1;
  })()`);
  check(
    "H15a left alone after landfall the sheet breathes: the transform moves between two samples nine-plus seconds in, and the clamp still holds",
    drift1 !== null && drift2 !== null && drift1 !== drift2 && clampHeld === true,
    JSON.stringify({ drift1, drift2, clampHeld }),
  );

  const stagePt = await evaluate(`(() => { const r = document.getElementById("lf-stage").getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
  await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: Math.round(stagePt.x), y: Math.round(stagePt.y), deltaX: 0, deltaY: -120 });
  await sleep(400);
  const still1 = await evaluate(readXform);
  await sleep(900);
  const still2 = await evaluate(readXform);
  await sleep(900);
  const still3 = await evaluate(readXform);
  check(
    "H15b a real wheel stops the drift at once: the zoom lands and the transform holds still through three samples",
    still1 !== null && still1 === still2 && still2 === still3,
    JSON.stringify({ still1, still2, still3 }),
  );

  await sleep(9600);
  const rearm1 = await evaluate(readXform);
  await sleep(900);
  const rearm2 = await evaluate(readXform);
  check(
    "H15c the stop re-armed the idle timer: nine-plus still seconds later the sheet breathes again",
    rearm1 !== null && rearm2 !== null && rearm1 !== rearm2,
    JSON.stringify({ rearm1, rearm2 }),
  );

  // The Reading Room station, not the Explorer: H14c framed it at 0.4 of the stage and the wheel zoomed at center, so it is the one icon this history provably keeps inside the 800-tall stage clip.
  const flightPt = await evaluate(buttonPoint('.lf-station[data-station="reading-room"]'));
  if (flightPt !== null) await clickAt(Math.round(flightPt.x), Math.round(flightPt.y));
  await sleep(2200);
  const flight1 = await evaluate(readXform);
  await sleep(900);
  const flight2 = await evaluate(readXform);
  check(
    "H15d this sub's own station flight stops the drift too: after the flight settles the transform holds still",
    flightPt !== null && flight1 !== null && flight1 === flight2,
    JSON.stringify({ flightPt, flight1, flight2 }),
  );
  await pressKey("Escape", "Escape", 27);

  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const settled16 = await settleHome();
  await sleep(9800);
  const calm1 = await evaluate(readXform);
  await sleep(900);
  const calm2 = await evaluate(readXform);
  await send("Emulation.setEmulatedMedia", { features: [] });
  check(
    "H16 reduced motion gets no drift at all: nine-plus seconds of stillness stay still",
    atLandfall(settled16) && calm1 !== null && calm1 === calm2,
    JSON.stringify({ calm1, calm2 }),
  );

  await setMobileViewport(390, 844);
  const settled16b = await settleHome();
  // The legend stands down under 900px (#461 phone doors), so the narrow entry is the station pip itself, the same door desktop flights use.
  const sheetPt = await evaluate(buttonPoint('.lf-station[data-station="atlas"]'));
  if (sheetPt !== null) await clickAt(Math.round(sheetPt.x), Math.round(sheetPt.y));
  let opened16 = false;
  for (let i = 0; i < 80; i++) {
    try {
      opened16 = await evaluate(`(() => {
        const card = document.getElementById("lf-card-atlas");
        if (!card || card.hidden) return false;
        const cs = getComputedStyle(card);
        return cs.visibility !== "hidden" && Number(cs.opacity) > 0.95;
      })()`);
    } catch {}
    if (opened16 === true) break;
    await sleep(75);
  }
  // The open tween ends on rotate 0 / y 0; a mid-tween rect leans past the viewport edge by design, so the geometry is read after it settles.
  await sleep(700);
  let sheet16 = null;
  try {
    sheet16 = await evaluate(`(() => {
      const stage = document.getElementById("lf-stage");
      const sheet = document.getElementById("lf-sheet");
      const btn = document.querySelector('.lf-station[data-station="atlas"]');
      const card = document.getElementById("lf-card-atlas");
      if (!stage || !sheet || !btn || !card) return null;
      const cs = getComputedStyle(card);
      const cr = card.getBoundingClientRect();
      const sr = stage.getBoundingClientRect();
      const m = new DOMMatrixReadOnly(getComputedStyle(sheet).transform);
      const anchorVX = sr.left + Number(btn.dataset.nx) * 1500 * m.a + m.e;
      const anchorVY = sr.top + Number(btn.dataset.ny) * 1157.931 * m.a + m.f;
      const close = card.querySelector(".lf-card-close");
      const cb = close.getBoundingClientRect();
      const hit = document.elementFromPoint(cb.x + cb.width / 2, cb.y + cb.height / 2);
      const slip = getComputedStyle(btn.querySelector(".lf-station-slip"));
      return {
        open: !card.hidden && cs.visibility !== "hidden" && Number(cs.opacity) > 0.95,
        slipUp: slip.display !== "none",
        inViewport: cr.left >= -0.5 && cr.right <= 390.5 && cr.top >= -0.5 && cr.bottom <= 844.5,
        cardRect: [cr.left, cr.top, cr.right, cr.bottom].map((v) => Math.round(v * 10) / 10),
        anchorClear: !(anchorVX >= cr.left && anchorVX <= cr.right && anchorVY >= cr.top && anchorVY <= cr.bottom),
        closeReach: hit !== null && (hit === close || close.contains(hit)),
        scrollW: document.documentElement.scrollWidth,
      };
    })()`);
  } catch {}
  check(
    "H16b at 390 the slip lies as a bottom sheet fixed whole within the viewport, every edge, the flown-to anchor clear above it, its close reachable, the station name tags STANDING (the boxed-era stand-down retired with the full bleed, #461), nothing scrolling sideways",
    sheet16 !== null && sheet16.open && sheet16.slipUp && sheet16.inViewport && sheet16.anchorClear && sheet16.closeReach && sheet16.scrollW === 390,
    JSON.stringify({ settled16b: !!settled16b, sheetPt, sheet16 }),
  );
  await shoot("home-station-card-390.png");
  await pressKey("Escape", "Escape", 27);
  // The card must be fully CLOSED before the hit-tests below, or a mid-close sheet intercepts them on a slow CI runner (the poll-break class): poll hidden, never a timed sleep.
  for (let i = 0; i < 80; i++) {
    let anyOpen = true;
    try { anyOpen = await evaluate(`[...document.querySelectorAll(".lf-card")].some((c) => !c.hidden)`); } catch {}
    if (anyOpen === false) break;
    await sleep(75);
  }
  // Round-3 plate finding: the unconditional .landfall .stage.cam .lf-legend show-rule (0,4,0) beat the media-scoped hide (0,1,0), so scripts-on phones kept the legend AND it sat on two of the three camera buttons. Resolved computed styles only, the #288 lesson.
  let doors16c = null;
  try {
    doors16c = await evaluate(`(() => {
      const legend = document.querySelector(".lf-legend");
      const cam = !!document.querySelector(".stage.cam");
      const hits = [...document.querySelectorAll("#lf-controls button")].map((b) => {
        const r = b.getBoundingClientRect();
        const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return hit === b || b.contains(hit);
      });
      return { cam, legendDisplay: legend ? getComputedStyle(legend).display : null, hits };
    })()`);
  } catch {}
  check(
    "H16c at 390 with the camera armed the legend stands down and every camera button answers its own tap (#461 phone doors, the specificity flip the round-3 plate caught)",
    doors16c !== null && doors16c.cam && doors16c.legendDisplay === "none" &&
      doors16c.hits.length > 0 && doors16c.hits.every(Boolean),
    JSON.stringify({ doors16c }),
  );
  await clearMobile();

  const errDelta3 = consoleErrors.slice(errBase3).filter((e) => !e.includes("AbortError: Transition was skipped"));
  const httpDelta3 = http4xx.slice(httpBase3).filter((u) => !/favicon/i.test(u));
  check(
    "H17 the station and drift flow is clean (no console errors, no new 4xx)",
    errDelta3.length === 0 && httpDelta3.length === 0,
    [...errDelta3, ...httpDelta3].join(" | ") || "clean",
  );
}
