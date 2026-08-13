// Sheet turn e2e (T, #131): a STYLE change turns the sheet and the same world lands re-dressed; a new world settles and never turns. e2e cannot SEE the 3D turn, so these assert end states plus armTurnWatch's .turning record (engaged vs instant swap).
export async function run(ctx) {
  const { evaluate, check, shoot, sleep, waitSettled, waitTurned, armTurnWatch } = ctx;

  await evaluate(`(()=>{
    const chk=document.getElementById("ages");if(chk.checked){chk.checked=false;chk.dispatchEvent(new Event("change",{bubbles:true}));}
    document.getElementById("seed").value="42";document.getElementById("style").value="antique";
    document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("arms").checked=false;
    document.getElementById("draw").click();
  })()`);
  await waitSettled("turn-base");
  const gPlaces = await evaluate(`window.__vellumRunInline({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}}).manifest.places.length`);
  await armTurnWatch();
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitTurned("style->ink");
  const g1 = await evaluate(`(()=>{const svgs=document.querySelectorAll("#map svg");const svg=svgs[0];const back=document.querySelectorAll(".sheet-back").length;const turning=!!document.querySelector(".sheet.turning");const hits=document.querySelectorAll("#map .place-hit").length;return{turned:window.__turned,svgCount:svgs.length,style:svg?svg.getAttribute("data-vellum-style"):null,seed:svg?svg.getAttribute("data-vellum-seed"):null,back,turning,hits,cap:document.getElementById("caption").textContent.length>0};})()`);
  check("T1 a style change turns the sheet (the turn engaged, not an instant swap)", g1.turned === true, JSON.stringify(g1));
  check("T1b it lands re-dressed: one #map svg, data-vellum-style=ink, SAME world (seed 42), overlay rebuilt", g1.svgCount === 1 && g1.style === "ink" && g1.seed === "42" && g1.hits === gPlaces && g1.back === 0 && g1.turning === false && g1.cap, JSON.stringify(g1) + ` places=${gPlaces}`);
  await shoot("explorer-style-turn-ink.png");

  await armTurnWatch();
  await evaluate(`(()=>{document.getElementById("seed").value="100";document.getElementById("draw").click();})()`);
  await waitSettled("seed-settle-no-turn");
  await sleep(120); // a (wrong) turn would have set .turning by now
  const g2 = await evaluate(`(()=>{const svg=document.querySelector("#map svg");return{turned:window.__turned,seed:svg?svg.getAttribute("data-vellum-seed"):null,svgCount:document.querySelectorAll("#map svg").length};})()`);
  check("T2 a new world settles, it never turns (style is the only turn trigger)", g2.turned === false && g2.seed === "100" && g2.svgCount === 1, JSON.stringify(g2));

  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("draw").click();})()`);
  await waitSettled("turn-interrupt-base");
  await armTurnWatch();
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await sleep(300); // the ink turn is now mid-rotation
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="topographic";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitTurned("style->topo-after-interrupt");
  await sleep(250); // settle-window: a leaked turn/anim would surface here
  const g3 = await evaluate(`(()=>{const svg=document.querySelector("#map svg");const inner=document.getElementById("sheet-inner");const anims=inner&&inner.getAnimations?inner.getAnimations().length:-1;return{style:svg?svg.getAttribute("data-vellum-style"):null,svgCount:document.querySelectorAll("#map svg").length,back:document.querySelectorAll(".sheet-back").length,turning:!!document.querySelector(".sheet.turning"),anims};})()`);
  check("T3 interrupting a live turn lands on the latest style, no orphan sheet", g3.style === "topographic" && g3.svgCount === 1 && g3.back === 0 && g3.turning === false, JSON.stringify(g3));
  check("T4 no leaked choreography after the settle-window (no .turning, no back face, no live WAAPI anim on the leaf)", g3.turning === false && g3.back === 0 && g3.anims === 0, JSON.stringify(g3));

  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("draw").click();})()`);
  await waitSettled("turn-then-settle-base");
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="nautical";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await sleep(250); // the nautical turn is mid-flight
  await evaluate(`(()=>{document.getElementById("seed").value="7";document.getElementById("draw").click();})()`); // a settle supersedes the turn
  await waitTurned("settle-supersedes-turn");
  await sleep(200);
  const g5 = await evaluate(`(()=>{const svg=document.querySelector("#map svg");return{seed:svg?svg.getAttribute("data-vellum-seed"):null,svgCount:document.querySelectorAll("#map svg").length,back:document.querySelectorAll(".sheet-back").length,turning:!!document.querySelector(".sheet.turning")};})()`);
  check("T5 a settle superseding a live turn wins: lands on the new world, no orphan", g5.seed === "7" && g5.svgCount === 1 && g5.back === 0 && g5.turning === false, JSON.stringify(g5));

  // A settle during a LIVE turn must tear it down SYNCHRONOUSLY (cancelTurn at draw() top): a turn superseded late self-commits its stale chart, since its natural landing is gated on `settled`, not drawGen, and wipes the overlay before the settle lands.
  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("draw").click();})()`);
  await waitSettled("g6-base");
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  let g6live = false;
  for (let i = 0; i < 80; i++) { if (await evaluate(`!!document.querySelector(".sheet.turning")`)) { g6live = true; break; } await sleep(25); }
  const g6 = await evaluate(`(()=>{
    const wasLive=!!document.querySelector(".sheet.turning");
    document.getElementById("seed").value="200";document.getElementById("draw").click(); // a settle supersedes the LIVE turn
    return{wasLive,turningAfter:!!document.querySelector(".sheet.turning"),back:document.querySelectorAll(".sheet-back").length};
  })()`);
  check("T6 a settle during a LIVE turn tears it down synchronously (no stale self-commit window)", g6live && g6.wasLive === true && g6.turningAfter === false && g6.back === 0, JSON.stringify(g6) + ` live=${g6live}`);
  await waitSettled("g6-settle");
  const g6b = await evaluate(`(()=>{const svg=document.querySelector("#map svg");return{seed:svg?svg.getAttribute("data-vellum-seed"):null,hits:document.querySelectorAll("#map .place-hit").length,svgCount:document.querySelectorAll("#map svg").length};})()`);
  check("T6b lands on the settled world with a live overlay (interactive, one svg)", g6b.seed === "200" && g6b.hits > 0 && g6b.svgCount === 1, JSON.stringify(g6b));
}
