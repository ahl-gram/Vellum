// The hold (Issue #751): one press with two moments; while it is lit the Glass drafts no finer survey and takes nothing away.
export const HELD_MARK = "held";

export function markCaption(text: string, _held: boolean): string {
  return text;
}

export interface HoldPress {
  setAttribute(name: string, value: string): void;
  addEventListener(type: "click", fn: () => void): void;
}

export interface HoldDeps {
  readonly press: HoldPress;
  readonly readCaption: () => string;
  readonly setCaption: (text: string) => void;
  readonly onHold: () => void;
  readonly onLetGo: () => void;
  readonly onRelease: () => void;
}

export interface Hold {
  readonly held: () => boolean;
  readonly release: () => void;
}

export function createHold(_deps: HoldDeps): Hold {
  return { held: () => false, release: () => {} };
}
