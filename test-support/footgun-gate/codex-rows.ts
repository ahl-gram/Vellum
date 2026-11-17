import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import type { Payload } from "../../scripts/agent-infra/hooks/claude-adapter.ts";
import { decideCodex, type CodexPayload } from "../../scripts/agent-infra/hooks/codex-adapter.ts";
import { statePath } from "../../scripts/agent-infra/hooks/gate-state.ts";
import { CD_ROWS } from "./bare-cd.fixtures.ts";
import { bash, judged, NEEDLES, placed, ROOT, type Fixture, type Kind } from "./kit.ts";

type CodexRow = readonly [name: string, payload: Payload, want: Kind, needle: string, absent?: string];

const EDITS = new Set(["Edit", "Write", "MultiEdit"]);

export const asCodex = (payload: Payload, session: string): CodexPayload => ({
  session_id: session,
  cwd: payload.cwd ?? ROOT,
  tool_name: payload.tool_name,
  tool_input: { command: payload.tool_input?.command ?? "" },
  ...(payload.agent_id === undefined ? {} : { agent_id: payload.agent_id, agent_type: "vellum-implementer" }),
});

const added = (text: string): string[] => (text === "" ? [] : text.split("\n").map((line) => `+${line}`));

export const asPatch = (payload: Payload, session: string): CodexPayload => {
  const input = payload.tool_input ?? {};
  const path = input.file_path ?? "";
  const hunks =
    payload.tool_name === "MultiEdit"
      ? (input.edits ?? []).flatMap((edit) => ["@@", ...added(edit?.new_string ?? "")])
      : ["@@", ...added(input.content ?? input.new_string ?? "")];
  const body =
    payload.tool_name === "Write" && !existsSync(resolve(ROOT, path))
      ? [`*** Add File: ${path}`, ...added(input.content ?? "")]
      : [`*** Update File: ${path}`, ...hunks];
  return {
    session_id: session,
    cwd: payload.cwd ?? ROOT,
    tool_name: "apply_patch",
    tool_input: { command: ["*** Begin Patch", ...body, "*** End Patch"].join("\n") },
  };
};

const shellRows = (table: readonly Fixture[]): CodexRow[] =>
  table.flatMap(([name, subject, want, needle, absent]): CodexRow[] =>
    typeof subject === "function" || subject.tool_name !== "Bash" ? [] : [[name, subject, want, needle, absent]],
  );

const editRows = (table: readonly Fixture[]): CodexRow[] =>
  table.flatMap(([name, subject, want, needle, absent]): CodexRow[] =>
    typeof subject === "function" || !EDITS.has(subject.tool_name ?? "")
      ? []
      : [[`patch: ${name}`, subject, want, needle, absent]],
  );

const cdRows = (): CodexRow[] =>
  CD_ROWS.map(([name, command, cwd, , who]): CodexRow => {
    const refused = who === "stash" || who === "escape";
    return [
      `a cd: ${name}`,
      {
        ...bash(placed(command), cwd === null ? undefined : placed(cwd)),
        ...(who === "subagent" ? { agent_id: "a781" } : {}),
      },
      refused ? "deny" : null,
      refused ? (NEEDLES[who] ?? "") : "",
    ];
  });

export const codexChecks = async (
  report: (ok: boolean, line: string) => void,
  table: readonly Fixture[],
): Promise<void> => {
  for (const [name, payload, want, needle, absent] of [...shellRows(table), ...cdRows(), ...editRows(table)]) {
    const session = `selftest-codex-${process.pid}-${name}`;
    const sent = EDITS.has(payload.tool_name ?? "") ? asPatch(payload, session) : asCodex(payload, session);
    const [ok, line] = judged(await decideCodex(sent, ROOT), want, needle, absent);
    rmSync(statePath(session), { force: true });
    report(ok, `codex: ${name}: ${line}`);
  }
};
