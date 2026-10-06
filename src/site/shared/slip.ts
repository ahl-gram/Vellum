export interface Classed {
  readonly classList: { add(c: string): void; remove(c: string): void; toggle(c: string): boolean; contains(c: string): boolean };
}

export interface Listens {
  addEventListener(type: string, listener: (e: Event) => void): void;
}

export interface SlipParts {
  readonly slip: Classed;
  readonly fold: Listens | null;
  readonly tab: (Classed & Listens) | null;
  readonly onLayout: () => void;
  readonly after: (run: () => void, ms: number) => void;
}

/** The slip's fold transition in atelier.css, plus a beat. */
export const FOLD_SETTLE_MS = 340;

/** The fold, as something another surface can drive: the Chart Table folds the Broadside when it opens (Issue #543, ruled 2026-09-08). */
export interface SlipFold {
  readonly folded: () => boolean;
  readonly setFolded: (folded: boolean) => void;
}

export function bindSlip(p: SlipParts): SlipFold {
  const settle = () => p.after(p.onLayout, FOLD_SETTLE_MS);
  const setFolded = (folded: boolean): void => {
    p.slip.classList[folded ? "add" : "remove"]("folded");
    p.tab?.classList[folded ? "add" : "remove"]("shown");
    settle();
  };
  p.fold?.addEventListener("click", () => setFolded(true));
  p.tab?.addEventListener("click", () => setFolded(false));
  return { folded: () => p.slip.classList.contains("folded"), setFolded };
}
