// The Verso (V, #116): turn the whole sheet over to read its back (a mirrored bleed-through
// ghost of the chart, a docket line, the surveyor's line, an office stamp), and the key
// turn-vs-flip shared-transform races (both drive #sheet-inner rotateY, never together).
// Split from suite-explorer-core.mjs; prefix V unchanged; waitTurned/armTurnWatch now on ctx.
export async function run(ctx) {
  const { evaluate, check, shoot, sleep, waitSettled, waitTurned, armTurnWatch } = ctx;
  // V: the Verso (#116). Turn the whole sheet over to read its back: a mirrored
  // bleed-through ghost of the current chart, a docket line, the surveyor's line, and
  // an office stamp. The flip REUSES #131's .sheet wrapper but RESTS on the back face
  // (a held rotateY(-180deg)) via two classes: .flip3d (lights the 3D context +
  // reveals #verso; torn down on the recto for byte-parity) and .versoed (the rotation
  // target). e2e cannot SEE the 3D flip, so these assert END STATES + the class toggle
  // + the docket text, and (the key race) that a style change WHILE FLIPPED rebuilds
  // the verso in place and never fires the #131 turn (the flip and the turn must never
  // both drive #sheet-inner's rotateY).

  // Clean antique seed-42 base, chronicle off, resting on the recto.
  await evaluate(`(()=>{const chk=document.getElementById("chronicle");if(chk.checked){chk.checked=false;chk.dispatchEvent(new Event("change",{bubbles:true}));}document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("draw").click();})()`);
  await waitSettled("verso-base");
  const vTitle = await evaluate(`window.__vellumRunInline({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}}).title`);

  // waitFlip3dGone: the flip-back tears the 3D context down on transitionend (~1.2s),
  // restoring the recto's idle byte-parity (no perspective/preserve-3d at rest).
  const waitFlip3dGone = async (label) => {
    for (let i = 0; i < 50; i++) { if (await evaluate(`!document.querySelector(".sheet.flip3d")`)) return; await sleep(60); }
    throw new Error("waitFlip3dGone timeout " + label);
  };
  // waitRectoAttr: a settle under the flipped sheet updates the hidden recto; poll for
  // a chart attribute rather than waitSettled (which watches the visible recto).
  const waitRectoAttr = async (attr, val, label) => {
    for (let i = 0; i < 120; i++) { if (await evaluate(`document.querySelector("#map svg") && document.querySelector("#map svg").getAttribute("${attr}")==="${val}"`)) return; await sleep(50); }
    throw new Error("waitRectoAttr timeout " + label);
  };

  // V0: the Turn button disables the instant a draw starts (like Bind), so no flip can
  // begin over a half-built verso.
  const v0 = await evaluate(`(()=>{document.getElementById("seed").value="101";document.getElementById("draw").click();const dis=document.getElementById("verso-turn").disabled;return{dis};})()`);
  check("V0 the Turn button disables the instant a draw starts", v0.dis === true, JSON.stringify(v0));
  await waitSettled("verso-v0");
  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("draw").click();})()`);
  await waitSettled("verso-v0-restore");

  // V1: click Turn -> the sheet flips to its verso. .flip3d is set synchronously,
  // .versoed on the next frame (so the flat state commits first and the transition
  // runs), so allow a couple of frames before reading.
  await evaluate(`document.getElementById("verso-turn").click()`);
  await sleep(80);
  const v1 = await evaluate(`(()=>{const sh=document.getElementById("sheet");const g=document.querySelector("#verso .verso-ghost");return{versoed:sh.classList.contains("versoed"),flip3d:sh.classList.contains("flip3d"),ghost:!!g,ghostBlob:!!(g&&/^blob:/.test(g.src)),docket:(document.querySelector("#verso .verso-docket")||{}).textContent||"",survey:((document.querySelector("#verso .verso-survey")||{}).textContent||"").length,stamp:!!document.querySelector("#verso .verso-stamp"),vis:getComputedStyle(document.getElementById("verso")).visibility,label:document.getElementById("verso-turn").textContent};})()`);
  check("V1 Turn the sheet flips to the verso (.versoed + .flip3d, #verso visible, ghost/docket/survey/stamp present)", v1.versoed && v1.flip3d && v1.ghost && v1.ghostBlob && v1.stamp && v1.survey > 0 && v1.vis === "visible" && v1.label === "Turn back", JSON.stringify({ ...v1, docket: v1.docket.slice(0, 40) }));
  check("V1b the docket reads the drawn chart number and title", v1.docket.startsWith("CHART № 42 · ") && v1.docket.includes(vTitle) && v1.docket.includes("Year"), JSON.stringify({ docket: v1.docket }));
  await sleep(1300); // let the 1.2s flip land before the screenshot
  await shoot("explorer-verso.png");

  // V2: a redraw WHILE FLIPPED (Alex's call) stays on the verso and rebuilds it in
  // place; the hidden recto updates underneath. Change the seed and confirm the verso
  // survives and its docket tracks the new world.
  const ghostSrcBefore = await evaluate(`document.querySelector("#verso .verso-ghost").src`);
  await evaluate(`(()=>{document.getElementById("seed").value="100";document.getElementById("draw").click();})()`);
  await waitRectoAttr("data-vellum-seed", "100", "verso-rebuild-seed");
  await sleep(60);
  const v2 = await evaluate(`(()=>{const sh=document.getElementById("sheet");return{versoed:sh.classList.contains("versoed"),flip3d:sh.classList.contains("flip3d"),docket:(document.querySelector("#verso .verso-docket")||{}).textContent||"",rectoSeed:document.querySelector("#map svg").getAttribute("data-vellum-seed"),ghostChanged:document.querySelector("#verso .verso-ghost").src!==${JSON.stringify(ghostSrcBefore)}};})()`);
  check("V2 a redraw while flipped stays on the verso and rebuilds it (docket tracks the new world, recto updated underneath)", v2.versoed && v2.flip3d && v2.docket.startsWith("CHART № 100 · ") && v2.rectoSeed === "100" && v2.ghostChanged, JSON.stringify({ ...v2, docket: v2.docket.slice(0, 24) }));

  // V3 (the key race): a STYLE change WHILE FLIPPED must NOT fire the #131 turn (the
  // flip owns #sheet-inner's rotateY). It rebuilds the verso in place; the same world
  // (seed 100) is re-dressed, so the docket is unchanged but the ghost is rebuilt.
  await armTurnWatch();
  const ghostSrcV3 = await evaluate(`document.querySelector("#verso .verso-ghost").src`);
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitRectoAttr("data-vellum-style", "ink", "verso-restyle"); // the rebuild resolved
  await sleep(80); // __turned is sticky: a (wrong) turn would already have flagged it
  const v3 = await evaluate(`(()=>{const sh=document.getElementById("sheet");return{turned:window.__turned,turning:!!document.querySelector(".sheet.turning"),back:document.querySelectorAll(".sheet-back").length,versoed:sh.classList.contains("versoed"),ghostChanged:document.querySelector("#verso .verso-ghost").src!==${JSON.stringify(ghostSrcV3)},rectoStyle:document.querySelector("#map svg").getAttribute("data-vellum-style")};})()`);
  check("V3 a style change while flipped rebuilds in place and never turns (no .turning, no back face, still on the verso)", v3.turned === false && v3.turning === false && v3.back === 0 && v3.versoed && v3.ghostChanged && v3.rectoStyle === "ink", JSON.stringify(v3));

  // V4: click Turn again -> flip back to the recto. .versoed drops immediately; .flip3d
  // is torn down on transitionend, restoring idle byte-parity (perspective:none, the
  // overlay intact, no back face). This is #131's at-rest invariant, preserved.
  await evaluate(`document.getElementById("verso-turn").click()`);
  const v4immediate = await evaluate(`document.getElementById("sheet").classList.contains("versoed")`);
  check("V4 clicking Turn again leaves the verso immediately (.versoed dropped)", v4immediate === false);
  await waitFlip3dGone("verso-flip-back");
  await sleep(60);
  const v4 = await evaluate(`(()=>{const sh=document.getElementById("sheet");return{versoed:sh.classList.contains("versoed"),flip3d:sh.classList.contains("flip3d"),perspective:getComputedStyle(sh).perspective,map:!!document.querySelector("#map svg"),hits:document.querySelectorAll("#map .place-hit").length,vVis:getComputedStyle(document.getElementById("verso")).visibility,label:document.getElementById("verso-turn").textContent};})()`);
  check("V4b flip-back restores recto byte-parity: 3D context torn down (perspective:none), overlay intact, verso hidden", !v4.versoed && !v4.flip3d && v4.perspective === "none" && v4.map && v4.hits > 0 && v4.vVis === "hidden" && v4.label === "Turn the sheet", JSON.stringify(v4));

  // V5 (the shared-transform race): while a #131 style-turn is LIVE, clicking Turn
  // must be IGNORED. The turn owns #sheet-inner's rotateY; a flip starting mid-turn
  // would fight it. Guarded in app.js by the .turning check. The turn still lands
  // re-dressed and the sheet is never left flipped. (A regression that dropped the
  // .turning guard would flip mid-turn and fail this.)
  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("draw").click();})()`);
  await waitSettled("v5-base");
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  let v5live = false;
  for (let i = 0; i < 80; i++) { if (await evaluate(`!!document.querySelector(".sheet.turning")`)) { v5live = true; break; } await sleep(25); }
  const v5mid = await evaluate(`(()=>{document.getElementById("verso-turn").click();const sh=document.getElementById("sheet");return{versoed:sh.classList.contains("versoed"),flip3d:sh.classList.contains("flip3d")};})()`);
  check("V5 a flip attempt during a LIVE style-turn is ignored (the turn owns the sheet)", v5live && v5mid.versoed === false && v5mid.flip3d === false, JSON.stringify({ v5live, ...v5mid }));
  await waitTurned("v5-turn-lands");
  const v5 = await evaluate(`(()=>{const svg=document.querySelector("#map svg");const sh=document.getElementById("sheet");return{style:svg?svg.getAttribute("data-vellum-style"):null,versoed:sh.classList.contains("versoed"),svgCount:document.querySelectorAll("#map svg").length,back:document.querySelectorAll(".sheet-back").length};})()`);
  check("V5b the turn still lands re-dressed and un-flipped after the ignored click", v5.style === "ink" && v5.versoed === false && v5.svgCount === 1 && v5.back === 0, JSON.stringify(v5));

  // Restore a clean antique seed-42 base for the suites that follow.
  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("draw").click();})()`);
  await waitSettled("post-turn-restore");
}
