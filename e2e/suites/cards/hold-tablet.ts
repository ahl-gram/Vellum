import { makeStable } from "../../support/settle.ts";
import type { Payload } from "../../types.ts";
import type { holdKit } from "./hold.ts";

type Kit = ReturnType<typeof holdKit>;

const TABLET = [0, 5, 8, 9, 11, 16, 17, 21, 23];
// What each event of a tap reported: the witness that a text tap reached a town under the card, and the record printed on a failure, since CI's browser and a local one have disagreed on this check.
const TAPLOG: Payload<boolean> = `(() => { window.__p30 = []; const name = (t) => t && t.classList ? (t.classList.contains("place-hit") ? "hit" + t.dataset.idx : (t.className || t.tagName)) : String(t);
  for (const type of ["touchstart", "pointerdown", "mousedown", "click"]) document.addEventListener(type, (e) => { const p = e.touches && e.touches[0] ? e.touches[0] : e; window.__p30.push(type + "@" + Math.round(p.clientX) + "," + Math.round(p.clientY) + ">" + name(e.target) + (type === "click" ? " d" + e.detail : "")); }, { capture: true, once: true });
  return true; })()`;

export const TAPPED: Payload<{ clicked: boolean; shown: boolean; rest: boolean }> =
  `(() => { const c = document.getElementById("place-card"); const a = c && !c.hidden ? c.querySelector(".pc-inner").getAnimations() : []; return { clicked: (window.__p30 || []).some((e) => e.startsWith("click@")), shown: !!c && !c.hidden, rest: a.length > 0 && a.every((x) => x.playState === "finished") }; })()`;

export async function p30Tablet(k: Kit): Promise<void> {
  const stable = makeStable(k.settle);
  const marks = (await k.boot(true)).filter((m) => TABLET.includes(m.idx));
  const rows: string[] = [];
  let onTown = 0;
  for (const m of marks) {
    await k.reset();
    await k.tap(m);
    const c = await k.atRest(`P30 a tap on ${m.name}`);
    if (c.name !== m.name || !c.pinned) {
      rows.push(`${m.name}: the tap opened ${c.name}${c.pinned ? "" : " unpinned"}`);
      continue;
    }
    // Two taps closer than d3's double-tap window zoom the chart, which moves every later mark.
    await k.sleep(650);
    // 30px inside the card: CI's headless Chrome delivers a CDP tap as browser-adjusted mouse events alone, with no touch or pointer event to say where the finger came down, and near the card's edge the adjustment moves it onto a town outside (measured 2026-10-04, Kalkulin's tap at 179,364 reaching Vadelgrad at 171,374).
    const text = { x: (c.left + c.right) / 2, y: c.bottom - 30 };
    await k.evaluate(TAPLOG);
    await k.tap(text);
    await k.sleep(650);
    await stable(TAPPED, `P30 the text tap on ${m.name}'s card handled`, {
      departed: (d) => d.clicked && (!d.shown || d.rest),
    });
    const kept = await k.card();
    const events = await k.evaluate<string>(`window.__p30.join(" | ")`);
    if (/mousedown@[^|]*>hit/.test(events)) onTown++;
    if (!kept.shown || kept.name !== m.name)
      rows.push(
        `${m.name}: a tap at ${Math.round(text.x)},${Math.round(text.y)} on the card's text (${[c.left, c.top, c.right, c.bottom].map(Math.round).join(",")}) left ${kept.shown ? kept.name : "nothing"}; events ${events}`,
      );
  }
  k.check(
    "P30 on a tablet a tap opens and pins its own town, and a tap on the card's text keeps it, including one that lands on a town under the card (#750, #632)",
    marks.length === TABLET.length && onTown > 0 && rows.length === 0,
    JSON.stringify({ towns: marks.map((m) => m.name), textTapsOnATown: onTown, failures: rows }),
  );
}
