import { makeSettle } from "../../support/settle.ts";
import { nearRgba, PAGE_RGBA, SHADE, type Rgba } from "../../support/pixel.ts";
import type { Payload } from "../../types.ts";
import { park, tabInto, type DragKit, type DrawerKit } from "./kit.ts";
import { CARRY, DURATION, atRest, sameCam } from "./reads.ts";

export async function cd45SnapBack({
  evaluate,
  check,
  settle,
  clickAt,
  press,
  moveTo,
  release,
  carry,
  shutAndFold,
}: DragKit): Promise<void> {
  await evaluate(`document.querySelector("#cuttings .off").click()`);
  await shutAndFold("chart-drawer-snap-folded");
  const before = await settle(CARRY, atRest, "chart-drawer-carry-shut-rest");
  const { from, mid, to } = await carry({ x: 640, y: 300 });
  await release(to.x, to.y);
  const snapped = await settle(CARRY, atRest, "chart-drawer-snapped");
  await press(from.x, from.y);
  await moveTo(from, { x: from.x - 10, y: from.y + 10 }, 4);
  await moveTo({ x: from.x - 10, y: from.y + 10 }, from, 4);
  await release(from.x, from.y);
  const jiggled = await settle(CARRY, atRest, "chart-drawer-jiggled");
  await clickAt(from.x, from.y);
  const clicked = await settle(CARRY, (d, last) => d.cuttings === 1 && atRest(d, last), "chart-drawer-plain-click");
  await evaluate(`document.querySelector("#cuttings .off").click()`);
  await shutAndFold("chart-drawer-after-snap-folded");
  check(
    "CD45 a carry released over the chart files nothing: the ghost rode the pointer with the drawer still SHUT (D4: it opens only as the sheet enters the band), then snapped back and is gone, the table is bare and the address carries no key, the drawer is back as it was and the camera is at rest where it was; a jiggle released back on the ear files nothing either, since the click that follows a drag is swallowed; and a plain click straight after still files, so the swallow is scoped to its own gesture and never eats the next honest click (Issue #523, ruled 2026-09-21)",
    before.cuttings === 0 &&
      !before.open &&
      before.folded &&
      !!mid.ghost &&
      mid.drag &&
      !mid.open &&
      !mid.receiving &&
      snapped.cuttings === 0 &&
      !snapped.ghost &&
      !snapped.drag &&
      !snapped.open &&
      snapped.hashTable === null &&
      sameCam(before.cam, snapped.cam) &&
      jiggled.cuttings === 0 &&
      !jiggled.ghost &&
      !jiggled.open &&
      sameCam(before.cam, jiggled.cam) &&
      clicked.cuttings === 1 &&
      clicked.open,
    JSON.stringify({
      before: { cuttings: before.cuttings, open: before.open, folded: before.folded, cam: before.cam },
      mid: { ghost: !!mid.ghost, drag: mid.drag, open: mid.open, receiving: mid.receiving },
      snapped: {
        cuttings: snapped.cuttings,
        ghost: snapped.ghost,
        drag: snapped.drag,
        open: snapped.open,
        hashTable: snapped.hashTable,
        cam: snapped.cam,
      },
      jiggled: { cuttings: jiggled.cuttings, ghost: jiggled.ghost, open: jiggled.open, cam: jiggled.cam },
      clicked: { cuttings: clicked.cuttings, open: clicked.open },
    }),
  );
}

export async function cd46ReducedCarry({
  evaluate,
  send,
  check,
  settle,
  release,
  bandPoint,
  carry,
}: DragKit): Promise<void> {
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const reduced = await evaluate<boolean>(`matchMedia("(prefers-reduced-motion: reduce)").matches`);
  const target = await bandPoint();
  const { to } = await carry(target);
  await release(to.x, to.y);
  const landed = await settle(CARRY, (d, last) => d.cuttings === 1 && atRest(d, last), "chart-drawer-reduced-landed");
  const duration = await evaluate(DURATION);
  await send("Emulation.setEmulatedMedia", { features: [] });
  const full = await evaluate(DURATION);
  check(
    "CD46 under reduced motion a carry still files and the settle collapses to an instant place: the cutting lands, its class retires, and the settle's declared duration reads the blanket's near-zero against the 0.34s the same cutting reads once the emulation is cleared, which is the same-run control that makes the emulation a measurement (Issue #523; motion.css's blanket)",
    reduced === true &&
      landed.cuttings === 1 &&
      !landed.landing &&
      !landed.ghost &&
      parseFloat(duration!) < 0.01 &&
      parseFloat(full!) === 0.34,
    JSON.stringify({
      reduced,
      cuttings: landed.cuttings,
      landing: landed.landing,
      ghost: landed.ghost,
      duration,
      full,
    }),
  );
}

