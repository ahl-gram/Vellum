import { test } from "node:test";
import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { ESLint, type Linter } from "eslint";
import lintConfig from "../../eslint.config.ts";
import { GALLERY_PAGE_CSS } from "../../src/cli/gallery.ts";
import { atlasDocument } from "../../src/atlas/document.ts";
import { OG_FONT_FACES, fontFaceCss } from "../../src/render/og-card.ts";
import { SRC_CSS_FILES, type SrcCssFile } from "../../scripts/lint/sheet-tokens.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const SHEETS_BLOCK = "the house's rules on every stylesheet";
const EXCUSED: Readonly<Partial<Record<SrcCssFile, readonly string[]>>> = {
  "src/atlas/document.ts": ["vellum/css-comment-issue-form", "vellum/css-comment-one-line"],
};
const WHY_EXCUSED =
  "the atlas alone is excused the issue-form and one-line comment rules, for the comments it ships whose bytes DOWNLOAD_SHA256 in test/atlas/document.test.ts pins (handbook/errata/guards.md)";

const styleBlocksIn = (html: string): string =>
  [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");

const atlasCss = (): string => {
  const plate = { key: "x", title: "x", svg: "<svg></svg>" };
  const data = {
    title: "",
    subtitle: "",
    seed: 0,
    hero: plate,
    draughtings: [],
    themes: [],
    regions: [],
    prospects: [],
    bannersHtml: "",
    chronicleHtml: "",
    gazetteerHtml: "",
  };
  return [
    styleBlocksIn(atlasDocument(data, () => "")),
    styleBlocksIn(atlasDocument(data, () => "", { anchor: true, motion: true })),
  ].join("\n");
};

const SRC_CSS: Readonly<Record<SrcCssFile, { readonly css: () => string; readonly anchor: string }>> = {
  "src/cli/gallery.ts": { css: () => GALLERY_PAGE_CSS, anchor: "figure img:hover" },
  "src/atlas/document.ts": { css: atlasCss, anchor: ".atlas-sheet figure a img:hover" },
  "src/render/og-card.ts": {
    css: () => OG_FONT_FACES.map((face) => fontFaceCss(face, "")).join("\n"),
    anchor: "@font-face",
  },
};

const sheetsBlock = (): Linter.Config => {
  const block = (lintConfig as readonly Linter.Config[]).find((b) => b.name === SHEETS_BLOCK);
  assert.ok(block?.rules, `eslint.config.ts has no block named "${SHEETS_BLOCK}" with rules`);
  return block;
};

const builtCssLint = (excused: readonly string[]): ESLint => {
  const block = sheetsBlock();
  const rules = Object.fromEntries(Object.entries(block.rules!).filter(([rule]) => !excused.includes(rule)));
  return new ESLint({
    cwd: ROOT,
    overrideConfigFile: true,
    allowInlineConfig: false,
    overrideConfig: [
      {
        files: ["**/*.css"],
        plugins: block.plugins,
        language: block.language,
        languageOptions: block.languageOptions,
        rules,
      },
    ],
  });
};

const lintBuilt = async (source: SrcCssFile, css: string, excused = EXCUSED[source] ?? []): Promise<string[]> => {
  const [result] = await builtCssLint(excused).lintText(css, { filePath: join(ROOT, `${source}.css`) });
  return result!.messages.map((m) => `${source}:${m.line} ${m.ruleId ?? "fatal"} ${m.message}`);
};

test("every module that builds CSS is a TypeScript module with a builder here and CSS carrying its own anchor, and every rule a builder is excused is a rule of the stylesheet block that still reports there (Issue #779 part 2d, D1 option C)", async () => {
  for (const source of SRC_CSS_FILES) {
    assert.ok(
      source.endsWith(".ts"),
      `${source} is not a TypeScript module: a page's CSS lives in a sheet under public/, where the stylesheet lint reads it (handbook/specs/site-architecture.md)`,
    );
    const { css, anchor } = SRC_CSS[source];
    assert.ok(
      css().includes(anchor),
      `${source}'s built CSS lacks ${anchor}, so the lint below may be reading nothing`,
    );
  }
  const ruled = Object.keys(sheetsBlock().rules!);
  for (const [source, rules] of Object.entries(EXCUSED) as Array<[SrcCssFile, readonly string[]]>) {
    const reports = await lintBuilt(source, SRC_CSS[source].css(), []);
    for (const rule of rules) {
      assert.ok(ruled.includes(rule), `${source} is excused ${rule}, which is no rule of the stylesheet block`);
      assert.ok(
        reports.some((line) => line.includes(` ${rule} `)),
        `${source} is excused ${rule}, which reports nothing there now: the excusal is stale, so delete it`,
      );
    }
  }
});

test("the CSS the TypeScript builds passes every stylesheet rule but the atlas's two excused comment rules, with no inline directive able to silence one (Issue #779 part 2d, D1 option C)", async () => {
  for (const source of SRC_CSS_FILES)
    assert.deepEqual(
      await lintBuilt(source, SRC_CSS[source].css()),
      [],
      `${source}'s built CSS breaks a stylesheet rule; ${WHY_EXCUSED}`,
    );
});

test("an eslint-disable comment in built CSS silences nothing, since the lint of the built CSS reads no inline directive (Issue #779 part 2d)", async () => {
  const found = await lintBuilt("src/cli/gallery.ts", "/* eslint-disable */\n.a { color: #4a3826; }");
  assert.ok(
    found.some((line) => line.includes("vellum/css-token-by-name")),
    `a raw token under an eslint-disable comment went unreported: ${JSON.stringify(found)}`,
  );
});
