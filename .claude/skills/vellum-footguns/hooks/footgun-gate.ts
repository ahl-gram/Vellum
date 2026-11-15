import { runClaudeHook } from "../../../../scripts/agent-infra/hooks/claude-adapter.ts";

if (import.meta.main) await runClaudeHook();
