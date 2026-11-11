import assert from "node:assert/strict";
import { test } from "node:test";
import { firstDifference, readerOf } from "../../scripts/comment-sweep/verify.ts";

const PAGES_BITING = [
  {
    name: "an edited attribute",
    path: "src/pages/a.astro",
    before: '<div class="a">x</div>\n',
    after: '<div class="b">x</div>\n',
  },
  { name: "an edited expression", path: "src/pages/a.astro", before: "<p>{a + 1}</p>\n", after: "<p>{a + 2}</p>\n" },
  {
    name: "an edited style",
    path: "src/pages/a.astro",
    before: "<style>\n.a { color: red; }\n</style>\n",
    after: "<style>\n.a { color: blue; }\n</style>\n",
  },
  {
    name: "an edited script",
    path: "src/pages/a.astro",
    before: "<script>\nconst b = 2;\n</script>\n",
    after: "<script>\nconst b = 3;\n</script>\n",
  },
  { name: "edited text", path: "src/pages/a.astro", before: "<p>The chart</p>\n", after: "<p>The sheet</p>\n" },
  {
    name: "edited frontmatter",
    path: "src/pages/a.astro",
    before: "---\nconst a = 1;\n---\n<p>{a}</p>\n",
    after: "---\nconst a = 2;\n---\n<p>{a}</p>\n",
  },
  {
    name: "the space between two inline elements removed",
    path: "src/pages/a.astro",
    before: "<a>x</a> <b>y</b>\n",
    after: "<a>x</a><b>y</b>\n",
  },
];

for (const f of PAGES_BITING)
  test(`a markup or code change in a page reads as a change: ${f.name}`, () => {
    const read = readerOf(f.path)!;
    assert.notEqual(firstDifference(read(f.before), read(f.after)), null);
  });

const PAGES_QUIET = [
  {
    name: "frontmatter comments removed",
    path: "src/pages/a.astro",
    before: "---\n// fm\nconst a = 1; /* t */\n---\n<p>{a}</p>\n",
    after: "---\nconst a = 1;\n---\n<p>{a}</p>\n",
  },
  {
    name: "an html comment removed directly after the frontmatter",
    path: "src/pages/a.astro",
    before: "---\nconst a = 1;\n---\n<!-- c -->\n<p>{a}</p>\n",
    after: "---\nconst a = 1;\n---\n<p>{a}</p>\n",
  },
  {
    name: "an empty expression removed",
    path: "src/pages/a.astro",
    before: '<div class="a">{/* jsx */}{a}</div>\n',
    after: '<div class="a">{a}</div>\n',
  },
  {
    name: "script comments removed",
    path: "src/pages/a.astro",
    before: "<script>\n// js\nconst b = 2; /* t */\n</script>\n",
    after: "<script>\nconst b = 2;\n</script>\n",
  },
  {
    name: "style comments removed",
    path: "src/pages/a.astro",
    before: "<style>\n/* css */\n.a { color: red; } /* t */\n</style>\n",
    after: "<style>\n.a { color: red; }\n</style>\n",
  },
  {
    name: "an html comment removed between inline elements",
    path: "src/pages/a.astro",
    before: "<a>x</a><!-- c --><b>y</b>\n",
    after: "<a>x</a><b>y</b>\n",
  },
  {
    name: "html comments removed on their own line inside an element and at the end",
    path: "src/pages/a.astro",
    before: "<div>\n  <!-- c -->\n  <p>x</p>\n</div>\n<!-- end -->\n",
    after: "<div>\n  <p>x</p>\n</div>\n",
  },
  {
    name: "an html comment removed inside a sentence",
    path: "src/pages/a.astro",
    before: "<p>Hello <!-- c --> world</p>\n",
    after: "<p>Hello world</p>\n",
  },
];

for (const f of PAGES_QUIET)
  test(`a comment-only edit in a page reads as no change: ${f.name}`, () => {
    const read = readerOf(f.path)!;
    assert.equal(firstDifference(read(f.before), read(f.after)), null);
  });

test("a difference in a page is reported at its own line", () => {
  const read = readerOf("src/pages/a.astro")!;
  assert.deepEqual(firstDifference(read("<p>a</p>\n<p>b</p>\n<p>c</p>\n"), read("<p>a</p>\n<p>b</p>\n<p>d</p>\n")), {
    base: { line: 3, text: 'text "c"' },
    head: { line: 3, text: 'text "d"' },
  });
});

test("a page the parser cannot read pushes its diagnostic, so a sweep that breaks a page reads as a change", () => {
  const read = readerOf("src/pages/a.astro")!;
  assert.deepEqual(
    read("<div>\n").filter((t) => t.text.startsWith("diagnostic")),
    [{ text: "diagnostic error Unexpected token", line: 2 }],
  );
});
