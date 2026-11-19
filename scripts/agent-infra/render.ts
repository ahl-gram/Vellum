import { GenerationError } from "./errors.ts";
import type { ModelSelection } from "./model-policy.ts";
import type { RoleDefinition } from "./roles.ts";

const TAB = 0x09;
const LINE_FEED = 0x0a;

function controlIn(text: string, allowed: readonly number[]): string | null {
  for (const character of text) {
    const code = character.codePointAt(0) ?? 0;
    if ((code < 0x20 || code === 0x7f) && !allowed.includes(code))
      return `U+${code.toString(16).toUpperCase().padStart(4, "0")}`;
  }
  return null;
}

const excerpt = (text: string): string => JSON.stringify(text.slice(0, 60));

export function tomlBasicString(text: string): string {
  const control = controlIn(text, [TAB]);
  if (control !== null) throw new GenerationError(`a one-line TOML string cannot hold ${control}: ${excerpt(text)}`);
  const escaped = text.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
  return `"${escaped}"`;
}

export function tomlMultilineLiteral(text: string): string {
  if (text.includes("'''")) throw new GenerationError(`a TOML literal string cannot hold ''': ${excerpt(text)}`);
  const control = controlIn(text, [TAB, LINE_FEED]);
  if (control !== null) throw new GenerationError(`a TOML literal string cannot hold ${control}: ${excerpt(text)}`);
  return `'''\n${text}'''`;
}

export function renderClaudeAgent(
  role: RoleDefinition,
  selection: ModelSelection,
  body: string,
  appendix: string,
): string {
  const front = [
    "---",
    `name: ${role.name}`,
    `description: ${role.description}`,
    ...(role.tools === null ? [] : [`tools: ${role.tools}`]),
    `model: ${selection.model}`,
    `effort: ${selection.effort}`,
    ...(role.isolation === null ? [] : [`isolation: ${role.isolation}`]),
    `color: ${role.color}`,
    "---",
  ];
  return `${front.join("\n")}\n\n${body}${appendix}`;
}

export function renderCodexAgent(
  role: RoleDefinition,
  selection: ModelSelection,
  body: string,
  appendix: string,
): string {
  return [
    `name = ${tomlBasicString(role.name)}`,
    `description = ${tomlBasicString(role.description)}`,
    `model = ${tomlBasicString(selection.model)}`,
    `model_reasoning_effort = ${tomlBasicString(selection.effort)}`,
    `developer_instructions = ${tomlMultilineLiteral(body + appendix)}`,
    "",
  ].join("\n");
}
