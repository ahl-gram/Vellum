// The Hunt's stage at rest (Issue #779 part 2g): fixed over the window, each box its full size, the reserve as padding, the clip only while zoomed.
import type { Payload, SuiteContext } from "../../types.ts";

type Box = number[];
type StageDress = {
  pos: string;
  stage: Box;
  win: Box;
  vp: Box;
  map: Box;
  pad: number[];
  reserve: number[];
  overflow: string[];
};
const STAGE: Payload<StageDress> = `(() => { const box = (e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; };
  const stage = document.querySelector(".stage"), vp = document.getElementById("map-viewport"), map = document.getElementById("map"), cs = getComputedStyle(map);
  const rest = getComputedStyle(vp).overflow; vp.classList.add("zoomed"); const zoomed = getComputedStyle(vp).overflow; vp.classList.remove("zoomed");
  return { pos: getComputedStyle(stage).position, stage: box(stage), win: [0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight], vp: box(vp), map: box(map),
    pad: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(parseFloat),
    reserve: ["--reserve-top", "--reserve-right", "--reserve-bottom"].map((p) => parseFloat(map.style.getPropertyValue(p))), overflow: [rest, zoomed] }; })()`;
const near = (a: Box, b: Box): boolean => a.length === b.length && a.every((v, i) => Math.abs(v - b[i]!) <= 0.5);

export async function hg7Stage({ evaluate, check }: SuiteContext): Promise<void> {
  const s = await evaluate(STAGE);
  check(
    "HG7 the Hunt's stage at rest: the stage fixed over the whole window, the gesture box and the transform target each its full box, the target's padding the chrome's reserve, and the gesture box clipping only while zoomed (#167, #462)",
    s.pos === "fixed" &&
      near(s.stage, s.win) &&
      near(s.vp, s.stage) &&
      near(s.map, s.vp) &&
      s.reserve.every((r) => r > 0) &&
      s.reserve.every((r, i) => Math.abs(s.pad[i]! - r) < 0.5) &&
      s.pad[3] === 0 &&
      JSON.stringify(s.overflow) === JSON.stringify(["visible", "hidden"]),
    JSON.stringify(s),
  );
}
