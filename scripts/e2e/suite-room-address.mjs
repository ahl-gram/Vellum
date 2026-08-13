// Room address e2e (RA1-RA8, #320 Sub 3): the #192 A-suite's year-restore checks re-hosted; the Explorer-hosted A* originals stay green beside them.
// Did NOT port (named for Sub 4 to consume): A2/A4 (camera keys, no cx/cy/k here), A6/A7 (the #ages writer gestures, the room is always armed; RR8 holds the release half), A8 (the room is never disarmed, RR4 pins its converged address).
import { makeRoom } from "./room-support.mjs";

export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, consoleErrors, http4xx } = ctx;
  const room = makeRoom(ctx);

  const errBase = consoleErrors.length;
  const httpBase = http4xx.length;

  await room.goto("#seed=42&style=antique");
  const sm = await evaluate(`(()=>{
    const r=window.__vellumRunInline({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}});
    const places=r.manifest.places;
    return{present:r.manifest.presentYear,minFounded:Math.min(...places.map((p)=>p.founded)),count:places.length};
  })()`);
  const midYear = Math.floor((sm.minFounded + sm.present) / 2);

  const ra1ok = await room.goto(`#seed=42&style=antique&year=${midYear}`);
  const ra1 = await evaluate(`(()=>{
    const roads=document.querySelector('.rf-chart #layer-roads');
    const vis=[...document.querySelectorAll('.rf-chart #layer-settlements g.settlement')].filter((g)=>getComputedStyle(g).display!=="none").length;
    const a=window.__vellumAgesState();
    return{panelShown:!document.querySelector(".rf-ages").hidden,
      val:a?a.year:-1,chamber:a?a.chamber:"",readout:document.querySelector(".rf-year").textContent,
      roads:roads?getComputedStyle(roads).display:"(no-el)",vis,
      status:document.querySelector(".rf-status").textContent,
      play:document.querySelector(".rf-play").textContent};
  })()`);
  check(
    "RA1 a year=N deep link restores the ages chamber at rest on that year, world and all",
    ra1ok && ra1.panelShown && ra1.chamber === "ages" && ra1.val === midYear &&
      ra1.readout === `year ${midYear}` && ra1.roads === "none" &&
      ra1.vis > 0 && ra1.vis < sm.count && ra1.status === "" && ra1.play === "Play",
    JSON.stringify({ ra1, midYear, count: sm.count }),
  );
  await shoot("reading-room-address-year.png");

  await room.goto("#seed=42&style=antique&year=999999");
  const ra2 = await evaluate(`(()=>{const a=window.__vellumAgesState();
    return{year:a?a.year:-1,readout:document.querySelector(".rf-year").textContent,
      hashYear:new URLSearchParams(location.hash.slice(1)).get("year")};})()`);
  check(
    "RA2 an out-of-range year clamps to the boundary and the hash self-heals",
    ra2.year === sm.present && ra2.readout === `year ${sm.present}` && ra2.hashYear === String(sm.present),
    JSON.stringify({ ra2, present: sm.present }),
  );

  // The empty status line is the discriminating clause: an applyVoyage restore would post the completion summary and hang the settle; only the silent rearm path leaves it "".
  await room.goto("#seed=42&style=antique&survey");
  const ra3 = await evaluate(`(()=>{
    const raw=document.querySelector(".voyage-track").getAttribute("points").trim().split(" ");
    const log=window.__vellumVoyageLog();
    const plan=window.__vellumVoyagePlan();
    const a=window.__vellumAgesState();
    return{chamber:a?a.chamber:"",t:a?a.t:-1,ports:plan?plan.ports.length:0,
      first:raw[0],last:raw[raw.length-1],pts:raw.length,logged:log?log.logged:-1,rows:log?log.rows:-1,
      visible:!!(log&&log.visible),status:document.querySelector(".rf-status").textContent,
      hash:location.hash.slice(1)};
  })()`);
  check(
    "RA3 a bare survey deep link restores the survey chamber at rest on the closed track, silently",
    ra3.chamber === "survey" && ra3.t === 1 && ra3.ports > 1 && ra3.first === ra3.last &&
      ra3.pts > ra3.ports && ra3.visible && ra3.logged === ra3.rows && ra3.rows > 1 &&
      ra3.status === "" && /(^|&)survey(&|$)/.test(ra3.hash) && !ra3.hash.includes("survey="),
    JSON.stringify(ra3),
  );
  await shoot("reading-room-address-survey.png");

  await room.goto(`#seed=42&style=antique&survey&year=${midYear}`);
  const ra4 = await evaluate(`(()=>{const a=window.__vellumAgesState();
    return{chamber:a?a.chamber:"",year:a?a.year:-1,hash:location.hash.slice(1)};})()`);
  check(
    "RA4 a link carrying both survey and year=N is ignored whole: the room parks at its default present rest",
    ra4.chamber === "ages" && ra4.year === sm.present &&
      !/(^|&)survey(=|&|$)/.test(ra4.hash) && new URLSearchParams(ra4.hash).get("year") === String(sm.present),
    JSON.stringify({ ra4, present: sm.present }),
  );

  // Play's auto-park is the one path where the year moves with NO input/change event, so the engine's onPark seam is all that re-writes the address; #317 makes the room the sole author of year=N.
  const ra5set = await evaluate(`(()=>{
    const s=document.querySelector(".rf-range");const a=window.__vellumAgesState();
    s.value=String(Number(s.max)/2+(${midYear}-a.min));
    s.dispatchEvent(new Event("input",{bubbles:true}));
    s.dispatchEvent(new Event("change",{bubbles:true}));
    document.querySelector(".rf-play").click();
    return location.hash.slice(1);
  })()`);
  let ra5parked = null;
  for (let i = 0; i < 120; i++) {
    ra5parked = await evaluate(`(()=>({val:window.__vellumAgesState().year,
      play:document.querySelector(".rf-play").textContent,
      year:new URLSearchParams(location.hash.slice(1)).get("year")}))()`);
    if (ra5parked.play === "Play" && ra5parked.val === sm.present) break;
    await sleep(100);
  }
  check(
    "RA5 Play's auto-park at the present re-writes the address (no stale pre-Play year)",
    new URLSearchParams(ra5set).get("year") === String(midYear) &&
      !!ra5parked && ra5parked.val === sm.present && ra5parked.year === String(sm.present),
    JSON.stringify({ ra5set, ra5parked, present: sm.present }),
  );

  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await room.goto(`#seed=42&style=antique&year=${midYear}`);
  const ra6 = await evaluate(`(()=>({val:window.__vellumAgesState().year,
    playing:window.__vellumAgesState().playing,
    play:document.querySelector(".rf-play").textContent,
    status:document.querySelector(".rf-status").textContent}))()`);
  await send("Emulation.setEmulatedMedia", { features: [] });
  check(
    "RA6 under reduced motion the deep link lands parked on the year, Play offered, no sweep",
    ra6.val === midYear && ra6.playing === false && ra6.play === "Play" && ra6.status === "",
    JSON.stringify(ra6),
  );

  await room.goto(`#seed=42&style=antique&year=${midYear}`);
  const ra7pre = await evaluate(`new URLSearchParams(location.hash.slice(1)).get("year")`);
  await evaluate(`(()=>{const c=document.querySelector(".rr-colophon");c.querySelector("input").value="100";c.querySelector(".rr-read").click();})()`);
  let ra7 = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try {
      s = await evaluate(`(()=>{const st=window.__vellumReadingRoomState();const a=window.__vellumAgesState();return{seed:st.seed,status:(document.querySelector(".rf-status")||{}).textContent,chamber:a&&a.chamber,year:a&&a.year,max:a&&a.max,hash:location.hash.slice(1)};})()`);
    } catch {}
    if (s && s.status === "" && s.seed === 100) { ra7 = s; break; }
    await sleep(50);
  }
  check(
    "RA7 a counter draw re-addresses to the NEW world's own present, never the old link's year",
    ra7pre === String(midYear) && !!ra7 && ra7.chamber === "ages" && ra7.year === ra7.max &&
      new URLSearchParams(ra7.hash).get("year") === String(ra7.max) &&
      /(^|&)seed=100(&|$)/.test(ra7.hash),
    JSON.stringify({ ra7pre, ra7 }),
  );

  const errDelta = consoleErrors.slice(errBase).filter((e) => !e.includes("AbortError: Transition was skipped"));
  const httpDelta = http4xx.slice(httpBase).filter((u) => !/favicon/i.test(u));
  check(
    "RA8 the room's address flow is clean (no console errors, no new 4xx)",
    errDelta.length === 0 && httpDelta.length === 0,
    [...errDelta, ...httpDelta].join(" | ") || "clean",
  );
}
