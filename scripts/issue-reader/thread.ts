export const TRUSTED_ASSOCIATIONS: ReadonlySet<string> = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);

export const isTrusted = (association: unknown): boolean =>
  typeof association === "string" && TRUSTED_ASSOCIATIONS.has(association);

const LOGIN = /^[A-Za-z0-9][A-Za-z0-9-]{0,38}(\[bot\])?$/;
const ENUM = /^[A-Z_]{1,32}$/;
const NO_NAME = "an account whose name is not shown";

export const shownLogin = (login: unknown): string =>
  typeof login === "string" && LOGIN.test(login) ? login : NO_NAME;

export type EntryKind = "comment" | "review" | "review comment";

export type Entry = {
  readonly kind: EntryKind;
  readonly id: number;
  readonly author: string;
  readonly association: string;
  readonly at: string;
  readonly url: string;
  readonly state: string | null;
  readonly body: string | null;
};

export type Thread = {
  readonly number: number;
  readonly isPullRequest: boolean;
  readonly state: string;
  readonly url: string;
  readonly title: string | null;
  readonly opener: { readonly author: string; readonly association: string; readonly at: string };
  readonly body: string | null;
  readonly comments: readonly Entry[];
  readonly reviews: readonly Entry[];
  readonly reviewComments: readonly Entry[];
};

export type RawThread = {
  readonly issue: unknown;
  readonly comments: readonly unknown[];
  readonly reviews: readonly unknown[];
  readonly reviewComments: readonly unknown[];
};

const recordOf = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const textOf = (value: unknown): string => (typeof value === "string" ? value : "");

const enumOf = (value: unknown): string => (typeof value === "string" && ENUM.test(value) ? value : "UNKNOWN");

const numberOf = (value: unknown): number => (typeof value === "number" && Number.isInteger(value) ? value : 0);

export const parseLines = (jsonl: string): unknown[] =>
  jsonl
    .split("\n")
    .filter((line) => line !== "")
    .map((line): unknown => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    });

const authorOf = (raw: Record<string, unknown>) => ({
  author: shownLogin(recordOf(raw.user).login),
  association: enumOf(raw.author_association),
  trusted: isTrusted(raw.author_association),
});

const entryOf = (kind: EntryKind, value: unknown): Entry => {
  const raw = recordOf(value);
  const who = authorOf(raw);
  return {
    kind,
    id: numberOf(raw.id),
    author: who.author,
    association: who.association,
    at: textOf(kind === "review" ? raw.submitted_at : raw.created_at),
    url: textOf(raw.html_url),
    state: kind === "review" ? enumOf(raw.state) : null,
    body: who.trusted ? textOf(raw.body) : null,
  };
};

export const isPullRequest = (issue: unknown): boolean => {
  const marker = recordOf(issue).pull_request;
  return typeof marker === "object" && marker !== null;
};

export const threadOf = (raw: RawThread): Thread => {
  const issue = recordOf(raw.issue);
  const who = authorOf(issue);
  return {
    number: numberOf(issue.number),
    isPullRequest: isPullRequest(issue),
    state: issue.state === "open" || issue.state === "closed" ? issue.state : "unknown",
    url: textOf(issue.html_url),
    title: who.trusted ? textOf(issue.title) : null,
    opener: { author: who.author, association: who.association, at: textOf(issue.created_at) },
    body: who.trusted ? textOf(issue.body) : null,
    comments: raw.comments.map((value) => entryOf("comment", value)),
    reviews: raw.reviews.map((value) => entryOf("review", value)),
    reviewComments: raw.reviewComments.map((value) => entryOf("review comment", value)),
  };
};
