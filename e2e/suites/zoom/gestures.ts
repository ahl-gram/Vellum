// Under a pinned card, the raised town and the hand (Issue #779 part 2h): Z27.
import { sampleRow } from "../../support/pixel.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { pressAt } from "../print-room/kit.ts";

type Mark = { idx: number; name: string; x: number; y: number };
const MARKS: Payload<Mark[]> =
  `[...document.querySelectorAll(".place-overlay .place-hit")].map((h) => { const b = h.getBoundingClientRect();
  return { idx: Number(h.dataset.idx), name: (h.getAttribute("aria-label") || "").split(", ")[0], x: b.left + b.width / 2, y: b.top + b.height / 2 }; })`;

const HIT_AT = (m: Mark): Payload<boolean> => `(() => { const e = document.elementFromPoint(${m.x}, ${m.y});
  const h = e && e.closest ? e.closest(".place-hit") : null; return !!h && Number(h.dataset.idx) === ${m.idx}; })()`;

type Card = {
  pinned: boolean;
  name: string | null;
  scrolled: boolean;
  rested: boolean;
  rect: number[];
  acts: number[];
} | null;
const CARD: Payload<Card> = `(() => { const c = document.getElementById("place-card"); if (!c || c.hidden) return null;
  const r = c.getBoundingClientRect(), a = c.querySelector(".pc-acts"), ar = a ? a.getBoundingClientRect() : null;
  const a2 = c.querySelector(".pc-inner") ? c.querySelector(".pc-inner").getAnimations() : [];
  return { pinned: c.classList.contains("pinned"), name: (c.querySelector(".pc-name") || {}).textContent, scrolled: c.classList.contains("pc-scrolls"), rested: a2.length > 0 && a2.every((v) => v.playState === "finished") && c.getAnimations().length === 0,
    rect: [r.left, r.top, r.right, r.bottom], acts: ar ? [ar.left, ar.top, ar.right, ar.bottom] : [0, 0, 0, 0] }; })()`;

const NEAR = (idx: number): Payload<{ near: boolean; opacity: string; pinned: string | null }> =>
  `(() => { const b = document.querySelector('.place-hit[data-idx="${idx}"]'), c = document.getElementById("place-card");
  if (!b) return { near: false, opacity: "0", pinned: null };
  return { near: b.classList.contains("pc-near"), opacity: getComputedStyle(b, "::after").opacity,
    pinned: c.classList.contains("pinned") ? (c.querySelector(".pc-name") || {}).textContent : null }; })()`;

const CURSOR = (idx: number): Payload<string> =>
  `(() => { const h = document.querySelector('.place-hit[data-idx="${idx}"]'); return h ? getComputedStyle(h).cursor : "absent"; })()`;

const RESET: Payload<boolean> = `(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); return true; })()`;

const inside = (m: Mark, r: number[], inset: number): boolean =>
  m.x > r[0]! + inset && m.x < r[2]! - inset && m.y > r[1]! + inset && m.y < r[3]! - inset;
const rowsEqual = (a: readonly (readonly number[])[], b: readonly (readonly number[])[], tolerance: number): boolean =>
  a.length === b.length && a.every((p, i) => p.every((v, c) => Math.abs(v - (b[i]![c] ?? -99)) <= tolerance));
const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

type Found = { a: Mark; b: Mark; controlRow: readonly (readonly number[])[]; controlCursor: string };

async function pinCard(
  { evaluate, send, sleep }: Pick<SuiteContext, "evaluate" | "send" | "sleep">,
  a: Mark,
): Promise<Card> {
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: a.x, y: a.y });
  await pressAt({ send }, a.x, a.y);
  let card: Card = null;
  let before: Card | undefined;
  for (let i = 0; i < 40; i++) {
    before = card;
    card = await evaluate(CARD);
    if (card?.pinned && card.name === a.name && !card.scrolled && card.rested && same(card.rect, before?.rect)) break;
    await sleep(50);
  }
  return card?.pinned && card.name === a.name && !card.scrolled ? card : null;
}

async function pinAndFind(
  ctx: Pick<SuiteContext, "evaluate" | "send" | "sleep">,
  marks: Mark[],
): Promise<Found | null> {
  for (const a of marks) {
    await ctx.evaluate(RESET);
    await ctx.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5 });
    if (!(await ctx.evaluate(HIT_AT(a)))) continue;
    const card = await pinCard(ctx, a);
    const b = card && marks.find((m) => m.idx !== a.idx && inside(m, card.rect, 14) && !inside(m, card.acts, -14));
    if (!b) continue;
    return {
      a,
      b,
      controlRow: await sampleRow(ctx.send, Math.round(b.x) - 14, Math.round(b.y), 28),
      controlCursor: await ctx.evaluate(CURSOR(b.idx)),
    };
  }
  return null;
}

export async function z27UnderPinned({ evaluate, send, check, sleep }: SuiteContext): Promise<void> {
  const wrong: string[] = [];
  const held: { found: Found | null; over: Over | null } = { found: null, over: null };
  try {
    await evaluate(RESET);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5 });
    const marks = await evaluate(MARKS);
    held.found = await pinAndFind({ evaluate, send, sleep }, marks);
    if (held.found) held.over = await moveOntoCard({ evaluate, send, sleep }, held.found);
  } finally {
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5 });
    await evaluate(RESET);
  }
  const { found, over } = held;
  if (!found || !over) wrong.push("no covered pair found");
  else {
    wrong.push(
      ...[
        (over.near && over.opacity === "1") || `B's ring never came up (${JSON.stringify(over)})`,
        over.pinned === found.a.name || `the card left ${found.a.name} (${over.pinned})`,
        found.controlCursor === "pointer" || `B's cursor before the move ${found.controlCursor}`,
        over.cursorB === "default" || `B's cursor over the card ${over.cursorB}`,
        over.cursorA === "pointer" || `A's cursor over the card ${over.cursorA}`,
        rowsEqual(found.controlRow, over.row, 6) || "the rows differ",
      ].filter((x): x is string => x !== true),
    );
  }
  check(
    "Z27 under a pinned card the town the hand raises stays beneath it, and only the card's own town still offers the hand",
    wrong.length === 0,
    JSON.stringify({
      wrong,
      pair: found && [found.a.name, found.b.name],
      control: found && found.controlRow,
      over: over && { ...over, row: over.row.slice(0, 6) },
    }),
  );
}

type Over = {
  near: boolean;
  opacity: string;
  pinned: string | null;
  cursorB: string;
  cursorA: string;
  row: readonly (readonly number[])[];
};

async function moveOntoCard(
  { evaluate, send, sleep }: Pick<SuiteContext, "evaluate" | "send" | "sleep">,
  found: Found,
): Promise<Over> {
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: found.b.x, y: found.b.y });
  let seen = await evaluate(NEAR(found.b.idx));
  for (let i = 0; i < 30 && !(seen.near && seen.opacity === "1"); i++) {
    await sleep(50);
    seen = await evaluate(NEAR(found.b.idx));
  }
  return {
    ...seen,
    cursorB: await evaluate(CURSOR(found.b.idx)),
    cursorA: await evaluate(CURSOR(found.a.idx)),
    row: await sampleRow(send, Math.round(found.b.x) - 14, Math.round(found.b.y), 28),
  };
}
