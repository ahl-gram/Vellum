// The Print Room checks (PRL, PR0-PR16, PRC, PRB) on the /print-room/ page (#133/#134/#135,
// epic #132): PR0-PR9 the shell + inline fallback (#133), PR10-PR16 the SVG poster plates
// (#134), PR17-PR19 the client-side PNG rasterizer (#135).
// A sixth hand-authored page that reuses the Explorer's render worker from a DIFFERENT
// directory, so the checks below are the tripwire for the cross-directory worker-spawn
// trap: `new Worker("./worker.js")` would resolve against /print-room/ and 404 into a
// silent inline fallback. PR1 (worker active) and PR7 (no new 4xx) catch exactly that.
//
// Self-contained like the Daily Hunt suite: it navigates to its own page after the
// health checkpoint and carries its OWN scoped no-4xx + console-error delta, which is
// strictly stronger than N2's snapshot (which runs before this page ever loads).
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, serverState, consoleErrors, http4xx, PORT } = ctx;

  // First prove the REAL handoff: the Explorer's "Take to the Print Room" link must
  // carry the world currently on screen. Load a known world (seed 42, the hero) in the
  // Explorer, then read its order-plates href.
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#seed=42&style=antique&legend=1` });
  let exReady = false;
  for (let i = 0; i < 200; i++) {
    let ok = null;
    try { ok = await evaluate(`typeof window.__vellumUsesWorker==="function" && !!document.querySelector("#map svg") && document.getElementById("status").textContent===""`); } catch {}
    if (ok) { exReady = true; break; }
    await sleep(75);
  }
  const orderHref = exReady ? await evaluate(`(()=>{const a=document.getElementById("order-plates");return a?a.getAttribute("href"):null;})()`) : null;
  check(
    "PRL Explorer 'Take to the Print Room' link carries the world on screen",
    !!orderHref && /^\.\.\/print-room\/#/.test(orderHref) && /seed=42/.test(orderHref),
    String(orderHref),
  );

  // Follow that real deep-link into the Print Room (the relative href resolves against
  // /explorer/, so its hash is what matters). Fall back to a constructed hash only if
  // the link was somehow absent, so the rest of the suite still runs.
  const hashPart = orderHref && orderHref.includes("#") ? orderHref.slice(orderHref.indexOf("#")) : "#seed=42&style=antique&legend=1";
  const PR_PAGE = `http://127.0.0.1:${PORT}/print-room/${hashPart}`;
  await send("Page.navigate", { url: PR_PAGE });

  // Scope the health deltas to the Print Room page only: capture AFTER the navigation
  // above so the Explorer/seed-of-the-day loads before it are not charged to PR6/PR7.
  // The worker + engine + asset requests for THIS load fire after navigate() resolves,
  // so they are still inside the window (a /print-room/worker.js 404 still trips PR7).
  const prErrBase = consoleErrors.length;
  const prHttpBase = http4xx.length;

  // Wait for bootstrap: the worker hook exists once initWorker + the first draw kicked
  // off. evaluate may land in a context destroyed by the in-flight navigation, so
  // swallow-and-retry (same defensive pattern as the hunt suite).
  let booted = false;
  for (let i = 0; i < 200; i++) {
    let ok = null;
    try { ok = await evaluate(`typeof window.__vellumPrintRoomUsesWorker === "function"`); } catch {}
    if (ok) { booted = true; break; }
    await sleep(75);
  }
  check("PR0 print-room page booted (worker hook present)", booted);
  check("PR1 print-room render worker active (no silent cross-directory fallback)", await evaluate(`window.__vellumPrintRoomUsesWorker() === true`));

  // Wait for the deep-linked proof to render off-thread. Bounded so a regressed build
  // (no preview) reds in a few seconds rather than hanging the run.
  let previewed = false;
  for (let i = 0; i < 120; i++) {
    let s = null;
    try { s = await evaluate(`({svg:!!document.querySelector("#pr-preview svg"),status:(document.getElementById("pr-status")||{}).textContent})`); } catch {}
    if (s && s.svg && s.status === "") { previewed = true; break; }
    await sleep(50);
  }
  check("PR2 deep-link renders a proof into the preview (off-thread)", previewed);

  // The proof is the deep-linked WORLD, not a default: seed 42 renders its golden title
  // "The Isle of Rahai" (pinned by test/world/golden-seed42.test.ts and the R4 committed
  // chart), so asserting the exact title is a real identity witness, not just "a render
  // happened for input 42".
  const st = await evaluate(`(()=>{const s=window.__vellumPrintRoomState();return{seed:s.seed,title:s.title,svg:!!document.querySelector("#pr-preview svg")};})()`);
  check(
    "PR3 the proof is the deep-linked world (seed 42 == 'The Isle of Rahai')",
    st.svg && st.seed === 42 && st.title === "The Isle of Rahai",
    JSON.stringify(st),
  );

  // Manual seed entry: type a different seed, pull a proof, expect a fresh chart for it.
  await evaluate(`(()=>{const s=document.getElementById("pr-seed");s.value="100";document.getElementById("pr-draw").click();})()`);
  let manual = null;
  for (let i = 0; i < 120; i++) {
    let s = null;
    try { s = await evaluate(`(()=>{const st=window.__vellumPrintRoomState();return{seed:st.seed,title:st.title,svg:!!document.querySelector("#pr-preview svg"),status:document.getElementById("pr-status").textContent};})()`); } catch {}
    if (s && s.svg && s.status === "" && s.seed === 100) { manual = s; break; }
    await sleep(50);
  }
  check("PR4 manual seed entry pulls a fresh proof", !!manual && manual.seed === 100 && manual.title !== st.title, JSON.stringify(manual));

  // The Print Room writes the world back into its own hash in the Explorer's format,
  // so a Print Room link round-trips into either page.
  const hash = await evaluate(`location.hash`);
  check("PR5 a manual draw round-trips the world into the hash", /(^|&|#)seed=100(&|$)/.test(hash) && /style=antique/.test(hash), hash);

  // PRC: the carried params with no visible control (type/band/theme/legend/arms/land)
  // must survive the deep-link -> applyHash -> draw -> writeHash carry-through at
  // NON-default values, or a dropped/mis-validated param would ship undetected (PRL's
  // handoff only ever carries defaults, since the Explorer omits empty selects).
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/print-room/#seed=42&style=antique&type=archipelago&band=tropical&theme=vegetation&arms=1&legend=0&land=350` });
  let carried = null;
  for (let i = 0; i < 160; i++) {
    let s = null;
    try { s = await evaluate(`({svg:!!document.querySelector("#pr-preview svg"),status:(document.getElementById("pr-status")||{}).textContent,hash:location.hash})`); } catch {}
    if (s && s.svg && s.status === "") { carried = s; break; }
    await sleep(50);
  }
  const carriedOk =
    !!carried &&
    /type=archipelago/.test(carried.hash) && /band=tropical/.test(carried.hash) &&
    /theme=vegetation/.test(carried.hash) && /arms=1/.test(carried.hash) &&
    /legend=0/.test(carried.hash) && /land=350/.test(carried.hash) && /seed=42/.test(carried.hash);
  check("PRC carried params (type/band/theme/legend/arms/land) round-trip at non-defaults", carriedOk, carried ? carried.hash : "no preview");

  // PRB: a bare visit (no seed in the hash) lands on today's seed-of-the-day (UTC),
  // matching the Explorer (R0b) and the Today page. about:blank first so the hash truly
  // clears (a same-document hash removal would not re-bootstrap the page).
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/print-room/` });
  let bare = null;
  for (let i = 0; i < 160; i++) {
    let s = null;
    try {
      s = await evaluate(`(async()=>{const {seedForDate}=await import("/explorer/engine/world/seed-of-the-day.js");return{svg:!!document.querySelector("#pr-preview svg"),status:(document.getElementById("pr-status")||{}).textContent,seed:document.getElementById("pr-seed").value,expected:String(seedForDate(new Date()))};})()`, true);
    } catch {}
    if (s && s.svg && s.status === "") { bare = s; break; }
    await sleep(50);
  }
  check("PRB bare Print Room visit lands on today's seed-of-the-day", !!bare && bare.seed === bare.expected, JSON.stringify(bare));

  // --- #134 poster plates -------------------------------------------------------------
  // Downloads are gated to "deny" so the plate's a.click() exercises the full blob path
  // (create, click, revoke, observe) without a headless disk write or prompt. blob: URLs
  // are not HTTP, so a denied download adds no 4xx and no console error: PR6/PR7 (checked
  // after this block) stay clean.
  try { await send("Browser.setDownloadBehavior", { behavior: "deny" }); }
  catch { try { await send("Page.setDownloadBehavior", { behavior: "deny" }); } catch {} }

  // Order from a KNOWN proof: seed 42 antique (the golden hero). Pull it, then the plate
  // buttons enable off the snapshotted basis (they start disabled with no proof).
  await evaluate(`(()=>{const s=document.getElementById("pr-seed");s.value="42";document.getElementById("pr-style").value="antique";document.getElementById("pr-draw").click();})()`);
  let plateReady = null;
  for (let i = 0; i < 160; i++) {
    let s = null;
    try { s = await evaluate(`(()=>{const st=window.__vellumPrintRoomState();const g=document.querySelector('[data-poster="grand"]');return{seed:st.seed,status:document.getElementById("pr-status").textContent,disabled:g?g.disabled:true};})()`); } catch {}
    if (s && s.seed === 42 && s.status === "" && s.disabled === false) { plateReady = s; break; }
    await sleep(50);
  }
  check("PR10 plate buttons enable once a proof is on the desk", !!plateReady, JSON.stringify(plateReady));

  // The clamp guard, exercised in-browser: a hand-edited width can never reach the worker
  // wider than Grand (4200) or under Desk (2400). Unit-tested too (poster-presets.test.ts).
  const clamp = await evaluate(`(()=>{const f=window.__vellumClampPosterWidth;return{hi:f(999999),lo:f(1),grand:f(4200)};})()`);
  check("PR11 clampPosterWidth bounds any width to the [2400, 4200] envelope", clamp.hi === 4200 && clamp.lo === 2400 && clamp.grand === 4200, JSON.stringify(clamp));

  // Order the Grand plate. orderPoster runs synchronously up to runJob, so the plates
  // disable and the press status appears in the SAME turn as the click: assert both.
  const accepted = await evaluate(`(()=>{window.__vellumLastPoster=undefined;const g=document.querySelector('[data-poster="grand"]');g.click();return{disabled:g.disabled,status:document.getElementById("pr-poster-status").textContent};})()`);
  check("PR12 ordering a plate disables the counter and rolls the press", accepted.disabled === true && /press is rolling/i.test(accepted.status), JSON.stringify(accepted));

  // The press runs a few seconds off-thread. Wait for the poster hook, and assert it is a
  // well-formed 4200px plate of the proof, the counter re-opened, and the status names the
  // pulled sheet.
  let poster = null;
  for (let i = 0; i < 220; i++) {
    let s = null;
    try {
      s = await evaluate(`(()=>{const p=window.__vellumLastPoster;const g=document.querySelector('[data-poster="grand"]');const svgs=[...document.querySelectorAll("svg")].map(el=>Number(el.getAttribute("width"))||0);return{has:!!p,filename:p&&p.filename,width:p&&p.width,seed:p&&p.seed,hasWidthAttr:!!(p&&p.svg.includes('width="4200"')),hasRecipeAttr:!!(p&&p.svg.includes('data-vellum-seed="42"')),reenabled:g?!g.disabled:false,status:document.getElementById("pr-poster-status").textContent,maxDom:svgs.length?Math.max(...svgs):0,preview:!!document.querySelector("#pr-preview svg")};})()`);
    } catch {}
    if (s && s.has) { poster = s; break; }
    await sleep(50);
  }
  check(
    "PR13 the Grand plate pulls a well-formed 4200px poster of the proof (counter re-opens, sheet named)",
    !!poster && poster.width === 4200 && poster.seed === 42 &&
      poster.filename === "vellum-poster-42-antique-4200.svg" &&
      poster.hasWidthAttr && poster.hasRecipeAttr &&
      poster.reenabled === true && /vellum-poster-42-antique-4200\.svg/.test(poster.status),
    JSON.stringify(poster && { ...poster }),
  );

  // The epic's one hard warning: the wide poster string is download-only and NEVER enters
  // the live DOM (a multi-MB innerHTML swap). The only svg on the page is the modest
  // PREVIEW_WIDTH proof, so no svg element carries a width attribute above the preview.
  check(
    "PR14 download-only: the wide poster never enters the DOM (no svg wider than the preview)",
    !!poster && poster.preview === true && poster.maxDom > 0 && poster.maxDom <= 1000,
    poster ? `maxDomSvgWidth=${poster.maxDom}` : "no poster",
  );

  // recipeFromSvg round-trips the poster (acceptance-1): the recipe rides inside the SVG,
  // so the artifact is self-describing. Parse the poster string with the engine's reader.
  const rt = await evaluate(`(async()=>{const {recipeFromSvg}=await import("/explorer/engine/render/recipe-meta.js");const p=window.__vellumLastPoster;const r=p?recipeFromSvg(p.svg):null;return r?{seed:r.recipe.seed,style:r.style}:null;})()`, true);
  check("PR15 recipeFromSvg round-trips the poster (seed 42, antique)", !!rt && rt.seed === 42 && rt.style === "antique", JSON.stringify(rt));

  // Acceptance-1 is "EACH preset downloads": Desk/Wall/Grand ride the same handler, so a
  // second preset end-to-end (Desk 2400) proves the per-preset width flows through, not
  // just Grand. The counter re-opened after PR13, so the button is clickable.
  await evaluate(`(()=>{window.__vellumLastPoster=undefined;document.querySelector('[data-poster="desk"]').click();})()`);
  let desk = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try { s = await evaluate(`(()=>{const p=window.__vellumLastPoster;return p?{filename:p.filename,width:p.width,hasWidthAttr:p.svg.includes('width="2400"')}:null;})()`); } catch {}
    if (s) { desk = s; break; }
    await sleep(50);
  }
  check(
    "PR16 the Desk plate downloads a well-formed 2400px poster (each preset, not just Grand)",
    !!desk && desk.width === 2400 && desk.filename === "vellum-poster-42-antique-2400.svg" && desk.hasWidthAttr,
    JSON.stringify(desk),
  );

  // --- #135 poster PNG (the client-side rasterizer) -----------------------------------
  // The "Step one" format dropdown switches the same plate buttons from a vector SVG
  // download to a canvas PNG at x1 or x2. Downloads stay denied, so we observe
  // window.__vellumLastPng: MIME type, blob size, output dimensions, and the budget-clamp
  // flag. No timing assertions (acceptance). Helper: set the format select, order a plate,
  // await the hook.
  async function orderPng(format, plate) {
    await evaluate(`(()=>{window.__vellumLastPng=undefined;document.getElementById("pr-format").value="${format}";document.querySelector('[data-poster="${plate}"]').click();})()`);
    let png = null;
    for (let i = 0; i < 300; i++) {
      let s = null;
      try { s = await evaluate(`(()=>{const p=window.__vellumLastPng;return p?{type:p.type,size:p.size,width:p.width,height:p.height,scale:p.scale,clamped:p.clamped,filename:p.filename,status:document.getElementById("pr-poster-status").textContent}:null;})()`); } catch {}
      if (s) { png = s; break; }
      await sleep(50);
    }
    return png;
  }

  // PR17 Desk PNG x1: a 2400px plate rasterizes to a 2400px PNG, well under the pixel
  // budget, so x1 carries through unclamped as image/png with nonzero bytes.
  const png1 = await orderPng("png1", "desk");
  check(
    "PR17 Desk PNG x1 is a well-formed 2400px image/png (nonzero, not clamped)",
    !!png1 && png1.type === "image/png" && png1.size > 0 && png1.width === 2400 &&
      png1.clamped === false && png1.filename === "vellum-poster-42-antique-2400.png",
    JSON.stringify(png1),
  );

  // PR18 Desk PNG x2: the same 2400px plate at x2 is a 4800px PNG (~17.8 Mpx, still under
  // the 24 Mpx budget), proving the scale flows through and stays unclamped.
  const png2 = await orderPng("png2", "desk");
  check(
    "PR18 Desk PNG x2 is a 4800px image/png, unclamped (scale carries through)",
    !!png2 && png2.type === "image/png" && png2.size > 0 && png2.width === 4800 &&
      png2.clamped === false && png2.filename === "vellum-poster-42-antique-4800.png",
    JSON.stringify(png2),
  );

  // PR19 Grand PNG x2: 4200px at x2 (~54 Mpx) busts the 24 Mpx budget, so the rasterizer
  // fits it DOWN (scale < 2, width < the unclamped 8400) and the status carries a visible
  // reduced-resolution notice, never a silent null or a tab-killing allocation. This is
  // acceptance "4200px x2 gets budget-clamped with a visible notice".
  const png3 = await orderPng("png2", "grand");
  check(
    "PR19 Grand PNG x2 is budget-clamped with a visible notice (not a silent crash)",
    !!png3 && png3.type === "image/png" && png3.size > 0 && png3.clamped === true &&
      png3.scale < 2 && png3.width < 8400 && /reduced/i.test(png3.status) && /\.png$/.test(png3.filename),
    JSON.stringify(png3),
  );

  // --- #136 the bound atlas (bind + print stylesheet + single-file download) ------------
  // Bind the atlas of the seed-42 proof. The plate buttons re-enabled after PR13, and the
  // Bind button enables off the same proof; click it and wait for the composed atlas to lay
  // itself out inline (the same off-thread `atlas` job the Explorer's Bind uses). Downloads
  // are still denied, so the single-file a.click() below exercises the full blob path.
  await evaluate(`(()=>{const s=document.getElementById("pr-seed");s.value="42";document.getElementById("pr-style").value="antique";document.getElementById("pr-draw").click();})()`);
  let bindReady = false;
  for (let i = 0; i < 160; i++) {
    let ok = null;
    try { ok = await evaluate(`(()=>{const st=window.__vellumPrintRoomState();const b=document.getElementById("pr-bind");return st.seed===42&&document.getElementById("pr-status").textContent===""&&b&&!b.disabled;})()`); } catch {}
    if (ok) { bindReady = true; break; }
    await sleep(50);
  }
  check("PR20a the Bind button enables once a proof is on the desk", bindReady);

  await evaluate(`document.getElementById("pr-bind").click()`);
  let bound = null;
  for (let i = 0; i < 300; i++) {
    let s = null;
    try {
      s = await evaluate(`(()=>{const b=window.__vellumBoundAtlas;if(!b)return null;const imgs=[...document.querySelectorAll("#pr-atlas img")];const hero=document.querySelector("#pr-atlas .hero-plate");return{seed:b.seed,title:b.title,figs:b.figures,plates:document.querySelectorAll("#pr-atlas figure:not(.banner)").length,print:!document.getElementById("pr-print").disabled,dl:!document.getElementById("pr-download").disabled,hide:!document.getElementById("pr-hide").disabled,hasAtlas:document.body.classList.contains("has-atlas"),imgs:imgs.length,loaded:imgs.length>0&&imgs.every(im=>im.complete&&im.naturalWidth>0),heroHiddenOnScreen:hero?getComputedStyle(hero).display==="none":false};})()`);
    } catch {}
    if (s && s.loaded) { bound = s; break; }
    await sleep(50);
  }
  check(
    "PR20 Bind composes the full atlas inline: all plates load, delivery enabled, hero hidden on screen",
    !!bound && bound.seed === 42 && bound.title === "The Isle of Rahai" && bound.plates >= 8 &&
      bound.print === true && bound.dl === true && bound.hide === true && bound.hasAtlas === true &&
      bound.loaded === true && bound.heroHiddenOnScreen === true,
    JSON.stringify(bound),
  );

  // Capture the redesigned layout with the atlas bound below the proof (order desk on top).
  await shoot("print-room-bound.png");

  // PR20b the shared plate hover-lift (moved from the Explorer's retired D5, #199). The bound
  // plates react to the hand like the homepage chart plates (#146) but rest FLAT so the grid
  // stays crisp. The lift lives in the shared ATLAS_SHEET_CSS (src/atlas/document.ts, scoped
  // .atlas-sheet), injected here by bound-atlas.js; #pr-atlas carries .atlas-sheet, so the rule
  // governs these plates. e2e cannot emulate :hover, so this asserts the gesture is WIRED: a
  // paper-timed transform transition on the image, the image resting with no transform, and a
  // :hover rule with a transform actually in the stylesheet (so the check bites the lift, not
  // just the plumbing). Read on screen media, before PR21 emulates print.
  const hover = await evaluate(`(()=>{
    const img=document.querySelector("#pr-atlas figure img");
    if(!img)return{img:false};
    const cs=getComputedStyle(img);
    let hoverLift=false;
    for(const ss of document.styleSheets){let rules;try{rules=ss.cssRules;}catch(e){continue;}
      if(!rules)continue;
      for(const r of rules){
        if(r.selectorText&&r.selectorText.includes(".atlas-sheet figure img:hover")&&r.style&&r.style.transform&&r.style.transform!=="none"&&img.matches(".atlas-sheet figure img")){hoverLift=true;}
      }
    }
    return{img:true,dur:cs.transitionDuration,prop:cs.transitionProperty,tform:cs.transform,hoverLift};
  })()`);
  check(
    "PR20b bound plates carry the shared hover-lift (paper-timed transition, rest flat, :hover transform rule exists)",
    hover.img && hover.dur.includes("0.26s") && hover.prop.includes("transform") &&
      (hover.tform === "none" || hover.tform === "matrix(1, 0, 0, 1, 0, 0)") && hover.hoverLift === true,
    JSON.stringify(hover),
  );

  // PR21 the print stylesheet: under print media the page chrome collapses and only the
  // bound atlas remains, one plate per page. Emulate print and read computed styles, a
  // direct witness that the site's first real @media print block does its job.
  await send("Emulation.setEmulatedMedia", { media: "print" });
  const printView = await evaluate(`(()=>{const disp=(sel)=>{const el=document.querySelector(sel);return el?getComputedStyle(el).display:"absent";};const f=document.querySelector("#pr-atlas figure:not(.banner)");return{counter:disp(".counter"),preview:disp("#pr-preview"),desk:disp(".order-desk"),caption:disp("#pr-caption"),atlas:disp("#pr-atlas"),hero:disp("#pr-atlas .hero-plate"),breakAfter:f?getComputedStyle(f).breakAfter:"absent"};})()`);
  check(
    "PR21 print stylesheet hides chrome, keeps the atlas + hero, breaks one plate per page",
    printView.counter === "none" && printView.preview === "none" && printView.desk === "none" &&
      printView.caption === "none" && printView.atlas !== "none" && printView.hero !== "none" &&
      printView.breakAfter === "page",
    JSON.stringify(printView),
  );

  // PR22 the browser's own Save-as-PDF (this replaces the deleted CLI --pdf): print the page
  // to a PDF and assert it is well-formed and non-trivial (a blank atlas or a print-blank
  // plate bug would yield a tiny file). Full paper-fidelity is a manual Chrome/Safari pass.
  let pdf = null;
  try { pdf = await send("Page.printToPDF", { printBackground: true }); } catch (e) { pdf = null; }
  check(
    "PR22 browser Save-as-PDF yields a well-formed, non-empty bound atlas",
    !!pdf && typeof pdf.data === "string" && pdf.data.length > 20000,
    pdf ? `${pdf.data.length} base64 chars` : "printToPDF failed",
  );
  await send("Emulation.setEmulatedMedia", { media: "" }); // back to screen for the rest

  // PR23 the single-file download: a self-contained document with every plate inlined as a
  // base64 data URI, no blob: URLs (session-scoped, would break offline), and no external
  // stylesheet. Downloads are denied, so we read the metadata hook, never the ~20MB string.
  await evaluate(`(()=>{window.__vellumLastAtlasDownload=undefined;document.getElementById("pr-download").click();})()`);
  let dl = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try { s = await evaluate(`window.__vellumLastAtlasDownload || null`); } catch {}
    if (s) { dl = s; break; }
    await sleep(50);
  }
  check(
    "PR23 single-file download is self-contained (data-URI plates, no blob/external refs)",
    !!dl && dl.dataUris >= 8 && dl.hasBlobUrl === false && dl.hasExternalCss === false &&
      dl.size > 1000000 && dl.title === "The Isle of Rahai" && /^vellum-atlas-42\.html$/.test(dl.filename),
    JSON.stringify(dl),
  );

  // PR24 the bind-during-redraw guard. A fresh draw must disable Bind SYNCHRONOUSLY
  // (clearBoundAtlas runs before the async render), so a bind can never start against the
  // PREVIOUS world while a new proof is in flight: that would compose the old world's atlas
  // and survive the bindGen guard (the new proof lands without bumping bindGen), leaving the
  // bound sheet disagreeing with the on-screen proof. The click below reads the button state
  // in the SAME turn as the draw click, then we confirm the new proof re-enables Bind.
  const midDraw = await evaluate(`(()=>{const s=document.getElementById("pr-seed");s.value="2024";document.getElementById("pr-draw").click();return{bind:document.getElementById("pr-bind").disabled,print:document.getElementById("pr-print").disabled,atlasEmpty:document.getElementById("pr-atlas").children.length===0,hasAtlas:document.body.classList.contains("has-atlas")};})()`);
  let reenabled = null;
  for (let i = 0; i < 160; i++) {
    let s = null;
    try { s = await evaluate(`(()=>{const st=window.__vellumPrintRoomState();return{seed:st.seed,status:document.getElementById("pr-status").textContent,bind:document.getElementById("pr-bind").disabled};})()`); } catch {}
    if (s && s.seed === 2024 && s.status === "" && s.bind === false) { reenabled = s; break; }
    await sleep(50);
  }
  check(
    "PR24 a redraw disables Bind mid-flight (no stale-world bind), re-enabled on the new proof",
    midDraw.bind === true && midDraw.print === true && midDraw.atlasEmpty === true &&
      midDraw.hasAtlas === false && !!reenabled,
    JSON.stringify({ midDraw, reenabled }),
  );

  // PR24b the bind-THEN-draw race. New coverage of the Print Room's existing bindGen guard for
  // the bind-then-draw direction (the same race-class the Explorer's now-retired R7 guarded
  // there, #199; PR24 already covers draw-then-bind). Where PR24 supersedes a SETTLED atlas
  // with a redraw, this starts a bind and supersedes it while it is IN FLIGHT: click Bind (an atlas compose is
  // posted to the worker), then in the SAME turn draw a fresh seed. draw()'s synchronous
  // clearBoundAtlas bumps bindGen before the compose resolves, and because the Print Room
  // shares ONE FIFO worker the atlas job settles FIRST (order-before-draw), so its .then sees
  // the bumped bindGen and drops -- the stale world's atlas must never inject over the new
  // proof. Deterministic on this substrate, the same property #212's PR26/PR27 rely on.
  const btd = await evaluate(`(()=>{document.getElementById("pr-bind").click();const s=document.getElementById("pr-seed");s.value="909";document.getElementById("pr-draw").click();return{bindDisabled:document.getElementById("pr-bind").disabled,atlasEmpty:document.getElementById("pr-atlas").children.length===0};})()`);
  let btdSettled = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try { s = await evaluate(`(()=>{const st=window.__vellumPrintRoomState();return{seed:st.seed,status:document.getElementById("pr-status").textContent,bind:document.getElementById("pr-bind").disabled};})()`); } catch {}
    if (s && s.seed === 909 && s.status === "" && s.bind === false) { btdSettled = s; break; }
    await sleep(50);
  }
  await sleep(250); // let any (wrongly) surviving stale bind inject before asserting emptiness
  const btdAtlas = await evaluate(`(()=>({figs:document.querySelectorAll("#pr-atlas figure").length,hasAtlas:document.body.classList.contains("has-atlas")}))()`);
  check(
    "PR24b an in-flight bind is dropped when a redraw supersedes it (no stale-world atlas)",
    btd.bindDisabled === true && btd.atlasEmpty === true && !!btdSettled &&
      btdAtlas.figs === 0 && btdAtlas.hasAtlas === false,
    JSON.stringify({ btd, btdSettled, btdAtlas }),
  );

  // PR25 the Hide action (#136 redesign). After binding, Hide dismisses the atlas but leaves
  // Bind enabled (the proof is unchanged), and drops Print/Download/Hide + the has-atlas class.
  await evaluate(`document.getElementById("pr-bind").click()`);
  let reboundForHide = false;
  for (let i = 0; i < 260; i++) {
    let ok = null;
    try { ok = await evaluate(`(()=>{const imgs=[...document.querySelectorAll("#pr-atlas img")];return !!window.__vellumBoundAtlas && imgs.length>0 && imgs.every(im=>im.complete) && !document.getElementById("pr-hide").disabled;})()`); } catch {}
    if (ok) { reboundForHide = true; break; }
    await sleep(50);
  }
  const hidden = await evaluate(`(()=>{document.getElementById("pr-hide").click();return{atlasEmpty:document.getElementById("pr-atlas").children.length===0,hasAtlas:document.body.classList.contains("has-atlas"),bindEnabled:!document.getElementById("pr-bind").disabled,printDisabled:document.getElementById("pr-print").disabled,hideDisabled:document.getElementById("pr-hide").disabled};})()`);
  check(
    "PR25 Hide dismisses the bound atlas and re-enables Bind (proof unchanged)",
    reboundForHide && hidden.atlasEmpty === true && hidden.hasAtlas === false &&
      hidden.bindEnabled === true && hidden.printDisabled === true && hidden.hideDisabled === true,
    JSON.stringify({ reboundForHide, hidden }),
  );

  await shoot("print-room.png");

  // PR26 the order-during-redraw guard (#212, the poster-plate sibling of PR24's Bind race).
  // A fresh draw must disable the plate buttons AND the #pr-format select SYNCHRONOUSLY
  // (before the async render), because posterBasis only advances on a successful draw: an
  // enabled plate clicked while a new proof is in flight would snapshot the PREVIOUS world
  // and press a poster the visitor is no longer looking at. First confirm a proof is on the
  // desk with the counter open, THEN read the control state in the SAME turn as a redraw
  // click, then confirm the new proof re-opens the counter.
  let orderReady = false;
  for (let i = 0; i < 160; i++) {
    let ok = null;
    try { ok = await evaluate(`(()=>{const g=document.querySelector('[data-poster="grand"]');const f=document.getElementById("pr-format");return !!document.querySelector("#pr-preview svg")&&document.getElementById("pr-status").textContent===""&&!!g&&!g.disabled&&!!f&&!f.disabled;})()`); } catch {}
    if (ok) { orderReady = true; break; }
    await sleep(50);
  }
  const midPoster = await evaluate(`(()=>{const s=document.getElementById("pr-seed");s.value="777";document.getElementById("pr-draw").click();const plates=[...document.querySelectorAll("[data-poster]")];const f=document.getElementById("pr-format");return{platesDisabled:plates.length>0&&plates.every((b)=>b.disabled),format:f?f.disabled:null,status:document.getElementById("pr-status").textContent};})()`);
  let orderReenabled = null;
  for (let i = 0; i < 160; i++) {
    let s = null;
    try { s = await evaluate(`(()=>{const st=window.__vellumPrintRoomState();const g=document.querySelector('[data-poster="grand"]');const f=document.getElementById("pr-format");return{seed:st.seed,status:document.getElementById("pr-status").textContent,plate:g?g.disabled:true,format:f?f.disabled:true};})()`); } catch {}
    if (s && s.seed === 777 && s.status === "" && s.plate === false && s.format === false) { orderReenabled = s; break; }
    await sleep(50);
  }
  check(
    "PR26 a redraw disables the plate controls mid-flight (no stale-world poster), re-enabled on the new proof",
    orderReady && midPoster.platesDisabled === true && midPoster.format === true && !!orderReenabled,
    JSON.stringify({ orderReady, midPoster, orderReenabled }),
  );

  // PR27 the REVERSE guard (#212): an order that finishes DURING a redraw must NOT re-open the
  // counter. orderPoster's .finally re-enables the plates only through refreshOrderControls,
  // whose `!drawing` term is the SOLE guard for this direction. The Print Room shares ONE FIFO
  // render worker (worker-client.js: one persistent worker, no job cancellation, synchronous
  // onmessage), so a plate ordered and THEN a redraw posted behind it settle order-first while
  // the draw is still in flight: the order's .finally runs with drawing===true every run. We
  // assert the SUSTAINED invariant -- no plate ever re-enables while #pr-status still reads
  // "Pulling a proof..." -- and witness that the order genuinely completed inside the draw
  // window (else the interleaving never happened). An unconditional re-enable trips `violated`.
  let pr27Ready = false;
  for (let i = 0; i < 160; i++) {
    let ok = null;
    try { ok = await evaluate(`(()=>{const g=document.querySelector('[data-poster="grand"]');const f=document.getElementById("pr-format");return !!document.querySelector("#pr-preview svg")&&document.getElementById("pr-status").textContent===""&&!!g&&!g.disabled&&!!f&&!f.disabled;})()`); } catch {}
    if (ok) { pr27Ready = true; break; }
    await sleep(50);
  }
  // Order a Desk plate (SVG, so it reports via __vellumLastPoster), then IMMEDIATELY post a
  // redraw behind it in the same worker queue, all synchronously in one turn.
  const pr27Start = await evaluate(`(()=>{document.getElementById("pr-format").value="svg";window.__vellumLastPoster=undefined;document.querySelector('[data-poster="desk"]').click();const s=document.getElementById("pr-seed");s.value="888";document.getElementById("pr-draw").click();const plates=[...document.querySelectorAll("[data-poster]")];return{platesDisabled:plates.every((b)=>b.disabled),status:document.getElementById("pr-status").textContent};})()`);
  let pr27Violated = false;
  let pr27OrderInDraw = false;
  let pr27Settled = null;
  for (let i = 0; i < 400; i++) {
    let s = null;
    try { s = await evaluate(`(()=>{const st=window.__vellumPrintRoomState();const plates=[...document.querySelectorAll("[data-poster]")];return{seed:st.seed,status:document.getElementById("pr-status").textContent,anyEnabled:plates.some((b)=>!b.disabled),orderDone:!!window.__vellumLastPoster};})()`); } catch {}
    if (s) {
      const drawing = s.status === "Pulling a proof…";
      if (drawing && s.orderDone) pr27OrderInDraw = true; // the order's .finally ran while the draw was still in flight
      if (drawing && s.anyEnabled) pr27Violated = true;   // a plate re-opened onto the pre-redraw world (the reverse race)
      if (s.seed === 888 && s.status === "" && s.anyEnabled) { pr27Settled = s; break; } // draw settled, counter re-opened
    }
    await sleep(30);
  }
  check(
    "PR27 an order finishing during a redraw keeps the counter closed until the new proof settles (reverse guard)",
    pr27Ready && pr27Start.platesDisabled === true && pr27OrderInDraw === true && pr27Violated === false && !!pr27Settled,
    JSON.stringify({ pr27Ready, pr27Start, pr27OrderInDraw, pr27Violated, pr27Settled }),
  );

  // Scoped health: no new console errors and no new (non-favicon) 4xx from this page,
  // its worker, its engine, or its root-absolute assets. Checked BEFORE the inline-
  // fallback test below, which deliberately 404s the worker.
  const newErrs = consoleErrors.slice(prErrBase);
  check("PR6 the print-room run logged no JS exceptions or console errors", newErrs.length === 0, newErrs.join(" | ") || "clean");
  const new4xx = http4xx.slice(prHttpBase).filter((u) => !/favicon/i.test(u));
  check("PR7 no new missing resources (no worker/engine/asset 4xx from /print-room/)", new4xx.length === 0, new4xx.join(", ") || "none");

  // PR8/PR9: the inline-fallback path (a named #133 acceptance bullet). 404 the worker
  // (blockWorker 404s exactly the /explorer/worker.js the Print Room spawns) and reload:
  // the page must degrade to the inline engine, SHOW the #pr-warning, and still render.
  // Mirrors the Explorer's B1-B3 for this page's separate markup. Restored in finally.
  try {
    await send("Network.clearBrowserCache");
    await send("Network.setCacheDisabled", { cacheDisabled: true });
    serverState.blockWorker = true;
    // Full document load: the browser is already on /print-room/ (from PRC), so a
    // navigate that differs only in the hash would be a same-document change and never
    // re-bootstrap the worker. about:blank forces a real reload of the page.
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/print-room/#seed=42&style=antique&legend=1` });
    let fb = null;
    for (let i = 0; i < 220; i++) {
      let s = null;
      try {
        s = await evaluate(`(()=>{const uw=typeof window.__vellumPrintRoomUsesWorker==="function"?window.__vellumPrintRoomUsesWorker():null;const w=document.getElementById("pr-warning");return{uw,warn:!!(w&&!w.hidden),svg:!!document.querySelector("#pr-preview svg"),status:(document.getElementById("pr-status")||{}).textContent};})()`);
      } catch {}
      if (s && s.uw === false && s.svg && s.status === "") { fb = s; break; }
      await sleep(75);
    }
    check("PR8 inline fallback: worker blocked -> inline path taken and #pr-warning shown", !!fb && fb.uw === false && fb.warn === true, JSON.stringify(fb));
    check("PR9 inline fallback: the proof still renders on the main thread", !!fb && fb.svg === true, JSON.stringify(fb));
  } finally {
    serverState.blockWorker = false;
    try { await send("Network.setCacheDisabled", { cacheDisabled: false }); } catch {}
  }

  // --- #137 the coast warp travels the full loop: a warped Explorer world, its real
  // "Take to the Print Room" href, and a warped proof on the desk that re-serializes
  // coast=. Uses the genuine cross-path handoff (like PRL), so the Print Room truly
  // re-bootstraps (no same-document hash-change trap). Runs last: it navigates away.
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#seed=42&style=antique&legend=1&coast=90` });
  let exWarp = false;
  for (let i = 0; i < 200; i++) {
    let ok = null;
    try { ok = await evaluate(`typeof window.__vellumUsesWorker==="function" && !!document.querySelector("#map svg") && document.getElementById("status").textContent===""`); } catch {}
    if (ok) { exWarp = true; break; }
    await sleep(75);
  }
  const warpHref = exWarp ? await evaluate(`(()=>{const a=document.getElementById("order-plates");return a?a.getAttribute("href"):null;})()`) : null;
  check(
    "PRW Explorer 'Take to the Print Room' href carries the coast warp (coast=90)",
    !!warpHref && /coast=90/.test(warpHref) && /seed=42/.test(warpHref),
    String(warpHref),
  );
  // Follow the real handoff into the Print Room (cross-path -> full bootstrap), then
  // prove the proof is genuinely warped (the stamp) and the warp re-serialized.
  const warpHash = warpHref && warpHref.includes("#") ? warpHref.slice(warpHref.indexOf("#")) : "#seed=42&style=antique&legend=1&coast=90";
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/print-room/${warpHash}` });
  let warpProof = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try {
      s = await evaluate(`(()=>{if(typeof window.__vellumPrintRoomState!=="function")return null;const st=window.__vellumPrintRoomState();const svg=document.querySelector("#pr-preview svg");return{seed:st.seed,svg:!!svg,status:(document.getElementById("pr-status")||{}).textContent,hash:location.hash,stamp:svg?svg.getAttribute("data-vellum-coast-warp"):null};})()`);
    } catch {}
    if (s && s.svg && s.status === "" && s.seed === 42) { warpProof = s; break; }
    await sleep(50);
  }
  check(
    "PRW2 the warped world Taken to the Print Room prints warped (stamp + coast= round-trip)",
    !!warpProof && warpProof.stamp === "0.9" && /coast=90/.test(warpProof.hash),
    warpProof ? `stamp=${warpProof.stamp} hash=${warpProof.hash}` : "no proof",
  );
}
