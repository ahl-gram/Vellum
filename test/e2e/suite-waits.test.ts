import { test } from "node:test";
import assert from "node:assert/strict";
import { broadsideKit } from "../../e2e/suites/broadside/kit.ts";
import { br9Authored } from "../../e2e/suites/broadside/room.ts";
import { pr36Authored } from "../../e2e/suites/print-room/room.ts";
import { pr40RunnerLayout } from "../../e2e/suites/print-room/runner-layout.ts";
import { pb3fGlassLeans } from "../../e2e/suites/prospect.ts";
import { prospectKit } from "../../e2e/suites/prospect/kit.ts";
import { backHome, pb16ScriptsOff } from "../../e2e/suites/prospect/room.ts";
import { rr38Authored } from "../../e2e/suites/reading-room/room.ts";
import { rb5cLeans } from "../../e2e/suites/ribbon.ts";
import { ROOMS } from "../../e2e/suites/slide-away/kit.ts";
import type { SuiteContext } from "../../e2e/types.ts";

const GONE = "eval exception: TypeError: Cannot read properties of null (reading 'getBoundingClientRect')";
const AWAY = "({ path: location.pathname, ready: document.readyState })";

type Leaning = {
  evaluate: () => Promise<unknown>;
  check: (name: string, ok: unknown) => void;
  sleep: () => Promise<void>;
  glassHome: () => Promise<void>;
};
const LEANS = [
  {
    code: "PB3f",
    leaned: { zoomed: true, k: 1.4 },
    lean: (k: Leaning) => pb3fGlassLeans(k as unknown as Parameters<typeof pb3fGlassLeans>[0]),
  },
  {
    code: "RB5c",
    leaned: { zoomed: true, k: 2.6, on: 2, cx: 0.5, cy: 0.5, nx: 0.5, ny: 0.5 },
    lean: (k: Leaning) => rb5cLeans(k as unknown as Parameters<typeof rb5cLeans>[0]),
  },
] as const;

for (const { code, leaned, lean } of LEANS) {
  test(`${code} takes its leaning check, then sends the Glass home through its kit's glassHome and lets that wait's failure stand`, async () => {
    const checked: { code: string | undefined; ok: boolean }[] = [];
    const stuck = new Error("settle timeout glass-home: false");
    let sent = 0;
    const k: Leaning = {
      evaluate: () => Promise.resolve(leaned),
      check: (name, ok) => void checked.push({ code: name.split(" ")[0], ok: !!ok }),
      sleep: () => Promise.resolve(),
      glassHome: () => {
        sent++;
        return Promise.reject(stuck);
      },
    };
    await assert.rejects(lean(k), (err: unknown) => err === stuck);
    assert.equal(sent, 1, "the check did not send the Glass home through its kit, or sent it more than once");
    assert.deepEqual(
      checked,
      [{ code, ok: true }],
      "the leaning check was not taken, alone and passing, before the Glass went home",
    );
  });
}

const page = (answer: (expression: string) => unknown): SuiteContext =>
  ({
    evaluate: (expression: string): Promise<unknown> => {
      const a = answer(expression);
      return a instanceof Error ? Promise.reject(a) : Promise.resolve(a);
    },
    send: (): Promise<unknown> => Promise.resolve({}),
    sleep: (): Promise<void> => Promise.resolve(),
    check: (): void => undefined,
    PORT: 8765,
  }) as unknown as SuiteContext;

const throwsOn =
  (marker: string) =>
  (expression: string): unknown =>
    expression.includes(marker) ? new Error(GONE) : null;

type Site = {
  site: string;
  label: string;
  answer: (expression: string) => unknown;
  run: (ctx: SuiteContext) => Promise<unknown>;
};

const SITES: readonly Site[] = [
  { site: "PR36", label: "print-room-scripts-off", answer: throwsOn(".stage noscript .status"), run: pr36Authored },
  {
    site: "PR40",
    label: `PR40 ${ROOMS[0]!.id} staged`,
    answer: throwsOn("document.fonts.status"),
    run: pr40RunnerLayout,
  },
  {
    site: "BR9",
    label: "explorer-scripts-off",
    answer: throwsOn(".stage noscript .status"),
    run: (ctx) => br9Authored(broadsideKit(ctx)),
  },
  {
    site: "PB16",
    label: "prospect-scripts-off",
    answer: throwsOn('lay: !!document.getElementById("pp-lay")'),
    run: (ctx) => pb16ScriptsOff(prospectKit(ctx)),
  },
  {
    site: "PB18's hop to the Q & A",
    label: "prospect-to-faq",
    answer: throwsOn(AWAY),
    run: (ctx) => backHome(prospectKit(ctx), "warm", false),
  },
  {
    site: "PB18's Back",
    label: "prospect-back",
    answer: (expression) =>
      expression === AWAY ? { path: "/faq/", ready: "complete" } : throwsOn("marker: window.__pb18")(expression),
    run: (ctx) => backHome(prospectKit(ctx), "warm", false),
  },
  {
    site: "RR38",
    label: "reading-room-scripts-off",
    answer: throwsOn('frame: !!document.querySelector(".rf")'),
    run: rr38Authored,
  },
];

for (const { site, label, answer, run } of SITES) {
  test(`the settle in ${site} reads past a read that throws and, when every one does, times out naming that read's error`, async () => {
    await assert.rejects(
      run(page(answer)),
      (err: Error) => err.message === `settle timeout ${label}: null (the last read threw: ${GONE})`,
    );
  });
}
