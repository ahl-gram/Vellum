import type { SuiteContext } from "../types.ts";
import type { ReadingRoomKit } from "./kit.ts";
import { agesRead, stripRead } from "./reads.ts";

export async function rr0Boots({ evaluate, check, sleep, boot, settled }: ReadingRoomKit): Promise<void> {
  check("RR0 reading-room page booted (worker hook present)", await boot());
  check("RR1 render worker active (no silent cross-directory fallback)", await evaluate<boolean>(`window.__vellumReadingRoomUsesWorker() === true`));
  check("RR2 the deep-linked chart renders into the frame and settles", await settled());
  let inked = false;
  for (let i = 0; i < 120; i++) {
    let ok = null;
    try { ok = await evaluate<boolean>(`[...document.querySelectorAll(".rf-chart #layer-land path")].every((p)=>!p.style.strokeDasharray) && !!document.querySelector(".rf-chart #layer-land path")`); } catch {}
    if (ok) { inked = true; break; }
    await sleep(50);
  }
  check("RR2b the arrival ceremony plays and clears its inline coast dasharray (no residue)", inked);
  const st = await evaluate<{ seed: number; title: string }>(`(()=>{const s=window.__vellumReadingRoomState();return{seed:s.seed,title:s.title};})()`);
  check("RR3 the world is the deep-linked one (seed 42 == 'The Isle of Rahai')", st.seed === 42 && st.title === "The Isle of Rahai", JSON.stringify(st));
}

export async function rr4AtRest({ evaluate, check }: SuiteContext): Promise<void> {
  const rest = await evaluate(agesRead);
  check(
    "RR4 arrival is at rest at the present: armed, ages chamber, Play parked, year in the hash",
    !!rest.ages && rest.ages.chamber === "ages" && rest.panelHidden === false &&
      rest.play === "Play" && /(^|#|&)seed=42(&|$)/.test(rest.hash) && /year=\d+/.test(rest.hash),
    JSON.stringify(rest),
  );

  // #463 (skeptic on PR #492, round 3): the scale and the folio are DRAWN from the world, not merely present in the markup.
  const drawn = await evaluate<{ days: number; years: number; seam: number; labels: string[]; folioTitle: string; folioSub: string }>(`(()=>{const sc=document.querySelector(".scale");const t=(sel)=>(document.querySelector(sel)||{}).textContent||"";const lbl=[...sc.querySelectorAll(".tick .lbl")].map((l)=>l.textContent);return{days:sc.querySelectorAll(".tick.day").length,years:sc.querySelectorAll(".tick.year").length,seam:sc.querySelectorAll(".seam").length,labels:lbl,folioTitle:t("#folio-title"),folioSub:t("#folio-sub")};})()`);
  check(
    "RR4b the strip's scale is drawn from the world (two day ticks, the star, the centuries and the present) and the chart folio carries the world's name and survey line (#463)",
    !!drawn && drawn.days === 2 && drawn.seam === 1 && drawn.years >= 2 && drawn.labels.includes("day 1") && drawn.labels.some((l) => /^\d{3,4}$/.test(l)) && // eslint-disable-line @typescript-eslint/no-unnecessary-condition
      drawn.labels.length === new Set(drawn.labels).size && /Chart № 42/.test(drawn.folioTitle) && drawn.folioSub.length > 20,
    JSON.stringify(drawn),
  );

  const journal = await evaluate<{ rows: number; entries: number; inked: number }>(`(()=>{const rows=[...document.querySelectorAll(".rf-log-strip li")];const entries=rows.filter(r=>!r.classList.contains("annals-head"));return{rows:rows.length,entries:entries.length,inked:entries.filter(r=>r.classList.contains("inked")).length};})()`);
  check(
    "RR5 the journal is fully told at the present park (all entries inked)",
    journal.entries > 0 && journal.inked === journal.entries,
    JSON.stringify(journal),
  );
}

export async function rr26BareVisit({ evaluate, check, plateStaysHidden }: ReadingRoomKit): Promise<void> {
  const noPlate = await plateStaysHidden();
  check(
    "RR26 a plain visit opens BARE: no plate until the reader asks for one (#442)",
    noPlate === null,
    noPlate === null ? "stayed hidden" : JSON.stringify(noPlate),
  );

  const strip = await evaluate(stripRead);
  const lastAnnal = await evaluate<{ year: string; text: string } | null>(`(()=>{const rows=[...document.querySelectorAll(".rf-log-strip li")].filter(r=>!r.classList.contains("annals-head")&&r.classList.contains("inked"));const li=rows[rows.length-1];return li?{year:li.querySelector(".cr-year").textContent,text:li.querySelector(".cr-text").textContent}:null;})()`);
  check(
    "RR30 the bottom strip carries the annal being told above the bar, mirroring the journal's own row (#442; fixed at the bottom since #463)",
    !!strip && strip.position === "fixed" && strip.toldHidden === false && strip.toldAbove === true &&
      !!lastAnnal && strip.gutter === lastAnnal.year && strip.text === lastAnnal.text,
    JSON.stringify({ strip, lastAnnal }),
  );
}

export async function rr29Play({ evaluate, check, plateShown }: ReadingRoomKit): Promise<void> {
  await evaluate(`(()=>{document.querySelector(".rf-play").click();return null;})()`);
  const played = await plateShown();
  check(
    "RR29 pressing Play asks for the picture, and one arrives on the slip above the journal (#442; #463)",
    !!played && played.inSlip === true && played.aboveLog === true,
    JSON.stringify(played),
  );
  await evaluate(`(()=>{const p=document.querySelector(".rf-play");if(p.textContent==="Pause")p.click();return null;})()`);
}
