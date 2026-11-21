import { bareCdReason } from "./bare-cd.ts";
import { escapeScan } from "./escape-scan.ts";
import { templatePath } from "./gate-state.ts";
import { headlessEnvRefusal, headlessRefusal } from "./headless-build.ts";
import { GH_PR_WRITE, ghRefusal } from "./pr-body.ts";
import type { HookRequest, Note, ShellOperation, Verdict } from "./request.ts";
import { commandSegments, gitCall, heredocBodies } from "./shell-text.ts";

const REDIRECT_INTO_SCRIPT = /(>>?|\btee\b)\s*["']?\S*(scripts|out|e2e)\/\S*\.(mjs|ts)/;
const PERL_INPLACE = /^perl\b.*\s-[0a-zA-Z]*i\b/;
const PERL_META_DELIMITER = /\bs([|+*?.$])(?:(?!\1)[\s\S])*\\\1/;
const GH_API_CALL = /^gh api\b/;
const GH_API_BARE_ITEM = /(?:^|\s)(?:https:\/\/[^\s/]+\/)?\/?repos\/[^\s/]+\/[^\s/]+\/(?:issues|pulls)\/\d+\/?(?=\s|$)/;
const GH_API_FIELD = /(?:^|\s)(?:-[A-Za-z]*[fF]|--(?:raw-field|field|input)\b)/;
const GH_API_METHOD = /(?:^|\s)(?:-X|--method)[=\s]*"?(\w*)/g;

const STASH_REASON =
  "vellum-footguns: refs/stash is shared across every worktree in this repo, so any bare mutation of it (stash, push without -m, " +
  "pop, apply or drop without an explicit ref, clear) can take or destroy another session's work. Use `git stash push -m <why> -- " +
  "<paths>`, restore with `git stash apply <sha>`, drop by that ref, or set work aside with a WIP commit.";

const stashRefusal = (segment: string): string | null => {
  const call = gitCall(segment);
  if (!call || call.sub !== "stash") return null;
  const verb = call.rest.split(" ")[0] ?? "";
  if (["list", "show", "branch", "create", "store"].includes(verb)) return null;
  if (verb === "push" && /(^|\s)(-m|--message)(\s|=|$)/.test(call.rest)) return null;
  if (["apply", "drop"].includes(verb) && /\s(stash@\{\d+\}|[0-9a-f]{7,40})(\s|$)/.test(" " + call.rest)) return null;
  return STASH_REASON;
};

const PERL_REASON =
  "vellum-footguns: `perl -i` with a non-ASCII replacement re-encodes every existing non-ASCII byte in the file (· becomes " +
  "Â·) and only an unrelated test notices. Do the edit with a node script or a heredoc, then grep the file for Â.";

const PERL_META_REASON =
  "vellum-footguns: perl strips the backslash before ANY delimiter, so an `s` whose delimiter is a regex METACHARACTER and whose " +
  "PATTERN escapes that delimiter silently loses the literal and leaves the metacharacter live. Measured 2026-09-14 on " +
  "`hello world`: `s|world\\||PLANET|` gives `PLANEThello world`, because the pipe unescapes to an alternation with an empty " +
  "branch that matches at offset zero; `s+world\\++`, `s*world\\**`, `s?world\\??` and `s$world\\$$` each REPLACE a target the " +
  "literal pattern does not contain; `s.world\\..` does the same whenever a character follows the match, and is inert only at a " +
  "line end, where the dot has nothing to consume. All exit 0. Delimit with a character that is not a metacharacter (`#` and `!` " +
  "were measured safe), or do the edit with a node script or a heredoc.";

const perlRefusal = (segment: string, command: string): string | null => {
  if (!PERL_INPLACE.test(segment)) return null;
  if (/[^\p{ASCII}]/u.test(command) || command.includes("\\x{")) return PERL_REASON;
  return PERL_META_DELIMITER.test(command) ? PERL_META_REASON : null;
};

const GH_API_WRITE_REASON =
  "vellum-footguns: a data field (`-f`, `-F`, `--raw-field`, `--field`, `--input`) switches `gh api` to POST, and a POST to the " +
  "bare issue or pull-request endpoint UPDATES that item rather than commenting on it: the fields you send overwrite what is " +
  "there, nothing is created, and it exits 0 (#193, PR #550). Put `/comments` on the path, use `gh issue comment N --body-file " +
  "<file>`, or say `-X PATCH` when editing the item IS the intent. The tell afterwards is a response `html_url` ending " +
  "`/issues/N` instead of `#issuecomment-<id>`.";

const lastMethod = (segment: string): string | null => {
  const seen = [...segment.matchAll(GH_API_METHOD)];
  return seen.length ? (seen.at(-1)?.[1] ?? "") : null;
};

const ghApiWriteRefusal = (segment: string): string | null => {
  if (!GH_API_CALL.test(segment) || !GH_API_BARE_ITEM.test(segment) || !GH_API_FIELD.test(segment)) return null;
  const method = lastMethod(segment);
  return method === null || method.toUpperCase() === "POST" ? GH_API_WRITE_REASON : null;
};

const PKILL_WARNING =
  "vellum-footguns: every killed e2e run leaves a browser profile under tmpdir (446 of them, 20GB, on 2026-09-08). Let the run " +
  "finish, or sweep `/var/folders/*/*/T/vellum-e2e-*` after.";

export const checkBash = async (
  operation: ShellOperation,
  request: HookRequest,
  shown: ReadonlySet<string>,
): Promise<Verdict> => {
  const { command } = operation;
  const cwd = request.operationDirectory.path ?? "";
  const template = templatePath(request.policyRoot);
  const notes: Note[] = [];
  const parts = commandSegments(command);
  const envRefusal = request.headlessBuild ? headlessEnvRefusal(command) : null;
  if (envRefusal !== null) return { denial: envRefusal, notes: [] };

  for (const segment of parts) {
    const refusal =
      (request.headlessBuild ? headlessRefusal(segment) : null) ??
      stashRefusal(segment) ??
      perlRefusal(segment, command) ??
      ghApiWriteRefusal(segment);
    if (refusal !== null) return { denial: refusal, notes: [] };
    const [ghDeny, warning] = ghRefusal(segment, command, cwd, template);
    if (ghDeny !== null) return { denial: ghDeny, notes: [] };
    if (warning !== null) notes.push({ kind: "warning", text: warning });
  }
  if (REDIRECT_INTO_SCRIPT.test(command)) {
    const bodies = heredocBodies(command);
    const { denial, note } = await escapeScan(
      bodies.length ? bodies.join("\n") : command,
      "a script written from the shell",
    );
    if (denial !== null) return { denial, notes: [] };
    if (note !== null) notes.push({ kind: "warning", text: note });
  }
  const moved =
    request.caller !== "subagent" && request.directoryPersists !== false
      ? bareCdReason(command, cwd, request.sessionDirectory ?? undefined)
      : null;
  if (moved !== null) return { denial: moved, notes: [] };
  if (parts.some((s) => GH_PR_WRITE.test(s) || gitCall(s)?.sub === "push") && !shown.has("push")) {
    notes.push({
      kind: "gate",
      gate: { key: "push", label: "Gate 5", lead: "You are about to push or write a PR body." },
    });
  }
  if (parts.some((s) => /^pkill\b.*(brave|chrom)/i.test(s))) notes.push({ kind: "warning", text: PKILL_WARNING });
  return { denial: null, notes };
};
