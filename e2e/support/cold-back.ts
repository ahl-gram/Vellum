import type { Evaluate, Payload } from "../types.ts";

const CHANNEL = JSON.stringify("vellum-cold-back");
const ARM: Payload<boolean> = `(() => { window.__coldBack = new BroadcastChannel(${CHANNEL}); window.__coldBack.onmessage = () => {}; return true; })()`;
const EVICT: Payload<boolean> = `(() => { const c = new BroadcastChannel(${CHANNEL}); c.postMessage("leave"); c.close(); return true; })()`;

export const armColdBack = (evaluate: Evaluate): Promise<boolean> => evaluate(ARM);

export const evictColdBack = (evaluate: Evaluate): Promise<boolean> => evaluate(EVICT);
