import { buttonPoint, readCam } from "../../support/home.ts";
import type { Cam } from "../../support/home.ts";
import { nearRgba, PAGE_RGBA, tokenRgba } from "../../support/pixel.ts";
import type { Payload, Point, SuiteContext } from "../../types.ts";
import type { LandfallKit } from "./kit.ts";
import { roomy } from "./reads.ts";

export async function l9fPipGestures({
  evaluate,
  check,
  sleep,
  touch,
  pressKey,
  camNow,
  headroom,
  recenter,
}: LandfallKit): Promise<void> {
  // A gesture may BEGIN on a pip (PR #474 finding 2: the mouse-only capture rationale had gated all pointer types, deadening 47% of start points), and a plain touch TAP on that same pip must still open its card.
  await recenter();
  const pipPt9 = await evaluate(buttonPoint('.lf-station[data-station="how"]'));
  const room9f = await headroom();
  const onPipBefore = await camNow();
  // The second finger sits LEFT of the pip and the move stays horizontal: the pip can ride near the stage's right and lower edges, and a finger dispatched off the stage never registers (touch pointers are uncaptured), which faked this arm's first red.
  if (pipPt9 !== null) {
    await touch("touchStart", [
      { x: Math.round(pipPt9.x), y: Math.round(pipPt9.y), id: 0 },
      { x: Math.round(pipPt9.x) - 80, y: Math.round(pipPt9.y), id: 1 },
    ]);
    await touch("touchMove", [
      { x: Math.round(pipPt9.x) + 40, y: Math.round(pipPt9.y), id: 0 },
      { x: Math.round(pipPt9.x) - 40, y: Math.round(pipPt9.y), id: 1 },
    ]);
    await touch("touchEnd", []);
  }
  await sleep(300);
  const onPipAfter = await camNow();
  const cardStayed = await evaluate<boolean>(
    `(() => { const c = document.getElementById("lf-card-how"); return c !== null && c.hidden; })()`,
  );
  check(
    "L9f a two-finger gesture that begins on a pip still drives the map, and the drag never reads as a tap (the slip stays shut)",
    pipPt9 !== null &&
      roomy(room9f) &&
      onPipBefore !== null &&
      onPipAfter !== null &&
      onPipAfter.x - onPipBefore.x > 25 &&
      onPipAfter.x - onPipBefore.x < 55 &&
      cardStayed === true,
    JSON.stringify({ pipPt9, room9f, onPipBefore, onPipAfter, cardStayed }),
  );

  const tapPt = await evaluate(buttonPoint('.lf-station[data-station="how"]'));
  if (tapPt !== null) {
    await touch("touchStart", [{ x: Math.round(tapPt.x), y: Math.round(tapPt.y), id: 0 }]);
    await touch("touchEnd", []);
  }
  let tapped = false;
  for (let i = 0; i < 60; i++) {
    try {
      tapped = await evaluate<boolean>(
        `(() => { const c = document.getElementById("lf-card-how"); if (!c || c.hidden) return false; const cs = getComputedStyle(c); return cs.visibility !== "hidden" && Number(cs.opacity) > 0.95; })()`,
      );
    } catch {}
    if (tapped === true) break;
    await sleep(75);
  }
  check(
    "L9g a plain touch tap on the pip still opens its slip: loosening the control guard for gestures never costs the tap",
    tapPt !== null && tapped === true,
    JSON.stringify({ tapPt, tapped }),
  );
  await pressKey("Escape", "Escape", 27);
  await sleep(400);
}

export async function l9hControlTap({ evaluate, check, sleep, touch, camNow, recenter }: LandfallKit): Promise<void> {
  await recenter();
  const inPt = await evaluate(buttonPoint("#zoom-in"));
  const inBefore = await camNow();
  if (inPt !== null) {
    await touch("touchStart", [{ x: Math.round(inPt.x), y: Math.round(inPt.y), id: 0 }]);
    await touch("touchEnd", []);
  }
  let inAfter = null;
  for (let i = 0; i < 30; i++) {
    const c = await camNow();
    if (c !== null && inBefore !== null && c.scale > inBefore.scale * 1.4) {
      inAfter = c;
      break;
    }
    await sleep(100);
  }
  check(
    "L9h a one-finger touch tap on a camera button still zooms: the loosened control guard covers the controls, not just the pips (#475 ruling 2)",
    inPt !== null && inBefore !== null && inAfter !== null && inAfter.scale > inBefore.scale * 1.4,
    JSON.stringify({ inPt, inBefore, inAfter }),
  );
}

