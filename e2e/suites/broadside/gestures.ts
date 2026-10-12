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

export async function br13Tip({ evaluate, send, check, sleep }: BroadsideKit): Promise<void> {
  const mark = 'a.fn[data-note="note-coast-warp"]';
  const word = "header.chrome .wordmark a";
  const poll = async (sel: string, tries: number): Promise<Tip> => {
    let last = await evaluate(TIP(sel));
    for (let i = 0; i < tries; i++) {
      const d = await evaluate(TIP(sel));
      if (d && last && d.t === last.t && d.hover && !d.moving) return d;
      last = d;
      await sleep(50);
    }
    return last;
  };
  try {
    const atMark = await evaluate(AT(mark));
    if (atMark) await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: atMark.x, y: atMark.y });
    const markTip = atMark ? await poll(mark, 20) : null;
    const atWord = await evaluate(AT(word));
    if (atWord) await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: atWord.x, y: atWord.y });
    const wordTip = atWord ? await poll(word, 30) : null;
    const a = markTip ? nums(markTip.t) : null;
    const b = wordTip ? nums(wordTip.t) : null;
    const same = !!a && !!b && a.length === 6 && b.length === 6 && a.every((v, i) => Math.abs(v - b[i]!) <= 1e-3);
    check(
      "BR13 a footnote mark goes to the glossary, so under a real hover it tips at the wordmark's own numbers (#270 ruling 7)",
      !!atMark &&
        atMark.reach &&
        !!atWord &&
        atWord.reach &&
        !!markTip &&
        markTip.hover &&
        markTip.t !== "none" &&
        !!wordTip &&
        wordTip.hover &&
        same,
      JSON.stringify({ atMark, markTip, atWord, wordTip }),
    );
  } finally {
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
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