export async function cd47FullCarry({ check, settle, release, bandPoint, carry, restSeeing }: DragKit): Promise<void> {
  // The drawer is open and the Broadside folded from CD7's refusal, so the fold is constant across the carry.
  const before = await settle(CARRY, atRest, "chart-drawer-cap-rest");
  const target = await bandPoint();
  const { mid, to } = await carry(target);
  await release(to.x, to.y);
  const refusedCarry = await restSeeing("chart-drawer-cap-carried", "joltRuns");
  check(
    "CD47 a carry dropped on a FULL table is refused the way a click is: the six stay six, the cap's line is said, the sheets on the table jolt (seen running, then retired; D3 ruled 2026-09-21) while the drawer itself stays put, the ghost snaps back and is gone rather than stranded on the refusal, and the camera is at rest where it was (Issue #523)",
    before.cuttings === 6 &&
      before.open &&
      before.folded &&
      !!mid.ghost &&
      mid.receiving &&
      refusedCarry.cuttings === 6 &&
      refusedCarry.status === "the table is full: six sheets lie on it" &&
      refusedCarry.saw &&
      !refusedCarry.jolt &&
      !refusedCarry.ghost &&
      !refusedCarry.drag &&
      refusedCarry.open &&
      sameCam(before.cam, refusedCarry.cam),
    JSON.stringify({
      before: { cuttings: before.cuttings, open: before.open, folded: before.folded, cam: before.cam },
      mid: { ghost: !!mid.ghost, receiving: mid.receiving },
      after: {
        cuttings: refusedCarry.cuttings,
        status: refusedCarry.status,
        saw: refusedCarry.saw,
        jolt: refusedCarry.jolt,
        ghost: refusedCarry.ghost,
        drag: refusedCarry.drag,
        open: refusedCarry.open,
        cam: refusedCarry.cam,
      },
    }),
  );
}

type Ceremony = {
  frames: { offset: number; keys: string[]; transform: string | null }[] | null;
  timing: string[];
  tokens: string[];
  shadowRuns: boolean;
  finished: string;
  shadows: (Shade | null)[];
  root: { names: string[]; same: boolean; finished: boolean };
  jolt: string[];
};
// The settle and the jolt read off their animations with the classes put on scratch: the landing on the first cutting, finished at once; the jolt and the receiving edge on the list and the drawer.
const CEREMONY: Payload<Ceremony | null> = `(() => { const rgba = ${PAGE_RGBA}, shadeOf = ${SHADE}, li = document.querySelector("#cuttings li"), img = li && li.querySelector("img"), drawer = document.getElementById("chart-drawer"), list = document.getElementById("cuttings");
  if (!img) return null;
  const probe = document.createElement("div"); probe.style.cssText = "animation-duration: var(--paper-settle); animation-timing-function: var(--ease-paper); box-shadow: var(--cutting-shadow)"; document.body.append(probe);
  const pc = getComputedStyle(probe), tokens = [pc.animationDuration, pc.animationTimingFunction], token = shadeOf(pc.boxShadow); probe.remove();
  const rest = shadeOf(getComputedStyle(img).boxShadow); li.classList.add("landing");
  const land = li.getAnimations().find((a) => a.animationName === "cutting-land"), shade = img.getAnimations().find((a) => a.animationName === "cutting-shadow"), lc = getComputedStyle(li);
  const frames = land ? land.effect.getKeyframes().map((f) => ({ offset: f.computedOffset, keys: Object.keys(f).filter((x) => !["offset", "computedOffset", "easing", "composite"].includes(x)), transform: f.transform ?? null })) : null;
  const timing = [lc.animationDuration, lc.animationTimingFunction, lc.animationFillMode];
  if (land) land.finish(); if (shade) shade.finish();
  const finished = getComputedStyle(li).transform, settled = shadeOf(getComputedStyle(img).boxShadow); li.classList.remove("landing");
  const before = drawer.getAnimations(); list.classList.add("jolt"); drawer.classList.add("receiving");
  const after = drawer.getAnimations(), jolt = list.getAnimations().map((a) => a.animationName);
  list.classList.remove("jolt"); drawer.classList.remove("receiving");
  return { frames, timing, tokens, shadowRuns: !!shade, finished, shadows: [token, settled, rest], jolt,
    root: { names: after.map((a) => a.animationName), same: before.length === 1 && after.length === 1 && before[0] === after[0], finished: after.every((a) => a.playState === "finished") } };
})()`;

