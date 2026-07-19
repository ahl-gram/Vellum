// The Daily Hunt checks (H1-H11) on the seed-of-the-day page: #56 (H1-H9),
// the #88 legend-clearance guard (H10), and the labeled-clue guard (H11).
// Split from e2e-explorer.mjs; behavior + check order unchanged.
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitSettled, waitReady, axDescription, serverState, consoleErrors, http4xx, PORT } = ctx;
  // --- H: The Daily Hunt (#56) on the seed-of-the-day page ---
  // The page seed is new Date() in UTC, so the click targets are derived from
  // the browser's OWN world via dynamic import (immune to any node-side date
  // assumption). This is the only coverage of the click -> projection-inversion
  // -> nearest-settlement snap, which can silently break if widthPx/margin/the
  // projection change while the chart still renders perfectly.
  const huntErrBase = consoleErrors.length;
  const HUNT_PAGE = `http://127.0.0.1:${PORT}/seed-of-the-day/`;
  // The hunt shares the explorer's origin, so a prior solved state could linger
  // in localStorage. Clear it here (still on the same origin) so the hunt always
  // starts unsolved and H3/H4 exercise the live miss/hit path deterministically.
  try { await evaluate(`localStorage.removeItem("vellum.hunt.v1")`); } catch {}
  await send("Page.navigate", { url: HUNT_PAGE });
  let huntReady = false;
  for (let i = 0; i < 200; i++) {
    // evaluate may land in a context destroyed by the in-flight navigation;
    // swallow that and retry (same defensive pattern as A10's post-reload poll).
    let s = null;
    try { s = await evaluate(`(()=>{const h=document.getElementById("hunt");const c=document.getElementById("clues");return{hunt:h&&!h.hidden,clues:c?c.children.length:0,map:!!document.querySelector("#map svg")};})()`); } catch {}
    if (s && s.hunt && s.clues >= 3 && s.map) { huntReady = true; break; }
    await sleep(75);
  }
  check("H1 seed-of-the-day hunt card appears with >=3 clues over a rendered map", huntReady);

  const clueText = await evaluate(`Array.from(document.getElementById("clues").children).map((li)=>li.textContent).join(" | ")`);
  check("H2 clues never disclose ruin/abandon wording", !/ruin|abandon/i.test(clueText));

  // Derive miss (capital) and hit (quarry) click fractions from the browser's
  // own world, using the same engine + projection the page used to draw.
  const tgt = await evaluate(`(async()=>{
    const {defaultRecipe,generateWorld}=await import("../explorer/engine/world/generate.js");
    const {chooseQuarry,legendExcluded}=await import("../explorer/engine/world/daily-hunt.js");
    const {createProjection}=await import("../explorer/engine/render/transform.js");
    const {seedForDate}=await import("../explorer/engine/world/seed-of-the-day.js");
    const seed=seedForDate(new Date());
    const world=generateWorld(defaultRecipe(seed));
    const proj=createProjection(world.elev.w,world.elev.h,1500,Math.round(1500*0.045));
    // mirror the page (#88): drop settlements hidden under the rendered legend,
    // so the quarry computed here matches the one the page actually placed.
    const svg=document.querySelector("#map svg");
    const leg=svg&&svg.querySelector("#layer-legend");
    const sr=svg&&svg.getBoundingClientRect();
    let exclude=new Set(),legFrac=null;
    if(leg&&sr&&sr.width&&sr.height){
      const lr=leg.getBoundingClientRect();
      legFrac={x0:(lr.left-sr.left)/sr.width,y0:(lr.top-sr.top)/sr.height,x1:(lr.right-sr.left)/sr.width,y1:(lr.bottom-sr.top)/sr.height};
      const box={x:legFrac.x0*proj.widthPx,y:legFrac.y0*proj.heightPx,width:(lr.width/sr.width)*proj.widthPx,height:(lr.height/sr.height)*proj.heightPx};
      exclude=legendExcluded(world,box,proj.widthPx);
    }
    const q=chooseQuarry(world,{exclude});
    const cap=world.settlements.find((s)=>s.kind==="capital")??world.settlements[0];
    const frac=(s)=>({fx:proj.px(s.x)/proj.widthPx,fy:proj.py(s.y)/proj.heightPx});
    return{seed,name:q.settlement.name,hit:frac(q.settlement),miss:frac(cap),legFrac,wpx:proj.widthPx,hpx:proj.heightPx};
  })()`, true);
  const clickHunt = (f) => evaluate(`(()=>{const svg=document.querySelector("#map svg");const r=svg.getBoundingClientRect();svg.dispatchEvent(new MouseEvent("click",{clientX:r.left+${f.fx}*r.width,clientY:r.top+${f.fy}*r.height,bubbles:true}));return{status:document.getElementById("hunt-status").textContent,solved:document.getElementById("map").classList.contains("solved")};})()`);

  // Warmth word -> rank, for the #94 continuous-heat checks. "" if unrecognized.
  const bandRank = (s) => (/^Hot/.test(s) ? 3 : /^Warmer/.test(s) ? 2 : /^Cool/.test(s) ? 1 : /^Cold/.test(s) ? 0 : -1);

  const miss = await clickHunt(tgt.miss);
  check(
    "H3 a miss names the town the click selected, reports warmer/colder prose, and does not solve",
    miss.status.length > 0 && !miss.solved && /nearest mark is /i.test(miss.status),
    JSON.stringify(miss),
  );

  // #129: a miss leaves a sounding over the map. It must be an OVERLAY on #map (never
  // inside the SVG, so no chart bytes move) and pointer-transparent (a lingering dot
  // must not eat the next click). Read right after the first miss, before the dot's
  // ~2.6s fade removes it.
  const snd = await evaluate(`(()=>{const d=document.querySelector("#map .sounding-dot");return{dots:document.querySelectorAll("#map .sounding-dot").length,inSvg:!!document.querySelector("#map svg .sounding-dot"),pe:d?getComputedStyle(d).pointerEvents:null};})()`);
  check(
    "H3c a miss drops a pointer-transparent sounding over the map, never inside the SVG",
    snd.dots >= 1 && !snd.inSvg && snd.pe === "none",
    JSON.stringify(snd),
  );

  // #94: heat is continuous -- a click halfway from the far capital to the quarry
  // must not read COLDER than the capital click (it is nearer the quarry).
  // The probe sits at 0.4 of the way, NOT halfway: the exact midpoint ties
  // capital vs quarry and float noise in the rect roundtrip can snap it to
  // the quarry on ~1 day in 5, silently solving and vacating H4's coverage.
  // At 0.4 the capital is strictly nearer, so this is a guaranteed miss.
  const near = { fx: tgt.miss.fx + 0.4 * (tgt.hit.fx - tgt.miss.fx), fy: tgt.miss.fy + 0.4 * (tgt.hit.fy - tgt.miss.fy) };
  const nearMiss = await clickHunt(near);
  check(
    "H3b a click nearer the quarry never reads colder than a far click (continuous heat)",
    !nearMiss.solved && bandRank(nearMiss.status) >= bandRank(miss.status) && bandRank(nearMiss.status) >= 0,
    JSON.stringify({ far: miss.status, near: nearMiss.status }),
  );

  const won = await clickHunt(tgt.hit);
  check("H4 clicking the quarry snaps to it and solves the hunt", won.solved === true && /found it/i.test(won.status), JSON.stringify(won));

  const post = await evaluate(`(()=>{const rev=document.getElementById("reveal");const star=document.querySelector("#map .hunt-star");const share=document.getElementById("share");return{reveal:rev&&!rev.hidden,revealText:rev?rev.textContent:"",star:!!star,share:share&&!share.hidden,streak:document.getElementById("streak").textContent,ls:localStorage.getItem("vellum.hunt.v1")};})()`);
  check("H5 reveal names the found place and its founding year", post.reveal && post.revealText.includes(tgt.name) && /founded in the year/i.test(post.revealText), post.revealText.slice(0, 80));
  check("H6 a win marker overlays the map and the Share button appears", post.star && post.share);
  check("H7 streak + localStorage persist, keyed on the day's seed", /Streak: 1 day/.test(post.streak) && new RegExp(`"solved":${tgt.seed},"streak":1`).test(post.ls || ""), `${post.streak} | ${post.ls}`);

  // #129: a LIVE solve plays the win ceremony. Read the WIRED animation (name + trigger
  // class) on the star and the reveal; the class persists after the run, so this is
  // stable regardless of whether the animation is still in flight.
  const wire = await evaluate(`(()=>{const s=document.querySelector("#map .hunt-star");const rev=document.getElementById("reveal");return{starStamp:!!(s&&s.classList.contains("stamp")),starAnim:s?getComputedStyle(s).animationName:null,revUnfurl:!!(rev&&rev.classList.contains("unfurl")),revAnim:rev?getComputedStyle(rev).animationName:null};})()`);
  check(
    "H6b a live solve wires the win ceremony (star stamps in, reveal unfurls)",
    wire.starStamp && wire.starAnim === "huntStarIn" && wire.revUnfurl && wire.revAnim === "paperUnfurl",
    JSON.stringify(wire),
  );

  // --- HD: The Surveyor's Dispatch (#123) -- file the hunt as a drafted survey plate ---
  // A LIVE win offers a "Draft dispatch" button that clones today's actual chart and plots
  // the guess route over it: a dotted survey line, a numbered station at each wrong sounding,
  // a star at the find, and one hand-set caption. The button is gated to the live-win path
  // (HD3 below proves the restored path never offers it). We read the dispatch through a window
  // hook rather than clicking it, so no real file download happens under CDP.
  const disp = await evaluate(`(()=>{
    const btn=document.getElementById("dispatch");
    const fn=window.__vellumDispatchSvg;
    const svg=(typeof fn==="function")?fn():"";
    return{exists:!!btn,hidden:btn?btn.hidden:true,hasFn:typeof fn==="function",svg};
  })()`);
  check(
    "HD1 a live win offers the Draft dispatch button (#123)",
    disp.exists && disp.hidden === false,
    JSON.stringify({ exists: disp.exists, hidden: disp.hidden }),
  );

  // HD2 (AC1-AC5): the dispatch is a self-contained artifact. It must (a) preserve the chart's
  // data-vellum-* recipe so it stays reproducible like every Vellum export; (b) plot one numbered
  // station per miss (2 here: the capital + the 0.4 probe); (c) caption the soundings tally in
  // period voice; (d) be inline-styled with NO page-CSS class leaking into the added group; and
  // (e) -- the AC that justifies storing GRID coordinates -- station #1 (the capital miss) must
  // land at proj.px(cap.x)/py(cap.y), which only holds if the route was re-projected at draft
  // time. If it had stored pixel or client-rect coords, re-projection would displace the station
  // by ~100-500px and this fails hard. The residual we DO allow (~2-3px) is the synthesized
  // click's clientX/Y being quantized to an integer by the browser, then amplified by the
  // sheet-to-screen scale (viewBox 1500 / displayed width ~= 1.9-2.5x); the grid round-trip
  // itself is exact. 5px comfortably covers that quantization yet stays 20x below any coord-space
  // mismatch, so the guard still bites the moment the route stops being stored in grid space.
  const d = disp.svg || "";
  const g = d.slice(d.indexOf("data-vellum-dispatch")); // scope the style/leak checks to the added <g>
  const stations = (d.match(/data-dispatch-station/g) || []).length;
  const st1 = g.match(/data-dispatch-station[^>]*?cx="([-\d.]+)"[^>]*?cy="([-\d.]+)"/);
  const cx = st1 ? parseFloat(st1[1]) : NaN;
  const cy = st1 ? parseFloat(st1[2]) : NaN;
  const gridOk = Math.abs(cx - tgt.miss.fx * tgt.wpx) < 5 && Math.abs(cy - tgt.miss.fy * tgt.hpx) < 5;
  check(
    "HD2 the dispatch clones the chart, plots the grid-projected route + star, captions the tally, inline-styled (#123)",
    disp.hasFn &&
      d.includes(`data-vellum-seed="${tgt.seed}"`) &&
      stations === 2 &&
      /<polyline[^>]*stroke:/.test(g) &&
      /data-dispatch-star/.test(g) &&
      g.includes("Quarry taken in 3 soundings") &&
      g.includes(`CHART № ${tgt.seed}`) &&
      gridOk &&
      g.includes("style=") && !g.includes("class="),
    JSON.stringify({
      hasFn: disp.hasFn,
      seedKept: d.includes(`data-vellum-seed="${tgt.seed}"`),
      stations,
      poly: /<polyline[^>]*stroke:/.test(g),
      star: /data-dispatch-star/.test(g),
      caption: g.includes("Quarry taken in 3 soundings"),
      chartNo: g.includes(`CHART № ${tgt.seed}`),
      gridOk, cx, cy, expX: tgt.miss.fx * tgt.wpx, expY: tgt.miss.fy * tgt.hpx,
      inline: g.includes("style=") && !g.includes("class="),
    }),
  );
  await shoot("hunt-seed-of-the-day.png");

  await send("Page.navigate", { url: HUNT_PAGE });
  let huntRestored = false;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try { s = await evaluate(`(()=>{const star=document.querySelector("#map .hunt-star");const solved=document.getElementById("map").classList.contains("solved");return{star:!!star,solved,ls:localStorage.getItem("vellum.hunt.v1")};})()`); } catch {}
    if (s && s.star && s.solved) { huntRestored = /"streak":1/.test(s.ls || ""); break; }
    await sleep(75);
  }
  check("H8 reload restores the solved state without inflating the streak", huntRestored);

  // #129: the WIN ceremony must not replay on a solved-day reload (the old star
  // animation did). Scoped to the win gate ONLY: the star is placed still (no .stamp)
  // and the reveal is shown but not unrolled (no .unfurl). We deliberately do NOT
  // assert the arrival ceremony is absent -- it replays on every load (the daily
  // reveal), so the coast may still be mid-draw when this reads.
  const still = await evaluate(`(()=>{const s=document.querySelector("#map .hunt-star");const rev=document.getElementById("reveal");return{star:!!s,stamp:!!(s&&s.classList.contains("stamp")),starAnim:s?getComputedStyle(s).animationName:null,revShown:!!(rev&&!rev.hidden),unfurl:!!(rev&&rev.classList.contains("unfurl")),revAnim:rev?getComputedStyle(rev).animationName:null};})()`);
  check(
    "H8b a solved-day reload is still: star + reveal restored without replaying the win ceremony",
    still.star && !still.stamp && still.starAnim === "none" && still.revShown && !still.unfurl && still.revAnim === "none",
    JSON.stringify(still),
  );

  // HD3 (#123, AC3): the restored-solve path (win(false)) has no in-memory route to plot, so it
  // must NOT offer the dispatch. Assert the button EXISTS but is hidden -- an absent button would
  // let a naive "is it hidden?" check pass vacuously and hide a real regression.
  const dispRestored = await evaluate(`(()=>{const b=document.getElementById("dispatch");return{exists:!!b,hidden:b?b.hidden:false};})()`);
  check(
    "HD3 a restored solve never offers the dispatch: button present but hidden (#123)",
    dispRestored.exists && dispRestored.hidden === true,
    JSON.stringify(dispRestored),
  );

  // --- HG: The Surveyor's Glass, Sub 6 (#167) -- the Daily Hunt takes the glass ---
  // The Hunt adopts the shared zoom controller (docs/shared/zoom-controller.js),
  // geometric-only. suite-zoom / suite-zoom-gestures prove the controller's pan/zoom
  // and REAL pinch/drag/wheel on the Explorer; the Hunt wires the IDENTICAL instance, so
  // the risk unique to this page is the guess interaction: does zoom break the guess-click
  // math, and does a drag-pan leak in as a guess? These use REAL CDP mouse input (not
  // synthetic DOM events) so d3-zoom's own click-distance handling runs exactly as a
  // finger would: a clean tap (press+release, no move) fires the click the guess listens
  // for; a moved drag makes d3 suppress the trailing click, so it never counts as a guess.
  //
  // Starts from a FRESH unsolved state (H8 left today solved): clear the store, reload.
  // Characterization, so green from the first wired run; the RED that justified the
  // controller (a drag's release-click registering as a guess) was demonstrated in dev by
  // detaching the controller, not committed. Runs before H9 so its console output is gated.
  try { await evaluate(`localStorage.removeItem("vellum.hunt.v1")`); } catch {}
  await send("Page.navigate", { url: HUNT_PAGE });
  let hgReady = false;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try { s = await evaluate(`(()=>{const h=document.getElementById("hunt");return{hunt:h&&!h.hidden,map:!!document.querySelector("#map svg"),hook:typeof window.__vellumZoomTo==="function"};})()`); } catch {}
    if (s && s.hunt && s.map && s.hook) { hgReady = true; break; }
    await sleep(75);
  }
  check("HG0 the Hunt boots with the shared zoom controller wired (__vellumZoomTo present)", hgReady);

  // Real CDP mouse primitives. A tap is press+release at ONE point (no move) -> d3 leaves
  // the trailing click alone -> the guess fires. A drag moves between press and release ->
  // d3 records a moved gesture and suppresses the click -> no guess.
  const mouseTap = async (x, y) => {
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", buttons: 1, clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", buttons: 0, clickCount: 1 });
  };
  const mouseDrag = async (x0, y0, x1, y1) => {
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: x0, y: y0, button: "left", buttons: 1, clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: Math.round((x0 + x1) / 2), y: Math.round((y0 + y1) / 2), buttons: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: x1, y: y1, buttons: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: x1, y: y1, button: "left", buttons: 0, clickCount: 1 });
  };

  // HG1 (AC1): at home the idle DOM is byte-identical (no inline transform, no clip) yet the
  // controller is attached -- .zoomable / touch-action:none is what enables pinch on touch
  // (the shared module's real-pinch is proven in suite-zoom-gestures; here we prove the
  // Hunt turns it on). Then zoomTo lands a resolved matrix on #map with the top-left origin,
  // toggles .zoomed, and getState reads it back: the same geometric mode as the Explorer.
  const hg1 = await evaluate(`(()=>{
    const vp=document.getElementById("map-viewport"),m=document.getElementById("map");
    const idle={inline:m.style.transform,matrix:getComputedStyle(m).transform,zoomed:vp.classList.contains("zoomed"),zoomable:vp.classList.contains("zoomable"),touch:getComputedStyle(vp).touchAction};
    window.__vellumZoomTo({k:3,x:-20,y:-15});
    const s=window.__vellumZoomState();const cs=getComputedStyle(m);
    return{idle,s,matrix:cs.transform,origin:cs.transformOrigin,zoomed:vp.classList.contains("zoomed")};
  })()`);
  check(
    "HG1 geometric zoom like the Explorer: idle byte-identical at home, .zoomable/touch-action on, zoomTo lands the matrix",
    hg1.idle.inline === "" && hg1.idle.matrix === "none" && hg1.idle.zoomed === false &&
      hg1.idle.zoomable === true && hg1.idle.touch === "none" &&
      hg1.matrix === "matrix(3, 0, 0, 3, -20, -15)" && hg1.origin === "0px 0px" && hg1.zoomed === true &&
      hg1.s.k === 3 && hg1.s.x === -20 && hg1.s.y === -15,
    JSON.stringify(hg1),
  );

  // Frame the quarry at k=2 (centered, clamped) and hand back its on-screen point plus the
  // viewport corner farthest from it (a guaranteed miss). getBoundingClientRect reflects the
  // live transform, so the quarry's screen point is fx/fy of the transformed svg box.
  const frameQuarry = (k) => evaluate(`(()=>{
    const vp=document.getElementById("map-viewport"),W=vp.clientWidth,H=vp.clientHeight,k=${k};
    window.__vellumZoomTo({k,x:W*(0.5-k*${tgt.hit.fx}),y:H*(0.5-k*${tgt.hit.fy})});
    const svg=document.querySelector("#map svg"),sr=svg.getBoundingClientRect(),vr=vp.getBoundingClientRect();
    const qx=Math.round(sr.left+${tgt.hit.fx}*sr.width), qy=Math.round(sr.top+${tgt.hit.fy}*sr.height);
    let mx=0,my=0,bd=-1;
    for(const fx of [0.12,0.88]) for(const fy of [0.12,0.88]){
      const cx=vr.left+fx*vr.width, cy=vr.top+fy*vr.height, d=Math.hypot(cx-qx,cy-qy);
      if(d>bd){bd=d;mx=Math.round(cx);my=Math.round(cy);}
    }
    return{qx,qy,mx,my,cx:Math.round(vr.left+vr.width/2),cy:Math.round(vr.top+vr.height/2),state:window.__vellumZoomState()};
  })()`);

  await evaluate(`document.getElementById("map-viewport").scrollIntoView({block:"center"})`);
  await sleep(60);
  const fr = await frameQuarry(2);

  // HG2 (AC2): a MISS tap while zoomed drops a sounding at the tapped spot. The sounding is a
  // %-positioned overlay on #map, so it rides the transform and lands under the finger; it
  // must be over #map (never inside the SVG, so no chart bytes move) and must not solve.
  await mouseTap(fr.mx, fr.my);
  await sleep(80);
  const hg2 = await evaluate(`(()=>{const d=document.querySelector("#map .sounding-dot");return{dots:document.querySelectorAll("#map .sounding-dot").length,inSvg:!!document.querySelector("#map svg .sounding-dot"),solved:document.getElementById("map").classList.contains("solved"),status:document.getElementById("hunt-status").textContent};})()`);
  check(
    "HG2 a miss tap while zoomed drops a sounding at the tapped spot over #map, and does not solve (AC2)",
    hg2.dots >= 1 && !hg2.inSvg && !hg2.solved && hg2.status.length > 0,
    JSON.stringify(hg2),
  );

  // HG3 (AC2): a drag-pan never counts as a guess. Snapshot the hunt, drag across the sheet
  // (a moved gesture -> d3 suppresses the trailing click), and confirm nothing changed: still
  // unsolved, the warmth line is untouched, and no NEW sounding dropped (a leaked click would
  // have registered a miss and done all three). This is the tap-vs-pan disambiguation.
  const before = await evaluate(`(()=>({solved:document.getElementById("map").classList.contains("solved"),status:document.getElementById("hunt-status").textContent,dots:document.querySelectorAll("#map .sounding-dot").length}))()`);
  await mouseDrag(fr.cx, fr.cy, fr.cx + 150, fr.cy + 95);
  await sleep(100);
  const after = await evaluate(`(()=>({solved:document.getElementById("map").classList.contains("solved"),status:document.getElementById("hunt-status").textContent,dots:document.querySelectorAll("#map .sounding-dot").length}))()`);
  check(
    "HG3 a drag-pan while zoomed never registers as a guess (AC2: not solved, warmth + soundings unchanged)",
    after.solved === false && after.status === before.status && after.dots === before.dots,
    JSON.stringify({ before, after }),
  );

  // HG4 (AC2): a clean tap on the quarry resolves the guess at zoom. Re-frame (the drag panned
  // the quarry off-centre), then tap its on-screen point: the guess-click math is ratio-based
  // against getBoundingClientRect (which reflects the transform), so it snaps to the quarry and
  // solves exactly as it would at k=1 -- proving the synthesized tap at the transformed screen
  // position lands true. This is the counterpart to HG3: a real tap DOES count.
  const fr2 = await frameQuarry(2);
  await mouseTap(fr2.qx, fr2.qy);
  await sleep(120);
  const hg4 = await evaluate(`(()=>({solved:document.getElementById("map").classList.contains("solved"),status:document.getElementById("hunt-status").textContent,star:!!document.querySelector("#map .hunt-star")}))()`);
  check(
    "HG4 a guess tap resolves to the correct settlement while zoomed (AC2: solves at k=2 via a real tap)",
    hg4.solved === true && /found it/i.test(hg4.status) && hg4.star === true,
    JSON.stringify({ hg4, state: fr2.state }),
  );
  await shoot("hunt-seed-of-the-day-zoomed.png"); // manual: the win star pinned true on the magnified sheet
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`); // leave the map home for the checks that follow

  check("H9 the hunt run logged no JS exceptions or console errors", consoleErrors.length === huntErrBase, consoleErrors.slice(huntErrBase).join(" | ") || "clean");

  // #88: the quarry must not be picked beneath the legend card. legFrac is the
  // legend's measured box as viewport fractions; the chosen hit must fall clear
  // of it (and a legend must actually have been drawn to make this meaningful).
  const hitInLegend =
    !!tgt.legFrac &&
    tgt.hit.fx >= tgt.legFrac.x0 && tgt.hit.fx <= tgt.legFrac.x1 &&
    tgt.hit.fy >= tgt.legFrac.y0 && tgt.hit.fy <= tgt.legFrac.y1;
  check("H10 the day's quarry sits clear of the rendered legend", !!tgt.legFrac && !hitInLegend, JSON.stringify({ leg: tgt.legFrac, hit: tgt.hit }));

  // A displayed river/lake clue must name a feature the chart actually LABELED.
  // Pre-fix, buildClues cited the nearest NAMED river even when the renderer
  // skipped its label (short course / collision loser, feature-labels.ts), so
  // the clue sent the player after a name printed nowhere on the map. Extract
  // each feature name from the two stable clue phrasings and assert it appears
  // as a ">Name<" label node in the rendered SVG. Vacuous on days with no such
  // clue; bites the moment the prune (pruneUnlabeledFeatureClues) regresses.
  const labelCheck = await evaluate(`(()=>{
    const svg=document.querySelector("#map svg");
    const html=svg?svg.outerHTML:"";
    const lis=Array.from(document.getElementById("clues").children).map((li)=>li.textContent);
    const names=[];
    for(const t of lis){
      let m=t.match(/within sight of the river (.+)\\.$/);
      if(m){names.push(m[1]);continue;}
      m=t.match(/takes in the waters of (.+)\\.$/);
      if(m){names.push(m[1]);}
    }
    const missing=names.filter((n)=>!html.includes(">"+n+"<"));
    return{count:names.length,missing};
  })()`);
  check("H11 every displayed river/lake clue names a feature the chart labeled", labelCheck.missing.length === 0, JSON.stringify(labelCheck));
}
