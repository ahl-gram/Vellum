import type { SuiteContext } from "../e2e/types.ts";
import { checkInto } from "./ctx-fakes.ts";

export type Said = { kind: "send" | "evaluate" | "shoot"; what: string };
export type Checked = { code: string; ok: boolean };

export const recording = (answer: (expression: string, said: readonly Said[]) => unknown) => {
  const said: Said[] = [];
  const checked: Checked[] = [];
  const slept: number[] = [];
  const ctx = {
    evaluate: (expression: string): Promise<unknown> => {
      said.push({ kind: "evaluate", what: expression });
      return Promise.resolve(answer(expression, said));
    },
    send: (method: string, params?: { rate?: number }): Promise<unknown> => {
      said.push({ kind: "send", what: params?.rate === undefined ? method : `${method} ${params.rate}` });
      return Promise.resolve({});
    },
    sleep: (ms: number): Promise<void> => {
      slept.push(ms);
      return Promise.resolve();
    },
    check: checkInto(checked),
    shoot: (file: string): Promise<void> => {
      said.push({ kind: "shoot", what: file });
      return Promise.resolve();
    },
    PORT: 8765,
  } as unknown as SuiteContext;
  return { ctx, said, checked, slept };
};
export const count = (said: readonly Said[], part: string) => said.filter((s) => s.what.includes(part)).length;
export const lastOf = (said: readonly Said[], kind: Said["kind"]) =>
  said.filter((s) => s.kind === kind).at(-1)?.what ?? "";
