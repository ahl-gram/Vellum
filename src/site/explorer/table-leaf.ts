// The Chart Table on a phone (#540 Sub 2a of #401, #518 ruling 4): the table is the sheet's SECOND LEAF, not a drawer.
// Two tabs in the sheet's head choose which leaf the sheet is open to, and the gathered sheets lie on the sheet's own
// parchment rather than on the drawer's walnut. Ruled 2026-09-08 against rendered variants: the fold #543 gave the
// desktop stays desktop-only, because at narrow the two are already mutually exclusive by being leaves of one sheet.
// The docking follows dockLegend's precedent in ../shared/room.ts: one set of elements, moved between two homes.

export interface LeafSeatable {
  readonly parentElement: object | null;
}

export type LeafSeat = "drawer" | "leaf";

/** Narrow means the leaf; wide means the drawer. The table has no third home, so this is the whole rule. */
export function leafSeat(at: { narrow: boolean }): LeafSeat {
  return at.narrow ? "leaf" : "drawer";
}

/** "The Table" bare, and with the tally once there is one, so the tab reads as the still does ("The Table · 3"). */
export function leafTabLine(count: number): string {
  return count > 0 ? `The Table · ${count}` : "The Table";
}

interface Home {
  readonly parent: Node;
  readonly before: Node | null;
}

export interface TableLeafDeps {
  readonly leaf: HTMLElement;
  readonly cuttings: HTMLElement;
  readonly count: HTMLElement;
  readonly broadsideTab: HTMLButtonElement;
  readonly tableTab: HTMLButtonElement;
  readonly slip: HTMLElement;
  readonly narrow: { matches: boolean; addEventListener: (t: string, fn: () => void) => void };
  readonly onLayout: () => void;
}

export function bindTableLeaf(deps: TableLeafDeps): { readonly relabel: (count: number) => void } {
  const homes = new Map<HTMLElement, Home>();
  for (const el of [deps.cuttings, deps.count]) {
    if (el.parentNode) homes.set(el, { parent: el.parentNode, before: el.nextSibling });
  }

  const seat = (where: LeafSeat): void => {
    for (const el of [deps.cuttings, deps.count]) {
      const home = homes.get(el);
      if (!home) continue;
      const want = where === "leaf" ? deps.leaf : home.parent;
      if (el.parentNode === want) continue;
      if (where === "leaf") deps.leaf.appendChild(el);
      else home.parent.insertBefore(el, home.before);
    }
  };

  const turn = (to: LeafSeat | "form"): void => {
    const table = to === "leaf";
    document.body.classList.toggle("leaf-table", table);
    deps.tableTab.setAttribute("aria-selected", String(table));
    deps.broadsideTab.setAttribute("aria-selected", String(!table));
    // A tab press is a request to read that leaf, so it opens the sheet if the reader had it shut.
    if (!deps.slip.classList.contains("open")) {
      deps.slip.classList.add("open");
      deps.slip.querySelector(".slip-handle")?.setAttribute("aria-expanded", "true");
    }
    deps.onLayout();
  };

  deps.tableTab.addEventListener("click", () => turn("leaf"));
  deps.broadsideTab.addEventListener("click", () => turn("form"));

  const apply = (): void => {
    seat(leafSeat({ narrow: deps.narrow.matches }));
    // Off the phone the sheet only ever shows the form: the drawer is the table's home there.
    if (!deps.narrow.matches) document.body.classList.remove("leaf-table");
  };
  deps.narrow.addEventListener("change", apply);
  apply();

  return { relabel: (count) => { deps.tableTab.textContent = leafTabLine(count); } };
}
