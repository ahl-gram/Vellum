// The inked survey's overlay, the card's seats and its dress (Issue #779 part 2h): Z23, Z24 and Z26 on seed 42.
import { PAGE_RGBA, SHADE, nearRgba, tokenRgba } from "../../support/pixel.ts";
import type { SuiteContext } from "../../types.ts";
import type { ZoomKit } from "./kit.ts";
import {
  AT_HOME,
  CENTRE,
  FOCUS,
  HIDE,
  INKED,
  OVERLAY,
  PART,
  PICK,
  PICKS,
  ZERO_NUDGE,
  actsWants,
  cardWants,
  formerWants,
  foundedWants,
  layWants,
  nameWants,
  noteWants,
  paperWants,
  prospectWants,
  rankWants,
  rootsWants,
  taleWants,
} from "./reads.ts";
import type { Part, Seat, Want } from "./reads.ts";

const faults = (parts: (true | string)[]): string[] => parts.filter((f): f is string => f !== true);
const near = (a: number, b: number, tolerance: number): boolean => Math.abs(a - b) <= tolerance;

export async function z23SurveyOverlay({ evaluate, check, sleep }: ZoomKit): Promise<void> {
  await evaluate(
    `(() => { const c = document.getElementById("ages"); c.checked = true; c.dispatchEvent(new Event("change", { bubbles: true })); })()`,
  );
  let inked = false;
  try {
    for (let i = 0; i < 120; i++) {
      inked = await evaluate(INKED);
      if (inked) break;
      await sleep(50);
    }
    const d = inked ? await evaluate(OVERLAY) : null;
    check(
      "Z23 the inked survey's overlay rides the mount unshadowed, dressed by the engine's sheet",
      inked &&
        !!d &&
        d.shadow === "none" &&
        d.position === "absolute" &&
        d.pointerEvents === "none" &&
        d.zIndex === "3" &&
        d.overflow === "visible" &&
        near(d.w, d.mapW, 1) &&
        near(d.h, d.mapH, 1) &&
        d.track.fill === "none" &&
        nearRgba(d.track.stroke, tokenRgba("--ink-dark")) &&
        d.track.sw === "3px" &&
        d.track.dash === "2px, 7px" &&
        d.track.cap === "round" &&
        d.track.vector === "non-scaling-stroke" &&
        d.track.opacity === "0.95" &&
        !!d.hull &&
        nearRgba(d.hull.fill, tokenRgba("--parchment-panel")) &&
        nearRgba(d.hull.stroke, tokenRgba("--ink-dark")) &&
        d.hull.sw === "1.5px" &&
        !!d.body &&
        nearRgba(d.body.fill, tokenRgba("--parchment-panel")) &&
        nearRgba(d.body.stroke, tokenRgba("--ink-dark")),
      JSON.stringify({ inked, d }),
    );
  } finally {
    await evaluate(
      `(() => { const c = document.getElementById("ages"); c.checked = false; c.dispatchEvent(new Event("change", { bubbles: true })); })()`,
    );
    for (let i = 0; i < 40; i++) {
      if (!(await evaluate<boolean>(`!!document.querySelector("#map .voyage-overlay")`))) break;
      await sleep(50);
    }
  }
}

// The 0.5px of 2026-10-13 (Issue #779 part 2h): layout resolves to 1/64px, so a seat sits within about 0.05px of its nominal 10px and a card within as much of 16rem, and the guard prover's steps (a gap of 10.9px, a width of 16.05rem) are 0.9px and 0.8px; the runs' payloads print the rects rounded, so the headroom is the principle's and three unmutated Linux executions green (two CI lane A jobs and one runner control).
const seatFaults = (label: string, variant: string, p: Seat, rem: number): string[] => {
  if (!p) return [`${label}: no card`];
  const markX = p.map[0]! + p.nx * p.map[2]!,
    markY = p.map[1]! + p.ny * p.map[3]!;
  const cl = p.card[0]!,
    ct = p.card[1]!,
    cr = p.card[2]!,
    cb = p.card[3]!;
  return faults([
    p.rested || `${label}: the card never rested`,
    (p.flipH === variant.includes("h") && p.flipV === variant.includes("v")) ||
      `${label}: classes ${p.flipH},${p.flipV}`,
    (p.dx === "0px" && p.dy === "0px") || `${label}: nudged ${p.dx},${p.dy}`,
    (variant.includes("h") ? near(cr, markX - 10, 0.5) : near(cl, markX + 10, 0.5)) ||
      `${label}: the anchored ${variant.includes("h") ? "right" : "left"} ${variant.includes("h") ? cr : cl} against the mark ${markX}`,
    (variant.includes("v") ? near(cb, markY - 10, 0.5) : near(ct, markY + 10, 0.5)) ||
      `${label}: the anchored ${variant.includes("v") ? "bottom" : "top"} ${variant.includes("v") ? cb : ct} against the mark ${markY}`,
    near(cr - cl, 16 * rem, 0.5) || `${label}: ${cr - cl} wide, want ${16 * rem}`,
  ]);
};

