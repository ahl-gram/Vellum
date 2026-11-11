import type { HuntOptions, Run } from "./hunt.ts";

const EMPTY: Run = { sha: "", base: null, functions: 0, hunted: 0, tooLong: [], unread: [], found: [], stale: [] };
export const diffRun = (_repo: string, _base: string, _head: string, _options: HuntOptions): Promise<Run> =>
  Promise.resolve(EMPTY);
export const fullRun = (_repo: string, _at: string, _options: HuntOptions): Promise<Run> => Promise.resolve(EMPTY);
