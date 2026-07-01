// The Daily Hunt checks (H1-H11) on the seed-of-the-day page: #56 (H1-H9),
// the #88 legend-clearance guard (H10), and the labeled-clue guard (H11).
// Split from e2e-explorer.mjs; behavior + check order unchanged.
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitSettled, waitAtlas, waitReady, axDescription, serverState, consoleErrors, http4xx, PORT } = ctx;
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
    return{seed,name:q.settlement.name,hit:frac(q.settlement),miss:frac(cap),legFrac};
  })()`, true);
  const clickHunt = (f) => evaluate(`(()=>{const svg=document.querySelector("#map svg");const r=svg.getBoundingClientRect();svg.dispatchEvent(new MouseEvent("click",{clientX:r.left+${f.fx}*r.width,clientY:r.top+${f.fy}*r.height,bubbles:true}));return{status:document.getElementById("hunt-status").textContent,solved:document.getElementById("map").classList.contains("solved")};})()`);

  const miss = await clickHunt(tgt.miss);
  check("H3 a miss reports warmer/colder prose and does not solve", miss.status.length > 0 && !miss.solved, JSON.stringify(miss));

  const won = await clickHunt(tgt.hit);
  check("H4 clicking the quarry snaps to it and solves the hunt", won.solved === true && /found it/i.test(won.status), JSON.stringify(won));

  const post = await evaluate(`(()=>{const rev=document.getElementById("reveal");const star=document.querySelector("#map .hunt-star");const share=document.getElementById("share");return{reveal:rev&&!rev.hidden,revealText:rev?rev.textContent:"",star:!!star,share:share&&!share.hidden,streak:document.getElementById("streak").textContent,ls:localStorage.getItem("vellum.hunt.v1")};})()`);
  check("H5 reveal names the found place and its founding year", post.reveal && post.revealText.includes(tgt.name) && /founded in the year/i.test(post.revealText), post.revealText.slice(0, 80));
  check("H6 a win marker overlays the map and the Share button appears", post.star && post.share);
  check("H7 streak + localStorage persist, keyed on the day's seed", /Streak: 1 day/.test(post.streak) && new RegExp(`"solved":${tgt.seed},"streak":1`).test(post.ls || ""), `${post.streak} | ${post.ls}`);
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
