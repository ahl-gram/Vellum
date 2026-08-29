export const NARROW = "(max-width: 900px)";

export interface DrawerWiring {
  /** The element that OWNS the scrim pseudo-element: a click on the scrim reports it as the target. */
  readonly scrim: string;
  readonly inert: string;
  readonly closesOnScroll: boolean;
}

// A click over an inert subtree retargets to its nearest LIVE ancestor, so the one thing an inert set owes is that every member sits INSIDE the scrim host's subtree; a member outside it retargets to something that is not the scrim and is dead with no way out, which is what put home's shelf and footer back outside the set (#482 skeptic round 2, finding 2). Painted extent is a separate, visual matter: home's wash tracks its host because home closes on scroll, and a room's fixed wash may sit off an inert region the page has scrolled without harm, since body is that region's host too.
export const HOME_WIRING: DrawerWiring = {
  scrim: ".landfall",
  inert: ".landfall > *",
  closesOnScroll: true,
};

export const ROOM_WIRING: DrawerWiring = {
  scrim: "body",
  inert: "body.room > main, body.room > footer",
  closesOnScroll: false,
};

export function wiringFor(isRoom: boolean): DrawerWiring {
  return isRoom ? ROOM_WIRING : HOME_WIRING;
}
