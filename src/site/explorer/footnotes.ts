// #270 The Broadside's footnote apparatus: a period mark (an <a class="fn"> in the
// Fell set) on each opaque control opens a marginalia note and follows through to
// the term's /glossary/ anchor, so the tooltip system IS the book's apparatus
// (footnote -> back matter), not a parallel one. The note is real text in the DOM
// (never a title attribute), shown through the native popover API so Esc and
// light dismiss come free, and wired aria-describedby -> role="tooltip" in the
// markup. On fine pointers hover/focus shows the note and a click follows the
// link; on touch (no hover) the first tap TOGGLES the note instead of navigating
// (the ratified tap-toggle) and the note's own glossary link carries the travel.
interface NotePair {
  mark: HTMLAnchorElement;
  note: HTMLElement;
}

function pairs(): NotePair[] {
  const out: NotePair[] = [];
  for (const mark of document.querySelectorAll<HTMLAnchorElement>("a.fn[data-note]")) {
    const note = document.getElementById(mark.dataset["note"] || "");
    if (note) out.push({ mark, note });
  }
  return out;
}

// Anchor the note under its mark at show time: the note lives in the top layer as
// a fixed-position box, and static CSS cannot place a top-layer box relative to
// an in-flow anchor. Clamped to the viewport so a mark near an edge never pushes
// its note off-screen.
function place(mark: HTMLElement, note: HTMLElement): void {
  const r = mark.getBoundingClientRect();
  const half = note.offsetWidth / 2;
  const x = Math.min(Math.max(r.left + r.width / 2, half + 8), window.innerWidth - half - 8);
  note.style.left = `${Math.round(x - half)}px`;
  note.style.top = `${Math.round(r.bottom + 8)}px`;
}

export function wireFootnotes(): void {
  // A pre-popover engine keeps working marks: they stay plain glossary links.
  if (!("showPopover" in HTMLElement.prototype)) return;
  for (const { mark, note } of pairs()) {
    const show = (): void => {
      if (note.matches(":popover-open")) return;
      note.showPopover();
      place(mark, note);
    };
    const hide = (): void => {
      if (note.matches(":popover-open")) note.hidePopover();
    };
    mark.addEventListener("mouseenter", show);
    mark.addEventListener("mouseleave", hide);
    mark.addEventListener("focus", show);
    mark.addEventListener("blur", hide);
    mark.addEventListener("click", (e) => {
      // Queried at click time, not captured at wire time, so a device-mode flip
      // (or the e2e's emulation) is honored without a reload.
      if (!window.matchMedia("(hover: none)").matches) return; // fine pointer: the click follows the link
      e.preventDefault();
      if (note.matches(":popover-open")) hide();
      else show();
    });
  }
}
