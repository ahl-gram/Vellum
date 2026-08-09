/**
 * Which ports the browser-driven e2e run uses, and whether its debug port is
 * safe to launch onto.
 *
 * Split out of `scripts/e2e-explorer.mjs` (like `browser-policy.ts`) so both
 * decisions are unit-testable: the runner can only express them as a
 * `process.exit` or a thrown harness error, neither of which a test can read.
 */

export const DEFAULT_E2E_PORT = 8765;
export const DEFAULT_E2E_DPORT = 9222;

export const E2E_PORT_VAR = "VELLUM_E2E_PORT";
export const E2E_DPORT_VAR = "VELLUM_E2E_DPORT";

export interface E2ePortEnv {
  readonly [key: string]: string | undefined;
}

export interface E2ePorts {
  readonly PORT: number;
  readonly DPORT: number;
}

/** What a connection attempt against the debug port found, before launching. */
export interface DebugPortProbe {
  readonly listening: boolean;
  /** e.g. the devtools `/json/version` Browser string, when it answered one. */
  readonly identity?: string;
}

const PORT_MIN = 1;
const PORT_MAX = 65535;

/**
 * A bad value THROWS rather than falling back to `fallback`. Falling back is
 * what re-creates the collision this override exists to prevent: two lanes
 * that both typo the variable would quietly land on the same default port.
 */
export function resolvePort(env: E2ePortEnv, name: string, fallback: number): number {
  const raw = env[name];
  if (raw === undefined || raw === "") return fallback; // `FOO=` must not read as set
  const text = raw.trim();
  const port = /^[0-9]+$/.test(text) ? Number(text) : Number.NaN;
  if (!Number.isInteger(port) || port < PORT_MIN || port > PORT_MAX) {
    throw new Error(
      `${name}=${JSON.stringify(raw)} is not a usable port. ` +
        `Set it to a free TCP port between ${PORT_MIN} and ${PORT_MAX}, or unset it to use ${fallback}.`,
    );
  }
  return port;
}

export function resolveE2ePorts(env: E2ePortEnv): E2ePorts {
  const PORT = resolvePort(env, E2E_PORT_VAR, DEFAULT_E2E_PORT);
  const DPORT = resolvePort(env, E2E_DPORT_VAR, DEFAULT_E2E_DPORT);
  if (PORT === DPORT) {
    throw new Error(
      `${E2E_PORT_VAR} and ${E2E_DPORT_VAR} are both ${PORT}. The static server and the ` +
        `browser's debug port cannot share one port; note the defaults are ` +
        `${DEFAULT_E2E_PORT} and ${DEFAULT_E2E_DPORT}, so overriding one onto the other's default collides too.`,
    );
  }
  return { PORT, DPORT };
}

/**
 * The failure text for launching onto an occupied debug port, or null if it is
 * free. This is a hazard rather than a mere conflict: nothing in the run binds
 * the debug port, `getPageTarget` CONNECTS to whatever answers `/json`. A
 * crashed or orphaned run that left a headless browser holding the port is
 * therefore adopted in silence, and the suites go on to report on its build
 * (2026-07-29: unstyled pages, sticky mobile metrics, three bogus screenshots).
 */
export function debugPortConflictMessage(dport: number, probe: DebugPortProbe): string | null {
  if (!probe.listening) return null;
  const who = probe.identity ? ` (it answers as ${probe.identity})` : "";
  return (
    `something is already listening on e2e debug port ${dport}${who}. ` +
    `This run does not bind that port, it connects to it, so it would silently attach to that ` +
    `browser and report results from its stale build instead of this one. ` +
    `Stop it (\`lsof -ti tcp:${dport} | xargs kill\`) or send this run elsewhere with ` +
    `${E2E_DPORT_VAR}=<free port>.`
  );
}
