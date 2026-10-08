import { join } from "node:path";
import type { Readable } from "node:stream";
import { REPO } from "./runner.ts";
import type { EnvLike } from "./runner.ts";

export interface LaneChild {
  readonly stdout: Readable;
  readonly stderr: Readable;
  on(event: "error", listener: (err: Error) => void): unknown;
  on(event: "close", listener: (code: number | null) => void): unknown;
}

export type LaneSpawn = (
  command: string,
  args: readonly string[],
  options: { readonly env: Record<string, string>; readonly stdio: ["ignore", "pipe", "pipe"] },
) => LaneChild;

export interface LaneDriverDeps {
  readonly findBrowser: () => string | null;
  readonly spawn: LaneSpawn;
}

export interface LaneDriverIo extends LaneDriverDeps {
  readonly argv: readonly string[];
  readonly env: EnvLike;
  readonly isTTY: boolean;
  readonly out: (line: string) => void;
  readonly err: (line: string) => void;
}

export const RUNNER = join(REPO, "e2e", "run.ts");
export const LANES_SKIP_LINE = "Skipping the lanes";

export async function runLanes(io: LaneDriverIo): Promise<number> {
  void io;
  return Promise.resolve(0);
}

export function runLanesFromProcess(deps: LaneDriverDeps): Promise<number> {
  void deps;
  return Promise.resolve(0);
}
