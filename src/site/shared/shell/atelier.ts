// The chart of the atelier's fold opens and shuts natively; this adds what a disclosure lacks: Escape, a click elsewhere, focus leaving it and leaving the page shut it (Issue #671).
export function bindAtelier(doc: Document): void {
  const fold = doc.querySelector<HTMLDetailsElement>("details.atelier-fold");
  if (fold === null) return;
  const inside = (node: EventTarget | null): boolean => node instanceof Node && fold.contains(node);
  doc.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !fold.open) return;
    const held = inside(doc.activeElement);
    fold.open = false;
    if (held) fold.querySelector("summary")?.focus();
  });
  doc.addEventListener("click", (e) => {
    if (fold.open && !inside(e.target)) fold.open = false;
  });
  fold.addEventListener("focusout", (e) => {
    if (fold.open && e.relatedTarget instanceof Node && !fold.contains(e.relatedTarget)) fold.open = false;
  });
  doc.defaultView?.addEventListener("pagehide", () => {
    fold.open = false;
  });
}
