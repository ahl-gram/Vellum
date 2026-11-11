import { join } from "node:path";

export const ENDPOINT = "https://api.typesafe.ai/v1/systemone";
export const MODEL = "jev-1.14.0";
export const KEY_VAR = "TYPESAFE_API_KEY";
export const TIMEOUT_MS = 10_000;
export const KEY_SHAPE = /^[!#-[\]-~]+$/;
export const KEY_MASK = `<${KEY_VAR}>`;
export const KEY_REFUSED = `${KEY_VAR} holds a character a request header cannot carry, so nothing was sent`;
export const KEY_FILE_SHOWN = "~/.config/typesafe/key";
export const NO_KEY = `${KEY_VAR} is not set and ${KEY_FILE_SHOWN} holds no key`;
export type Env = Readonly<Record<string, string | undefined>>;
export type ReadText = (path: string) => string;
export const keyFileOf = (home: string): string => join(home, ".config", "typesafe", "key");
export type NoulQuestion = {
  readonly type: "noul";
  readonly instructions: string | Readonly<Record<string, unknown>>;
  readonly criteria?: { readonly true: string; readonly false: string };
};
export type SystemOneRequest = {
  readonly model: string;
  readonly state: Readonly<Record<string, string | Readonly<Record<string, string>>>>;
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

const fail = (reason: string): Failed => ({ ok: false, reason });
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isProbability = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;

const readAnswers = (request: SystemOneRequest, body: unknown): Reply => {
  if (!isRecord(body)) return fail("the answer is not JSON");
  if (typeof body.model !== "string") return fail("the answer names no model");
  const answers = isRecord(body.answers) ? body.answers : {};
  const nouls: Record<string, number> = {};
  for (const id of Object.keys(request.questions)) {
    const answer = answers[id];
    if (!isRecord(answer) || answer.type !== "noul" || !isProbability(answer.noul))
      return fail(`the answer to ${id} is missing or not a probability`);
    nouls[id] = answer.noul;
  }
  const usage = isRecord(body.usage) ? body.usage.input_tokens : undefined;
  const inputTokens = typeof usage === "number" ? usage : Math.ceil(JSON.stringify(request).length / 2);
  return { ok: true, model: body.model, nouls, inputTokens, ms: 0 };
};

const hide = (text: string, key: string): string => (key === "" ? text : text.split(key).join(KEY_MASK));
const word = (value: unknown, shape: RegExp): string | null =>
  typeof value === "string" && shape.test(value) ? value : null;
const noAnswer = (error: unknown): string => {
  const e = (typeof error === "object" && error !== null ? error : {}) as {
    name?: unknown;
    cause?: { code?: unknown };
  };
  const name = word(e.name, /^[A-Za-z]+$/) ?? "error";
  const code = word(e.cause?.code, /^[A-Z0-9_]+$/);
  return `the request got no answer: ${name}${code === null ? "" : ` (${code})`}`;
};

export const ask = async (request: SystemOneRequest, key: string, fetcher: Fetch): Promise<Reply> => {
  const began = performance.now();
  let ok: boolean;
  let status: number;
  let text: string;
  try {
    const response = await fetcher(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    ok = response.ok;
    status = response.status;
    text = await response.text();
  } catch (error) {
    return fail(noAnswer(error));
  }
  if (!ok) return fail(`HTTP ${status}: ${hide(text, key).slice(0, 200)}`);
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return fail("the answer is not JSON");
  }
  const reply = readAnswers(request, body);
  return reply.ok ? { ...reply, ms: Math.round(performance.now() - began) } : reply;
};

export const senderFor = (key: string | undefined, fetcher: Fetch): Send => {
  const trimmed = key?.trim() ?? "";
  if (trimmed === "") return () => Promise.resolve(fail(`${KEY_VAR} is not set`));
  if (!KEY_SHAPE.test(trimmed)) return () => Promise.resolve(fail(KEY_REFUSED));
  return (request) => ask(request, trimmed, fetcher);
};

export const readKey = (env: Env, home: string, readText: ReadText): string | undefined => {
  const fromEnv = env[KEY_VAR];
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") return fromEnv;
  try {
    const text = readText(keyFileOf(home));
    return text.trim() === "" ? undefined : text;
  } catch {
    return undefined;
  }
};

export const liveSender = (env: Env, home: string, readText: ReadText, fetcher: Fetch): Send => {
  const key = readKey(env, home, readText);
  return key === undefined ? () => Promise.resolve(fail(NO_KEY)) : senderFor(key, fetcher);
};

export const dryRunSender: Send = () => Promise.resolve(fail("dry run: nothing was sent"));
export const capReason = (cap: number): string => `the input-token cap of ${cap} for this run was reached`;
