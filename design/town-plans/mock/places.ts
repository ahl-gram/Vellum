// Issue #793 round: the places the sitting looks at, each chosen by `node out/793/measure/sweep.ts` (seeds 1 to 40 and 42) and captioned only with what that sweep measured.
export type Kind = "capital" | "seat" | "town" | "village";
export type Place = { readonly seed: number; readonly index: number; readonly kind: Kind; readonly slug: string; readonly title: string; readonly why: string };

export const PLACES: ReadonlyArray<Place> = [
  { seed: 42, index: 0, kind: "capital", slug: "capital-laukuwelua", title: "Laukuwelua, the capital (seed 42, index 0)", why: "a river-mouth port; four world roads cross its ring, the only capital in seeds 1 to 40 and 42 with four" },
  { seed: 30, index: 0, kind: "capital", slug: "capital-grurgthohold", title: "Grurgthohold, the capital (seed 30, index 0)", why: "the steepest ground inside its ring of any capital in seeds 1 to 40 and 42 (0.542 of the world's land span)" },
  { seed: 1, index: 1, kind: "seat", slug: "seat-mectlan", title: "Mectlan, a realm's seat (seed 1, index 1)", why: "one of the 5 seats of 85 whose ring touches no sea; three world roads cross it" },
  { seed: 7, index: 4, kind: "town", slug: "town-tau", title: "Tau, a town (seed 7, index 4)", why: "five world roads cross its ring, the most of any town, shared with 7 others of 274" },
  { seed: 42, index: 10, kind: "village", slug: "village-lokai", title: "Lokai, a village (seed 42, index 10)", why: "a harbour village on a river, the commonest village (352 of 651)" },
  { seed: 42, index: 25, kind: "village", slug: "village-haireno", title: "Haireno, a village (seed 42, index 25)", why: "a harbour village with no river (252 of 651), the village on Laukuwelua's horizon" },
  { seed: 26, index: 22, kind: "village", slug: "village-voorea", title: "Voorea, a village (seed 26, index 22)", why: "an inland village on a river; all 47 inland villages of 651 stand on one; the earlier round's Voorea" },
];

export const DIRECTIONS = [
  { key: "land", name: "A. Streets that follow the land" },
  { key: "grid", name: "B. Streets laid on a grid" },
] as const;

export const DRESSES = ["antique", "ink"] as const;
