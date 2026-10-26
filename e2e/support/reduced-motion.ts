import type { SuiteContext } from "../types.ts";

export async function withReducedMotion(ctx: Pick<SuiteContext, "send">, body: () => Promise<void>): Promise<void> {
  await ctx.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await body();
}
