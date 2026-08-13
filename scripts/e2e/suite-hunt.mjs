// Daily Hunt e2e (H1-H12, HD, HG) on the seed-of-the-day page; split from e2e-explorer.mjs, behavior and check order unchanged.
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitSettled, waitReady, axDescription, serverState, consoleErrors, http4xx, PORT } = ctx;
  // Click targets are derived from the browser's OWN world via dynamic import, immune to any node-side date assumption; this is the only coverage of the click -> projection-inversion -> nearest-settlement snap.
  const huntErrBase = consoleErrors.length;
  const HUNT_PAGE = `http://127.0.0.1:${PORT}/seed-of-the-day/`;
  try { await evaluate(`localStorage.removeItem("vellum.hunt.v1")`); } catch {}
  await send("Page.navigate", { url: HUNT_PAGE });
  let huntReady = false;
  for (let i = 0; i < 200; i++) {
    // evaluate can land in a context destroyed by the in-flight navigation; swallow and retry.
    let s = null;
    try { s = await evaluate(`(()=>{const h=document.getElementById("hunt");const c=document.getElementById("clues");return{hunt:h&&!h.hidden,clues:c?c.children.length:0,map:!!document.querySelector("#map svg")};})()`); } catch {}
    if (s && s.hunt && s.clues >= 3 && s.map) { huntReady = true; break; }
    await sleep(75);
  }
  check("H1 seed-of-the-day hunt card appears with >=3 clues over a rendered map", huntReady);

  const clueText = await evaluate(`Array.from(document.getElementById("clues").children).map((li)=>li.textContent).join(" | ")`);
  check("H2 clues never disclose ruin/abandon wording", !/ruin|abandon/i.test(clueText));

  const tgt = await evaluate(`(async()=>{
    const {defaultRecipe,generateWorld}=await import("../explorer/engine/world/generate.js");
    const {chooseQuarry,legendExcluded}=await import("../explorer/engine/world/daily-hunt.js");
    const {createProjection}=await import("../explorer/engine/render/transform.js");
    const {seedForDate}=await import("../explorer/engine/world/seed-of-the-day.js");
    const seed=seedForDate(new Date());
    const world=generateWorld(defaultRecipe(seed));
    const proj=createProjection(world.elev.w,world.elev.h,1500,Math.round(1500*0.045));
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
    return{seed,name:q.settlement.name,hit:frac(q.settlement),miss:frac(cap),missName:cap.name,legFrac,wpx:proj.widthPx,hpx:proj.heightPx,scale:proj.scale};
  })()`, true);
  const clickHunt = (f) => evaluate(`(()=>{const svg=document.querySelector("#map svg");const r=svg.getBoundingClientRect();svg.dispatchEvent(new MouseEvent("click",{clientX:r.left+${f.fx}*r.width,clientY:r.top+${f.fy}*r.height,bubbles:true}));return{status:document.getElementById("hunt-status").textContent,solved:document.getElementById("map").classList.contains("solved")};})()`);

  const bandRank = (s) => (/^Hot/.test(s) ? 3 : /^Warmer/.test(s) ? 2 : /^Cool/.test(s) ? 1 : /^Cold/.test(s) ? 0 : -1);

  const miss = await clickHunt(tgt.miss);
  check(
    "H3 a miss anchors the selected town to the click, reports warmer/colder prose, and does not solve (#327)",
    miss.status.length > 0 && !miss.solved && /You mark /.test(miss.status) &&
      !/warmest sounding/.test(miss.status),
    JSON.stringify(miss),
  );

  const snd = await evaluate(`(()=>{const d=document.querySelector("#map .sounding-dot");return{dots:document.querySelectorAll("#map .sounding-dot").length,inSvg:!!document.querySelector("#map svg .sounding-dot"),pe:d?getComputedStyle(d).pointerEvents:null};})()`);
  check(
    "H3c a miss drops a pointer-transparent sounding over the map, never inside the SVG",
    snd.dots >= 1 && !snd.inSvg && snd.pe === "none",
    JSON.stringify(snd),
  );

  // The probe sits at 0.4 of the way, NOT halfway: the exact midpoint ties capital vs quarry and float noise in the rect roundtrip can snap it to the quarry (~1 day in 5), silently solving and vacating H4's coverage.
  const near = { fx: tgt.miss.fx + 0.4 * (tgt.hit.fx - tgt.miss.fx), fy: tgt.miss.fy + 0.4 * (tgt.hit.fy - tgt.miss.fy) };
  const nearMiss = await clickHunt(near);
  check(
    "H3b a click nearer the quarry never reads colder than a far click, and a new warmest stays silent (#327)",
    !nearMiss.solved && bandRank(nearMiss.status) >= bandRank(miss.status) && bandRank(nearMiss.status) >= 0 &&
      !/warmest sounding/.test(nearMiss.status),
    JSON.stringify({ far: miss.status, near: nearMiss.status }),
  );

  const warmName = (nearMiss.status.match(/You mark ([^.]+)\./) || [])[1] || "";
  const again = await clickHunt(tgt.miss);
  const wantTrail = warmName !== "" && warmName !== tgt.missName;
  check(
    "H3d a colder miss cites the warmest sounding by name, silent on a same-town repeat (#327)",
    !again.solved &&
      again.status.includes(`You mark ${tgt.missName}.`) &&
      (wantTrail
        ? again.status.includes(`Your warmest sounding yet fell at ${warmName}.`)
        : !/warmest sounding/.test(again.status)),
    JSON.stringify({ again: again.status, warmName, missName: tgt.missName }),
  );

  const won = await clickHunt(tgt.hit);
  check("H4 clicking the quarry snaps to it and solves the hunt", won.solved === true && /found it/i.test(won.status), JSON.stringify(won));

  const post = await evaluate(`(()=>{const rev=document.getElementById("reveal");const star=document.querySelector("#map .hunt-star");const share=document.getElementById("share");return{reveal:rev&&!rev.hidden,revealText:rev?rev.textContent:"",star:!!star,share:share&&!share.hidden,streak:document.getElementById("streak").textContent,ls:localStorage.getItem("vellum.hunt.v1")};})()`);
  check("H5 reveal names the found place and its founding year", post.reveal && post.revealText.includes(tgt.name) && /founded in the year/i.test(post.revealText), post.revealText.slice(0, 80));
  check("H6 a win marker overlays the map and the Share button appears", post.star && post.share);
  check("H7 streak + localStorage persist, keyed on the day's seed", /Streak: 1 day/.test(post.streak) && new RegExp(`"solved":${tgt.seed},"streak":1`).test(post.ls || ""), `${post.streak} | ${post.ls}`);

  const wire = await evaluate(`(()=>{const s=document.querySelector("#map .hunt-star");const rev=document.getElementById("reveal");return{starStamp:!!(s&&s.classList.contains("stamp")),starAnim:s?getComputedStyle(s).animationName:null,revUnfurl:!!(rev&&rev.classList.contains("unfurl")),revAnim:rev?getComputedStyle(rev).animationName:null};})()`);
  check(
    "H6b a live solve wires the win ceremony (star stamps in, reveal unfurls)",
    wire.starStamp && wire.starAnim === "huntStarIn" && wire.revUnfurl && wire.revAnim === "paperUnfurl",
    JSON.stringify(wire),
  );

  // The dispatch is read through the window hook rather than clicking the button, so no real file download happens under CDP.
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

  // The 5px station tolerance covers the synthesized click's integer clientX/Y quantization amplified by the sheet-to-screen scale (~2-3px measured), yet stays 20x below any grid-vs-pixel coord-space mismatch.
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
      stations === 3 &&
      /<polyline[^>]*stroke:/.test(g) &&
      /data-dispatch-star/.test(g) &&
      g.includes("Quarry taken in 4 soundings") &&
      g.includes(`CHART № ${tgt.seed}`) &&
      gridOk &&
      g.includes("style=") && !g.includes("class="),
    JSON.stringify({
      hasFn: disp.hasFn,
      seedKept: d.includes(`data-vellum-seed="${tgt.seed}"`),
      stations,
      poly: /<polyline[^>]*stroke:/.test(g),
      star: /data-dispatch-star/.test(g),
      caption: g.includes("Quarry taken in 4 soundings"),
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

  const still = await evaluate(`(()=>{const s=document.querySelector("#map .hunt-star");const rev=document.getElementById("reveal");return{star:!!s,stamp:!!(s&&s.classList.contains("stamp")),starAnim:s?getComputedStyle(s).animationName:null,revShown:!!(rev&&!rev.hidden),unfurl:!!(rev&&rev.classList.contains("unfurl")),revAnim:rev?getComputedStyle(rev).animationName:null};})()`);
  check(
    "H8b a solved-day reload is still: star + reveal restored without replaying the win ceremony",
    still.star && !still.stamp && still.starAnim === "none" && still.revShown && !still.unfurl && still.revAnim === "none",
    JSON.stringify(still),
  );

  const dispRestored = await evaluate(`(()=>{const b=document.getElementById("dispatch");return{exists:!!b,hidden:b?b.hidden:false};})()`);
  check(
    "HD3 a restored solve never offers the dispatch: button present but hidden (#123)",
    dispRestored.exists && dispRestored.hidden === true,
    JSON.stringify(dispRestored),
  );

  // HG uses REAL CDP mouse input so d3-zoom's own click-distance handling runs: a clean tap (no move) fires the guess click, a moved drag suppresses the trailing click.
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

  // The MISS tap frames the CAPITAL, never a viewport corner: classifyClick snaps to the nearest settlement with no distance cap, and the old farthest-corner scan was a per-day lottery that solved the hunt on linux CI (#304). Do not bring it back.
  const framePoint = (k, fx, fy) => evaluate(`(()=>{
    const vp=document.getElementById("map-viewport"),W=vp.clientWidth,H=vp.clientHeight,k=${k};
    window.__vellumZoomTo({k,x:W*(0.5-k*${fx}),y:H*(0.5-k*${fy})});
    const svg=document.querySelector("#map svg"),sr=svg.getBoundingClientRect(),vr=vp.getBoundingClientRect();
    return{px:Math.round(sr.left+${fx}*sr.width),py:Math.round(sr.top+${fy}*sr.height),
      cx:Math.round(vr.left+vr.width/2),cy:Math.round(vr.top+vr.height/2),state:window.__vellumZoomState()};
  })()`);

  await evaluate(`document.getElementById("map-viewport").scrollIntoView({block:"center"})`);
  await sleep(60);
  const fr = await framePoint(2, tgt.miss.fx, tgt.miss.fy);

  await mouseTap(fr.px, fr.py);
  await sleep(80);
  const hg2 = await evaluate(`(()=>{const d=document.querySelector("#map .sounding-dot");return{dots:document.querySelectorAll("#map .sounding-dot").length,inSvg:!!document.querySelector("#map svg .sounding-dot"),solved:document.getElementById("map").classList.contains("solved"),status:document.getElementById("hunt-status").textContent};})()`);
  check(
    "HG2 a miss tap while zoomed drops a sounding at the tapped spot over #map, and does not solve (AC2)",
    hg2.dots >= 1 && !hg2.inSvg && !hg2.solved && hg2.status.length > 0,
    JSON.stringify(hg2),
  );

  const before = await evaluate(`(()=>({solved:document.getElementById("map").classList.contains("solved"),status:document.getElementById("hunt-status").textContent,dots:document.querySelectorAll("#map .sounding-dot").length}))()`);
  await mouseDrag(fr.cx, fr.cy, fr.cx + 150, fr.cy + 95);
  await sleep(100);
  const after = await evaluate(`(()=>({solved:document.getElementById("map").classList.contains("solved"),status:document.getElementById("hunt-status").textContent,dots:document.querySelectorAll("#map .sounding-dot").length}))()`);
  check(
    "HG3 a drag-pan while zoomed never registers as a guess (AC2: not solved, warmth + soundings unchanged)",
    after.solved === false && after.status === before.status && after.dots === before.dots,
    JSON.stringify({ before, after }),
  );

  const fr2 = await framePoint(2, tgt.hit.fx, tgt.hit.fy);
  await mouseTap(fr2.px, fr2.py);
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

  const hitInLegend =
    !!tgt.legFrac &&
    tgt.hit.fx >= tgt.legFrac.x0 && tgt.hit.fx <= tgt.legFrac.x1 &&
    tgt.hit.fy >= tgt.legFrac.y0 && tgt.hit.fy <= tgt.legFrac.y1;
  check("H10 the day's quarry sits clear of the rendered legend", !!tgt.legFrac && !hitInLegend, JSON.stringify({ leg: tgt.legFrac, hit: tgt.hit }));

  // Capital/seat labels render .toUpperCase() (settlementsLayer), so the name check accepts either spelling; vacuous on days with no river/lake/near clue.
  const labelCheck = await evaluate(`(()=>{
    const svg=document.querySelector("#map svg");
    const html=svg?svg.outerHTML:"";
    const lis=Array.from(document.getElementById("clues").children).map((li)=>li.textContent);
    const names=[];
    for(const t of lis){
      let m=t.match(/within sight of the river (.+)\\.$/);
      if(m){names.push(m[1]);continue;}
      m=t.match(/takes in the waters of (.+)\\.$/);
      if(m){names.push(m[1]);continue;}
      m=t.match(/within \\d+ leagues of (.+)\\.$/);
      if(m){names.push(m[1]);}
    }
    const missing=names.filter((n)=>!html.includes(">"+n+"<")&&!html.includes(">"+n.toUpperCase()+"<"));
    return{count:names.length,missing};
  })()`);
  check("H11 every displayed river/lake/near clue names something the chart labeled", labelCheck.missing.length === 0, JSON.stringify(labelCheck));

  const terrainCheck = await evaluate(`(()=>{
    const TEXTS={
      "It sits in the shadow of the mountains.":"gl-mtn",
      "Hill country rises all about it.":"gl-hill",
      "Deep woods stand close about it.":"gl-tree",
      "Marshland lies hard by its bounds.":"gl-marsh",
      "Desert sands lie hard by its bounds.":"gl-dune"};
    const svg=document.querySelector("#map svg");
    if(!svg)return{count:0,missing:["no svg"]};
    const lis=Array.from(document.getElementById("clues").children).map((li)=>li.textContent);
    const bands=lis.filter((t)=>TEXTS[t]).map((t)=>TEXTS[t]);
    if(bands.length===0)return{count:0,missing:[]};
    const qx=${tgt.hit.fx}*${tgt.wpx};
    const qy=${tgt.hit.fy}*${tgt.hpx};
    const radius=4*${tgt.scale};
    const uses=Array.from(svg.querySelectorAll("#layer-glyphs use")).map((u)=>{
      const m=/translate\\((-?[\\d.]+) (-?[\\d.]+)\\)/.exec(u.getAttribute("transform")||"");
      return m?{href:u.getAttribute("href")||"",x:+m[1],y:+m[2]}:null;
    }).filter(Boolean);
    const missing=bands.filter((p)=>!uses.some((u)=>u.href.startsWith("#"+p)&&Math.hypot(u.x-qx,u.y-qy)<=radius));
    return{count:bands.length,missing};
  })()`);
  check("H12 every displayed terrain clue has its glyphs drawn near the quarry", terrainCheck.missing.length === 0, JSON.stringify(terrainCheck));
}
