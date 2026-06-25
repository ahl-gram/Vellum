// Explorer core checks (A0-A8 worker/parity/race/themed, A11 Tide Wheel, A12 arms).
// Split from e2e-explorer.mjs; behavior + check order unchanged.
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitSettled, waitAtlas, waitReady, axDescription, serverState, consoleErrors, http4xx, PORT } = ctx;
  check("A0 page loaded + initial auto-draw rendered", await waitReady());
  check("A1 worker active (no silent fallback)", await evaluate(`window.__vellumUsesWorker()===true`));

  // A2: worker draw === inline draw, byte-for-byte, in the browser. Includes the
  // #52 place manifest: a new structured-cloneable field that must be identical
  // worker-vs-inline (same V8 runs both paths, so nx/ny are byte-identical).
  const a2 = await evaluate(
    `(async()=>{const m={kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}};const j=await window.__vellumRunJob(m);const i=window.__vellumRunInline(m);return{svg:j.svg===i.svg,title:j.title===i.title,mt:j.mapType===i.mapType,band:j.band===i.band,man:JSON.stringify(j.manifest)===JSON.stringify(i.manifest),places:j.manifest.places.length,len:j.svg.length};})()`,
    true,
  );
  check("A2 draw: worker bytes === inline bytes (svg + manifest)", a2.svg && a2.title && a2.mt && a2.band && a2.man, `${a2.len} code units, ${a2.places} places, manifest eq=${a2.man}`);

  // A3 — worker atlas === inline atlas, in the browser (gazetteer locale matches)
  const a3 = await evaluate(
    `(async()=>{const m={kind:"atlas",seed:42,overrides:{},width:1500};const j=await window.__vellumRunJob(m);const i=window.__vellumRunInline(m);return{eq:JSON.stringify(j.atlas)===JSON.stringify(i.atlas),themes:j.atlas.themes.length,regions:j.atlas.regions.length,gaz:j.atlas.gazetteerHtml.length};})()`,
    true,
  );
  check("A3 atlas: worker bytes === inline bytes (gazetteer incl.)", a3.eq, `${a3.themes} themes, ${a3.regions} regions, gaz ${a3.gaz}b`);

  // A4 — worker draw vs committed Node chart, normalized to absorb cross-engine
  // float ULPs. Transcendental math (sin/cos/atan2) is not IEEE-correctly-rounded,
  // so V8-in-node and V8-in-brave may differ by ~1 ULP in a coordinate; 6dp
  // normalization erases that while still catching a stale/wrong browser engine.
  const a4 = await evaluate(
    `(async()=>{const m={kind:"draw",seed:42,overrides:{},render:{style:"antique",legend:true}};const j=await window.__vellumRunJob(m);const c=await(await fetch("../charts/chart-42-antique.svg")).text();const norm=(s)=>s.replace(/-?\\d+\\.\\d+/g,(x)=>Number(x).toFixed(6));const bt=j.svg.match(/-?\\d+\\.\\d+/g)||[],ct=c.match(/-?\\d+\\.\\d+/g)||[];let tok=0;for(let k=0;k<Math.min(bt.length,ct.length);k++)if(bt[k]!==ct[k])tok++;return{rawEq:j.svg===c,normEq:norm(j.svg)===norm(c),tokens:bt.length,diffTok:tok};})()`,
    true,
  );
  check("A4 worker draw === committed Node chart (normalized, ULP-tolerant)", a4.normEq, `${a4.diffTok}/${a4.tokens} numeric tokens differ by ULP; raw-equal=${a4.rawEq}`);

  // --- normal bind (no race): atlas populates; artifact for the user ---
  await evaluate(`(()=>{const s=document.getElementById("seed");s.value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("draw").click();})()`);
  await waitSettled("draw-42");
  await evaluate(`document.getElementById("bind").click()`);
  const figs = await waitAtlas("normal-bind");
  check("A5 normal bind injects the atlas", figs > 0, `${figs} plate figures`);
  await shoot("explorer-worker-atlas.png");

  // --- A6 RACE: draw-then-bind (the bug the advisor flagged) ---
  const a6click = await evaluate(`(()=>{const s=document.getElementById("seed");s.value="100";document.getElementById("draw").click();const dis=document.getElementById("bind").disabled;document.getElementById("bind").click();return{dis};})()`);
  check("A6a bind disabled the instant a draw starts", a6click.dis === true);
  await waitSettled("draw-100");
  const a6 = await evaluate(`({figs:document.querySelectorAll("#atlas figure").length,map:!!document.querySelector("#map svg"),cap:document.getElementById("caption").textContent})`);
  check("A6b race draw->bind: atlas suppressed, chart advanced", a6.figs === 0 && a6.map && a6.cap.length > 0, `figs=${a6.figs}`);
  await evaluate(`document.getElementById("bind").click()`);
  const figs2 = await waitAtlas("post-race-bind");
  check("A6c post-settle bind works again", figs2 > 0, `${figs2} figures`);

  // --- A7 RACE: bind-then-draw (gen guard must drop the stale bind) ---
  await evaluate(`(()=>{document.getElementById("bind").click();const s=document.getElementById("seed");s.value="7";document.getElementById("draw").click();})()`);
  await waitSettled("draw-7");
  await sleep(400); // let any (wrongly) surviving bind inject before asserting emptiness
  const a7 = await evaluate(`document.querySelectorAll("#atlas figure").length`);
  check("A7 race bind->draw: stale bind discarded, atlas cleared", a7 === 0, `figs=${a7}`);

  // --- themed draw: worker theme path + artifact ---
  await evaluate(`(()=>{const s=document.getElementById("seed");s.value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="vegetation";document.getElementById("draw").click();})()`);
  await waitSettled("draw-theme");
  check("A8 worker renders a thematic (field) layer", await evaluate(`document.querySelector("#map svg").outerHTML.includes("layer-field")`));
  await shoot("explorer-worker-theme.png");

  // --- A11: the Tide Wheel (#55) — sea-level slider floods/drains in place ---
  // Placed before A9a so the console-health check also covers the slider gesture.
  const landPresent = await evaluate(`!!document.getElementById("land")`);
  if (!landPresent) {
    check("A11 sea-level slider present", false, "#land control missing");
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
    check("A11a slider floods in place: fresh chart + land= in hash", a11a.hash && a11a.map && a11a.cap);

    // direction: the drain (high) end bakes a larger land-fraction than the flood (low) end
    await evaluate(`(()=>{const l=document.getElementById("land");l.value="650";l.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("land-drain");
    const drainLF = await evaluate(`Number(document.querySelector("#map svg").getAttribute("data-vellum-land-fraction"))`);
    await evaluate(`(()=>{const l=document.getElementById("land");l.value="150";l.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("land-flood2");
    const floodLF = await evaluate(`Number(document.querySelector("#map svg").getAttribute("data-vellum-land-fraction"))`);
    check("A11b flood waterline < drain waterline", Number.isFinite(floodLF) && Number.isFinite(drainLF) && floodLF < drainLF, `flood=${floodLF} drain=${drainLF}`);

    // auto-reset: changing map type drops the manual tide from the hash
    await evaluate(`(()=>{const t=document.getElementById("type");t.value="continent";t.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("land-typereset");
    const a11c = await evaluate(`({reset:!location.hash.includes("land="),hash:location.hash})`);
    check("A11c changing type resets the slider to auto (land= dropped)", a11c.reset, `hash=${a11c.hash}`);
  }

  // --- A12: the arms (heraldry) toggle (#44) — like the legend checkbox ---
  // Placed before A9a so the console-health check also covers the gesture.
  const armsPresent = await evaluate(`!!document.getElementById("arms")`);
  if (!armsPresent) {
    check("A12 arms checkbox present", false, "#arms control missing");
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
    check("A12a arms off: no heraldry layer, arms=0 in hash", !a12off.heraldry && a12off.hash, `heraldry=${a12off.heraldry} hash=${a12off.hash}`);

    // toggle on via the change handler (the real gesture), expect heraldry + arms=1
    await evaluate(`(()=>{const a=document.getElementById("arms");a.checked=true;a.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("arms-on");
    const a12on = await evaluate(`({heraldry:document.querySelector("#map svg").outerHTML.includes("layer-heraldry"),hash:location.hash.includes("arms=1")})`);
    check("A12b arms on: heraldry layer drawn, arms=1 in hash", a12on.heraldry && a12on.hash, `heraldry=${a12on.heraldry} hash=${a12on.hash}`);
  }

}
