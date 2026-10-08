import type { Point } from "../../types.ts";
import type { LandfallKit } from "./kit.ts";
import { roomDir } from "./reads.ts";

export async function l9dCeiling(
  { evaluate, check, sleep, pinch, camNow, headroom, twoFingerDrag }: LandfallKit,
  stagePt9: Point | null,
): Promise<void> {
  // Saturate to the close-in clamp by real pinches alone (no mouse mixing inside the touch block).
  let top9 = await camNow();
  for (let i = 0; i < 12 && stagePt9 !== null; i++) {
    await pinch(stagePt9.x, stagePt9.y, 60, 180);
    await sleep(200);
    const next = await camNow();
    if (next !== null && top9 !== null && Math.abs(next.scale - top9.scale) < 1e-9) {
      top9 = next;
      break;
    }
    top9 = next;
  }
  const room9d = await headroom();
  const dir9d = roomDir(room9d);
  // Before/after sampling is blind to a mid-gesture dip that saturates back to the ceiling (guard-prover round 2), so the arm watches every synchronous transform write and keeps the minimum.
  await evaluate(`(() => {
    const sheet = document.getElementById("lf-sheet");
    const scaleOf = (t) => { const m = /scale\\(([-\\d.e]+)\\)/.exec(t ?? ""); return m === null ? null : Number(m[1]); };
    window.__lfMinScale = scaleOf(sheet?.style.transform) ?? Infinity;
    window.__lfScaleWrites = 0;
    window.__lfScaleObs?.disconnect();
    window.__lfScaleObs = new MutationObserver((recs) => {
      window.__lfScaleWrites += recs.length;
      for (const r of recs) { const s = scaleOf(r.oldValue); if (s !== null && s < window.__lfMinScale) window.__lfMinScale = s; }
      const now = scaleOf(sheet?.style.transform); if (now !== null && now < window.__lfMinScale) window.__lfMinScale = now;
    });
    if (sheet) window.__lfScaleObs.observe(sheet, { attributes: true, attributeFilter: ["style"], attributeOldValue: true });
  })()`);
  const maxBefore = await camNow();
  if (stagePt9 !== null && dir9d !== null) await twoFingerDrag(stagePt9, dir9d.sx, dir9d.sy);
  const minScale9d = await evaluate<number | undefined>(`(window.__lfScaleObs?.disconnect(), window.__lfMinScale)`);
  // A drag at the clamp writes the transform at least once (the pan half alone), so zero observed writes means the instrument never engaged, not a quiet gesture (guard-prover round 3).
  const writes9d = await evaluate<number>(`window.__lfScaleWrites`);
  const maxAfter = await camNow();
  check(
    "L9d at the close-in clamp a two-finger drag still pans into PROVEN headroom, signed, and never collapses the zoom EVEN MID-GESTURE (PR #474 measured scale 7 falling to 4.53 here; a dip that saturates back by gesture end hides from before/after reads)",
    top9 !== null &&
      Math.abs(top9.scale - 7) < 1e-6 &&
      dir9d !== null &&
      maxBefore !== null &&
      maxAfter !== null &&
      Math.abs(maxAfter.scale - 7) < 1e-6 &&
      typeof minScale9d === "number" &&
      minScale9d > 7 - 1e-6 &&
      typeof writes9d === "number" &&
      writes9d > 0 &&
      (maxAfter.x - maxBefore.x) * dir9d.sx > 25 &&
      (maxAfter.x - maxBefore.x) * dir9d.sx < 55 &&
      (maxAfter.y - maxBefore.y) * dir9d.sy > 18 &&
      (maxAfter.y - maxBefore.y) * dir9d.sy < 42,
    JSON.stringify({ room9d, dir9d, maxBefore, maxAfter, minScale9d, writes9d }),
  );
}

export async function l9d2Debt({ check, sleep, touch, camNow }: LandfallKit, stagePt9: Point | null): Promise<void> {
  // The from-start ratio's own contract: a clamped pinch-in owes its debt, so returning to the starting spread lands back on the clamp exactly (a per-frame relative ratio forgets the clamped half and undershoots).
  const debtBefore = await camNow();
  if (stagePt9 !== null) {
    await touch("touchStart", [
      { x: stagePt9.x - 40, y: stagePt9.y, id: 0 },
      { x: stagePt9.x + 40, y: stagePt9.y, id: 1 },
    ]);
    await touch("touchMove", [
      { x: stagePt9.x - 80, y: stagePt9.y, id: 0 },
      { x: stagePt9.x + 80, y: stagePt9.y, id: 1 },
    ]);
    await sleep(120);
    await touch("touchMove", [
      { x: stagePt9.x - 40, y: stagePt9.y, id: 0 },
      { x: stagePt9.x + 40, y: stagePt9.y, id: 1 },
    ]);
    await sleep(120);
    await touch("touchEnd", []);
  }
  await sleep(300);
  const debtAfter = await camNow();
  check(
    "L9d2 the pinch owes its debt at the ceiling: one gesture that pinches in past the clamp and returns to its starting spread lands exactly back on 7",
    debtBefore !== null &&
      debtAfter !== null &&
      Math.abs(debtBefore.scale - 7) < 1e-6 &&
      Math.abs(debtAfter.scale - 7) < 1e-6,
    JSON.stringify({ debtBefore, debtAfter }),
  );
}

export async function l9eFloor(
  { check, sleep, pinch, camNow, headroom, twoFingerDrag }: LandfallKit,
  stagePt9: Point | null,
): Promise<void> {
  let floor9 = await camNow();
  for (let i = 0; i < 14 && stagePt9 !== null; i++) {
    await pinch(stagePt9.x, stagePt9.y, 180, 60);
    await sleep(200);
    const next = await camNow();
    if (next !== null && floor9 !== null && Math.abs(next.scale - floor9.scale) < 1e-9) {
      floor9 = next;
      break;
    }
    floor9 = next;
  }
  const room9e = await headroom();
  const dir9e = roomDir(room9e);
  const minBefore = await camNow();
  if (stagePt9 !== null && dir9e !== null) await twoFingerDrag(stagePt9, dir9e.sx, dir9e.sy);
  const minAfter = await camNow();
  check(
    "L9e at the stand-off clamp a two-finger drag holds the scale on its floor (PR #474 measured a 1.6x zoom-IN here) and pans into PROVEN headroom, signed",
    floor9 !== null &&
      dir9e !== null &&
      minBefore !== null &&
      minAfter !== null &&
      Math.abs(minBefore.scale - minBefore.fit * 0.65) < 1e-6 &&
      Math.abs(minAfter.scale - minBefore.scale) < 1e-9 &&
      (minAfter.x - minBefore.x) * dir9e.sx > 25 &&
      (minAfter.x - minBefore.x) * dir9e.sx < 55 &&
      (minAfter.y - minBefore.y) * dir9e.sy > 18 &&
      (minAfter.y - minBefore.y) * dir9e.sy < 42,
    JSON.stringify({ room9e, dir9e, minBefore, minAfter }),
  );
}
