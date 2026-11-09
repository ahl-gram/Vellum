import { buttonPoint, readCam } from "../../support/home.ts";
import type { Cam } from "../../support/home.ts";
import { nearRgba, PAGE_RGBA, tokenRgba } from "../../support/pixel.ts";
import type { Payload } from "../../types.ts";
import type { LandfallKit } from "./kit.ts";
import { roomy } from "./reads.ts";
import { sendKey } from "../../support/input.ts";

async function l9gPipTap({
  evaluate,
  check,
  sleep,
  touch,
  shutSlips,
}: Pick<LandfallKit, "evaluate" | "check" | "sleep" | "touch" | "shutSlips">): Promise<void> {
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
  await shutSlips("L9g the how slip set aside");
}

export async function l9fPipGestures({
  evaluate,
  check,
  sleep,
  touch,
  shutSlips,
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
  await sleep(300, "window: a gesture on the pip must not move the camera in it");
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
  await l9gPipTap({ evaluate, check, sleep, touch, shutSlips });
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

// Focus by a real Tab from the last station, so the press wears :focus-visible as a keyboard reader's would.
async function tabToZoomIn({ evaluate, send }: LandfallKit): Promise<boolean> {
  await evaluate(`document.querySelector('.lf-station[data-station="how"]').focus()`);
  await sendKey(send, "Tab", "Tab", 9);
  return evaluate<boolean>(
    `document.activeElement?.id === "zoom-in" && document.activeElement.matches(":focus-visible")`,
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
      read.touch.length === 6 &&
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
