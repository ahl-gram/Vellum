// What a press and print do on the Ribbon (Issue #779 part 2g): paper standing a leaned camera down.
import { PAGE_RGBA } from "../../support/pixel.ts";
import type { Payload } from "../../types.ts";
import { homeCamera, LENS, lensRest } from "../print-room/print.ts";
import type { RibbonKit } from "./kit.ts";
import { pressAt } from "../print-room/kit.ts";
import { mouseMove } from "../../support/input.ts";

type Lean = {
  x: number;
  y: number;
  hover: boolean;
  focus: boolean;
  active: boolean;
  on: boolean;
  moving: boolean;
  stops: number[][];
  image: string;
  transform: string;
  shadow: string;
};
const LEAN: Payload<Lean> = `(() => { const rgba = ${PAGE_RGBA}, b = document.querySelector("#rb-itinerary .lean"), r = b.getBoundingClientRect(), cs = getComputedStyle(b);
  return { x: r.left + Math.min(40, r.width / 2), y: r.top + r.height / 2, hover: b.matches(":hover"), focus: b.matches(":focus-visible"), active: b.matches(":active"), on: b.parentElement.classList.contains("on"), moving: b.getAnimations().length > 0, image: cs.backgroundImage,
    stops: /^linear-gradient\\(to right, /.test(cs.backgroundImage) ? (cs.backgroundImage.match(/(color|rgba?|oklab)\\([^)]*\\)/g) || []).map(rgba) : [], transform: cs.transform, shadow: cs.boxShadow }; })()`;

type Paper = { map: string; plate: (string | number)[] };
const PAPER: Payload<Paper> = `(() => { const p = document.getElementById("rb-plate"), r = p.getBoundingClientRect();
  return { map: getComputedStyle(document.getElementById("map")).transform, plate: [getComputedStyle(p).position, r.width, (r.height / r.width) / (p.naturalHeight / p.naturalWidth)] }; })()`;

export async function rb15Paper(k: RibbonKit): Promise<void> {
  const { evaluate, send, check, sleep, opened } = k;
  await opened("seed 42, for paper");
  try {
    const row = await evaluate(LEAN);
    await pressAt({ send }, row.x, row.y);
    await mouseMove(send, 1, 700);
    const screen = await lensRest({ evaluate, sleep }, "leaned", "ribbon-row-leaned");
    await send("Emulation.setEmulatedMedia", { media: "print" });
    const paper = await evaluate(PAPER);
    await send("Emulation.setEmulatedMedia", { media: "" });
    const back = await evaluate(LENS);
    check(
      "RB15 paper stands a leaned camera down: a real press on a row leans the Glass (the screen read the control, and again after paper), and on paper the transform target is untransformed and the scroll stands in flow at its own proportion",
      screen.zoomed &&
        screen.k > 1 &&
        paper.map === "none" &&
        paper.plate[0] === "static" &&
        (paper.plate[1] as number) > 0 &&
        Math.abs((paper.plate[2] as number) - 1) < 0.01 &&
        back.t === screen.t,
      JSON.stringify({ row, screen, paper, back }),
    );
  } finally {
    await send("Emulation.setEmulatedMedia", { media: "" });
    await evaluate(`(() => { if (document.activeElement) document.activeElement.blur(); return true; })()`);
    await homeCamera(k);
  }
}
