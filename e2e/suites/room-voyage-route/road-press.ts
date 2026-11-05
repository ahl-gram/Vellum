// Issue #434: the journal's road press, read in the room it is wired in (seed 526413615, the suite's world). RV8b reads the rows and the sheet, RV8c drives the real gestures.
import type { Payload, SuiteContext } from "../../types.ts";
import { sendClick } from "../../support/input.ts";
import { makeBar } from "../../support/room.ts";
import { makeSettle } from "../../support/settle.ts";

// 2026-11-04: the ruled tokens --control-cream and --control-gold (src/styles/shared/shell.css), literal as a ruled number may stay.
const CREAM = "rgb(248, 241, 224)";
const GOLD = "rgb(240, 227, 189)";
const SEED = 526413615;

type Leg = {
  i: number;
  mode: string;
  from: number;
  to: number;
  last: boolean;
  press: {
    label: string | null;
    path: string;
    a: string | null;
    b: string | null;
    seed: string | null;
    target: string;
    dropped: string[];
  } | null;
};
type Pale = { bg: string; press: string; li: string; prose: string | null; gutter: string | null };
type Rv8bRead = { rows: number; legs: Leg[]; pale: Pale[]; told: string[]; restored: boolean };

const rowOk = (l: Leg): boolean =>
  l.mode === "road" && !l.last
    ? l.press !== null &&
      l.press.label === "Take this road" &&
      l.press.path === "/ribbon/" &&
      l.press.a === String(l.from) &&
      l.press.b === String(l.to) &&
      l.press.seed === String(SEED) &&
      l.press.target === "" &&
      l.press.dropped.length === 0
    : l.press === null;
const paleOk = (p: Pale): boolean =>
  p.bg === CREAM && p.press === "1" && p.li === "1" && p.prose === "0.4" && p.gutter === "0.4";

// The finish() calls are an artificial instrument: the rows ink in over 0.18s, and a read taken at once returns the starting opacity, so the transition is run to its end before the computed style is read (measured: without it the pale-rule mutation read the row at 1).
const RV8B_READ = `(()=>{
  const plan=window.__vellumVoyagePlan();const rows=[...document.querySelectorAll(".rf-log-strip li.prologue")];
  const legs=plan.legs.map((l,i)=>{const p=rows[i+1]?rows[i+1].querySelector(".cr-road"):null;let press=null;
    if(p){const u=new URL(p.href);const q=new URLSearchParams(u.hash.slice(1));const lab=p.querySelector(".cr-road-label");
      press={label:lab?lab.textContent:null,path:u.pathname,a:q.get("a"),b:q.get("b"),seed:q.get("seed"),target:p.target,
        dropped:["theme","legend","arms","beasts","survey","year"].filter((k)=>q.has(k))};}
    return{i,mode:l.mode,from:l.fromIdx,to:l.toIdx,last:i===plan.legs.length-1,press};});
  window.__vellumVoyageStepTo(0);
  const done=()=>document.querySelectorAll(".rf-log-strip li").forEach((li)=>li.getAnimations({subtree:true}).forEach((a)=>a.finish()));done();
  const cs=(el,k)=>el?getComputedStyle(el)[k]:null;
  const pale=[...document.querySelectorAll(".rf-log-strip li.prologue")].filter((r)=>!r.classList.contains("inked")&&r.querySelector(".cr-road")).map((r)=>{const p=r.querySelector(".cr-road");
    return{bg:cs(p,"backgroundColor"),press:cs(p,"opacity"),li:cs(r,"opacity"),prose:cs(r.querySelector(".cr-prose"),"opacity"),gutter:cs(r.querySelector(".cr-year"),"opacity")};});
  window.__vellumVoyageStepTo(999);done();
  const told=[...document.querySelectorAll(".rf-log-strip li.prologue.inked .cr-road")].map((p)=>cs(p,"backgroundColor"));
  const status=document.querySelector(".rf-status").textContent,summary=window.__vellumVoyageLog().summary;
  return{rows:rows.length,legs,pale,told,restored:status===summary&&summary!==""};})()`;

export async function rv8bRoadRows({ evaluate, check }: SuiteContext): Promise<void> {
  const r = await evaluate<Rv8bRead>(RV8B_READ);
  const last = r.legs[r.legs.length - 1];
  const failing = r.legs.filter((l) => !rowOk(l));
  check(
    "RV8b the journal's road rows carry Take this road to the Ribbon at that leg's two towns, its sea rows and its last entry carry none, and a press stands pale and unfaded on a row the voyage has not reached, gold once it has (#434)",
    r.rows === r.legs.length + 1 &&
      r.legs.some((l) => l.mode === "road" && !l.last) &&
      r.legs.some((l) => l.mode === "sea") &&
      last !== undefined &&
      last.mode === "road" &&
      failing.length === 0 &&
      r.pale.length > 0 &&
      r.pale.every(paleOk) &&
      r.told.length > 0 &&
      r.told.every((bg) => bg === GOLD) &&
      r.restored,
    JSON.stringify({
      rows: r.rows,
      legs: r.legs.length,
      closing: last?.mode,
      failingRows: failing.map((l) => ({ i: l.i, mode: l.mode, last: l.last, press: l.press !== null })),
      pale: { n: r.pale.length, failing: r.pale.filter((p) => !paleOk(p)).slice(0, 2) },
      told: { n: r.told.length, gold: r.told.filter((bg) => bg === GOLD).length },
      restored: r.restored,
    }),
  );
}

