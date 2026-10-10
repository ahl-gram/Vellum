// The Prospect suite's kit: the room's address, its state read, the plate's arrival, a real mouse, the device table, and the accessible name a control is announced by.
import { TABLE_STORE_KEY } from "../../../src/site/shared/table-store.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { pressAt as press } from "../print-room/kit.ts";

export type Prospect = {
  seed: number;
  index: number;
  year: number;
  presentYear: number;
  name: string;
  dress: string;
  era: string;
  keyRows: number;
  roads: boolean;
  svgLength: number;
  blob: boolean;
  shown: boolean;
  status: string | null;
  title: string | null;
  sub: string | null;
  pressed: string | null;
  chart: string | null;
  ribbon: string | null;
  ribbonVerb: string | null;
  ribbonShown: boolean;
  yearField: string;
  eraLine: string | null;
  noteTitle: string | null;
  where: string | null;
  note: string | null;
  keyLis: number;
  keyHeadHidden: boolean;
  hash: string;
};

export type ProspectKit = ReturnType<typeof prospectKit>;

export const STORE = JSON.stringify(TABLE_STORE_KEY);

export function prospectKit(ctx: SuiteContext) {
  const { evaluate, send, sleep, PORT } = ctx;
  const page = (hash: string) => `http://127.0.0.1:${PORT}/prospect/${hash}`;
  // The page reads its address ONCE at boot (the year control re-engraves the same place), and a hash-to-hash Page.navigate on one path is a SAME-DOCUMENT navigation that never re-boots it, so every fresh address must arrive through a real cross-path hop (the Print Room precedent).
  const goto = async (hash: string) => {
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/faq/` });
    // Poll for the hop COMMITTING, never a fixed sleep: until the prospect DOM is gone, a poll below could read the OLD document's settled state.
    for (let i = 0; i < 100; i++) {
      let away = null;
      try {
        away = await evaluate<boolean>(`!document.getElementById("pp-plate")`);
      } catch {}
      if (away) break;
      await sleep(50);
    }
    await send("Page.navigate", { url: page(hash) });
  };
  const STATE: Payload<Prospect | null> = `(()=>{const st=window.__vellumProspectState&&window.__vellumProspectState();const img=document.getElementById("pp-plate");if(!st)return null;const q=(sel)=>{const el=document.querySelector(sel);return el?el.textContent:null;};const a=(id)=>document.getElementById(id).getAttribute("href");return{seed:st.seed,index:st.index,year:st.year,presentYear:st.presentYear,name:st.name,dress:st.dress,era:st.era,keyRows:st.keyRows,roads:st.roads,svgLength:st.svgLength,blob:!!(img&&img.src&&img.src.startsWith("blob:")),shown:!!img&&!img.hidden,status:q("#pp-status"),title:q("#folio-title"),sub:q("#folio-sub"),pressed:q("#pp-pressed"),chart:a("pp-chart-link"),ribbon:a("pp-ribbon-link"),ribbonVerb:q("#pp-ribbon-verb"),ribbonShown:getComputedStyle(document.getElementById("pp-ribbon-link")).display!=="none",yearField:document.getElementById("pp-year").value,eraLine:q("#pp-era"),noteTitle:q("#note-title"),where:q("#note .card-where"),note:q("#pp-note"),keyLis:document.querySelectorAll("#pp-key li").length,keyHeadHidden:getComputedStyle(document.getElementById("pp-key-head")).display==="none",hash:location.hash};})()`;
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
    throw new Error("prospect page never drew: " + label);
  };
  const svgOf = () => evaluate<string>(`fetch(document.getElementById("pp-plate").src).then(r=>r.text())`, true);
  const moveTo = (x: number, y: number) => send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  const pressAt = (x: number, y: number) => press(ctx, x, y);
  // Off the sheet, where `.plate:hover` cannot tip the full-sheet plate under a resting cursor (Issue #514).
  const parkMouse = () => moveTo(1, 1);
  const forget = async () => {
    try {
      await evaluate(`localStorage.removeItem(${STORE})`);
    } catch {}
  };
  return { ...ctx, page, goto, state, opened, svgOf, moveTo, pressAt, parkMouse, forget };
}

// The accessible name a control is announced by, read from the browser's own tree as `axDescription` in e2e/harness.ts reads a description.
export async function axName({ send }: Pick<SuiteContext, "send">, selector: string): Promise<string | null> {
  const doc = await send<{ root: { nodeId: number } }>("DOM.getDocument", { depth: -1 });
  const { nodeId } = await send<{ nodeId: number }>("DOM.querySelector", { nodeId: doc.root.nodeId, selector });
  if (!nodeId) return null;
  const ax = await send<{ nodes: { name?: { value: string }; ignored?: boolean }[] }>(
    "Accessibility.getPartialAXTree",
    {
      nodeId,
      fetchRelatives: false,
    },
  );
  const node = ax.nodes.find((n) => !n.ignored);
  return node?.name ? node.name.value : null;
}