async function seatAt(
  { evaluate, sleep }: Pick<SuiteContext, "evaluate" | "sleep">,
  variant: string,
  k: number,
  idx: number,
  rem: number,
): Promise<{ row: string; wrong: string[] }> {
  await zoomHome(evaluate, sleep);
  if (k === 4) {
    const at = await evaluate(AT_HOME(idx));
    if (!at) return { row: "", wrong: [`${variant} at k=${k}: no target to centre`] };
    await evaluate(CENTRE(idx, at.px, at.py));
  }
  const hidden = await evaluate(HIDE, true);
  const still = await evaluate(ZERO_NUDGE, true);
  if (!(await evaluate(FOCUS(idx)))) return { row: "", wrong: [`${variant} at k=${k}: no hit to focus`] };
  let p = await evaluate(PICK(idx));
  for (let t = 0; t < 20 && p && !p.rested; t++) {
    await sleep(50);
    p = await evaluate(PICK(idx));
  }
  const row = `${variant}@${k}: ${p ? `${p.name} ${p.dx},${p.dy} ${p.card.map(Math.round).join(",")}` : "none"}`;
  const premise =
    hidden && still
      ? []
      : [`${variant} at k=${k}: the card of the town before would not hide or the map would not rest`];
  return { row, wrong: [...premise, ...seatFaults(`${variant} at k=${k}`, variant, p, rem)] };
}

async function zoomHome(evaluate: SuiteContext["evaluate"], sleep: SuiteContext["sleep"]): Promise<void> {
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  for (let t = 0; t < 20; t++) {
    if ((await evaluate<string>(`getComputedStyle(document.getElementById("map")).transform`)) === "none") break;
    await sleep(50);
  }
}

export async function z24CardSeats({ evaluate, send, check, sleep }: SuiteContext): Promise<void> {
  const variants = ["plain", "h", "v", "hv"];
  const picks = await evaluate(PICKS);
  const rem = await evaluate<number>(`parseFloat(getComputedStyle(document.documentElement).fontSize)`);
  const wrong: string[] = [];
  const rows: string[] = [];
  // one seat read per variant at rest and at depth
  try {
    await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
    await evaluate(`document.activeElement instanceof HTMLElement && document.activeElement.blur()`);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5 });
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    const seats = [1, 4].flatMap((k) => variants.map((variant, i) => ({ variant, k, idx: picks[i] ?? -1 })));
    for (const seat of seats) {
      if (seat.idx < 0) {
        wrong.push(`${seat.variant} at k=${seat.k}: no target`);
        continue;
      }
      const read = await seatAt({ evaluate, sleep }, seat.variant, seat.k, seat.idx, rem);
      if (read.row) rows.push(read.row);
      wrong.push(...read.wrong);
    }
  } finally {
    await evaluate(`document.activeElement instanceof HTMLElement && document.activeElement.blur()`);
    await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
    await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
    await send("Emulation.setEmulatedMedia", { features: [] });
  }
  check(
    "Z24 a card stands at its mark on the side it flips toward, 10px off on both axes, at rest and at depth, in all four variants",
    wrong.length === 0,
    JSON.stringify({ wrong, rows }),
  );
}

