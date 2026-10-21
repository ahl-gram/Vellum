import { nearRgba, PAGE_RGBA, tokenRgba } from "../../support/pixel.ts";
import { makeSettle } from "../../support/settle.ts";
import { home, press } from "./hold.ts";
import type { ZoomKit } from "./kit.ts";

const GROUND = `(()=>{const rgba=${PAGE_RGBA};const b=document.getElementById("zoom-hold");return{pressed:b.getAttribute("aria-pressed"),ground:rgba(getComputedStyle(b).backgroundColor)};})()`;
const AT_REST = `!document.getElementById("sheet").classList.contains("turning")`;

type Ground = { pressed: string | null; ground: number[] };

const grounded = (k: ZoomKit, label: string): Promise<Ground> =>
  makeSettle(k)<Ground>(GROUND, (d, last) => !!last && JSON.stringify(d) === JSON.stringify(last), label);

export async function zh15HoldLights(k: ZoomKit): Promise<void> {
  await makeSettle(k)<boolean>(AT_REST, (d) => d, "zh15-sheet-rest");
  await home(k);
  const rest = await grounded(k, "zh15-rest");
  await press(k);
  const lit = await grounded(k, "zh15-lit");
  await press(k);
  const letGo = await grounded(k, "zh15-let-go");
  const want = tokenRgba("--parchment-bright");
  k.check(
    "ZH15 the hold's press lights in the page's bright parchment while held and returns to its resting ground when let go (Issue #751)",
    lit.pressed === "true" &&
      nearRgba(lit.ground, want) &&
      !nearRgba(rest.ground, want) &&
      JSON.stringify(letGo) === JSON.stringify(rest),
    JSON.stringify({ rest, lit, letGo }),
  );
}
