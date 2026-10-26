import type { SuiteContext } from "../e2e/types.ts";

export type Sent = { method: string; params?: Record<string, unknown> };
export type Checked = { code: string; ok: boolean };

export const recordingSuite = (answer: (expression: string, sent: readonly Sent[]) => unknown) => {
  const said: string[] = [];
  const sent: Sent[] = [];
  const slept: number[] = [];
  const checked: Checked[] = [];
  const record = (method: string, params?: Record<string, unknown>): Promise<unknown> => {
    sent.push({ method, params });
    return Promise.resolve({});
  };
  const ctx = {
    evaluate: (expression: string): Promise<unknown> => {
      said.push(expression);
      return Promise.resolve(answer(expression, sent));
    },
    send: record,
    sleep: (ms: number): Promise<void> => {
      slept.push(ms);
      return Promise.resolve();
    },
    check: (name: string, ok: unknown): void => void checked.push({ code: name.split(" ")[0]!, ok: !!ok }),
    shoot: (): Promise<void> => Promise.resolve(),
    touch: (type: string, points: unknown): Promise<unknown> => record(`touch ${type}`, { points }),
    setNarrowViewport: async (width: number, height: number): Promise<void> => {
      await record("Emulation.setDeviceMetricsOverride", { width, height });
    },
    clearMobile: async (): Promise<void> => {
      await record("Emulation.clearDeviceMetricsOverride");
    },
    PORT: 8765,
  } as unknown as SuiteContext;
  return { ctx, said, sent, slept, checked };
};
export const emulations = (sent: readonly Sent[]): number =>
  sent.filter((s) => s.method.startsWith("Emulation.")).length;
export const lastSent = (sent: readonly Sent[]): Sent | undefined => sent.at(-1);

export type Phase<R> = readonly [reads: number, room: R];
export type Stage<R> = { readonly phases: readonly Phase<R>[]; readonly rest: R };
export const timeline = <R>(stages: readonly Stage<R>[]) => {
  let stage = -1;
  let reads = 0;
  let last: R | null = null;
  const next = (at: number): R => {
    if (at !== stage) {
      stage = at;
      reads = 0;
    }
    reads++;
    const { phases, rest } = stages[Math.min(stage, stages.length - 1)]!;
    let upTo = 0;
    last = rest;
    for (const [n, r] of phases) {
      upTo += n;
      if (reads <= upTo) {
        last = r;
        break;
      }
    }
    return last;
  };
  return { next, last: () => last };
};
