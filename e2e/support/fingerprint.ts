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

export const hostFacts = (): HostFacts => ({ platform: "", release: "", arch: "", node: "" });

export const unreadBrowser = (reason: string): BrowserFacts => ({
  product: null,
  numeroWidth: null,
  numeroFace: null,
  selectHeight: null,
  unread: reason,
});

export function environmentFingerprint(facts: EnvironmentFacts): string {
  void facts;
  return FINGERPRINT_LEAD;
}

export const laneFingerprint = (line: string): string | null => {
  void line;
  return null;
};
