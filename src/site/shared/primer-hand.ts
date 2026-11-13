import type { Device, HandStep } from "./primer/hand-steps.ts";

export interface HandRoom {
  readonly route: string;
}

export interface HandEnv {
  readonly doc: Document;
  readonly location: { readonly pathname: string; readonly search: string; readonly hash: string };
  readonly replace: (url: string) => void;
  readonly store: () => Storage;
  readonly device: Device;
  readonly fetchSteps: () => Promise<readonly HandStep[]>;
  readonly frame: (fn: () => void) => number;
  readonly cancelFrame: (id: number) => void;
}

export async function bootHand(_room: HandRoom, _env: HandEnv): Promise<void> {}
