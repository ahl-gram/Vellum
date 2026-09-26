import type { ChildProcessByStdio } from "node:child_process";
import type { Readable } from "node:stream";

declare const shape: unique symbol;

export type Payload<T> = string & { readonly [shape]?: T };

export type Evaluate = <T = unknown>(expression: Payload<T>, awaitPromise?: boolean) => Promise<NoInfer<T>>;
type Send = <T = unknown>(method: string, params?: Record<string, unknown>) => Promise<NoInfer<T>>;
type Check = (name: string, ok: unknown, detail?: string) => void;

export type Point = { x: number; y: number };
export type TouchPoint = Point & { id?: number };
export type Clip = { x: number; y: number; width: number; height: number; scale: number };

export type StartOptions = {
  browser: string;
  SITE: string;
  OUT: string;
  PORT: number;
  DPORT: number;
  PAGE: string;
  results: { name: string; ok: boolean }[];
  consoleErrors: string[];
  http4xx: string[];
  skippedGroups: string[];
};

export type SuiteContext = {
  evaluate: Evaluate;
  send: Send;
  check: Check;
  shoot: (file: string, clip?: Clip) => Promise<void>;
  sleep: (ms: number) => Promise<void>;
  alive: () => Promise<boolean>;
  waitSettled: (label?: string) => Promise<void>;
  waitReady: () => Promise<boolean>;
  waitTurned: (label?: string) => Promise<void>;
  armTurnWatch: () => Promise<unknown>;
  axDescription: (selector: string) => Promise<string | null>;
  wheel: (x: number, y: number, deltaY: number, deltaX?: number) => Promise<unknown>;
  touch: (type: string, points: readonly TouchPoint[]) => Promise<unknown>;
  touchPan: (x0: number, y0: number, x1: number, y1: number) => Promise<void>;
  pinch: (cx: number, cy: number, from: number, to: number) => Promise<void>;
  setTouch: (enabled: boolean, maxTouchPoints?: number) => Promise<unknown>;
  setMobileViewport: (width: number, height: number) => Promise<void>;
  clearMobile: () => Promise<void>;
  serverState: { blockWorker: boolean };
  cleanup: () => void;
  consoleErrors: string[];
  http4xx: string[];
  skippedGroups: string[];
  PORT: number;
};

export type BrowserProcess = ChildProcessByStdio<null, Readable, Readable>;

// The last member stands for every event the harness does not branch on; its method is a sentinel because "any string but these four" is not a type the checker can state.
export type CdpMessage =
  | { id: number; method?: undefined; error?: unknown; result?: unknown }
  | { id?: undefined; method: "Runtime.exceptionThrown"; params: { exceptionDetails?: { exception?: { description?: string }; text?: string } } }
  | { id?: undefined; method: "Runtime.consoleAPICalled"; params: { type: string; args: { value: unknown }[] } }
  | { id?: undefined; method: "Log.entryAdded"; params: { entry: { level: string; text?: string } } }
  | { id?: undefined; method: "Network.responseReceived"; params: { response: { status: number; url: string } } }
  | { id?: undefined; method: "(another event)" };
