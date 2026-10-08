import type { SuiteContext } from "../../types.ts";
import type { ReadingRoomKit } from "./kit.ts";

// On a 1024 tablet since Issue #762 took the narrow layout away (it ran after the phone's boot at 390): touch on before the navigate, the CDP-touch rule.
export async function rr11bScrubHandles(
  { evaluate, send, check, boot, settled, PORT }: ReadingRoomKit,
  ctx: SuiteContext,
): Promise<void> {
  await ctx.setNarrowViewport(1024, 800);
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/#seed=42&style=antique&legend=1` });
  const booted = (await boot()) && (await settled());
  // Issue #124: the room builds the same overlay the Explorer does, so it LOOKS like it should card; it does not, since the ages chamber is armed on every draw and the overlay is permanently .scrub with every hit inert. Pinned because reading the call site alone says the opposite.
  const rrCard = await evaluate<
    | { hits: number; card: boolean; scrub?: undefined; pe?: undefined; hidden?: undefined }
    | { hits: number; card: true; scrub: boolean; pe: string; hidden: boolean }
  >(`(()=>{
    const hits=[...document.querySelectorAll(".place-hit")];
    const card=document.getElementById("place-card");
    if(!hits.length||!card) return {hits:hits.length,card:!!card};
    const hit=hits[Math.floor(hits.length/2)];
    hit.focus(); hit.click();
    return {hits:hits.length,card:true,scrub:document.querySelector(".place-overlay").classList.contains("scrub"),pe:getComputedStyle(hit).pointerEvents,hidden:card.hidden};
  })()`);
  check(
    "RR11b the room's marks are scrub handles, not card hits: the place card never opens there",
    booted &&
      rrCard.hits > 0 &&
      rrCard.card === true &&
      rrCard.scrub === true &&
      rrCard.pe === "none" &&
      rrCard.hidden === true,
    JSON.stringify(rrCard),
  );
  await ctx.clearMobile();
}
