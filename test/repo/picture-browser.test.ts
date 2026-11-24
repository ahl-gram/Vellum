import test from "node:test";
import assert from "node:assert/strict";
import { ciJob } from "../../test-support/ci-job.ts";

const VARIABLES = [
  "        env:",
  "          VELLUM_BROWSER: /usr/bin/google-chrome",
  "          VELLUM_REQUIRE_BROWSER: '1'",
  "",
];

test("PIC11 the publish build and every lane's build require a browser to press the Primer's pictures, at the lanes' Chrome (Issue #1155 M3)", () => {
  assert.ok(
    ciJob("build", ".github/workflows/deploy.yml").includes(
      ["      - run: npm ci", "      - name: Build site into dist/", "        run: npm run build", ...VARIABLES].join(
        "\n",
      ),
    ),
    "deploy.yml's build step",
  );
  assert.ok(
    ciJob("build-and-e2e").includes(
      [
        "      - name: Build site into dist/",
        "        if: steps.scope.outputs.docs_only != 'true'",
        "        run: npm run build",
        ...VARIABLES,
      ].join("\n"),
    ),
    "ci.yml's build step",
  );
});
