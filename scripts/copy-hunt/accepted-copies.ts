export type AcceptedSide = { readonly file: string; readonly name: string; readonly hash: string };
export type AcceptedCopy = {
  readonly a: AcceptedSide;
  readonly b: AcceptedSide;
  readonly reason: string;
  readonly ruling: string;
};

const DAILY_HUNT_RULING = "https://github.com/ahl-gram/Vellum/issues/1318#issuecomment-6791902246";
const LISTED_RULING = "https://github.com/ahl-gram/Vellum/issues/1319#issuecomment-6795585660";
const KEPT_BY_1332 = "https://github.com/ahl-gram/Vellum/issues/1332#issuecomment-6799386440";
const CLUES = "src/world/daily-hunt-clue-facts.ts";
const MIRROR = "test-support/daily-hunt-geometry.ts";
const MIRRORED =
  "The Daily Hunt's deliberate second copy of the clue rules (Issue #335), kept as its sweep's ground truth beside examples worked out by hand (Issue #1318, ruling D2)";
const KEPT = "Kept on purpose by PR #1334 (Issue #1318), with a line above the copy naming the original";

export const ACCEPTED_COPIES: readonly AcceptedCopy[] = [
  {
    a: { file: CLUES, name: "quarryPool", hash: "0c69cf5dc0bee468" },
    b: { file: MIRROR, name: "quarryPoolMirror", hash: "6e3f7ff390bfd23f" },
    reason: `${MIRRORED}: quarryPoolMirror mirrors chooseQuarry's base pool.`,
    ruling: DAILY_HUNT_RULING,
  },
  {
    a: { file: CLUES, name: "ewBandOf", hash: "a520837d678fb80e" },
    b: { file: MIRROR, name: "expectedEW", hash: "31e0860ed11f73ad" },
    reason: `${MIRRORED}: expectedEW mirrors ewBandOf.`,
    ruling: DAILY_HUNT_RULING,
  },
  {
    a: { file: CLUES, name: "nsBandOf", hash: "4af217fd9b2aef97" },
    b: { file: MIRROR, name: "expectedNS", hash: "6befc421a0d6fee0" },
    reason: `${MIRRORED}: expectedNS mirrors nsBandOf.`,
    ruling: DAILY_HUNT_RULING,
  },
  {
    a: { file: CLUES, name: "roadStateAt", hash: "0b94b9b876b9a07b" },
    b: { file: MIRROR, name: "roadState", hash: "8552a1bcab032738" },
    reason: `${MIRRORED}: roadState mirrors roadStateAt.`,
    ruling: DAILY_HUNT_RULING,
  },
  {
    a: { file: CLUES, name: "realmNameAt", hash: "c106b16c610c6d89" },
    b: { file: MIRROR, name: "realmNameAt", hash: "df064fc1cedc4577" },
    reason: `${MIRRORED}: realmNameAt mirrors realmNameAt.`,
    ruling: DAILY_HUNT_RULING,
  },
  {
    a: { file: "src/world/founding/found.ts", name: "tongueOf", hash: "37b7b5dcc31ee50e" },
    b: { file: "test/world/founding-climate.test.ts", name: "tongueOf", hash: "37b7b5dcc31ee50e" },
    reason: `${KEPT}: the test's copy reads a lexicon entry's people to choose its fixtures, while the sentences the file spells out pin the rule both share.`,
    ruling: LISTED_RULING,
  },
  {
    a: { file: "src/render/layers/realm-label-placement.ts", name: "boxAt", hash: "e47bdad8dedebb9a" },
    b: { file: "test/render/realm-label-placement.test.ts", name: "boxOf", hash: "17e4971ae07be9fe" },
    reason: `${KEPT}: the test's boxOf is the box placeRealmLabel claims for a spot, built from the same spacedTextBox call as the one boxAt placeRealmLabel builds for both placements since PR #1337 (Issue #1331) folded its two; the hunt reads the pair at similarity 0.50, under its 0.6 cut, and the entry waits for a change that lifts it (Issue #1341).`,
    ruling: LISTED_RULING,
  },
  {
    a: { file: "src/world/region-parent.ts", name: ".toRegion", hash: "02e996b42f735427" },
    b: { file: "scripts/region-detail/feature-match.ts", name: ".toRegion", hash: "02e996b42f735427" },
    reason:
      "The region census's own mapping into a close-up's grid, kept apart so a guard built on it does not share the close-up's code (its file's opening line), word for word windowFrame's since PR #1337 (Issue #1331) folded the close-up's two, with a line above the copy naming the original",
    ruling: KEPT_BY_1332,
  },
  {
    a: { file: "src/prospect/dress/furniture.ts", name: "overlaps", hash: "0b548949825e9bdb" },
    b: { file: "test/prospect/plate-e-world.test.ts", name: "overlaps", hash: "0b548949825e9bdb" },
    reason:
      "The plate test's own box-overlap check, the one its bird assertions share with the plate's layout, kept beside the original with a line above the copy naming it; a later edit to one copy is caught, a mistake typed into both at once is not",
    ruling: KEPT_BY_1332,
  },
  {
    a: { file: "scripts/agent-sandbox.ts", name: "haveCommit", hash: "3dc95b12918f2154" },
    b: { file: "test/repo/agent-sandbox.test.ts", name: "hasCommit", hash: "e0956ef6254d9f92" },
    reason: `${KEPT}: the test's copy only checks the fixture's premise, that the clone lacks the commit create is asked to fetch.`,
    ruling: LISTED_RULING,
  },
];
