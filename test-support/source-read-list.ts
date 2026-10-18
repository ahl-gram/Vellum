export type ReadKind = "data" | "witness" | "kept";
export interface SourceRead {
  readonly reads: string;
  readonly kind: ReadKind;
}

const data = (reads: string): SourceRead => ({ reads, kind: "data" });
const witness = (reads: string): SourceRead => ({ reads, kind: "witness" });
const kept = (reads: string): SourceRead => ({ reads, kind: "kept" });

export const SOURCE_READS: Readonly<Record<string, readonly SourceRead[]>> = {
  "test/atlas/document.test.ts": [data("src/styles/shell.css")],
  "test/prospect/plate-face.test.ts": [
    data("src/prospect/letter/face-caps.ts"),
    data("src/prospect/letter/face-italic.ts"),
    data("src/prospect/letter/face-roman.ts"),
  ],
  "test/render/og-card.test.ts": [data("src/styles/fonts.css")],
  "test/repo/console-support.test.ts": [witness("e2e/**")],
  "test/repo/constant-contracts.test.ts": [witness("src/site/**")],
  "test/repo/e2e-tiers.test.ts": [witness("e2e/harness.ts")],
  "test/repo/lint-wiring.test.ts": [witness("e2e/**"), witness("scripts/**"), witness("src/**")],
  "test/repo/type-check.test.ts": [data("src/**")],
  "test/site/astro-app-surfaces.test.ts": [data("src/styles/explorer/index.css")],
  "test/site/atelier-kit.test.ts": [witness("src/site/shared/glass-keys.ts")],
  "test/site/chart-drawer.test.ts": [kept("src/site/explorer/app.ts")],
  "test/site/desk-notice.test.ts": [kept("src/styles/shell.css")],
  "test/site/home-cluster.test.ts": [kept("src/styles/index.css")],
  "test/site/house-style.test.ts": [kept("src/styles/house.css")],
  "test/site/hunt-zoom.test.ts": [witness("src/site/seed-of-the-day/app.ts")],
  "test/site/landfall-doors.test.ts": [kept("src/styles/index.css"), kept("src/pages/index.astro")],
  "test/site/print-room-room.test.ts": [kept("src/site/print-room/bound-atlas.ts")],
  "test/site/reading-room-room.test.ts": [kept("src/site/reading-room/app.ts")],
  "test/site/region-detail-wiring.test.ts": [kept("src/site/explorer/worker.ts")],
  "test/site/room.test.ts": [data("src/styles/atelier.css")],
  "test/site/sheet-height.test.ts": [data("src/styles/index.css"), kept("src/site/home/camera.ts"), kept("e2e/**")],
  "test/site/shell-css-ground.test.ts": [kept("src/styles/shell.css")],
  "test/site/shell-css.test.ts": [data("src/styles/shell.css"), kept("src/styles/shell.css")],
  "test/site/tip-affordance.test.ts": [witness("src/**")],
};
