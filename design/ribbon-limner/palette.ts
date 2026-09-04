// The limner's box: the five pigments a 1675 colourist laid over an Ogilby impression, plus the antique tokens they sit on.
export const P = {
  paper: "#f2e8cf",
  ink: "#4a3826",
  soft: "#857257",
  sepia: "#8a6a4a",
  gamboge: "#d9a92e",
  vermilion: "#c23b22",
  verdigris: "#5f9a5a",
  verdigrisWash: "#a9c48f",
  azurite: "#637f9b",
  azuriteWash: "#9fbdcc",
  cartoucheBlue: "#b7cbd3",
  gold: "#c9a24a",
  landWash: "#e6e7c6",
} as const;

export const FONT = "'Iowan Old Style', 'Palatino', 'Georgia', serif";

export type Variant = {
  readonly key: string;
  readonly name: string;
  readonly note: string;
  readonly frame: "rect" | "scroll" | "wavy";
  readonly landWash: boolean;
  readonly roadFill: boolean;
  readonly roadHalf: number;
  readonly numerals: "every" | "fives";
  readonly title: "band" | "drapery" | "banner";
  readonly realmEdges: boolean;
};

export const VARIANTS: ReadonlyArray<Variant> = [
  {
    key: "a-limner",
    name: "A. The Limner's Copy",
    note: "The Portsmouth sheet, faithfully: strips as unrolled scrolls with gamboge edges, a drapery cartouche carrying both realms' arms, vermilion roses, green woods, blue water, every league numbered in the road.",
    frame: "scroll", landWash: false, roadFill: false, roadHalf: 4.0, numerals: "every", title: "drapery", realmEdges: true,
  },
  {
    key: "b-coloured",
    name: "B. The Coloured Impression",
    note: "Today's plate with the washes laid over it and nothing moved: the frames, the title band and the road stay as built. The cheapest path to colour.",
    frame: "rect", landWash: false, roadFill: false, roadHalf: 2.3, numerals: "fives", title: "band", realmEdges: false,
  },
  {
    key: "c-painted",
    name: "C. The Painted Ribbon",
    note: "The most colour: each strip a cloth ribbon with undulating edges, the land washed pale green, the road a gamboge band, the title on a swallow-tailed banner.",
    frame: "wavy", landWash: true, roadFill: true, roadHalf: 4.2, numerals: "every", title: "banner", realmEdges: true,
  },
];
