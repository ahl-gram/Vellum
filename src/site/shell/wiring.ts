export const NARROW = "(max-width: 900px)";

export interface DrawerWiring {
  /** The element that OWNS the scrim pseudo-element: a click on the scrim reports it as the target. */
  readonly scrim: string;
  readonly inert: string;
  readonly closesOnScroll: boolean;
}

// A click over an inert subtree retargets to its nearest LIVE ancestor, so what each inert set needs is not that the wash covers it but that the retarget lands on the scrim's host (#482 skeptic round 2, finding 2). On home that host is .landfall, so the two must match extent for extent. On a room it is body, every element's ancestor, so an inert region the fixed wash has scrolled past still closes the drawer.
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
