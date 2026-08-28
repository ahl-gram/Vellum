export interface Listens {
  addEventListener(type: string, listener: (e: Event) => void): void;
}

export interface Reveal extends Listens {
  checked: boolean;
}

export interface Inertable {
  inert: boolean;
}

// Exactly what the scrim covers: the survey section's children (stage, seed form, slips). The shelf and footer stay live, since a click over an inert subtree retargets to its nearest live ancestor and never to the scrim (skeptic round 2, finding 2).
export const INERT_BEHIND = ".landfall > *";

export interface Narrow extends Listens {
  readonly matches: boolean;
}

export interface DrawerHost {
  readonly scrim: object;
  readonly inert: readonly Inertable[];
  readonly narrow: Narrow;
}

export function bindDrawer(reveal: Reveal, doc: Listens, host: DrawerHost): void {
  const apply = () => {
    for (const el of host.inert) el.inert = reveal.checked;
  };
  const close = () => {
    reveal.checked = false;
    apply();
  };
  reveal.addEventListener("change", apply);
  doc.addEventListener("keydown", (e) => {
    if ((e as KeyboardEvent).key === "Escape" && reveal.checked) close();
  });
  doc.addEventListener("click", (e) => {
    if (reveal.checked && e.target === host.scrim) close();
  });
  host.narrow.addEventListener("change", () => {
    if (!host.narrow.matches && reveal.checked) close();
  });
  doc.addEventListener("scroll", () => {
    if (reveal.checked) close();
  });
}
