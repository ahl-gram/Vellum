import type { makeSettle } from "../../support/settle.ts";
import type { SuiteContext } from "../../types.ts";
import { CAP_WINDOW, NARROW_SEED, SWEEP } from "./reads.ts";

type Settle = ReturnType<typeof makeSettle>;
export type CardsKit = ReturnType<typeof cardsKit>;

export function cardsKit(ctx: SuiteContext & { settle: Settle }) {
  const { evaluate, send, sleep, waitReady, setNarrowViewport, PORT } = ctx;
  const sweepAt = async () => {
    const { w: width, h } = CAP_WINDOW;
    await setNarrowViewport(width, h);
    // The metrics override has to be in effect BEFORE the boot navigate, and this suite otherwise never navigates at all, so the group re-boots through about:blank rather than resizing the page it inherited.
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#seed=${NARROW_SEED}&style=antique` });
    if (!(await waitReady())) throw new Error(`P19 the explorer never drew at ${width}`);
    // The card's height is set by wrapped text, so a face still swapping in measures a different card.
    let fonts = null;
    for (let i = 0; i < 100; i++) {
      fonts = await evaluate<string>(`document.fonts ? document.fonts.status : "no-fonts-api"`);
      if (fonts !== "loading") break;
      await sleep(50);
    }
    if (fonts === "loading") throw new Error(`P19 the faces never finished loading at ${width}`);
    const d = await evaluate(SWEEP);
    if (d.error) throw new Error(`P19 the sweep found no chart box at ${width}: ${JSON.stringify(d)}`);
    return d;
  };
  return { ...ctx, sweepAt };
}
