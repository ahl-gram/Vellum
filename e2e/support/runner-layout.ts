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
  void family;
  void selects;
  return "";
}

export const RUNNER_LAYOUT_CSS = runnerLayoutCss(RUNNER_NUMERO_FAMILY, RUNNER_SELECTS);

export function runnerLayoutScript(css: string): string {
  return `(() => { const s = new CSSStyleSheet(); s.replaceSync(${JSON.stringify(css)}); document.adoptedStyleSheets = [...document.adoptedStyleSheets, s]; })();`;
}

export function runnerLayoutRequested(env: RunnerLayoutEnv): boolean {
  void env;
  return false;
}

export function applyRunnerLayout(
  send: (method: string, params: Record<string, unknown>) => Promise<unknown>,
): Promise<string> {
  void send;
  return Promise.resolve("");
}
