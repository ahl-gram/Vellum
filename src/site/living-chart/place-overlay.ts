// The story cards: a per-draw layer of invisible hit-targets over the baked chart feeding one reused parchment card. Card text is composed client-side from the manifest (composePlaceCard), never createLoreWriter, whose order-dependent prose would diverge from the gazetteer for the same town.
import { composePlaceCard, placeAriaLabel, cardSide, clampOffset, type CardBox, type PlaceCard } from "../../render/place-card.ts";
import type { PlaceManifest, PlaceMark } from "../../render/place-manifest.ts";
import type { HistoricalEvent } from "../../society/history.ts";

interface PlaceOverlayState {
  card: HTMLDivElement;
  places: ReadonlyArray<PlaceMark>;
  events: ReadonlyArray<HistoricalEvent>;
  cultureId: string;
  presentYear: number;
  currentIdx: number;
  pinned: boolean;
  pinnedIdx: number;
  prospectLink: HTMLAnchorElement | null;
  acts: HTMLElement | null;
  layPress: HTMLButtonElement | null;
}

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

/** The card's second action, injected the way `prospectHref` is. */
export interface LayProspectHost {
  state: (idx: number) => { label: string; refuses: boolean };
  lay: (idx: number) => void;
}

export interface PlaceOverlayDeps {
  mapEl: HTMLElement;
  isSuppressed: () => boolean;
  prospectHref?: (idx: number) => string;
  layProspect?: LayProspectHost;
  clampBox?: () => CardBox | null;
}

function makeLayPress(host: LayProspectHost): HTMLButtonElement {
  const press = document.createElement("button");
  press.type = "button";
  press.className = "pc-lay";
  for (const ev of ["mousedown", "dblclick", "wheel", "touchstart"]) {
    press.addEventListener(ev, (e) => e.stopPropagation());
  }
  press.addEventListener("click", () => {
    const at = Number(press.dataset["idx"]);
    if (Number.isInteger(at) && at >= 0) host.lay(at);
  });
  return press;
}

