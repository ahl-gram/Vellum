// The style turn: a style change turns the sheet over and the SAME world lands re-dressed; the back face is the incoming chart as a blob-url <img>, so #map never holds a second <svg>, and the 3D context is inert at rest.

export interface TurnDecision {
  isTurn: boolean;
  reduceMotion: boolean;
  usesWorker: boolean;
  hasChart: boolean;
  flipped?: boolean;
}

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

let active: { abort: () => void } | null = null;

export function cancelTurn(): void {
  if (active) active.abort();
  active = null;
}

/** Turn the sheet, re-dressing #map when the leaf lands. Resolves ONLY on a real landing (the caller then rebuilds the overlay); a superseding cancelTurn() aborts it and the promise stays pending forever. It NEVER rejects: an unbuildable 3D scaffold degrades to an instant swap and resolves, so the caller needs no .catch. */
export function runTurn(
  { sheetEl, innerEl, mapEl, newSvg, durationMs, easing }:
  { sheetEl: HTMLElement; innerEl: HTMLElement; mapEl: HTMLElement; newSvg: string; durationMs: number; easing: string },
): Promise<void> {
  cancelTurn();
  return new Promise<void>((resolve) => {
    let blobUrl = "";
    let back: HTMLDivElement | null = null;
    try {
      blobUrl = URL.createObjectURL(new Blob([newSvg], { type: "image/svg+xml" }));
      back = document.createElement("div");
      back.className = "sheet-back";
      back.setAttribute("aria-hidden", "true");
      const img = document.createElement("img");
      img.alt = "";
      img.src = blobUrl;
      back.appendChild(img);
      innerEl.appendChild(back);

      sheetEl.classList.add("turning");
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
