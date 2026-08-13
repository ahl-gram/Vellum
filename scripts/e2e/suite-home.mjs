// Cartouche hero e2e (H0-H6, #289): the homepage frame at desktop and a real 390px viewport, the hook, and the seed form's real promise (the chart number in the baked cartouche IS the seed, so the drawn SVG identifies its world); self-contained with scoped deltas.
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
}
