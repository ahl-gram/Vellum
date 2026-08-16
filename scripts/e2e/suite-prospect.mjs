// Prospect e2e (PB1-PB11, #242): the Explorer card's way in, the destination page, the two-dress fallback, year-awareness, and same-address byte determinism; self-contained like its sibling suites (navigates itself, carries scoped no-4xx and console-error deltas).
export async function run(ctx) {
  const { evaluate, send, check, sleep, consoleErrors, http4xx, PORT } = ctx;

  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#seed=42&style=antique&legend=1` });
  let exReady = false;
  for (let i = 0; i < 200; i++) {
    let ok = null;
    try { ok = await evaluate(`typeof window.__vellumUsesWorker==="function" && !!document.querySelector("#map svg") && document.getElementById("status").textContent===""`); } catch {}
    if (ok) { exReady = true; break; }
    await sleep(75);
  }
  let href = null;
  if (exReady) {
    await evaluate(`document.querySelector('.place-hit[data-idx="0"]').click()`);
    for (let i = 0; i < 40; i++) {
      try { href = await evaluate(`(()=>{const a=document.querySelector('#place-card .pc-prospect');return a?a.getAttribute('href'):null;})()`); } catch {}
      if (href) break;
      await sleep(50);
    }
  }
  check(
    "PB1 the pinned place card carries the way in to the prospect page",
    !!href && href.startsWith("/prospect/#") && /seed=42/.test(href) && /&i=0$/.test(href),
    String(href),
  );
  // Index 0 is the one settlement where a hard-coded index agrees with the right code, so a NONZERO card must witness the wiring too.
  let href1 = null;
  if (exReady) {
    await evaluate(`document.querySelector('.place-hit[data-idx="1"]').click()`);
    for (let i = 0; i < 40; i++) {
      try { href1 = await evaluate(`(()=>{const a=document.querySelector('#place-card .pc-prospect');return a?a.getAttribute('href'):null;})()`); } catch {}
      if (href1 && /&i=1$/.test(href1)) break;
      await sleep(50);
    }
  }
  check("PB1b a nonzero settlement's card addresses its own index", !!href1 && /&i=1$/.test(href1), String(href1));

  // Health bases AFTER the Explorer leg: its load belongs to earlier suites, this page's own requests fire below.
  const errBase = consoleErrors.length;
  const httpBase = http4xx.length;

  const page = (hash) => `http://127.0.0.1:${PORT}/prospect/${hash}`;
  // The page draws ONCE per visit, and a hash-to-hash Page.navigate on one path is a SAME-DOCUMENT navigation that never re-boots it, so every fresh address must arrive through a real cross-path hop (the Print Room precedent).
  const goto = async (hash) => {
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/faq/` });
    // Poll for the hop COMMITTING, never a fixed sleep: until the prospect DOM is gone, a poll below could read the OLD document's settled state.
    for (let i = 0; i < 100; i++) {
      let away = null;
      try { away = await evaluate(`!document.getElementById("pp-plate")`); } catch {}
      if (away) break;
      await sleep(50);
    }
    await send("Page.navigate", { url: page(hash) });
  };
  const opened = async (label) => {
    for (let i = 0; i < 200; i++) {
      let s = null;
      try {
        s = await evaluate(`(()=>{const st=window.__vellumProspectState&&window.__vellumProspectState();const img=document.getElementById("pp-plate");return st?{seed:st.seed,index:st.index,year:st.year,presentYear:st.presentYear,name:st.name,dress:st.dress,blob:!!(img&&img.src&&img.src.startsWith("blob:")),shown:!!img&&!img.hidden,status:document.getElementById("pp-status").textContent,caption:document.getElementById("pp-caption").textContent,chart:document.getElementById("pp-chart-link").getAttribute("href")}:null;})()`);
      } catch {}
      if (s && s.blob && s.status === "") return s;
      await sleep(75);
    }
    throw new Error("prospect page never drew: " + label);
  };
  const svgOf = () => evaluate(`fetch(document.getElementById("pp-plate").src).then(r=>r.text())`, true);

  await send("Page.navigate", { url: page(href && href.includes("#") ? href.slice(href.indexOf("#")) : "#seed=42&i=0") });
  const cap = await opened("the card's own link");
  check(
    "PB2 the card's link opens the capital's plate (seed 42 == Laukuwelua)",
    cap.seed === 42 && cap.index === 0 && cap.name === "Laukuwelua" && cap.shown,
    JSON.stringify({ seed: cap.seed, index: cap.index, name: cap.name }),
  );
  check("PB3 the caption names the place and its world", /Laukuwelua/.test(cap.caption) && /The Isle of Rahai/.test(cap.caption), cap.caption);
  check("PB3b the caption names what the place was once called (#49)", /once called Haitani/.test(cap.caption), cap.caption);
  check("PB4 the render worker serves the page (no silent inline fallback)", await evaluate(`window.__vellumProspectUsesWorker() === true`));

  const first = await svgOf();
  check(
    "PB5 the plate is the engine's own engraving of this settlement",
    typeof first === "string" && first.includes('aria-label="The prospect of Laukuwelua, chart 42"'),
    String(first).slice(0, 100),
  );

  await goto("#seed=42&i=0");
  await opened("the same address, fresh visit");
  const second = await svgOf();
  check("PB6 the same address presses a byte-identical plate", first === second, `first ${String(first).length}b, second ${String(second).length}b`);

  await goto("#seed=42&i=1");
  await opened("the standing town");
  const standing = await svgOf();
  await goto("#seed=42&i=1&year=300");
  const early = await opened("the year 300");
  const ground = await svgOf();
  check(
    "PB7 the year is a chronicle filter: the standing town at the present, the bare ground before its founding",
    /THE PROSPECT OF PAUKILUA/.test(standing) && !/will rise/.test(standing) && /will rise/.test(ground) && early.year === 300,
    JSON.stringify({ year: early.year, presentYear: early.presentYear }),
  );
  check(
    "PB7b a viewed year reads in the caption, and the Explorer link sheds the page's own keys",
    /viewed in the year 300/.test(early.caption) && early.chart === "/explorer/#seed=42",
    JSON.stringify({ caption: early.caption, chart: early.chart }),
  );

  await goto("#seed=42&style=nautical&i=0");
  const dropped = await opened("the nautical fallback");
  const nauticalSvg = await svgOf();
  await goto("#seed=42&style=ink&i=0");
  const inked = await opened("the ink dress");
  const inkSvg = await svgOf();
  check(
    "PB8 the two-dress fallback holds: a nautical chart opens an antique plate, an ink chart an ink plate (#237)",
    // The dress rides the plate's own id suffix (`${style.name}-${seed}-${index}`), so the BYTES witness it, not just the state hook.
    dropped.dress === "antique" && /-antique-42-0/.test(nauticalSvg) && inked.dress === "ink" && /-ink-42-0/.test(inkSvg),
    JSON.stringify({ nautical: dropped.dress, ink: inked.dress }),
  );

  await goto("");
  const bare = await opened("the bare visit");
  check("PB9 a bare visit opens today's capital prospect", bare.blob && bare.name.length > 0, JSON.stringify({ name: bare.name, seed: bare.seed }));

  check("PB10 no console errors across the prospect checks", consoleErrors.length === errBase, consoleErrors.slice(errBase).join(" | "));
  check("PB11 no HTTP 4xx across the prospect checks", http4xx.length === httpBase, http4xx.slice(httpBase).join(" | "));
}
