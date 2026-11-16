import { rmSync } from "node:fs";
import type { Payload } from "../../scripts/agent-infra/hooks/claude-adapter.ts";
import { decideCodex, type CodexPayload } from "../../scripts/agent-infra/hooks/codex-adapter.ts";
import { statePath } from "../../scripts/agent-infra/hooks/gate-state.ts";
import { CD_ROWS } from "./bare-cd.fixtures.ts";
import { bash, judged, NEEDLES, placed, ROOT, type Fixture, type Kind } from "./kit.ts";

type CodexRow = readonly [name: string, payload: Payload, want: Kind, needle: string, absent?: string];

export const asCodex = (payload: Payload, session: string): CodexPayload => ({
  session_id: session,
  cwd: payload.cwd ?? ROOT,
  tool_name: payload.tool_name,
  tool_input: { command: payload.tool_input?.command ?? "" },
  ...(payload.agent_id === undefined ? {} : { agent_id: payload.agent_id, agent_type: "vellum-implementer" }),
});

const shellRows = (table: readonly Fixture[]): CodexRow[] =>
  table.flatMap(([name, subject, want, needle, absent]): CodexRow[] =>
    typeof subject === "function" || subject.tool_name !== "Bash" ? [] : [[name, subject, want, needle, absent]],
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
  for (const [name, payload, want, needle, absent] of [...shellRows(table), ...cdRows()]) {
    const session = `selftest-codex-${process.pid}-${name}`;
    const [ok, line] = judged(await decideCodex(asCodex(payload, session), ROOT), want, needle, absent);
    rmSync(statePath(session), { force: true });
    report(ok, `codex: ${name}: ${line}`);
  }
};
