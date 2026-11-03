// The Explorer's arrival and its survey-ink wait, once each (Issue #1016): a page the suites reach at six sites and read the ink of at three.
import type { Payload, SuiteContext } from "../types.ts";
import { bounce } from "./nav.ts";

const INK_TRIES = 120;
const INK_POINTS: Payload<number> = `(()=>{const t=document.querySelector("#map .voyage-overlay .voyage-track");return t?(t.getAttribute("points")||"").trim().split(/\\s+/).length:0;})()`;

export async function explorerUp(ctx: Pick<SuiteContext, "waitReady">, label: string): Promise<void> {
  if (!(await ctx.waitReady())) throw new Error(`the Explorer never answered ready: ${label}`);
}

export async function toExplorer(
  ctx: Pick<SuiteContext, "send" | "waitReady" | "waitSettled">,
  url: string,
  label: string,
  onReady?: () => Promise<unknown>,
): Promise<void> {
  await bounce(ctx.send, url);
  await explorerUp(ctx, label);
  if (onReady) await onReady();
  await ctx.waitSettled(label);
}

export async function waitInked(
  ctx: Pick<SuiteContext, "evaluate" | "sleep">,
  label: string,
  atLeast = 1,
): Promise<number> {
  for (let i = 0; i < INK_TRIES; i++) {
    const n = await ctx.evaluate(INK_POINTS);
    if (n >= atLeast) return n;
    await ctx.sleep(50);
  }
  throw new Error("waitInked timeout " + label);
}
