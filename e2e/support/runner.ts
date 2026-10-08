import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { StartOptions, SuiteContext } from "../types.ts";
import { browserlessAction } from "./browser-policy.ts";
import { e2eOutSubdir, resolveE2ePorts } from "./ports.ts";
import {
  E2E_SUITE_ORDER,
  errorText,
  formatSuiteTimings,
  resolveSuiteSelection,
  runOutcome,
  runSelected,
  suitesCertifiedByHealth,
  suitesNotWhole,
} from "./suites.ts";
import type { E2eCheckResult, E2eRunHooks, E2eSuiteName, E2eSuiteRunners, E2eSuiteTiming } from "./suites.ts";

export type Accumulators = Pick<StartOptions, "results" | "consoleErrors" | "http4xx" | "skippedGroups">;
export type RunnerContext = Pick<SuiteContext, "check" | "alive" | "clearMobile">;
export type EnvLike = Readonly<Record<string, string | undefined>>;

export interface RunnerDeps<C extends RunnerContext> {
  readonly findBrowser: () => string | null;
  readonly start: (options: StartOptions) => Promise<C>;
  readonly cleanup: () => void;
  readonly suites: E2eSuiteRunners<C>;
}

export interface RunnerIo<C extends RunnerContext> extends RunnerDeps<C> {
  readonly env: EnvLike;
  readonly isTTY: boolean;
  readonly accumulators: Accumulators;
  readonly out: (line: string) => void;
  readonly err: (...parts: unknown[]) => void;
}

export const REPO = fileURLToPath(new URL("../..", import.meta.url));
export const BROWSERLESS_FAIL =
  "FAIL: no Chromium-family browser was found and this run is not interactive, " +
  "so skipping would report green without exercising anything. Install " +
  "Brave/Chrome, point VELLUM_BROWSER at a browser binary, or set " +
  "VELLUM_ALLOW_NO_BROWSER=1 to skip on purpose.";
export const RUNNER_SKIP_LINE =
  "SKIP: no Chromium-family browser found, skipping Explorer e2e (install Brave/Chrome or set VELLUM_BROWSER).";
export const RESET_BOUND_MS = 5000;

type Plan = Omit<StartOptions, "browser" | keyof Accumulators> & {
  readonly selected: readonly E2eSuiteName[];
  readonly tier: string;
};

function plan(env: EnvLike): Plan {
  const SITE = env["VELLUM_SITE_DIR"] ? resolve(env["VELLUM_SITE_DIR"]) : join(REPO, "dist");
  const { PORT, DPORT } = resolveE2ePorts(env);
  const OUT = join(REPO, "out", e2eOutSubdir(PORT));
  const PAGE = `http://127.0.0.1:${PORT}/explorer/`;
  const { names, tier } = resolveSuiteSelection(env);
  return { SITE, OUT, PORT, DPORT, PAGE, selected: names, tier };
}

export function browserlessExit(
  env: EnvLike,
  isTTY: boolean,
  skipLine: string,
  sinks: { readonly out: (line: string) => void; readonly err: (line: string) => void },
): number {
  if (browserlessAction(env, isTTY) === "fail") {
    sinks.err(BROWSERLESS_FAIL);
    return 1;
  }
  sinks.out(skipLine);
  return 0;
}

export function runnerHooks<C extends RunnerContext>(
  ctx: C,
  accumulators: Accumulators,
  err: (...parts: unknown[]) => void,
  boundMs: number = RESET_BOUND_MS,
): E2eRunHooks {
  return {
    alive: ctx.alive,
    skippedGroups: () => accumulators.skippedGroups,
    onSuiteError: async (name, failure) => {
      err(`  ${name} stopped early:`, failure);
      const e = failure as { message?: string } | null | undefined;
      ctx.check(
        `${name} stopped early, so the checks after this one in that suite never ran (#534)`,
        false,
        e && e.message ? e.message : String(failure),
      );
      await Promise.race([
        ctx.clearMobile().catch(() => {}),
        new Promise((settle) => setTimeout(settle, boundMs).unref()),
      ]);
    },
  };
}

