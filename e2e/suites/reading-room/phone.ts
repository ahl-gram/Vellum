import type { SuiteContext } from "../../types.ts";
import type { ReadingRoomKit } from "./kit.ts";
import { stripRead } from "./reads.ts";

export async function rr34bPhone({ evaluate, send, check, shoot, sleep, boot, settled, PORT }: ReadingRoomKit, ctx: SuiteContext): Promise<void> {
  // Device metrics go on BEFORE the navigation (the CDP-touch rule; no touch is dispatched), and the probe waits out the paperUnfurl: its keyframe fakes a sideways overflow in mid-flight geometry (the Issue #312 screenshot rule).
  await ctx.setNarrowViewport(390, 844);
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/#seed=42&style=antique&legend=1` });
  // Issue #463 (skeptic on PR #492): between the boot and the arm the engine's panel is hidden and the slip inside it has no rect; a fit that read its zero top reserved the whole viewport and seated the Glass above it. Sampled through the boot, before the arm lands.
  let glassOff = 0, glassSamples = 0, preArm = 0;
  for (let i = 0; i < 160; i++) {
    let s = null;
    try { s = await evaluate<{ armed: boolean; bottom: number; top: number; vh: number; sheetH: string } | null>(`(()=>{const g=document.querySelector(".corner.br.zoomery");const a=typeof window.__vellumReadingRoomAges==="function"?window.__vellumReadingRoomAges():null;if(!g)return null;const r=g.getBoundingClientRect();return{armed:!!a,bottom:r.bottom,top:r.top,vh:innerHeight,sheetH:getComputedStyle(document.body).getPropertyValue("--sheet-h")};})()`); } catch {}
    if (s) { glassSamples++; if (!s.armed) preArm++; if (s.bottom > s.vh + 1 || s.top < 0 || parseFloat(s.sheetH || "0") > s.vh) glassOff++; if (s.armed) break; }
    await sleep(50);
  }
  const mobileSettled = (await boot()) && (await settled());
  await sleep(1600);
  check(
    "RR34b through the phone's boot, before the arm, the Glass stays on the viewport and --sheet-h never exceeds it (a slip hidden with the panel reads as absent to the fit)",
    // The witness: at least one sample from BEFORE the arm, or the probe read only the settled room.
    glassSamples > 0 && preArm > 0 && glassOff === 0,
    JSON.stringify({ glassSamples, preArm, glassOff }),
  );
  const mobile = await evaluate<{ w: number; vw: number }>(`({w:document.body.scrollWidth,vw:window.innerWidth})`);
  // Issue #442 ruled 2026-08-23: on a phone the CONTROLS stick and the live row does not, so the strip stays the bar's own height; read after the same dwell, at the same viewport.
  const mobileStrip = await evaluate(stripRead);
  // Issue #462 ruling 6's phone half: the scale loses its LABELS, not its star.
  const mobileScale = await evaluate<{ labelsHidden: boolean; seamShown: boolean }>(`(()=>{const sc=document.querySelector(".scale");const lbl=[...sc.querySelectorAll(".tick .lbl")];const seam=sc.querySelector(".seam");return{labelsHidden:lbl.length>0&&lbl.every((l)=>getComputedStyle(l).display==="none"),seamShown:!!seam&&seam.getBoundingClientRect().width>0};})()`);
  await evaluate(`(()=>{window.scrollTo(0,900);return null;})()`);
  await sleep(120);
  const mobileStuck = await evaluate(stripRead);
  await evaluate(`(()=>{window.scrollTo(0,0);return null;})()`);
  const mobilePace = await evaluate<string>(`(()=>{const g=document.querySelector(".rf-instrument .rf-pace");return g?getComputedStyle(g).display:"(no-el)";})()`);
  await shoot("reading-room-390.png");
  await ctx.clearMobile();
  check("RR38 at 390px the pace group drops (#493; the mockup's phone rule, strip-scoped)", mobilePace === "none", JSON.stringify({ mobilePace }));
  check(
    "RR11 at 390px the room lays out with no sideways scroll (chart over log, one page scroll)",
    mobileSettled && mobile.w === 390,
    JSON.stringify(mobile),
  );
  // The compact form MEASURED, not merely observed to exist: at 390 the bar itself wraps to two lines, so the strip is 98 even with the live row gone (plate-reader 2026-08-23); collecting the height and never asserting it is how a "measured at that width" criterion gets gathered and discarded.
  const PHONE_STRIP_MAX = 72; // measured 63 at 390 (2026-08-29): the bar, its scale under it, no told row
  check(
    "RR34 at 390px the live row is dropped, the strip stays fixed on the bottom edge, and its height is measured (#442, ruled 2026-08-23; the bottom strip since #463)",
    !!mobileStrip && mobileStrip.toldDisplay === "none" && mobileScale.labelsHidden && mobileScale.seamShown &&
      mobileStrip.h > 0 && mobileStrip.h <= PHONE_STRIP_MAX &&
      !!mobileStuck && mobileStuck.bottom === 0 && mobileStuck.position === "fixed",
    JSON.stringify({ rest: mobileStrip, stuck: mobileStuck, scale: mobileScale, phoneMax: PHONE_STRIP_MAX }),
  );
}

export async function rr11bScrubHandles({ evaluate, check }: SuiteContext): Promise<void> {
  // Issue #124: the room builds the same overlay the Explorer does, so it LOOKS like it should card; it does not, since the ages chamber is armed on every draw and the overlay is permanently .scrub with every hit inert. Pinned because reading the call site alone says the opposite.
  const rrCard = await evaluate<{ hits: number; card: boolean; scrub?: undefined; pe?: undefined; hidden?: undefined } | { hits: number; card: true; scrub: boolean; pe: string; hidden: boolean }>(`(()=>{
    const hits=[...document.querySelectorAll(".place-hit")];
    const card=document.getElementById("place-card");
    if(!hits.length||!card) return {hits:hits.length,card:!!card};
    const hit=hits[Math.floor(hits.length/2)];
    hit.focus(); hit.click();
    return {hits:hits.length,card:true,scrub:document.querySelector(".place-overlay").classList.contains("scrub"),pe:getComputedStyle(hit).pointerEvents,hidden:card.hidden};
  })()`);
  check(
    "RR11b the room's marks are scrub handles, not card hits: the place card never opens there",
    rrCard.hits > 0 && rrCard.card === true && rrCard.scrub === true && rrCard.pe === "none" && rrCard.hidden === true,
    JSON.stringify(rrCard),
  );
}
