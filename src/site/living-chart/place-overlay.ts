// #53 story cards: the per-draw DOM layer of invisible hit-targets over the baked
// chart, positioned by manifest fractions (so they align at any width), feeding one
// reused parchment card. Hover / tap / Tab-focus a place to unfurl it. Split out of
// the old living-chart.ts at #191; the coupling with the chronicle scrubber (the card
// is suppressed while scrubbing, the scrubber drives the same hits) crosses the
// boundary as the injected `isSuppressed` predicate, wired by the engine's index.
// Card text is composed CLIENT-SIDE from the manifest (composePlaceCard), never
// createLoreWriter, whose order/rng-dependent prose would diverge from the gazetteer
// for the same town.
import { composePlaceCard, placeAriaLabel, cardSide } from "../../render/place-card.ts";
import type { PlaceManifest, PlaceMark } from "../../render/place-manifest.ts";
import type { HistoricalEvent } from "../../society/history.ts";

// Overlay state. Rebuilt every draw because the host's innerHTML swap wipes the chart
// mount's children. `pinned` keeps a tapped or Enter/Space card open (touch has no
// mouseleave); `currentIdx` is the place the card last previewed (moves on every
// hover/focus); `pinnedIdx` is the place a tap/Enter pinned. currentIdx and
// pinnedIdx MUST be distinct: a genuine click is always preceded by a preview of
// the same place, so keying the pin toggle off currentIdx would dismiss instead of
// switch when pinning B after A was pinned.
interface PlaceOverlayState {
  card: HTMLDivElement;
  places: ReadonlyArray<PlaceMark>;
  events: ReadonlyArray<HistoricalEvent>;
  presentYear: number;
  currentIdx: number;
  pinned: boolean;
  pinnedIdx: number;
}

/** The manifest slice the chronicle scrubber reads back through the engine's index. */
export interface OverlayData {
  places: ReadonlyArray<PlaceMark>;
  events: ReadonlyArray<HistoricalEvent>;
  presentYear: number;
}

interface OverlayBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface BuildPlaceOverlayOpts {
  preservePinByName?: boolean;
  box?: OverlayBox;
}

export interface PlaceOverlayDeps {
  /** The chart mount; the overlay and the card are appended as its children. */
  mapEl: HTMLElement;
  /** True while the chronicle scrubber owns the sheet: the hover card is suppressed. */
  isSuppressed: () => boolean;
}

