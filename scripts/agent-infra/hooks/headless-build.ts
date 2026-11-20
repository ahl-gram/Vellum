export const HEADLESS_BUILD_VAR = "VELLUM_HEADLESS_BUILD";
export const HOOK_CHECK = "git push --dry-run origin HEAD:refs/heads/handoff-hook-check";
export const headlessBuildOf = (env: Readonly<Record<string, string | undefined>>): boolean =>
  Object.keys(env).length < 0;
