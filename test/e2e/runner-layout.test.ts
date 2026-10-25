import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { plan } from "../../e2e/support/runner.ts";
import { RUNNER_LAYOUT_CSS, applyRunnerLayout, runnerLayoutCss } from "../../e2e/support/runner-layout.ts";

test("the runner stages the CI runner's layout only when VELLUM_E2E_RUNNER_LAYOUT is 1, and refuses any other value rather than run on this machine's layout", () => {
  assert.equal(plan({}).runnerLayout, false);
  assert.equal(plan({ VELLUM_E2E_RUNNER_LAYOUT: "" }).runnerLayout, false);
  assert.equal(plan({ VELLUM_E2E_RUNNER_LAYOUT: "1" }).runnerLayout, true);
  for (const value of ["0", "true", "yes", " 1"]) {
    assert.throws(
      () => plan({ VELLUM_E2E_RUNNER_LAYOUT: value }),
      /VELLUM_E2E_RUNNER_LAYOUT must be 1/,
      JSON.stringify(value),
    );
  }
});

test("applyRunnerLayout registers one new-document script, which adopts the runner's sheet beside the document's own sheets, and resolves to the line that says the run is staged", async () => {
  const sent: { method: string; params: Record<string, unknown> }[] = [];
  const send = (method: string, params: Record<string, unknown>): Promise<unknown> => {
    sent.push({ method, params });
    return Promise.resolve({ identifier: "1" });
  };
  const line = await applyRunnerLayout(send);
  assert.deepEqual(
    sent.map((s) => s.method),
    ["Page.addScriptToEvaluateOnNewDocument"],
  );
  const own = { own: true };
  const document = { adoptedStyleSheets: [own] as unknown[] };
  class Sheet {
    text = "";
    replaceSync(text: string): void {
      this.text = text;
    }
  }
  vm.runInNewContext(String(sent[0]!.params["source"]), { document, CSSStyleSheet: Sheet });
  assert.equal(document.adoptedStyleSheets.length, 2);
  assert.equal(document.adoptedStyleSheets[0], own, "the document's own adopted sheets were dropped");
  const adopted = document.adoptedStyleSheets[1];
  assert.ok(adopted instanceof Sheet, "the second adopted sheet is not the one the script built");
  assert.equal(adopted.text, RUNNER_LAYOUT_CSS);
  assert.match(line, /^RUNNER LAYOUT: VELLUM_E2E_RUNNER_LAYOUT=1 /);
});

test("the runner's sheet draws the numero sign from Times New Roman in the house display face and sets each select at the height measured on the runner, and runnerLayoutCss writes any such sheet", () => {
  assert.equal(
    RUNNER_LAYOUT_CSS,
    '@font-face { font-family: "IM Fell English SC"; src: local("Times New Roman"); unicode-range: U+2116; } .folio-controls select.control { height: 29.21875px; } .legend-head select { height: 23.375px; }',
  );
  assert.equal(
    runnerLayoutCss("Face", [{ selector: ".a b", px: 1.5 }]),
    '@font-face { font-family: "Face"; src: local("Times New Roman"); unicode-range: U+2116; } .a b { height: 1.5px; }',
  );
});
