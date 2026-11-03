import { toExplorer, waitInked } from "../../support/explorer.ts";
import { makeSettle, makeStable } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";

const ARMED_POINTS = 11;

export type SurveyKit = ReturnType<typeof surveyKit>;

const LEAF: Payload<{ t: string; m11: number }> =
  `(() => { const i = document.querySelector("#sheet .sheet-inner"); if (!i) return null; const t = getComputedStyle(i).transform; return { t, m11: t === "none" ? 1 : new DOMMatrixReadOnly(t).m11 }; })()`;
export const restOnVerso = (k: Pick<SuiteContext, "evaluate" | "sleep">, label: string) =>
  makeStable(makeSettle(k))(LEAF, label, { departed: (d) => d.m11 < -0.999 });

export function surveyKit(ctx: SuiteContext) {
  const { evaluate, sleep, PORT } = ctx;
  const EXP = `http://127.0.0.1:${PORT}/explorer/`;
  const goto = (hash: string, label: string): Promise<void> => toExplorer(ctx, EXP + hash, label);

  // A marker registered on the same rAF-then-task hop the arm uses queues behind it, so absence checks need no sleep a slow CI runner could outlast.
  const waitBeat = async (label: string) => {
    for (let i = 0; i < 200; i++) {
      if (await evaluate<boolean>(`window.__beat === true`)) return;
      await sleep(25);
    }
    throw new Error("waitBeat timeout " + label);
  };

  const setBox = (on: boolean) =>
    evaluate<undefined>(`(()=>{const c=document.getElementById("ages");
    c.checked=${on};c.dispatchEvent(new Event("change",{bubbles:true}));})()`);

  const tick = (on: boolean, into: string) =>
    evaluate<{
      checked: boolean;
      handlerMs: number;
      inked: boolean;
      overlays: number;
      hash: string;
      status: string;
      href: string | null;
    }>(`(()=>{
    const c=document.getElementById("ages");window.${into}=null;const t0=performance.now();
    c.checked=${on};c.dispatchEvent(new Event("change",{bubbles:true}));
    const handlerMs=performance.now()-t0;
    requestAnimationFrame(()=>setTimeout(()=>{window.${into}=performance.now()-t0;},0));
    return{checked:c.checked,handlerMs,inked:!!document.querySelector("#map .voyage-overlay"),
      overlays:document.querySelectorAll("#map .voyage-overlay").length,
      hash:location.hash,status:document.getElementById("status").textContent,
      href:document.getElementById("journal-link").getAttribute("href")};
  })()`);
  return {
    ...ctx,
    EXP,
    goto,
    waitInked: (label: string): Promise<number> => waitInked(ctx, label, ARMED_POINTS),
    waitBeat,
    setBox,
    tick,
  };
}
