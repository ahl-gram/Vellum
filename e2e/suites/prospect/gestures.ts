// What a press, a hover, a key and print do on the Prospect (Issue #779 part 2g): the Glass and its silent refit, paper, and the filing press.
import { countLine, LAY_ON_PAGE, layPressFace } from "../../../src/site/explorer/chart-drawer.ts";
import { parseTableValue } from "../../../src/site/shared/table-address.ts";
import { nearRgba, PAGE_RGBA, tokenRgba } from "../../support/pixel.ts";
import { makeSettle } from "../../support/settle.ts";
import type { Payload } from "../../types.ts";
import { glideLanded, homeCamera, midGlideRefit, lensRest, ZOOM_IN } from "../print-room/print.ts";
import { STORE, type ProspectKit } from "./kit.ts";

type Paper = { map: string; plate: (string | number)[] };
const PAPER: Payload<Paper> = `(() => { const p = document.getElementById("pp-plate"), r = p.getBoundingClientRect();
  return { map: getComputedStyle(document.getElementById("map")).transform, plate: [getComputedStyle(p).position, r.width, r.height / r.width, p.naturalHeight / p.naturalWidth] }; })()`;

export async function pb14Glass(k: ProspectKit): Promise<void> {
  const { evaluate, send, check, opened, parkMouse, pressAt } = k;
  await opened("the capital, for the Glass");
  await parkMouse();
  try {
    const press = await evaluate(ZOOM_IN);
    if (press) await pressAt(press.x, press.y);
    const leaned = await lensRest(k, "leaned", "prospect-leaned");
    await send("Emulation.setEmulatedMedia", { media: "print" });
    const paper = await evaluate(PAPER);
    await send("Emulation.setEmulatedMedia", { media: "" });
    await homeCamera(k);
    const glide = await midGlideRefit(k);
    check(
      "PB14 the Glass answers a real press, and paper stands it down: the draw-nearer press leans the camera to 1.4 (the screen read the control), on paper the transform target is untransformed and the plate stands in flow at its own proportion, and a re-seat mid-glide still lands the glide",
      press?.hit === "zoom-in" &&
        leaned.zoomed &&
        Math.abs(leaned.k - 1.4) < 0.005 &&
        paper.map === "none" &&
        paper.plate[0] === "static" &&
        (paper.plate[1] as number) > 0 &&
        Math.abs((paper.plate[2] as number) - (paper.plate[3] as number)) < 0.01 &&
        glideLanded(glide),
      JSON.stringify({ press, leaned, paper, glide }),
    );
  } finally {
    await send("Emulation.setEmulatedMedia", { media: "" });
    await parkMouse();
  }
}

type Press = {
  text: string;
  dim: boolean;
  disabled: boolean;
  ground: number[];
  line: number[];
  ink: number[];
  opacity: string;
  face: boolean;
  file: string;
  hover: boolean;
  focus: boolean;
  active: boolean;
  x: number;
  y: number;
  hit: boolean;
  table: string | null;
  device: string | null;
  count: string;
  roads: (string | null)[];
};
const PRESS: Payload<Press> = `(() => { const rgba = ${PAGE_RGBA}, p = document.getElementById("pp-lay"), cs = getComputedStyle(p), r = p.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
  const face = cs.fontFamily === (() => { const q = document.createElement("span"); q.style.fontFamily = "var(--font-display)"; document.body.append(q); const f = getComputedStyle(q).fontFamily; q.remove(); return f; })(), href = (id) => document.getElementById(id).getAttribute("href");
  return { text: p.textContent, dim: p.classList.contains("dim"), disabled: p.disabled, ground: rgba(cs.backgroundColor), line: rgba(cs.borderTopColor), ink: rgba(cs.color), opacity: cs.opacity, face,
    file: getComputedStyle(p.parentElement).display, hover: p.matches(":hover"), focus: p.matches(":focus-visible"), active: document.activeElement === p, x, y, hit: document.elementFromPoint(x, y) === p,
    table: new URLSearchParams(location.hash.slice(1)).get("table"), device: localStorage.getItem(${STORE}), count: document.getElementById("pp-lay-count").textContent, roads: [href("pp-chart-link"), href("pp-ribbon-link")] }; })()`;
