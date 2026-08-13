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

export interface DebugPortProbe {
  readonly listening: boolean;
  readonly identity?: string;
}

const PORT_MIN = 1;
const PORT_MAX = 65535;

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
