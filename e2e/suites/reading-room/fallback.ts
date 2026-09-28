import { dropExpectedCancellations } from "../../support/console.ts";
import type { SuiteContext } from "../../types.ts";

export function rr12Clean(ctx: SuiteContext, rrErrBase: number, rrHttpBase: number): void {
  const { check, consoleErrors, http4xx } = ctx;
  const newErrs = dropExpectedCancellations(consoleErrors.slice(rrErrBase));
  check("RR12 the reading-room run logged no JS exceptions or console errors", newErrs.length === 0, newErrs.join(" | ") || "clean");
  const new4xx = http4xx.slice(rrHttpBase).filter((u) => !/favicon/i.test(u));
  check("RR13 no new missing resources (no worker/asset 4xx from /reading-room/)", new4xx.length === 0, new4xx.join(", ") || "none");
}

export async function rr14Fallback(ctx: SuiteContext): Promise<void> {
  const { evaluate, send, check, sleep, serverState, PORT } = ctx;
  try {
    await send("Network.clearBrowserCache");
    await send("Network.setCacheDisabled", { cacheDisabled: true });
    serverState.blockWorker = true;
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/#seed=42&style=antique&legend=1` });
    let fb = null;
    for (let i = 0; i < 220; i++) {
      let s = null;
      try {
        s = await evaluate<{ uw: boolean | null; warn: boolean; svg: boolean; status: string | undefined }>(`(()=>{const uw=typeof window.__vellumReadingRoomUsesWorker==="function"?window.__vellumReadingRoomUsesWorker():null;const w=document.getElementById("rr-warning");return{uw,warn:!!(w&&!w.hidden),svg:!!document.querySelector(".rf-chart svg"),status:(document.querySelector(".rf-status")||{}).textContent};})()`);
      } catch {}
      // The gate deliberately omits s.svg: RR15 asserts it, and requiring it here would make RR15 true by construction.
      if (s && s.uw === false && s.status === "") { fb = s; break; }
      await sleep(75);
    }
    check("RR14 inline fallback: worker blocked -> inline path taken and #rr-warning shown", !!fb && fb.uw === false && fb.warn === true, JSON.stringify(fb));
    check("RR15 inline fallback: the chart still renders on the main thread", !!fb && fb.svg === true, JSON.stringify(fb));
  } finally {
    serverState.blockWorker = false;
    try { await send("Network.setCacheDisabled", { cacheDisabled: false }); } catch {}
  }
}
