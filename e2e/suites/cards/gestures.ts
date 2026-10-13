// The house's lifts and the raised town (Issue #779 part 2h): a plain button's raise and press, the card's Prospect road, and the town the hand raises.
import { PAGE_RGBA, SHADE, tokenRgba } from "../../support/pixel.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import type { holdKit } from "./hold.ts";

type Draw = {
  x: number;
  y: number;
  reach: boolean;
  hover: boolean;
  active: boolean;
  anims: number;
  t: string;
  shadow: { colour: number[]; geometry: string } | null;
} | null;
const DRAW: Payload<Draw> = `(() => { const rgba = ${PAGE_RGBA}, shade = ${SHADE}, b = document.getElementById("draw"); if (!b) return null;
  const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, e = document.elementFromPoint(x, y), st = getComputedStyle(b);
  return { x, y, reach: !!e && (e === b || b.contains(e)), hover: b.matches(":hover"), active: b.matches(":active"),
    anims: b.getAnimations().length, t: st.transform, shadow: shade(st.boxShadow) }; })()`;

const shadeIs = (s: Draw, geometry: string, alpha: number): boolean => {
  // The canvas round-trip loses up to 3 per channel at these alphas (measured 2026-10-12: the hover shadow reads [60,44,31] and the press [64,50,28] against the token's [61,47,31]), so the channel tolerance is 4 where nearRgba's is 2.
  const want = tokenRgba("--chart-ink", alpha);
  return (
    !!s &&
    !!s.shadow &&
    s.shadow.geometry === geometry &&
    s.shadow.colour.length === 4 &&
    s.shadow.colour.every((v, i) => Math.abs(v - want[i]!) <= (i === 3 ? 3 : 4))
  );
};

type Lift = {
  at: Draw;
  rest: Draw;
  hover: Draw;
  pressed: Draw;
  after: { status: string | null; seed: string };
};

const moveTo = (send: SuiteContext["send"], x: number, y: number, buttons = 0): Promise<unknown> =>
  send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, buttons });
const pressDown = (send: SuiteContext["send"], x: number, y: number): Promise<unknown> =>
  send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", buttons: 1, clickCount: 1 });
const pressUp = (send: SuiteContext["send"], x: number, y: number): Promise<unknown> =>
  send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", buttons: 0, clickCount: 1 });

async function liftReads({ evaluate, send, sleep }: Pick<SuiteContext, "evaluate" | "send" | "sleep">): Promise<Lift> {
  await moveTo(send, 5, 5);
  const read: { at: Draw; rest: Draw; hover: Draw; pressed: Draw } = {
    at: null,
    rest: null,
    hover: null,
    pressed: null,
  };
  read.at = await evaluate(DRAW);
  read.rest = await evaluate(DRAW);
  let held = false;
  try {
    if (read.at) await moveTo(send, read.at.x, read.at.y);
    read.hover = await evaluate(DRAW);
    for (let i = 0; i < 20 && read.hover; i++) {
      if (read.hover.hover && read.hover.anims === 0) break;
      await sleep(50);
      read.hover = await evaluate(DRAW);
    }
    if (read.at) {
      await pressDown(send, read.at.x, read.at.y);
      held = true;
    }
    read.pressed = await evaluate(DRAW);
    for (let i = 0; i < 20 && read.pressed; i++) {
      if (read.pressed.active && read.pressed.anims === 0) break;
      await sleep(50);
      read.pressed = await evaluate(DRAW);
    }
    // The release lands at (5, 5) with the button held: the click reaches the common ancestor, not #draw, so nothing redraws.
    await moveTo(send, 5, 5, 1);
    await pressUp(send, 5, 5);
    held = false;
  } finally {
    if (held) await pressUp(send, 5, 5);
    await moveTo(send, 5, 5);
    await evaluate(`document.activeElement instanceof HTMLElement && document.activeElement.blur()`);
  }
  const after = await evaluate<{ status: string | null; seed: string }>(
    `(() => { const s = document.getElementById("status"), i = document.getElementById("seed"); return { status: s ? s.textContent : null, seed: i ? i.value : "" }; })()`,
  );
  return { ...read, after };
}

