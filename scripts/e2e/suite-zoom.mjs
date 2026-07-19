// The Surveyor's Glass (Z): geometric CSS pan/zoom on the Explorer chart, driven by the
// shared d3-zoom controller (docs/shared/zoom-controller.js). The live transform lands on
// #map inside the #map-viewport clip box; nothing re-renders (the semantic redraft is Sub 8).
//
// Sub 3 (#164) built the glass on antique via the deterministic window.__vellumZoomTo /
// __vellumZoomState hooks (Z1-Z8). Sub 4 (#165) makes it a full citizen: ALL four styles
// (Z11), keyboard driving that enters the same pipeline as gestures (Z9), on-screen buttons
// (Z10), a bookmarkable cx/cy/k camera (Z12 write, Z13 on-load restore), the home-reset rule
// for every world-sheet-changing action (Z5 verso, Z14 draw/turn/chronicle), and reduced
// motion collapsing the one programmatic animation (Zrm). Z5 and Z7 are UPDATED for Sub 4:
// the flip now homes the camera (Sub 3's "recto keeps its scale" is superseded), and
// touch-action:none holds on every style (it no longer reverts off antique).
//
// getComputedStyle(#map).transform is asserted as a resolved matrix on purpose: it is
// "none" if the browser rejected the value, so it doubles as proof the px-suffixed string
// the controller builds is actually valid CSS (d3's own toString() is not).
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitSettled, waitReady, waitTurned, PORT } = ctx;

  // Clean antique seed-42 base, chronicle/voyage off, resting on the recto.
  await evaluate(`(()=>{for(const id of ["chronicle","voyage"]){const c=document.getElementById(id);if(c.checked){c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));}}document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("draw").click();})()`);
  await waitSettled("zoom-base");
  await shoot("explorer-zoom-k1.png"); // home: the arrival ceremony + drop shadow overflow the frame, exactly as today

  // Z1: zoomTo lands an in-bounds transform on #map. Assert the resolved matrix (proves
  // the CSS was accepted, i.e. the px units are right), the top-left transform-origin
  // (so the scale pivot matches d3's screen-space math and the overlays stay aligned),
  // the .zoomed class on the viewport, and that getState reads the value back.
  const z1 = await evaluate(`(()=>{window.__vellumZoomTo({k:3,x:-20,y:-15});const s=window.__vellumZoomState();const m=document.getElementById("map");const cs=getComputedStyle(m);return{s,matrix:cs.transform,origin:cs.transformOrigin,zoomed:document.getElementById("map-viewport").classList.contains("zoomed")};})()`);
  check(
    "Z1 zoomTo lands the expected transform on #map (matrix + top-left origin, .zoomed, getState reads it)",
    z1.matrix === "matrix(3, 0, 0, 3, -20, -15)" && z1.origin === "0px 0px" &&
      z1.s.k === 3 && z1.s.x === -20 && z1.s.y === -15 && z1.zoomed === true,
    JSON.stringify(z1),
  );

  // Z2: clamps at the MAX extent. Scale saturates at 8; the pan saturates at the far
  // edge (x = -(k-1)*W, y = -(k-1)*H), so the magnified sheet always covers the viewport.
  const z2 = await evaluate(`(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:99,x:-99999,y:-99999});const s=window.__vellumZoomState();return{s,ex:-(7*W),ey:-(7*H),W,H};})()`);
  check(
    "Z2 clamps at the max extent (k->8, pan pinned to the far edge so the sheet still covers the viewport)",
    z2.s.k === 8 && Math.abs(z2.s.x - z2.ex) < 0.5 && Math.abs(z2.s.y - z2.ey) < 0.5,
    JSON.stringify(z2),
  );
  await shoot("explorer-zoom-k8.png"); // max magnify (blurrier is expected here; the semantic redraft is Sub 8)

  // A mid, centered magnification for the k=4 reference screenshot.
  await evaluate(`(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:4,x:-(3*W)/2,y:-(3*H)/2});})()`);
  await shoot("explorer-zoom-k4.png");

  // Z3: clamps at the MIN extent. Scale floors at 1 and any pan snaps home; the home
  // state restores the idle DOM byte-for-byte (no inline transform, computed none, and
  // the .zoomed clip removed) -- the guarantee that keeps ceremony/turn/verso untouched.
  const z3 = await evaluate(`(()=>{window.__vellumZoomTo({k:0.1,x:500,y:500});const s=window.__vellumZoomState();const m=document.getElementById("map");return{s,matrix:getComputedStyle(m).transform,inline:m.style.transform,zoomed:document.getElementById("map-viewport").classList.contains("zoomed")};})()`);
  check(
    "Z3 clamps at the min extent (k->1, pan->home; idle DOM restored: transform none, no .zoomed)",
    z3.s.k === 1 && z3.s.x === 0 && z3.s.y === 0 && z3.matrix === "none" && z3.inline === "" && z3.zoomed === false,
    JSON.stringify(z3),
  );

  // Z4: an in-bounds transform round-trips through getState unchanged (no clamp fires).
  const z4 = await evaluate(`(()=>{window.__vellumZoomTo({k:2,x:-10,y:-10});const a=window.__vellumZoomState();window.__vellumZoomTo(a);const b=window.__vellumZoomState();return{a,b};})()`);
  check(
    "Z4 getState round-trips an in-bounds transform (k=2, x=-10, y=-10)",
    z4.a.k === 2 && z4.a.x === -10 && z4.a.y === -10 && z4.b.k === z4.a.k && z4.b.x === z4.a.x && z4.b.y === z4.a.y,
    JSON.stringify(z4),
  );

  // Z6 (AC2): a card pinned while zoomed rides the transform with its mark -- both are
  // %-positioned inside #map, so they share one coordinate space and stay aligned at any
  // scale. Zoom to k=2 centered, pin the place nearest the viewport centre, and confirm
  // the card shows over the still-scaled chart. The screenshot is the visual alignment
  // check (and shows how .zoomed's overflow clips a card that unfurls past the frame edge).
  const z6 = await evaluate(`(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:2,x:-W/2,y:-H/2});const vr=vp.getBoundingClientRect();const cx=vr.left+vr.width/2,cy=vr.top+vr.height/2;const hits=[...document.querySelectorAll("#map .place-hit")];let best=null,bd=Infinity;for(const h of hits){const r=h.getBoundingClientRect();if(r.width===0)continue;const d=Math.hypot(r.left+r.width/2-cx,r.top+r.height/2-cy);if(d<bd){bd=d;best=h;}}if(!best)return{ok:false};best.click();const card=document.getElementById("place-card");const m=document.getElementById("map");return{ok:true,shown:!card.hidden,pinned:card.classList.contains("pinned"),scaled:getComputedStyle(m).transform.startsWith("matrix(2, 0, 0, 2,")};})()`);
  check(
    "Z6 a card pinned while zoomed shows over the scaled chart (AC2: pinned card rides its mark)",
    z6.ok && z6.shown && z6.pinned && z6.scaled,
    JSON.stringify(z6),
  );
  await sleep(700); // let the pinned unfurl (--unfurl 650ms) settle
  await shoot("explorer-zoom-card.png"); // manual: card anchored to its mark at 2x (edge unfurls clip)
  await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))`); // dismiss the pin

  // Z8 (AC2, Alex's call): a pinned card reads at a CONSTANT screen size at any zoom -- it
  // must not magnify with the chart (an 8x card fills and clips the frame). The card rides
  // #map's transform for its anchor but is counter-scaled by 1/k (--zoom-k, published on
  // #place-card by the controller). Pin a central place at home, measure the card's screen
  // width, zoom to k=8, and confirm the width is unchanged while --zoom-k tracks k.
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

  // ---- Sub 4 (#165) ------------------------------------------------------------------

  // Z9 (AC2, a11y hard requirement): keyboard-only reaches full zoom. The keys dispatch as
  // real KeyboardEvents on the focusable viewport and drive the controller's scaleBy/panBy,
  // i.e. d3's own scaleBy/translateBy -- the SAME "zoom" pipeline as a gesture. '+' twice is
  // 1.4^2=1.96; '-' back to 1.4; ArrowRight pans x more negative; '0' homes.
  const z9 = await evaluate(`(()=>{
    const vp=document.getElementById("map-viewport");
    window.__vellumZoomTo({k:1,x:0,y:0});
    vp.focus();
    const key=(k)=>vp.dispatchEvent(new KeyboardEvent("keydown",{key:k,bubbles:true}));
    const st=()=>window.__vellumZoomState();
    key("+"); key("+"); const afterIn=st().k;
    key("-"); const afterOut=st().k;
    const beforePanX=st().x;
    key("ArrowRight"); const afterPanX=st().x;
    key("0"); const home=st();
    return {afterIn,afterOut,beforePanX,afterPanX,home};
  })()`);
  check(
    "Z9 keyboard-only reaches full zoom: +/- magnify, arrows pan, 0 homes (AC2 a11y)",
    Math.abs(z9.afterIn - 1.96) < 1e-6 && Math.abs(z9.afterOut - 1.4) < 1e-6 &&
      z9.afterPanX < z9.beforePanX && z9.home.k === 1 && z9.home.x === 0 && z9.home.y === 0,
    JSON.stringify(z9),
  );

  // Z10: the on-screen minus / reset / plus buttons drive the same controller entry points
  // (functional now, voiced in Sub 9). In 1.4, in again 1.96, out 1.4, reset home.
  const z10 = await evaluate(`(()=>{
    const st=()=>window.__vellumZoomState();
    window.__vellumZoomTo({k:1,x:0,y:0});
    document.getElementById("zoom-in").click(); const inK=st().k;
    document.getElementById("zoom-in").click(); const in2=st().k;
    document.getElementById("zoom-out").click(); const outK=st().k;
    document.getElementById("zoom-reset").click(); const home=st();
    return {inK,in2,outK,home};
  })()`);
  check(
    "Z10 the on-screen +/reset/- buttons drive the zoom (functional now, voiced in Sub 9)",
    Math.abs(z10.inK - 1.4) < 1e-6 && Math.abs(z10.in2 - 1.96) < 1e-6 &&
      Math.abs(z10.outK - 1.4) < 1e-6 && z10.home.k === 1,
    JSON.stringify(z10),
  );

  // Z10b (regression, Alex's report): a rapid double-click on a zoom button makes the browser
  // fire a `dblclick` on it, and because the cluster sits INSIDE the d3-zoom-bound #map-viewport
  // that dblclick used to bubble into d3's own double-click-to-zoom (a 2x magnify about the
  // pointer -- the button corner), lurching/panning the map. The cluster now stops gesture
  // events, so a dblclick on a button leaves the camera untouched. Sleep past any (buggy) 250ms
  // dblclick animation before reading, so the check is deterministic, not a race.
  await evaluate(`(()=>{window.__vellumZoomTo({k:1,x:0,y:0});document.getElementById("zoom-in").dispatchEvent(new MouseEvent("dblclick",{bubbles:true,cancelable:true,view:window}));})()`);
  await sleep(350); // let any leaked d3 dblclick-zoom animation finish
  const z10b = await evaluate(`window.__vellumZoomState()`);
  check(
    "Z10b a double-click on a zoom button does not leak into d3's dblclick-zoom (no lurch/pan)",
    z10b.k === 1 && z10b.x === 0 && z10b.y === 0,
    JSON.stringify(z10b),
  );

  // Z11 (AC1): all four styles pan/zoom identically. Antique is proven above; topographic,
  // ink, nautical each magnify to the same matrix, keep touch-action:none, and keep the
  // %-positioned #place-hit overlay (the manifest is style-independent, so the marks carry
  // over). One non-antique zoom is screenshotted for the visual record.
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
  // Back to a clean antique home for the hash + reset checks below.
  await evaluate(`(()=>{window.__vellumZoomTo({k:1,x:0,y:0});const s=document.getElementById("style");s.value="antique";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitTurned("zoom-styles-restore-antique");

  // Z12 (AC3 write): a settled zoom mirrors the camera into the hash as cx/cy/k (world-uv
  // centre + zoom, 4dp), written only after the settle debounce. The centre is chosen so
  // cx/cy are exact regardless of viewport size: cx=(0.5+0.2)/2=0.35, cy=(0.5+0.3)/2=0.4.
  await evaluate(`(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:2,x:-0.2*W,y:-0.3*H});})()`);
  await sleep(400); // > the 250ms settle debounce, so onSettle has written the hash
  const z12 = await evaluate(`(()=>{const p=new URLSearchParams(location.hash.slice(1));return{cx:p.get("cx"),cy:p.get("cy"),k:p.get("k")};})()`);
  check(
    "Z12 a settled zoom writes cx/cy/k to the hash (AC3 write: uv centre + zoom, 4dp)",
    z12.cx === "0.3500" && z12.cy === "0.4000" && z12.k === "2.0000",
    JSON.stringify(z12),
  );

  // Z5 (AC4, UPDATED for Sub 4): the verso flip snaps the camera HOME first (Sub 3's "the
  // hidden recto keeps its scale while flipped" is superseded by the reset policy). Zoom,
  // flip, and confirm k=1 AND that cx/cy/k were dropped from the hash EXPLICITLY (not left
  // to a debounced settle), while the flip still lands (versoed + a ghost).
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
  // Flip back to the recto.
  await evaluate(`document.getElementById("verso-turn").click()`);
  await sleep(1300);

  // Z14 (AC4): every OTHER world-sheet-changing action homes the camera first too. Each
  // starts zoomed and asserts k=1 immediately after the trigger (draw() rebases the camera
  // synchronously at its top, before the worker round-trip). #a draw, #b style turn, #c the
  // chronicle (which also clears cx/cy/k from the hash).
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
  const r14c = await evaluate(`(()=>{const c=document.getElementById("chronicle");c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));const st=window.__vellumZoomState();const p=new URLSearchParams(location.hash.slice(1));return{k:st.k,cx:p.get("cx"),cy:p.get("cy"),kp:p.get("k")};})()`);
  check(
    "Z14c reset-on-chronicle: entering the chronicle homes the camera AND drops cx/cy/k from the hash (AC4)",
    r14c.k === 1 && r14c.cx === null && r14c.cy === null && r14c.kp === null,
    JSON.stringify(r14c),
  );
  await evaluate(`(()=>{const c=document.getElementById("chronicle");c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));})()`); // leave the chronicle

  // Zrm (AC5): prefers-reduced-motion collapses the one programmatic zoom animation (d3's
  // double-click smooth-zoom) to an instant jump. The keyboard/buttons are instant already;
  // the controller reads reduced motion LIVE, so emulating it here flips the double-click to
  // its synchronous branch and getState reads k=2 in the same turn (an animated one would
  // still be at k~1). Snap home, emulate, real double-click at the centre, assert, un-emulate.
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

  // Z7 (AC1 touch, UPDATED for Sub 4): every style now zooms, so touch-action:none holds on
  // ALL four (Sub 3 asserted it reverted off antique; superseded). It is the one thing no
  // headless gesture test can reach: without it the browser's native pan/pinch preempts a
  // drag/pinch. Antique and a non-antique both report none.
  const z7a = await evaluate(`getComputedStyle(document.getElementById("map-viewport")).touchAction`);
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="nautical";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitTurned("zoom-touch-nautical");
  const z7b = await evaluate(`getComputedStyle(document.getElementById("map-viewport")).touchAction`);
  check(
    "Z7 touch-action:none holds on every style now that all four zoom (AC1 touch; Sub 3 revert superseded)",
    z7a === "none" && z7b === "none",
    JSON.stringify({ z7a, z7b }),
  );

  // Z13 (AC3 load): a deep link with cx/cy/k restores the same framing ON LOAD. Navigate
  // fresh to a camera link (about:blank first forces a full reload, the print-room suite's
  // precedent) and confirm the settled chart opens at that zoom and centre. cx=cy=0.5,k=4
  // frames the sheet centre at 4x, so x = W/2 - 0.5*4*W = -1.5*W.
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#seed=42&style=antique&cx=0.5&cy=0.5&k=4` });
  await waitReady();
  await waitSettled("zoom-deeplink-load");
  await sleep(80);
  const z13 = await evaluate(`(()=>{const s=window.__vellumZoomState();const vp=document.getElementById("map-viewport");return{k:s.k,x:s.x,W:vp.clientWidth};})()`);
  check(
    "Z13 a deep link #cx&cy&k restores the framing on load (AC3 load: k=4 and centre)",
    z13.k === 4 && Math.abs(z13.x - (-1.5 * z13.W)) < 1.5,
    JSON.stringify(z13),
  );
  await shoot("explorer-zoom-deeplink-k4.png"); // manual: opened straight into a 4x framing from the link

  // Z15/Z16 (#168, Glass Sub 7): the finer-survey ENGINE behind the settle. These drive
  // the additive "region" worker job directly via __vellumRunJob (Sub 8 wires it to the
  // camera settle), so they touch no page zoom state. A fixed literal window keeps them
  // deterministic. The A2/A3-style worker/inline byte-parity for the kind is R14 (render).

  // Z15: a region job returns a valid, stamped, genuinely-regional CROP of the world
  // (AC1). "region-land-clip" is the coast-clip def only a region sheet emits, proving a
  // real regional render. The crop is proven env-stably by projected-settlement COUNT:
  // the window holds a strict, non-empty SUBSET of the world's places (0 < region < world)
  // -- integer counts are immune to the cross-engine float drift that bars an SVG byte
  // compare here. (The FINER terrain itself is a numeric claim, so it is guarded by the
  // same-process unit tests test/terrain/window.test.ts + test/world/region.test.ts and
  // shown in out/sub7-*; an e2e must not byte-compare terrain across environments.)
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

  // Z16: two identical region jobs skip generateWorld the second time (AC2). Asserted via
  // the worldFor `cached` flag (deterministic), not timing; the ta/tb ms are logged only, as
  // corroboration. A primer draw at another seed first evicts the single-entry cache, so the
  // first region job is a guaranteed MISS and the second a guaranteed HIT.
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

  // Restore a clean antique seed-42 HOME base (chronicle off) for the suites that follow.
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  await evaluate(`(()=>{const c=document.getElementById("chronicle");if(c.checked){c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));}document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("draw").click();})()`);
  await waitSettled("post-zoom-restore");
}