export function createPlaceOverlay(deps: PlaceOverlayDeps) {
  const { mapEl, isSuppressed } = deps;

  let placeOverlay: PlaceOverlayState | null = null;

  function showPlaceCard(idx: number): void {
    if (!placeOverlay || isSuppressed()) return; // the hover card is suppressed while scrubbing
    const place = placeOverlay.places[idx];
    if (!place) return;
    const card = composePlaceCard(place, placeOverlay.events);
    const el = placeOverlay.card;
    const inner = el.querySelector(".pc-inner") as HTMLElement;
    // Rebuilt from textContent only (no innerHTML): the fields are plain strings.
    inner.replaceChildren();
    const name = document.createElement("strong");
    name.className = "pc-name";
    name.textContent = card.name;
    const rank = document.createElement("span");
    rank.className = "pc-rank";
    rank.textContent = card.rank;
    const founded = document.createElement("span");
    founded.className = "pc-founded";
    founded.textContent = card.foundedLine;
    inner.append(name, rank, founded);
    if (card.tale) {
      const tale = document.createElement("p");
      tale.className = "pc-tale";
      tale.textContent = card.tale;
      inner.append(tale);
    }
    el.style.left = `${place.nx * 100}%`;
    el.style.top = `${place.ny * 100}%`;
    const side = cardSide(place.nx, place.ny);
    el.classList.toggle("flip-h", side.h === "left");
    el.classList.toggle("flip-v", side.v === "above");
    // #128: a card pinned to THIS place plays the full unfurl grade; a hover/focus
    // preview (pinned false, or pinned to another place) runs the short grade.
    el.classList.toggle("pinned", placeOverlay.pinned && placeOverlay.pinnedIdx === idx);
    el.hidden = false;
    // Restart the unfurl cleanly at the current grade on every show. A CSS animation
    // would not otherwise replay while the card stays displayed across a content swap
    // (sweep or pin-from-preview), and a mid-flight grade change would leave a partial
    // roll; the none/reflow/restore reset guarantees a fresh roll every time. The short
    // hover grade keeps a fast sweep nimble.
    inner.style.animation = "none";
    void inner.offsetWidth;
    inner.style.animation = "";
    placeOverlay.currentIdx = idx;
  }

  function hidePlaceCard(): void {
    if (!placeOverlay) return;
    placeOverlay.pinned = false;
    placeOverlay.pinnedIdx = -1;
    placeOverlay.card.hidden = true;
  }

  // After each draw: lay invisible focusable hit-targets over the baked glyphs (the
  // chart exposes no per-feature ids) and feed one reused parchment card.
  // #169: opts.preservePinByName re-pins a currently-pinned card to the SAME-NAMED settlement
  // in the new manifest. A region redraft renumbers settlements (region worlds re-index), so a
  // pin kept by array index would jump to a different town or dangle; keying by name keeps the
  // card on the place the reader pinned. Default draws (a new world) pass nothing: no continuity.
  // #169: opts.box positions the overlay over a region INSET's rect (sheet fractions of the
  // mount) instead of the whole sheet, so a region manifest's own nx/ny fractions land on the
  // inset's drawn glyphs. The card moved inside the overlay for the same reason: its % anchor
  // must resolve against the same box the fractions describe (the full sheet when box is
  // absent, so world overlays are unchanged).
  function buildPlaceOverlay(manifest: PlaceManifest, opts?: BuildPlaceOverlayOpts): void {
    if (!manifest || !manifest.places) return;
    const preserveName =
      opts && opts.preservePinByName && placeOverlay && placeOverlay.pinned && placeOverlay.pinnedIdx >= 0
        ? ((placeOverlay.places[placeOverlay.pinnedIdx] || {}) as Partial<PlaceMark>).name
        : null;
    // An inset commit rebuilds the overlay with no mount wipe before it (unlike a draw), so
    // this builder owns removing the previous overlay + card. A no-op after a wipe.
    for (const stale of mapEl.querySelectorAll(":scope > .place-overlay, :scope > #place-card")) stale.remove();
    const overlay = document.createElement("div");
    overlay.className = "place-overlay";
    if (opts && opts.box) {
      const b = opts.box;
      overlay.style.left = `${b.x * 100}%`;
      overlay.style.top = `${b.y * 100}%`;
      overlay.style.width = `${b.w * 100}%`;
      overlay.style.height = `${b.h * 100}%`;
      overlay.style.right = "auto"; // the stylesheet's inset:0 would otherwise fight width/height
      overlay.style.bottom = "auto";
    }
    const card = document.createElement("div");
    card.id = "place-card";
    // role=tooltip + aria-describedby (set per hit below) is the robust path: it
    // reads the card as the focused hit's description. No aria-live, which on a
    // populate-while-hidden region announces unreliably and would double up.
    card.setAttribute("role", "tooltip");
    card.hidden = true;
    // #128: the paper sheet is a persistent inner wrapper. Content is swapped into it
    // per place, but the element is stable, so the unfurl animation replays only on a
    // real unhide (display:none -> block on the card), not on a content swap.
    const inner = document.createElement("div");
    inner.className = "pc-inner";
    card.appendChild(inner);
    placeOverlay = { card, places: manifest.places, events: manifest.events, presentYear: manifest.presentYear, currentIdx: -1, pinned: false, pinnedIdx: -1 };
    manifest.places.forEach((place, idx) => {
      const hit = document.createElement("button");
      hit.type = "button";
      hit.className = "place-hit";
      hit.dataset.idx = String(idx);
      hit.setAttribute("aria-label", placeAriaLabel(place));
      hit.setAttribute("aria-describedby", "place-card");
      hit.style.left = `${place.nx * 100}%`;
      hit.style.top = `${place.ny * 100}%`;
      // Hover / keyboard focus previews the card; the preview can move the open
      // card between places, and the pin only governs whether leaving dismisses it.
      hit.addEventListener("mouseenter", () => showPlaceCard(idx));
      hit.addEventListener("focus", () => showPlaceCard(idx));
      hit.addEventListener("mouseleave", () => { if (!placeOverlay!.pinned) placeOverlay!.card.hidden = true; });
      hit.addEventListener("blur", () => { if (!placeOverlay!.pinned) placeOverlay!.card.hidden = true; });
      // Tap / Enter / Space all fire a button click: pin the card open, or switch
      // the pin to this place. Activating the already-pinned place toggles it off.
      hit.addEventListener("click", () => {
        if (placeOverlay!.pinned && placeOverlay!.pinnedIdx === idx) { hidePlaceCard(); return; }
        placeOverlay!.pinned = true;
        placeOverlay!.pinnedIdx = idx;
        showPlaceCard(idx);
      });
      overlay.appendChild(hit);
    });
    overlay.appendChild(card); // inside the overlay so its % anchor shares the overlay's box
    mapEl.appendChild(overlay);
    // #169: restore a pinned card onto the same-named settlement if it survived into the new
    // sheet; if the place is off the new window, leave the card dismissed.
    if (preserveName != null) {
      const idx = manifest.places.findIndex((p) => p.name === preserveName);
      if (idx >= 0) {
        placeOverlay.pinned = true;
        placeOverlay.pinnedIdx = idx;
        showPlaceCard(idx);
      }
    }
  }

  // Document-level dismiss, wired once by the host: Escape or a click/tap off any mark
  // closes a pinned card. A click on a hit or the card itself is ignored here (the
  // hit's own handler owns pinning).
  function onDocKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape" && placeOverlay && !placeOverlay.card.hidden) hidePlaceCard();
  }

  function onDocClick(e: MouseEvent): void {
    if (!placeOverlay || placeOverlay.card.hidden) return;
    const t = e.target as Element | null;
    if (t && t.closest && (t.closest(".place-hit") || t.closest("#place-card"))) return;
    hidePlaceCard();
  }

  /** The current manifest slice, for the chronicle scrubber; null before the first build. */
  function data(): OverlayData | null {
    if (!placeOverlay) return null;
    return { places: placeOverlay.places, events: placeOverlay.events, presentYear: placeOverlay.presentYear };
  }

  /** Full removal for an unmounting host: drop the overlay nodes and the state. */
  function teardown(): void {
    for (const stale of mapEl.querySelectorAll(":scope > .place-overlay, :scope > #place-card")) stale.remove();
    placeOverlay = null;
  }

  return { buildPlaceOverlay, onDocKeydown, onDocClick, hideCard: hidePlaceCard, data, teardown };
}

export type PlaceOverlay = ReturnType<typeof createPlaceOverlay>;
