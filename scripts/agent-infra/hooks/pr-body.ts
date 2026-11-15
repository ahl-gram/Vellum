import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { proseOf } from "./markdown-code.ts";
import { QUOTED } from "./shell-text.ts";

const GH_BODY_WRITE = /^gh (pr|issue) (create|edit|comment)\b/;
export const GH_PR_WRITE = /^gh pr (create|edit)\b/;
const BODY_FILE = /(?:--body-file|-F)[=\s]+["']?([^\s"'=]+)(?=[\s"']|$)/g;
const BODY_SUBSHELL = /\$\(\s*(?:cat\s+|<\s*)([^\s)"']+)\s*\)/g;
const NEGATED_CLOSE =
  /(\bnot|\bnever|n't|\bno|\bwithout)\s+(clos(e|es|ed|ing)|fix(es|ed|ing)?|resolv(e|es|ed|ing))\s+(?:[\w.-]+\/[\w.-]+)?#\d+/i;
const EM_DASH = "\u2014";
const INLINE_BODY = /(^|\s)(--body|-b)(=|\s)/;
const UNRESOLVED_EXPANSION = /\$(?!\(\s*(?:cat\s|<))/;
const SINGLE_QUOTED = /'[^']*'/g;

const readRelative = (name: string, cwd: string): string => {
  const expanded = name.startsWith("~/") ? join(process.env.HOME ?? "", name.slice(2)) : name;
  return readFileSync(isAbsolute(expanded) ? expanded : join(cwd || ".", expanded), "utf8");
};

const bodyText = (
  command: string,
  cwd: string,
): { body: string; pieces: string[]; unread: string[]; fromBodyFlag: string[] } => {
  const pieces = [command.replace(QUOTED, "''"), ...[...command.matchAll(QUOTED)].map((m) => m[0].slice(1, -1))];
  const files: string[] = [];
  const unread: string[] = [];
  const fromBodyFlag: string[] = [];
  for (const pattern of [BODY_FILE, BODY_SUBSHELL]) {
    for (const match of command.matchAll(pattern)) {
      const name = match[1] ?? "";
      try {
        files.push(readRelative(name, cwd));
        if (pattern === BODY_FILE) fromBodyFlag.push(name);
      } catch {
        unread.push(name);
      }
    }
  }
  return { body: [command, ...files].join("\n"), pieces: [...pieces, ...files], unread, fromBodyFlag };
};

export const requiredHeadings = (file: string): string[] | null => {
  let text: string;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    return null;
  }
  const headings = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("## "));
  return headings.length ? headings : null;
};

const NO_TEMPLATE = (file: string, why: string): string =>
  `vellum-footguns: ${why} (${file}), so the PR body's section check did NOT run on this call; the em-dash and closing-keyword checks still did. ` +
  `Nothing is blocked, but nothing checked the body's shape either: restore the template, or read the sections off \`vellum-footguns\` Gate 5 yourself.`;

export const headingCheck = (body: string, file: string): { deny: string | null; warn: string | null } => {
  const need = requiredHeadings(file);
  if (!need) {
    return {
      deny: null,
      warn: NO_TEMPLATE(
        file,
        existsSync(file) ? "the PR template carries no `## ` heading" : "there is no PR template",
      ),
    };
  }
  const lines = new Set(body.split("\n").map((line) => line.trim()));
  const missing = need.filter((heading) => !lines.has(heading));
  if (!missing.length) return { deny: null, warn: null };
  return {
    deny:
      `vellum-footguns: the PR body skips ${missing.map((h) => `"${h}"`).join(", ")}. The shape in ${file} is the house record of what a PR claims, ` +
      `and a section that is absent is a claim never made rather than made and wrong. Presence is the whole check: ` +
      `"## Guards" followed by "None. This PR carries no test." is a valid section.`,
    warn: null,
  };
};

export const ghRefusal = (
  segment: string,
  command: string,
  cwd: string,
  template: string,
): [string | null, string | null] => {
  if (!GH_BODY_WRITE.test(segment)) return [null, null];
  const { body, pieces, unread, fromBodyFlag } = bodyText(command, cwd);
  const dashed = pieces.flatMap((piece) => proseOf(piece).split("\n")).find((line) => line.includes(EM_DASH));
  if (dashed !== undefined) {
    const at = dashed.indexOf(EM_DASH);
    return [
      `vellum-footguns: the body carries an em-dash outside code, near "${dashed.slice(Math.max(0, at - 60), at + 60).trim()}"; the house forbids them in the prose of issue and PR bodies and comments. One inside inline backticks or a fenced code block passes, which is how a pasted red line carries one.`,
      null,
    ];
  }
  const hit = GH_PR_WRITE.test(segment) ? NEGATED_CLOSE.exec(body) : null;
  if (hit) {
    return [
      `vellum-footguns: GitHub reads "${hit[0]}" as a CLOSING reference (the keyword beside the number wins, the negation is ` +
        `ignored; #486 and #524 both closed an issue this way). Say it without the keyword, in the form the PR template's note beside the closing line gives.`,
      null,
    ];
  }
  const warnings: string[] = [];
  if (unread.length) {
    warnings.push(
      `vellum-footguns could not read the body file(s) ${unread.join(", ")} from ${cwd || "the cwd"}, so the em-dash, ` +
        `closing-keyword and PR section checks did not run on them. Grep them yourself.`,
    );
  }
  const inline = INLINE_BODY.test(segment);
  // `$(cat f)` is read from ANY flag, which is right for the em-dash scan and wrong here: without the body-flag narrowing, `gh pr edit N --add-label "$(cat notes.md)"` reads as a PR body and is refused for skipping sections it was never meant to carry.
  const supplied = inline || fromBodyFlag.length > 0;
  const readable = !unread.length && !(inline && UNRESOLVED_EXPANSION.test(command.replace(SINGLE_QUOTED, "''")));
  if (GH_PR_WRITE.test(segment) && supplied && readable) {
    const { deny: missing, warn } = headingCheck(body, template);
    if (missing) return [missing, null];
    if (warn) warnings.push(warn);
  }
  return [null, warnings.length ? warnings.join("\n\n") : null];
};
