// The Wayfarer's Ribbon as the browser built it (Issue #779 part 2g): the Prospect road standing down until the scroll resolves.
import type { RibbonKit } from "./kit.ts";
import { FETCHED_PLACES, PLACE_PATH } from "../render/place.ts";

export async function rb17PlaceLink(k: RibbonKit): Promise<void> {
  const { evaluate, check, goto, opened } = k;
  await goto("#seed=42&style=antique&type=island&outline=ne-1159315211");
  const st = await opened("a real place's scroll");
  const fetched = await evaluate(FETCHED_PLACES);
  check(
    "RB17 a place's link reaches the Ribbon, which surveys that place",
    st.status === "" && st.blob && fetched.length === 1 && fetched[0] === PLACE_PATH,
    JSON.stringify({ status: st.status, blob: st.blob, fetched }),
  );
}

export async function rb18CardRoad({ check, goto, opened }: RibbonKit): Promise<void> {
  await goto("#seed=42&style=antique&legend=1&arms=0&beasts=0&a=1");
  const st = await opened("the card's road from Paukilua");
  check(
    "RB18 the place card's road arrives on the Explorer's own address with a nonzero departure, and the scroll sets out from that place for its farthest road (Issue #428)",
    st.from === 1 && st.to !== 1 && /^Paukilua to /.test(st.title ?? ""),
    JSON.stringify({ from: st.from, to: st.to, title: st.title }),
  );
}

// Tewetulua (24) is seed 42's one settlement no road leaves, PB7e's witness in e2e/suites/prospect.ts.
export const ORPHAN = 24;

const WATCH = `(() => { window.__rb16 = null; new MutationObserver(() => { const s = document.getElementById("rb-status"); if (window.__rb16 || !s || !s.textContent) return;
  const road = document.getElementById("rb-prospect-link"), plate = document.getElementById("rb-plate");
  window.__rb16 = { status: s.textContent, road: road && getComputedStyle(road).display, plateHidden: !!plate && plate.hidden }; }).observe(document, { childList: true, subtree: true, characterData: true }); })();`;

export async function rb16RoadStandsDown({ evaluate, send, check, goto, opened }: RibbonKit): Promise<void> {
  const { identifier } = await send<{ identifier: string }>("Page.addScriptToEvaluateOnNewDocument", { source: WATCH });
  try {
    await goto("#seed=42");
    await opened("seed 42, watched from boot");
    const r = await evaluate<{
      first: { status: string; road: string | null; plateHidden: boolean } | null;
      drawn: string;
    }>(`({ first: window.__rb16, drawn: getComputedStyle(document.getElementById("rb-prospect-link")).display })`);
    check(
      "RB16 the Prospect road stands down until the scroll resolves: at the draw's first status line the road is not shown and the plate still hidden, and once the scroll is drawn the road stands (the control)",
      !!r.first &&
        r.first.status === "The surveyor unrolls the scroll…" &&
        r.first.road === "none" &&
        r.first.plateHidden &&
        r.drawn !== "none",
      JSON.stringify(r),
    );
  } finally {
    await send("Page.removeScriptToEvaluateOnNewDocument", { identifier });
  }
}
