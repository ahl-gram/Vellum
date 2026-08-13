/**
 * The site nav, modeled once as typed data (Sub 1 decision B, ratified 2026-07-21); the
 * shared layout renders every item flat, so grouping later is a rendering-only change.
 * `kind` is a PLACEHOLDER taxonomy tag nothing may depend on (Sub 2 may rename or drop it).
 */
export interface NavItem {
  readonly label: string;
  /** Root-absolute, trailing-slash directory form (Sub 1 constraint 8). */
  readonly href: string;
  readonly kind: "room" | "reference" | "daily";
}

// The Running Head set (#268): Home drops out (the wordmark carries the home link); FAQ reads "Q & A" here, "Questions & Answers" in its title. Labels stay mixed-case: the Fell SC cut sets the small caps.
export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Today", href: "/seed-of-the-day/", kind: "daily" },
  { label: "Explorer", href: "/explorer/", kind: "room" },
  { label: "Reading Room", href: "/reading-room/", kind: "room" },
  { label: "Print Room", href: "/print-room/", kind: "room" },
  { label: "Gallery", href: "/gallery/", kind: "room" },
  { label: "Q & A", href: "/faq/", kind: "reference" },
  { label: "Glossary", href: "/glossary/", kind: "reference" },
];
