// The sheet Turn (T, #131): a STYLE change turns the sheet over and the SAME world lands
// re-dressed in the new style; a new world (seed/type/climate) settles and never turns.
// Covers the turn-engaged assertion plus interruption and settle-supersedes-turn races.
// Split from suite-explorer-core.mjs (was the G-prefix); waitTurned/armTurnWatch now on ctx.
export async function run(ctx) {
  const { evaluate, check, shoot, sleep, waitSettled, waitTurned, armTurnWatch } = ctx;
  // G: the style turn (#131). Changing the STYLE turns the sheet over and the SAME
  // world lands re-dressed in the new style; a new world (seed/type/climate) settles
  // per #127. The 3D page-turn itself cannot be SEEN by e2e (no hover/animation
  // inspection), so these assert END STATES plus, via a MutationObserver on the
  // sheet, whether the turn actually ENGAGED (the .turning class toggled) vs an
  // instant swap. The place manifest is style-independent (style is a render dress
  // over one world), so a turn leaves the hit count unchanged.

  // A clean antique seed-42 base, chronicle off, so the turn path (not the scrub
  // carve-out) is exercised and the manifest is known.
  await evaluate(`(()=>{
    const chk=document.getElementById("chronicle");if(chk.checked){chk.checked=false;chk.dispatchEvent(new Event("change",{bubbles:true}));}
    document.getElementById("seed").value="42";document.getElementById("style").value="antique";
    document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("arms").checked=false;
    document.getElementById("draw").click();
  })()`);
  await waitSettled("turn-base");
  const gPlaces = await evaluate(`window.__vellumRunInline({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}}).manifest.places.length`);
  // T1: a style change turns the sheet and the same world lands re-dressed in ink.
  await armTurnWatch();
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitTurned("style->ink");
  const g1 = await evaluate(`(()=>{const svgs=document.querySelectorAll("#map svg");const svg=svgs[0];const back=document.querySelectorAll(".sheet-back").length;const turning=!!document.querySelector(".sheet.turning");const hits=document.querySelectorAll("#map .place-hit").length;return{turned:window.__turned,svgCount:svgs.length,style:svg?svg.getAttribute("data-vellum-style"):null,seed:svg?svg.getAttribute("data-vellum-seed"):null,back,turning,hits,cap:document.getElementById("caption").textContent.length>0};})()`);
  check("T1 a style change turns the sheet (the turn engaged, not an instant swap)", g1.turned === true, JSON.stringify(g1));
  check("T1b it lands re-dressed: one #map svg, data-vellum-style=ink, SAME world (seed 42), overlay rebuilt", g1.svgCount === 1 && g1.style === "ink" && g1.seed === "42" && g1.hits === gPlaces && g1.back === 0 && g1.turning === false && g1.cap, JSON.stringify(g1) + ` places=${gPlaces}`);
  await shoot("explorer-style-turn-ink.png");

  // T2: a SEED change SETTLES, it does not turn (style is the only turn trigger).
  await armTurnWatch();
  await evaluate(`(()=>{document.getElementById("seed").value="100";document.getElementById("draw").click();})()`);
  await waitSettled("seed-settle-no-turn");
  await sleep(120); // a (wrong) turn would have set .turning by now
  const g2 = await evaluate(`(()=>{const svg=document.querySelector("#map svg");return{turned:window.__turned,seed:svg?svg.getAttribute("data-vellum-seed"):null,svgCount:document.querySelectorAll("#map svg").length};})()`);
  check("T2 a new world settles, it never turns (style is the only turn trigger)", g2.turned === false && g2.seed === "100" && g2.svgCount === 1, JSON.stringify(g2));

  // T3 (interruption): interrupt a LIVE turn. Turn to ink, let it run mid-flight,
  // then turn to topographic; the running ink turn is cancelled and the sheet lands
  // on topographic with no orphan back face and no leaked WAAPI animation.
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

  // T5: a turn interrupted by a SETTLE (style change, then a seed change) resolves to
  // the seed's new world, not the turned style's world.
  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("draw").click();})()`);
  await waitSettled("turn-then-settle-base");
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="nautical";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await sleep(250); // the nautical turn is mid-flight
  await evaluate(`(()=>{document.getElementById("seed").value="7";document.getElementById("draw").click();})()`); // a settle supersedes the turn
  await waitTurned("settle-supersedes-turn");
  await sleep(200);
  const g5 = await evaluate(`(()=>{const svg=document.querySelector("#map svg");return{seed:svg?svg.getAttribute("data-vellum-seed"):null,svgCount:document.querySelectorAll("#map svg").length,back:document.querySelectorAll(".sheet-back").length,turning:!!document.querySelector(".sheet.turning")};})()`);
  check("T5 a settle superseding a live turn wins: lands on the new world, no orphan", g5.seed === "7" && g5.svgCount === 1 && g5.back === 0 && g5.turning === false, JSON.stringify(g5));

  // T6: a settle fired WHILE a turn is live must tear the turn down SYNCHRONOUSLY, not
  // only when the settle's own worker resolves. Otherwise a turn superseded late self-
  // commits its stale chart (its natural landing is gated on `settled`, not drawGen)
  // and wipes the overlay before the settle lands. This asserts the turn is gone the
  // instant the settle's draw() runs (cancelTurn at draw() top), and the settled world
  // lands interactive. A regression that removed the synchronous cancelTurn would leave
  // .sheet.turning still set right after the click, failing T6.
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
