import { ROLES, type RoleDefinition } from "./roles.ts";

export type GeneratedFile = { readonly path: string; readonly text: string };
export type GenerationProblem = { readonly path: string; readonly problem: string };

export function planGeneratedFiles(_root: string, _roles: readonly RoleDefinition[] = ROLES): readonly GeneratedFile[] {
  return [];
}

export function checkGeneratedFiles(
  _root: string,
  _roles: readonly RoleDefinition[] = ROLES,
): readonly GenerationProblem[] {
  return [{ path: "scripts/agent-infra", problem: "the generator is not built yet" }];
}

export function writeGeneratedFiles(_root: string, _roles: readonly RoleDefinition[] = ROLES): readonly string[] {
  return [];
}
