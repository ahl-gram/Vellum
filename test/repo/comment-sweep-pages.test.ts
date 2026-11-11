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
