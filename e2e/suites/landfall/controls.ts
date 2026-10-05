import { buttonPoint } from "../../support/home.ts";
import type { LandfallKit } from "./kit.ts";
import { roomy } from "./reads.ts";

export async function l9fPipGestures({ evaluate, check, sleep, touch, pressKey, camNow, headroom, recenter }: LandfallKit): Promise<void> {
  // A gesture may BEGIN on a pip (PR #474 finding 2: the mouse-only capture rationale had gated all pointer types, deadening 47% of start points), and a plain touch TAP on that same pip must still open its card.
  await recenter();
  const pipPt9 = await evaluate(buttonPoint('.lf-station[data-station="how"]'));
  const room9f = await headroom();
  const onPipBefore = await camNow();
  // The second finger sits LEFT of the pip and the move stays horizontal: the pip can ride near the stage's right and lower edges, and a finger dispatched off the stage never registers (touch pointers are uncaptured), which faked this arm's first red.
  if (pipPt9 !== null) {
    await touch("touchStart", [{ x: Math.round(pipPt9.x), y: Math.round(pipPt9.y), id: 0 }, { x: Math.round(pipPt9.x) - 80, y: Math.round(pipPt9.y), id: 1 }]);
    await touch("touchMove", [{ x: Math.round(pipPt9.x) + 40, y: Math.round(pipPt9.y), id: 0 }, { x: Math.round(pipPt9.x) - 40, y: Math.round(pipPt9.y), id: 1 }]);
    await touch("touchEnd", []);
  }
  await sleep(300);
  const onPipAfter = await camNow();
  const cardStayed = await evaluate<boolean>(`(() => { const c = document.getElementById("lf-card-how"); return c !== null && c.hidden; })()`);
  check(
    "L9f a two-finger gesture that begins on a pip still drives the map, and the drag never reads as a tap (the slip stays shut)",
    pipPt9 !== null && roomy(room9f) && onPipBefore !== null && onPipAfter !== null
      && onPipAfter.x - onPipBefore.x > 25 && onPipAfter.x - onPipBefore.x < 55 && cardStayed === true,
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
      tapped = await evaluate<boolean>(`(() => { const c = document.getElementById("lf-card-how"); if (!c || c.hidden) return false; const cs = getComputedStyle(c); return cs.visibility !== "hidden" && Number(cs.opacity) > 0.95; })()`);
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
    if (c !== null && inBefore !== null && c.scale > inBefore.scale * 1.4) { inAfter = c; break; }
    await sleep(100);
  }
  check(
    "L9h a one-finger touch tap on a camera button still zooms: the loosened control guard covers the controls, not just the pips (#475 ruling 2)",
    inPt !== null && inBefore !== null && inAfter !== null && inAfter.scale > inBefore.scale * 1.4,
    JSON.stringify({ inPt, inBefore, inAfter }),
  );
}
