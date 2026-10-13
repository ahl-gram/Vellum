// The Explorer's gestures (Issue #779 part 2h): the footnote mark's tip under a real hover, and the leaned camera's print stand-down.
import { LENS, homeCamera, lensRest } from "../print-room/print.ts";
import type { Payload } from "../../types.ts";
import type { BroadsideKit } from "./kit.ts";

type Tip = { t: string; hover: boolean; moving: boolean } | null;
const TIP = (sel: string): Payload<Tip> =>
  `((s) => { const el = document.querySelector(s); if (!el) return null; return { t: getComputedStyle(el).transform, hover: el.matches(":hover"), moving: el.getAnimations().some((a) => a.playState !== "finished") }; })(${JSON.stringify(sel)})`;
type At = { x: number; y: number; reach: boolean } | null;
const AT = (sel: string): Payload<At> =>
  `((s) => { const el = document.querySelector(s); if (!el) return null; const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, e = document.elementFromPoint(x, y); return { x, y, reach: !!e && (e === el || el.contains(e)) }; })(${JSON.stringify(sel)})`;

const nums = (t: string): number[] | null => {
  const m = /^matrix\(([^)]+)\)$/.exec(t);
  return m ? m[1]!.split(",").map(Number) : null;
};

const MARKS = ["seeds-choice", "coast-warp", "survey", "verso"].map((n) => `a.fn[data-note="note-${n}"]`);

async function tipOf(
  { evaluate, sleep }: Pick<BroadsideKit, "evaluate" | "sleep">,
  sel: string,
  tries: number,
): Promise<Tip> {
  let last = await evaluate(TIP(sel));
  for (let i = 0; i < tries; i++) {
    const d = await evaluate(TIP(sel));
    if (d && last && d.t === last.t && d.hover && !d.moving) return d;
    last = d;
    await sleep(50);
  }
  return last;
}

// A hovered mark opens its note, which can stand over the next mark; wiring, not the claim, so the notes are put away before each hover.
async function hovered(k: BroadsideKit, sel: string, tries: number): Promise<{ at: At; tip: Tip }> {
  await k.evaluate(
    `document.querySelectorAll(".fn-note").forEach((n) => { if (n.matches(":popover-open")) n.hidePopover(); })`,
  );
  const at = await k.evaluate(AT(sel));
  if (at) await k.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: at.x, y: at.y });
  return { at, tip: at ? await tipOf(k, sel, tries) : null };
}

export async function br13Tip(k: BroadsideKit): Promise<void> {
  try {
    const word = await hovered(k, "header.chrome .wordmark a", 30);
    const want = word.tip ? nums(word.tip.t) : null;
    const marks = [];
    for (const sel of MARKS) marks.push({ sel, ...(await hovered(k, sel, 20)) });
    const wrong = marks
      .filter((m) => {
        const got = m.tip ? nums(m.tip.t) : null;
        const same =
          !!got &&
          !!want &&
          got.length === 6 &&
          want.length === 6 &&
          got.every((v, i) => Math.abs(v - want[i]!) <= 1e-3);
        return !(!!m.at && m.at.reach && !!m.tip && m.tip.hover && m.tip.t !== "none" && same);
      })
      .map((m) => m.sel);
    k.check(
      "BR13 every footnote mark goes to the glossary, so under a real hover each tips at the wordmark's own numbers (#270 ruling 7)",
      !!word.at && word.at.reach && !!word.tip && word.tip.hover && !!want && wrong.length === 0,
      JSON.stringify({ word, wrong, marks }),
    );
  } finally {
    await k.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
  }
}

type Centre = { x: number; y: number; inside: boolean } | null;
const CENTRE: Payload<Centre> = `(() => { const vp = document.getElementById("map-viewport"); if (!vp) return null;
  const r = vp.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, e = document.elementFromPoint(x, y);
  return { x, y, inside: !!e && vp.contains(e) }; })()`;

export async function br14Paper({ evaluate, send, check, sleep, wheel }: BroadsideKit): Promise<void> {
  await evaluate(`window.__vellumSetRedraftEnabled(false)`);
  await send("Emulation.setEmulatedMedia", { features: [] });
  try {
    const c = await evaluate(CENTRE);
    if (c) await wheel(c.x, c.y, -480);
    const screen = await lensRest({ evaluate, sleep }, "leaned", "explorer-leaned");
    await send("Emulation.setEmulatedMedia", { media: "print" });
    const paper = await evaluate(LENS);
    check(
      "BR14 a leaned camera still prints the chart unzoomed: a real wheel leans the Glass on the chart, and on paper the transform target stands untransformed",
      !!c && c.inside && screen.zoomed && screen.k > 1 && paper.t === "none",
      JSON.stringify({ c, screen, paper }),
    );
  } finally {
    await send("Emulation.setEmulatedMedia", { media: "" });
    await homeCamera({ evaluate, send, sleep, wheel });
    await evaluate(`window.__vellumSetRedraftEnabled(true)`);
  }
}
