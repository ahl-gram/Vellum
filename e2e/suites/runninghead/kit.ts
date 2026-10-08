import type { SuiteContext } from "../../types.ts";

export type RunningHeadKit = ReturnType<typeof runningHeadKit>;

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
    for (let i = 0; i < 40; i++) {
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
      if (!up) break;
    }
    return true;
  };
  return { ...ctx, visit };
}
