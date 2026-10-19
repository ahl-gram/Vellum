// The story cards: a per-draw layer of invisible hit-targets over the baked chart feeding one reused parchment card. Card text is composed client-side from the manifest (composePlaceCard), never createLoreWriter, whose order-dependent prose would diverge from the gazetteer for the same town.
import { composePlaceCard, placeAriaLabel, cardSide, clampOffset, type CardBox } from "../../../render/place-card.ts";
import type { PlaceManifest, PlaceMark } from "../../../render/place-manifest.ts";
import type { HistoricalEvent } from "../../../society/history.ts";
import {
  CLOSED,
  HOLD_GRACE_MS,
  isHit,
  nearestMark,
  nextHold,
  pointerTrack,
  pressMark,
  wireHit,
  type Hold,
  type HoldInput,
  type Point,
} from "./place-card-hold.ts";
import { cardActs, cardShell, fillCardInner, seatCard } from "./place-overlay-card.ts";

export interface PlaceOverlayState {
  card: HTMLDivElement;
  inner: HTMLDivElement;
  hits: HTMLButtonElement[];
  places: ReadonlyArray<PlaceMark>;
  events: ReadonlyArray<HistoricalEvent>;
  cultureId: string;
  presentYear: number;
  currentIdx: number;
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

function overlayBox(opts: Readonly<BuildPlaceOverlayOpts> | undefined): HTMLDivElement {
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
  return overlay;
}

const tag = (cls: string, prev: HTMLElement | null, el: HTMLElement | null): HTMLElement | null => {
  if (prev && prev !== el) prev.classList.remove(cls);
  if (el) el.classList.add(cls);
  return el;
};

function placeHit(place: PlaceMark, idx: number): HTMLButtonElement {
  const hit = document.createElement("button");
  hit.type = "button";
  hit.className = "place-hit";
  hit.dataset.idx = String(idx);
  hit.setAttribute("aria-label", placeAriaLabel(place));
  hit.setAttribute("aria-describedby", "place-card");
  hit.style.left = `${place.nx * 100}%`;
  hit.style.top = `${place.ny * 100}%`;
  return hit;
}

// eslint-disable-next-line max-lines-per-function
export function createPlaceOverlay(deps: PlaceOverlayDeps) {
  const { mapEl, isSuppressed, prospectHref, layProspect, clampBox } = deps;

  let placeOverlay: PlaceOverlayState | null = null;
  let hold: Hold = CLOSED;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let last: Point = { x: Number.NaN, y: Number.NaN };
  let watching: Document | null = null;
  let near: HTMLElement | null = null,
    own: HTMLElement | null = null;

  function showPlaceCard(idx: number): boolean {
    if (!placeOverlay || isSuppressed()) return false; // the hover card is suppressed while scrubbing
    const place = placeOverlay.places[idx];
    if (!place) return false;
    const card = composePlaceCard(place, placeOverlay.events, placeOverlay.cultureId);
    const el = placeOverlay.card;
    const inner = placeOverlay.inner;
    fillCardInner(inner, card, placeOverlay.acts);
    if (placeOverlay.prospectLink) placeOverlay.prospectLink.href = prospectHref!(place.idx);
    paintLay(place.idx);
    el.style.setProperty("--pc-nx", String(place.nx));
    el.style.setProperty("--pc-ny", String(place.ny));
    const side = cardSide(place.nx, place.ny);
    el.classList.toggle("flip-h", side.h === "left");
    el.classList.toggle("flip-v", side.v === "above");
    el.classList.toggle("pinned", hold.pinned && hold.shown === idx);
    el.hidden = false;
    // The none/reflow/restore reset replays the unfurl at the current grade on every show: a CSS animation does not replay while the card stays displayed across a content swap, and a mid-flight grade change would leave a partial roll.
    inner.style.animation = "none";
    void inner.offsetWidth;
    inner.style.animation = "";
    clampIntoView(el);
    inner.tabIndex = el.classList.contains("pc-scrolls") && el.classList.contains("pinned") ? 0 : -1;
    placeOverlay.currentIdx = idx;
    return true;
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

  function markScroll(el: HTMLElement, innerEl: HTMLElement): void {
    const scrolls = innerEl.scrollHeight - innerEl.clientHeight > 1;
    el.classList.toggle("pc-scrolls", scrolls);
    // A scroll container is not keyboard operable without a tab stop of its own, and the tail this cap hides was fully visible before it: a reader with no pointer reaches it only once the card itself can hold focus.
    innerEl.tabIndex = scrolls && el.classList.contains("pinned") ? 0 : -1;
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
    if (placeOverlay) markScroll(el, placeOverlay.inner);
  }

  const inside = (p: Point | null): boolean => {
    if (!p || !placeOverlay || placeOverlay.card.hidden) return false;
    const r = placeOverlay.card.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;
  };

  const inCard = (node: unknown): boolean => {
    for (let n = node as Node | null; n; n = n.parentNode) if (placeOverlay && n === placeOverlay.card) return true;
    return false;
  };

  function onMove(e: MouseEvent): void {
    if (e.buttons !== 0) return;
    track.move(e);
    const over = inside(point(e));
    if (over !== hold.onCard) feed({ kind: "move", onCard: over });
  }

  const onDown = (e: Event): void => {
    track.down(e);
  };

  function syncWatch(): void {
    const doc = (mapEl as { ownerDocument?: Document | null }).ownerDocument ?? null;
    if (hold.shown >= 0 && !watching && doc) {
      doc.addEventListener("mousemove", onMove, { passive: true });
      doc.addEventListener("pointerdown", onDown, { capture: true, passive: true });
      watching = doc;
    } else if (hold.shown < 0 && watching) {
      watching.removeEventListener("mousemove", onMove);
      watching.removeEventListener("pointerdown", onDown, { capture: true });
      watching = null;
      track.reset();
    }
  }

  function expire(): void {
    timer = null;
    feed({ kind: "expire", onCard: inside(last) });
  }

  function feed(input: HoldInput): void {
    const po = placeOverlay;
    if (!po) return;
    const prev = hold;
    hold = nextHold(prev, input);
    seatCard(po, hold);
    if (hold.shown >= 0 && (hold.shown !== prev.shown || hold.pinned !== prev.pinned) && !showPlaceCard(hold.shown))
      hold = { ...CLOSED, hovered: hold.hovered };
    if (hold.shown < 0) {
      po.card.hidden = true;
      seatCard(po, hold);
    }
    if (hold.waiting && !timer) timer = setTimeout(expire, HOLD_GRACE_MS);
    else if (!hold.waiting && timer) {
      clearTimeout(timer);
      timer = null;
    }
    syncWatch();
    if (po.card.parentElement) po.card.parentElement.classList.toggle("pc-over", hold.shown >= 0 && hold.onCard);
    own = tag("pc-own", own, hold.shown >= 0 ? (po.hits[hold.shown] ?? null) : null);
  }

  const hidePlaceCard = (): void => {
    feed({ kind: "dismiss" });
  };

  function raise(idx: number): void {
    near = tag("pc-near", near, placeOverlay && idx >= 0 ? (placeOverlay.hits[idx] ?? null) : null);
  }

  function resolve(p: Point, idx: number): number {
    const boxes = placeOverlay
      ? placeOverlay.hits.map((h, i) => {
          const r = h.getBoundingClientRect();
          return { idx: i, left: r.left, top: r.top, right: r.right, bottom: r.bottom };
        })
      : [];
    const at = nearestMark(p, boxes);
    return at >= 0 ? at : idx;
  }

  const { markPress, takePress } = pressMark();

  const point = (e: Event): Point | null => {
    const me = e as MouseEvent;
    if (!Number.isFinite(me.clientX) || !Number.isFinite(me.clientY)) return null;
    last = { x: me.clientX, y: me.clientY };
    return last;
  };
  const track = pointerTrack({ feed, point, resolve, inside, raise });

  function reset(): void {
    hold = CLOSED;
    if (timer) clearTimeout(timer);
    timer = null;
    near = own = null;
    syncWatch();
  }

  // opts.box positions the overlay over a region inset's rect so the region manifest's own nx/ny fractions land on the inset's drawn glyphs; the card lives inside the overlay so its % anchor resolves against the same box.
  function buildPlaceOverlay(manifest: PlaceManifest, opts?: BuildPlaceOverlayOpts): void {
    const preserveName =
      opts && opts.preservePinByName && placeOverlay && hold.pinned && hold.shown >= 0
        ? ((placeOverlay.places[hold.shown] || {}) as Partial<PlaceMark>).name
        : null;
    reset();
    // An inset commit rebuilds the overlay with no mount wipe before it (unlike a draw), so this builder owns removing the previous overlay + card; a no-op after a wipe.
    for (const stale of mapEl.querySelectorAll(":scope > .place-overlay, :scope > #place-card")) stale.remove();
    const overlay = overlayBox(opts);
    overlay.addEventListener("click", (e) => {
      const pressed = e.target === overlay && e.detail > 0 ? track.press(e, -1) : null;
      if (pressed && pressed.idx >= 0) feed({ kind: "press", ...pressed });
    });
    const { card, inner } = cardShell();
    card.addEventListener("focusout", (e) => {
      feed({ kind: "focusOut", staysNear: inCard(e.relatedTarget) || isHit(e.relatedTarget) });
    });
    const { prospectLink, layPress, acts } = cardActs(inner, opts, prospectHref, layProspect);
    const wiring = { feed, inCard, markPress, takePress, track };
    const hits = manifest.places.map((place, idx) => {
      const hit = placeHit(place, idx);
      wireHit(hit, idx, wiring);
      overlay.appendChild(hit);
      return hit;
    });
    placeOverlay = {
      card,
      inner,
      hits,
      places: manifest.places,
      events: manifest.events,
      cultureId: manifest.cultureId,
      presentYear: manifest.presentYear,
      currentIdx: -1,
      prospectLink,
      acts,
      layPress,
    };
    overlay.appendChild(card);
    mapEl.appendChild(overlay);
    if (preserveName != null) {
      const idx = manifest.places.findIndex((p) => p.name === preserveName);
      if (idx >= 0) feed({ kind: "press", idx, detail: 0, onCard: false });
    }
  }

  function onDocKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape" && hold.shown >= 0) hidePlaceCard();
  }

  function onDocClick(e: MouseEvent): void {
    if (!placeOverlay || hold.shown < 0) return;
    const t = e.target as (Node & Partial<Pick<Element, "closest">>) | null;
    if (t && t.closest && (t.closest(".place-hit") || t.closest("#place-card"))) return;
    if (t === placeOverlay.card.parentElement) return;
    feed({ kind: "pressOpen", onCard: e.detail > 0 && inside({ x: e.clientX, y: e.clientY }) });
  }

  function data(): OverlayData | null {
    if (!placeOverlay) return null;
    return { places: placeOverlay.places, events: placeOverlay.events, presentYear: placeOverlay.presentYear };
  }

  function teardown(): void {
    reset();
    for (const stale of mapEl.querySelectorAll(":scope > .place-overlay, :scope > #place-card")) stale.remove();
    placeOverlay = null;
  }

  return {
    buildPlaceOverlay,
    onDocKeydown,
    onDocClick,
    hideCard: hidePlaceCard,
    reclampCard,
    relabelLay,
    data,
    teardown,
  };
}

export type PlaceOverlay = ReturnType<typeof createPlaceOverlay>;
