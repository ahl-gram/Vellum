import type { makeSettle } from "../../support/settle.ts";
import type { SuiteContext } from "../../types.ts";
import { CAP_WINDOW, NARROW_SEED, SWEEP } from "./reads.ts";
import { bounce } from "../../support/nav.ts";
import { explorerUp } from "../../support/explorer.ts";
import { withFonts } from "../../support/fonts.ts";

type Settle = ReturnType<typeof makeSettle>;
export type CardsKit = ReturnType<typeof cardsKit>;

export function cardsKit(ctx: SuiteContext & { settle: Settle }) {
  const { send, waitReady, setNarrowViewport, settle, PORT } = ctx;
  const sweepAt = async () => {
    const { w: width, h } = CAP_WINDOW;
    await setNarrowViewport(width, h);
    // The metrics override has to be in effect BEFORE the boot navigate, and this suite otherwise never navigates at all, so the group re-boots through about:blank rather than resizing the page it inherited.
    await bounce(send, `http://127.0.0.1:${PORT}/explorer/#seed=${NARROW_SEED}&style=antique`);
    await explorerUp({ waitReady }, `P19 at ${width}`);
    // The card's height is set by wrapped text, so a face still swapping in measures a different card.
    const { read: d } = await settle(
      withFonts(SWEEP),
      (s) => s.read.error !== undefined || s.fonts === "loaded",
      `P19 the cards at ${width}`,
      100,
    );
    if (d.error) throw new Error(`P19 the sweep found no chart box at ${width}: ${JSON.stringify(d)}`);
    return d;
  };
  return { ...ctx, sweepAt };
}
