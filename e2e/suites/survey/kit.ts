import type { SuiteContext } from "../types.ts";

export type SurveyKit = ReturnType<typeof surveyKit>;

export function surveyKit(ctx: SuiteContext) {
  const { evaluate, send, sleep, waitSettled, waitReady, PORT } = ctx;
  const EXP = `http://127.0.0.1:${PORT}/explorer/`;
  // A navigate differing only in the hash is same-document and never re-runs the boot, so bounce through about:blank first (the suite-zoom Z13 idiom).
  const goto = async (hash: string, label: string) => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: EXP + hash });
    await waitReady();
    await waitSettled(label);
  };

  const waitInked = async (label: string) => {
    for (let i = 0; i < 120; i++) {
      const n = await evaluate<number>(`(()=>{const t=document.querySelector("#map .voyage-overlay .voyage-track");
        return t?(t.getAttribute("points")||"").trim().split(/\\s+/).length:0;})()`);
      if (n > 10) return n;
      await sleep(50);
    }
    throw new Error("waitInked timeout " + label);
  };

  // A marker registered on the same rAF-then-task hop the arm uses queues behind it, so absence checks need no sleep a slow CI runner could outlast.
  const waitBeat = async (label: string) => {
    for (let i = 0; i < 200; i++) {
      if (await evaluate<boolean>(`window.__beat === true`)) return;
      await sleep(25);
    }
    throw new Error("waitBeat timeout " + label);
  };

  const setBox = (on: boolean) => evaluate<undefined>(`(()=>{const c=document.getElementById("ages");
    c.checked=${on};c.dispatchEvent(new Event("change",{bubbles:true}));})()`);

  const tick = (on: boolean, into: string) => evaluate<{ checked: boolean; handlerMs: number; inked: boolean; overlays: number; hash: string; status: string; href: string | null }>(`(()=>{
    const c=document.getElementById("ages");window.${into}=null;const t0=performance.now();
    c.checked=${on};c.dispatchEvent(new Event("change",{bubbles:true}));
    const handlerMs=performance.now()-t0;
    requestAnimationFrame(()=>setTimeout(()=>{window.${into}=performance.now()-t0;},0));
    return{checked:c.checked,handlerMs,inked:!!document.querySelector("#map .voyage-overlay"),
      overlays:document.querySelectorAll("#map .voyage-overlay").length,
      hash:location.hash,status:document.getElementById("status").textContent,
      href:document.getElementById("journal-link").getAttribute("href")};
  })()`);
  return { ...ctx, EXP, goto, waitInked, waitBeat, setBox, tick };
}
