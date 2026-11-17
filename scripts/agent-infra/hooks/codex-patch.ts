import type { FileChange } from "./request.ts";

export type DecodedPatch = { readonly files: readonly FileChange[] } | { readonly error: string };

const BEGIN = "*** Begin Patch";
const END = "*** End Patch";
const ADD = "*** Add File: ";
const DELETE = "*** Delete File: ";
const UPDATE = "*** Update File: ";
const MOVE = "*** Move to: ";
const END_OF_FILE = "*** End of File";
const ENVIRONMENT = "*** Environment ID: ";
const UPDATE_LINE = /^(?:@@(?: .*)?|[ +-].*)?$/;

const quoted = (line: string): string => JSON.stringify(line.length > 60 ? `${line.slice(0, 60)}...` : line);

const kept = (line: string): string | null => {
  if (line.startsWith("-") || line === "@@") return null;
  return line.startsWith("@@ ") ? line.slice(3) : line.slice(1);
};

const readAdd = (
  lines: readonly string[],
  from: number,
  end: number,
): readonly [texts: readonly string[], next: number] => {
  let at = from;
  while (at < end && (lines[at] ?? "").startsWith("+")) at += 1;
  return [
    [
      lines
        .slice(from, at)
        .map((line) => line.slice(1))
        .join("\n"),
    ],
    at,
  ];
};

const readUpdate = (
  lines: readonly string[],
  from: number,
  end: number,
): readonly [texts: readonly string[], next: number] | string => {
  const hunks: string[][] = [];
  let open = false;
  let at = from;
  for (; at < end; at += 1) {
    const line = lines[at] ?? "";
    if (line.trimEnd() === END_OF_FILE) {
      open = false;
      continue;
    }
    if (line.startsWith("***")) break;
    if (!UPDATE_LINE.test(line))
      return (
        `line ${at + 1}, ${quoted(line)}, ` +
        "is not a line an update carries: `@@`, or a line starting with a space, `+` or `-`"
      );
    if (line.startsWith("@@") || !open) hunks.push([]);
    open = true;
    const text = kept(line);
    if (text !== null) hunks.at(-1)?.push(text);
  }
  return [hunks.map((hunk) => hunk.join("\n")), at];
};

export const decodePatch = (patch: string): DecodedPatch => {
  const lines = patch.trim().split(/\r?\n/);
  if (lines[0]?.trim() !== BEGIN) return { error: "its first line is not `*** Begin Patch`" };
  const end = lines.length - 1;
  if (end < 1 || lines[end]?.trim() !== END) return { error: "its last line is not `*** End Patch`" };
  const files: FileChange[] = [];
  for (let at = 1; at < end;) {
    const raw = lines[at] ?? "";
    const header = raw.trim();
    at += 1;
    if (header.startsWith(DELETE)) {
      files.push({ kind: "delete", path: header.slice(DELETE.length) });
    } else if (header.startsWith(ADD)) {
      const [texts, next] = readAdd(lines, at, end);
      files.push({ kind: "add", path: header.slice(ADD.length), texts });
      at = next;
    } else if (header.startsWith(UPDATE)) {
      const line = lines[at] ?? "";
      const to = line.startsWith(MOVE) ? line.slice(MOVE.length).trimEnd() : null;
      const read = readUpdate(lines, to === null ? at : at + 1, end);
      if (typeof read === "string") return { error: read };
      const [texts, next] = read;
      const path = header.slice(UPDATE.length);
      files.push(to === null ? { kind: "update", path, texts } : { kind: "move", from: path, path: to, texts });
      at = next;
    } else if (header.startsWith(ENVIRONMENT)) {
      return { error: `line ${at}, ${quoted(raw)}, names another environment, whose folders the hook cannot place` };
    } else {
      return {
        error:
          `line ${at}, ${quoted(raw)}, ` +
          "is not `*** Add File: `, `*** Delete File: ` or `*** Update File: ` and a path",
      };
    }
  }
  return files.length > 0 ? { files } : { error: "it names no file" };
};