type Point = { x: number; y: number };
type PressRect = Point & { leg: number; hit: boolean };
type State = {
  playing: boolean | null;
  play: string;
  path: string;
  yearInHash: boolean;
  label: string | null;
  focusIsPress: boolean;
  rec: { prevented: boolean; label: string | null }[];
};

// The recorder's own preventDefault keeps the suite in the room when the second press lets the anchor go; it runs after the press's own listener, so `prevented` is the press's verdict.
const RECORDER = `(()=>{window.__rv8c=[];document.addEventListener("click",(e)=>{const p=e.target&&e.target.closest&&e.target.closest(".cr-road");if(!p)return;const l=p.querySelector(".cr-road-label");window.__rv8c.push({prevented:e.defaultPrevented,label:l?l.textContent:null});e.preventDefault();});return true;})()`;
const PLAY_RECT = `(()=>{const b=document.querySelector(".rf-play");b.scrollIntoView({block:"nearest"});const r=b.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};})()`;
const PRESS_RECT = `(()=>{const plan=window.__vellumVoyagePlan();const i=plan.legs.slice(0,-1).findIndex((l)=>l.mode==="road");
  const row=[...document.querySelectorAll(".rf-log-strip li.prologue")][i+1];const p=row&&row.querySelector(".cr-road");if(!p)return null;
  p.scrollIntoView({block:"center"});const r=p.getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;
  const at=document.elementFromPoint(x,y);return{leg:i,x,y,hit:!!at&&(at===p||p.contains(at))};})()`;
const STATE: Payload<State> = `(()=>{const a=window.__vellumReadingRoomAges();const f=document.activeElement;
  const plan=window.__vellumVoyagePlan();const i=plan.legs.slice(0,-1).findIndex((l)=>l.mode==="road");
  const row=[...document.querySelectorAll(".rf-log-strip li.prologue")][i+1];const press=row&&row.querySelector(".cr-road");const lab=press&&press.querySelector(".cr-road-label");
  return{playing:a?a.playing:null,play:document.querySelector(".rf-play").textContent,path:location.pathname,
    yearInHash:new URLSearchParams(location.hash.slice(1)).has("year"),label:lab?lab.textContent:null,
    focusIsPress:!!f&&!!press&&f===press,rec:window.__rv8c||[]};})()`;

export async function rv8cAsksThenGoes(ctx: SuiteContext): Promise<void> {
  const { evaluate, send, check } = ctx;
  const settle = makeSettle(ctx);
  const bar = makeBar(ctx);
  const press = async (): Promise<PressRect> => {
    const rect = await evaluate<PressRect | null>(PRESS_RECT);
    if (rect === null || !rect.hit) throw new Error(`the road press is not reachable: ${JSON.stringify(rect)}`);
    await sendClick(send, rect.x, rect.y);
    return rect;
  };

  await evaluate(`window.__vellumVoyageStepTo(999)`);
  await bar.setYear(0);
  await evaluate(RECORDER);
  const play = await evaluate<Point>(PLAY_RECT);
  await sendClick(send, play.x, play.y);
  const before = await settle(STATE, (s) => s.playing === true, "RV8c the voyage is playing before the press");

  await press();
  const asked = await evaluate<State>(STATE);

  const min = await evaluate<number>(`window.__vellumReadingRoomAges().min`);
  await bar.setYear(min + 50);
  const closed = await settle(
    STATE,
    (s) => s.label === "Take this road" && s.focusIsPress,
    "RV8c the story moving on closes the question while focus stays on the press",
  );

  await press();
  await press();
  const after = await evaluate<State>(STATE);
  const target = await evaluate<string>(`document.querySelector(".cr-road").target`);

  check(
    "RV8c a journal road press pauses the playing voyage and asks Leave the voyage?, the story moving on closes the question, and a second press lets the Ribbon open in this tab (#434)",
    before.playing === true &&
      asked.rec.length === 1 &&
      asked.rec[0]!.prevented === true &&
      asked.playing === false &&
      asked.play === "Play" &&
      asked.yearInHash &&
      asked.label === "Leave the voyage?" &&
      asked.focusIsPress &&
      closed.playing === false &&
      after.rec.length === 3 &&
      after.rec[1]!.prevented === true &&
      after.rec[2]!.prevented === false &&
      after.label === "Take this road" &&
      target === "" &&
      after.path === "/reading-room/",
    JSON.stringify({ before: before.playing, asked, closed: closed.label, after, target }),
  );
}
