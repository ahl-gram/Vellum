import { realpathSync } from "node:fs";
import { relative } from "node:path";

export type Stop = { id: string; kind: "step" | "suite"; detail: string; stanza: string };
export type Red = { name: string; file: string };
export type E2eOutcome = { reds: string[]; stops: Stop[]; broken: string | null };
export type FileOutcome = { reds: Red[]; loadFailures: string[]; broken: string | null };

const FAIL = "FAIL  ";
const EM_DASH = String.fromCharCode(0x2014);
const DETAIL = `  ${EM_DASH} `;
const STEP_STOP = /^(\S+) never reached its assertion\b/;
const SUITE_STOP = /^(\S+) stopped early, /;
const STANZA_HEAD = /^ {2}\S+ (never reached its assertion|stopped early):/;
const STANZA_LINES = 60;

const stanzaOf = (stderr: string, head: string): string => {
  const lines = stderr.split("\n");
  const at = lines.findIndex((l) => l.startsWith(head));
  if (at === -1) return "";
  const kept = [lines[at]!];
  for (const line of lines.slice(at + 1)) {
    if (kept.length >= STANZA_LINES || !/^\s+\S/.test(line) || STANZA_HEAD.test(line)) break;
    kept.push(line);
  }
  return kept.join("\n");
};

const firstLine = (text: string): string =>
  text
    .split("\n")
    .find((l) => l.trim() !== "")
    ?.trim()
    .slice(0, 300) ?? "";

export const e2eOutcome = (stdout: string, stderr: string, exit: number | null): E2eOutcome => {
  const reds: string[] = [];
  const stops: Stop[] = [];
  const fails = stdout.split("\n").filter((l) => l.startsWith(FAIL));
  for (const line of fails) {
    const body = line.slice(FAIL.length);
    const cut = body.indexOf(DETAIL);
    const name = cut === -1 ? body : body.slice(0, cut);
    const detail = cut === -1 ? "" : body.slice(cut + DETAIL.length);
    const step = body.match(STEP_STOP);
    const suite = body.match(SUITE_STOP);
    if (step) {
      stops.push({
        id: step[1]!,
        kind: "step",
        detail,
        stanza: stanzaOf(stderr, `  ${step[1]!} never reached its assertion:`),
      });
    } else if (suite) {
      stops.push({ id: suite[1]!, kind: "suite", detail, stanza: stanzaOf(stderr, `  ${suite[1]!} stopped early:`) });
    } else {
      const id = (name.split(" ")[0] ?? "").replace(/[,:;]+$/, "");
      if (!reds.includes(id)) reds.push(id);
    }
  }
  const all = `${stdout}\n${stderr}`;
  const broken = all.includes("HARNESS ERROR")
    ? `a harness error (exit ${exit}): ${firstLine(stderr.slice(stderr.indexOf("HARNESS ERROR")))}`
    : stdout.includes("FAIL: no checks ran")
      ? "no checks ran"
      : exit !== 0 && fails.length === 0
        ? `exited ${exit} with no FAIL line: ${firstLine(stderr) || firstLine(stdout)}`
        : null;
  return { reds, stops, broken };
};

const relativeTo = (tree: string, file: string): string => {
  if (file === "") return "";
  try {
    return relative(realpathSync(tree), file);
  } catch {
    return relative(tree, file);
  }
};

export const unitOutcome = (
  jsonl: string,
  files: readonly string[],
  tree: string,
  exit: number | null,
): FileOutcome => {
  const reds: Red[] = [];
  const loadFailures: string[] = [];
  for (const line of jsonl.split("\n")) {
    let event: { pass?: boolean; name?: string; file?: string };
    try {
      event = JSON.parse(line) as typeof event;
    } catch {
      continue;
    }
    if (event.pass !== false) continue;
    const name = event.name ?? "";
    if (files.includes(name)) loadFailures.push(name);
    else reds.push({ name, file: relativeTo(tree, event.file ?? "") });
  }
  const broken =
    exit !== 0 && reds.length === 0 && loadFailures.length === 0 ? `exited ${exit} with no failure reported` : null;
  return { reds, loadFailures, broken };
};

type LintFile = { filePath: string; messages: { ruleId: string | null }[] };

export const lintOutcome = (json: string, tree: string, exit: number | null): FileOutcome => {
  let files: LintFile[];
  try {
    files = JSON.parse(json) as LintFile[];
  } catch {
    return { reds: [], loadFailures: [], broken: `the lint could not run (exit ${exit}): ${firstLine(json)}` };
  }
  if (exit !== 0 && exit !== 1) return { reds: [], loadFailures: [], broken: `the lint could not run (exit ${exit})` };
  const reds: Red[] = [];
  const loadFailures: string[] = [];
  for (const f of files) {
    const file = relative(tree, f.filePath);
    for (const m of f.messages) {
      if (m.ruleId === null) {
        if (!loadFailures.includes(file)) loadFailures.push(file);
      } else if (!reds.some((r) => r.name === m.ruleId && r.file === file)) reds.push({ name: m.ruleId, file });
    }
  }
  const broken =
    exit === 1 && reds.length === 0 && loadFailures.length === 0 ? "exited 1 with no message reported" : null;
  return { reds, loadFailures, broken };
};
