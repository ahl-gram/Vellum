/** The width the drawer's css folds the nav down at; the binder closes the drawer on the way back out of it, so no inert state outlives the rules that dressed it (#480). Pinned against the sheet by test/site/shell-drawer.test.ts. */
export const NARROW = "(max-width: 900px)";

export interface DrawerWiring {
  /** The element that OWNS the scrim pseudo-element: a click on the scrim reports it as the target. */
  readonly scrim: string;
  /** Exactly what the scrim covers. A click over an inert subtree retargets to its nearest live ancestor and never to the scrim, so an inert region the scrim misses is dead with no way out (#482 skeptic round 2, finding 2). */
  readonly inert: string;
  readonly closesOnScroll: boolean;
}

/** Home: the scrim is the survey section's own overlay, so it rides with the drawer and the burger (#482 finding 4), and the scroll that carries them all away closes the drawer first. */
export const HOME_WIRING: DrawerWiring = {
  scrim: ".landfall",
  inert: ".landfall > *",
  closesOnScroll: true,
};

/** A room: the chrome is fixed (RH3), so the drawer cannot ride away and the scrim is fixed with it, covering the whole viewport over a page whose only members are main and the footer. */
export const ROOM_WIRING: DrawerWiring = {
  scrim: "body",
  inert: "body.room > main, body.room > footer",
  closesOnScroll: false,
};

export function wiringFor(isRoom: boolean): DrawerWiring {
  return isRoom ? ROOM_WIRING : HOME_WIRING;
}