const held = (k: ProspectKit, label: string, ok: (p: Press) => boolean): Promise<Press> =>
  makeSettle(k)(PRESS, (d, last) => ok(d) && !!last && JSON.stringify(d) === JSON.stringify(last), label);
const tone = (p: Press, ground: Parameters<typeof tokenRgba>[0], line: Parameters<typeof tokenRgba>[0]) =>
  nearRgba(p.ground, tokenRgba(ground)) && nearRgba(p.line, tokenRgba(line));

async function pb15Lay(k: ProspectKit): Promise<{ rest: Press; hover: Press; laid: Press }> {
  const { send, moveTo, pressAt } = k;
  const atRest = await held(k, "prospect-press-at-rest", () => true);
  await moveTo(atRest.x, atRest.y);
  const hover = await held(k, "prospect-press-hovered", (p) => p.hover);
  await pressAt(atRest.x, atRest.y);
  const laid = await held(k, "prospect-press-laid", (p) => !!p.table);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: laid.x, y: laid.y });
  return { rest: atRest, hover, laid };
}

async function pb15Held(k: ProspectKit): Promise<{ under: Press; away: Press; keyed: Press; again: Press }> {
  const { evaluate, send, sleep, parkMouse, pressAt } = k;
  const under = await held(k, "prospect-dim-hovered", (p) => p.hover && p.dim);
  await parkMouse();
  const away = await held(k, "prospect-dim-at-rest", (p) => !p.hover);
  await evaluate(`(() => { document.querySelector("#note .slip-fold").focus(); return true; })()`);
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  const keyed = await held(k, "prospect-dim-keyed", (p) => p.active);
  await pressAt(keyed.x, keyed.y);
  for (let i = 0; i < 8; i++) await sleep(50);
  const again = await held(k, "prospect-press-again", () => true);
  return { under, away, keyed, again };
}

export async function pb15FilingPress(k: ProspectKit): Promise<void> {
  const { evaluate, check, goto, opened, forget, parkMouse } = k;
  await forget();
  await goto("#seed=42&i=0");
  await opened("the capital, on a bare table");
  await parkMouse();
  try {
    const { rest: r, hover, laid } = await pb15Lay(k);
    const { under, away, keyed, again } = await pb15Held(k);
    const one = laid.table ?? "";
    const wrong = [
      (r.text === LAY_ON_PAGE &&
        !r.dim &&
        !r.disabled &&
        r.count === countLine([]) &&
        tone(r, "--control-gold", "--line-tan") &&
        r.face &&
        r.file === "flex") ||
        "at rest, the press gold in the display face",
      tone(hover, "--control-gold", "--ink-brown") || "hovered, the press gold with an ink-brown rule",
      (r.hit &&
        laid.device === one &&
        laid.roads.every((h) => !!h && h.includes(`table=${one}`)) &&
        laid.dim &&
        laid.text === layPressFace({ holds: true, full: false }, LAY_ON_PAGE).label &&
        laid.count === countLine(parseTableValue(one))) ||
        "a real press files the plate: the device, both roads, the dimmed face and the count",
      tone(under, "--control-cream", "--line-faint") || "the dim held under the hand",
      (tone(away, "--control-cream", "--line-faint") &&
        away.opacity === "1" &&
        nearRgba(away.ink, tokenRgba("--ink-dark")) &&
        !away.disabled) ||
        "the dim by ground, never by opacity, and never disabled",
      (keyed.focus && tone(keyed, "--control-cream", "--line-faint")) || "the dim held under a keyboard focus",
      (again.table === one && again.device === one && again.count === laid.count && again.text === laid.text) ||
        "a second press refused, the table untouched",
    ].filter((f): f is string => f !== true);
    check(
      "PB15 the filing press on the engraver's note: gold at rest in the display face on its flex row, gold with an ink-brown rule under a hand, a real press files the plate to the device and both roads and dims the face with its count, the dim held by ground (never opacity, never disabled) under a hand and under a keyboard focus, and a second press refused (#522, #634)",
      wrong.length === 0,
      JSON.stringify({ wrong, rest: r, hover, laid, under, away, keyed, again }),
    );
  } finally {
    await parkMouse();
    await evaluate(`(() => { if (document.activeElement) document.activeElement.blur(); return true; })()`);
    await forget();
  }
}
