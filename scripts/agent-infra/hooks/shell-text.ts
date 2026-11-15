export const QUOTED = /'[^']*'|"(?:[^"\\]|\\.)*"/g;
const HEREDOC = /<<-?\s*['"]?(\w+)['"]?\n([\s\S]*?)\n\1(?=\n|$)/g;
const SEPARATORS = /\n|;|&&|\|\||\||\$\(|\(|\{\s|\s\}|\bthen\b|\bdo\b|\belse\b|\belif\b/;
const LINE_CONTINUATION = /\\\n/g;
const PREFIX = /^(?:(?:env|command|time|exec|sudo|nohup|nice|builtin)\s+|[A-Za-z_][A-Za-z0-9_]*=\S*\s+)+/;
const GIT_GLOBAL_WITH_VALUE = new Set(["-C", "-c", "--git-dir", "--work-tree", "--namespace", "--exec-path"]);

export const heredocBodies = (command: string): string[] => [...command.matchAll(HEREDOC)].map((m) => m[2] ?? "");

export const commandSegments = (command: string): string[] =>
  command
    .replace(HEREDOC, "")
    .replace(QUOTED, '""')
    .replace(LINE_CONTINUATION, " ")
    .split(SEPARATORS)
    .map((s) => s.replace(PREFIX, "").trim().replace(/\s+/g, " "))
    .filter(Boolean);

export const gitCall = (segment: string): { sub: string; rest: string } | null => {
  const t = segment.split(" ");
  if (t[0] !== "git") return null;
  let i = 1;
  while (i < t.length && (t[i] ?? "").startsWith("-")) i += GIT_GLOBAL_WITH_VALUE.has(t[i] ?? "") ? 2 : 1;
  const sub = t[i];
  return sub ? { sub, rest: t.slice(i + 1).join(" ") } : null;
};
