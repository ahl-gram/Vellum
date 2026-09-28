import type { SuiteContext } from "../types.ts";
import type { ReadingRoomKit } from "./kit.ts";
import type { Ages } from "./reads.ts";

export async function rr16Colophon({ evaluate, check }: SuiteContext): Promise<void> {
  const colo = await evaluate<{ input: boolean; dice: boolean; read: boolean; inPanel: boolean | null; inFolio: boolean; shown: boolean } | null>(`(()=>{const c=document.querySelector(".rr-colophon");if(!c)return null;const panel=document.querySelector(".rf-ages");return{input:!!c.querySelector("input[type=number]"),dice:!!c.querySelector(".rr-dice"),read:!!c.querySelector(".rr-read"),inPanel:panel?panel.contains(c):null,inFolio:!!c.closest(".corner.tr"),shown:!c.hidden&&getComputedStyle(c).display!=="none"};})()`);
  check(
    "RR16 the colophon dice is the room's one control, top right in the folio: input, dice, Read, outside the panel, visible (#318, re-seated by #462 ruling 2)",
    !!colo && colo.input && colo.dice && colo.read && colo.inPanel === false && colo.inFolio && colo.shown,
    JSON.stringify(colo),
  );
}

export async function rr17CounterRead({ evaluate, check, sleep, plateShown, plateStaysHidden }: ReadingRoomKit): Promise<void> {
  await evaluate(`(()=>{const c=document.querySelector(".rr-colophon");c.querySelector("input").value="42";c.querySelector(".rr-read").click();})()`);
  let counter = null;
  for (let i = 0; i < 300; i++) {
    let s = null;
    try {
      s = await evaluate<{ seed: number; title: string; status: string | undefined; svg: boolean }>(`(()=>{const st=window.__vellumReadingRoomState();return{seed:st.seed,title:st.title,status:(document.querySelector(".rf-status")||{}).textContent,svg:!!document.querySelector(".rf-chart svg")};})()`);
    } catch {}
    if (s && s.svg && s.status === "" && s.seed === 42 && s.title === "The Isle of Rahai") { counter = s; break; }
    await sleep(50);
  }
  check("RR17 Read draws the typed world (seed 42 == 'The Isle of Rahai') without touching the URL", !!counter, JSON.stringify(counter));
  let reInked = false;
  for (let i = 0; i < 120; i++) {
    let ok = null;
    try { ok = await evaluate<boolean>(`[...document.querySelectorAll(".rf-chart #layer-land path")].every((p)=>!p.style.strokeDasharray) && !!document.querySelector(".rf-chart #layer-land path")`); } catch {}
    if (ok) { reInked = true; break; }
    await sleep(50);
  }
  check("RR17b the counter draw replays the arrival ceremony and clears its coast dasharray (no residue)", reInked);
  const restaged = await plateStaysHidden();
  check(
    "RR28 the counter draw clears the old world's plate and stages no new one unasked (#442)",
    restaged === null,
    restaged === null ? "stayed hidden" : JSON.stringify(restaged),
  );
  await evaluate(`(()=>{document.querySelector(".rf-play").click();return null;})()`);
  const restagedByPlay = await plateShown();
  check(
    "RR28b and the control: Play on the counter-drawn world does bring one, so RR28 is a choice and not a corpse (#442)",
    !!restagedByPlay && restagedByPlay.inSlip === true && /(^|#|&)seed=42(&|$)/.test(restagedByPlay.href || ""),
    JSON.stringify(restagedByPlay),
  );
}

export async function rr18Park({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  // Back to the present park so RR18/RR19 below read the rest this draw actually landed at.
  await evaluate(`(()=>{const p=document.querySelector(".rf-play");if(p.textContent==="Pause")p.click();const r=document.querySelector(".rf-range");r.value=r.max;r.dispatchEvent(new Event("input",{bubbles:true}));r.dispatchEvent(new Event("change",{bubbles:true}));return null;})()`);
  await sleep(150);

  const after = await evaluate<{ ages: Ages | null; play: string | null; panelHidden: boolean | null; hash: string; entries: number; inked: number }>(`(()=>{const a=window.__vellumReadingRoomAges();const p=document.querySelector(".rf-play");const panel=document.querySelector(".rf-ages");const rows=[...document.querySelectorAll(".rf-log-strip li")];const entries=rows.filter(r=>!r.classList.contains("annals-head"));return{ages:a,play:p?p.textContent:null,panelHidden:panel?panel.hidden:null,hash:location.hash,entries:entries.length,inked:entries.filter(r=>r.classList.contains("inked")).length};})()`);
  check(
    "RR18 the counter draw re-serializes the address to the new world's present park (seed=42, year=N)",
    !!after.ages && after.ages.chamber === "ages" && after.play === "Play" && after.panelHidden === false &&
      /(^|#|&)seed=42(&|$)/.test(after.hash) && /year=\d+/.test(after.hash),
    JSON.stringify(after),
  );
  check(
    "RR19 the counter draw arrives at rest with the new story fully told (all entries inked)",
    after.entries > 0 && after.inked === after.entries,
    JSON.stringify({ entries: after.entries, inked: after.inked }),
  );
}

export async function rr20Superseded({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  // The worker is FIFO, so the stale seed-7 settle always resolves FIRST; the hold-only form was blind (guard-prover: guard deleted, 304/304 stayed green) and sawForeign is the clause that discriminates.
  await evaluate(`(()=>{const c=document.querySelector(".rr-colophon");const i=c.querySelector("input");const r=c.querySelector(".rr-read");i.value="7";r.click();i.value="42";r.click();})()`);
  let raced = null;
  let sawForeign = false;
  for (let i = 0; i < 300; i++) {
    let s = null;
    try {
      s = await evaluate<{ seed: number; title: string; status: string | undefined }>(`(()=>{const st=window.__vellumReadingRoomState();return{seed:st.seed,title:st.title,status:(document.querySelector(".rf-status")||{}).textContent};})()`);
    } catch {}
    if (s && s.title && s.title !== "The Isle of Rahai") sawForeign = true;
    if (s && s.status === "" && s.seed === 42 && s.title === "The Isle of Rahai") { raced = s; break; }
    await sleep(50);
  }
  await sleep(2000);
  const held = await evaluate<{ seed: number; title: string; hash: string }>(`(()=>{const st=window.__vellumReadingRoomState();return{seed:st.seed,title:st.title,hash:location.hash};})()`);
  check(
    "RR20 a superseded draw can never land over a newer one: the stale settle is dropped, the latest holds",
    !!raced && !sawForeign && held.seed === 42 && held.title === "The Isle of Rahai" && /(^|#|&)seed=42(&|$)/.test(held.hash),
    JSON.stringify({ raced: !!raced, sawForeign, held }),
  );
}

export async function rr21Dice({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  await evaluate(`document.querySelector(".rr-dice").click()`);
  let rolled = null;
  for (let i = 0; i < 300; i++) {
    let s = null;
    try {
      s = await evaluate<{ seed: number; input: string; title: string; status: string | undefined; hash: string }>(`(()=>{const st=window.__vellumReadingRoomState();const v=document.querySelector(".rr-colophon input").value;return{seed:st.seed,input:v,title:st.title,status:(document.querySelector(".rf-status")||{}).textContent,hash:location.hash};})()`);
    } catch {}
    if (s && s.status === "" && s.seed !== 42 && String(s.seed) === s.input) { rolled = s; break; }
    await sleep(50);
  }
  check(
    "RR21 the dice rolls a fresh world and the input, the drawn world, and the address agree",
    !!rolled && !!rolled.title && new RegExp(`(^|#|&)seed=${rolled.seed}(&|$)`).test(rolled.hash),
    JSON.stringify(rolled),
  );
}

export async function rr22MidPlay({ evaluate, check, shoot, sleep }: SuiteContext): Promise<void> {
  await evaluate(`(()=>{document.querySelector(".rf-play").click();})()`);
  await sleep(350);
  const midPlay = await evaluate<{ label: string }>(`(()=>{const p=document.querySelector(".rf-play");return{label:p.textContent};})()`);
  await evaluate(`(()=>{const c=document.querySelector(".rr-colophon");c.querySelector("input").value="42";c.querySelector(".rr-read").click();})()`);
  let interrupted = null;
  for (let i = 0; i < 300; i++) {
    let s = null;
    try {
      s = await evaluate<{ seed: number; title: string; status: string | undefined; chamber: string | null; play: string; entries: number; inked: number }>(`(()=>{const st=window.__vellumReadingRoomState();const a=window.__vellumReadingRoomAges();const p=document.querySelector(".rf-play");const rows=[...document.querySelectorAll(".rf-log-strip li")].filter(r=>!r.classList.contains("annals-head"));return{seed:st.seed,title:st.title,status:(document.querySelector(".rf-status")||{}).textContent,chamber:a&&a.chamber,play:p.textContent,entries:rows.length,inked:rows.filter(r=>r.classList.contains("inked")).length};})()`);
    } catch {}
    if (s && s.status === "" && s.seed === 42 && s.title === "The Isle of Rahai" && s.play === "Play") { interrupted = s; break; }
    await sleep(50);
  }
  check(
    "RR22 a read mid-play interrupts the sweep and still lands parked at the present, fully told",
    midPlay.label === "Pause" && !!interrupted && interrupted.chamber === "ages" &&
      interrupted.entries > 0 && interrupted.inked === interrupted.entries,
    JSON.stringify({ midPlay, interrupted }),
  );
  await shoot("reading-room-colophon.png");
}
