import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { copySources, REPO, SERVED_SOURCES, sourceFor, type ServedSource } from "../../scripts/served-sources.ts";

const SOURCES: readonly ServedSource[] = [
  { dir: "styles", types: { ".css": "text/css; charset=utf-8" } },
  { dir: "static", types: { ".svg": "image/svg+xml" } },
];

const put = (repo: string, rel: string, body: string): void => {
  const file = join(repo, rel);
  mkdirSync(join(file, ".."), { recursive: true });
  writeFileSync(file, body);
};

const fixture = (): string => {
  const repo = mkdtempSync(join(tmpdir(), "vellum-sources-"));
  put(repo, "styles/a.css", "a { color: red; }\n");
  put(repo, "styles/room/index.css", "room { color: blue; }\n");
  put(repo, "styles/room/x.js", "export {};\n");
  mkdirSync(join(repo, "styles/d.css"), { recursive: true });
  put(repo, "static/b.svg", "<svg id='b'/>\n");
  put(repo, "static/c.css", "c { color: green; }\n");
  put(repo, "outside.css", "outside { color: black; }\n");
  return repo;
};

test("a request finds a served file in the first source that keeps its kind, and nothing else: another kind, a folder, a missing file or a path out (Issue #768)", () => {
  const repo = fixture();
  try {
    const css = "text/css; charset=utf-8";
    assert.deepEqual(sourceFor(repo, SOURCES, "/a.css"), { file: join(repo, "styles/a.css"), type: css });
    assert.deepEqual(sourceFor(repo, SOURCES, "/room/index.css"), {
      file: join(repo, "styles/room/index.css"),
      type: css,
    });
    assert.deepEqual(sourceFor(repo, SOURCES, "/b.svg"), { file: join(repo, "static/b.svg"), type: "image/svg+xml" });
    for (const [pathname, why] of [
      ["/room/x.js", "a kind no source keeps"],
      ["/room/", "a folder with no extension"],
      ["/d.css", "a folder named like a sheet"],
      ["/missing.css", "a file nothing holds"],
      ["/c.css", "a kind only the other source keeps, found in the source that does not"],
      ["/../outside.css", "a path out of its source"],
      ["/room/../../outside.css", "a path out through a folder"],
    ] as const) {
      assert.equal(sourceFor(repo, SOURCES, pathname), null, `${pathname} (${why}) should not be served`);
    }
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test("the build copies every served source file to its address unchanged and nothing else beside them, and refuses a path the built tree already holds (Issue #768)", async () => {
  const repo = fixture();
  const out = join(repo, "out");
  const out2 = join(repo, "out2");
  try {
    put(repo, "styles/.DS_Store", "finder");
    put(repo, "styles/room/notes.txt", "a note");
    put(repo, "styles/room/index.css.swp", "swap");
    const copied = await copySources(repo, SOURCES, out);
    assert.deepEqual(
      copied,
      ["a.css", "b.svg", "room/index.css"],
      "the copy names exactly the files of a kind a source keeps, sorted",
    );
    for (const [rel, from] of [
      ["a.css", "styles/a.css"],
      ["b.svg", "static/b.svg"],
      ["room/index.css", "styles/room/index.css"],
    ] as const) {
      assert.equal(
        readFileSync(join(out, rel), "utf8"),
        readFileSync(join(repo, from), "utf8"),
        `${rel} should be its source's bytes`,
      );
    }
    assert.deepEqual(
      readdirSync(out, { recursive: true }).map(String).sort(),
      ["a.css", "b.svg", "room", "room/index.css"],
      "nothing but the three files and their folder reached the built tree",
    );
    put(repo, "out2/room/index.css", "already built");
    await assert.rejects(
      copySources(repo, SOURCES, out2),
      (error: NodeJS.ErrnoException) => error.code === "EEXIST",
      "a source file claiming an address the build already holds should fail the build",
    );
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

// A cap on a hang, never a budget (2026-10-18: the listing ran in under 10 ms on a Mac, so 30 s is three orders above it); a timed-out spawnSync returns status null, which the status check below turns into a failure.
const GIT_TIMEOUT_MS = 30_000;

test("every tracked file under a served source is a kind that source keeps, so none is left out of the build (Issue #768)", () => {
  for (const source of SERVED_SOURCES) {
    const listing = spawnSync("git", ["ls-files", "-z", "--", source.dir], {
      cwd: REPO,
      encoding: "utf8",
      timeout: GIT_TIMEOUT_MS,
    });
    assert.equal(listing.status, 0, `git ls-files failed (${listing.status}, ${listing.error ?? listing.stderr})`);
    const tracked = listing.stdout.split("\0").filter(Boolean);
    assert.ok(tracked.length > 0, `git lists no file under ${source.dir}, so the check below reads nothing`);
    assert.deepEqual(
      tracked.filter((file) => !Object.hasOwn(source.types, extname(file))),
      [],
      `a tracked file under ${source.dir} of a kind it does not keep is neither built nor served`,
    );
  }
});
