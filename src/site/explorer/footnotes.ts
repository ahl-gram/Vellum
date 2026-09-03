// #270 the Broadside's footnote apparatus: a period mark (<a class="fn">) on each opaque
// control opens a marginalia note and follows through to the term's /glossary/ anchor.
// The note is real DOM text shown through the native popover API (Esc and light dismiss
// come free), wired aria-describedby -> role="tooltip" in the markup. Fine pointers get
// hover/focus + click-through; touch gets the ratified tap-toggle instead of navigation.
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

// Anchor the note under its mark at show time: the note lives in the top layer as a fixed-position box, and static CSS cannot place a top-layer box relative to an in-flow anchor. It clears the whole control ROW, not just the mark's line (the neighboring control may be taller), clamped to the viewport so an edge mark never pushes its note off-screen.
function place(mark: HTMLElement, note: HTMLElement): void {
  const r = mark.getBoundingClientRect();
  // A ledger row is the label cell plus every sibling up to the next label cell; elsewhere the mark's own container is the row.
  const cell = mark.closest(".l-label");
  let rowBottom = r.bottom;
  if (cell) {
    for (let el = cell.nextElementSibling; el && !el.classList.contains("l-label"); el = el.nextElementSibling) {
      rowBottom = Math.max(rowBottom, el.getBoundingClientRect().bottom);
    }
  } else if (mark.parentElement) {
    rowBottom = Math.max(rowBottom, mark.parentElement.getBoundingClientRect().bottom);
  }
  const half = note.offsetWidth / 2;
  const x = Math.min(Math.max(r.left + r.width / 2, half + 8), window.innerWidth - half - 8);
  note.style.left = `${Math.round(x - half)}px`;
  note.style.top = `${Math.round(rowBottom + 8)}px`;
}

export function wireFootnotes(): void {
  // A pre-popover engine keeps working marks: they stay plain glossary links.
  if (!("showPopover" in HTMLElement.prototype)) return;
  // Touch-primary means hover:none AND pointer:coarse: a bare (hover: none) over-matches environments with NO pointer at all (linux headless CI reports hover:none with pointer:none), muting the focus path exactly where a keyboard user needs it (e2e BR4/BR5; the Glass's keys slip hit the same trap before it retired at #505).
  // Queried at event time, not captured at wire time, so a device-mode flip (or the e2e's emulation) is honored without a reload.
  const touchPrimary = (): boolean => window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  for (const { mark, note } of pairs()) {
    const show = (): void => {
      if (note.matches(":popover-open")) return;
      note.showPopover();
      place(mark, note);
    };
    const hide = (): void => {
      if (note.matches(":popover-open")) note.hidePopover();
    };
    // A tap fires the compat mouseenter and focus BEFORE its click, so on a touch-primary device these must stand down or the click's toggle inverts (e2e BR6's real taps).
    mark.addEventListener("mouseenter", () => { if (!touchPrimary()) show(); });
    mark.addEventListener("mouseleave", () => { if (!touchPrimary()) hide(); });
    mark.addEventListener("focus", () => { if (!touchPrimary()) show(); });
    mark.addEventListener("blur", () => { if (!touchPrimary()) hide(); });
    // The closing half of a tap never reaches the click handler as "open": the tap's own pointer-down light-dismisses an auto popover first. Record that close SYNCHRONOUSLY (beforetoggle; the toggle event is queued async and lands after the click), so a click on its heels reads as the close it was, instead of re-showing.
    let closedAt = 0;
    note.addEventListener("beforetoggle", (ev) => {
      if ((ev as ToggleEvent).newState === "closed") closedAt = performance.now();
    });
    mark.addEventListener("click", (e) => {
      if (!touchPrimary()) return; // not touch-primary: the click follows the link
      e.preventDefault();
      if (note.matches(":popover-open")) hide();
      else if (performance.now() - closedAt > 400) show();
    });
  }
}
