// A phone that paints before a room's bundle runs meets the desk frame's switch with its style resolved, which under reduced motion is where the body's height can lag the switch (handbook/specs/cascade-traps.md); this forces that on every visit and records the body's height either side of the switch.
import { DESK_FRAME } from "../../../src/site/shared/page-box.ts";
import type { SuiteContext } from "../../types.ts";
import type { Read } from "./stage.ts";

export type DeskSwitch = { before: string; after: string };

export const STYLED_BOOT = `(() => { const toggle = DOMTokenList.prototype.toggle; DOMTokenList.prototype.toggle = function (...args) { if (args[0] !== ${JSON.stringify(DESK_FRAME)} || this !== document.documentElement.classList) return toggle.apply(this, args); const before = getComputedStyle(document.body).height; const on = toggle.apply(this, args); window.__deskSwitch = { before, after: getComputedStyle(document.body).height }; return on; }; })()`;

export async function withStyledBoot<T>({ send }: Pick<SuiteContext, "send">, body: () => Promise<T>): Promise<T> {
  const { identifier } = await send<{ identifier: string }>("Page.addScriptToEvaluateOnNewDocument", {
    source: STYLED_BOOT,
  });
  try {
    return await body();
  } finally {
    await send("Page.removeScriptToEvaluateOnNewDocument", { identifier }).catch(() => undefined);
  }
}

export const switchFaults = (reads: readonly Read[], frameH: number): string[] =>
  reads
    .filter(
      (r) =>
        !(
          r.s.reduce &&
          r.s.deskSwitch !== null &&
          parseFloat(r.s.deskSwitch.before) > 0 &&
          r.s.deskSwitch.after === `${frameH}px`
        ),
    )
    .map(
      (r) =>
        `${r.page}: the body read ${JSON.stringify(r.s.deskSwitch)} across the frame's switch, reduced motion ${r.s.reduce}`,
    );
