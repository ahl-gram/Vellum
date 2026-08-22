// Print Room e2e (PRL, PR0-PR29, PRC, PRB, PRW; #133/#134/#135/#136/#137/#212/#217): the shell and inline fallback, the poster plates, the PNG rasterizer and the bound atlas; hand-authored like its sibling suites and self-contained (navigates itself, carries scoped no-4xx and console-error deltas).
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, serverState, consoleErrors, http4xx, PORT } = ctx;

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

  const hashPart = orderHref && orderHref.includes("#") ? orderHref.slice(orderHref.indexOf("#")) : "#seed=42&style=antique&legend=1";
  const PR_PAGE = `http://127.0.0.1:${PORT}/print-room/${hashPart}`;
  await send("Page.navigate", { url: PR_PAGE });

  // The health bases are captured AFTER the navigate so the pages loaded before this one are not charged to PR6/PR7: this load's own worker, engine and asset requests still fire after navigate() resolves, so they stay inside the window.
  const prErrBase = consoleErrors.length;
  const prHttpBase = http4xx.length;

  // Every poll below swallows and retries: evaluate throws when it lands in a context an in-flight navigation has destroyed.
  let booted = false;
  for (let i = 0; i < 200; i++) {
    let ok = null;
    try { ok = await evaluate(`typeof window.__vellumPrintRoomUsesWorker === "function"`); } catch {}
    if (ok) { booted = true; break; }
    await sleep(75);
  }
  check("PR0 print-room page booted (worker hook present)", booted);
  check("PR1 print-room render worker active (no silent cross-directory fallback)", await evaluate(`window.__vellumPrintRoomUsesWorker() === true`));

  let previewed = false;
  for (let i = 0; i < 120; i++) {
    let s = null;
    try { s = await evaluate(`({svg:!!document.querySelector("#pr-preview svg"),status:(document.getElementById("pr-status")||{}).textContent})`); } catch {}
    if (s && s.svg && s.status === "") { previewed = true; break; }
    await sleep(50);
  }
  check("PR2 deep-link renders a proof into the preview (off-thread)", previewed);

  // "The Isle of Rahai" is seed 42's golden title (test/world/golden-seed42.test.ts), so PR3 witnesses the deep-linked world's identity rather than merely that a render happened.
  const st = await evaluate(`(()=>{const s=window.__vellumPrintRoomState();return{seed:s.seed,title:s.title,svg:!!document.querySelector("#pr-preview svg")};})()`);
  check(
    "PR3 the proof is the deep-linked world (seed 42 == 'The Isle of Rahai')",
    st.svg && st.seed === 42 && st.title === "The Isle of Rahai",
    JSON.stringify(st),
  );

  await evaluate(`(()=>{const s=document.getElementById("pr-seed");s.value="100";document.getElementById("pr-draw").click();})()`);
  let manual = null;
  for (let i = 0; i < 120; i++) {
    let s = null;
    try { s = await evaluate(`(()=>{const st=window.__vellumPrintRoomState();return{seed:st.seed,title:st.title,svg:!!document.querySelector("#pr-preview svg"),status:document.getElementById("pr-status").textContent};})()`); } catch {}
    if (s && s.svg && s.status === "" && s.seed === 100) { manual = s; break; }
    await sleep(50);
  }
  check("PR4 manual seed entry pulls a fresh proof", !!manual && manual.seed === 100 && manual.title !== st.title, JSON.stringify(manual));

  const hash = await evaluate(`location.hash`);
  check("PR5 a manual draw round-trips the world into the hash", /(^|&|#)seed=100(&|$)/.test(hash) && /style=antique/.test(hash), hash);

  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/print-room/#seed=42&style=antique&type=archipelago&band=tropical&theme=vegetation&arms=1&beasts=1&legend=0&land=350` });
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
    /beasts=1/.test(carried.hash) &&
    /legend=0/.test(carried.hash) && /land=350/.test(carried.hash) && /seed=42/.test(carried.hash);
  check("PRC carried params (type/band/theme/legend/arms/beasts/land) round-trip at non-defaults", carriedOk, carried ? carried.hash : "no preview");

  // about:blank first, here and at every re-entry below: a navigate that differs only in the hash is same-document and never re-bootstraps the page.
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

  // Downloads are denied for the rest of the run so every a.click() below runs the full blob path with no headless disk write; a denied blob download is not HTTP, so it adds no 4xx and no console error and PR6/PR7 stay clean.
  try { await send("Browser.setDownloadBehavior", { behavior: "deny" }); }
  catch { try { await send("Page.setDownloadBehavior", { behavior: "deny" }); } catch {} }

  await evaluate(`(()=>{const s=document.getElementById("pr-seed");s.value="42";document.getElementById("pr-style").value="antique";document.getElementById("pr-draw").click();})()`);
  let plateReady = null;
  for (let i = 0; i < 160; i++) {
    let s = null;
    try { s = await evaluate(`(()=>{const st=window.__vellumPrintRoomState();const g=document.querySelector('[data-poster="grand"]');return{seed:st.seed,status:document.getElementById("pr-status").textContent,disabled:g?g.disabled:true};})()`); } catch {}
    if (s && s.seed === 42 && s.status === "" && s.disabled === false) { plateReady = s; break; }
    await sleep(50);
  }
  check("PR10 plate buttons enable once a proof is on the desk", !!plateReady, JSON.stringify(plateReady));

  const clamp = await evaluate(`(()=>{const f=window.__vellumClampPosterWidth;return{hi:f(999999),lo:f(1),grand:f(4200)};})()`);
  check("PR11 clampPosterWidth bounds any width to the [2400, 4200] envelope", clamp.hi === 4200 && clamp.lo === 2400 && clamp.grand === 4200, JSON.stringify(clamp));

  const accepted = await evaluate(`(()=>{window.__vellumLastPoster=undefined;const g=document.querySelector('[data-poster="grand"]');g.click();return{disabled:g.disabled,status:document.getElementById("pr-poster-status").textContent};})()`);
  check("PR12 ordering a plate disables the counter and rolls the press", accepted.disabled === true && /press is rolling/i.test(accepted.status), JSON.stringify(accepted));

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

  // The 1000px ceiling sits just above `PREVIEW_WIDTH` in `src/site/print-room/app.ts`, so any poster-sized svg reaching the live DOM trips it.
  check(
    "PR14 download-only: the wide poster never enters the DOM (no svg wider than the preview)",
    !!poster && poster.preview === true && poster.maxDom > 0 && poster.maxDom <= 1000,
    poster ? `maxDomSvgWidth=${poster.maxDom}` : "no poster",
  );

  const rt = await evaluate(`(async()=>{const {recipeFromSvg}=await import("/explorer/engine/render/recipe-meta.js");const p=window.__vellumLastPoster;const r=p?recipeFromSvg(p.svg):null;return r?{seed:r.recipe.seed,style:r.style}:null;})()`, true);
  check("PR15 recipeFromSvg round-trips the poster (seed 42, antique)", !!rt && rt.seed === 42 && rt.style === "antique", JSON.stringify(rt));

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

  await evaluate(`(()=>{window.__vellumLastPoster=undefined;window.__vellumLastPng=undefined;document.getElementById("pr-format").value="png1";document.querySelector('[data-poster="chart"]').click();})()`);
  let chartPull = null;
  for (let i = 0; i < 220; i++) {
    let s = null;
    try {
      s = await evaluate(`(()=>{const p=window.__vellumLastPoster;return p?{width:p.width,seed:p.seed,filename:p.filename,hasWidthAttr:p.svg.includes('width="1500"'),hasRecipeAttr:p.svg.includes('data-vellum-seed="42"'),pngFired:window.__vellumLastPng!==undefined,status:document.getElementById("pr-poster-status").textContent}:null;})()`);
    } catch {}
    if (s) { chartPull = s; break; }
    await sleep(50);
  }
  check(
    "PR28 the Chart plate pulls the 1500px engraving, Explorer-named, ignoring the PNG format",
    !!chartPull && chartPull.width === 1500 && chartPull.seed === 42 &&
      chartPull.filename === "vellum-42-antique-the-isle-of-rahai.svg" &&
      chartPull.hasWidthAttr && chartPull.hasRecipeAttr && chartPull.pngFired === false &&
      /pulled as the engraving: vellum-42-antique-the-isle-of-rahai\.svg/.test(chartPull.status),
    JSON.stringify(chartPull),
  );

  // A dispatched change event is what clears the line: the programmatic value writes in orderPng below fire no change event, so this check cannot disturb them.
  const dismissed = await evaluate(
    `(()=>{const f=document.getElementById("pr-format");const before=document.getElementById("pr-poster-status").textContent;f.value="svg";f.dispatchEvent(new Event("change"));return{before,after:document.getElementById("pr-poster-status").textContent,plateOpen:!document.querySelector('[data-poster="chart"]').disabled};})()`,
  );
  check(
    "PR29 changing the Pressed-as format dismisses the stale poster status line",
    !!dismissed && dismissed.before.length > 0 && dismissed.after === "" && dismissed.plateOpen === true,
    JSON.stringify(dismissed),
  );

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

  const png1 = await orderPng("png1", "desk");
  check(
    "PR17 Desk PNG x1 is a well-formed 2400px image/png (nonzero, not clamped)",
    !!png1 && png1.type === "image/png" && png1.size > 0 && png1.width === 2400 &&
      png1.clamped === false && png1.filename === "vellum-poster-42-antique-2400.png",
    JSON.stringify(png1),
  );

  const png2 = await orderPng("png2", "desk");
  check(
    "PR18 Desk PNG x2 is a 4800px image/png, unclamped (scale carries through)",
    !!png2 && png2.type === "image/png" && png2.size > 0 && png2.width === 4800 &&
      png2.clamped === false && png2.filename === "vellum-poster-42-antique-4800.png",
    JSON.stringify(png2),
  );

  const png3 = await orderPng("png2", "grand");
  check(
    "PR19 Grand PNG x2 is budget-clamped with a visible notice (not a silent crash)",
    !!png3 && png3.type === "image/png" && png3.size > 0 && png3.clamped === true &&
      png3.scale < 2 && png3.width < 8400 && /reduced/i.test(png3.status) && /\.png$/.test(png3.filename),
    JSON.stringify(png3),
  );

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
      s = await evaluate(`(()=>{const b=window.__vellumBoundAtlas;if(!b)return null;const imgs=[...document.querySelectorAll("#pr-atlas img")];const hero=document.querySelector("#pr-atlas .hero-plate");return{seed:b.seed,title:b.title,figs:b.figures,plates:document.querySelectorAll("#pr-atlas figure:not(.banner)").length,print:!document.getElementById("pr-print").disabled,dl:!document.getElementById("pr-download").disabled,hide:!document.getElementById("pr-hide").disabled,hasAtlas:document.body.classList.contains("has-atlas"),imgs:imgs.length,loaded:imgs.length>0&&imgs.every(im=>im.complete&&im.naturalWidth>0),heroHiddenOnScreen:hero?getComputedStyle(hero).display==="none":false,heads:[...document.querySelectorAll("#pr-atlas h2")].map(h=>h.textContent),prospectPlate:[...document.querySelectorAll("#pr-atlas figcaption")].some(f=>f.textContent.startsWith("The Prospect of "))};})()`);
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

  const prospectAt = bound ? bound.heads.indexOf("The Prospect of the Capital") : -1;
  check(
    "PR20c the bound preview shelves the capital's prospect between the surveys and the banners (#412)",
    !!bound && bound.prospectPlate === true && prospectAt > bound.heads.indexOf("Regional Surveys") &&
      prospectAt >= 0 && prospectAt < bound.heads.indexOf("Banners of the Realms"),
    JSON.stringify(bound && { heads: bound.heads, prospectPlate: bound.prospectPlate }),
  );

  await shoot("print-room-bound.png");

  // e2e cannot emulate :hover, so PR20b reads the lift out of the CSSOM beside the plate's resting computed style. It is a MARKUP assertion otherwise: href, target and rel, never a click, so nothing here measures the navigation itself. Runs on screen media, before PR21 emulates print.
  const hover = await evaluate(`(()=>{
    const img=document.querySelector("#pr-atlas figure img");
    if(!img)return{img:false};
    const a=img.closest("a");
    const cs=getComputedStyle(img);
    let hoverLift=false;
    for(const ss of document.styleSheets){let rules;try{rules=ss.cssRules;}catch(e){continue;}
      if(!rules)continue;
      for(const r of rules){
        if(r.selectorText&&r.selectorText.includes(".atlas-sheet figure a img:hover")&&r.style&&r.style.transform&&r.style.transform!=="none"&&img.matches(".atlas-sheet figure a img")){hoverLift=true;}
      }
    }
    return{img:true,dur:cs.transitionDuration,prop:cs.transitionProperty,tform:cs.transform,hoverLift,
      linked:!!a,href:a?a.href.slice(0,5):null,target:a?a.target:null,rel:a?a.rel:null};
  })()`);
  check(
    "PR20b bound plates go somewhere AND carry the shared hover-lift (#368: the lift is scoped to anchored plates)",
    hover.img && hover.dur.includes("0.26s") && hover.prop.includes("transform") &&
      (hover.tform === "none" || hover.tform === "matrix(1, 0, 0, 1, 0, 0)") && hover.hoverLift === true &&
      hover.linked === true && hover.href === "blob:" && hover.target === "_blank" && hover.rel === "noopener",
    JSON.stringify(hover),
  );

  await send("Emulation.setEmulatedMedia", { media: "print" });
  const printView = await evaluate(`(()=>{const disp=(sel)=>{const el=document.querySelector(sel);return el?getComputedStyle(el).display:"absent";};const f=document.querySelector("#pr-atlas figure:not(.banner)");return{counter:disp(".counter"),preview:disp("#pr-preview"),desk:disp(".order-desk"),caption:disp("#pr-caption"),atlas:disp("#pr-atlas"),hero:disp("#pr-atlas .hero-plate"),breakAfter:f?getComputedStyle(f).breakAfter:"absent"};})()`);
  check(
    "PR21 print stylesheet hides chrome, keeps the atlas + hero, breaks one plate per page",
    printView.counter === "none" && printView.preview === "none" && printView.desk === "none" &&
      printView.caption === "none" && printView.atlas !== "none" && printView.hero !== "none" &&
      printView.breakAfter === "page",
    JSON.stringify(printView),
  );

  // The 20000-char floor is what separates a real bound atlas from the tiny PDF a blank sheet or a print-blank plate yields; paper fidelity itself stays a manual pass.
  let pdf = null;
  try { pdf = await send("Page.printToPDF", { printBackground: true }); } catch (e) { pdf = null; }
  check(
    "PR22 browser Save-as-PDF yields a well-formed, non-empty bound atlas",
    !!pdf && typeof pdf.data === "string" && pdf.data.length > 20000,
    pdf ? `${pdf.data.length} base64 chars` : "printToPDF failed",
  );
  await send("Emulation.setEmulatedMedia", { media: "" }); // back to screen for the rest

  // hasBlobUrl reads the downloaded FILE's own bytes: no blob: URL may be BAKED IN, though since #368 the file's own script creates them at load. The metadata hook is read instead of the ~20MB string.
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

  // The interleaving here is deterministic, not lucky: the Print Room shares ONE FIFO render worker with no job cancellation, so the bind posted first always settles first, ahead of the redraw queued behind it. PR27 rests on the same property.
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

  let pr27Ready = false;
  for (let i = 0; i < 160; i++) {
    let ok = null;
    try { ok = await evaluate(`(()=>{const g=document.querySelector('[data-poster="grand"]');const f=document.getElementById("pr-format");return !!document.querySelector("#pr-preview svg")&&document.getElementById("pr-status").textContent===""&&!!g&&!g.disabled&&!!f&&!f.disabled;})()`); } catch {}
    if (ok) { pr27Ready = true; break; }
    await sleep(50);
  }
  const pr27Start = await evaluate(`(()=>{document.getElementById("pr-format").value="svg";window.__vellumLastPoster=undefined;document.querySelector('[data-poster="desk"]').click();const s=document.getElementById("pr-seed");s.value="888";document.getElementById("pr-draw").click();const plates=[...document.querySelectorAll("[data-poster]")];return{platesDisabled:plates.every((b)=>b.disabled),status:document.getElementById("pr-status").textContent};})()`);
  let pr27Violated = false;
  let pr27OrderInDraw = false;
  let pr27Settled = null;
  for (let i = 0; i < 400; i++) {
    let s = null;
    try { s = await evaluate(`(()=>{const st=window.__vellumPrintRoomState();const plates=[...document.querySelectorAll("[data-poster]")];return{seed:st.seed,status:document.getElementById("pr-status").textContent,anyEnabled:plates.some((b)=>!b.disabled),orderDone:!!window.__vellumLastPoster};})()`); } catch {}
    if (s) {
      const drawing = s.status === "Pulling a proof…";
      if (drawing && s.orderDone) pr27OrderInDraw = true;
      if (drawing && s.anyEnabled) pr27Violated = true;
      if (s.seed === 888 && s.status === "" && s.anyEnabled) { pr27Settled = s; break; }
    }
    await sleep(30);
  }
  check(
    "PR27 an order finishing during a redraw keeps the counter closed until the new proof settles (reverse guard)",
    pr27Ready && pr27Start.platesDisabled === true && pr27OrderInDraw === true && pr27Violated === false && !!pr27Settled,
    JSON.stringify({ pr27Ready, pr27Start, pr27OrderInDraw, pr27Violated, pr27Settled }),
  );

  // PR6/PR7 must stay ahead of the inline-fallback block below, which 404s the worker on purpose.
  const newErrs = consoleErrors.slice(prErrBase);
  check("PR6 the print-room run logged no JS exceptions or console errors", newErrs.length === 0, newErrs.join(" | ") || "clean");
  const new4xx = http4xx.slice(prHttpBase).filter((u) => !/favicon/i.test(u));
  check("PR7 no new missing resources (no worker/engine/asset 4xx from /print-room/)", new4xx.length === 0, new4xx.join(", ") || "none");

  try {
    await send("Network.clearBrowserCache");
    await send("Network.setCacheDisabled", { cacheDisabled: true });
    serverState.blockWorker = true;
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

  // PRW/PRW2 (#137) run LAST: they navigate away from the page every check above shares.
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
