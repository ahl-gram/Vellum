import { messageOf } from "./errors.ts";
import { checkGeneratedFiles, writeGeneratedFiles } from "./generate.ts";

const USAGE = "usage: node scripts/agent-infra/main.ts generate | check, run from the repository root";

export function run(mode: string | undefined, root: string): number {
  if (mode === "check") {
    const problems = checkGeneratedFiles(root);
    for (const { path, problem } of problems) console.error(`${path}: ${problem}`);
    console.log(
      problems.length === 0
        ? "agents:check: every generated agent definition is current"
        : `agents:check: ${problems.length} problem(s)`,
    );
    return problems.length === 0 ? 0 : 1;
  }
  if (mode === "generate") {
    try {
      const written = writeGeneratedFiles(root);
      for (const path of written) console.log(`wrote ${path}`);
      console.log(`agents:generate: ${written.length} file(s) written`);
      return 0;
    } catch (error) {
      console.error(`agents:generate: ${messageOf(error)}`);
      return 1;
    }
  }
  console.error(USAGE);
  return 2;
}

if (import.meta.main) process.exitCode = run(process.argv[2], process.cwd());
