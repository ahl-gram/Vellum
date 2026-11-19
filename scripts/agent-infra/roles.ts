export const HARNESSES = ["claude-code", "codex-local"] as const;
export type HarnessId = (typeof HARNESSES)[number];

export type RoleDefinition = {
  readonly name: string;
  readonly description: string;
  readonly tools: string | null;
  readonly isolation: "worktree" | null;
  readonly color: string;
};

export const ROLES_DIR = "handbook/agents/roles";
export const ADAPTERS_DIR = "handbook/agents/adapters";
export const POLICY_FILE = ".agents/model-policy.json";
export const OUTPUT_DIRS: Readonly<Record<HarnessId, string>> = {
  "claude-code": ".claude/agents",
  "codex-local": ".codex/agents",
};
const OUTPUT_EXTENSIONS: Readonly<Record<HarnessId, string>> = { "claude-code": ".md", "codex-local": ".toml" };

export const roleBodyPath = (name: string): string => `${ROLES_DIR}/${name}.md`;
export const adapterPath = (harness: HarnessId): string => `${ADAPTERS_DIR}/${harness}.md`;
export const outputPath = (harness: HarnessId, name: string): string =>
  `${OUTPUT_DIRS[harness]}/${name}${OUTPUT_EXTENSIONS[harness]}`;

export const ROLES: readonly RoleDefinition[] = [
  {
    name: "vellum-designer",
    description:
      "Runs a Vellum design round, steps 1 and 2 of handbook/specs/conventions.md's \"How a design decision is made\". It draws one mockup per honest direction from real engine output, beside today's look as the control, and delivers the stills to the main checkout's out/ for Alex's sitting. It also breaks an epic into its subs (ordered, scoped and risked, with a design round first wherever the deliverable is an appearance) once the epic's vellum-spec-recon has run. Either way it hands back the open decisions as a plain-words menu. It is not for the stills of a STOP sitting at workflow step 6, which stay the implementer's spike and the plate reader's. Dispatch it by name and WITHOUT worktree isolation, from a session standing in the main checkout, into a detached tree that session builds (handbook/specs/development-workflow.md step 6).",
    tools: "Bash, Read, Write, Edit, WebFetch, WebSearch",
    isolation: null,
    color: "orange",
  },
  {
    name: "vellum-guard-prover",
    description:
      'Proves that a new or strengthened test actually bites, by deleting or inverting the exact behavior it claims to guard and confirming that test goes red. Use after tests are written and green, before opening a PR, and whenever someone says "this test now guards X". Also use to check that a guard covers the bug\'s whole class, not just the one reported instance.',
    tools: "Bash, Read, Glob, Grep",
    isolation: null,
    color: "red",
  },
  {
    name: "vellum-implementer",
    description:
      "Builds one Vellum issue, or one pull request of it, from a FINISHED vellum-planner plan to an open, cold-reviewed pull request, by running steps 7 to 15 of handbook/specs/development-workflow.md. It takes no design decision, and where the plan is wrong or silent it stops and hands back. Use once the planner's report gives its Open decisions as none, with the plan's scratchpad path in the prompt.",
    tools: null,
    isolation: "worktree",
    color: "green",
  },
  {
    name: "vellum-planner",
    description:
      "Takes one Vellum issue from a filed number to a FINISHED plan that a vellum-implementer can build without taking a single design decision, by running steps 1 to 6 of handbook/specs/development-workflow.md, stopping at step 6 with Alex's decisions as a plain-words menu, then folding his relayed rulings into the plan. Use at the start of every issue a lane will build, once per pull request for an issue that ships as several, and again when an implementer hands a plan back as wrong.",
    tools: null,
    isolation: "worktree",
    color: "pink",
  },
  {
    name: "vellum-plate-reader",
    description:
      "Renders the actual artifact (a chart, a page, an Explorer state, a motion sequence) at real viewports through CDP and MEASURES it, for work whose acceptance is about appearance, layout, motion, or legibility. Use before opening a PR on any presentation sub, over a throwaway spike at workflow step 6 when Alex is to rule an appearance from stills, and whenever a claim is about how something looks or reads rather than what the DOM contains.",
    tools: "Bash, Read, Write, Glob, Grep",
    isolation: null,
    color: "cyan",
  },
  {
    name: "vellum-pr-skeptic",
    description:
      "Cold review of a pull request before Alex reads it, through the lenses its changed files call for. Dispatch it COLD, meaning the prompt must be a PR number or branch name and NOTHING else, no summary of the work, no claims about tests, no rationale from the implementing session. It reconstructs the spec from the linked issue (body AND comments), picks up to three lenses from the diff itself, checks each with commands it runs itself, runs the Vellum contract pass a generic reviewer does not know, and returns a merge verdict with ranked findings and what it checked clear. Use on every PR after it is pushed and before Alex is asked to review.",
    tools: "Bash, Read, Glob, Grep",
    isolation: null,
    color: "purple",
  },
  {
    name: "vellum-spec-recon",
    description:
      "Checks that an issue or epic is still true before code is written against it. Fetches the issue body AND its comments, verifies every cited path, symbol, test name, count, and claim against the repo as it stands, and returns a CURRENT / STALE / UNVERIFIABLE ledger plus the open decisions Alex has not ruled on. Use at the start of any sub or epic, and before building on any plan written more than a few sessions ago.",
    tools: "Bash, Read, Write, Glob, Grep",
    isolation: null,
    color: "blue",
  },
];
