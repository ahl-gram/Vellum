// Issue #1104 round: swaps the three mark modules for this round's variants wherever the engine imports them. Load with `node --import ./out/1104/mock/hooks.ts <script>`.
import { registerHooks } from "node:module";

const TREE = new URL("../../../", import.meta.url).href;
const SWAP = new Map<string, string>([
  [new URL("src/render/layers/settlement-marks.ts", TREE).href, new URL("./marks-variant.ts", import.meta.url).href],
  [new URL("src/render/layers/settlements.ts", TREE).href, new URL("./settlements-variant.ts", import.meta.url).href],
  [new URL("src/render/layers/legend-icons.ts", TREE).href, new URL("./legend-icons-variant.ts", import.meta.url).href],
]);

registerHooks({
  resolve(specifier, context, nextResolve) {
    const r = nextResolve(specifier, context);
    const to = SWAP.get(r.url);
    return to === undefined ? r : { ...r, url: to };
  },
});
