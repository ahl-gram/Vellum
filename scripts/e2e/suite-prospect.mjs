// Prospect e2e (the PB checks, #242; the chart room since #463 part 4/4): the Explorer card's way in, the room's plate on the fitted sheet, the engraver's note on the slip, the year control engraving in place and writing the address, the roads out, the two-dress fallback, year-awareness, and same-address byte determinism; self-contained like its sibling suites (navigates itself, carries scoped no-4xx and console-error deltas).
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
  // The page reads its address ONCE at boot (the year control re-engraves the same place), and a hash-to-hash Page.navigate on one path is a SAME-DOCUMENT navigation that never re-boots it, so every fresh address must arrive through a real cross-path hop (the Print Room precedent).
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
  const STATE = `(()=>{const st=window.__vellumProspectState&&window.__vellumProspectState();const img=document.getElementById("pp-plate");if(!st)return null;const q=(sel)=>{const el=document.querySelector(sel);return el?el.textContent:null;};const a=(id)=>document.getElementById(id).getAttribute("href");return{seed:st.seed,index:st.index,year:st.year,presentYear:st.presentYear,name:st.name,dress:st.dress,era:st.era,keyRows:st.keyRows,roads:st.roads,svgLength:st.svgLength,blob:!!(img&&img.src&&img.src.startsWith("blob:")),shown:!!img&&!img.hidden,status:q("#pp-status"),title:q("#folio-title"),sub:q("#folio-sub"),pressed:q("#pp-pressed"),chart:a("pp-chart-link"),ribbon:a("pp-ribbon-link"),ribbonVerb:q("#pp-ribbon-verb"),ribbonShown:getComputedStyle(document.getElementById("pp-ribbon-link")).display!=="none",yearField:document.getElementById("pp-year").value,eraLine:q("#pp-era"),noteTitle:q("#note-title"),where:q("#note .card-where"),note:q("#pp-note"),keyLis:document.querySelectorAll("#pp-key li").length,keyHeadHidden:getComputedStyle(document.getElementById("pp-key-head")).display==="none",hash:location.hash};})()`;
  const state = () => evaluate(STATE);
  const opened = async (label) => {
    for (let i = 0; i < 200; i++) {
      let s = null;
      try { s = await state(); } catch {}
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
  check(
    "PB3 the chart's folio names the place, the chart and its world",
    /^The Prospect of Laukuwelua · Chart № 42$/.test(cap.title) && /The Isle of Rahai/.test(cap.sub) && /^pressed in \d+ms · antique$/.test(cap.pressed),
    JSON.stringify({ title: cap.title, sub: cap.sub, pressed: cap.pressed }),
  );
  check("PB3b the folio names what the place was once called (#49)", /once called Haitani/.test(cap.sub), cap.sub);
  check(
    "PB3c the engraver's note is filled: the place as the slip's title, its epithet and founding, Today's card's note for the town, the plate's lettered key, the era line (#494 ruling 4)",
    cap.noteTitle === "Laukuwelua" && /^chief port of .+ · founded An\. \d+$/.test(cap.where) && cap.note.length > 20 && cap.keyLis === cap.keyRows && cap.keyRows > 0 && !cap.keyHeadHidden && /^Standing · An\. \d+$/.test(cap.eraLine),
    JSON.stringify({ noteTitle: cap.noteTitle, where: cap.where, noteLen: cap.note.length, keyLis: cap.keyLis, keyRows: cap.keyRows, eraLine: cap.eraLine }),
  );
  check(
    "PB3d the roads out: the Explorer keeps the world's keys and sheds the page's own; the Ribbon takes the same world with this town as its departure (#494 ruling 3)",
    cap.chart.startsWith("/explorer/#seed=42") && !/(^|&)i=/.test(cap.chart.slice(cap.chart.indexOf("#") + 1)) && cap.ribbon === "/ribbon/#" + cap.chart.slice("/explorer/#".length) + "&a=0" && /^Take the road from Laukuwelua in$/.test(cap.ribbonVerb) && cap.roads === true && cap.ribbonShown,
    JSON.stringify({ chart: cap.chart, ribbon: cap.ribbon, verb: cap.ribbonVerb, roads: cap.roads, shown: cap.ribbonShown }),
  );
  const room = await evaluate(`(()=>{const s=document.getElementById("sheet").getBoundingClientRect();const p=document.getElementById("pp-plate").getBoundingClientRect();return{chartRoom:document.body.classList.contains("chart-room"),footer:!!document.querySelector("footer"),band:!!document.querySelector(".band"),w:s.width,h:s.height,pw:p.width,ph:p.height,aspect:s.width/s.height};})()`);
  check(
    "PB3e the room: chart-room body, no band, no footer, the sheet fitted at the plate's own 520:384 and the plate filling it",
    room.chartRoom && !room.footer && !room.band && room.w > 200 && Math.abs(room.aspect - 520 / 384) < 0.01 && Math.abs(room.pw - room.w) < 1 && Math.abs(room.ph - room.h) < 1,
    JSON.stringify(room),
  );
  await evaluate(`(()=>{const vp=document.getElementById("map-viewport");vp.focus();vp.dispatchEvent(new KeyboardEvent("keydown",{key:"+",bubbles:true}));})()`);
  let leaned = null;
  for (let i = 0; i < 60; i++) {
    try { leaned = await evaluate(`(()=>{const vp=document.getElementById("map-viewport");const t=getComputedStyle(document.getElementById("map")).transform;const m=/matrix\\(([^,]+),/.exec(t);return{zoomed:vp.classList.contains("zoomed"),k:m?Number(m[1]):1};})()`); } catch {}
    if (leaned && leaned.zoomed && leaned.k > 1.3) break;
    await sleep(50);
  }
  check("PB3f the Glass leans on the plate (+ magnifies the sheet, the kit's keys)", !!leaned && leaned.zoomed && leaned.k > 1.3, JSON.stringify(leaned));
  await evaluate(`document.getElementById("map-viewport").dispatchEvent(new KeyboardEvent("keydown",{key:"0",bubbles:true}))`);
  for (let i = 0; i < 60; i++) {
    let home = null;
    try { home = await evaluate(`!document.getElementById("map-viewport").classList.contains("zoomed")`); } catch {}
    if (home) break;
    await sleep(50);
  }
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
  const present = await opened("the standing town");
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
    "PB7b a viewed year reads in the year control and the era line, the bare ground has no key, and the Explorer link sheds the page's own keys",
    early.yearField === "300" && early.eraLine === "Before the founding · An. 300" && early.era === "before-founding" && early.keyRows === 0 && early.keyHeadHidden && /will rise · An\. 300$/.test(early.where) && !/founded/.test(early.where) && early.chart === "/explorer/#seed=42",
    JSON.stringify({ yearField: early.yearField, eraLine: early.eraLine, keyRows: early.keyRows, keyHeadHidden: early.keyHeadHidden, where: early.where, chart: early.chart }),
  );

  await evaluate(`(()=>{document.getElementById("pp-year").value=${JSON.stringify(String(early.presentYear))};document.getElementById("pp-year-form").requestSubmit();})()`);
  let engraved = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try { s = await state(); } catch {}
    if (s && s.year === early.presentYear && s.status === "") { engraved = s; break; }
    await sleep(75);
  }
  const reEngraved = engraved ? await svgOf() : null;
  check(
    "PB7c Engrave re-engraves in place: the present year's plate is byte-identical to a fresh visit's, the era and key return, the address gains year= and keeps i=",
    !!engraved && reEngraved === standing && engraved.era === "standing" && engraved.keyRows > 0 && new RegExp(`(^|&)year=${early.presentYear}(&|$)`).test(engraved.hash.slice(1)) && /(^|&)i=1(&|$)/.test(engraved.hash.slice(1)) && engraved.index === 1,
    JSON.stringify(engraved && { year: engraved.year, era: engraved.era, keyRows: engraved.keyRows, hash: engraved.hash, same: reEngraved === standing }),
  );
  // Garbage is refused IN PLACE by the control's own digits pattern (home's seed-input precedent): the browser never fires submit.
  const garbage = await evaluate(`(()=>{const y=document.getElementById("pp-year");y.value="abc";const valid=y.checkValidity();document.getElementById("pp-year-form").requestSubmit();return valid;})()`);
  await sleep(300);
  const refused = await state();
  await evaluate(`(()=>{document.getElementById("pp-year").value="";document.getElementById("pp-year-form").requestSubmit();})()`);
  await sleep(300);
  const emptied = await state();
  check(
    "PB7d a year that is not a year is refused: garbage fails the control's pattern and nothing is re-engraved; an emptied field returns to the plate's year",
    garbage === false && !!refused && refused.year === early.presentYear && refused.status === "" && refused.svgLength === engraved.svgLength && !!emptied && emptied.yearField === String(early.presentYear) && emptied.year === early.presentYear,
    JSON.stringify({ garbageValid: garbage, refused: refused && { yearField: refused.yearField, year: refused.year }, emptied: emptied && { yearField: emptied.yearField, year: emptied.year } }),
  );

  // Tewetulua (24) is seed 42's one settlement no road leaves (measured 2026-09-01).
  await goto("#seed=42&i=24");
  const orphan = await opened("the road-orphan");
  check(
    "PB7e a town no road leaves offers no road in the Ribbon: the plate and the note stand, the road out stands down, the Explorer road stays",
    orphan.name === "Tewetulua" && orphan.roads === false && !orphan.ribbonShown && orphan.shown && orphan.noteTitle === "Tewetulua" && orphan.chart === "/explorer/#seed=42",
    JSON.stringify({ name: orphan.name, roads: orphan.roads, shown: orphan.ribbonShown, chart: orphan.chart }),
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
