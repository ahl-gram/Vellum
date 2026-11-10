export const ENDPOINT = "https://api.typesafe.ai/v1/systemone";
export const MODEL = "jev-1.14.0";
export const KEY_VAR = "TYPESAFE_API_KEY";
export const TIMEOUT_MS = 10_000;
export type NoulQuestion = {
  readonly type: "noul";
  readonly instructions: string | Readonly<Record<string, unknown>>;
  readonly criteria?: { readonly true: string; readonly false: string };
};
export type SystemOneRequest = {
  readonly model: string;
  readonly state: Readonly<Record<string, string>>;
  readonly questions: Readonly<Record<string, NoulQuestion>>;
};
export type Answered = {
  readonly ok: true;
  readonly model: string;
  readonly nouls: Readonly<Record<string, number>>;
  readonly inputTokens: number;
  readonly ms: number;
};
export type Failed = { readonly ok: false; readonly reason: string };
export type Reply = Answered | Failed;
export type Send = (request: SystemOneRequest) => Promise<Reply>;
export type Fetch = (url: string, init: RequestInit) => Promise<Response>;