export function createPlaceOverlay(deps: PlaceOverlayDeps) {
  const { mapEl, isSuppressed, prospectHref, layProspect, clampBox } = deps;

  let placeOverlay: PlaceOverlayState | null = null;

  function fillCardInner(inner: HTMLElement, card: PlaceCard, place: PlaceMark): void {
    inner.replaceChildren();
    // The scroll offset is the CONTAINER's, not the content's, so replacing the children leaves it where the last card was read to and the browser only clamps it to the new content: a card switched to from a scrolled one opened with its own name above the fold, measured at scrollTop 29 of a 29px tail.
    inner.scrollTop = 0;
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
    if (card.formerLine) {
      const former = document.createElement("span");
      former.className = "pc-former";
      former.textContent = card.formerLine;
      inner.append(former);
    }
    const acts = placeOverlay!.acts;
    if (acts) {
      if (placeOverlay!.prospectLink) {
        placeOverlay!.prospectLink.href = prospectHref!(place.idx);
        acts.append(placeOverlay!.prospectLink);
      }
      if (placeOverlay!.layPress) acts.append(placeOverlay!.layPress);
      paintLay(place.idx);
      inner.append(acts);
    }
    if (card.tale) {
      const tale = document.createElement("p");
      tale.className = "pc-tale";
      tale.textContent = card.tale;
      inner.append(tale);
    }
    const tongue = document.createElement("p");
    tongue.className = "pc-tongue";
    tongue.textContent = card.tongueLine;
    const derivation = document.createElement("p");
    derivation.className = "pc-roots";
    derivation.textContent = card.derivationLine;
    inner.append(tongue, derivation);
  }

  function showPlaceCard(idx: number): void {
    if (!placeOverlay || isSuppressed()) return; // the hover card is suppressed while scrubbing
    const place = placeOverlay.places[idx];
    if (!place) return;
    const card = composePlaceCard(place, placeOverlay.events, placeOverlay.cultureId);
    const el = placeOverlay.card;
    const inner = el.querySelector(".pc-inner") as HTMLElement;
    fillCardInner(inner, card, place);
    el.style.setProperty("--pc-nx", String(place.nx));
    el.style.setProperty("--pc-ny", String(place.ny));
    const side = cardSide(place.nx, place.ny);
    el.classList.toggle("flip-h", side.h === "left");
    el.classList.toggle("flip-v", side.v === "above");
    el.classList.toggle("pinned", placeOverlay.pinned && placeOverlay.pinnedIdx === idx);
    el.hidden = false;
    // The none/reflow/restore reset replays the unfurl at the current grade on every show: a CSS animation does not replay while the card stays displayed across a content swap, and a mid-flight grade change would leave a partial roll.
    inner.style.animation = "none";
    void inner.offsetWidth;
    inner.style.animation = "";
    clampIntoView(el);
    placeOverlay.currentIdx = idx;
  }

  function reclampCard(): void {
    if (!placeOverlay || placeOverlay.card.hidden) return;
    clampIntoView(placeOverlay.card);
  }

  function paintLay(idx: number): void {
    const press = placeOverlay && placeOverlay.layPress;
    if (!press || !layProspect || idx < 0) return;
    const face = layProspect.state(idx);
    press.textContent = face.label;
    press.dataset["idx"] = String(idx);
    press.classList.toggle("dim", face.refuses);
  }

  function relabelLay(): void {
    if (placeOverlay) paintLay(placeOverlay.currentIdx);
  }

  function markMore(el: HTMLElement, inner: HTMLElement): void {
    el.classList.toggle("pc-scrolls", inner.scrollHeight - inner.clientHeight > 1);
    el.classList.toggle("pc-more", inner.scrollHeight - inner.scrollTop - inner.clientHeight > 1);
  }

  function clampIntoView(el: HTMLElement): void {
    if (!clampBox) return;
    el.style.setProperty("--pc-dx", "0px");
    el.style.setProperty("--pc-dy", "0px");
    const box = clampBox();
    if (!box) return;
    el.style.setProperty("--pc-maxh", `${box.bottom - box.top}px`);
    const { dx, dy } = clampOffset(el.getBoundingClientRect(), box);
    el.style.setProperty("--pc-dx", `${dx}px`);
    el.style.setProperty("--pc-dy", `${dy}px`);
    const inner = el.querySelector(".pc-inner");
    if (inner) markMore(el, inner as HTMLElement);
  }

  function hidePlaceCard(): void {
    if (!placeOverlay) return;
    placeOverlay.pinned = false;
    placeOverlay.pinnedIdx = -1;
    placeOverlay.card.hidden = true;
  }

  // opts.box positions the overlay over a region inset's rect so the region manifest's own nx/ny fractions land on the inset's drawn glyphs; the card lives inside the overlay so its % anchor resolves against the same box.
  function buildPlaceOverlay(manifest: PlaceManifest, opts?: BuildPlaceOverlayOpts): void {
    if (!manifest || !manifest.places) return;
    const preserveName =
      opts && opts.preservePinByName && placeOverlay && placeOverlay.pinned && placeOverlay.pinnedIdx >= 0
        ? ((placeOverlay.places[placeOverlay.pinnedIdx] || {}) as Partial<PlaceMark>).name
        : null;
    // An inset commit rebuilds the overlay with no mount wipe before it (unlike a draw), so this builder owns removing the previous overlay + card; a no-op after a wipe.
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
    card.setAttribute("role", "tooltip");
    card.hidden = true;
    const inner = document.createElement("div");
    inner.className = "pc-inner";
    // #633: d3-zoom is bound on the host's viewport, an ANCESTOR of the card carrying touch-action: none, so without this a drag or a wheel over the card reaches the camera and the card never scrolls; measured with a CDP touch pan, which cannot see a touch-action line at all and still read scrollTop 0 to 0. Whether a real thumb scrolls it is UNVERIFIABLE in this harness.
    for (const ev of ["touchstart", "touchmove", "wheel"]) inner.addEventListener(ev, (e) => { if (inner.scrollHeight - inner.clientHeight > 1) e.stopPropagation(); }, { passive: true });
    inner.addEventListener("scroll", () => markMore(card, inner), { passive: true });
    card.appendChild(inner);
    // Both card actions are world-sheet only: a region manifest renumbers its places (#242), so an inset's index names a different settlement.
    const onWorldSheet = !(opts && opts.box);
    let prospectLink: HTMLAnchorElement | null = null;
    if (prospectHref && onWorldSheet) {
      prospectLink = document.createElement("a");
      prospectLink.className = "pc-prospect";
      prospectLink.textContent = "View the prospect";
    }
    const layPress = layProspect && onWorldSheet ? makeLayPress(layProspect) : null;
    const acts = prospectLink || layPress ? document.createElement("div") : null;
    if (acts) {
      acts.className = "pc-acts";
      if (prospectLink) acts.appendChild(prospectLink);
      if (layPress) acts.appendChild(layPress);
      inner.appendChild(acts);
    }
    placeOverlay = { card, places: manifest.places, events: manifest.events, cultureId: manifest.cultureId, presentYear: manifest.presentYear, currentIdx: -1, pinned: false, pinnedIdx: -1, prospectLink, acts, layPress };
    manifest.places.forEach((place, idx) => {
      const hit = document.createElement("button");
      hit.type = "button";
      hit.className = "place-hit";
      hit.dataset.idx = String(idx);
      hit.setAttribute("aria-label", placeAriaLabel(place));
      hit.setAttribute("aria-describedby", "place-card");
      hit.style.left = `${place.nx * 100}%`;
      hit.style.top = `${place.ny * 100}%`;
      hit.addEventListener("mouseenter", () => showPlaceCard(idx));
      hit.addEventListener("focus", () => showPlaceCard(idx));
      hit.addEventListener("mouseleave", () => { if (!placeOverlay!.pinned) placeOverlay!.card.hidden = true; });
      hit.addEventListener("blur", () => { if (!placeOverlay!.pinned) placeOverlay!.card.hidden = true; });
      hit.addEventListener("click", () => {
        if (placeOverlay!.pinned && placeOverlay!.pinnedIdx === idx) { hidePlaceCard(); return; }
        placeOverlay!.pinned = true;
        placeOverlay!.pinnedIdx = idx;
        showPlaceCard(idx);
      });
      overlay.appendChild(hit);
    });
    overlay.appendChild(card);
    mapEl.appendChild(overlay);
    if (preserveName != null) {
      const idx = manifest.places.findIndex((p) => p.name === preserveName);
      if (idx >= 0) {
        placeOverlay.pinned = true;
        placeOverlay.pinnedIdx = idx;
        showPlaceCard(idx);
      }
    }
  }

  function onDocKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape" && placeOverlay && !placeOverlay.card.hidden) hidePlaceCard();
  }

  function onDocClick(e: MouseEvent): void {
    if (!placeOverlay || placeOverlay.card.hidden) return;
    const t = e.target as Element | null;
    if (t && t.closest && (t.closest(".place-hit") || t.closest("#place-card"))) return;
    hidePlaceCard();
  }

  function data(): OverlayData | null {
    if (!placeOverlay) return null;
    return { places: placeOverlay.places, events: placeOverlay.events, presentYear: placeOverlay.presentYear };
  }

  function teardown(): void {
    for (const stale of mapEl.querySelectorAll(":scope > .place-overlay, :scope > #place-card")) stale.remove();
    placeOverlay = null;
  }

  return { buildPlaceOverlay, onDocKeydown, onDocClick, hideCard: hidePlaceCard, reclampCard, relabelLay, data, teardown };
}

export type PlaceOverlay = ReturnType<typeof createPlaceOverlay>;
