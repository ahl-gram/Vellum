// The camera's presses under the hand and under focus (Issue #779 part 2h): dark at four classes deep, on each of the three.
import { PAGE_RGBA, nearRgba, tokenRgba } from "../../support/pixel.ts";
import { sendKey } from "../../support/home.ts";
import type { Payload } from "../../types.ts";
import type { GlassKit } from "../glass-ceremony.ts";
import { PRESSES } from "./dress.ts";

type Reach = { first: number[] | null; tried: number } | null;
const REACH = (
  id: string,
): Payload<Reach> => `(() => { const b = document.getElementById(${JSON.stringify(id)}); if (!b) return null;
  const r = b.getBoundingClientRect(), pts = [[0.5, 0.5], [0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]];
  let tried = 0;
  for (const [fx, fy] of pts) { const x = r.left + r.width * fx, y = r.top + r.height * fy; tried++;
    if (document.elementFromPoint(x, y) === b) return { first: [x, y], tried }; }
  return { first: null, tried }; })()`;

type Press = { bg: number[]; color: number[]; hover: boolean; moving: number } | null;
type Focus = { visible: boolean; bg: number[]; color: number[] } | null;
const PRESS = (
  id: string,
): Payload<Press> => `(() => { const rgba = ${PAGE_RGBA}, b = document.getElementById(${JSON.stringify(id)}); if (!b) return null;
  const st = getComputedStyle(b);
  return { bg: rgba(st.backgroundColor), color: rgba(st.color), hover: b.matches(":hover"), moving: b.getAnimations().length }; })()`;

const FOCUS = (
  id: string,
): Payload<Focus> => `(() => { const rgba = ${PAGE_RGBA}, b = document.getElementById(${JSON.stringify(id)}); if (!b) return null;
  b.focus(); const st = getComputedStyle(b), r = { visible: b.matches(":focus-visible"), bg: rgba(st.backgroundColor), color: rgba(st.color) }; b.blur(); return r; })()`;

async function darkOf(
  { evaluate, send, sleep }: GlassKit,
  id: string,
): Promise<{ id: string; reach: Reach; hover: Press; focus: Focus }> {
  const reach = await evaluate(REACH(id));
  const read: { hover: Press; focus: Focus } = { hover: null, focus: null };
  try {
    if (reach?.first) {
      await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: reach.first[0]!, y: reach.first[1]! });
    }
    read.hover = await evaluate(PRESS(id));
    for (let i = 0; i < 20 && read.hover; i++) {
      if (read.hover.hover && read.hover.moving === 0) break;
      await sleep(50);
      read.hover = await evaluate(PRESS(id));
    }
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5 });
    await sendKey(send, "Shift", "ShiftLeft", 16);
    read.focus = await evaluate(FOCUS(id));
  } finally {
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5 });
    await evaluate(`document.activeElement instanceof HTMLElement && document.activeElement.blur()`);
  }
  return { id, reach, ...read };
}

export async function g10PressDark(k: GlassKit): Promise<void> {
  const reads = [];
  for (const id of PRESSES) reads.push(await darkOf(k, id));
  const dark = reads.every(
    ({ reach, hover, focus }) =>
      !!reach?.first &&
      !!hover &&
      hover.hover &&
      nearRgba(hover.bg, tokenRgba("--ink-dark")) &&
      nearRgba(hover.color, tokenRgba("--parchment-bright")) &&
      !!focus &&
      focus.visible &&
      nearRgba(focus.bg, tokenRgba("--ink-dark")) &&
      nearRgba(focus.color, tokenRgba("--parchment-bright")),
  );
  k.check(
    "G10 each of the camera's three presses goes dark under the hand and under keyboard focus, four classes deep against the house wash",
    dark,
    JSON.stringify(reads),
  );
}
