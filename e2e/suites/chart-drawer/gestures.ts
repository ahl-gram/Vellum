// What a hover, a key and a turn do to the place card's filing press (Issue #779 part 2g): the action row's dress under the hand and the keys, and the sheet a filing is made from across a style's turn and an aborted one.
import { LAY_ON_CARD } from "../../../src/site/explorer/chart-drawer.ts";
import { nearRgba, PAGE_RGBA, tokenRgba } from "../../support/pixel.ts";
import type { Payload } from "../../types.ts";
import { TIPPED } from "./desk.ts";
import { park, tabInto, type DrawerKit } from "./kit.ts";
import { pressAtRest } from "./prospect.ts";
import { CARD, DRESS, READ, type Card } from "./reads.ts";

type Press = {
  text: string;
  dim: boolean;
  hover: boolean;
  focus: boolean;
  acts: string[];
  ground: number[];
  border: number[];
  opacity: string;
  tipped: boolean;
  x: number;
  y: number;
  running: number;
};
const PRESS: Payload<Press | null> = `(() => { const rgba = ${PAGE_RGBA}, p = document.querySelector("#place-card .pc-lay"), a = document.querySelector("#place-card .pc-acts"); if (!p || !a) return null;
  const pc = getComputedStyle(p), ac = getComputedStyle(a), r = p.getBoundingClientRect();
  return { text: p.textContent, dim: p.classList.contains("dim"), hover: p.matches(":hover"), focus: p.matches(":focus-visible"), acts: [ac.display, ac.rowGap],
    ground: rgba(pc.backgroundColor), border: rgba(pc.borderTopColor), opacity: pc.opacity, tipped: ${TIPPED}(pc.transform), x: r.left + r.width / 2, y: r.top + r.height / 2, running: p.getAnimations().filter((x) => x.playState === "running").length }; })()`;
const HIT = (idx: number): Payload<{ x: number; y: number; hit: boolean } | null> =>
  `(() => { const h = document.querySelector('.place-overlay .place-hit[data-idx="${idx}"]'); if (!h) return null; const b = h.getBoundingClientRect(); const x = b.x + b.width / 2, y = b.y + b.height / 2; return { x, y, hit: document.elementFromPoint(x, y) === h }; })()`;

const reachable = (skip: number[]): Payload<number | null> =>
  `(() => { for (const h of document.querySelectorAll(".place-overlay .place-hit")) { const i = Number(h.dataset.idx); if (i < 1 || ${JSON.stringify(skip)}.includes(i)) continue;
  const b = h.getBoundingClientRect(); if (document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2) === h) return i; } return null; })()`;

const UNFURL: Payload<string[] | null> =
  `(() => { const i = document.querySelector("#place-card .pc-inner"); return i ? i.getAnimations().map((a) => a.playState) : null; })()`;

export async function pinAt(k: DrawerKit, idx: number): Promise<Card> {
  const { evaluate, clickAt, settle } = k;
  const at = await evaluate(HIT(idx));
  if (at?.hit) await clickAt(at.x, at.y);
  await settle(CARD, (d) => d.shown && d.press?.idx === String(idx), `chart-drawer-pin-${idx}`);
  await settle(UNFURL, (d) => d.length > 0 && d.every((s) => s === "finished"), `chart-drawer-pin-${idx}-unfurled`);
  return settle(
    CARD,
    (d, last) => d.press?.idx === String(idx) && pressAtRest(d, last),
    `chart-drawer-pin-${idx}-rest`,
  );
}

async function underHand(k: DrawerKit): Promise<{ rest: Press | null; hover: Press; keyed: Press | null }> {
  const { evaluate, send, settle } = k;
  await park(send);
  const rest = await settle(
    PRESS,
    (d, last) => !d.hover && d.running === 0 && !!last && JSON.stringify(d) === JSON.stringify(last),
    "chart-drawer-press-rest",
  );
  // The room re-seats the card when a filing opens the drawer, so a hand that missed the moving press is put back on it.
  let hover: Press | null = null;
  for (let i = 0; i < 4 && hover === null; i++) {
    const at = await evaluate(PRESS);
    if (at) await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: at.x, y: at.y });
    hover = await settle(
      PRESS,
      (d, last) => d.hover && d.running === 0 && !!last && JSON.stringify(d) === JSON.stringify(last),
      "chart-drawer-press-hovered",
      20,
    ).catch(() => null);
  }
  if (hover === null) throw new Error("the hand never rested on the filing press");
  await park(send);
  const keyed = (await tabInto(k, "#place-card .pc-lay", "#place-card .pc-prospect"))
    ? await settle(
        PRESS,
        (d, last) => d.focus && d.running === 0 && !!last && JSON.stringify(d) === JSON.stringify(last),
        "chart-drawer-press-keyed",
      )
    : null;
  await evaluate<boolean>(`(() => { if (document.activeElement) document.activeElement.blur(); return true; })()`);
  return { rest, hover, keyed };
}

