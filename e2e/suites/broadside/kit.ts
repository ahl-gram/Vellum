// The Broadside suite's kit: the Explorer's address, its boot, its survey-ink wait and its plain boot.
import { toExplorer, waitInked } from "../../support/explorer.ts";
import type { SuiteContext } from "../../types.ts";

export type BroadsideKit = ReturnType<typeof broadsideKit>;

export function broadsideKit(ctx: SuiteContext) {
  const { evaluate, send, sleep, PORT } = ctx;
  const EXP = `http://127.0.0.1:${PORT}/explorer/`;
  const goto = (url: string, label: string): Promise<void> => toExplorer(ctx, url, label);
  const gotoPlain = async (url: string, label: string): Promise<void> => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url });
    for (let i = 0; i < 100; i++) {
      if (await evaluate<boolean>(`document.readyState === "complete"`)) return;
      await sleep(50);
    }
    throw new Error("gotoPlain timeout " + label);
  };
  return { ...ctx, EXP, goto, waitInked: (label: string): Promise<number> => waitInked(ctx, label), gotoPlain };
}