type Shade = { colour: Rgba; geometry: string };
// Chromium serialises a shadow's colour by how it was reached (an animation's end in oklab, a rule in srgb), so two shadows are compared through the canvas.
const sameShade = (a: Shade | null, b: Shade | null): boolean =>
  !!a && !!b && a.geometry === b.geometry && nearRgba(b.colour, a.colour);

const ceremonyFaults = (c: Ceremony): string[] =>
  [
    (!!c.frames &&
      c.frames.length >= 2 &&
      c.frames.every((f) => f.transform !== null && f.keys.every((x) => x === "transform" || x === "opacity")) &&
      c.frames.at(-1)!.transform === "none") ||
      "the settle a keyframe on transform alone, ending at none",
    (c.timing[0] === c.tokens[0] && c.timing[1] === c.tokens[1] && c.timing[2] === "both") ||
      "the settle timed by the motion tokens, filled both",
    (c.shadowRuns &&
      /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/.test(c.finished) &&
      sameShade(c.shadows[0] ?? null, c.shadows[1] ?? null) &&
      sameShade(c.shadows[0] ?? null, c.shadows[2] ?? null)) ||
      "the shadow flattening on the image to the token, the static rest the same token",
    (JSON.stringify(c.root.names) === JSON.stringify(["chart-drawer-up"]) && c.root.same && c.root.finished) ||
      "the drawer's own slide its only animation, unrestarted by a jolt or a receiving edge",
    JSON.stringify(c.jolt) === JSON.stringify(["cutting-jolt"]) || "the jolt on the list",
  ].filter((f): f is string => f !== true);

const TILTS: Payload<{
  x: number;
  y: number;
  hover: boolean;
  li: string;
  off: { focus: boolean; t: string } | null;
  within: string;
}> =
  `(() => { const li = document.querySelector("#cuttings li"), img = li.querySelector("img, .awaited"), off = li.querySelector(".off"), r = img.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, hover: li.matches(":hover"), li: getComputedStyle(li).transform,
    off: off && { focus: off.matches(":focus-visible"), t: getComputedStyle(off).transform }, within: li.matches(":focus-within") ? getComputedStyle(li).transform : "unfocused" }; })()`;

export async function cd53Ceremony(k: DrawerKit): Promise<void> {
  const { evaluate, send, check, sleep } = k;
  const settle = makeSettle({ evaluate, sleep });
  const tipped = (t: string): boolean => {
    const m = /^matrix\(([^)]*)\)$/.exec(t);
    if (!m) return t !== "none";
    const v = m[1]!.split(",").map(Number);
    return Math.abs(v[1]!) > 1e-6 || Math.abs(v[2]!) > 1e-6;
  };
  try {
    const c = await evaluate(CEREMONY);
    const at = await evaluate(TILTS);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: at.x, y: at.y });
    const hovered = await settle(
      TILTS,
      (d, last) => d.hover && !!last && d.li === last.li,
      "chart-drawer-cutting-hovered",
    );
    await park(send);
    const keyed = (await tabInto(k, "#cuttings li .off")) ? await evaluate(TILTS) : null;
    const wrong = c ? ceremonyFaults(c) : ["no cutting to read"];
    check(
      "CD53 the cutting's settle and the table's jolt are animations on their own classes: the settle a keyframe on transform alone ending at none, timed by the motion tokens and filled both, its shadow flattening on the image to the token the static rest also reads, the drawer's slide its only animation whatever the jolt or a receiving edge do, and no cutting or its remove press takes a tip under a real hover or a keyboard's focus",
      wrong.length === 0 && !tipped(hovered.li) && !!keyed?.off?.focus && !tipped(keyed.off.t) && !tipped(keyed.within),
      JSON.stringify({ wrong, c, hovered, keyed }),
    );
  } finally {
    await park(send);
    await evaluate<boolean>(`(() => { if (document.activeElement) document.activeElement.blur(); return true; })()`);
  }
}
