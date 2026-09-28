import { scrubFacts } from "../../support/room.ts";
import type { InstrumentKit } from "./kit.ts";

type Arrival = { seed: number; status: string | undefined; cls: boolean; anim: string };

export async function rs23OtherWorld({ evaluate, check, sleep }: InstrumentKit): Promise<void> {
  // SEED 3 is load-bearing: the one nearby seed whose place COUNT differs from seed 42's (21 vs 26; 13 of 14 sampled seeds carry 26), so visible===count actually discriminates (proved on the mutation run). Do not tidy it to a rounder number.
  const sm2 = await scrubFacts(evaluate, 3);
  await evaluate(`(()=>{const c=document.querySelector(".rr-colophon");c.querySelector("input").value="3";c.querySelector(".rr-read").click();})()`);
  let rs23 = null;
  for (let i = 0; i < 300; i++) {
    let s = null;
    try {
      s = await evaluate<{ seed: number; status: string | undefined; panelShown: boolean; chamber: string | null; year: number | null; max: number; visible: number }>(`(()=>{const st=window.__vellumReadingRoomState();const a=window.__vellumAgesState();const bar=document.querySelector(".rf-range");return{seed:st.seed,status:(document.querySelector(".rf-status")||{}).textContent,
        panelShown:!document.querySelector(".rf-ages").hidden,
        chamber:a&&a.chamber,year:a&&a.year,max:Number(bar.max),
        visible:[...document.querySelectorAll('.rf-chart #layer-settlements g.settlement')].filter((g)=>getComputedStyle(g).display!=="none").length};})()`);
    } catch {}
    if (s && s.status === "" && s.seed === 3) { rs23 = s; break; }
    await sleep(50);
  }
  check(
    "RS23 a draw of a different world re-derives the instrument against THAT world (bar domain and full glyph set)",
    !!rs23 && rs23.panelShown && rs23.chamber === "ages" &&
      rs23.max === 2 * Math.max(1, sm2.present - sm2.minFounded) &&
      rs23.year === sm2.present && rs23.visible === sm2.count,
    JSON.stringify({ rs23, expectedMax: 2 * Math.max(1, sm2.present - sm2.minFounded), expectedCount: sm2.count, present: sm2.present }),
  );
}

export async function rs26Unfurl({ evaluate, check, sleep, room }: InstrumentKit): Promise<void> {
  const arrivedRoom = await room.goto("#seed=42&style=antique&legend=1");
  let rs26 = null;
  for (let i = 0; i < 40; i++) {
    const s = await evaluate<{ cls: boolean; instAnim: string; instDelay: string; logAnim: string; logDelay: string }>(`(()=>{const root=document.querySelector(".rf");
      const inst=document.querySelector(".rf-instrument");const log=document.querySelector(".rf-log");
      return{cls:root.classList.contains("rf-arrival"),
        instAnim:getComputedStyle(inst).animationName,instDelay:getComputedStyle(inst).animationDelay,
        logAnim:getComputedStyle(log).animationName,logDelay:getComputedStyle(log).animationDelay};})()`);
    if (s.cls) { rs26 = s; break; }
    await sleep(30);
  }
  check(
    "RS26 the arrival unfurl plays, staged: instrument and journal wear paperUnfurl, the journal one beat behind (S11's room successor)",
    arrivedRoom && !!rs26 && rs26.instAnim === "paperUnfurl" && rs26.instDelay === "0s" &&
      rs26.logAnim === "paperUnfurl" && rs26.logDelay === "0.18s",
    JSON.stringify({ arrivedRoom, rs26 }),
  );
}

export async function rs27NoReplay({ evaluate, check, sleep }: InstrumentKit): Promise<void> {
  // display:none terminates a CSS animation and restoring display starts it AFRESH; the engine drives the panel's hidden flag on every counter read, so a class left in place would replay the unfurl on every dice roll.
  let rs27clear = false;
  for (let i = 0; i < 60; i++) {
    const c = await evaluate<boolean>(`document.querySelector(".rf").classList.contains("rf-arrival")`);
    if (!c) { rs27clear = true; break; }
    await sleep(50);
  }
  await evaluate(`(()=>{const c=document.querySelector(".rr-colophon");c.querySelector("input").value="7";c.querySelector(".rr-read").click();})()`);
  let rs27 = null;
  for (let i = 0; i < 300; i++) {
    let s = null;
    try {
      s = await evaluate<Arrival>(`(()=>{const st=window.__vellumReadingRoomState();return{seed:st.seed,
        status:(document.querySelector(".rf-status")||{}).textContent,
        cls:document.querySelector(".rf").classList.contains("rf-arrival"),
        anim:getComputedStyle(document.querySelector(".rf-instrument")).animationName};})()`);
    } catch {}
    if (s && s.status === "" && s.seed === 7) { rs27 = s; break; }
    await sleep(50);
  }
  check(
    "RS27 the ceremony never replays: a counter read re-arms the panel with no unfurl (the hidden-toggle flash trap, held off)",
    rs27clear && !!rs27 && rs27.cls === false && rs27.anim === "none",
    JSON.stringify({ rs27clear, rs27 }),
  );
}

export async function rs28Cancel({ evaluate, check, sleep, room }: InstrumentKit): Promise<void> {
  // A read mid-unfurl CANCELS the animations (display:none; animationend never fires), so a removal keyed on animationend alone leaves the class in place and the next unhide replays the whole unfurl.
  const arrivedAgain = await room.goto("#seed=42&style=antique&legend=1");
  let rs28armed = false;
  for (let i = 0; i < 40; i++) {
    if (await evaluate<boolean>(`document.querySelector(".rf").classList.contains("rf-arrival")`)) { rs28armed = true; break; }
    await sleep(25);
  }
  await evaluate(`(()=>{const c=document.querySelector(".rr-colophon");c.querySelector("input").value="9";c.querySelector(".rr-read").click();})()`);
  let rs28 = null;
  for (let i = 0; i < 300; i++) {
    let s = null;
    try {
      s = await evaluate<Arrival>(`(()=>{const st=window.__vellumReadingRoomState();return{seed:st.seed,
        status:(document.querySelector(".rf-status")||{}).textContent,
        cls:document.querySelector(".rf").classList.contains("rf-arrival"),
        anim:getComputedStyle(document.querySelector(".rf-instrument")).animationName};})()`);
    } catch {}
    if (s && s.status === "" && s.seed === 9) { rs28 = s; break; }
    await sleep(50);
  }
  check(
    "RS28 a counter read mid-ceremony cancels it cleanly: the class retires on cancel, no replay on the re-arm",
    arrivedAgain && rs28armed && !!rs28 && rs28.cls === false && rs28.anim === "none",
    JSON.stringify({ arrivedAgain, rs28armed, rs28 }),
  );
}
