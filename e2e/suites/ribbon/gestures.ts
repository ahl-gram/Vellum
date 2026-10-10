// What a hover, a press and print do on the Ribbon (Issue #779 part 2g): a row's hover in the text's dress, the Glass and its silent refit, and paper standing a leaned camera down.
import { nearRgba, PAGE_RGBA, tokenRgba } from "../../support/pixel.ts";
import { makeSettle } from "../../support/settle.ts";
import type { Payload } from "../../types.ts";
import { glideLanded, homeCamera, LENS, midGlideRefit, lensRest, ZOOM_IN } from "../print-room/print.ts";
import type { RibbonKit } from "./kit.ts";
import { pressAt } from "../print-room/kit.ts";

type Lean = {
  x: number;
  y: number;
  hover: boolean;
  moving: boolean;
  stops: number[][];
  image: string;
  transform: string;
  shadow: string;
};
const LEAN: Payload<Lean> = `(() => { const rgba = ${PAGE_RGBA}, b = document.querySelector("#rb-itinerary .lean"), r = b.getBoundingClientRect(), cs = getComputedStyle(b);
  return { x: r.left + Math.min(40, r.width / 2), y: r.top + r.height / 2, hover: b.matches(":hover"), moving: b.getAnimations().length > 0, image: cs.backgroundImage,
    stops: /^linear-gradient\\(to right, /.test(cs.backgroundImage) ? (cs.backgroundImage.match(/(color|rgba?|oklab)\\([^)]*\\)/g) || []).map(rgba) : [], transform: cs.transform, shadow: cs.boxShadow }; })()`;

export async function rb13RowHover(k: RibbonKit): Promise<void> {
  const { evaluate, send, check, sleep, opened } = k;
  await opened("seed 42, for a row's hover");
  try {
    const atRest = await evaluate(LEAN);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: atRest.x, y: atRest.y });
    const hovered = await makeSettle({ evaluate, sleep })(
      LEAN,
      (d, last) => d.hover && !d.moving && !!last && JSON.stringify(d) === JSON.stringify(last),
      "ribbon-row-hovered",
    );
    check(
      "RB13 a row's hover keeps the text's dress against the house button skin: at rest no wash (the control), under a real hand the gold wash fading to nothing, no lift and no shadow",
      atRest.image === "none" &&
        hovered.stops.length === 2 &&
        nearRgba(hovered.stops[0], tokenRgba("--control-gold")) &&
        hovered.stops[1]![3] === 0 &&
        hovered.transform === "none" &&
        hovered.shadow === "none",
      JSON.stringify({ atRest, hovered }),
    );
  } finally {
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 700 });
  }
}

export async function rb14Glass(k: RibbonKit): Promise<void> {
  const { evaluate, check, opened, send } = k;
  await opened("seed 42, for the Glass");
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
  const press = await evaluate(ZOOM_IN);
  try {
    if (press) await pressAt({ send }, press.x, press.y);
    const leaned = await lensRest(k, "leaned", "ribbon-leaned");
    await homeCamera(k);
    const glide = await midGlideRefit(k);
    check(
      "RB14 the Glass answers a real press on the scroll: the draw-nearer press leans the camera to 1.4, and a re-seat mid-glide still lands the glide",
      press?.hit === "zoom-in" && leaned.zoomed && Math.abs(leaned.k - 1.4) < 0.005 && glideLanded(glide),
      JSON.stringify({ press, leaned, glide }),
    );
  } finally {
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
    await evaluate(`(() => { if (document.activeElement) document.activeElement.blur(); return true; })()`);
  }
}

type Paper = { map: string; plate: (string | number)[] };
const PAPER: Payload<Paper> = `(() => { const p = document.getElementById("rb-plate"), r = p.getBoundingClientRect();
  return { map: getComputedStyle(document.getElementById("map")).transform, plate: [getComputedStyle(p).position, r.width, (r.height / r.width) / (p.naturalHeight / p.naturalWidth)] }; })()`;

export async function rb15Paper(k: RibbonKit): Promise<void> {
  const { evaluate, send, check, sleep, opened } = k;
  await opened("seed 42, for paper");
  try {
    const row = await evaluate(LEAN);
    await pressAt({ send }, row.x, row.y);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 700 });
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
