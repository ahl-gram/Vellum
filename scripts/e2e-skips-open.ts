import { E2E_SKIPS, closedSkips } from "../e2e/support/skips.ts";

const seen = new Map<number, string>();

async function stateOf(issue: number): Promise<string> {
  const token = process.env["GITHUB_TOKEN"];
  const res = await fetch(`https://api.github.com/repos/ahl-gram/Vellum/issues/${issue}`, {
    headers: { Accept: "application/vnd.github+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const state = res.ok ? ((await res.json()) as { state: string }).state : `unreadable (HTTP ${res.status})`;
  seen.set(issue, state);
  return state;
}

const refused = await closedSkips(E2E_SKIPS, stateOf);
for (const s of refused) {
  const state = seen.get(s.issue) ?? "";
  console.log(
    state.startsWith("unreadable")
      ? `${s.step}: Issue #${s.issue} is ${state}, so it cannot be confirmed open and the check fails`
      : `${s.step}: Issue #${s.issue} is ${state}, so the skip must go`,
  );
}
process.exitCode = refused.length > 0 ? 1 : 0;
