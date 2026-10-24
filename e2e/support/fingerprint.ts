import { release as osRelease } from "node:os";

export const FINGERPRINT_LEAD = "fingerprint: ";
export const NUMERO_TEXT = "Chart № 42";
export const NUMERO_GLYPH = "№";

export interface HostFacts {
  readonly platform: string;
  readonly release: string;
  readonly arch: string;
  readonly node: string;
}

export interface BrowserFacts {
  readonly product: string | null;
  readonly numeroWidth: number | null;
  readonly numeroFace: string | null;
  readonly selectHeight: number | null;
  readonly unread: string | null;
}

export interface EnvironmentFacts extends HostFacts, BrowserFacts {
  readonly binary: string;
}

export const hostFacts = (): HostFacts => ({
  platform: process.platform,
  release: osRelease(),
  arch: process.arch,
  node: process.version,
});

export const unreadBrowser = (reason: string): BrowserFacts => ({
  product: null,
  numeroWidth: null,
  numeroFace: null,
  selectHeight: null,
  unread: reason,
});

const px = (n: number | null): string => (n === null ? "unread" : `${n.toFixed(2)}px`);
const firstLine = (text: string): string => text.split("\n")[0] ?? text;

export function environmentFingerprint(facts: EnvironmentFacts): string {
  const parts = [
    `${facts.platform} ${facts.release} ${facts.arch}`,
    `Node ${facts.node}`,
    `${facts.binary} ${facts.product ?? "version unread"}`,
    `"${NUMERO_TEXT}" ${px(facts.numeroWidth)}`,
    facts.numeroFace === null ? `${NUMERO_GLYPH} face unread` : `${NUMERO_GLYPH} in ${facts.numeroFace}`,
    `select ${px(facts.selectHeight)}`,
  ];
  const tail = facts.unread === null ? [] : [`unread because ${firstLine(facts.unread)}`];
  return FINGERPRINT_LEAD + [...parts, ...tail].join("; ");
}

export const laneFingerprint = (line: string): string | null =>
  line.startsWith(FINGERPRINT_LEAD) ? line.slice(FINGERPRINT_LEAD.length) : null;
