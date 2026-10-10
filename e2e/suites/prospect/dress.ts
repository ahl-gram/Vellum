// The Prospect's dress at rest on the capital's plate (Issue #779 part 2g): the stage's reserve and depth, the gesture box's wiring, and the plate seated as the sheet's face at its own proportion.
import { nearRgba, PAGE_RGBA, SHADE, tokenRgba } from "../../support/pixel.ts";
import type { Payload } from "../../types.ts";
import type { ProspectKit } from "./kit.ts";

type Dress = {
  pad: number[];
  reserve: number[];
  shadow: { colour: number[]; geometry: string } | null;
  vp: [boolean, string];
  origin: string;
  plate: string[];
  ratio: number[];
};
const DRESS: Payload<Dress> = `(() => { const rgba = ${PAGE_RGBA}, shade = ${SHADE}, id = (s) => document.getElementById(s), stage = document.querySelector(".stage"), st = getComputedStyle(stage);
  const p = id("pp-plate"), pc = getComputedStyle(p), s = id("sheet").getBoundingClientRect();
  return { pad: [st.paddingTop, st.paddingRight, st.paddingBottom, st.paddingLeft].map(parseFloat),
    reserve: ["--reserve-top", "--reserve-right", "--reserve-bottom"].map((r) => parseFloat(stage.style.getPropertyValue(r))),
    shadow: shade(getComputedStyle(id("sheet")).boxShadow), vp: [id("map-viewport").classList.contains("zoomable"), getComputedStyle(id("map-viewport")).touchAction],
    origin: getComputedStyle(id("map")).transformOrigin, plate: [pc.position, pc.top, pc.left], ratio: [s.width / s.height, p.naturalWidth / p.naturalHeight] };
})()`;

export async function pb13Dress({ evaluate, check, opened, parkMouse }: ProspectKit): Promise<void> {
  await opened("the capital, for its dress");
  await parkMouse();
  const d = await evaluate(DRESS);
  const wrong = [
    (d.reserve.every((r) => r > 0) && d.reserve.every((r, i) => Math.abs(d.pad[i]! - r) < 0.5) && d.pad[3] === 0) ||
      "the stage reserves the chrome",
    (!!d.shadow &&
      d.shadow.geometry === "0px 18px 60px 0px" &&
      nearRgba(d.shadow.colour, tokenRgba("--chart-ink", 0.55))) ||
      "the sheet at the stage depth",
    (d.vp[0] && d.vp[1] === "none") || "the gesture box zoomable, touch-action none",
    d.origin === "0px 0px" || "the transform target pivots top left",
    JSON.stringify(d.plate) === JSON.stringify(["absolute", "0px", "0px"]) || "the plate seated at the sheet's origin",
    (Number.isFinite(d.ratio[0]) && Math.abs(d.ratio[0]! - d.ratio[1]!) < 0.01) ||
      "the sheet at the plate's own proportion",
  ].filter((f): f is string => f !== true);
  check(
    "PB13 the Prospect at rest as dressed: the stage reserving the chrome, the sheet at the stage depth, the gesture box zoomable with touch-action none and its target pivoting top left, the plate seated at the sheet's origin, and the sheet at the plate's own proportion",
    wrong.length === 0,
    JSON.stringify({ wrong, d }),
  );
}
