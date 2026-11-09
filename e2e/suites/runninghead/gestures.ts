// A nav link's rise under a real pointer (Issue #779 part 2h).
import { mouseMove } from "../../support/input.ts";
import type { Payload } from "../../types.ts";
import type { RunningHeadKit } from "./kit.ts";

export const PORTFOLIO = "/explorer/portfolio/";

type Link = { x: number; y: number; reach: boolean; hover: boolean; moving: number; t: string; probe: string } | null;
const LINK = (
  at: 0 | -1,
): Payload<Link> => `(() => { const a = [...document.querySelectorAll("header.chrome nav.rooms a:not([aria-current])")].at(${at}); if (!a) return null;
  const r = a.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, e = document.elementFromPoint(x, y);
  const probe = document.createElement("div"); probe.style.transform = "translateY(var(--raise))"; document.body.appendChild(probe);
  const p = getComputedStyle(probe).transform; probe.remove();
  return { x, y, reach: !!e && (e === a || a.contains(e)), hover: a.matches(":hover"), moving: a.getAnimations().length,
    t: getComputedStyle(a).transform, probe: p }; })()`;

const fOf = (m: string): number | null => {
  const v = /^matrix\(([^)]+)\)$/.exec(m)?.[1]?.split(", ").map(Number);
  return v && v.length === 6 ? v[5]! : null;
};

async function raised({ evaluate, send, sleep }: RunningHeadKit, at: 0 | -1): Promise<Link> {
  let last = await evaluate(LINK(at));
  if (last) await mouseMove(send, last.x, last.y);
  for (let i = 0; i < 20 && last; i++) {
    last = await evaluate(LINK(at));
    if (last && last.hover && last.moving === 0) break;
    await sleep(50);
  }
  return last;
}

export async function rh31Raise(k: RunningHeadKit): Promise<void> {
  if (!(await k.visit("/faq/"))) throw new Error("RH31: the Q & A never loaded");
  try {
    const reads = [await raised(k, 0), await raised(k, -1)];
    const rises = reads.every((r) => {
      const f = r ? fOf(r.t) : null;
      return !!r && r.reach && r.hover && f !== null && f === fOf(r.probe) && f !== 0;
    });
    k.check(
      "RH31 the first and the last nav link each rise by the house raise under the hand",
      rises,
      JSON.stringify(reads),
    );
  } finally {
    await mouseMove(k.send, 1, 700);
  }
}
