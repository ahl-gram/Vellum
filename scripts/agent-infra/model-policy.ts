import type { HarnessId, RoleDefinition } from "./roles.ts";

export const EFFORTS = ["low", "medium", "high", "xhigh", "max", "ultra"] as const;
export type Effort = (typeof EFFORTS)[number];
export type ModelSelection = { readonly model: string; readonly effort: Effort };
export type HarnessPolicy = {
  readonly models: ReadonlyMap<string, readonly Effort[]>;
  readonly roles: ReadonlyMap<string, ModelSelection>;
};
export type ModelPolicy = ReadonlyMap<HarnessId, HarnessPolicy>;

export function parseModelPolicy(_raw: unknown, _roles: readonly RoleDefinition[]): ModelPolicy {
  return new Map();
}

export function loadModelPolicy(_root: string, _roles: readonly RoleDefinition[]): ModelPolicy {
  return new Map();
}

export function resolveModel(_policy: ModelPolicy, _harness: HarnessId, _role: string): ModelSelection {
  return { model: "inherit", effort: "low" };
}
