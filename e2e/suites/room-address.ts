// Room address e2e (RA1-RA8, Issue #320 Sub 3): the Issue #192 A-suite's year-restore checks re-hosted; the Explorer-hosted A* originals stay green beside them.
import { makeRoom } from "../support/room.ts";
import { dropExpectedCancellations } from "../support/console.ts";
import { makeSettle } from "../support/settle.ts";
import { makeStep } from "../support/step.ts";
import type { Payload, SuiteContext } from "../types.ts";
import { ONE } from "./chart-drawer/reads.ts";

type Room = ReturnType<typeof makeRoom>;
type World = Awaited<ReturnType<typeof raWorld>>;

export async function run(ctx: SuiteContext): Promise<void> {
  const { send, consoleErrors, http4xx } = ctx;
  const room = makeRoom(ctx);

  const errBase = consoleErrors.length;
  const httpBase = http4xx.length;

  // Issue #637 (Alex, 2026-09-20): RA5 reds under a leaked prefers-reduced-motion (a Play then parks at once and writes year=present into the hash), and any upstream suite that stops between setting and resetting it leaks it, since the runner's rescue resets the viewport and never emulated media (Issue #616's class); measured 2026-09-20 with a probe that ran this suite clean (8/8) and then under a leaked reduce (7/8, RA5), so the suite clears the features itself before its first boot rather than depending on its predecessor.
  await send("Emulation.setEmulatedMedia", { features: [] });

  const step = makeStep(ctx);
  const { sm, midYear } = await raWorld(ctx, room);
  await ra1Restores(ctx, room, sm, midYear);
  await step("RA9", () => ra9TableRides(ctx, room));
  await ra2Clamps(ctx, room, sm);
  await ra3Survey(ctx, room);
  await ra4Ignored(ctx, room, sm, midYear);
  await ra5AutoPark(ctx, sm, midYear);
  await ra6Reduced(ctx, room, midYear);
  await step("RA10", () => ra10ReducedPace(ctx, room));
  await ra7Counter(ctx, room, midYear);
  ra8Clean(ctx, errBase, httpBase);
}

async function raWorld({ evaluate }: SuiteContext, room: Room) {
  await room.goto("#seed=42&style=antique");
  const sm = await evaluate<{ present: number; minFounded: number; count: number }>(`(()=>{
    const r=window.__vellumRunInline({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}});
    const places=r.manifest.places;
    return{present:r.manifest.presentYear,minFounded:Math.min(...places.map((p)=>p.founded)),count:places.length};
  })()`);
  const midYear = Math.floor((sm.minFounded + sm.present) / 2);
  return { sm, midYear };
}

