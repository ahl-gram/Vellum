import { dropExpectedCancellations } from "../console-support.ts";
import type { SuiteContext } from "../types.ts";

export function pr6Clean(ctx: SuiteContext, prErrBase: number, prHttpBase: number): void {
  const { check, consoleErrors, http4xx } = ctx;
  const newErrs = dropExpectedCancellations(consoleErrors.slice(prErrBase));
  check("PR6 the print-room run logged no JS exceptions or console errors", newErrs.length === 0, newErrs.join(" | ") || "clean");
  const new4xx = http4xx.slice(prHttpBase).filter((u) => !/favicon/i.test(u));
  check("PR7 no new missing resources (no worker/engine/asset 4xx from /print-room/)", new4xx.length === 0, new4xx.join(", ") || "none");
}

export async function pr8Fallback(ctx: SuiteContext): Promise<void> {
  const { evaluate, send, check, sleep, serverState, PORT } = ctx;
  try {
    await send("Network.clearBrowserCache");
    await send("Network.setCacheDisabled", { cacheDisabled: true });
    serverState.blockWorker = true;
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/print-room/#seed=42&style=antique&legend=1` });
    let fb = null;
    for (let i = 0; i < 220; i++) {
      let s = null;
      try {
        s = await evaluate<{ uw: boolean | null; warn: boolean; svg: boolean; status: string | undefined }>(`(()=>{const uw=typeof window.__vellumPrintRoomUsesWorker==="function"?window.__vellumPrintRoomUsesWorker():null;const w=document.getElementById("pr-warning");return{uw,warn:!!(w&&!w.hidden),svg:!!document.querySelector("#pr-preview svg"),status:(document.getElementById("pr-status")||{}).textContent};})()`);
      } catch {}
      if (s && s.uw === false && s.svg && s.status === "") { fb = s; break; }
      await sleep(75);
    }
    check("PR8 inline fallback: worker blocked -> inline path taken and #pr-warning shown", !!fb && fb.uw === false && fb.warn === true, JSON.stringify(fb));
    check("PR9 inline fallback: the proof still renders on the main thread", !!fb && fb.svg === true, JSON.stringify(fb));
  } finally {
    serverState.blockWorker = false;
    try { await send("Network.setCacheDisabled", { cacheDisabled: false }); } catch {}
  }
}
