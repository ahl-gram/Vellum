// The Surveyor's Glass, Sub 3 (Z, #164): geometric CSS pan/zoom on the antique chart,
// driven by the shared d3-zoom controller (docs/shared/zoom-controller.js). The live
// transform lands on #map inside the new #map-viewport clip box; nothing re-renders
// (the semantic redraft is Sub 8). Real wheel/drag/pinch dispatch is Sub 5's job, so
// here the deterministic window.__vellumZoomTo / __vellumZoomState hooks stand in:
// they prove the transform lands as valid CSS, clamps at BOTH extents (scale and pan),
// and round-trips. The camera-home invariants (ceremony/turn/verso unaffected at k=1)
// are covered by the other suites running before/after this one at home.
//
// getComputedStyle(#map).transform is asserted as a resolved matrix on purpose: it is
// "none" if the browser rejected the value, so it doubles as proof the px-suffixed
// string the controller builds is actually valid CSS (d3's own toString() is not).
export async function run(ctx) {
  const { evaluate, check, shoot, sleep, waitSettled, waitTurned } = ctx;

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
  // #map by the controller). Pin a central place at home, measure the card's screen width,
  // zoom to k=8, and confirm the width is unchanged while --zoom-k tracks k.
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

  // Z5 (manual sanity, screenshotted): flip the verso WHILE ZOOMED. The transform is on
  // #map, never #sheet-inner, so the flip (which rotates #sheet-inner) and the zoom never
  // fight: the verso reveals its own unzoomed ghost while the hidden recto keeps its
  // scale. suite-verso's end-state assertions cannot see a backface regression, so the
  // screenshot here (and explorer-verso.png at home) is the real visual check.
  await evaluate(`window.__vellumZoomTo({k:3,x:-40,y:-30})`);
  await evaluate(`document.getElementById("verso-turn").click()`);
  await sleep(1300); // let the 1.2s flip land
  const z5 = await evaluate(`(()=>{const sh=document.getElementById("sheet");const m=document.getElementById("map");return{versoed:sh.classList.contains("versoed"),ghost:!!document.querySelector("#verso .verso-ghost"),vis:getComputedStyle(document.getElementById("verso")).visibility,rectoScaled:getComputedStyle(m).transform==="matrix(3, 0, 0, 3, -40, -30)"};})()`);
  check(
    "Z5 flipping the verso while zoomed reveals the verso and never fights the zoom (hidden recto keeps its scale)",
    z5.versoed && z5.ghost && z5.vis === "visible" && z5.rectoScaled,
    JSON.stringify(z5),
  );
  await shoot("explorer-zoom-verso.png"); // manual: the verso reads clean over a zoomed recto

  // Flip back to the recto.
  await evaluate(`document.getElementById("verso-turn").click()`);
  await sleep(1300);

  // Z7 (AC1 touch): the gesture element declares touch-action:none while the zoom is
  // attached (antique), so the browser's native pan/pinch cannot preempt a drag/pinch --
  // the one thing no headless gesture test can reach. A non-antique style detaches the
  // zoom and reverts to normal scrolling. Snap home first so the ink turn is not zoomed.
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  const z7a = await evaluate(`getComputedStyle(document.getElementById("map-viewport")).touchAction`);
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitTurned("zoom-ink-turn");
  const z7b = await evaluate(`getComputedStyle(document.getElementById("map-viewport")).touchAction`);
  check(
    "Z7 touch-action:none while attached on antique (touch gestures reach the controller), reverts off antique",
    z7a === "none" && z7b !== "none",
    JSON.stringify({ z7a, z7b }),
  );

  // Restore a clean antique seed-42 HOME base for the suites that follow. A redraw does
  // not snap the camera home on antique in this sub (that is Sub 4), so snap home first.
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("draw").click();})()`);
  await waitSettled("post-zoom-restore");
}