function healthLine(selected: readonly E2eSuiteName[], certified: readonly E2eSuiteName[]): string {
  if (certified.length > 0) return `  N1/N2 certified the console/network state of: ${certified.join(", ")}`;
  if (!selected.includes("health")) return `  N1/N2 did not run, so nothing here carries a console/network clean bill.`;
  return selected.indexOf("health") === 0
    ? `  N1/N2 ran, but nothing preceded them, so they certify no suite.`
    : `  N1/N2 ran, but no suite before them ran to its end, so they certify no suite.`;
}

export function reportLines(
  timings: readonly E2eSuiteTiming[],
  selected: readonly E2eSuiteName[],
  tier: string,
): readonly string[] {
  const lines = ["", ...formatSuiteTimings(timings)];
  const aborted = timings.filter((t) => t.aborted).map((t) => t.name);
  const certified = suitesCertifiedByHealth(selected, suitesNotWhole(timings));
  if (aborted.length > 0) {
    lines.push(
      `\n${aborted.length} suite${aborted.length > 1 ? "s" : ""} stopped early: ${aborted.join(", ")}. ` +
        `The checks after the failure in each never ran, so this run proves less than a whole one.`,
    );
  }
  const partial = timings.filter(
    (t): t is E2eSuiteTiming & { readonly skipped: readonly string[] } =>
      !t.aborted && t.skipped !== undefined && t.skipped.length > 0,
  );
  if (partial.length > 0) {
    lines.push(
      `\n${partial.length} suite${partial.length > 1 ? "s" : ""} skipped a check group: ` +
        `${partial.map((t) => `${t.name} (${t.skipped.join("; ")})`).join(", ")}. ` +
        `Each ran to its end, so the checks after the skip are real, but it exercised fewer interactions than a whole run.`,
    );
  }
  if (tier !== "full") {
    lines.push(`\ntier: ${tier} (${selected.length}/${E2E_SUITE_ORDER.length} suites): ${selected.join(", ")}`);
    lines.push(healthLine(selected, certified));
  }
  return lines;
}

export function harnessErrorLines(results: readonly E2eCheckResult[]): readonly string[] {
  return results.length > 0 ? [`\n${runOutcome(results).line}`] : [];
}

export async function runE2e<C extends RunnerContext>(io: RunnerIo<C>): Promise<number> {
  let setup: Plan;
  try {
    setup = plan(io.env);
  } catch (failure) {
    io.err(`FAIL: ${errorText(failure)}`);
    return 1;
  }
  const browser = io.findBrowser();
  if (!browser) return browserlessExit(io.env, io.isTTY, RUNNER_SKIP_LINE, { out: io.out, err: io.err });
  const { selected, tier, ...where } = setup;
  try {
    const ctx = await io.start({ browser, ...where, ...io.accumulators });
    const timings = await runSelected(selected, io.suites, ctx, runnerHooks(ctx, io.accumulators, io.err));
    for (const line of reportLines(timings, selected, tier)) io.out(line);
    const outcome = runOutcome(io.accumulators.results);
    io.out(`\n${outcome.line}`);
    io.cleanup();
    return outcome.ok ? 0 : 1;
  } catch (failure) {
    io.err("HARNESS ERROR:", failure);
    for (const line of harnessErrorLines(io.accumulators.results)) io.out(line);
    io.cleanup();
    return 2;
  }
}

export function runE2eFromProcess<C extends RunnerContext>(
  accumulators: Accumulators,
  deps: RunnerDeps<C>,
): Promise<number> {
  return runE2e({
    ...deps,
    env: process.env,
    isTTY: Boolean(process.stdout.isTTY),
    accumulators,
    out: (line) => console.log(line),
    err: (...parts) => console.error(...parts),
  });
}
