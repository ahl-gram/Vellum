// The Ribbon suite's kit: the room's address, its state read and the scroll's arrival.
import type { Payload, SuiteContext } from "../../types.ts";

export type Ribbon = {
  seed: number;
  from: number;
  to: number;
  leagues: number;
  dress: string;
  stRows: number;
  blob: boolean;
  shown: boolean;
  status: string | null;
  title: string | null;
  sub: string | null;
  unrolled: string | null;
  chart: string | null;
  prospect: string | null;
  prospectVerb: string | null;
  slipTitle: string | null;
  where: string | null;
  rows: number;
  toName: string | null;
  fromOptions: number[];
  prospectShown: boolean;
  hash: string;
};
export type Row = { cls: string; num: string | undefined; strong: string | null; em: string | null; button: boolean };
export type RibbonKit = ReturnType<typeof ribbonKit>;

export function ribbonKit(ctx: SuiteContext) {
  const { evaluate, send, sleep, PORT } = ctx;
  const page = (hash: string) => `http://127.0.0.1:${PORT}/ribbon/${hash}`;
  // A hash-to-hash Page.navigate on one path is a SAME-DOCUMENT navigation that never re-boots the page, so every fresh address arrives through a real cross-path hop (the prospect suite's precedent).
  const goto = async (hash: string) => {
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/faq/` });
    for (let i = 0; i < 100; i++) {
      let away = null;
      try {
        away = await evaluate<boolean>(`!document.getElementById("rb-plate")`);
      } catch {}
      if (away) break;
      await sleep(50);
    }
    await send("Page.navigate", { url: page(hash) });
  };
  const STATE: Payload<Ribbon | null> = `(()=>{const st=window.__vellumRibbonState&&window.__vellumRibbonState();const img=document.getElementById("rb-plate");if(!st)return null;const q=(sel)=>{const el=document.querySelector(sel);return el?el.textContent:null;};const a=(id)=>document.getElementById(id).getAttribute("href");const to=document.getElementById("rb-to");return{seed:st.seed,from:st.from,to:st.to,leagues:st.leagues,dress:st.dress,stRows:st.rows,blob:!!(img&&img.src&&img.src.startsWith("blob:")),shown:!!img&&!img.hidden,status:q("#rb-status"),title:q("#folio-title"),sub:q("#folio-sub"),unrolled:q("#rb-unrolled"),chart:a("rb-chart-link"),prospect:a("rb-prospect-link"),prospectVerb:q("#rb-prospect-verb"),slipTitle:q("#itinerary-title"),where:q("#itinerary .card-where"),rows:document.querySelectorAll("#rb-itinerary li").length,toName:to.selectedOptions[0]?to.selectedOptions[0].textContent:null,fromOptions:[...document.getElementById("rb-from").options].map((o)=>Number(o.value)),prospectShown:getComputedStyle(document.getElementById("rb-prospect-link")).display!=="none",hash:location.hash};})()`;
  const state = () => evaluate(STATE);
  const opened = async (label: string) => {
    for (let i = 0; i < 200; i++) {
      let s = null;
      try {
        s = await state();
      } catch {}
      if (s && s.blob && s.status === "") return s;
      await sleep(75);
    }
    throw new Error("ribbon page never drew: " + label);
  };
  const svgOf = () => evaluate<string>(`fetch(document.getElementById("rb-plate").src).then(r=>r.text())`, true);
  return { ...ctx, page, goto, state, opened, svgOf };
}
