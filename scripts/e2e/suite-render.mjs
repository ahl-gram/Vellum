// Explorer render core (R): worker active (no silent fallback), worker/inline byte-parity
// (draw + atlas incl. gazetteer), the committed-chart ULP check, the draw/bind races, the
// thematic layer, the Tide Wheel (#55) and the arms toggle (#44). Split from the old
// suite-explorer-core.mjs; check bodies verbatim, only the A-prefix became R.
export async function run(ctx) {
  const { evaluate, check, shoot, sleep, waitSettled, waitAtlas, waitReady } = ctx;
  check("R0 page loaded + initial auto-draw rendered", await waitReady());
  // R0b: a bare visit (no seed in the hash) lands on today's seed-of-the-day (UTC), so
  // the Explorer, Print Room, and Today page all default to the same world. The suite's
  // PAGE is bare /explorer/, so this initial load is the bare case; compute the expected
  // seed in-browser from the same engine helper (immune to any node-side date drift).
  const r0b = await evaluate(
    `(async()=>{const {seedForDate}=await import("./engine/world/seed-of-the-day.js");return{seed:document.getElementById("seed").value,expected:String(seedForDate(new Date()))};})()`,
    true,
  );
  check("R0b bare Explorer visit lands on today's seed-of-the-day", r0b.seed === r0b.expected, JSON.stringify(r0b));
  check("R1 worker active (no silent fallback)", await evaluate(`window.__vellumUsesWorker()===true`));

  // R2: worker draw === inline draw, byte-for-byte, in the browser. Includes the
  // #52 place manifest: a new structured-cloneable field that must be identical
  // worker-vs-inline (same V8 runs both paths, so nx/ny are byte-identical).
  //
  // #120 added the `survey` field (grid dims, a 76,800-byte land mask, road polylines).
  // The mask is compared byte-wise, NOT via JSON.stringify: a Uint8Array stringifies to a
  // {"0":1,"1":0,...} object literal with one key per cell, built twice, inside this
  // evaluate(). The compare stays exact, and being integers it is immune to the
  // transcendental drift that forces R4 to compare with a tolerance.
  const a2 = await evaluate(
    `(async()=>{const m={kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}};` +
      `const j=await window.__vellumRunJob(m);const i=window.__vellumRunInline(m);` +
      `const eqBytes=(a,b)=>{if(!a||!b||a.length!==b.length)return false;for(let k=0;k<a.length;k++)if(a[k]!==b[k])return false;return true;};` +
      `const js=j.survey,is=i.survey;` +
      `const srv=!!js&&!!is&&js.gridW===is.gridW&&js.gridH===is.gridH&&eqBytes(js.land,is.land)&&JSON.stringify(js.roads)===JSON.stringify(is.roads);` +
      `let land=0;for(const v of js.land)land+=v;` +
      `return{svg:j.svg===i.svg,title:j.title===i.title,sub:j.subtitle===i.subtitle&&!!j.subtitle,mt:j.mapType===i.mapType,band:j.band===i.band,` +
      `man:JSON.stringify(j.manifest)===JSON.stringify(i.manifest),srv,places:j.manifest.places.length,len:j.svg.length,` +
      `cells:js.land.length,land,roads:js.roads.length,gx:j.manifest.places[0].gx};})()`,
    true,
  );
  check(
    "R2 draw: worker bytes === inline bytes (svg + manifest + subtitle + survey)",
    a2.svg && a2.title && a2.sub && a2.mt && a2.band && a2.man && a2.srv,
    `${a2.len} code units, ${a2.places} places, manifest eq=${a2.man}, subtitle eq=${a2.sub}, survey eq=${a2.srv} (${a2.cells} cells, ${a2.land} land, ${a2.roads} roads)`,
  );
  // #120: the router walks grid cells, so PlaceMark must carry them. A missing gx would
  // otherwise surface far away, as a track that misses every road by the chart's margin.
  check("R2b manifest places carry their grid cell (gx/gy) for the router", Number.isInteger(a2.gx), `places[0].gx=${a2.gx}`);

  // R3 — worker atlas === inline atlas, in the browser (gazetteer locale matches)
  const a3 = await evaluate(
    `(async()=>{const m={kind:"atlas",seed:42,overrides:{},width:1500};const j=await window.__vellumRunJob(m);const i=window.__vellumRunInline(m);return{eq:JSON.stringify(j.atlas)===JSON.stringify(i.atlas),themes:j.atlas.themes.length,regions:j.atlas.regions.length,gaz:j.atlas.gazetteerHtml.length};})()`,
    true,
  );
  check("R3 atlas: worker bytes === inline bytes (gazetteer incl.)", a3.eq, `${a3.themes} themes, ${a3.regions} regions, gaz ${a3.gaz}b`);

  // R4 — worker draw vs committed Node chart, normalized to absorb cross-engine
  // float ULPs. Transcendental math (sin/cos/atan2) is not IEEE-correctly-rounded,
  // so V8-in-node and V8-in-brave may differ by ~1 ULP in a coordinate; 6dp
  // normalization erases that while still catching a stale/wrong browser engine.
  const a4 = await evaluate(
    `(async()=>{const m={kind:"draw",seed:42,overrides:{},render:{style:"antique",legend:true}};const j=await window.__vellumRunJob(m);const c=await(await fetch("../charts/chart-42-antique.svg")).text();const norm=(s)=>s.replace(/-?\\d+\\.\\d+/g,(x)=>Number(x).toFixed(6));const bt=j.svg.match(/-?\\d+\\.\\d+/g)||[],ct=c.match(/-?\\d+\\.\\d+/g)||[];let tok=0;for(let k=0;k<Math.min(bt.length,ct.length);k++)if(bt[k]!==ct[k])tok++;return{rawEq:j.svg===c,normEq:norm(j.svg)===norm(c),tokens:bt.length,diffTok:tok};})()`,
    true,
  );
  check("R4 worker draw === committed Node chart (normalized, ULP-tolerant)", a4.normEq, `${a4.diffTok}/${a4.tokens} numeric tokens differ by ULP; raw-equal=${a4.rawEq}`);

  // --- normal bind (no race): atlas populates; artifact for the user ---
  await evaluate(`(()=>{const s=document.getElementById("seed");s.value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("draw").click();})()`);
  await waitSettled("draw-42");
  await evaluate(`document.getElementById("bind").click()`);
  const figs = await waitAtlas("normal-bind");
  check("R5 normal bind injects the atlas", figs > 0, `${figs} plate figures`);
  // #127: plates are hidden until the reveal-on-scroll fires; wait so the artifact
  // captures a settled atlas rather than a blank one.
  for (let i = 0; i < 60 && !(await evaluate(`!!document.querySelector("#atlas figure.settling")`)); i++) await sleep(50);
  await shoot("explorer-worker-atlas.png");

  // --- R6 RACE: draw-then-bind (the bug the advisor flagged) ---
  const a6click = await evaluate(`(()=>{const s=document.getElementById("seed");s.value="100";document.getElementById("draw").click();const dis=document.getElementById("bind").disabled;document.getElementById("bind").click();return{dis};})()`);
  check("R6a bind disabled the instant a draw starts", a6click.dis === true);
  await waitSettled("draw-100");
  const a6 = await evaluate(`({figs:document.querySelectorAll("#atlas figure").length,map:!!document.querySelector("#map svg"),cap:document.getElementById("caption").textContent})`);
  check("R6b race draw->bind: atlas suppressed, chart advanced", a6.figs === 0 && a6.map && a6.cap.length > 0, `figs=${a6.figs}`);
  await evaluate(`document.getElementById("bind").click()`);
  const figs2 = await waitAtlas("post-race-bind");
  check("R6c post-settle bind works again", figs2 > 0, `${figs2} figures`);

  // --- R7 RACE: bind-then-draw (gen guard must drop the stale bind) ---
  await evaluate(`(()=>{document.getElementById("bind").click();const s=document.getElementById("seed");s.value="7";document.getElementById("draw").click();})()`);
  await waitSettled("draw-7");
  await sleep(400); // let any (wrongly) surviving bind inject before asserting emptiness
  const a7 = await evaluate(`document.querySelectorAll("#atlas figure").length`);
  check("R7 race bind->draw: stale bind discarded, atlas cleared", a7 === 0, `figs=${a7}`);

  // --- themed draw: worker theme path + artifact ---
  await evaluate(`(()=>{const s=document.getElementById("seed");s.value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="vegetation";document.getElementById("draw").click();})()`);
  await waitSettled("draw-theme");
  check("R8 worker renders a thematic (field) layer", await evaluate(`document.querySelector("#map svg").outerHTML.includes("layer-field")`));
  await shoot("explorer-worker-theme.png");

  // R9/R10 are intentionally retired: the old A9/A10 became suite-health (N1/N2) and
  // suite-fallback (B1..B3). Numbers are kept from the A-era so history maps 1:1.
  // --- R11: the Tide Wheel (#55) — sea-level slider floods/drains in place ---
  // Placed before N1 so the console-health check also covers the slider gesture.
  const landPresent = await evaluate(`!!document.getElementById("land")`);
  if (!landPresent) {
    check("R11 sea-level slider present", false, "#land control missing");
  } else {
    // flood: low land value, fire input then change (the real drag gesture)
    await evaluate(`(()=>{
      document.getElementById("seed").value="42";
      document.getElementById("style").value="antique";
      document.getElementById("theme").value="";
      document.getElementById("type").value="";
      const l=document.getElementById("land");
      l.value="150";
      l.dispatchEvent(new Event("input",{bubbles:true}));
      l.dispatchEvent(new Event("change",{bubbles:true}));
    })()`);
    await waitSettled("land-flood");
    const a11a = await evaluate(`({hash:location.hash.includes("land="),map:!!document.querySelector("#map svg"),cap:document.getElementById("caption").textContent.length>0})`);
    check("R11a slider floods in place: fresh chart + land= in hash", a11a.hash && a11a.map && a11a.cap);

    // direction: the drain (high) end bakes a larger land-fraction than the flood (low) end
    await evaluate(`(()=>{const l=document.getElementById("land");l.value="650";l.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("land-drain");
    const drainLF = await evaluate(`Number(document.querySelector("#map svg").getAttribute("data-vellum-land-fraction"))`);
    await evaluate(`(()=>{const l=document.getElementById("land");l.value="150";l.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("land-flood2");
    const floodLF = await evaluate(`Number(document.querySelector("#map svg").getAttribute("data-vellum-land-fraction"))`);
    check("R11b flood waterline < drain waterline", Number.isFinite(floodLF) && Number.isFinite(drainLF) && floodLF < drainLF, `flood=${floodLF} drain=${drainLF}`);

    // auto-reset: changing map type drops the manual tide from the hash
    await evaluate(`(()=>{const t=document.getElementById("type");t.value="continent";t.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("land-typereset");
    const a11c = await evaluate(`({reset:!location.hash.includes("land="),hash:location.hash})`);
    check("R11c changing type resets the slider to auto (land= dropped)", a11c.reset, `hash=${a11c.hash}`);
  }

  // --- R12: the arms (heraldry) toggle (#44) — like the legend checkbox ---
  // Placed before N1 so the console-health check also covers the gesture.
  const armsPresent = await evaluate(`!!document.getElementById("arms")`);
  if (!armsPresent) {
    check("R12 arms checkbox present", false, "#arms control missing");
  } else {
    // start from a clean realm-bearing world, arms off
    await evaluate(`(()=>{
      document.getElementById("seed").value="42";
      document.getElementById("style").value="antique";
      document.getElementById("theme").value="";
      document.getElementById("type").value="";
      document.getElementById("arms").checked=false;
      document.getElementById("draw").click();
    })()`);
    await waitSettled("arms-off");
    const a12off = await evaluate(`({heraldry:document.querySelector("#map svg").outerHTML.includes("layer-heraldry"),hash:location.hash.includes("arms=0")})`);
    check("R12a arms off: no heraldry layer, arms=0 in hash", !a12off.heraldry && a12off.hash, `heraldry=${a12off.heraldry} hash=${a12off.hash}`);

    // toggle on via the change handler (the real gesture), expect heraldry + arms=1
    await evaluate(`(()=>{const a=document.getElementById("arms");a.checked=true;a.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("arms-on");
    const a12on = await evaluate(`({heraldry:document.querySelector("#map svg").outerHTML.includes("layer-heraldry"),hash:location.hash.includes("arms=1")})`);
    check("R12b arms on: heraldry layer drawn, arms=1 in hash", a12on.heraldry && a12on.hash, `heraldry=${a12on.heraldry} hash=${a12on.hash}`);
  }

  // --- R13: the coast warp (#137), a slider that reshapes the coastline of the ---
  // current seed. Redraws on release only (every warp is a different ~0.6s world).
  // Verifies the control, the untouched byte-identity gate, the coast= hash param and
  // the data-vellum-coast-warp stamp, that distinct warps give distinct worlds, and
  // worker/inline parity under the override. The type-change reset at the end also
  // keeps the shared page un-warped for the suites that run after this one.
  const coastPresent = await evaluate(`!!document.getElementById("coast")`);
  if (!coastPresent) {
    check("R13 coast slider present", false, "#coast control missing");
  } else {
    // baseline: an untouched coast slider sends no override, so the default world is
    // unstamped and carries no coast= in the hash (byte-identity with today).
    await evaluate(`(()=>{
      document.getElementById("seed").value="42";
      document.getElementById("style").value="antique";
      document.getElementById("theme").value="";
      document.getElementById("type").value="";
      document.getElementById("draw").click();
    })()`);
    await waitSettled("coast-baseline");
    const a13base = await evaluate(`({stamp:document.querySelector("#map svg").hasAttribute("data-vellum-coast-warp"),hash:location.hash.includes("coast=")})`);
    check("R13a untouched coast: no stamp, no coast= in hash (default byte-identity)", !a13base.stamp && !a13base.hash, `stamp=${a13base.stamp} hash=${a13base.hash}`);

    // warp: dial a bold coast, fire input then change (the real drag gesture)
    await evaluate(`(()=>{
      const c=document.getElementById("coast");
      c.value="90";
      c.dispatchEvent(new Event("input",{bubbles:true}));
      c.dispatchEvent(new Event("change",{bubbles:true}));
    })()`);
    await waitSettled("coast-warp");
    const a13warp = await evaluate(`({stamp:document.querySelector("#map svg").getAttribute("data-vellum-coast-warp"),hash:location.hash.includes("coast=90"),map:!!document.querySelector("#map svg")})`);
    check("R13b warp reshapes in place: fresh chart + coast= in hash + stamped value", a13warp.stamp === "0.9" && a13warp.hash && a13warp.map, `stamp=${a13warp.stamp} hash=${a13warp.hash}`);

    // distinct warps are distinct worlds: a calm coast differs from the lobed one
    await evaluate(`(()=>{ window.__coastLobed = document.querySelector("#map svg").outerHTML; })()`);
    await evaluate(`(()=>{const c=document.getElementById("coast");c.value="10";c.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("coast-calm");
    const a13calm = await evaluate(`({stamp:document.querySelector("#map svg").getAttribute("data-vellum-coast-warp"),differs:document.querySelector("#map svg").outerHTML!==window.__coastLobed})`);
    check("R13c a different warp is a different world (render changes)", a13calm.stamp === "0.1" && a13calm.differs, `calm stamp=${a13calm.stamp} differs=${a13calm.differs}`);

    // worker/inline parity holds under the coastWarp override (R2-style, with the stamp)
    const a13par = await evaluate(
      `(async()=>{const m={kind:"draw",seed:42,overrides:{coastWarp:0.9},render:{style:"antique",widthPx:1500,legend:true}};` +
        `const j=await window.__vellumRunJob(m);const i=window.__vellumRunInline(m);` +
        `return{eq:j.svg===i.svg,stamped:j.svg.includes('data-vellum-coast-warp="0.9"')};})()`,
      true,
    );
    check("R13d worker bytes === inline bytes under a coastWarp override (stamped)", a13par.eq && a13par.stamped, `eq=${a13par.eq} stamped=${a13par.stamped}`);

    // auto-reset: changing map type drops the manual warp from the hash, so no warped
    // state leaks into the suites that run after this one on the shared page.
    await evaluate(`(()=>{const t=document.getElementById("type");t.value="continent";t.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("coast-typereset");
    const a13reset = await evaluate(`({reset:!location.hash.includes("coast="),stamp:document.querySelector("#map svg").hasAttribute("data-vellum-coast-warp")})`);
    check("R13e changing type resets the coast slider to auto (coast= dropped, unstamped)", a13reset.reset && !a13reset.stamp, `reset=${a13reset.reset} stamp=${a13reset.stamp}`);
    // leave the type back at seed's choice so later suites start from a clean control set
    await evaluate(`(()=>{const t=document.getElementById("type");t.value="";t.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("coast-cleanup");
  }
}
