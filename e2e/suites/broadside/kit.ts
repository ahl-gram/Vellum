// The Broadside suite's kit: the Explorer's address, its boot, its survey-ink wait and its plain boot.
import { toExplorer, waitInked } from "../../support/explorer.ts";
import type { SuiteContext } from "../../types.ts";
import { bounce } from "../../support/nav.ts";
import { SLIP_FLOOR } from "../../../src/site/shared/room-seats.ts";

export type BroadsideKit = ReturnType<typeof broadsideKit>;

// 2026-11-06: half a pixel, since a window's height and the floor `placeSlip` writes under it move a whole pixel together, and the inline strings the floor is read back from err by under 0.01 px (Issue #1260 plan revision 5).
const FLOOR_NEAR = 0.5;
export const onSlipFloor = (floor: number | null, h: number): boolean =>
  floor !== null && Math.abs(floor - (h - SLIP_FLOOR)) < FLOOR_NEAR;

export function broadsideKit(ctx: SuiteContext) {
  const { evaluate, send, sleep, PORT } = ctx;
  const EXP = `http://127.0.0.1:${PORT}/explorer/`;
  const goto = (url: string, label: string): Promise<void> => toExplorer(ctx, url, label);
  const gotoPlain = async (url: string, label: string): Promise<void> => {
    await bounce(send, url);
    for (let i = 0; i < 100; i++) {
      if (await evaluate<boolean>(`document.readyState === "complete"`)) return;
      await sleep(50);
    }
    throw new Error("gotoPlain timeout " + label);
  };
  return { ...ctx, EXP, goto, waitInked: (label: string): Promise<number> => waitInked(ctx, label), gotoPlain };
}