async function ra1Restores(
  { evaluate, check, shoot }: SuiteContext,
  room: Room,
  sm: World["sm"],
  midYear: number,
): Promise<void> {
  const ra1ok = await room.goto(`#seed=42&style=antique&year=${midYear}`);
  const ra1 = await evaluate<{
    panelShown: boolean;
    val: number | null;
    chamber: string;
    readout: string;
    roads: string;
    vis: number;
    status: string;
    play: string;
  }>(`(()=>{
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
    ra1ok &&
      ra1.panelShown &&
      ra1.chamber === "ages" &&
      ra1.val === midYear &&
      ra1.readout === `year ${midYear}` &&
      ra1.roads === "none" &&
      ra1.vis > 0 &&
      ra1.vis < sm.count &&
      ra1.status === "" &&
      ra1.play === "Play",
    JSON.stringify({ ra1, midYear, count: sm.count }),
  );
  await shoot("reading-room-address-year.png");
}

export async function ra2Clamps({ evaluate, check }: SuiteContext, room: Room, sm: World["sm"]): Promise<void> {
  const ra2ok = await room.goto("#seed=42&style=antique&year=999999");
  const ra2 = await evaluate<{
    year: number | null;
    readout: string;
    hashYear: string | null;
  }>(`(()=>{const a=window.__vellumAgesState();
    return{year:a?a.year:-1,readout:document.querySelector(".rf-year").textContent,
      hashYear:new URLSearchParams(location.hash.slice(1)).get("year")};})()`);
  check(
    "RA2 an out-of-range year clamps to the boundary and the hash self-heals",
    ra2ok && ra2.year === sm.present && ra2.readout === `year ${sm.present}` && ra2.hashYear === String(sm.present),
    JSON.stringify({ ra2ok, ra2, present: sm.present }),
  );
}

export async function ra3Survey({ evaluate, check, shoot }: SuiteContext, room: Room): Promise<void> {
  // The empty status line is the discriminating clause: an applyVoyage restore would post the completion summary and hang the settle; only the silent rearm path leaves it "".
  const ra3ok = await room.goto("#seed=42&style=antique&survey");
  const ra3 = await evaluate<{
    chamber: string;
    t: number | null;
    ports: number;
    first: string;
    last: string;
    pts: number;
    logged: number;
    rows: number;
    visible: boolean;
    status: string;
    hash: string;
  }>(`(()=>{
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
    ra3ok &&
      ra3.chamber === "survey" &&
      ra3.t === 1 &&
      ra3.ports > 1 &&
      ra3.first === ra3.last &&
      ra3.pts > ra3.ports &&
      ra3.visible &&
      ra3.logged === ra3.rows &&
      ra3.rows > 1 &&
      ra3.status === "" &&
      /(^|&)survey(&|$)/.test(ra3.hash) &&
      !ra3.hash.includes("survey="),
    JSON.stringify({ ra3ok, ra3 }),
  );
  await shoot("reading-room-address-survey.png");
}

export async function ra4Ignored(
  { evaluate, check }: SuiteContext,
  room: Room,
  sm: World["sm"],
  midYear: number,
): Promise<void> {
  const ra4ok = await room.goto(`#seed=42&style=antique&survey&year=${midYear}`);
  const ra4 = await evaluate<{
    chamber: string;
    year: number | null;
    hash: string;
  }>(`(()=>{const a=window.__vellumAgesState();
    return{chamber:a?a.chamber:"",year:a?a.year:-1,hash:location.hash.slice(1)};})()`);
  check(
    "RA4 a link carrying both survey and year=N is ignored whole: the room parks at its default present rest",
    ra4ok &&
      ra4.chamber === "ages" &&
      ra4.year === sm.present &&
      !/(^|&)survey(=|&|$)/.test(ra4.hash) &&
      new URLSearchParams(ra4.hash).get("year") === String(sm.present),
    JSON.stringify({ ra4ok, ra4, present: sm.present }),
  );
}

async function ra5AutoPark({ evaluate, check, sleep }: SuiteContext, sm: World["sm"], midYear: number): Promise<void> {
  // Play's auto-park is the one path where the year moves with NO input/change event, so the engine's onPark seam is all that re-writes the address; Issue #317 makes the room the sole author of year=N.
  const ra5set = await evaluate<string>(`(()=>{
    const s=document.querySelector(".rf-range");const a=window.__vellumAgesState();
    s.value=String(Number(s.max)/2+(${midYear}-a.min));
    s.dispatchEvent(new Event("input",{bubbles:true}));
    s.dispatchEvent(new Event("change",{bubbles:true}));
    document.querySelector(".rf-play").click();
    return location.hash.slice(1);
  })()`);
  let ra5parked = null;
  for (let i = 0; i < 120; i++) {
    ra5parked = await evaluate<{
      val: number | null;
      play: string;
      year: string | null;
    }>(`(()=>({val:window.__vellumAgesState().year,
      play:document.querySelector(".rf-play").textContent,
      year:new URLSearchParams(location.hash.slice(1)).get("year")}))()`);
    if (ra5parked.play === "Play" && ra5parked.val === sm.present) break;
    await sleep(100);
  }
  check(
    "RA5 Play's auto-park at the present re-writes the address (no stale pre-Play year)",
    new URLSearchParams(ra5set).get("year") === String(midYear) &&
      !!ra5parked &&
      ra5parked.val === sm.present &&
      ra5parked.year === String(sm.present),
    JSON.stringify({ ra5set, ra5parked, present: sm.present }),
  );
}

export async function ra6Reduced({ evaluate, send, check }: SuiteContext, room: Room, midYear: number): Promise<void> {
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const ra6ok = await room.goto(`#seed=42&style=antique&year=${midYear}`);
  const ra6 = await evaluate<{
    val: number | null;
    playing: boolean;
    play: string;
    status: string;
  }>(`(()=>({val:window.__vellumAgesState().year,
    playing:window.__vellumAgesState().playing,
    play:document.querySelector(".rf-play").textContent,
    status:document.querySelector(".rf-status").textContent}))()`);
  await send("Emulation.setEmulatedMedia", { features: [] });
  check(
    "RA6 under reduced motion the deep link lands parked on the year, Play offered, no sweep",
    ra6ok && ra6.val === midYear && ra6.playing === false && ra6.play === "Play" && ra6.status === "",
    JSON.stringify({ ra6ok, ra6 }),
  );
}

export async function ra7Counter({ evaluate, check, sleep }: SuiteContext, room: Room, midYear: number): Promise<void> {
  const ra7ok = await room.goto(`#seed=42&style=antique&year=${midYear}`);
  const ra7pre = await evaluate<string | null>(`new URLSearchParams(location.hash.slice(1)).get("year")`);
  await evaluate(
    `(()=>{const c=document.querySelector(".rr-colophon");c.querySelector("input").value="100";c.querySelector(".rr-read").click();})()`,
  );
  let ra7 = null;
  for (let i = 0; i < 300; i++) {
    let s = null;
    try {
      s = await evaluate<{
        seed: number;
        status: string | undefined;
        chamber: string | null;
        year: number | null;
        max: number | null;
        hash: string;
      }>(
        `(()=>{const st=window.__vellumReadingRoomState();const a=window.__vellumAgesState();return{seed:st.seed,status:(document.querySelector(".rf-status")||{}).textContent,chamber:a&&a.chamber,year:a&&a.year,max:a&&a.max,hash:location.hash.slice(1)};})()`,
      );
    } catch {}
    if (s && s.status === "" && s.seed === 100) {
      ra7 = s;
      break;
    }
    await sleep(50);
  }
  check(
    "RA7 a counter draw re-addresses to the NEW world's own present, never the old link's year",
    ra7ok &&
      ra7pre === String(midYear) &&
      !!ra7 &&
      ra7.chamber === "ages" &&
      ra7.year === ra7.max &&
      new URLSearchParams(ra7.hash).get("year") === String(ra7.max) &&
      /(^|&)seed=100(&|$)/.test(ra7.hash),
    JSON.stringify({ ra7ok, ra7pre, ra7 }),
  );
}

type Carried = { hash: string | null; plate: string | null; shown: boolean; rewritten: boolean };
const CARRIED: Payload<Carried> = `(() => { const f = document.querySelector(".rr-prospect"), i = f && f.querySelector("img"), a = f && f.querySelector("a");
  const table = (h) => (h === null ? null : new URLSearchParams(h.slice(h.indexOf("#") + 1)).get("table"));
  return { hash: table(location.hash), plate: a && table(a.getAttribute("href") || ""), shown: !!f && !f.hidden && !!i && String(i.src).startsWith("blob:"), rewritten: new URLSearchParams(location.hash.slice(1)).has("legend") }; })()`;

async function ra9TableRides({ evaluate, check, sleep }: SuiteContext, room: Room): Promise<void> {
  const settle = makeSettle({ evaluate, sleep });
  const booted = await room.goto(`#seed=42&style=antique&year=650&table=${ONE}`);
  const read = await settle(CARRIED, (d) => d.shown, "room-address-table-plate", 160);
  check(
    "RA9 a link's Chart Table rides the room's own rewrite of its address and the plate's road to the Prospect (#520 ruling B)",
    booted && read.rewritten && read.hash === ONE && read.plate === ONE,
    JSON.stringify({ booted, read }),
  );
}

type Reduced = {
  pace: string;
  pressed: (string | null)[];
  engine: number;
  hash: boolean;
  rows: number;
  durations: number[];
};
const REDUCED: Payload<Reduced> = `(() => { const g = document.querySelector(".rf-instrument .rf-pace"), rows = [...document.querySelectorAll(".rf-log-strip li")];
  return { pace: getComputedStyle(g).display, pressed: [...g.querySelectorAll("button")].map((b) => b.getAttribute("aria-pressed")), engine: window.__vellumAgesState().pace,
    hash: new URLSearchParams(location.hash.slice(1)).has("pace"), rows: rows.length,
    durations: rows.flatMap((li) => getComputedStyle(li).transitionDuration.split(",").map((s) => parseFloat(s))) }; })()`;

async function ra10ReducedPace({ evaluate, send, check }: SuiteContext, room: Room): Promise<void> {
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  try {
    const booted = await room.goto("#seed=42&style=antique&pace=4");
    const reduced = await evaluate(REDUCED);
    await send("Emulation.setEmulatedMedia", { features: [] });
    const moving = await evaluate(REDUCED);
    check(
      "RA10 under reduced motion the pace stands down and the rows brighten at once, and a link's pace is no key: the room plays at the default, pressed and reported, and writes none back; with motion allowed again the pace stands and the rows fade (the control)",
      booted &&
        reduced.pace === "none" &&
        reduced.rows > 0 &&
        reduced.durations.every((s) => s < 0.001) &&
        reduced.engine === 1 &&
        JSON.stringify(reduced.pressed) === JSON.stringify(["true", "false", "false"]) &&
        !reduced.hash &&
        moving.pace === "flex" &&
        moving.durations.every((s) => s >= 0.1),
      JSON.stringify({ booted, reduced, moving }),
    );
  } finally {
    await send("Emulation.setEmulatedMedia", { features: [] });
  }
}

function ra8Clean(ctx: SuiteContext, errBase: number, httpBase: number): void {
  const { check, consoleErrors, http4xx } = ctx;
  const errDelta = dropExpectedCancellations(consoleErrors.slice(errBase));
  const httpDelta = http4xx.slice(httpBase).filter((u) => !/favicon/i.test(u));
  check(
    "RA8 the room's address flow is clean (no console errors, no new 4xx)",
    errDelta.length === 0 && httpDelta.length === 0,
    [...errDelta, ...httpDelta].join(" | ") || "clean",
  );
}
