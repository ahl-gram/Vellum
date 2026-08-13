// Surveyor's Glass e2e (Z): pan/zoom on the Explorer chart via the shared d3-zoom controller, plus the settle-to-region redraft (Z17+).
// Resolved matrices are asserted on purpose: getComputedStyle returns "none" for a rejected value, so the assertion doubles as proof the px-suffixed transform is valid CSS (d3's own toString() is not).
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitSettled, waitReady, waitTurned, PORT } = ctx;

  // Fixed sleeps only outlasted the #300 deferred ink because a CDP evaluate sent mid-build queues behind the blocked main thread; wait for the ink itself.
  const waitInked = async (label) => {
    for (let i = 0; i < 120; i++) {
      if (await evaluate(`!!document.querySelector("#map .voyage-overlay .voyage-track")`)) return;
      await sleep(50);
    }
    throw new Error("waitInked timeout " + label);
  };

  await evaluate(`(()=>{for(const id of ["ages"]){const c=document.getElementById(id);if(c.checked){c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));}}document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("draw").click();})()`);
  await waitSettled("zoom-base");
  // #169: the semantic redraft is OFF for the geometric block (Z1-Z16) and back ON for Z17+; a fresh page defaults it ON, so re-set it after every reload.
  await evaluate(`window.__vellumSetRedraftEnabled(false)`);
  await shoot("explorer-zoom-k1.png"); // home: the arrival ceremony + drop shadow overflow the frame, exactly as today

  const z1 = await evaluate(`(()=>{window.__vellumZoomTo({k:3,x:-20,y:-15});const s=window.__vellumZoomState();const m=document.getElementById("map");const cs=getComputedStyle(m);return{s,matrix:cs.transform,origin:cs.transformOrigin,zoomed:document.getElementById("map-viewport").classList.contains("zoomed")};})()`);
  check(
    "Z1 zoomTo lands the expected transform on #map (matrix + top-left origin, .zoomed, getState reads it)",
    z1.matrix === "matrix(3, 0, 0, 3, -20, -15)" && z1.origin === "0px 0px" &&
      z1.s.k === 3 && z1.s.x === -20 && z1.s.y === -15 && z1.zoomed === true,
    JSON.stringify(z1),
  );

  const z2 = await evaluate(`(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:99,x:-99999,y:-99999});const s=window.__vellumZoomState();return{s,ex:-(7*W),ey:-(7*H),W,H};})()`);
  check(
    "Z2 clamps at the max extent (k->8, pan pinned to the far edge so the sheet still covers the viewport)",
    z2.s.k === 8 && Math.abs(z2.s.x - z2.ex) < 0.5 && Math.abs(z2.s.y - z2.ey) < 0.5,
    JSON.stringify(z2),
  );
  await shoot("explorer-zoom-k8.png"); // max magnify (blurrier is expected here; the semantic redraft is Sub 8)

  await evaluate(`(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:4,x:-(3*W)/2,y:-(3*H)/2});})()`);
  await shoot("explorer-zoom-k4.png");

  const z3 = await evaluate(`(()=>{window.__vellumZoomTo({k:0.1,x:500,y:500});const s=window.__vellumZoomState();const m=document.getElementById("map");return{s,matrix:getComputedStyle(m).transform,inline:m.style.transform,zoomed:document.getElementById("map-viewport").classList.contains("zoomed")};})()`);
  check(
    "Z3 clamps at the min extent (k->1, pan->home; idle DOM restored: transform none, no .zoomed)",
    z3.s.k === 1 && z3.s.x === 0 && z3.s.y === 0 && z3.matrix === "none" && z3.inline === "" && z3.zoomed === false,
    JSON.stringify(z3),
  );

  const z4 = await evaluate(`(()=>{window.__vellumZoomTo({k:2,x:-10,y:-10});const a=window.__vellumZoomState();window.__vellumZoomTo(a);const b=window.__vellumZoomState();return{a,b};})()`);
  check(
    "Z4 getState round-trips an in-bounds transform (k=2, x=-10, y=-10)",
    z4.a.k === 2 && z4.a.x === -10 && z4.a.y === -10 && z4.b.k === z4.a.k && z4.b.x === z4.a.x && z4.b.y === z4.a.y,
    JSON.stringify(z4),
  );

  const z6 = await evaluate(`(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:2,x:-W/2,y:-H/2});const vr=vp.getBoundingClientRect();const cx=vr.left+vr.width/2,cy=vr.top+vr.height/2;const hits=[...document.querySelectorAll("#map .place-hit")];let best=null,bd=Infinity;for(const h of hits){const r=h.getBoundingClientRect();if(r.width===0)continue;const d=Math.hypot(r.left+r.width/2-cx,r.top+r.height/2-cy);if(d<bd){bd=d;best=h;}}if(!best)return{ok:false};best.click();const card=document.getElementById("place-card");const m=document.getElementById("map");return{ok:true,shown:!card.hidden,pinned:card.classList.contains("pinned"),scaled:getComputedStyle(m).transform.startsWith("matrix(2, 0, 0, 2,")};})()`);
  check(
    "Z6 a card pinned while zoomed shows over the scaled chart (AC2: pinned card rides its mark)",
    z6.ok && z6.shown && z6.pinned && z6.scaled,
    JSON.stringify(z6),
  );
  await sleep(700); // let the pinned unfurl (--unfurl 650ms) settle
  await shoot("explorer-zoom-card.png"); // manual: card anchored to its mark at 2x (edge unfurls clip)
  await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))`); // dismiss the pin

  const z8 = await evaluate(`(()=>{
    const vp=document.getElementById("map-viewport");
    window.__vellumZoomTo({k:1,x:0,y:0});
    const vr=vp.getBoundingClientRect();const cx=vr.left+vr.width/2,cy=vr.top+vr.height/2;
    const hits=[...document.querySelectorAll("#map .place-hit")];
    let best=null,bd=Infinity;for(const h of hits){const r=h.getBoundingClientRect();if(r.width===0)continue;const d=Math.hypot(r.left+r.width/2-cx,r.top+r.height/2-cy);if(d<bd){bd=d;best=h;}}
    if(!best)return{ok:false};
    const br=best.getBoundingClientRect();
    const px=br.left+br.width/2-vr.left, py=br.top+br.height/2-vr.top; // the place's local coords at k=1
    best.click();
    const card=document.getElementById("place-card");
    const m=document.getElementById("map");
    const w1=card.getBoundingClientRect().width;
    const cardK1=card.style.getPropertyValue("--zoom-k"); // the card's own inline var at home
    const W=vp.clientWidth,H=vp.clientHeight;
    window.__vellumZoomTo({k:8,x:W/2-8*px,y:H/2-8*py}); // centre the pinned place so its card is in view
    const w8=card.getBoundingClientRect().width;
    const cardK8=card.style.getPropertyValue("--zoom-k"); // published on the CARD, so it counter-scales
    const mapK8=getComputedStyle(m).getPropertyValue("--zoom-k").trim(); // MUST stay empty on #map (else labels jiggle)
    return{ok:true,w1,w8,cardK1,cardK8,mapK8};
  })()`);
  check(
    "Z8 a pinned card stays a constant screen size while zoomed, and --zoom-k rides the card not #map (no label jiggle)",
    z8.ok && Math.abs(z8.w8 - z8.w1) <= 2 && z8.cardK8 === "8" && z8.cardK1 === "" && z8.mapK8 === "",
    JSON.stringify(z8),
  );
  await sleep(700); // let the pinned unfurl (--unfurl 650ms) settle before the shot
  await shoot("explorer-zoom-card-k8.png"); // the constant-size card at max zoom (cf. the ballooned before)
  await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))`); // dismiss the pin

  const z8b = await evaluate(`(()=>{
    const vp=document.getElementById("map-viewport");
    window.__vellumZoomTo({k:1,x:0,y:0});
    const vr=vp.getBoundingClientRect();const cx=vr.left+vr.width/2,cy=vr.top+vr.height/2;
    const hits=[...document.querySelectorAll("#map .place-hit")];
    let best=null,bd=Infinity;for(const h of hits){const r=h.getBoundingClientRect();if(r.width===0)continue;const d=Math.hypot(r.left+r.width/2-cx,r.top+r.height/2-cy);if(d<bd){bd=d;best=h;}}
    if(!best)return{ok:false};
    const br=best.getBoundingClientRect();
    const px=br.left+br.width/2-vr.left, py=br.top+br.height/2-vr.top;
    const W=vp.clientWidth,H=vp.clientHeight;
    window.__vellumZoomTo({k:4,x:W/2-4*px,y:H/2-4*py});
    const r4=best.getBoundingClientRect();
    const overlay=document.querySelector("#map .place-overlay");
    return{ok:true,x:Math.round(r4.left+r4.width/2),y:Math.round(r4.top+r4.height/2),hitW:r4.width,
      overlayK:overlay?overlay.style.getPropertyValue("--zoom-k"):null,
      mapK:getComputedStyle(document.getElementById("map")).getPropertyValue("--zoom-k").trim()};
  })()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: z8b.x ?? 0, y: z8b.y ?? 0 });
  await sleep(400); // the ring's --paper-quick grow-in settles
  const z8bRing = await evaluate(`(()=>{
    const h=document.querySelector("#map .place-hit:hover");
    if(!h)return{hover:false};
    const s=getComputedStyle(h,"::after");
    return{hover:true,t:s.transform,o:s.opacity};
  })()`);
  const z8bScale = parseFloat(((z8bRing.t || "").match(/matrix\(([-\d.]+)/) || [])[1] ?? "NaN");
  check(
    "Z8b a hovered hit holds its designed ~26px box at zoom, ring pseudo at scale(1), var on the overlay never #map (#331)",
    z8b.ok && z8bRing.hover && Math.abs(z8bScale - 1) <= 0.02 && parseFloat(z8bRing.o) === 1 &&
      z8b.overlayK === "4" && z8b.mapK === "" && Math.abs(z8b.hitW - 26) <= 1,
    JSON.stringify({ z8b, z8bRing, z8bScale }),
  );
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5 }); // park the pointer off the map
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);

  const z9 = await evaluate(`(async()=>{
    const vp=document.getElementById("map-viewport");
    window.__vellumZoomTo({k:1,x:0,y:0});
    vp.focus();
    const key=(k)=>vp.dispatchEvent(new KeyboardEvent("keydown",{key:k,bubbles:true}));
    const st=()=>window.__vellumZoomState();
    const settleK=async(t)=>{for(let i=0;i<100;i++){if(Math.abs(st().k-t)<1e-6)return st().k;await new Promise(r=>setTimeout(r,40));}return st().k;};
    key("+"); key("+"); const afterIn=await settleK(1.96);
    key("-"); const afterOut=await settleK(1.4);
    const beforePanX=st().x;
    key("ArrowRight"); const afterPanX=st().x;
    key("0");
    for(let i=0;i<100;i++){const s=st();if(s.k===1&&s.x===0&&s.y===0)break;await new Promise(r=>setTimeout(r,40));}
    const home=st();
    return {afterIn,afterOut,beforePanX,afterPanX,home};
  })()`, true);
  check(
    "Z9 keyboard-only reaches full zoom: +/- magnify (glide waited out, #170), arrows pan instantly, 0 homes (AC2 a11y)",
    Math.abs(z9.afterIn - 1.96) < 1e-6 && Math.abs(z9.afterOut - 1.4) < 1e-6 &&
      z9.afterPanX < z9.beforePanX && z9.home.k === 1 && z9.home.x === 0 && z9.home.y === 0,
    JSON.stringify(z9),
  );

  const z10 = await evaluate(`(async()=>{
    const st=()=>window.__vellumZoomState();
    const settleK=async(t)=>{for(let i=0;i<100;i++){if(Math.abs(st().k-t)<1e-6)return st().k;await new Promise(r=>setTimeout(r,40));}return st().k;};
    window.__vellumZoomTo({k:1,x:0,y:0});
    document.getElementById("zoom-in").click(); const inK=await settleK(1.4);
    document.getElementById("zoom-in").click(); const in2=await settleK(1.96);
    document.getElementById("zoom-out").click(); const outK=await settleK(1.4);
    document.getElementById("zoom-reset").click();
    for(let i=0;i<100;i++){const s=st();if(s.k===1&&s.x===0&&s.y===0)break;await new Promise(r=>setTimeout(r,40));}
    const home=st();
    return {inK,in2,outK,home};
  })()`, true);
  check(
    "Z10 the on-screen +/reset/- buttons drive the zoom (voiced + gliding, settled values asserted, #170)",
    Math.abs(z10.inK - 1.4) < 1e-6 && Math.abs(z10.in2 - 1.96) < 1e-6 &&
      Math.abs(z10.outK - 1.4) < 1e-6 && z10.home.k === 1,
    JSON.stringify(z10),
  );

  await evaluate(`(()=>{window.__vellumZoomTo({k:1,x:0,y:0});document.getElementById("zoom-in").dispatchEvent(new MouseEvent("dblclick",{bubbles:true,cancelable:true,view:window}));})()`);
  await sleep(350); // let any leaked d3 dblclick-zoom animation finish
  const z10b = await evaluate(`window.__vellumZoomState()`);
  check(
    "Z10b a double-click on a zoom button does not leak into d3's dblclick-zoom (no lurch/pan)",
    z10b.k === 1 && z10b.x === 0 && z10b.y === 0,
    JSON.stringify(z10b),
  );

  for (const style of ["topographic", "ink", "nautical"]) {
    await evaluate(`(()=>{window.__vellumZoomTo({k:1,x:0,y:0});const s=document.getElementById("style");s.value=${JSON.stringify(style)};s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitTurned("zoom-style-" + style);
    const zs = await evaluate(`(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:3,x:-W,y:-H});const m=document.getElementById("map");return{matrix:getComputedStyle(m).transform,zoomed:vp.classList.contains("zoomed"),touch:getComputedStyle(vp).touchAction,hits:document.querySelectorAll("#map .place-hit").length};})()`);
    check(
      "Z11 " + style + " pans/zooms identically (AC1: matrix lands, .zoomed, touch-action:none, marks present)",
      zs.matrix.startsWith("matrix(3, 0, 0, 3,") && zs.zoomed === true && zs.touch === "none" && zs.hits > 0,
      style + " " + JSON.stringify(zs),
    );
    if (style === "topographic") await shoot("explorer-zoom-topographic-k3.png");
  }
  await evaluate(`(()=>{window.__vellumZoomTo({k:1,x:0,y:0});const s=document.getElementById("style");s.value="antique";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitTurned("zoom-styles-restore-antique");

  await evaluate(`(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:2,x:-0.2*W,y:-0.3*H});})()`);
  await sleep(400); // > the 250ms settle debounce, so onSettle has written the hash
  const z12 = await evaluate(`(()=>{const p=new URLSearchParams(location.hash.slice(1));return{cx:p.get("cx"),cy:p.get("cy"),k:p.get("k")};})()`);
  check(
    "Z12 a settled zoom writes cx/cy/k to the hash (AC3 write: uv centre + zoom, 4dp)",
    z12.cx === "0.3500" && z12.cy === "0.4000" && z12.k === "2.0000",
    JSON.stringify(z12),
  );

  await evaluate(`window.__vellumZoomTo({k:3,x:-40,y:-30})`);
  await evaluate(`document.getElementById("verso-turn").click()`);
  await sleep(1300); // let the 1.2s flip land
  const z5 = await evaluate(`(()=>{const sh=document.getElementById("sheet");const st=window.__vellumZoomState();const p=new URLSearchParams(location.hash.slice(1));return{versoed:sh.classList.contains("versoed"),ghost:!!document.querySelector("#verso .verso-ghost"),vis:getComputedStyle(document.getElementById("verso")).visibility,k:st.k,x:st.x,y:st.y,cx:p.get("cx")};})()`);
  check(
    "Z5 the verso flip snaps the camera home first, then flips (AC4 reset-on-verso; cx/cy/k cleared)",
    z5.versoed && z5.ghost && z5.vis === "visible" && z5.k === 1 && z5.x === 0 && z5.y === 0 && z5.cx === null,
    JSON.stringify(z5),
  );
  await shoot("explorer-zoom-verso.png"); // manual: the verso reads clean over a now-home recto
  await evaluate(`document.getElementById("verso-turn").click()`);
  await sleep(1300);

  await evaluate(`window.__vellumZoomTo({k:3,x:-60,y:-40})`);
  const r14a = await evaluate(`(()=>{document.getElementById("draw").click();return window.__vellumZoomState().k;})()`);
  await waitSettled("reset-on-draw");
  check("Z14a reset-on-draw: Draw snaps the camera home first (AC4)", r14a === 1, String(r14a));

  await evaluate(`window.__vellumZoomTo({k:3,x:-60,y:-40})`);
  const r14b = await evaluate(`(()=>{const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));return window.__vellumZoomState().k;})()`);
  await waitTurned("reset-on-turn");
  check("Z14b reset-on-style-turn: a style change homes the camera before the turn (AC4)", r14b === 1, String(r14b));
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="antique";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitTurned("reset-on-turn-back-antique");

  await evaluate(`window.__vellumZoomTo({k:3,x:-60,y:-40})`);
  const r14c = await evaluate(`(()=>{const c=document.getElementById("ages");c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));const st=window.__vellumZoomState();const p=new URLSearchParams(location.hash.slice(1));return{k:st.k,cx:p.get("cx"),cy:p.get("cy"),kp:p.get("k")};})()`);
  check(
    "Z14c reset-on-arming: entering the ages instrument homes the camera AND drops cx/cy/k from the hash (AC4)",
    r14c.k === 1 && r14c.cx === null && r14c.cy === null && r14c.kp === null,
    JSON.stringify(r14c),
  );
  await evaluate(`(()=>{const c=document.getElementById("ages");c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));})()`); // leave the chronicle

  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const rmOn = await evaluate(`matchMedia("(prefers-reduced-motion: reduce)").matches`); // precondition
  const zr = await evaluate(`(()=>{const vp=document.getElementById("map-viewport");const r=vp.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2;vp.dispatchEvent(new MouseEvent("dblclick",{bubbles:true,cancelable:true,view:window,clientX:cx,clientY:cy}));return window.__vellumZoomState().k;})()`);
  check(
    "Zrm reduced motion collapses the double-click zoom to instant (AC5: lands at k=2 in one turn)",
    rmOn === true && zr === 2,
    JSON.stringify({ rmOn, zr }),
  );
  await send("Emulation.setEmulatedMedia", { features: [] }); // clear the emulation
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);

  const z7a = await evaluate(`getComputedStyle(document.getElementById("map-viewport")).touchAction`);
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="nautical";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitTurned("zoom-touch-nautical");
  const z7b = await evaluate(`getComputedStyle(document.getElementById("map-viewport")).touchAction`);
  check(
    "Z7 touch-action:none holds on every style now that all four zoom (AC1 touch; Sub 3 revert superseded)",
    z7a === "none" && z7b === "none",
    JSON.stringify({ z7a, z7b }),
  );

  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#seed=42&style=antique&cx=0.5&cy=0.5&k=4` });
  await waitReady();
  await evaluate(`window.__vellumSetRedraftEnabled(false)`); // #169: a fresh page defaults ON; keep the geometric block clean before the deep-link settle fires
  await waitSettled("zoom-deeplink-load");
  await sleep(80);
  const z13 = await evaluate(`(()=>{const s=window.__vellumZoomState();const vp=document.getElementById("map-viewport");return{k:s.k,x:s.x,W:vp.clientWidth};})()`);
  check(
    "Z13 a deep link #cx&cy&k restores the framing on load (AC3 load: k=4 and centre)",
    z13.k === 4 && Math.abs(z13.x - (-1.5 * z13.W)) < 1.5,
    JSON.stringify(z13),
  );
  await shoot("explorer-zoom-deeplink-k4.png"); // manual: opened straight into a 4x framing from the link

  // The crop is proven by projected-settlement COUNT: integer counts are immune to the cross-engine float drift that bars an SVG byte compare here.
  const z15 = await evaluate(
    `(async()=>{const win={u0:0.375,v0:0.375,u1:0.625,v1:0.625};` +
      `const r=await window.__vellumRunJob({kind:"region",seed:42,overrides:{},window:win,band:2,gridW:320,gridH:240,title:"Survey",render:{style:"antique",widthPx:1500,legend:true}});` +
      `const w=await window.__vellumRunJob({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}});` +
      `const {recipeFromSvg}=await import("./engine/render/recipe-meta.js");const p=recipeFromSvg(r.svg);` +
      `const places=Array.isArray(r.manifest.places)?r.manifest.places:[];const wPlaces=Array.isArray(w.manifest.places)?w.manifest.places.length:-1;` +
      `return{ok:r.ok,hasSvg:typeof r.svg==="string"&&r.svg.length>2000,stamped:r.svg.includes('data-vellum-region-u0='),` +
      `regionSheet:r.svg.includes('region-land-clip'),windowEcho:JSON.stringify(r.window)===JSON.stringify(win),bandEcho:r.band===2,` +
      `parsed:!!p&&!!p.region&&Math.abs(p.region.window.u0-win.u0)<1e-9,` +
      `manifestOk:places.length>0&&places.every(pl=>Number.isFinite(pl.nx)&&Number.isFinite(pl.ny)),` +
      `isCrop:places.length>0&&places.length<wPlaces,places:places.length,worldPlaces:wPlaces};})()`,
    true,
  );
  check(
    "Z15 a region job returns a stamped regional CROP of the world (AC1: subset of places, finer terrain unit-tested + in out/)",
    z15.ok && z15.hasSvg && z15.stamped && z15.regionSheet && z15.windowEcho && z15.bandEcho && z15.parsed && z15.manifestOk && z15.isCrop,
    JSON.stringify(z15),
  );

  const z16 = await evaluate(
    `(async()=>{await window.__vellumRunJob({kind:"draw",seed:117,overrides:{},render:{style:"antique",widthPx:1500}});` +
      `const win={u0:0.375,v0:0.375,u1:0.625,v1:0.625};` +
      `const mk=()=>({kind:"region",seed:918273,overrides:{},window:win,band:2,gridW:320,gridH:240,title:"Survey",render:{style:"antique",widthPx:1500}});` +
      `const t0=performance.now();const a=await window.__vellumRunJob(mk());const t1=performance.now();const b=await window.__vellumRunJob(mk());const t2=performance.now();` +
      `return{aOk:a.ok,bOk:b.ok,aCached:a.cached,bCached:b.cached,sameSvg:a.svg===b.svg,ta:Math.round(t1-t0),tb:Math.round(t2-t1)};})()`,
    true,
  );
  check(
    "Z16 a repeat region job at the same seed skips generateWorld (AC2: cache hit via the cached flag)",
    z16.aOk && z16.bOk && z16.aCached === false && z16.bCached === true && z16.sameSvg,
    `miss=${z16.aCached} hit=${z16.bCached} sameSvg=${z16.sameSvg} (ta=${z16.ta}ms tb=${z16.tb}ms, timing is corroboration only)`,
  );

  await evaluate(`window.__vellumSetRedraftEnabled(true)`);

  const rgn = () => evaluate(`window.__vellumRegion()`);
  const goHome = async () => { await evaluate(`document.getElementById("zoom-reset").click()`); await sleep(40); };
  const enterAt = (k, cu, cv) =>
    evaluate(`(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:${k},x:W/2-(${cu})*${k}*W,y:H/2-(${cv})*${k}*H});})()`);
  const waitRedraft = async (prev) => {
    for (let i = 0; i < 100; i++) { const s = await rgn(); if (s.redrafts > prev) return s; await sleep(40); }
    return await rgn();
  };
  const captionMs = () => evaluate(`(()=>{const m=(document.getElementById("caption").textContent||"").match(/drawn in (\\d+)ms/);return m?+m[1]:-1;})()`);
  const insetView = () =>
    evaluate(
      `(()=>{const world=document.querySelector("#map > svg");const inset=document.querySelector("#map .region-inset");` +
        `const isvg=inset?inset.querySelector("svg"):null;const z=window.__vellumZoomState();` +
        `return{worldMounted:!!world&&!world.hasAttribute("data-vellum-region-u0"),insets:document.querySelectorAll("#map .region-inset").length,` +
        `stamped:!!isvg&&isvg.hasAttribute("data-vellum-region-u0"),insetLeft:inset?parseFloat(inset.style.left):-1,insetW:inset?parseFloat(inset.style.width):-1,` +
        `hits:document.querySelectorAll("#map .place-hit").length,zx:z.x,zy:z.y,zk:z.k,caption:document.getElementById("caption").textContent||""};})()`,
    );

  // Warm up first: Z15/Z16 left another seed in the worker's single-entry world cache and the first region gen pays one-time JIT, so a cold run would not log the steady-state redraft ms.
  const warm0 = (await rgn()).redrafts;
  await enterAt(2, 0.4, 0.4);
  await waitRedraft(warm0);
  await goHome();
  const before17 = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  const s17 = await waitRedraft(before17);
  const drawMs17 = await captionMs();
  const view17 = await insetView();
  const W17 = await evaluate(`document.getElementById("map-viewport").clientWidth`);
  check(
    "Z17 a settle redrafts one finer survey as an inset; the camera does not move at the commit (AC1)",
    s17.band === 1 && s17.committed === true && /^The Environs of .+/.test(s17.title || "") &&
      s17.redrafts === before17 + 1 && view17.worldMounted && view17.insets === 1 && view17.stamped &&
      Math.abs(view17.insetLeft - 25) < 0.01 && Math.abs(view17.insetW - 50) < 0.01 &&
      view17.hits > 0 && /drawn in \d+ms/.test(view17.caption) &&
      view17.zk === 2 && Math.abs(view17.zx - -W17 / 2) < 0.5,
    `${JSON.stringify(s17)} inset=${view17.insets}@${view17.insetLeft}%/${view17.insetW}% stamped=${view17.stamped} world=${view17.worldMounted} ` +
      `hits=${view17.hits} camera k=${view17.zk} x=${view17.zx} (expected ${-W17 / 2}) settle->sheet=${drawMs17}ms (AC3 target ~400ms desktop)`,
  );
  await sleep(400); // let the crossfade land so the artifact shows the committed (opaque) inset
  await shoot("explorer-sub8-region-band1.png"); // manual: a finer survey pasted over its window
  await enterAt(1.35, 0.5, 0.5);
  await sleep(600);
  await shoot("explorer-sub8-inset-context.png"); // manual: the survey as a detail sheet on the world chart

  await goHome();
  const before18 = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  const enter18 = await waitRedraft(before18); // window A, band 1, centred 0.5
  await enterAt(2.2, 0.5, 0.5);
  await sleep(500); // well past the 250ms settle debounce; assert NO new commit
  const same18 = await rgn();
  await enterAt(2, 0.42, 0.42);
  const new18 = await waitRedraft(same18.redrafts);
  const pan18 = await evaluate(`window.__vellumZoomState()`);
  const W18 = await evaluate(`document.getElementById("map-viewport").clientWidth`);
  const pannedTo = -0.34 * W18; // x = W/2 - 0.42*2*W
  check(
    "Z18 pan works at a committed band and re-drafts only on a new quantized window (AC2 + review quirk 1)",
    same18.redrafts === enter18.redrafts && new18.redrafts === same18.redrafts + 1 &&
      JSON.stringify(new18.window) !== JSON.stringify(enter18.window) &&
      new18.band === 1 && Math.abs(pan18.x - pannedTo) < 0.5,
    `A=${JSON.stringify(enter18.window)} inWindow=${same18.redrafts}(==${enter18.redrafts}) B=${JSON.stringify(new18.window)} ` +
      `pan x=${pan18.x} (expected ${pannedTo}, a dead pan would sit at ${-0.5 * W18})`,
  );

  await goHome();
  const before19 = (await rgn()).redrafts;
  await evaluate(
    `(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;` +
      `const z=(cu,cv)=>window.__vellumZoomTo({k:2,x:W/2-cu*2*W,y:H/2-cv*2*H});z(0.35,0.35);z(0.5,0.5);z(0.62,0.62);})()`,
  );
  const s19 = await waitRedraft(before19);
  await sleep(500); // any superseded straggler would land here; assert it did not
  const after19 = await rgn();
  check(
    "Z19 rapid settles commit only the last (AC2: one redraft despite three framings)",
    s19.redrafts === before19 + 1 && after19.redrafts === before19 + 1 && after19.band === 1,
    `redrafts ${before19}->${after19.redrafts} (expected +1), band=${after19.band}`,
  );

  await goHome();
  const before19b = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  await sleep(350); // past the debounce: the region job is now in flight in the worker
  await goHome(); // bumps regionGen mid-flight; the job's commit must be dropped
  await sleep(1200); // the worker resolved long since; assert the result went nowhere
  const after19b = await rgn();
  const insets19b = await evaluate(`document.querySelectorAll("#map .region-inset").length`);
  check(
    "Z19b a home while a redraft is in flight drops the resolved job (the regionGen supersession guard)",
    after19b.redrafts === before19b && after19b.band === 0 && after19b.committed === false && insets19b === 0,
    `redrafts ${before19b}->${after19b.redrafts} (expected unchanged) band=${after19b.band} insets=${insets19b}`,
  );

  await goHome();
  const before20 = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  const reg20 = await waitRedraft(before20);
  const regionCommitted = reg20.committed === true && reg20.band === 1 && /^The Environs of .+/.test(reg20.title || "");
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`); // under the 0/1 down-cross
  let world20 = reg20;
  for (let i = 0; i < 100; i++) { world20 = await rgn(); if (world20.band === 0) break; await sleep(40); }
  let gone20 = -1; // the inset teardown trails the revert by the fade; poll it to zero
  for (let i = 0; i < 50; i++) { gone20 = await evaluate(`document.querySelectorAll("#map .region-inset").length`); if (gone20 === 0) break; await sleep(40); }
  const worldView = await insetView();
  check(
    "Z20 a zoom-out drops the inset over the always-present world sheet (committed state reverts, camera un-snapped)",
    regionCommitted && world20.band === 0 && world20.committed === false && gone20 === 0 &&
      worldView.worldMounted && worldView.hits > 0 && worldView.zk === 1,
    `committedRegion=${regionCommitted} -> band=${world20.band} committed=${world20.committed} insets=${gone20} world=${worldView.worldMounted} hits=${worldView.hits} k=${worldView.zk}`,
  );

  await goHome();
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const beforeRm = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  const rm = await waitRedraft(beforeRm);
  const rmView = await evaluate(
    `(()=>{const ins=[...document.querySelectorAll("#map .region-inset")];` +
      `return{count:ins.length,opaque:ins.length===1&&ins[0].classList.contains("in")};})()`,
  );
  check(
    "Z20b reduced motion redrafts instantly (AC4: one inset, committed opaque, no transition path)",
    rm.band === 1 && rm.redrafts === beforeRm + 1 && rmView.count === 1 && rmView.opaque,
    `band=${rm.band} redrafts ${beforeRm}->${rm.redrafts} insets=${JSON.stringify(rmView)}`,
  );
  await send("Emulation.setEmulatedMedia", { features: [] });

  // CDP's setCPUThrottlingRate does NOT slow the Web Worker, so this mainly proves the redraft never blocks the main thread; the ms is corroboration.
  await goHome();
  await send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const beforePerf = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  const perf = await waitRedraft(beforePerf);
  const perfMs = await captionMs();
  await send("Emulation.setCPUThrottlingRate", { rate: 1 });
  check(
    "Z20c settle-to-sheet is measured under a 4x CPU throttle (AC3: ~1.5s mid-mobile target)",
    perf.redrafts === beforePerf + 1 && perfMs >= 0 && perfMs < 4000,
    `drawn in ${perfMs}ms under 4x throttle (target ~1.5s; 4000ms ceiling is a flake guard, not the target)`,
  );

  await goHome();
  const before20d = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  await waitRedraft(before20d);
  await evaluate(`(()=>{const c=document.getElementById("ages");c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitInked("z20d-survey-ink"); // #300: the ink lands a beat after the tick, so wait for it rather than sleeping
  const chron = await evaluate(
    `(()=>{const s=window.__vellumRegion();const svg=document.querySelector("#map > svg");` +
      `return{band:s.band,committed:s.committed,noStamp:!!svg&&!svg.hasAttribute("data-vellum-region-u0"),` +
      `insets:document.querySelectorAll("#map .region-inset").length,trackShown:!!document.querySelector("#map .voyage-overlay .voyage-track")};})()`,
  );
  check(
    "Z20d inking the survey drops the inset back to the bare world sheet (mutual exclusion, no region while the track is inked)",
    chron.band === 0 && chron.committed === false && chron.noStamp && chron.insets === 0 && chron.trackShown,
    JSON.stringify(chron),
  );
  await evaluate(`(()=>{const c=document.getElementById("ages");c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));})()`); // clear the survey ink

  await goHome();
  const before20e = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  const e20e1 = await waitRedraft(before20e);
  const pinnedName = await evaluate(`(()=>{
    const hits=[...document.querySelectorAll("#map .place-hit")];
    if(!hits.length) return null;
    const vp=document.getElementById("map-viewport").getBoundingClientRect();
    const cx=vp.left+vp.width/2, cy=vp.top+vp.height/2;
    let best=null,bd=1e9;
    for(const h of hits){const r=h.getBoundingClientRect();const d=Math.hypot(r.left+r.width/2-cx,r.top+r.height/2-cy);if(d<bd){bd=d;best=h;}}
    best.click();
    const nm=document.querySelector("#place-card .pc-name");
    return nm?nm.textContent:null;
  })()`);
  await enterAt(3.6, 0.5, 0.5); // past the 1/2 up-cross: the next finer band, same centre
  await waitRedraft(e20e1.redrafts);
  await sleep(80);
  const kept = await evaluate(
    `(()=>{const card=document.getElementById("place-card");const nm=card.querySelector(".pc-name");` +
      `return{hidden:card.hidden,name:nm?nm.textContent:null,zoomK:card.style.getPropertyValue("--zoom-k")};})()`,
  );
  check(
    "Z20e a pinned card survives a redraft keyed by NAME and keeps its counter-scale (fresh card carries --zoom-k)",
    !!pinnedName && kept.hidden === false && kept.name === pinnedName && kept.zoomK === "3.6",
    `pinned=${JSON.stringify(pinnedName)} afterRedraft=${JSON.stringify(kept)} (zoomK expected "3.6")`,
  );
  await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))`); // dismiss the pin

  await goHome();
  const before20f = (await rgn()).redrafts;
  await enterAt(8, 0.5, 0.5);
  const deep20f = await waitRedraft(before20f);
  await enterAt(4, 0.5, 0.5);
  const step20f = await waitRedraft(deep20f.redrafts);
  let view20f = await insetView();
  for (let i = 0; i < 50 && view20f.insets !== 1; i++) { await sleep(40); view20f = await insetView(); }
  check(
    "Z20f a partial zoom-out steps down ONE band in place: inset swaps, world sheet visible, camera un-snapped (review quirk 3)",
    deep20f.band === 3 && step20f.band === 2 && step20f.committed === true &&
      view20f.insets === 1 && view20f.stamped && view20f.worldMounted && view20f.zk === 4,
    `band ${deep20f.band}->${step20f.band} insets=${view20f.insets} world=${view20f.worldMounted} k=${view20f.zk} (expected 4)`,
  );

  await goHome();
  const before20g = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  const reg20g = await waitRedraft(before20g);
  await evaluate(`(()=>{const v=document.getElementById("ages");v.checked=true;v.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitInked("z20g-survey-ink"); // #300: as Z20d, the ink is a beat behind the tick
  const von = await evaluate(
    `(()=>{const s=window.__vellumRegion();return{band:s.band,committed:s.committed,` +
      `insets:document.querySelectorAll("#map .region-inset").length,track:!!document.querySelector("#map .voyage-overlay"),` +
      `k:window.__vellumZoomState().k};})()`,
  );
  await enterAt(2, 0.35, 0.35); // a settle while the track is inked: must NOT redraft
  await sleep(600); // past the debounce + any would-be dispatch
  const vsettle = await rgn();
  await evaluate(`(()=>{const v=document.getElementById("ages");v.checked=false;v.dispatchEvent(new Event("change",{bubbles:true}));})()`); // clear the survey ink
  check(
    "Z20g the survey ink drops the inset, homes the camera on arming (ratified 2026-07-26), and blocks the redraft",
    von.band === 0 && von.committed === false && von.insets === 0 && von.track && von.k === 1 &&
      vsettle.redrafts === reg20g.redrafts && vsettle.band === 0,
    `on-toggle ${JSON.stringify(von)} settleWhileInked redrafts=${vsettle.redrafts}(==${reg20g.redrafts}) band=${vsettle.band}`,
  );

  await goHome();
  const target21 = await evaluate(
    `(async()=>{const {defaultRecipe,generateWorld}=await import("/explorer/engine/world/generate.js");` +
      `const {hamletCandidates}=await import("/explorer/engine/society/hamlets.js");` +
      `const {quantizeCenter,lodWindowFor,LOD_BANDS}=await import("/explorer/engine/world/lod.js");` +
      `const {marginFor}=await import("/explorer/engine/render/transform.js");` +
      `const world=generateWorld(defaultRecipe(42,{gridW:320,gridH:240}));` +
      `const size=LOD_BANDS[LOD_BANDS.length-1].sizeUV;let best=null;` +
      `for(const s of world.settlements){` +
      `const q=quantizeCenter(s.x/(world.recipe.gridW-1),s.y/(world.recipe.gridH-1),size);` +
      `const n=hamletCandidates(world,lodWindowFor(q.cx,q.cy,size)).length;` +
      `if(!best||n>best.n)best={q,n};}` +
      `const svg=document.querySelector("#map > svg");const vb=svg.getAttribute("viewBox").split(" ").map(Number);` +
      `const m=marginFor(vb[2]);const mx=m/vb[2],my=m/vb[3];` +
      `return {cx:mx+best.q.cx*(1-2*mx),cy:my+best.q.cy*(1-2*my),n:best.n};})()`,
    true,
  );
  const before21 = (await rgn()).redrafts;
  await enterAt(8, target21.cx, target21.cy);
  const deep21 = await waitRedraft(before21);
  let view21 = await insetView();
  for (let i = 0; i < 50 && view21.insets !== 1; i++) { await sleep(40); view21 = await insetView(); }
  await shoot("explorer-hamlets-band3.png");
  const dom21 = await evaluate(
    `(async()=>{const isvg=document.querySelector("#map .region-inset svg");if(!isvg)return{err:"no inset"};` +
      `const win={u0:+isvg.getAttribute("data-vellum-region-u0"),v0:+isvg.getAttribute("data-vellum-region-v0"),` +
      `u1:+isvg.getAttribute("data-vellum-region-u1"),v1:+isvg.getAttribute("data-vellum-region-v1")};` +
      `const tiers=[...isvg.querySelectorAll("g.settlement")].map(g=>g.dataset.tier);` +
      `const RANK={capital:0,seat:1,town:2,village:3,hamlet:4};` +
      `const ordered=tiers.every((t,i)=>i===0||RANK[t]>=RANK[tiers[i-1]]);` +
      `const domNames=[...isvg.querySelectorAll('g.settlement[data-tier="hamlet"]')].map(g=>g.dataset.name);` +
      `const outside=document.querySelectorAll('#map > svg g.settlement[data-tier="hamlet"]').length;` +
      `const {defaultRecipe,generateWorld}=await import("/explorer/engine/world/generate.js");` +
      `const {generateRegionWorld}=await import("/explorer/engine/world/region.js");` +
      `const world=generateWorld(defaultRecipe(42,{gridW:320,gridH:240}));` +
      `const region=generateRegionWorld(world,{window:win,gridW:320,gridH:240,title:"parity"});` +
      `const engine=region.settlements.filter(s=>s.kind==="hamlet").map(s=>s.name);` +
      `const names=new Set(engine);` +
      `return {hamlets:domNames.length,expected:engine.length,ordered,outside,` +
      `namesMatch:domNames.every(n=>names.has(n))};})()`,
    true,
  );
  check(
    "Z21 hamlets: the deepest band grows the smallest tier, engine count/name parity over the stamped window, tier order held",
    deep21.band === 3 && dom21.hamlets >= 3 && dom21.hamlets === dom21.expected &&
      dom21.namesMatch && dom21.ordered && dom21.outside === 0,
    `band=${deep21.band} dom=${dom21.hamlets} engine=${dom21.expected} ordered=${dom21.ordered} ` +
      `namesMatch=${dom21.namesMatch} worldSheetHamlets=${dom21.outside} (scouted n=${target21.n})`,
  );

  await enterAt(4, target21.cx, target21.cy);
  const step21 = await waitRedraft(deep21.redrafts);
  let view21b = await insetView();
  for (let i = 0; i < 50 && view21b.insets !== 1; i++) { await sleep(40); view21b = await insetView(); }
  const shallow21 = await evaluate(
    `(()=>{const isvg=document.querySelector("#map .region-inset svg");` +
      `return isvg?isvg.querySelectorAll('g.settlement[data-tier="hamlet"]').length:-1;})()`,
  );
  check(
    "Z21b hamlets vanish one band up: the band-2 survey of the same centre draws none",
    step21.band === 2 && shallow21 === 0,
    `band=${step21.band} band2Hamlets=${shallow21}`,
  );

  await goHome(); // leave the world sheet for the restore tail below
  await evaluate(`window.__vellumSetRedraftEnabled(false)`); // #169: geometric-only again for the suites that follow

  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  await evaluate(`(()=>{const c=document.getElementById("ages");if(c.checked){c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));}document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("draw").click();})()`);
  await waitSettled("post-zoom-restore");
}