const gold = (p: Press | null): boolean =>
  !!p && !p.dim && nearRgba(p.ground, tokenRgba("--control-gold")) && p.opacity === "1" && !p.tipped;
const cream = (p: Press | null): boolean =>
  !!p &&
  p.dim &&
  nearRgba(p.ground, tokenRgba("--control-cream")) &&
  nearRgba(p.border, tokenRgba("--line-faint")) &&
  p.opacity === "1" &&
  !p.tipped;

export async function cd57PressDress(k: DrawerKit): Promise<void> {
  const { check, settle, go, send } = k;
  try {
    await go(DRESS);
    await settle(CARD, (d) => d.hits > 1, "chart-drawer-press-card");
    await pinAt(k, (await k.evaluate(reachable([]))) ?? 1);
    const open = await underHand(k);
    const now = await k.evaluate(PRESS);
    if (now) await k.clickAt(now.x, now.y);
    await settle(
      CARD,
      (d, last) => d.press?.text === "Already on the table" && pressAtRest(d, last),
      `chart-drawer-press-filed-at-${now?.x},${now?.y}`,
    );
    const held = await underHand(k);
    check(
      "CD57 the card's actions stand in one flex row with its own gap, and its filing press keeps its dress against the house skin: gold and unfaded at rest, under a real hover and under a keyboard's focus, untipped, and, refusing a place already on the table, cream with a faint line and still unfaded in all three (#522)",
      JSON.stringify(open.rest?.acts) === JSON.stringify(["flex", "4.8px"]) &&
        gold(open.rest) &&
        gold(open.hover) &&
        gold(open.keyed) &&
        !!open.keyed?.focus &&
        held.rest?.text === "Already on the table" &&
        cream(held.rest) &&
        cream(held.hover) &&
        cream(held.keyed) &&
        !!held.keyed?.focus,
      JSON.stringify({ open, held }),
    );
  } finally {
    await park(send);
  }
}

// Every prospect thumbnail job is held at the worker's door, so a filing lays a cutting with no plate decoding under the next pin (the flake record's CD25 shape, Issue #716); a draw is held only while the turn read asks.
const HOLD = `(() => { const post = Worker.prototype.postMessage; window.__cdTurn = { holdDraw: false, held: [] };
  Worker.prototype.postMessage = function (msg, ...rest) { if (msg && (msg.kind === "prospect" || (msg.kind === "draw" && window.__cdTurn.holdDraw))) { window.__cdTurn.held.push(msg.kind); return; } return post.call(this, msg, ...rest); }; })();`;
type Turn = {
  turning: boolean;
  hits: number;
  card: boolean;
  cuttings: number;
  table: string | null;
  year: number | null;
};
const TURN: Payload<Turn> = `(() => ({ turning: document.getElementById("sheet").classList.contains("turning"), hits: document.querySelectorAll(".place-overlay .place-hit").length,
  card: !!document.getElementById("place-card") && !document.getElementById("place-card").hidden, cuttings: document.querySelectorAll("#cuttings li").length,
  table: new URLSearchParams(location.hash.slice(1)).get("table"), year: Number((/in the year (\\d+)/.exec(document.getElementById("folio-sub").textContent) || [])[1]) || null }))()`;
const restyle = (style: string): string =>
  `(() => { const s = document.getElementById("style"); s.value = "${style}"; s.dispatchEvent(new Event("change", { bubbles: true })); return true; })()`;
const lastItem = (t: Turn): string => (t.table ?? "").split("_").at(-1) ?? "";

async function fileAt(k: DrawerKit, idx: number, count: number): Promise<Turn> {
  const { evaluate, settle } = k;
  const card = await pinAt(k, idx);
  if (card.press) await k.clickAt(card.press.box.x, card.press.box.y);
  const filed = await settle(TURN, (d) => d.cuttings === count, `chart-drawer-filed-${count}`);
  // Wiring, not the claim: the drawer the filing opened is shut so the next pin meets the chart alone.
  await evaluate<boolean>(`(() => { document.getElementById("chart-drawer-shut").click(); return true; })()`);
  await settle(
    READ,
    (d, last) => !d.open && !!last && JSON.stringify(d.drawerAnims) === JSON.stringify(last.drawerAnims),
    "chart-drawer-shut-after-filing",
  );
  return filed;
}

