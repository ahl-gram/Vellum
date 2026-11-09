// The Portfolio as written and as it loads (Issue #779 part 2g): its where-line as authored, and a load whose worker never starts.
import { makeSettle } from "../../support/settle.ts";
import { withScriptsOff } from "../../support/scripts-off.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import type { DrawerKit } from "./kit.ts";
import { DRAWN, DRESS, ONE } from "./reads.ts";
import { bounce, leaveBlank } from "../../support/nav.ts";

const WHERE: Payload<{ where: string | null; app: boolean; ready: string }> =
  `(() => ({ where: (document.querySelector("#portfolio .card-where") || {}).textContent || null, app: typeof window.__vellumPortfolio === "function", ready: document.readyState }))()`;

export async function cd55WhereAuthored({ evaluate, send, check, sleep, PORT }: SuiteContext): Promise<void> {
  const control = await evaluate(WHERE);
  try {
    const off = await withScriptsOff(send, async () => {
      await bounce(send, `http://127.0.0.1:${PORT}/explorer/portfolio/`);
      return makeSettle({ evaluate, sleep, tolerant: true })(
        WHERE,
        (d) => d.ready === "complete",
        "portfolio-scripts-off",
      );
    });
    check(
      "CD55 the Portfolio's where-line ships promising the sheets gathered at the Explorer, and the script writes the bare voice over it when nothing was gathered (scripts on the control)",
      control.app &&
        control.where === "no sheets gathered at the Explorer" &&
        !off.app &&
        off.where === "the sheets gathered at the Explorer",
      JSON.stringify({ control, off }),
    );
  } finally {
    await leaveBlank(send);
  }
}

// The pill's first written line is read off the mutation itself, since the drafting writes it and clears it in one task.
const FIRST = `(() => { window.__cd56 = null; const W = window.Worker; window.Worker = class extends W { constructor(...a) { super(...a); this.addEventListener("error", () => { window.__cd56Failed = true; }); } };
  new MutationObserver((records) => { const s = document.getElementById("pf-status"), w = document.getElementById("pf-warning");
  for (const r of records) { const line = r.type === "characterData" ? r.target.data : [...r.addedNodes].map((n) => n.textContent).join("");
    if (window.__cd56 === null && s && (r.target === s || s.contains(r.target)) && line) window.__cd56 = { line, warned: !!w && !w.hidden }; } }).observe(document, { childList: true, subtree: true, characterData: true }); })();`;
type Fallback = {
  blocked: boolean;
  drawn: number;
  warning: (string | number | boolean)[] | null;
  offCentre: number;
  presses: number[];
  first: { line: string; warned: boolean } | null;
};
const FALLBACK: Payload<Fallback> = `(() => { const w = document.getElementById("pf-warning"), stage = document.querySelector(".stage"), s = getComputedStyle(stage), st = stage.getBoundingClientRect(), sh = document.getElementById("sheet").getBoundingClientRect();
  const width = (id) => { const e = document.getElementById(id); return e ? e.getBoundingClientRect().width : 0; }, p = window.__vellumPortfolio ? window.__vellumPortfolio() : null;
  return { blocked: window.__cd56Failed === true, drawn: p ? p.drawn : -1, warning: w && [w.hidden, w.getBoundingClientRect().width, w.parentElement === stage, getComputedStyle(w).position],
    offCentre: Math.abs(sh.left + sh.width / 2 - (st.left + parseFloat(s.paddingLeft) + (st.width - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight)) / 2)),
    presses: [width("pf-next"), width("pf-download")], first: window.__cd56 }; })()`;

export async function cd56WorkerBlocked(k: DrawerKit): Promise<void> {
  const { evaluate, send, check, sleep, PORT, serverState, forget } = k;
  const { identifier } = await send<{ identifier: string }>("Page.addScriptToEvaluateOnNewDocument", { source: FIRST });
  try {
    await send("Network.clearBrowserCache");
    await send("Network.setCacheDisabled", { cacheDisabled: true });
    serverState.blockWorker = true;
    await forget();
    await bounce(send, `http://127.0.0.1:${PORT}/explorer/portfolio/#${DRESS}&table=${ONE}`);
    const settle = makeSettle({ evaluate, sleep, tolerant: true });
    const read = await settle(FALLBACK, (d) => d.drawn === 1, "portfolio-drafted-inline", DRAWN);
    check(
      "CD56 a Portfolio whose worker never starts says so in its stage, seated over the sheet so the sheet stays centred, and raises the notice before the first drafting line, and a one-sheet folio keeps both its presses (the worker's own load error the witness)",
      read.blocked &&
        JSON.stringify(read.warning?.slice(2)) === JSON.stringify([true, "absolute"]) &&
        read.warning?.[0] === false &&
        (read.warning[1] as number) > 0 &&
        read.offCentre < 1 &&
        read.presses.every((w) => w > 0) &&
        read.first?.warned === true,
      JSON.stringify(read),
    );
  } finally {
    serverState.blockWorker = false;
    await send("Network.setCacheDisabled", { cacheDisabled: false }).catch(() => undefined);
    await send("Page.removeScriptToEvaluateOnNewDocument", { identifier });
  }
}
