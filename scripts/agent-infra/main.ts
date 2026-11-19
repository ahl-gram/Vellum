export function run(_mode: string | undefined, _root: string): number {
  return 0;
}

if (import.meta.main) process.exitCode = run(process.argv[2], process.cwd());
