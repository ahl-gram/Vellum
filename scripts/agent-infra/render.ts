import type { ModelSelection } from "./model-policy.ts";
import type { RoleDefinition } from "./roles.ts";

export function tomlBasicString(_text: string): string {
  return '"stub"';
}

export function tomlMultilineLiteral(_text: string): string {
  return '"stub"';
}

export function renderClaudeAgent(
  _role: RoleDefinition,
  _selection: ModelSelection,
  body: string,
  _appendix: string,
): string {
  return body;
}

export function renderCodexAgent(
  _role: RoleDefinition,
  _selection: ModelSelection,
  _body: string,
  _appendix: string,
): string {
  return 'name = "stub"\n';
}
