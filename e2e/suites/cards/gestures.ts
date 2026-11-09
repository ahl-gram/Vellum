// The raised town (Issue #779 part 2h): the town the hand raises takes the hand over a later box.
import type { Payload } from "../../types.ts";
import type { holdKit } from "./hold.ts";
import { mouseMove } from "../../support/input.ts";

type Mark = { idx: number; name: string; x: number; y: number };
const MARKS: Payload<Mark[]> =
  `[...document.querySelectorAll(".place-overlay .place-hit")].map((h) => { const b = h.getBoundingClientRect();
  return { idx: Number(h.dataset.idx), name: (h.getAttribute("aria-label") || "").split(", ")[0], x: b.x + b.width / 2, y: b.y + b.height / 2 }; })`;
const NEAR = (
  idx: number,
): Payload<boolean> => `(() => { const h = document.querySelector('.place-hit[data-idx="${idx}"]');
  return !!h && h.classList.contains("pc-near"); })()`;
const HIT_AT = (
  p: Mark,
): Payload<string | null> => `(() => { const e = document.elementFromPoint(${p.x}, ${p.y}); if (!e) return null;
  const h = e.closest ? e.closest(".place-hit") : null; return h ? String(h.dataset.idx) : String(e.className || e.tagName); })()`;
const OWN_RESET: Payload<boolean> = `(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); return true; })()`;

export async function p36RaisedTakesHand({ evaluate, send, check, sleep }: ReturnType<typeof holdKit>): Promise<void> {
  let pair: { m: Mark; o: Mark } | null = null;
  let raised = false;
  let atPoint: string | null = null;
  try {
    await mouseMove(send, 2, 2);
    await evaluate(OWN_RESET);
    const marks = await evaluate(MARKS);
    for (const m of marks) {
      const o = marks.find((q) => q.idx > m.idx && Math.abs(q.x - m.x) < 13 && Math.abs(q.y - m.y) < 13);
      if (o) {
        pair = { m, o };
        break;
      }
    }
    if (pair) {
      await mouseMove(send, pair.m.x, pair.m.y);
      for (let i = 0; i < 20; i++) {
        raised = await evaluate(NEAR(pair.m.idx));
        if (raised) break;
        await sleep(50);
      }
      atPoint = await evaluate(HIT_AT(pair.m));
    }
  } finally {
    await mouseMove(send, 2, 2);
    await evaluate(OWN_RESET);
  }
  check(
    "P36 the town the hand raises takes the hand over the later box that covers it",
    !!pair && raised && atPoint === String(pair.m.idx),
    JSON.stringify({ pair: pair && [pair.m.name, pair.o.name], raised, atPoint }),
  );
}
