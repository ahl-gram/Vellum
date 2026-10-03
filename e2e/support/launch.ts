type BrowserExit = { readonly code: number | null; readonly signal: NodeJS.Signals | null };

type DataSource = { on(event: "data", listener: (chunk: unknown) => void): unknown };

interface LaunchChild {
  readonly pid?: number | undefined;
  readonly stdout: DataSource;
  readonly stderr: DataSource;
  on(event: "exit", listener: (code: number | null, signal: NodeJS.Signals | null) => void): unknown;
  on(event: "error", listener: (err: Error) => void): unknown;
  kill(signal: NodeJS.Signals): boolean;
}

export interface LaunchAttempt {
  readonly child: LaunchChild;
  discard(): Promise<void>;
}

export interface LaunchDeps<T> {
  preflight(): Promise<void>;
  spawn(attempt: number): Promise<LaunchAttempt>;
  probe(): Promise<T>;
  log(line: string): void;
}

export interface LaunchTuning {
  readonly attempts: number;
  readonly polls: number;
  readonly pollMs: number;
  readonly killGraceMs: number;
  readonly retryPauseMs: number;
}

// killGraceMs is a cap on a hang, not a budget: the one kill measured on a GitHub runner was gone 8ms after SIGKILL (PR #735's CI, 2026-10-02), and the old loop's 0.13s retries put every earlier one under about 130ms.
// retryPauseMs is Alex's ruling on Issue #621 (2026-10-02): insurance against an overloaded runner, which nothing measured has shown.
// polls x pollMs is a 40s wait, about twice the slowest start measured on a GitHub runner (attempt 1 up in 0.7, 6.2, 7.4, 9.8 and 20.4s, one attempt 1 past 20s whose retry came up in 9.4s; PR #735's CI, 2026-10-02), Alex's ruling on Issue #621.
export const LAUNCH_TUNING: LaunchTuning = { attempts: 3, polls: 320, pollMs: 125, killGraceMs: 5000, retryPauseMs: 2000 };

const OUTPUT_CHARS = 2000;

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const messageOf = (e: unknown): string => String((e as { message?: string } | null)?.message ?? e);

interface Life {
  exit: BrowserExit | null;
  error: Error | null;
  output: string;
  readonly gone: Promise<void>;
}

function watch(child: LaunchChild): Life {
  let settle = (): void => {};
  const life: Life = { exit: null, error: null, output: "", gone: new Promise<void>((r) => (settle = r)) };
  child.stdout.on("data", (d) => (life.output += String(d)));
  child.stderr.on("data", (d) => (life.output += String(d)));
  child.on("exit", (code, signal) => {
    life.exit = { code, signal };
    settle();
  });
  child.on("error", (err) => {
    life.error = err;
    settle();
  });
  return life;
}

function death(life: Life): string | null {
  if (life.error) return `browser failed to start: ${life.error.message}`;
  if (life.exit) return `browser exited code=${life.exit.code} signal=${life.exit.signal}`;
  return null;
}

async function awaitTarget<T>(probe: () => Promise<T>, life: Life, tuning: LaunchTuning): Promise<T> {
  let last = "nothing answered";
  for (let i = 0; i < tuning.polls; i++) {
    const dead = death(life);
    if (dead) throw new Error(dead);
    try {
      return await probe();
    } catch (e) {
      last = messageOf(e);
    }
    await sleep(tuning.pollMs);
  }
  throw new Error(death(life) ?? `no page target in ${tuning.polls * tuning.pollMs}ms (last: ${last})`);
}

async function stop(child: LaunchChild, life: Life, capMs: number): Promise<string | null> {
  if (death(life)) return "already gone";
  const t0 = Date.now();
  child.kill("SIGKILL");
  let timer: NodeJS.Timeout | undefined;
  const capped = new Promise<false>((r) => (timer = setTimeout(() => r(false), capMs)));
  const gone = await Promise.race([life.gone.then(() => true as const), capped]);
  clearTimeout(timer);
  return gone ? `gone ${Date.now() - t0}ms after SIGKILL` : null;
}

const outputOf = (life: Life): string => life.output.slice(0, OUTPUT_CHARS) || "(none captured)";

type Outcome<T> = { readonly target: T } | { readonly failure: string };

async function spawnAttempt<T>(deps: LaunchDeps<T>, tuning: LaunchTuning, attempt: number, earlier: readonly string[]): Promise<LaunchAttempt> {
  try {
    return await deps.spawn(attempt);
  } catch (err) {
    throw new Error(`browser launch attempt ${attempt}/${tuning.attempts} could not start a browser: ${messageOf(err)}\n${earlier.join("\n")}`, { cause: err });
  }
}

async function attemptOnce<T>(deps: LaunchDeps<T>, tuning: LaunchTuning, attempt: number, earlier: readonly string[]): Promise<Outcome<T>> {
  const started = Date.now();
  const spawned = await spawnAttempt(deps, tuning, attempt, earlier);
  const child = spawned.child;
  const life = watch(child);
  const head = `attempt ${attempt}/${tuning.attempts}, pid ${child.pid ?? "none"}`;
  try {
    const target = await awaitTarget(() => deps.probe(), life, tuning);
    deps.log(`  e2e: browser up on ${head}, devtools target in ${Date.now() - started}ms`);
    return { target };
  } catch (err) {
    const reason = messageOf(err);
    const stopped = await stop(child, life, tuning.killGraceMs);
    const failure = `${head}: ${reason}; ${stopped ?? `was not gone ${tuning.killGraceMs}ms after SIGKILL`}\n--- browser output, attempt ${attempt} ---\n${outputOf(life)}`;
    if (stopped === null) throw new Error(`browser launch ${head}, was not gone ${tuning.killGraceMs}ms after SIGKILL, so no further attempt can own the debug port\n${[...earlier, failure].join("\n")}`, { cause: err });
    await spawned.discard();
    if (attempt === tuning.attempts) return { failure };
    deps.log(`  e2e: browser launch attempt ${attempt}/${tuning.attempts} exposed no devtools target: ${reason}; pid ${child.pid ?? "none"}, ${stopped}; retrying with a fresh profile in ${tuning.retryPauseMs}ms...`);
    await sleep(tuning.retryPauseMs);
    return { failure };
  }
}

export async function launchWithRetry<T>(deps: LaunchDeps<T>, tuning: LaunchTuning = LAUNCH_TUNING): Promise<T> {
  await deps.preflight();
  let failures: readonly string[] = [];
  for (let attempt = 1; attempt <= tuning.attempts; attempt++) {
    const outcome = await attemptOnce(deps, tuning, attempt, failures);
    if ("target" in outcome) return outcome.target;
    failures = [...failures, outcome.failure];
  }
  throw new Error(`no devtools page target after ${tuning.attempts} launch attempts\n${failures.join("\n")}`);
}
