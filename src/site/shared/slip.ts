export interface Classed {
  readonly classList: { add(c: string): void; remove(c: string): void; toggle(c: string): boolean; contains(c: string): boolean };
}

export interface Listens {
  addEventListener(type: string, listener: (e: Event) => void): void;
}

export interface Expands extends Listens {
  setAttribute(name: string, value: string): void;
}

export interface SlipParts {
  readonly slip: Classed;
  readonly fold: Listens | null;
  readonly tab: (Classed & Listens) | null;
  /** The phone sheet's toggle, a button covering the head. */
  readonly handle: Expands | null;
  readonly onLayout: () => void;
  readonly after: (run: () => void, ms: number) => void;
}

/** The slip's fold transition in atelier.css, plus a beat. */
export const FOLD_SETTLE_MS = 340;

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
  p.handle?.addEventListener("click", () => {
    const open = p.slip.classList.toggle("open");
    p.handle?.setAttribute("aria-expanded", String(open));
    p.onLayout();
  });
}
