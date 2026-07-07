// #131 The style turn (epic #125, the Paper & Ink motion doctrine, Sub 6).
// Changing the STYLE in the Explorer turns the sheet over: the outgoing chart
// turns away on a slow 3D page-turn and the SAME world lands re-dressed in the new
// style, instead of hard-popping. The semantic rule: the same world in a new dress
// TURNS; a new world (seed, type, climate) SETTLES per #127. Style is the only turn
// trigger in v1.
//
// Two faces on one bound leaf: the front is the live #map (the outgoing chart), the
// back is the incoming chart as a blob-url <img> (the atlas-view.js pattern) so
// #map itself never holds a second <svg> and the "exactly one #map svg" invariant
// holds structurally through the turn. The leaf (#sheet-inner) rotates 0 -> -180deg
// under a perspective lit only while .turning is set (idle parity between turns);
// at -180 the back face faces the reader un-mirrored, then #map is re-dressed in one
// synchronous tick and the scaffold is torn down.
//
// The 3D context is INERT at rest, so the chart, the place overlay, and the pinned
// card behave byte-for-byte as before between turns (verified by the #131 CDP spike).
// This establishes the perspective wrapper the Verso (#116) reuses.
//
// Kept free of top-level DOM/globals so shouldTurn (the pure semantic gate) is
// unit-testable under Node; runTurn/cancelTurn touch the DOM only inside their
// bodies and are proven by the e2e end-states + a CDP probe.

/**
 * Whether this draw should turn the sheet rather than settle. A style change over a
 * live chart turns; everything else (a new world, reduced motion, the worker
 * fallback, the first draw, or scrub mode) takes today's instant/settle path.
 * A style change while the sheet is flipped to its verso (#116) rebuilds the verso
 * in place instead of turning: the turn and the flip both drive #sheet-inner's
 * rotateY, so they must never both own it.
 * @param {{isTurn:boolean, reduceMotion:boolean, usesWorker:boolean, hasChart:boolean, chronicle:boolean, flipped?:boolean}} s
 * @returns {boolean}
 */
export function shouldTurn(s) {
  return !!(s.isTurn && !s.reduceMotion && s.usesWorker && s.hasChart && !s.chronicle && !s.flipped);
}

// The single in-flight turn, or null. One turn at a time: runTurn cancels any prior
// turn before starting, and every draw resolution cancels a leftover turn before it
// touches #map, so a superseded turn can never orphan a sheet.
let active = null;

/**
 * Tear down any in-flight turn WITHOUT committing its content (the superseding draw
 * owns the final #map). Idempotent and safe to call when nothing is turning.
 */
export function cancelTurn() {
  if (active) active.abort();
  active = null;
}

/**
 * Turn the sheet: build the incoming chart as a back face, rotate the leaf over, and
 * re-dress #map with the new chart when it lands. Resolves ONLY on a real landing
 * (so the caller rebuilds the overlay against the new chart); a superseding
 * cancelTurn() aborts it and the promise never resolves. It never rejects.
 *
 * @param {{sheetEl:HTMLElement, innerEl:HTMLElement, mapEl:HTMLElement, newSvg:string, durationMs:number, easing:string}} o
 * @returns {Promise<void>}
 */
export function runTurn({ sheetEl, innerEl, mapEl, newSvg, durationMs, easing }) {
  cancelTurn(); // never stack turns
  // Contract: this NEVER rejects. It resolves when the turn lands (so the caller
  // rebuilds the overlay); a superseding cancelTurn() aborts it and it stays pending;
  // and if the 3D scaffold cannot be built (e.g. WAAPI is unavailable) it degrades to
  // an instant swap and resolves. So the caller needs no .catch.
  return new Promise((resolve) => {
    let blobUrl = "";
    let back = null;
    try {
      // Back face: the incoming chart as a blob <img>, pre-rotated so it reads
      // un-mirrored at -180deg. Kept out of the a11y tree (the recto is the chart).
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
      // Tear down the 3D scaffold and restore the flat leaf. When committing (a real
      // landing) the new chart is written into #map FIRST, in the same synchronous
      // tick, so the reader never sees a frame between the back face and the re-dressed
      // recto (both show the identical new chart).
      const finish = (commit) => {
        if (settled) return;
        settled = true;
        if (commit) mapEl.innerHTML = newSvg;
        try { anim.cancel(); } catch {} // drop the forwards-fill; leaf returns to rotateY(0)
        sheetEl.classList.remove("turning");
        innerEl.classList.remove("turning");
        innerEl.style.transform = "";
        if (back.parentNode) back.remove();
        URL.revokeObjectURL(blobUrl);
        active = null;
        if (commit) resolve();
      };

      // A natural landing commits; a cancel rejects this promise, which we swallow (the
      // AbortError is expected teardown, not an error) so it never reaches the console.
      anim.finished.then(() => finish(true)).catch(() => {});
      active = { abort: () => finish(false) };
    } catch {
      // Setup failed: undo any partial scaffold and fall back to an instant swap, so
      // the chart still updates and the caller still rebuilds the overlay.
      try { sheetEl.classList.remove("turning"); innerEl.classList.remove("turning"); } catch {}
      if (back && back.parentNode) back.remove();
      if (blobUrl) { try { URL.revokeObjectURL(blobUrl); } catch {} }
      active = null;
      mapEl.innerHTML = newSvg;
      resolve();
    }
  });
}
