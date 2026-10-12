// The camera's press at rest (Issue #779 part 2h): home's face, the body's own padding and display.
import { PAGE_RGBA, nearRgba, tokenRgba } from "../../support/pixel.ts";
import type { Payload } from "../../types.ts";
import type { GlassKit } from "../glass-ceremony.ts";

type Press = {
  h: number;
  family: string;
  size: number;
  lineHeight: string;
  color: number[];
  bg: number[];
  bw: string;
  bs: string;
  bc: number[];
  pad: (string | null)[];
  display: string;
  probeFamily: string;
  probePad: (string | null)[];
  probeDisplay: string;
  rem: number;
} | null;
const FACE: Payload<Press> = `(() => { const rgba = ${PAGE_RGBA}, cs = (e) => getComputedStyle(e), b = document.getElementById("zoom-in");
  if (!b) return null; const st = cs(b);
  const span = document.createElement("span"); span.style.fontFamily = "var(--font-body)"; document.body.appendChild(span);
  const probeFamily = cs(span).fontFamily; span.remove();
  const probe = document.createElement("button"); document.getElementById("zoom-controls").appendChild(probe);
  const pb = cs(probe), probePad = [pb.paddingTop, pb.paddingLeft], probeDisplay = pb.display; probe.remove();
  return { h: b.getBoundingClientRect().height, family: st.fontFamily, size: parseFloat(st.fontSize), lineHeight: st.lineHeight,
    color: rgba(st.color), bg: rgba(st.backgroundColor), bw: st.borderTopWidth, bs: st.borderTopStyle, bc: rgba(st.borderTopColor),
    pad: [st.paddingTop, st.paddingLeft], display: st.display, probeFamily, probePad, probeDisplay,
    rem: parseFloat(cs(document.documentElement).fontSize) }; })()`;

export async function g9PressFace({ evaluate, send, check }: GlassKit): Promise<void> {
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5 });
  await evaluate(`document.activeElement instanceof HTMLElement && document.activeElement.blur()`);
  const d = await evaluate(FACE);
  const near = (a: number, b: number): boolean => !!d && Math.abs(a - b) <= 0.05 * d.rem;
  const wrong = !d
    ? ["no press"]
    : [
        Math.abs(d.h - 2.2 * d.rem) <= 0.5 ? true : `height ${d.h}, want 2.2rem`,
        d.family === d.probeFamily ? true : `face ${d.family} against ${d.probeFamily}`,
        near(d.size, 1.1 * d.rem) ? true : `size ${d.size}`,
        near(parseFloat(d.lineHeight), 1.1 * d.rem) ? true : `leading ${d.lineHeight}`,
        nearRgba(d.color, tokenRgba("--parchment")) ? true : `colour ${JSON.stringify(d.color)}`,
        nearRgba(d.bg, tokenRgba("--chart-ink", 0.5)) ? true : `background ${JSON.stringify(d.bg)}`,
        d.bw === "1px" ? true : `border width ${d.bw}`,
        d.bs === "solid" ? true : `border style ${d.bs}`,
        nearRgba(d.bc, tokenRgba("--line-tan")) ? true : `border colour ${JSON.stringify(d.bc)}`,
        JSON.stringify(d.pad) === JSON.stringify(d.probePad)
          ? true
          : `padding ${JSON.stringify(d.pad)} against ${JSON.stringify(d.probePad)}`,
        d.display === d.probeDisplay ? true : `display ${d.display} against ${d.probeDisplay}`,
      ].filter((f): f is string => f !== true);
  check(
    "G9 the camera's press wears home's face at rest: 2.2rem tall, the body face at 1.1rem on a line of 1, parchment on chart ink at 0.5 inside a line-tan hairline, and the house's own padding and display",
    wrong.length === 0,
    JSON.stringify({ wrong, d }),
  );
}
