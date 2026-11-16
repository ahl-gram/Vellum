import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Decision, Payload } from "../../scripts/agent-infra/hooks/claude-adapter.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(HERE, "..", "..");
export const SCRATCH = join(tmpdir(), `footgun-selftest-${process.pid}`); // named here, created in run(): FIXTURES needs the path at module scope, and a module that mints a temp dir just by being imported leaks one per import
export const LINK = join(SCRATCH, "linked-root");

export const bash = (command: string, cwd?: string): Payload => ({
  tool_name: "Bash",
  tool_input: { command },
  ...(cwd ? { cwd } : {}),
});
export const edit = (tool: string, path: string, text: string): Payload => ({
  tool_name: tool,
  tool_input: { file_path: path, ...(tool === "Write" ? { content: text } : { new_string: text }) },
});
export const multi = (path: string, text: string): Payload => ({
  tool_name: "MultiEdit",
  tool_input: { file_path: path, edits: [{ new_string: text }] },
});

export type Kind = "deny" | "context" | null;
export type Fixture = [string, Payload | (() => Decision | Promise<Decision>), Kind, string, string?];
export const placed = (text: string): string =>
  text.replaceAll("<ROOT>", ROOT).replaceAll("<LINK>", LINK).replaceAll("<S>", SCRATCH);
export const NEEDLES: Record<string, string> = {
  deny: "inside the project",
  unplaced: "cannot work out",
  stash: "refs/stash",
  escape: "inside a backtick string",
};
export const judged = (got: Decision, want: Kind, needle: string, absent?: string): readonly [boolean, string] => {
  const out = got?.hookSpecificOutput;
  const kind: Kind = out ? (out.permissionDecision === "deny" ? "deny" : "context") : null;
  const text = out?.permissionDecisionReason ?? out?.additionalContext ?? "";
  return [
    kind === want && text.includes(needle) && (absent === undefined || !text.includes(absent)),
    `want ${want} with ${JSON.stringify(needle)}${absent === undefined ? "" : ` and without ${JSON.stringify(absent)}`}, got ${kind}`,
  ];
};
export const STASH_POP = bash("git stash pop");
// The five section names are written out HERE and derived in the hook. That asymmetry is the guard: a heading renamed in the template changes only one side, so these rows red instead of the hook silently enforcing yesterday's shape.
export const SECTIONS = ["## Guards", "## Ran", "## Records", "## Rulings", "## Look for these when you use it"];
export const bodyWith = (sections: string[]): string =>
  `#577 a title\n\nwhat changed.\n\n${sections.join("\n\nprose under it\n\n")}\n\nprose under it\n`;
export const WHOLE_BODY = bodyWith(SECTIONS);
export const prBody = (text: string): Payload => bash(`gh pr create --body '${text}'`);