// The kit sheet is linked on every page, so a kit rule on a class home also wears leaks onto home unless a chart room or a room scopes it; an arm's state and pseudo-element are set aside so it is read whatever state it names, and the Glass, which home wears through the kit on purpose, is L24's.
const KIT_WALK = (
  plants: readonly string[],
): Payload<{ sheets: number; arms: number; offenders: string[] }> => `(() => {
  const SCOPED = /(^|\\s)body\\.(?:chart-room|room)\\b/;
  const kit = [...document.styleSheets].filter((s) => /\\/atelier[^/]*\\.css$/.test(s.href || ""));
  const glass = document.getElementById("lf-controls");
  const at = ${JSON.stringify(plants)}.map((p) => kit[0].insertRule(p, kit[0].cssRules.length));
  try {
    const arms = [];
    const walk = (rules) => { for (const r of rules) { if (r instanceof CSSStyleRule) arms.push(...r.selectorText.split(",").map((a) => a.trim())); else if (r.cssRules) walk(r.cssRules); } };
    kit.forEach((s) => walk(s.cssRules));
    const bare = (a) => a.replace(/::?(before|after|placeholder|marker|selection|-webkit-[a-z-]+)\\b.*$/, "").replace(/:(hover|focus-visible|focus-within|focus|active)\\b/g, "");
    const reaches = (a) => { try { return [...document.querySelectorAll(bare(a) || "*")].some((e) => !glass.contains(e)); } catch { return false; } };
    return { sheets: kit.length, arms: arms.length, offenders: arms.filter((a) => /\\./.test(a) && !SCOPED.test(a) && reaches(a)) };
  } finally { at.reverse().forEach((i) => kit[0].deleteRule(i)); }
})()`;
const PLANTS = [".stage:hover { position: fixed; }", ".stage .sheet { color: red; }"];

export async function l23KitReach({ evaluate, check }: SuiteContext): Promise<void> {
  const walk = await evaluate(KIT_WALK([]));
  const planted = await evaluate(KIT_WALK(PLANTS));
  check(
    "L23 no kit rule reaches home: every arm of the kit's sheet that names a class and is not scoped to a chart room or a room matches nothing home wears outside the Glass, in any state, and a bare rule and a compound of home's classes planted into the sheet are both read as reaching it (#487, the #302 inverse)",
    walk.sheets > 0 &&
      walk.arms > 0 &&
      walk.offenders.length === 0 &&
      JSON.stringify(planted.offenders) === JSON.stringify([".stage:hover", ".stage .sheet"]),
    JSON.stringify({ walk, planted }),
  );
}

// Focus by a real Tab from the last station, so the press wears :focus-visible as a keyboard reader's would.
async function tabToZoomIn({ evaluate, send }: LandfallKit): Promise<boolean> {
  await evaluate(`document.querySelector('.lf-station[data-station="how"]').focus()`);
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  return evaluate<boolean>(
    `document.activeElement?.id === "zoom-in" && document.activeElement.matches(":focus-visible")`,
  );
}

// Each kit declaration on an element of the Glass that is not dress is taken off its live rule for one read and put back: a computed value that moves means the kit's declaration wins on home's camera.
const LEAKS = (plant: string | null): Payload<{ rules: number; wins: string[][] }> => `(() => {
  const SCOPED = /(^|\\s)body\\.(?:chart-room|room)\\b/;
  const DRESS = /^(display|flex-direction|gap|row-gap|column-gap|align-items|transition|line-height|width|height|font|color|background|border|cursor|text-align)/;
  const kit = [...document.styleSheets].filter((s) => /\\/atelier[^/]*\\.css$/.test(s.href || ""));
  const glass = [document.getElementById("lf-controls"), ...document.querySelectorAll("#lf-controls *")];
  const at = ${JSON.stringify(plant)} === null ? -1 : kit[0].insertRule(${JSON.stringify(plant)}, kit[0].cssRules.length);
  try {
    const rules = [], wins = [];
    const walk = (list) => { for (const r of list) { if (r instanceof CSSStyleRule) rules.push(r); else if (r.cssRules && !(r instanceof CSSMediaRule && !matchMedia(r.conditionText).matches)) walk(r.cssRules); } };
    kit.forEach((s) => walk(s.cssRules));
    for (const r of rules) {
      const arms = r.selectorText.split(",").map((a) => a.trim()).filter((a) => !SCOPED.test(a) && !a.includes("body:has") && /\\./.test(a));
      const hit = glass.filter((e) => arms.some((a) => { try { return e.matches(a); } catch { return false; } }));
      if (!hit.length) continue;
      for (const p of [...r.style]) {
        if (DRESS.test(p)) continue;
        const v = r.style.getPropertyValue(p), pri = r.style.getPropertyPriority(p), before = hit.map((e) => getComputedStyle(e).getPropertyValue(p));
        r.style.removeProperty(p);
        const after = hit.map((e) => getComputedStyle(e).getPropertyValue(p));
        r.style.setProperty(p, v, pri);
        hit.forEach((e, i) => { if (before[i] !== after[i]) wins.push([r.selectorText.slice(0, 60), p, e.id || e.className, before[i], after[i]]); });
      }
    }
    return { rules: rules.length, wins };
  } finally { if (at >= 0) kit[0].deleteRule(at); }
})()`;

