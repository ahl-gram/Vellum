export const SCAN = "276cb6ae7f19fbccb85504ff1e67bffbcbb98039";
export const CONTROL = "bc970d0efdbbca9e21cb747e6c97506aabb63558";
export type TrialSide = { readonly file: string; readonly line: number; readonly name: string };
export type TrialRow = {
  readonly sha: string;
  readonly a: TrialSide;
  readonly b: TrialSide;
  readonly same: boolean;
  readonly then: number;
};

export const TRIAL_ROWS: readonly TrialRow[] = [
  {
    sha: SCAN,
    a: { file: "test/world/daily-hunt.test.ts", line: 60, name: "at" },
    b: { file: "test/world/daily-hunt.test.ts", line: 114, name: "villageAt" },
    same: true,
    then: 0.99,
  },
  {
    sha: SCAN,
    a: { file: "test/prospect/key-world.test.ts", line: 12, name: "worldFor" },
    b: { file: "test/society/renames.test.ts", line: 17, name: "worldFor" },
    same: true,
    then: 0.98,
  },
  {
    sha: SCAN,
    a: { file: "test/render/close-up-name-room.test.ts", line: 38, name: "projOf" },
    b: { file: "test/render/close-up-names.test.ts", line: 42, name: "projOf" },
    same: true,
    then: 0.92,
  },
  {
    sha: SCAN,
    a: { file: "src/world/daily-hunt-clue-facts.ts", line: 147, name: "ewBandOf" },
    b: { file: "test-support/daily-hunt-geometry.ts", line: 62, name: "expectedEW" },
    same: true,
    then: 0.98,
  },
  {
    sha: SCAN,
    a: { file: "test/prospect/plate-e-world.test.ts", line: 18, name: "worldFor" },
    b: { file: "test/world/realm-carry.test.ts", line: 14, name: "worldFor" },
    same: true,
    then: 0.94,
  },
  {
    sha: SCAN,
    a: { file: "test/repo/ts-comment-form.test.ts", line: 206, name: ".create" },
    b: { file: "test/repo/ts-comment-form.test.ts", line: 219, name: ".Program" },
    same: false,
    then: 0.07,
  },
  {
    sha: SCAN,
    a: { file: "src/world/daily-hunt-clue-facts.ts", line: 267, name: "roadStateAt" },
    b: { file: "test-support/daily-hunt-geometry.ts", line: 155, name: "roadState" },
    same: true,
    then: 0.97,
  },
  {
    sha: SCAN,
    a: { file: "test-support/lint-wiring-scope.ts", line: 19, name: "shortName" },
    b: { file: "test/repo/lint-config.test.ts", line: 11, name: "nameOf" },
    same: true,
    then: 0.98,
  },
  {
    sha: SCAN,
    a: { file: "src/render/layers/heraldry/charges.ts", line: 103, name: "ravenCharge" },
    b: { file: "src/render/layers/heraldry/charges.ts", line: 176, name: "scimitarCharge" },
    same: false,
    then: 0.01,
  },
  {
    sha: SCAN,
    a: { file: "test/e2e/launch-harness.test.ts", line: 68, name: "goneWithin" },
    b: { file: "test/repo/proof-runner-job.test.ts", line: 43, name: "goneWithin" },
    same: true,
    then: 0.98,
  },
  {
    sha: SCAN,
    a: { file: "test/prospect/plate-e-world.test.ts", line: 18, name: "worldFor" },
    b: { file: "test/society/renames.test.ts", line: 17, name: "worldFor" },
    same: true,
    then: 0.98,
  },
  {
    sha: SCAN,
    a: { file: "scripts/lint/sheet-tokens.ts", line: 15, name: "repoPath" },
    b: { file: "scripts/lint/source-shape.ts", line: 8, name: "repoPath" },
    same: true,
    then: 0.96,
  },
  {
    sha: SCAN,
    a: { file: "src/render/layers/heraldry/charges.ts", line: 96, name: "axeCharge" },
    b: { file: "src/render/layers/heraldry/charges.ts", line: 135, name: "mountainCharge" },
    same: false,
    then: 0.01,
  },
  {
    sha: SCAN,
    a: { file: "test-support/built-reads/documents.ts", line: 1, name: "decode" },
    b: { file: "test/atlas/compose.test.ts", line: 266, name: "unescape" },
    same: true,
    then: 0.98,
  },
  {
    sha: SCAN,
    a: { file: "test/terrain/bridge-cut.test.ts", line: 8, name: "fieldFromRows" },
    b: { file: "test/terrain/detail-guarantees.test.ts", line: 19, name: "fieldFromRows" },
    same: true,
    then: 0.74,
  },
  {
    sha: SCAN,
    a: { file: "src/prospect/transect.ts", line: 19, name: "sampleBilinear" },
    b: { file: "test/prospect/input.test.ts", line: 38, name: "bilinear" },
    same: true,
    then: 0.86,
  },
  {
    sha: SCAN,
    a: { file: "scripts/comment-judge/candidates.ts", line: 67, name: "candidate" },
    b: { file: "test/repo/comment-judge-questions.test.ts", line: 24, name: "candidate" },
    same: false,
    then: 0.05,
  },
  {
    sha: SCAN,
    a: { file: "scripts/comment-judge/questions.ts", line: 25, name: "pinsQuestion" },
    b: { file: "test/repo/comment-judge-questions.test.ts", line: 25, name: "pinned" },
    same: true,
    then: 0.96,
  },
  {
    sha: SCAN,
    a: { file: "test/prospect/surroundings.test.ts", line: 10, name: "worldFor" },
    b: { file: "test/world/realm-carry.test.ts", line: 14, name: "worldFor" },
    same: true,
    then: 0.94,
  },
  {
    sha: SCAN,
    a: { file: "test/site/sheet-slide.test.ts", line: 5, name: "near" },
    b: { file: "test/site/stage-fit.test.ts", line: 72, name: "near" },
    same: false,
    then: 0.06,
  },
  {
    sha: SCAN,
    a: { file: "src/world/detail-chain.ts", line: 123, name: "gridForWindow" },
    b: { file: "scripts/region-detail/partition.ts", line: 20, name: "gridForWindow" },
    same: true,
    then: 0.94,
  },
  {
    sha: SCAN,
    a: { file: "src/society/history.ts", line: 116, name: "riseEvents" },
    b: { file: "src/society/history.ts", line: 136, name: "warEvents" },
    same: false,
    then: 0.01,
  },
  {
    sha: SCAN,
    a: { file: "test/e2e/rest-waits.test.ts", line: 89, name: ".answer" },
    b: { file: "test/e2e/rest-waits.test.ts", line: 109, name: ".answer" },
    same: false,
    then: 0.03,
  },
  {
    sha: CONTROL,
    a: { file: "src/site/ribbon/address.ts", line: 23, name: "nat" },
    b: { file: "src/site/prospect/address.ts", line: 27, name: "nat" },
    same: true,
    then: 0.98,
  },
];
