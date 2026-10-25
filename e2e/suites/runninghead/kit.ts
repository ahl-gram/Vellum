import type { SuiteContext } from "../../types.ts";

export type RunningHeadKit = ReturnType<typeof runningHeadKit>;

// 2026-10-25: on 5 of 5 first arrivals the veil was up before the first press and gone at the read after it, since a key lifts it once armed (`ceremonySkip` in `src/site/home/veil.ts`), and unpressed it lifts itself about 4 s into its ceremony (`LANDFALL_HOLD_MS` in `src/site/home/ceremony.ts`, with the gate before it and the 1.1 s lift after); 40 presses hold 6 s of sleeps alone and only lengthen on a slower runner, so a veil still up after them is one the page never lifts.
export const VEIL_PRESSES = 40;

export function runningHeadKit(ctx: SuiteContext) {
  const { evaluate, send, sleep, PORT } = ctx;
  const visit = async (route: string): Promise<boolean> => {
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}${route}` });
    for (let i = 0; i < 200; i++) {
      let ok: unknown = null;
      try {
        ok = await evaluate<boolean>(`document.readyState === "complete" && !!document.querySelector(".wordmark")`);
      } catch {}
      if (ok) break;
      await sleep(75);
      if (i === 199) return false;
    }
    if (route !== "/") return true;
    // Home's first arrival raises the ceremony veil (Issue #457); a key before the module arms the skip hits nothing, so press until the veil goes and the cluster shows on the stage.
    for (let i = 0; i < VEIL_PRESSES; i++) {
      await send("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: "Escape",
        code: "Escape",
        windowsVirtualKeyCode: 27,
      });
      await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
      await sleep(150);
      let up = true;
      try {
        up = await evaluate<boolean>(`!!document.getElementById("lf-veil")`);
      } catch {}
      if (!up) return true;
    }
    return false;
  };
  return { ...ctx, visit };
}