const px = (p: Part, key: string): number => parseFloat(String(p.props[key] ?? "NaN"));
const rgbaOf = (v: string | number[] | undefined): number[] | null => (Array.isArray(v) ? v : null);
const wants = (p: Part | null, label: string, list: readonly Want[]): string[] =>
  faults(
    list.map(([key, want, tolerance]) => {
      if (!p) return `${label}: absent`;
      const got = p.props[key];
      if (typeof want === "string") return got === want ? true : `${label} ${key}: ${JSON.stringify(got)}`;
      if (typeof want === "number")
        return near(px(p, key), want, tolerance ?? 0.05) ? true : `${label} ${key}: ${String(got)}`;
      return nearRgba(rgbaOf(got), want) ? true : `${label} ${key}: ${JSON.stringify(got)}`;
    }),
  );

async function showCard(
  { evaluate, sleep }: Pick<SuiteContext, "evaluate" | "sleep">,
  idx: number,
  name: string,
): Promise<boolean> {
  await evaluate(FOCUS(idx));
  for (let i = 0; i < 40; i++) {
    const ok = await evaluate<boolean>(
      `(() => { const c = document.getElementById("place-card"), inner = c.querySelector(".pc-inner"), a = inner ? inner.getAnimations() : [];
      return !c.hidden && (c.querySelector(".pc-name") || {}).textContent === ${JSON.stringify(name)} && a.length > 0 && a.every((v) => v.playState === "finished"); })()`,
    );
    if (ok) return true;
    await sleep(50);
  }
  return false;
}

type Named = { idx: number; name: string } | null;

async function findHit(evaluate: SuiteContext["evaluate"], suffix: string): Promise<Named> {
  return evaluate<Named>(
    `(() => { const h = [...document.querySelectorAll(".place-overlay .place-hit")].find((x) => (x.getAttribute("aria-label") || "").endsWith(${JSON.stringify(suffix)}));
    return h ? { idx: Number(h.dataset.idx), name: (h.getAttribute("aria-label") || "").split(", ")[0] } : null; })()`,
  );
}

async function cardFaults({ evaluate }: Pick<SuiteContext, "evaluate">, rem: number): Promise<string[]> {
  const card = await evaluate(PART("#place-card", ["position", "width", "pointer-events"]));
  const paper = await evaluate(
    PART("#place-card .pc-inner", [
      "box-sizing",
      "overflow-y",
      "touch-action",
      "background-color",
      "color",
      "border-top-width",
      "border-top-style",
      "border-top-color",
      "border-top-left-radius",
      "padding-top",
      "padding-left",
      "font-size",
      "line-height",
      "animation-name",
    ]),
  );
  const name = await evaluate(PART("#place-card .pc-name", ["display", "letter-spacing"]));
  const rank = await evaluate(
    PART("#place-card .pc-rank", ["display", "font-style", "color", "font-size", "text-transform", "margin-top"]),
  );
  const founded = await evaluate(PART("#place-card .pc-founded", ["display", "margin-top", "font-variant-numeric"]));
  return [
    ...wants(card, "card", cardWants(rem)),
    ...wants(paper, "paper", paperWants(rem)),
    ...wants(name, "name", nameWants(rem)),
    ...wants(rank, "rank", rankWants(rem)),
    ...wants(founded, "founded", foundedWants(rem)),
  ];
}

async function actsFaults({ evaluate }: Pick<SuiteContext, "evaluate">, rem: number): Promise<string[]> {
  const acts = await evaluate(
    PART("#place-card .pc-acts", ["display", "flex-direction", "align-items", "row-gap", "margin-top"]),
  );
  const prospect = await evaluate(
    PART("#place-card .pc-prospect", [
      "display",
      "background-color",
      "border-top-width",
      "border-top-color",
      "font-size",
      "text-decoration-line",
      "pointer-events",
      "color",
    ]),
  );
  const lay = await evaluate(
    PART("#place-card .pc-lay", [
      "background-color",
      "border-top-width",
      "border-top-color",
      "font-size",
      "text-align",
      "pointer-events",
    ]),
  );
  const face = await evaluate<{ family: string; probe: string }>(
    `(() => { const d = document.createElement("span"); d.style.fontFamily = "var(--font-display)"; document.body.appendChild(d);
    const probe = getComputedStyle(d).fontFamily; d.remove();
    return { family: getComputedStyle(document.querySelector("#place-card .pc-lay")).fontFamily, probe }; })()`,
  );
  const shade = await evaluate<{ colour: number[]; geometry: string } | null>(
    `(() => { const rgba = ${PAGE_RGBA}, shade = ${SHADE}, cs = getComputedStyle(document.querySelector("#place-card .pc-inner"));
    return shade(cs.boxShadow); })()`,
  );
  return [
    ...wants(acts, "acts", actsWants(rem)),
    ...wants(prospect, "prospect", prospectWants(rem)),
    ...wants(lay, "lay", layWants(rem)),
    ...(face.family === face.probe ? [] : [`lay face ${face.family} against ${face.probe}`]),
    ...(shade && nearRgba(shade.colour, tokenRgba("--chart-ink", 0.28)) && shade.geometry === "0px 8px 22px 0px"
      ? []
      : [`inner shadow ${JSON.stringify(shade)}`]),
  ];
}

