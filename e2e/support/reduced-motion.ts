import type { SuiteContext } from "../types.ts";

export const NO_EMULATED_MEDIA = { media: "", features: [] } as const;

export async function withReducedMotion(ctx: Pick<SuiteContext, "send">, body: () => Promise<void>): Promise<void> {
  await ctx.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  try {
    await body();
  } finally {
    await ctx.send("Emulation.setEmulatedMedia", NO_EMULATED_MEDIA).catch(() => undefined);
  }
}
