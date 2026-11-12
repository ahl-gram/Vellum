import type { PlaceCard } from "../../../render/place-card.ts";
import type { PlaceMark } from "../../../render/place-manifest.ts";
import type { Hold } from "./place-card-hold.ts";
import type { LayProspectHost, PlaceOverlayDeps, PlaceOverlayState } from "./place-overlay.ts";

export const PROSPECT_ON_CARD = "View the prospect";
export const ROAD_ON_CARD = "Take the road";

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

export function cardShell() {
  const card = document.createElement("div");
  card.id = "place-card";
  card.setAttribute("role", "tooltip");
  card.hidden = true;
  const inner = document.createElement("div");
  inner.className = "pc-inner";
  // Issue #633: d3-zoom is bound on the host's viewport, an ANCESTOR of the card carrying touch-action: none, so without this a drag or a wheel over the card reaches the camera and the card never scrolls; measured with a CDP touch pan, which cannot see a touch-action line at all and still read scrollTop 0 to 0. Whether a real thumb scrolls it is UNVERIFIABLE in this harness.
  for (const ev of ["touchstart", "touchmove", "wheel"])
    inner.addEventListener(
      ev,
      (e) => {
        if (inner.scrollHeight - inner.clientHeight > 1) e.stopPropagation();
      },
      { passive: true },
    );
  card.appendChild(inner);
  return { card, inner };
}

export function cardActs(
  inner: HTMLDivElement,
  prospectHref: PlaceOverlayDeps["prospectHref"],
  layProspect: Readonly<LayProspectHost> | undefined,
  ribbonHref: PlaceOverlayDeps["ribbonHref"],
) {
  let prospectLink: HTMLAnchorElement | null = null;
  if (prospectHref) {
    prospectLink = document.createElement("a");
    prospectLink.className = "pc-prospect";
    prospectLink.textContent = PROSPECT_ON_CARD;
  }
  let ribbonLink: HTMLAnchorElement | null = null;
  if (ribbonHref) {
    ribbonLink = document.createElement("a");
    ribbonLink.className = "pc-ribbon";
    ribbonLink.textContent = ROAD_ON_CARD;
  }
  const layPress = layProspect ? makeLayPress(layProspect) : null;
  const acts = prospectLink || ribbonLink || layPress ? document.createElement("div") : null;
  if (acts) {
    acts.className = "pc-acts";
    if (prospectLink) acts.appendChild(prospectLink);
    if (ribbonLink) acts.appendChild(ribbonLink);
    if (layPress) acts.appendChild(layPress);
    inner.appendChild(acts);
  }
  return { prospectLink, ribbonLink, layPress, acts };
}

export function paintActs(acts: HTMLElement | null, place: Readonly<PlaceMark>): void {
  acts?.style.setProperty("display", place.worldIdx === null ? "none" : "");
}

export function paintRoad(
  pillEl: HTMLAnchorElement | null,
  place: Readonly<PlaceMark>,
  href: PlaceOverlayDeps["ribbonHref"],
): void {
  if (!pillEl || !href || place.worldIdx === null) return;
  pillEl.href = href(place.worldIdx);
  pillEl.style.display = place.roads ? "" : "none";
}

export function fillCardInner(innerEl: HTMLElement, card: PlaceCard, acts: HTMLElement | null): void {
  for (const child of [...innerEl.children]) if (child !== acts) child.remove();
  innerEl.scrollTop = 0;
  const name = document.createElement("strong");
  name.className = "pc-name";
  name.textContent = card.name;
  const rank = document.createElement("span");
  rank.className = "pc-rank";
  rank.textContent = card.rank;
  const founded = document.createElement("span");
  founded.className = "pc-founded";
  founded.textContent = card.foundedLine;
  const head: HTMLElement[] = [name, rank, founded];
  if (card.formerLine) {
    const former = document.createElement("span");
    former.className = "pc-former";
    former.textContent = card.formerLine;
    head.push(former);
  }
  const tail: HTMLElement[] = [];
  if (card.tale) {
    const tale = document.createElement("p");
    tale.className = "pc-tale";
    tale.textContent = card.tale;
    tail.push(tale);
  }
  const tongue = document.createElement("p");
  tongue.className = "pc-tongue";
  tongue.textContent = card.tongueLine;
  const derivation = document.createElement("p");
  derivation.className = "pc-roots";
  derivation.textContent = card.derivationLine;
  tail.push(tongue, derivation);
  if (!acts) {
    innerEl.append(...head, ...tail);
    return;
  }
  acts.before(...head);
  acts.after(...tail);
}

export function seatCard(po: PlaceOverlayState, hold: Hold): void {
  const overlay = po.card.parentElement;
  if (!overlay) return;
  const kids = [...overlay.children];
  const hit = hold.pinned ? po.hits[hold.shown] : undefined;
  if (hit && kids[kids.indexOf(hit) + 1] !== po.card) hit.after(po.card);
  else if (!hit && kids[kids.length - 1] !== po.card) overlay.appendChild(po.card);
}