async function noteFaults({ evaluate }: Pick<SuiteContext, "evaluate">, rem: number): Promise<string[]> {
  const tongue = await evaluate(
    PART("#place-card .pc-tongue", [
      "display",
      "border-top-width",
      "border-top-style",
      "border-top-color",
      "font-size",
      "color",
      "margin-top",
      "padding-top",
    ]),
  );
  const roots = await evaluate(PART("#place-card .pc-roots", ["font-style", "font-size", "color"]));
  return [
    ...(tongue && px(tongue, "w") > 0 ? [] : ["the note has no box"]),
    ...wants(tongue, "tongue", noteWants(rem)),
    ...(roots && px(roots, "w") > 0 ? [] : ["the roots have no box"]),
    ...wants(roots, "roots", rootsWants(rem)),
  ];
}

async function capitalFaults(
  ctx: Pick<SuiteContext, "evaluate" | "sleep">,
  capital: Named,
  rem: number,
): Promise<string[]> {
  if (!capital || !(await showCard(ctx, capital.idx, capital.name))) return ["the capital's card never rested"];
  const former = await ctx.evaluate(PART("#place-card .pc-former", ["display", "margin-top", "font-size", "color"]));
  return [
    ...(await cardFaults({ evaluate: ctx.evaluate }, rem)),
    ...(await actsFaults({ evaluate: ctx.evaluate }, rem)),
    ...(await noteFaults({ evaluate: ctx.evaluate }, rem)),
    ...wants(former, "former", formerWants(rem)),
  ];
}

async function taleFaults(ctx: Pick<SuiteContext, "evaluate" | "sleep">, ruin: Named, rem: number): Promise<string[]> {
  if (!ruin || !(await showCard(ctx, ruin.idx, ruin.name))) return ["the ruin's card never rested"];
  const tale = await ctx.evaluate(PART("#place-card .pc-tale", ["margin-top", "margin-bottom", "font-style", "color"]));
  return [
    ...(tale && px(tale, "w") > 0 ? [] : ["the tale has no box"]),
    ...wants(tale, "tale", taleWants(rem)),
    ...(tale && px(tale, "margin-bottom") === 0 ? [] : ["the tale carries a bottom margin"]),
  ];
}

export async function z26CardDress({ evaluate, send, check, sleep }: SuiteContext): Promise<void> {
  const rem = await evaluate<number>(`parseFloat(getComputedStyle(document.documentElement).fontSize)`);
  const wrong: string[] = [];
  const capital = await findHit(evaluate, ", Capital");
  const ruin = await findHit(evaluate, ", Ruin");
  try {
    await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
    await evaluate(`document.activeElement instanceof HTMLElement && document.activeElement.blur()`);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5 });
    wrong.push(...(await capitalFaults({ evaluate, sleep }, capital, rem)));
    wrong.push(...(await taleFaults({ evaluate, sleep }, ruin, rem)));
  } finally {
    await evaluate(`document.activeElement instanceof HTMLElement && document.activeElement.blur()`);
    await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
  }
  check(
    "Z26 the place card wears the engine's dress: its box, its paper, its head, its action row and its philologist's note, each part as its own rule sets it",
    wrong.length === 0,
    JSON.stringify({ wrong }),
  );
}
