import type { Delivery, HookRequest, Verdict } from "./request.ts";

export const evaluate = (_request: HookRequest): Promise<Verdict> => Promise.resolve({ denial: null, notes: [] });
export const deliver = (_request: HookRequest, _verdict: Verdict): Delivery => null;