async function midTurn(
  k: DrawerKit,
  idx: number,
): Promise<{ at: Turn; face: Card | null; focused: boolean; after: Turn[] }> {
  const { evaluate, send, settle, sleep } = k;
  await evaluate<boolean>(restyle("ink"));
  const at = await settle(TURN, (d) => d.turning, "chart-drawer-turning");
  await evaluate<boolean>(
    `(() => { document.getElementById("seed").value = "7"; const h = document.querySelector('.place-overlay .place-hit[data-idx="${idx}"]'); if (h) h.focus({ preventScroll: true }); return !!h; })()`,
  );
  const face = await settle(CARD, (d) => d.shown && d.press?.idx === String(idx), "chart-drawer-turning-face").catch(
    () => null,
  );
  const focused = await evaluate<boolean>(
    `(() => { const p = document.querySelector("#place-card .pc-lay"); if (p) p.focus({ preventScroll: true }); return !!p && document.activeElement === p; })()`,
  );
  // Enter presses the button only with its character: without it row CT7b.a, a lay that ignores the turn, stayed green on the runner (send T, run 38087000715), and with it CD58 stops on its next filing, measured locally.
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Enter",
    code: "Enter",
    text: "\r",
    unmodifiedText: "\r",
    windowsVirtualKeyCode: 13,
    nativeVirtualKeyCode: 13,
  });
  await send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Enter",
    code: "Enter",
    windowsVirtualKeyCode: 13,
    nativeVirtualKeyCode: 13,
  });
  const after: Turn[] = [];
  for (let i = 0; i < 6; i++) {
    after.push(await evaluate(TURN));
    await sleep(50, "window: six reads 50 ms apart across the turn");
  }
  return { at, face, focused, after };
}

const holdDraw = (on: boolean): string => `(() => { window.__cdTurn.holdDraw = ${on}; return true; })()`;
const filedAs = (item: string, idx: number, style: string, year: number | null): boolean =>
  item.startsWith("k-p.seed-42.") &&
  item.includes(`.style-${style}.`) &&
  item.includes(".coast-90.") &&
  item.endsWith(`.i-${idx}.year-${year}`);

export async function cd58TurnFiles(k: DrawerKit): Promise<void> {
  const { evaluate, send, check, settle, go } = k;
  const { identifier } = await send<{ identifier: string }>("Page.addScriptToEvaluateOnNewDocument", { source: HOLD });
  try {
    await go(`${DRESS}&coast=90`);
    await send("Emulation.setEmulatedMedia", { features: [] });
    await evaluate<boolean>(
      `(() => { document.documentElement.style.setProperty("--turn", "2000ms"); return true; })()`,
    );
    const before = await settle(TURN, (d) => d.hits > 6, "chart-drawer-turn-page");
    const p1 = (await evaluate(reachable([]))) ?? 1;
    const first = await fileAt(k, p1, 1);
    const turning = await midTurn(k, p1 + 1);
    await settle(TURN, (d) => !d.turning && d.hits > 6, "chart-drawer-turned", 160);
    const p2 = (await evaluate(reachable([p1]))) ?? p1 + 1;
    const landed = await fileAt(k, p2, 2);
    check(
      "CD58 a filing names the sheet on the chart across a style's turn: before it the drawn world in its dress, overrides and year; mid-turn a card shown on the outgoing chart refuses by the real turn flag, a keyboard's Enter filing nothing; after it the new dress over the same world, never a seed typed and not drawn",
      filedAs(lastItem(first), p1, "antique", before.year) &&
        turning.at.turning &&
        turning.face?.press?.text === LAY_ON_CARD &&
        !!turning.face.press.dim &&
        !turning.face.press.disabled &&
        turning.focused &&
        turning.after.every((d) => d.cuttings === 1 && d.turning) &&
        filedAs(lastItem(landed), p2, "ink", before.year),
      JSON.stringify({ before, first, turning, landed }),
    );
  } finally {
    await evaluate<boolean>(
      `(() => { document.getElementById("seed").value = "42"; document.documentElement.style.removeProperty("--turn"); return true; })()`,
    );
    await send("Page.removeScriptToEvaluateOnNewDocument", { identifier });
    await park(send);
  }
}

export async function cd59AbortedTurn(k: DrawerKit): Promise<void> {
  const { evaluate, send, check, settle } = k;
  try {
    await send("Emulation.setEmulatedMedia", { features: [] });
    await evaluate<boolean>(
      `(() => { document.documentElement.style.setProperty("--turn", "2000ms"); return true; })()`,
    );
    const ready = await evaluate(TURN);
    await evaluate<boolean>(restyle("antique"));
    await settle(TURN, (d) => d.turning, "chart-drawer-turning-back");
    await evaluate<boolean>(holdDraw(true));
    await evaluate<boolean>(restyle("ink"));
    const aborted = await settle(TURN, (d) => !d.turning && d.hits > 6, "chart-drawer-turn-aborted", 160);
    const filedIdx = (ready.table ?? "").split("_").map((item) => Number(/\.i-(\d+)\./.exec(item)?.[1]));
    const p4 = (await evaluate(reachable(filedIdx))) ?? 4;
    const filed = await fileAt(k, p4, 3);
    check(
      "CD59 a turn another draw overtakes files the world its overlay still describes: the overtaken antique turn lands no sheet, so a card pressed after it files the ink chart the hit targets were built from (#631 round 3)",
      ready.cuttings === 2 && !ready.turning && !aborted.turning && filedAs(lastItem(filed), p4, "ink", ready.year),
      JSON.stringify({ ready, aborted, filed }),
    );
  } finally {
    await evaluate<boolean>(holdDraw(false)).catch(() => false);
    await evaluate<boolean>(`(() => { document.documentElement.style.removeProperty("--turn"); return true; })()`);
  }
}
