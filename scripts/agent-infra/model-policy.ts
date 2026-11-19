import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GenerationError, messageOf } from "./errors.ts";
import { HARNESSES, POLICY_FILE, type HarnessId, type RoleDefinition } from "./roles.ts";

export const EFFORTS = ["low", "medium", "high", "xhigh", "max", "ultra"] as const;
export type Effort = (typeof EFFORTS)[number];
export type ModelSelection = { readonly model: string; readonly effort: Effort };
export type HarnessPolicy = {
  readonly models: ReadonlyMap<string, readonly Effort[]>;
  readonly roles: ReadonlyMap<string, ModelSelection>;
};
export type ModelPolicy = ReadonlyMap<HarnessId, HarnessPolicy>;

type Table = Readonly<Record<string, unknown>>;

const isTable = (value: unknown): value is Table =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isEffort = (value: unknown): value is Effort => EFFORTS.some((effort) => effort === value);

function exactKeys(value: unknown, keys: readonly string[], where: string): Table {
  if (!isTable(value)) throw new GenerationError(`${where} is not an object`);
  const extra = Object.keys(value).filter((key) => !keys.includes(key));
  if (extra.length > 0) throw new GenerationError(`${where} holds a key it may not: ${extra.join(", ")}`);
  const missing = keys.filter((key) => !Object.hasOwn(value, key));
  if (missing.length > 0) throw new GenerationError(`${where} has no ${missing.join(", ")}`);
  return value;
}

function effortList(value: unknown): readonly Effort[] | null {
  if (!Array.isArray(value)) return null;
  const items: readonly unknown[] = value;
  return items.length > 0 && items.every(isEffort) && new Set(items).size === items.length ? items : null;
}

function parseModels(value: unknown, where: string): ReadonlyMap<string, readonly Effort[]> {
  if (!isTable(value) || Object.keys(value).length === 0) throw new GenerationError(`${where} approves no model`);
  return new Map(
    Object.entries(value).map(([model, efforts]) => {
      const list = effortList(efforts);
      if (list === null)
        throw new GenerationError(`${where} ${model} is not a list of distinct efforts from ${EFFORTS.join(", ")}`);
      return [model, list];
    }),
  );
}

function parseRoles(
  value: unknown,
  models: ReadonlyMap<string, readonly Effort[]>,
  names: readonly string[],
  where: string,
): ReadonlyMap<string, ModelSelection> {
  const table = exactKeys(value, names, where);
  return new Map(
    names.map((name) => {
      const { model, effort } = exactKeys(table[name], ["model", "effort"], `${where} ${name}`);
      if (typeof model !== "string" || !models.has(model))
        throw new GenerationError(
          `${where} ${name} names a model the policy does not approve: ${JSON.stringify(model)}`,
        );
      if (!isEffort(effort) || !(models.get(model) ?? []).includes(effort))
        throw new GenerationError(
          `${where} ${name} asks ${model} for an effort the policy does not approve for it: ${JSON.stringify(effort)}`,
        );
      return [name, { model, effort }];
    }),
  );
}

export function parseModelPolicy(raw: unknown, roles: readonly RoleDefinition[]): ModelPolicy {
  const top = exactKeys(raw, HARNESSES, POLICY_FILE);
  const names = roles.map((role) => role.name);
  return new Map(
    HARNESSES.map((harness) => {
      const where = `${POLICY_FILE} ${harness}`;
      const section = exactKeys(top[harness], ["models", "roles"], where);
      const models = parseModels(section["models"], `${where} models`);
      return [harness, { models, roles: parseRoles(section["roles"], models, names, `${where} roles`) }];
    }),
  );
}

export function loadModelPolicy(root: string, roles: readonly RoleDefinition[]): ModelPolicy {
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(join(root, POLICY_FILE), "utf8"));
  } catch (error) {
    throw new GenerationError(`${POLICY_FILE} cannot be read as JSON: ${messageOf(error)}`);
  }
  return parseModelPolicy(raw, roles);
}

export function resolveModel(policy: ModelPolicy, harness: HarnessId, role: string): ModelSelection {
  const selection = policy.get(harness)?.roles.get(role);
  if (selection === undefined)
    throw new GenerationError(`${POLICY_FILE} gives ${role} no model under ${harness}, and a role never inherits one`);
  return selection;
}
