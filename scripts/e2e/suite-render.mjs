// Explorer render core e2e (R): worker active, worker/inline byte-parity, the committed-chart ULP check, the thematic layer, coast warp, Tide Wheel and arms toggle; split from suite-explorer-core.mjs, the A prefix became R.
export async function run(ctx) {
  const { evaluate, check, shoot, waitSettled, waitReady } = ctx;
  check("R0 page loaded + initial auto-draw rendered", await waitReady());
  const r0b = await evaluate(
    `(async()=>{const {seedForDate}=await import("./engine/world/seed-of-the-day.js");return{seed:document.getElementById("seed").value,expected:String(seedForDate(new Date()))};})()`,
    true,
  );
  check("R0b bare Explorer visit lands on today's seed-of-the-day", r0b.seed === r0b.expected, JSON.stringify(r0b));
  check("R1 worker active (no silent fallback)", await evaluate(`window.__vellumUsesWorker()===true`));

  // The survey land mask is compared byte-wise, never JSON.stringify (a Uint8Array stringifies to an object literal with one key per cell); integer compares are immune to the transcendental drift that forces R4's tolerance.
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
  check("R2b manifest places carry their grid cell (gx/gy) for the router", Number.isInteger(a2.gx), `places[0].gx=${a2.gx}`);

  const a3 = await evaluate(
    `(async()=>{const m={kind:"atlas",seed:42,overrides:{},width:1500};const j=await window.__vellumRunJob(m);const i=window.__vellumRunInline(m);return{eq:JSON.stringify(j.atlas)===JSON.stringify(i.atlas),themes:j.atlas.themes.length,regions:j.atlas.regions.length,gaz:j.atlas.gazetteerHtml.length};})()`,
    true,
  );
  check("R3 atlas: worker bytes === inline bytes (gazetteer incl.)", a3.eq, `${a3.themes} themes, ${a3.regions} regions, gaz ${a3.gaz}b`);

  // Transcendental math (sin/cos/atan2) is not correctly rounded, so V8-in-node vs V8-in-browser can differ ~1 ULP per coordinate; 6dp normalization absorbs that while still catching a stale or wrong engine.
  const a4 = await evaluate(
    `(async()=>{const m={kind:"draw",seed:42,overrides:{},render:{style:"antique",legend:true}};const j=await window.__vellumRunJob(m);const c=await(await fetch("../charts/chart-42-antique.svg")).text();const norm=(s)=>s.replace(/-?\\d+\\.\\d+/g,(x)=>Number(x).toFixed(6));const bt=j.svg.match(/-?\\d+\\.\\d+/g)||[],ct=c.match(/-?\\d+\\.\\d+/g)||[];let tok=0;for(let k=0;k<Math.min(bt.length,ct.length);k++)if(bt[k]!==ct[k])tok++;return{rawEq:j.svg===c,normEq:norm(j.svg)===norm(c),tokens:bt.length,diffTok:tok};})()`,
    true,
  );
  check("R4 worker draw === committed Node chart (normalized, ULP-tolerant)", a4.normEq, `${a4.diffTok}/${a4.tokens} numeric tokens differ by ULP; raw-equal=${a4.rawEq}`);

  // R5/R6/R7 (#199) and R9/R10 are deliberately retired tombstones; the numbers stay gapped so R8+ map 1:1 to the A-era history.

  await evaluate(`(()=>{const s=document.getElementById("seed");s.value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="vegetation";document.getElementById("draw").click();})()`);
  await waitSettled("draw-theme");
  check("R8 worker renders a thematic (field) layer", await evaluate(`document.querySelector("#map svg").outerHTML.includes("layer-field")`));
  await shoot("explorer-worker-theme.png");

  const landPresent = await evaluate(`!!document.getElementById("land")`);
  if (!landPresent) {
    check("R11 sea-level slider present", false, "#land control missing");
  } else {
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

    await evaluate(`(()=>{const l=document.getElementById("land");l.value="650";l.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("land-drain");
    const drainLF = await evaluate(`Number(document.querySelector("#map svg").getAttribute("data-vellum-land-fraction"))`);
    await evaluate(`(()=>{const l=document.getElementById("land");l.value="150";l.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("land-flood2");
    const floodLF = await evaluate(`Number(document.querySelector("#map svg").getAttribute("data-vellum-land-fraction"))`);
    check("R11b flood waterline < drain waterline", Number.isFinite(floodLF) && Number.isFinite(drainLF) && floodLF < drainLF, `flood=${floodLF} drain=${drainLF}`);

    await evaluate(`(()=>{const t=document.getElementById("type");t.value="continent";t.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("land-typereset");
    const a11c = await evaluate(`({reset:!location.hash.includes("land="),hash:location.hash})`);
    check("R11c changing type resets the slider to auto (land= dropped)", a11c.reset, `hash=${a11c.hash}`);
  }

  const armsPresent = await evaluate(`!!document.getElementById("arms")`);
  if (!armsPresent) {
    check("R12 arms checkbox present", false, "#arms control missing");
  } else {
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

    await evaluate(`(()=>{const a=document.getElementById("arms");a.checked=true;a.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("arms-on");
    const a12on = await evaluate(`({heraldry:document.querySelector("#map svg").outerHTML.includes("layer-heraldry"),hash:location.hash.includes("arms=1")})`);
    check("R12b arms on: heraldry layer drawn, arms=1 in hash", a12on.heraldry && a12on.hash, `heraldry=${a12on.heraldry} hash=${a12on.hash}`);
  }

  const beastsPresent = await evaluate(`!!document.getElementById("beasts")`);
  if (!beastsPresent) {
    check("R13 beasts checkbox present", false, "#beasts control missing");
  } else {
    await evaluate(`(()=>{
      document.getElementById("seed").value="42";
      document.getElementById("style").value="antique";
      document.getElementById("theme").value="";
      document.getElementById("type").value="";
      document.getElementById("arms").checked=false;
      document.getElementById("beasts").checked=false;
      document.getElementById("draw").click();
    })()`);
    await waitSettled("beasts-off");
    const a13off = await evaluate(`({bestiary:document.querySelector("#map svg").outerHTML.includes("layer-bestiary"),hash:location.hash.includes("beasts=0")})`);
    check("R13a beasts off: no bestiary layer, beasts=0 in hash", !a13off.bestiary && a13off.hash, `bestiary=${a13off.bestiary} hash=${a13off.hash}`);

    await evaluate(`(()=>{const b=document.getElementById("beasts");b.checked=true;b.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("beasts-on");
    const a13on = await evaluate(`({bestiary:document.querySelector("#map svg").outerHTML.includes("layer-bestiary"),hash:location.hash.includes("beasts=1")})`);
    check("R13b beasts on: bestiary layer drawn, beasts=1 in hash", a13on.bestiary && a13on.hash, `bestiary=${a13on.bestiary} hash=${a13on.hash}`);
  }

  const coastPresent = await evaluate(`!!document.getElementById("coast")`);
  if (!coastPresent) {
    check("R13 coast slider present", false, "#coast control missing");
  } else {
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

    await evaluate(`(()=>{
      const c=document.getElementById("coast");
      c.value="90";
      c.dispatchEvent(new Event("input",{bubbles:true}));
      c.dispatchEvent(new Event("change",{bubbles:true}));
    })()`);
    await waitSettled("coast-warp");
    const a13warp = await evaluate(`({stamp:document.querySelector("#map svg").getAttribute("data-vellum-coast-warp"),hash:location.hash.includes("coast=90"),map:!!document.querySelector("#map svg")})`);
    check("R13b warp reshapes in place: fresh chart + coast= in hash + stamped value", a13warp.stamp === "0.9" && a13warp.hash && a13warp.map, `stamp=${a13warp.stamp} hash=${a13warp.hash}`);

    await evaluate(`(()=>{ window.__coastLobed = document.querySelector("#map svg").outerHTML; })()`);
    await evaluate(`(()=>{const c=document.getElementById("coast");c.value="10";c.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("coast-calm");
    const a13calm = await evaluate(`({stamp:document.querySelector("#map svg").getAttribute("data-vellum-coast-warp"),differs:document.querySelector("#map svg").outerHTML!==window.__coastLobed})`);
    check("R13c a different warp is a different world (render changes)", a13calm.stamp === "0.1" && a13calm.differs, `calm stamp=${a13calm.stamp} differs=${a13calm.differs}`);

    const a13par = await evaluate(
      `(async()=>{const m={kind:"draw",seed:42,overrides:{coastWarp:0.9},render:{style:"antique",widthPx:1500,legend:true}};` +
        `const j=await window.__vellumRunJob(m);const i=window.__vellumRunInline(m);` +
        `return{eq:j.svg===i.svg,stamped:j.svg.includes('data-vellum-coast-warp="0.9"')};})()`,
      true,
    );
    check("R13d worker bytes === inline bytes under a coastWarp override (stamped)", a13par.eq && a13par.stamped, `eq=${a13par.eq} stamped=${a13par.stamped}`);

    await evaluate(`(()=>{const t=document.getElementById("type");t.value="continent";t.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("coast-typereset");
    const a13reset = await evaluate(`({reset:!location.hash.includes("coast="),stamp:document.querySelector("#map svg").hasAttribute("data-vellum-coast-warp")})`);
    check("R13e changing type resets the coast slider to auto (coast= dropped, unstamped)", a13reset.reset && !a13reset.stamp, `reset=${a13reset.reset} stamp=${a13reset.stamp}`);
    await evaluate(`(()=>{const t=document.getElementById("type");t.value="";t.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("coast-cleanup");
  }

  const a14 = await evaluate(
    `(async()=>{const win={u0:0.375,v0:0.375,u1:0.625,v1:0.625};` +
      `const m={kind:"region",seed:42,overrides:{},window:win,band:2,gridW:320,gridH:240,title:"The Environs",render:{style:"antique",widthPx:1500,legend:true}};` +
      `const j=await window.__vellumRunJob(m);const i=window.__vellumRunInline(m);` +
      `const {recipeFromSvg}=await import("./engine/render/recipe-meta.js");const p=recipeFromSvg(j.svg);` +
      `return{svg:j.svg===i.svg,man:JSON.stringify(j.manifest)===JSON.stringify(i.manifest),` +
      `windowEcho:JSON.stringify(j.window)===JSON.stringify(win)&&JSON.stringify(i.window)===JSON.stringify(win),` +
      `bandEcho:j.band===2&&i.band===2,stamped:j.svg.includes('data-vellum-region-u0='),` +
      `roundtrip:!!p&&!!p.region&&Math.abs(p.region.window.u1-win.u1)<1e-9&&p.region.worldGridW===320,` +
      `places:Array.isArray(j.manifest.places)?j.manifest.places.length:-1,len:j.svg.length};})()`,
    true,
  );
  check(
    "R14 region job: worker bytes === inline bytes + window/band echo + stamp round-trips (Sub 7 AC2/AC3)",
    a14.svg && a14.man && a14.windowEcho && a14.bandEcho && a14.stamped && a14.roundtrip,
    `${a14.len} units, ${a14.places} places, svg=${a14.svg} man=${a14.man} echo=${a14.windowEcho}/${a14.bandEcho} stamp=${a14.stamped} rt=${a14.roundtrip}`,
  );
}
