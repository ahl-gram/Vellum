import { luminance, sampleRow } from "../pixel-support.ts";
import type { makeSettle } from "../settle-support.ts";
import type { SuiteContext } from "../types.ts";
import { PAGE, READ } from "./reads.ts";
import type { Specimen } from "./reads.ts";

type Settle = ReturnType<typeof makeSettle>;
export type SpecimenKit = ReturnType<typeof specimenKit>;

export function specimenKit(ctx: SuiteContext & { settle: Settle }) {
  const { evaluate, send, sleep, PORT } = ctx;
  const read = () => evaluate(READ);
  const setState = (s: string) => evaluate<string>(`(()=>{const sel=document.getElementById("sb-state");sel.value=${JSON.stringify(s)};sel.dispatchEvent(new Event("change",{bubbles:true}));return sel.value;})()`);

  // Bounce through about:blank (the Z13 idiom): a navigate to the tab's current URL is a no-op.
  const goto = async (): Promise<Specimen | null> => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}${PAGE}` });
    for (let i = 0; i < 200; i++) {
      let s: Specimen | null = null;
      try { s = await read(); } catch {}
      // The 800ms after boot is the landing (sheet-land 0.55s) plus the ink-in (0.5s after 0.18s): a shot before it shows the deep and the chart alone, the furniture still at opacity 0.
      if (s && s.st && s.plateLoaded && s.sheet && s.sheet.w > 0) { await sleep(800); return read(); }
      await sleep(50);
    }
    return null;
  };
  const brightest = async (x: number, y: number) => Math.round(Math.max(...(await sampleRow(send, x, y, 8)).map(luminance)));
  // The MEDIAN of a wide run: the defect is a full-area wash, so the median moves with it, while a max passes on one bright press sitting under the sample and a min fails on one hairline crossing it.
  const groundOf = async (x: number, y: number) => { const l = (await sampleRow(send, x, y, 16)).map(luminance).sort((a, b) => a - b); return Math.round(l[Math.floor(l.length / 2)]!); };
  return { ...ctx, read, setState, goto, brightest, groundOf };
}