export async function p34ButtonLift(ctx: SuiteContext): Promise<void> {
  const { at, rest, hover, pressed, after } = await liftReads(ctx);
  ctx.check(
    "P34 a plain button rises by the house raise and casts the raise shadow under the hand, and sinks by the house press with the press shadow under a held press, at the ratified values",
    !!at &&
      at.reach &&
      rest?.t === "none" &&
      !!hover &&
      hover.hover &&
      hover.t === "matrix(1, 0, 0, 1, 0, -2)" &&
      shadeIs(hover, "0px 6px 16px 0px", 0.2) &&
      !!pressed &&
      pressed.active &&
      pressed.t === "matrix(1, 0, 0, 1, 0, 1)" &&
      shadeIs(pressed, "0px 1px 3px 0px", 0.14),
    JSON.stringify({ at, rest, hover, pressed, after }),
  );
}

const PIN_CAPITAL: Payload<boolean> = `(() => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  const hit = [...document.querySelectorAll(".place-overlay .place-hit")].find((h) => /, Capital$/.test(h.getAttribute("aria-label") || ""));
  if (!hit) return false; hit.click(); return true; })()`;

type Card = { pinned: boolean; rested: boolean; x: number; y: number; reach: boolean } | null;
const CARD: Payload<Card> = `(() => { const c = document.getElementById("place-card"); if (!c || c.hidden) return null;
  const inner = c.querySelector(".pc-inner"), a = inner ? inner.getAnimations() : [], l = c.querySelector(".pc-prospect"); if (!l) return null;
  const r = l.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, e = document.elementFromPoint(x, y);
  return { pinned: c.classList.contains("pinned"), rested: a.length > 0 && a.every((v) => v.playState === "finished"), x, y,
    reach: !!e && (e === l || l.contains(e)) }; })()`;

type Link = { t: string; probe: string; hover: boolean; anims: number } | null;
const LINK: Payload<Link> = `(() => { const l = document.querySelector("#place-card .pc-prospect"); if (!l) return null;
  const probe = document.createElement("div"); probe.style.transform = "translateY(var(--raise))"; document.body.appendChild(probe);
  const p = getComputedStyle(probe).transform; probe.remove();
  return { t: getComputedStyle(l).transform, probe: p, hover: l.matches(":hover"), anims: l.getAnimations().length }; })()`;

const fOf = (m: string): number | null => {
  const v = /^matrix\(([^)]+)\)$/.exec(m)?.[1]?.split(", ").map(Number);
  return v && v.length === 6 ? v[5]! : null;
};

export async function p35ProspectLift({ evaluate, send, check, sleep }: SuiteContext): Promise<void> {
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5 });
  // Wiring, not the gesture under test: the capital's card is pinned by a click (P8's form; a real press can open a neighbour, Issue #750).
  const pinned = await evaluate(PIN_CAPITAL);
  const read: { card: Card; link: Link } = { card: null, link: null };
  for (let i = 0; i < 40 && pinned; i++) {
    read.card = await evaluate(CARD);
    if (read.card && read.card.pinned && read.card.rested) break;
    await sleep(50);
  }
  try {
    if (read.card) await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: read.card.x, y: read.card.y });
    read.link = await evaluate(LINK);
    for (let i = 0; i < 20 && read.link; i++) {
      if (read.link.hover && read.link.anims === 0) break;
      await sleep(50);
      read.link = await evaluate(LINK);
    }
  } finally {
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5 });
    await evaluate(`document.activeElement instanceof HTMLElement && document.activeElement.blur()`);
    await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
  }
  const { card, link } = read;
  const f = link ? fOf(link.t) : null;
  const probe = link ? fOf(link.probe) : null;
  check(
    "P35 the card's Prospect road rises by the house raise under the hand",
    pinned &&
      !!card &&
      card.pinned &&
      card.rested &&
      card.reach &&
      !!link &&
      link.hover &&
      f !== null &&
      f === probe &&
      f !== 0,
    JSON.stringify({ pinned, card, link }),
  );
}

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
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 2, y: 2 });
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
      await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: pair.m.x, y: pair.m.y });
      for (let i = 0; i < 20; i++) {
        raised = await evaluate(NEAR(pair.m.idx));
        if (raised) break;
        await sleep(50);
      }
      atPoint = await evaluate(HIT_AT(pair.m));
    }
  } finally {
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 2, y: 2 });
    await evaluate(OWN_RESET);
  }
  check(
    "P36 the town the hand raises takes the hand over the later box that covers it",
    !!pair && raised && atPoint === String(pair.m.idx),
    JSON.stringify({ pair: pair && [pair.m.name, pair.o.name], raised, atPoint }),
  );
}
