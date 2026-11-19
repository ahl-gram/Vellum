import { spawnSync } from "node:child_process";
import { lstatSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fillSlots, parseAdapter, slotsUsedIn } from "./adapters.ts";
import { GenerationError, messageOf } from "./errors.ts";
import { loadModelPolicy, resolveModel } from "./model-policy.ts";
import { renderClaudeAgent, renderCodexAgent } from "./render.ts";
import {
  HARNESSES,
  OUTPUT_DIRS,
  POLICY_FILE,
  ROLES,
  adapterPath,
  outputPath,
  roleBodyPath,
  type HarnessId,
  type RoleDefinition,
} from "./roles.ts";

export type GeneratedFile = { readonly path: string; readonly text: string };
export type GenerationProblem = { readonly path: string; readonly problem: string };

const GENERATE = "npm run agents:generate";
// 2026-11-18: this git ls-files answers in under 10 ms on a Mac; thirty seconds is a cap on a hang, not a budget.
const GIT_TIMEOUT_MS = 30_000;
const RENDER: Readonly<Record<HarnessId, typeof renderClaudeAgent>> = {
  "claude-code": renderClaudeAgent,
  "codex-local": renderCodexAgent,
};

const byPath = (a: { readonly path: string }, b: { readonly path: string }): number =>
  a.path < b.path ? -1 : a.path > b.path ? 1 : 0;

function readInput(root: string, path: string): string {
  try {
    return readFileSync(join(root, path), "utf8");
  } catch (error) {
    throw new GenerationError(`${path} cannot be read: ${messageOf(error)}`);
  }
}

export function planGeneratedFiles(root: string, roles: readonly RoleDefinition[] = ROLES): readonly GeneratedFile[] {
  const policy = loadModelPolicy(root, roles);
  const bodies = roles.map((role) => [role, readInput(root, roleBodyPath(role.name))] as const);
  const used = new Set(bodies.flatMap(([, body]) => slotsUsedIn(body)));
  const files = HARNESSES.flatMap((harness) => {
    const adapter = parseAdapter(readInput(root, adapterPath(harness)), adapterPath(harness));
    const unused = [...adapter.slots.keys()].filter((name) => !used.has(name));
    if (unused.length > 0)
      throw new GenerationError(`${adapterPath(harness)} defines slots no role body uses: ${unused.join(", ")}`);
    return bodies.map(([role, body]) => ({
      path: outputPath(harness, role.name),
      text: RENDER[harness](
        role,
        resolveModel(policy, harness, role.name),
        fillSlots(body, adapter, roleBodyPath(role.name), adapterPath(harness)),
        adapter.appendix,
      ),
    }));
  });
  const paths = files.map((file) => file.path);
  const repeated = paths.filter((path, at) => paths.indexOf(path) !== at);
  if (repeated.length > 0) throw new GenerationError(`two roles would write ${repeated.join(", ")}`);
  return [...files].sort(byPath);
}

function trackedOutputs(root: string): readonly string[] {
  const listing = spawnSync("git", ["ls-files", "-z", "--", ...HARNESSES.map((h) => OUTPUT_DIRS[h])], {
    cwd: root,
    encoding: "utf8",
    timeout: GIT_TIMEOUT_MS,
  });
  if (listing.status !== 0)
    throw new GenerationError(
      `git ls-files failed, so the tracked definitions are unread: ${listing.error?.message ?? listing.stderr}`,
    );
  return listing.stdout.split("\0").filter(Boolean);
}

function driftOf(root: string, { path, text }: GeneratedFile): readonly GenerationProblem[] {
  const stat = lstatSync(join(root, path), { throwIfNoEntry: false });
  if (stat === undefined) return [{ path, problem: `is missing: run ${GENERATE}` }];
  if (!stat.isFile()) return [{ path, problem: "is not a regular file, so it is not the generated definition" }];
  if (readFileSync(join(root, path), "utf8") === text) return [];
  return [{ path, problem: `differs from what ${GENERATE} writes from handbook/agents/ and ${POLICY_FILE}` }];
}

export function checkGeneratedFiles(
  root: string,
  roles: readonly RoleDefinition[] = ROLES,
): readonly GenerationProblem[] {
  let planned: readonly GeneratedFile[];
  let tracked: readonly string[];
  try {
    planned = planGeneratedFiles(root, roles);
    tracked = trackedOutputs(root);
  } catch (error) {
    return [{ path: "scripts/agent-infra", problem: messageOf(error) }];
  }
  const plannedPaths = new Set(planned.map((file) => file.path));
  const strays = tracked
    .filter((path) => !plannedPaths.has(path))
    .map((path) => ({ path, problem: "is tracked, but no role in scripts/agent-infra/roles.ts generates it" }));
  return [...planned.flatMap((file) => driftOf(root, file)), ...strays].sort(byPath);
}

export function writeGeneratedFiles(root: string, roles: readonly RoleDefinition[] = ROLES): readonly string[] {
  const planned = planGeneratedFiles(root, roles);
  const blocked = planned.filter(
    ({ path }) => lstatSync(join(root, path), { throwIfNoEntry: false })?.isFile() === false,
  );
  if (blocked.length > 0)
    throw new GenerationError(
      `nothing written: ${blocked.map((file) => file.path).join(", ")} is not a regular file, so writing would go through it`,
    );
  const changed = planned.filter((file) => driftOf(root, file).length > 0);
  for (const { path, text } of changed) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return changed.map((file) => file.path);
}
