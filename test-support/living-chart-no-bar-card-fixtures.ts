// Issue #522 Sub 4: the card's SECOND action, injected on the same terms as the prospect link.
// The shim's querySelector answers null by design, so showing a card needs the .pc-inner stub place-card-clamp.test.ts already uses.
export const armShow = async (mount: { children: unknown[] }) => {
  const { walk } = await import("./element-shim.ts");
  const overlay = (mount.children as ReturnType<typeof walk>).find((c) => c.classList.contains("place-overlay"))!;
  const card = walk(overlay).find((n) => n.getAttribute("id") === "place-card")!;
  const inner = walk(card).find((n) => n.classList.contains("pc-inner"))!;
  card.querySelector = ((sel: string) => (sel === ".pc-inner" ? inner : null)) as typeof card.querySelector;
  const hits = walk(overlay).filter((n) => n.classList.contains("place-hit"));
  return {
    hits,
    show: (at: number) => {
      hits[at]!.fire("focus");
    },
    press: () => walk(overlay).find((n) => n.classList.contains("pc-lay"))!,
  };
};

export const layHost = (over: { refuses?: boolean } = {}) => {
  const laid: number[] = [];
  return {
    laid,
    dep: {
      state: (idx: number) => ({
        label: over.refuses ? "No room on the table" : `lay ${idx}`,
        refuses: !!over.refuses,
      }),
      lay: (idx: number) => {
        laid.push(idx);
      },
    },
  };
};
