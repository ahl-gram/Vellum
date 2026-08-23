// The Glass sees it e2e (RD, #400): the detail the epic added arrives at the bands the Explorer already has.
// Every check reads the COMMITTED inset the user is looking at, never a job result standing in for it.
// Byte comparisons are same-environment only (one page, one JS engine), which is the only kind lod.ts's
// byte-identity contract can be checked by; a cross-environment SVG compare is barred project-wide.
export async function run(ctx) {
  const { evaluate, check, shoot, sleep, waitSettled, waitReady, PORT } = ctx;

  const SEED = 2; // an archipelago seed: seed 42 is an island map with no straits, so it hides coastline defects (#376)
  const LINK = `http://127.0.0.1:${PORT}/explorer/#seed=${SEED}&style=antique&legend=1&arms=0&beasts=0&cx=0.5625&cy=0.4375&k=8`;

  const rgn = () => evaluate(`window.__vellumRegion()`);
  const enterAt = (k, cu, cv) =>
    evaluate(`(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:${k},x:W/2-(${cu})*${k}*W,y:H/2-(${cv})*${k}*H});})()`);
  const waitRedraft = async (prev) => {
    for (let i = 0; i < 150; i++) { const s = await rgn(); if (s.redrafts > prev) return s; await sleep(40); }
    return await rgn();
  };
  const waitInset = async () => {
    for (let i = 0; i < 150; i++) {
      if (await evaluate(`document.querySelectorAll("#map .region-inset").length === 1`)) return;
      await sleep(40);
    }
  };
  // A region sheet is ~500KB, far past what a CDP evaluate should carry back; the digest is the byte
  // comparison in a form that fits in a check message, and it is computed IN the page so both sides
  // of every compare are hashed by the same engine.
  const insetDigest = () =>
    evaluate(
      `(()=>{const s=document.querySelector("#map .region-inset svg");if(!s)return null;const x=s.outerHTML;` +
        `let h=2166136261;for(let i=0;i<x.length;i++){h^=x.charCodeAt(i);h=Math.imul(h,16777619);}` +
        `return{digest:(h>>>0).toString(16)+"/"+x.length,detail:s.getAttribute("data-vellum-region-detail"),` +
        `u0:+s.getAttribute("data-vellum-region-u0"),v0:+s.getAttribute("data-vellum-region-v0"),` +
        `u1:+s.getAttribute("data-vellum-region-u1"),v1:+s.getAttribute("data-vellum-region-v1")};})()`,
    );
  const captionMs = () =>
    evaluate(`(()=>{const m=(document.getElementById("caption").textContent||"").match(/drawn in (\\d+)ms/);return m?+m[1]:-1;})()`);

  await evaluate(
    `(()=>{const c=document.getElementById("ages");if(c.checked){c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));}` +
      `document.getElementById("seed").value="${SEED}";document.getElementById("style").value="antique";` +
      `document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("draw").click();})()`,
  );
  await waitSettled("region-detail-base");

  const worldSheet = await evaluate(
    `(()=>{const s=document.querySelector("#map > svg");return{present:!!s,stamped:!!s&&s.hasAttribute("data-vellum-region-detail")};})()`,
  );
  check(
    "RD0 band 0 is untouched: the world sheet carries no region stamp, so it can carry no detail level (#400 AC1)",
    worldSheet.present && worldSheet.stamped === false,
    JSON.stringify(worldSheet),
  );

  // RD1: the ladder. Each band's committed inset must stamp the level its own window implies.
  const ladder = [];
  let redrafts = (await rgn()).redrafts;
  for (const [band, k] of [[1, 2], [2, 4], [3, 8]]) {
    await enterAt(k, 0.5625, 0.4375);
    const settled = await waitRedraft(redrafts);
    await waitInset();
    redrafts = settled.redrafts;
    const seen = await insetDigest();
    ladder.push({ band, reported: settled.band, ...seen, ms: await captionMs() });
    await shoot(`explorer-region-detail-band${band}.png`); // manual: the coast at each rung of the ladder
  }
  check(
    "RD1 the band ladder stamps the detail it drew: bands 1, 2, 3 read 1, 2, 3 on the committed inset (#400 AC1, AC2)",
    ladder.every((r) => r.reported === r.band && r.detail === String(r.band)),
    JSON.stringify(ladder.map((r) => ({ band: r.reported, detail: r.detail, ms: r.ms }))),
  );

  const deepest = ladder[ladder.length - 1];

  // RD2: the payoff, measured on the window the page actually committed. Shore LENGTH alone rises
  // when a coast turns into a staircase (#376), so ring count carries the claim and length only
  // corroborates it. Both arms go through one function in this page's own engine.
  const gained = await evaluate(
    `(async()=>{const win={u0:${deepest.u0},v0:${deepest.v0},u1:${deepest.u1},v1:${deepest.v1}};` +
      `const {defaultRecipe,generateWorld}=await import("./engine/world/generate.js");` +
      `const {generateRegionWorld,regionTitle}=await import("./engine/world/region.js");` +
      `const {closedIsoRings}=await import("./engine/terrain/contours.js");` +
      `const world=generateWorld(defaultRecipe(${SEED}));` +
      `const arm=(detail)=>generateRegionWorld(world,{window:win,gridW:320,gridH:240,title:regionTitle(world,win),detail});` +
      `const shore=(r)=>{const rings=closedIsoRings(r.elev,r.seaLevel);let len=0;` +
      `for(const{points:p}of rings)for(let i=1;i<p.length;i++)len+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);` +
      `return{rings:rings.length,len:Math.round(len)};};` +
      `return{bare:shore(arm(false)),detail:shore(arm(true))};})()`,
    true,
  );
  check(
    "RD2 the coast gains real detail: the band-3 window the page committed carries more closed shore rings than the bare field (#400 AC1)",
    gained.detail.rings > gained.bare.rings && gained.bare.rings > 0,
    `rings ${gained.bare.rings} -> ${gained.detail.rings}, shore length ${gained.bare.len} -> ${gained.detail.len}`,
  );

  // RD3: path independence at the site level. Two camera routes to one window must commit the same bytes.
  await evaluate(`document.getElementById("zoom-reset").click()`);
  await sleep(200);
  redrafts = (await rgn()).redrafts;
  await enterAt(8, 0.5625, 0.4375); // straight in, skipping the intermediate bands the ladder walked
  await waitRedraft(redrafts);
  await waitInset();
  const direct = await insetDigest();
  check(
    "RD3 the window fixes the draw, not the route: a direct descent commits the same bytes as the stepped one (lod.ts byte-identity)",
    direct !== null && direct.digest === deepest.digest && direct.detail === deepest.detail,
    `stepped=${deepest.digest} direct=${direct && direct.digest}`,
  );
  const directMs = await captionMs();

  // RD4: a pan at the deepest band, which is what the held chain cache exists for. Cost is reported, never asserted.
  redrafts = (await rgn()).redrafts;
  await enterAt(8, 0.5625 - 0.015625, 0.4375);
  const panned = await waitRedraft(redrafts);
  await waitInset();
  const neighbour = await insetDigest();
  const panMs = await captionMs();
  check(
    "RD4 a pan at the deepest band commits its own detailed survey (cost reported, not asserted: it is machine-bound)",
    panned.band === 3 && neighbour !== null && neighbour.detail === "3" && neighbour.digest !== direct.digest,
    `first descent ${directMs}ms, pan ${panMs}ms, ladder ${ladder.map((r) => r.ms).join("/")}ms`,
  );

  // RD5: the link. A shared #cx&cy&k reopens the page cold and must land on the same detailed sheet.
  await evaluate(`window.__vellumSetRedraftEnabled(false)`);
  const linked = [];
  for (let visit = 0; visit < 2; visit++) {
    await ctx.send("Page.navigate", { url: "about:blank" });
    await ctx.send("Page.navigate", { url: LINK });
    await waitReady();
    await waitSettled(`region-detail-link-${visit}`);
    await waitInset();
    linked.push(await insetDigest());
  }
  check(
    "RD5 a shared link round-trips to a byte-identical detailed draw across a cold reload (#400 AC2)",
    linked[0] !== null && linked[1] !== null && linked[0].digest === linked[1].digest && linked[0].detail === "3",
    JSON.stringify(linked),
  );
  await shoot("explorer-region-detail-shared-link.png"); // manual: what the link opens on

  await evaluate(`window.__vellumSetRedraftEnabled(false)`);
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  await evaluate(
    `(()=>{const c=document.getElementById("ages");if(c.checked){c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));}` +
      `document.getElementById("seed").value="42";document.getElementById("style").value="antique";` +
      `document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("draw").click();})()`,
  );
  await waitSettled("region-detail-restore");
}
