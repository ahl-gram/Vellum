// Cartouche hero e2e (H0-H6, #289) plus the ceremony (H7-H12, #457): the homepage frame at desktop and a real 390px viewport, the hook, the seed form's real promise (the chart number in the baked cartouche IS the seed, so the drawn SVG identifies its world), and the veil's arrival, skips in both phases, sitting memory, reduced-motion and narrow-viewport stories; self-contained with scoped deltas.
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, setMobileViewport, clearMobile, consoleErrors, http4xx, PORT } = ctx;

  const pressKey = async (key, code, vk) => {
    await send("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: vk });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: vk });
  };
  // The camera's state measured against the same stage box and constants it uses; the landfall breakpoint reads the VIEWPORT, as the mockup's v.w < 900 does (skeptic finding 1 on PR #467: the stage box is narrower than the viewport, so keying on it fired the narrow framing up to 947px).
  const readCam = `(() => {
    const stage = document.getElementById("lf-stage");
    const sheet = document.getElementById("lf-sheet");
    if (!stage || !sheet) return null;
    const r = stage.getBoundingClientRect();
    const fit = Math.min(r.width / 1500, r.height / 1157.931) * 0.92;
    const m = new DOMMatrixReadOnly(getComputedStyle(sheet).transform);
    const v = document.getElementById("lf-veil");
    return { veil: !!v, lifting: !!v && v.classList.contains("lifting"),
      status: v ? (v.querySelector(".veil-status")?.textContent ?? null) : null,
      scale: m.a, fit, expected: fit * (window.innerWidth < 900 ? 1.6 : 1.72) };
  })()`;
  const atLandfall = (s) => !!s && !s.veil && Math.abs(s.scale - s.expected) < 1e-3;

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

  // First arrival raises the veil (H7 proves it); settle it with a REAL key so H1-H5 and their plates measure the page. Synthetic .click() dispatches no pointerdown and would leave the veil standing.
  if (ready) {
    await pressKey("Escape", "Escape", 27);
    for (let i = 0; i < 40; i++) {
      let up = true;
      try { up = await evaluate(`!!document.getElementById("lf-veil")`); } catch {}
      if (!up) break;
      await sleep(50);
    }
  }

  const frame = ready ? await evaluate(`(() => {
    const c = document.querySelector(".cartouche");
    if (!c) return null;
    const cs = getComputedStyle(c);
    const fl = [...c.querySelectorAll(".flourish")].map((f) => { const b = f.getBoundingClientRect(); return [b.width, b.height]; });
    return { border: cs.borderTopWidth, bg: cs.backgroundColor, radius: cs.borderTopLeftRadius, flourishes: fl };
  })()`) : null;
  const flourishesShown = (fl, min) =>
    !!fl && fl.length === 4 && fl.every(([w, h]) => w > min && Math.abs(w - fl[0][0]) < 0.01 && Math.abs(h - w) < 0.01);
  // Compared NUMERICALLY: Chromium serializes rgb(from var(...) r g b / a) as color(srgb ...) rather than rgba(), so the channels, not the spelling, are under test (#324).
  const chartPaper = (bg) => {
    if (!bg) return false;
    let m = bg.match(/^rgba\((\d+), (\d+), (\d+), ([0-9.]+)\)$/);
    if (m) return +m[1] === 242 && +m[2] === 232 && +m[3] === 207 && Math.abs(+m[4] - 0.94) < 0.005;
    m = bg.match(/^color\(srgb ([0-9.]+) ([0-9.]+) ([0-9.]+) \/ ([0-9.]+)\)$/);
    return !!m && Math.round(m[1] * 255) === 242 && Math.round(m[2] * 255) === 232
      && Math.round(m[3] * 255) === 207 && Math.abs(+m[4] - 0.94) < 0.005;
  };
  check(
    "H1 the cartouche frame holds the chart's geometry (border 2.2k, chart paper, four visible equal flourishes)",
    !!frame && Math.abs(parseFloat(frame.border) - 3.3) < 0.35 && chartPaper(frame.bg) && flourishesShown(frame.flourishes, 15),
    JSON.stringify(frame),
  );

  const hero = ready ? await evaluate(`(() => {
    const hook = document.querySelector(".cartouche .hook");
    const input = document.getElementById("seed-input");
    const line = document.querySelector(".cartouche-seedline");
    return { hook: hook ? hook.innerText : null, seed: input ? input.value : null,
      lineStyle: line ? getComputedStyle(line).fontStyle : null };
  })()`) : null;
  check(
    "H2 the hook reads as ratified, the seed input is prefilled 42, the seedline is italic",
    !!hero && /Give Vellum a number\./.test(hero.hook) && /It gives you back a world\./.test(hero.hook) && hero.seed === "42" && hero.lineStyle === "italic",
    JSON.stringify(hero),
  );
  await shoot("home-cartouche.png");

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
    const fl = [...document.querySelectorAll(".cartouche .flourish")].map((f) => { const b = f.getBoundingClientRect(); return [b.width, b.height]; });
    return { innerWidth: window.innerWidth, scrollW: document.documentElement.scrollWidth, flourishes: fl };
  })()`) : null;
  check(
    "H3 at 390px the flourishes stay (D6) and nothing scrolls sideways",
    !!mobile && mobile.innerWidth === 390 && mobile.scrollW === 390 && flourishesShown(mobile.flourishes, 10),
    JSON.stringify(mobile),
  );
  await shoot("home-cartouche-390.png");
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

  // H8's teeth: before the key the camera provably sits at the wide anchorage (0.78 of fit), so the jump to the landfall scale can only come from the skip's land(0).
  await evaluate(`sessionStorage.clear()`);
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let before8 = null;
  for (let i = 0; i < 100; i++) {
    try { before8 = await evaluate(readCam); } catch {}
    if (before8 !== null && before8.veil) break;
    await sleep(60);
  }
  const anchored8 = before8 !== null && before8.veil && Math.abs(before8.scale - before8.fit * 0.78) < 1e-3;
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

  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let ready9 = false;
  for (let i = 0; i < 100; i++) {
    let ok = null;
    try { ok = await evaluate(`document.readyState === "complete" && !!document.getElementById("seed-form")`); } catch {}
    if (ok) { ready9 = true; break; }
    await sleep(75);
  }
  await sleep(250);
  let returning = null;
  try { returning = await evaluate(readCam); } catch {}
  check(
    "H9 within a sitting the ceremony stands down: no veil, the camera opens settled on the isle",
    ready9 && atLandfall(returning),
    JSON.stringify(returning),
  );

  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await evaluate(`sessionStorage.clear()`);
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let ready10 = false;
  for (let i = 0; i < 100; i++) {
    let ok = null;
    try { ok = await evaluate(`document.readyState === "complete" && !!document.getElementById("seed-form")`); } catch {}
    if (ok) { ready10 = true; break; }
    await sleep(75);
  }
  await sleep(250);
  let reduced10 = null;
  try { reduced10 = await evaluate(readCam); } catch {}
  await send("Emulation.setEmulatedMedia", { features: [] });
  check(
    "H10 reduced motion asks for no ceremony at all: no veil, instant settled landfall (#457)",
    ready10 && atLandfall(reduced10),
    JSON.stringify(reduced10),
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
  await pressKey("Escape", "Escape", 27);
  await sleep(120);
  let narrowLand = null;
  try { narrowLand = await evaluate(readCam); } catch {}
  check(
    "H12b the narrow skip lands at the narrow landfall framing (1.6 of fit under a 900px viewport)",
    atLandfall(narrowLand) && narrowLand.expected < narrowLand.fit * 1.65,
    JSON.stringify(narrowLand),
  );
  await clearMobile();

  const errDelta2 = consoleErrors.slice(errBase2).filter((e) => !e.includes("AbortError: Transition was skipped"));
  const httpDelta2 = http4xx.slice(httpBase2).filter((u) => !/favicon/i.test(u));
  check(
    "H11 the ceremony flow is clean (no console errors, no new 4xx)",
    errDelta2.length === 0 && httpDelta2.length === 0,
    [...errDelta2, ...httpDelta2].join(" | ") || "clean",
  );
}
