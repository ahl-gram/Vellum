// The CI runner's measured layout, staged on this machine by VELLUM_E2E_RUNNER_LAYOUT=1 (Issue #1047): what differs, as data, the sheet built from it, and the script that adopts a sheet before a page's own scripts run.

type RunnerSelect = { readonly selector: string; readonly px: number };

interface RunnerLayoutEnv {
  readonly [key: string]: string | undefined;
}

// 2026-10-24: the "№" lies outside this face's Latin subset, so each system draws it from its own fallback, the runner from Liberation Serif, metric-compatible with the Times New Roman staged here; PR37's and RB12's titles read 2.31 px narrower on the runner, and the fingerprint's "Chart № 42" reads 98.02 px there (CI run 40142127745) against 98.03 px staged and 100.31 px unstaged on the Mac harness browser, so 0.01 px, the line's last printed digit, is the staged gap.
export const RUNNER_NUMERO_FAMILY = "IM Fell English SC";

export const RUNNER_SELECTS: readonly RunnerSelect[] = [
  // 2026-10-24: 5 px shorter on the runner than the Mac harness browser's 34.21875, read as PR38's reserve 1 px under the Mac's, its select beside an input, RB12's 5 px under, two selects alone, and the fingerprint's own select, 29.22 px on the runner (CI run 40142127745).
  { selector: ".folio-controls select.control", px: 29.21875 },
  // 2026-10-24: 4 px shorter on the runner than the Mac harness browser's 27.375, read as PR37's Press row 145.90625 px tall against the Mac's 149.90625.
  { selector: ".legend-head select", px: 23.375 },
];

export function runnerLayoutCss(family: string, selects: readonly RunnerSelect[]): string {
  const face = `@font-face { font-family: "${family}"; src: local("Times New Roman"); unicode-range: U+2116; }`;
  return [face, ...selects.map((s) => `${s.selector} { height: ${String(s.px)}px; }`)].join(" ");
}

export const RUNNER_LAYOUT_CSS = runnerLayoutCss(RUNNER_NUMERO_FAMILY, RUNNER_SELECTS);

export function runnerLayoutScript(css: string): string {
  return `(() => { const s = new CSSStyleSheet(); s.replaceSync(${JSON.stringify(css)}); document.adoptedStyleSheets = [...document.adoptedStyleSheets, s]; })();`;
}

const E2E_RUNNER_LAYOUT_VAR = "VELLUM_E2E_RUNNER_LAYOUT";
const RUNNER_MEASURED_ON =
  "ubuntu-24.04 image 20261012.334.1 with Google Chrome 155.0.8059.39, CI runs 40050364626 and 40051585426 of 2026-10-24";
const RUNNER_LAYOUT_SCRIPT = runnerLayoutScript(RUNNER_LAYOUT_CSS);

export const RUNNER_LAYOUT_MARK = `runner layout staged (${E2E_RUNNER_LAYOUT_VAR}=1)`;

export function runnerLayoutRequested(env: RunnerLayoutEnv): boolean {
  const raw = env[E2E_RUNNER_LAYOUT_VAR];
  if (raw === undefined || raw === "") return false;
  if (raw === "1") return true;
  throw new Error(
    `${E2E_RUNNER_LAYOUT_VAR} must be 1 to stage the CI runner's layout, or unset, not ${JSON.stringify(raw)}: any other value would run on this machine's layout while it reads as the runner's`,
  );
}

export async function applyRunnerLayout(
  send: (method: string, params: Record<string, unknown>) => Promise<unknown>,
): Promise<string> {
  await send("Page.addScriptToEvaluateOnNewDocument", { source: RUNNER_LAYOUT_SCRIPT });
  return `RUNNER LAYOUT: ${E2E_RUNNER_LAYOUT_VAR}=1 stages the CI runner's measured layout (${RUNNER_MEASURED_ON}) over this machine's; a green run here is not a green CI run.`;
}
