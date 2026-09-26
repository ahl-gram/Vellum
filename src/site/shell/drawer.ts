export interface Listens {
  addEventListener(type: string, listener: (e: Event) => void): void;
}

export interface Reveal extends Listens {
  checked: boolean;
}

export interface Inertable {
  inert: boolean;
}

export interface Narrow extends Listens {
  readonly matches: boolean;
}

export interface DrawerHost {
  readonly scrim: object;
  readonly inert: readonly Inertable[];
  readonly narrow: Narrow;
  readonly closesOnScroll: boolean;
}

export function bindDrawer(revealEl: Reveal, doc: Listens, host: DrawerHost): void {
  const apply = () => {
    for (const el of host.inert) el.inert = revealEl.checked;
  };
  const close = () => {
    revealEl.checked = false;
    apply();
  };
  revealEl.addEventListener("change", apply);
  doc.addEventListener("keydown", (e) => {
    if ((e as KeyboardEvent).key === "Escape" && revealEl.checked) close();
  });
  doc.addEventListener("click", (e) => {
    if (revealEl.checked && e.target === host.scrim) close();
  });
  host.narrow.addEventListener("change", () => {
    if (!host.narrow.matches && revealEl.checked) close();
  });
  if (host.closesOnScroll) {
    doc.addEventListener("scroll", () => {
      if (revealEl.checked) close();
    });
  }
}
