// The site nav as typed data; the layout renders every item flat. `kind` is a PLACEHOLDER taxonomy tag nothing may depend on.
export interface NavItem {
  readonly label: string;
  /** Root-absolute, trailing-slash directory form. */
  readonly href: string;
  readonly kind: "room" | "reference" | "daily";
}

// Home drops out (the wordmark carries the home link); FAQ reads "Q & A" here, "Questions & Answers" in its title. Labels stay mixed-case: the Fell SC cut sets the small caps.
export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Today", href: "/seed-of-the-day/", kind: "daily" },
  { label: "Explorer", href: "/explorer/", kind: "room" },
  { label: "Reading Room", href: "/reading-room/", kind: "room" },
  { label: "Print Room", href: "/print-room/", kind: "room" },
  { label: "Gallery", href: "/gallery/", kind: "room" },
  { label: "Q & A", href: "/faq/", kind: "reference" },
  { label: "Glossary", href: "/glossary/", kind: "reference" },
];

export const ROUTE_NAMES: Readonly<Record<string, string>> = {
  "/": "Vellum",
  "/seed-of-the-day/": "The Seed of the Day",
  "/explorer/": "The Explorer",
  "/reading-room/": "The Reading Room",
  "/print-room/": "The Print Room",
  "/gallery/": "The Gallery",
  "/faq/": "Questions & Answers",
  "/glossary/": "The Glossary",
  "/prospect/": "The Prospect",
  "/ribbon/": "The Wayfarer's Ribbon",
  "/explorer/portfolio/": "The Portfolio",
};

export const ROUTE_CHILDREN: Readonly<Record<string, readonly string[]>> = {
  "/explorer/": ["/prospect/", "/ribbon/", "/explorer/portfolio/"],
  "/reading-room/": ["/prospect/"],
};

export interface Crumb {
  readonly name: string;
  readonly href: string;
}

export interface Trail {
  readonly crumbs: readonly Crumb[];
  readonly current: boolean;
  readonly also: readonly Crumb[];
}

const crumbOf = (href: string): Crumb => {
  const name = ROUTE_NAMES[href];
  if (name === undefined) throw new Error(`no ROUTE_NAMES entry for ${href}: every route the trail names needs one`);
  return { name, href };
};

export function seatOf(route: string): string | null | undefined {
  for (const item of NAV_ITEMS) {
    if (item.href === route) return null;
    if (ROUTE_CHILDREN[item.href]?.includes(route)) return item.href;
  }
  return undefined;
}

export function aliasesOf(route: string): readonly string[] {
  const seat = seatOf(route);
  return NAV_ITEMS.map((i) => i.href).filter((parent) => parent !== seat && ROUTE_CHILDREN[parent]?.includes(route));
}

export function trailFor(path: string): Trail | null {
  const seat = seatOf(path);
  if (seat === undefined) return null;
  return {
    crumbs: ["/", ...(seat === null ? [] : [seat]), path].map(crumbOf),
    current: seat !== null,
    also: aliasesOf(path).map(crumbOf),
  };
}
