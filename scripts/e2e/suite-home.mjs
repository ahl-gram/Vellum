// The cartouche hero checks (H0-H6, with H5 split a/b) on the homepage
// (#289): the hand-built hybrid frame at desktop (H1) and at a real 390px
// device viewport (H3, the D6 promise), the hook and seedline dress (H2), and
// above all the seed form's REAL promise (H4): type a number, land on
// explorer/#seed=N, and watch that exact world drawn (the chart number in the
// baked cartouche IS the seed, so the drawn SVG's own text identifies the
// world; no oracle needed).
//
// Self-contained like the hunt and Print Room suites: runs after the health
// checkpoint, navigates to its own page, and carries its own scoped no-4xx +
// console-error delta.
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, setMobileViewport, clearMobile, consoleErrors, http4xx, PORT } = ctx;

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

  // H1: the frame, measured, not declared: the outer border is the chart's
  // 2.2k at the held k = 1.5, the paper is the chart-exact fill, and all four
  // corner flourishes render at equal size.
  // Zero-size rects would mean display:none flourishes, so the equal-size
  // predicate alone is not enough: require them visibly sized (14k > 15px at
  // the desktop k).
  const frame = ready ? await evaluate(`(() => {
    const c = document.querySelector(".cartouche");
    if (!c) return null;
    const cs = getComputedStyle(c);
    const fl = [...c.querySelectorAll(".flourish")].map((f) => { const b = f.getBoundingClientRect(); return [b.width, b.height]; });
    return { border: cs.borderTopWidth, bg: cs.backgroundColor, radius: cs.borderTopLeftRadius, flourishes: fl };
  })()`) : null;
  const flourishesShown = (fl, min) =>
    !!fl && fl.length === 4 && fl.every(([w, h]) => w > min && Math.abs(w - fl[0][0]) < 0.01 && Math.abs(h - w) < 0.01);
  check(
    "H1 the cartouche frame holds the chart's geometry (border 2.2k, chart paper, four visible equal flourishes)",
    !!frame && Math.abs(parseFloat(frame.border) - 3.3) < 0.35 && frame.bg === "rgba(242, 232, 207, 0.94)" && flourishesShown(frame.flourishes, 15),
    JSON.stringify(frame),
  );

  // H2: the ratified hook, both lines, the input prefilled 42, and the
  // seedline in its ratified dress (italic: Alex's explicit call).
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

  // H3: the D6 promise, on a real 390px device viewport: the flourishes stay,
  // sized by the narrow k (14 x 1.1 = 15.4px), and the sheet does not scroll
  // sideways. Reload so the page boots as a phone (harness doctrine).
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

  // H4: the real promise. Type 777, press Draw it, land on explorer/#seed=777
  // (the HASH form: the ?seed= GET fallback would prove the intercept dead),
  // and the Explorer draws world 777, identified by its own baked chart number.
  if (ready) {
    await evaluate(`(() => {
      const i = document.getElementById("seed-input");
      i.value = "777";
      document.querySelector("#seed-form button").click();
    })()`);
  }
  // The Explorer canonicalizes a bare #seed=N into its full recipe hash on
  // boot (hash-sync), so accept any hash that keeps seed=777; the intercept's
  // own form is proven by the search staying empty (a ?seed= GET would mean
  // the inline script never ran).
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

  // H5: bad input degrades gracefully, two ways. Garbage fails the input's
  // pattern, so the browser refuses the submit with its native hint and the
  // page stays put; an EMPTY input passes the pattern, reaches the intercept,
  // and falls back to the bare Explorer (today's world), never a broken hash.
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let backHome = false;
  for (let i = 0; i < 100; i++) {
    let ok = null;
    try { ok = await evaluate(`document.readyState === "complete" && !!document.getElementById("seed-form")`); } catch {}
    if (ok) { backHome = true; break; }
    await sleep(75);
  }
  // Navigation never commits inside the click's own task, so the "stayed"
  // read must come AFTER a settle, or the check is vacuous (review catch).
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
    // Guarded: if an unexpected navigation is mid-flight the eval context can
    // die here, and an uncaught throw would kill the whole harness run.
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
  // The Explorer boots today's world on a bare visit and hash-sync then puts
  // ITS seed in the hash, so the hash proves nothing here; the empty search
  // does (the no-JS GET fallback would have produced ?seed=).
  check(
    "H5b an empty seed reaches the intercept and degrades to the bare Explorer (no ?seed= GET)",
    !!degraded && degraded.startsWith("/explorer/") && !degraded.includes("?"),
    `landed at ${degraded}`,
  );

  // H6: the whole home flow added no console errors and no new 4xx. One
  // stock Chromium message is excused: "AbortError: Transition was skipped".
  // motion.css opts the whole site into cross-document view transitions
  // (@view-transition { navigation: auto }, the #130 folio turn), and when a
  // navigation lands while a prior transition is still settling the browser
  // skips it and surfaces this stock abort as an unhandled rejection. It is
  // the folio ceremony's expected cancellation, not an app error; this suite
  // is the first to chain page-to-page navigations fast enough to see it.
  const errDelta = consoleErrors
    .slice(errBase)
    .filter((e) => !e.includes("AbortError: Transition was skipped"));
  const httpDelta = http4xx.slice(httpBase).filter((u) => !/favicon/i.test(u));
  check(
    "H6 the home flow is clean (no console errors, no new 4xx)",
    errDelta.length === 0 && httpDelta.length === 0,
    [...errDelta, ...httpDelta].join(" | ") || "clean",
  );
}
