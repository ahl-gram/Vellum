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
  readonly head: Listens;
  readonly narrow: () => boolean;
  /** Runs once the fold has settled, and at once when a phone sheet opens or closes. */
  readonly onLayout: () => void;
  readonly after: (run: () => void, ms: number) => void;
}

/** The slip's fold transition in atelier.css, plus a beat. */
export const FOLD_SETTLE_MS = 340;

const onControl = (e: Event): boolean =>
  typeof (e.target as { closest?: unknown } | null)?.closest === "function" &&
  (e.target as Element).closest("button, a, input, select") !== null;

export function bindSlip(p: SlipParts): void {
  const settle = () => p.after(p.onLayout, FOLD_SETTLE_MS);
  p.fold?.addEventListener("click", () => {
    p.slip.classList.add("folded");
    p.tab?.classList.add("shown");
    settle();
  });
  p.tab?.addEventListener("click", () => {
    p.slip.classList.remove("folded");
    p.tab?.classList.remove("shown");
    settle();
  });
  // A phone's sheet opens on a tap of its head; a tap on a control inside the head is that control's.
  p.head.addEventListener("click", (e) => {
    if (!p.narrow() || onControl(e)) return;
    p.slip.classList.toggle("open");
    p.onLayout();
  });
}
