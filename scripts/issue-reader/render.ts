import type { Entry, Thread } from "./thread.ts";

export const tally = (entries: readonly Entry[]): { readonly shown: number; readonly withheld: number } => {
  const withheld = entries.filter((entry) => entry.body === null).length;
  return { shown: entries.length - withheld, withheld };
};

const counts = (entries: readonly Entry[]): string => {
  const { shown, withheld } = tally(entries);
  return `${shown} shown, ${withheld} withheld`;
};

const WITHHELD_NOTE =
  "an account that is not the repository's owner, a member or a collaborator, so its text is not shown. Name it in your report; only Alex can say whether it matters:";

const withheldNote = (who: { readonly author: string; readonly association: string }, url: string): string =>
  `Written by ${who.author} (${who.association}), ${WITHHELD_NOTE} ${url}`;

const entryText = (entry: Entry): string => {
  const label = entry.state === null ? `${entry.kind} ${entry.id}` : `${entry.kind} ${entry.id} (${entry.state})`;
  if (entry.body === null) return `=== ${label}, ${entry.at}, withheld\n${withheldNote(entry, entry.url)}`;
  const header = `=== ${label} by ${entry.author} (${entry.association}), ${entry.at}: ${entry.url}`;
  return entry.body === "" ? header : `${header}\n${entry.body}`;
};

export const renderText = (thread: Thread): string => {
  const { opener } = thread;
  const lines = [
    `${thread.isPullRequest ? "Pull request" : "Issue"} #${thread.number} (${thread.state}): ${thread.title ?? "(title withheld)"}`,
    `Opened by ${opener.author} (${opener.association}), ${opener.at}: ${thread.url}`,
    `Comments: ${counts(thread.comments)}`,
  ];
  if (thread.isPullRequest) {
    lines.push(`Reviews: ${counts(thread.reviews)}; review comments: ${counts(thread.reviewComments)}`);
  }
  const opening = thread.body === null ? withheldNote(opener, thread.url) : thread.body;
  const entries = [...thread.comments, ...thread.reviews, ...thread.reviewComments].map(entryText);
  return `${[lines.join("\n"), ...(opening === "" ? [] : [opening]), ...entries].join("\n\n")}\n`;
};

export const renderJson = (thread: Thread): string => `${JSON.stringify(thread, null, 2)}\n`;
