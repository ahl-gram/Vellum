// What the engine's sheet dresses on the Reading Room's bar (Issue #779 part 2h): RS32.
import type { Payload } from "../../types.ts";
import type { InstrumentKit } from "./kit.ts";

type BarDress = {
  cls: string;
  appearance: string;
  height: string;
  marginTop: string;
  marginBottom: string;
  gradients: number;
  kinds: string[];
} | null;
const BAR_DRESS: Payload<BarDress> = `(() => { const r = document.querySelector(".rf-range"); if (!r) return null;
  const cs = getComputedStyle(r), bg = cs.backgroundImage;
  return { cls: r.className, appearance: cs.appearance, height: cs.height, marginTop: cs.marginTop, marginBottom: cs.marginBottom,
    gradients: bg.split("gradient(").length - 1, kinds: [...bg.matchAll(/(repeating-)?linear-gradient\\(/g)].map((m) => m[0]) }; })()`;

export async function rs32BarDress(k: InstrumentKit): Promise<void> {
  const d = await k.evaluate(BAR_DRESS);
  k.check(
    "RS32 the bar wears the engine's instrument: the range is an ages-range with its native skin off, 24px tall and unmargined, and paints its five layers, the hairline marks first and the repeating wash fourth",
    !!d &&
      d.cls.split(" ").includes("ages-range") &&
      d.appearance === "none" &&
      d.height === "24px" &&
      d.marginTop === "0px" &&
      d.marginBottom === "0px" &&
      d.gradients === 5 &&
      d.kinds.length === 5 &&
      d.kinds[0] === "linear-gradient(" &&
      d.kinds[3] === "repeating-linear-gradient(",
    JSON.stringify(d),
  );
}
