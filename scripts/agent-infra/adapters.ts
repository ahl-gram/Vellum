import { GenerationError } from "./errors.ts";

export type Adapter = { readonly slots: ReadonlyMap<string, string>; readonly appendix: string };

const SLOT_LINE = /^<!-- slot: ([a-z0-9]+(?:-[a-z0-9]+)*) -->$/;
const APPENDIX_LINE = "<!-- appendix -->";
const MARKER = /\{\{harness:([a-z0-9]+(?:-[a-z0-9]+)*)\}\}/g;

type Section = { readonly marker: string; readonly lines: string[] };

function sectionsOf(text: string): readonly Section[] {
  const sections: Section[] = [{ marker: "", lines: [] }];
  for (const line of text.split("\n")) {
    if (SLOT_LINE.test(line) || line === APPENDIX_LINE) sections.push({ marker: line, lines: [] });
    else sections.at(-1)?.lines.push(line);
  }
  return sections.slice(1);
}

function withoutEdgeBlanks(lines: readonly string[]): readonly string[] {
  const first = lines.findIndex((line) => line.trim() !== "");
  return first === -1 ? [] : lines.slice(first, lines.findLastIndex((line) => line.trim() !== "") + 1);
}

export function parseAdapter(text: string, where: string): Adapter {
  const sections = sectionsOf(text);
  const slots = new Map<string, string>();
  let appendix = "";
  sections.forEach(({ marker, lines }, at) => {
    const kept = withoutEdgeBlanks(lines);
    if (marker === APPENDIX_LINE) {
      if (at !== sections.length - 1) throw new GenerationError(`${where}: the appendix must be its last section`);
      appendix = kept.length === 0 ? "" : `\n${kept.join("\n")}\n`;
      return;
    }
    const name = SLOT_LINE.exec(marker)?.[1] ?? marker;
    if (slots.has(name)) throw new GenerationError(`${where} defines the slot ${name} twice`);
    const [only] = kept;
    if (kept.length !== 1 || only === undefined)
      throw new GenerationError(`${where}: the slot ${name} must be one line of text, and is ${kept.length}`);
    slots.set(name, only);
  });
  return { slots, appendix };
}

export const slotsUsedIn = (body: string): readonly string[] => [...body.matchAll(MARKER)].map((m) => m[1] ?? "");

export function fillSlots(body: string, adapter: Adapter, where: string, adapterWhere: string): string {
  const filled = body.replace(MARKER, (_marker: string, name: string) => {
    const text = adapter.slots.get(name);
    if (text === undefined)
      throw new GenerationError(`${where} uses the slot ${name}, which ${adapterWhere} does not define`);
    return text;
  });
  if (filled.includes("{{") || filled.includes("}}"))
    throw new GenerationError(`${where} holds a {{ or }} that is no {{harness:<name>}} slot, here or in a slot's text`);
  return filled;
}