const ZOOM_IN_AT: Payload<Point> = `(() => { const r = document.getElementById("zoom-in").getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`;

export async function l24CameraLeaks(k: LandfallKit): Promise<void> {
  const { evaluate, send, check } = k;
  const rest = await evaluate(LEAKS(null));
  const planted = await evaluate(LEAKS(".corner { top: 3px; }"));
  const focused = (await tabToZoomIn(k)) ? await evaluate(LEAKS(null)) : null;
  await evaluate(`document.activeElement instanceof HTMLElement && document.activeElement.blur()`);
  const at = await evaluate(ZOOM_IN_AT);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: at.x, y: at.y, button: "none" });
  let hovered;
  try {
    hovered = await evaluate(LEAKS(".zoom-btn:hover { margin-top: 3px; }"));
  } finally {
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 20, y: 20, button: "none" });
  }
  check(
    "L24 home wears the kit's camera through the component alone: no kit declaration that is not dress wins on the Glass at rest, under a keyboard's focus or under the hand, and a seat planted on the corner and a lift planted on a hovered press are each read as winning (#505)",
    rest.rules > 0 &&
      rest.wins.length === 0 &&
      !!focused &&
      focused.wins.length === 0 &&
      planted.wins.some((w) => w[1] === "top") &&
      hovered.wins.length === 1 &&
      hovered.wins[0]![1] === "margin-top",
    JSON.stringify({ rest, focused, planted, hovered }),
  );
}

type Camera = { off: string; on: string; ring: number[] | null; touch: string[] };

const CAMERA: Payload<Camera> = `(() => {
  const rgba = ${PAGE_RGBA}, c = document.getElementById("lf-controls"), on = getComputedStyle(c).display;
  c.classList.remove("on"); const off = getComputedStyle(c).display; c.classList.add("on");
  const f = document.activeElement?.id === "zoom-in" ? getComputedStyle(document.activeElement) : null;
  return { off, on, ring: f && rgba(f.outlineColor), touch: [...c.querySelectorAll("button"), document.querySelector(".lf-station"), document.querySelector(".lf-legend-btn")].map((b) => getComputedStyle(b).touchAction) };
})()`;

async function pressed(k: LandfallKit, id: string, settled: (c: Cam) => boolean): Promise<Cam | null> {
  const at = await k.evaluate(buttonPoint(`#${id}`));
  if (!at) return null;
  await k.clickAt(Math.round(at.x), Math.round(at.y));
  let cam: Cam | null = null;
  for (let i = 0; i < 40; i++) {
    await k.sleep(100);
    cam = await k.evaluate(readCam);
    if (cam !== null && settled(cam)) return cam;
  }
  return cam;
}

export async function l30Camera(k: LandfallKit): Promise<void> {
  const tabbed = await tabToZoomIn(k);
  const read = await k.evaluate(CAMERA);
  await k.evaluate(`document.activeElement instanceof HTMLElement && document.activeElement.blur()`);
  const before = await k.evaluate(readCam);
  const out = await pressed(k, "zoom-out", (c) => !!before && c.scale < before.scale * 0.9);
  const home = await pressed(k, "zoom-reset", (c) => Math.abs(c.scale - c.fit) < 1e-3);
  const centred = await k.evaluate<boolean>(
    `(() => { const s = document.getElementById("lf-stage").getBoundingClientRect(), r = document.getElementById("lf-sheet").getBoundingClientRect(); return Math.abs(r.x + r.width / 2 - s.x - s.width / 2) < 2 && Math.abs(r.y + r.height / 2 - s.y - s.height / 2) < 2; })()`,
  );
  k.check(
    "L30 home's camera stays hidden until the bundle arms it, rings in the house's ink-dark under a keyboard's focus, hands a vertical touch to the page as the stations and the legend's presses do, and answers its presses: Stand off draws the camera back and the whole-sheet press lays the whole sheet in the stage's centre (#505, #475)",
    read.off === "none" &&
      read.on === "flex" &&
      tabbed &&
      nearRgba(read.ring, tokenRgba("--ink-dark")) &&
      read.touch.length === 5 &&
      read.touch.every((t) => t === "pan-y") &&
      !!before &&
      !!out &&
      out.scale < before.scale * 0.9 &&
      !!home &&
      Math.abs(home.scale - home.fit) < 1e-3 &&
      centred,
    JSON.stringify({ tabbed, read, before, out, home, centred }),
  );
}
