import { luminance, sampleRow } from "../../support/pixel.ts";
import { makeStable, type Settle } from "../../support/settle.ts";
import type { SuiteContext } from "../../types.ts";
import { PAGE, READ } from "./reads.ts";
import type { Specimen } from "./reads.ts";

const moved = (a: Specimen["map"], b: Specimen["map"]): boolean => JSON.stringify(a) !== JSON.stringify(b);
export type SpecimenKit = ReturnType<typeof specimenKit>;

export function specimenKit(ctx: SuiteContext & { settle: Settle }) {
  const { evaluate, send, sleep, PORT, settle } = ctx;
  const stable = makeStable(settle);
  const read = () => evaluate(READ);
  const setState = (s: string) =>
    evaluate<string>(
      `(()=>{const sel=document.getElementById("sb-state");sel.value=${JSON.stringify(s)};sel.dispatchEvent(new Event("change",{bubbles:true}));return sel.value;})()`,
    );

  // Bounce through about:blank (the Z13 idiom): a navigate to the tab's current URL is a no-op.
  const goto = async (): Promise<Specimen | null> => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}${PAGE}` });
    for (let i = 0; i < 200; i++) {
      let s: Specimen | null = null;
      try {
        s = await read();
      } catch {}
      if (s && s.st && s.plateLoaded && s.sheet && s.sheet.w > 0)
        return stable(READ, "the Specimen Book landed", { animated: ".legend" });
      await sleep(50);
    }
    return null;
  };
  const toState = async (s: "rest" | "leaned", label: string): Promise<Specimen> => {
    const from = await read();
    const unfolds = !!from.st && from.st.folded;
    await setState(s);
    return stable(READ, label, { departed: (d) => moved(d.map, from.map) && (!unfolds || moved(d.sheet, from.sheet)) });
  };
  const brightest = async (x: number, y: number) =>
    Math.round(Math.max(...(await sampleRow(send, x, y, 8)).map(luminance)));
  // The MEDIAN of a wide run: the defect is a full-area wash, so the median moves with it, while a max passes on one bright press sitting under the sample and a min fails on one hairline crossing it.
  const groundOf = async (x: number, y: number) => {
    const l = (await sampleRow(send, x, y, 16)).map(luminance).sort((a, b) => a - b);
    return Math.round(l[Math.floor(l.length / 2)]!);
  };
  return { ...ctx, read, setState, goto, toState, brightest, groundOf };
}
