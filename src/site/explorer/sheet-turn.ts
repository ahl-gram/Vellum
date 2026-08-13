// #131 the style turn: a style change turns the sheet over and the SAME world lands
// re-dressed in the new style; a new world (seed, type, climate) SETTLES per #127. Two
// faces on one bound leaf: the front is the live #map, the back is the incoming chart as
// a blob-url <img>, so #map never holds a second <svg> and the "exactly one #map svg"
// invariant holds structurally through the turn. The 3D context is INERT at rest (idle
// byte-parity between turns); shouldTurn stays pure and unit-testable under Node.

export interface TurnDecision {
  /** This draw was triggered by a style change (the only turn trigger in v1). */
  isTurn: boolean;
  /** prefers-reduced-motion is on (fall back to an instant swap). */
  reduceMotion: boolean;
  /** The off-thread render worker is live (the fallback path swaps instantly). */
  usesWorker: boolean;
  /** A chart is already on screen to turn away from. */
  hasChart: boolean;
  /** #116: the sheet is flipped to its verso (the flip owns the sheet, not the turn). */
  flipped?: boolean;
}
// #321 deleted the `chronicle` member (resolving #153). Do not re-add a suppression term without a state that genuinely cannot ride a turn; the sheet-turn unit test pins that a stale chronicle:true no longer suppresses.

/** A style change over a live chart turns; everything else settles, and a flipped sheet rebuilds the verso in place instead (the turn and the flip both drive #sheet-inner's rotateY, so they must never both own it). */
export function shouldTurn(s: TurnDecision): boolean {
  return !!(s.isTurn && !s.reduceMotion && s.usesWorker && s.hasChart && !s.flipped);
}

// #131: duration + easing from /motion.css (the single timing source), read lazily so the stylesheet is applied, with the ratified fallback if a custom property is unreadable.
export function turnTiming(): { ms: number; ease: string } {
  const cs = getComputedStyle(document.documentElement);
  const ms = parseFloat(cs.getPropertyValue("--turn")) || 900;
  const ease = cs.getPropertyValue("--ease-turn").trim() || "cubic-bezier(0.62, 0, 0.34, 1)";
  return { ms, ease };
}

// The single in-flight turn, or null. runTurn cancels any prior turn and every draw resolution cancels a leftover before touching #map, so a superseded turn can never orphan a sheet.
let active: { abort: () => void } | null = null;

/** Tear down any in-flight turn WITHOUT committing its content (the superseding draw owns the final #map). Idempotent and safe when nothing is turning. */
export function cancelTurn(): void {
  if (active) active.abort();
  active = null;
}

/** Turn the sheet, re-dressing #map when the leaf lands. Resolves ONLY on a real landing (the caller then rebuilds the overlay); a superseding cancelTurn() aborts it and the promise stays pending forever. It NEVER rejects: an unbuildable 3D scaffold degrades to an instant swap and resolves, so the caller needs no .catch. */
export function runTurn(
  { sheetEl, innerEl, mapEl, newSvg, durationMs, easing }:
  { sheetEl: HTMLElement; innerEl: HTMLElement; mapEl: HTMLElement; newSvg: string; durationMs: number; easing: string },
): Promise<void> {
  cancelTurn(); // never stack turns
  return new Promise<void>((resolve) => {
    let blobUrl = "";
    let back: HTMLDivElement | null = null;
    try {
      // The incoming chart as a blob <img>, pre-rotated so it reads un-mirrored at -180deg; kept out of the a11y tree (the recto is the chart).
      blobUrl = URL.createObjectURL(new Blob([newSvg], { type: "image/svg+xml" }));
      back = document.createElement("div");
      back.className = "sheet-back";
      back.setAttribute("aria-hidden", "true");
      const img = document.createElement("img");
      img.alt = "";
      img.src = blobUrl;
      back.appendChild(img);
      innerEl.appendChild(back);

      sheetEl.classList.add("turning"); // light the perspective + preserve-3d for the turn
      innerEl.classList.add("turning");

      const anim = innerEl.animate(
        [{ transform: "rotateY(0deg)" }, { transform: "rotateY(-180deg)" }],
        { duration: durationMs, easing, fill: "forwards" },
      );

      let settled = false;
      // When committing, the new chart is written into #map FIRST, in the same synchronous tick, so the reader never sees a frame between the back face and the re-dressed recto.
      const finish = (commit: boolean): void => {
        if (settled) return;
        settled = true;
        if (commit) mapEl.innerHTML = newSvg;
        try { anim.cancel(); } catch {} // drop the forwards-fill; leaf returns to rotateY(0)
        sheetEl.classList.remove("turning");
        innerEl.classList.remove("turning");
        innerEl.style.transform = "";
        if (back && back.parentNode) back.remove();
        URL.revokeObjectURL(blobUrl);
        active = null;
        if (commit) resolve();
      };

      // A natural landing commits; a cancel rejects anim.finished, swallowed (expected teardown, not an error).
      anim.finished.then(() => finish(true)).catch(() => {});
      active = { abort: () => finish(false) };
    } catch {
      // Setup failed: undo any partial scaffold and fall back to an instant swap, so the chart still updates and the caller still rebuilds the overlay.
      try { sheetEl.classList.remove("turning"); innerEl.classList.remove("turning"); } catch {}
      if (back && back.parentNode) back.remove();
      if (blobUrl) { try { URL.revokeObjectURL(blobUrl); } catch {} }
      active = null;
      mapEl.innerHTML = newSvg;
      resolve();
    }
  });
}
