import type { LandfallKit } from "./kit.ts";

export async function l10NoScriptGet({
  evaluate,
  send,
  check,
  sleep,
  PORT,
  clickAt,
  centerOf,
}: LandfallKit): Promise<void> {
  // L10/L11: the seed form's no-JS GET fallback (Issue #454: "no-JS GET fallback degrading to today's world"), then the JS-on control proving the Explorer ignores the query (bare visit and ?seed=777 visit must show the SAME seed; comparing to 777's absence would flake the day the daily seed IS 777).
  await send("Emulation.setScriptExecutionDisabled", { value: true });
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let formReady = false;
  for (let i = 0; i < 120; i++) {
    try {
      formReady = await evaluate<boolean>(`(() => {
        const i2 = document.getElementById("seed-input");
        if (!i2) return false;
        const r = i2.getBoundingClientRect();
        const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return hit === i2;
      })()`);
    } catch {}
    if (formReady === true) break;
    await sleep(150);
  }
  let drawPt = null;
  if (formReady === true) {
    await evaluate(`(() => { const i2 = document.getElementById("seed-input"); if (i2) i2.value = "777"; })()`);
    drawPt = await centerOf("#seed-form button.primary");
    if (drawPt !== null) await clickAt(drawPt.x, drawPt.y);
  }
  let nojs = null;
  for (let i = 0; i < 120 && drawPt !== null; i++) {
    try {
      nojs = await evaluate<{ path: string; search: string; hash: string; h1: string | null }>(
        `({ path: location.pathname, search: location.search, hash: location.hash, h1: document.querySelector("h1")?.textContent ?? null })`,
      );
      // The break must demand everything the check asserts: navigation COMMITS before the document parses, so a path-only break snapshots h1 null on a slow machine (CI 2026-08-25, locally unreproducible).
      if (nojs.path === "/explorer/" && (nojs.h1 ?? "").includes("Explorer")) break;
    } catch {}
    await sleep(100);
  }
  await send("Emulation.setScriptExecutionDisabled", { value: false });
  check(
    "L10 scripts off, the seed form still delivers: a real click submits the native GET to explorer/?seed=777, no hash, the Explorer shell standing",
    formReady === true &&
      nojs !== null &&
      nojs.path === "/explorer/" &&
      nojs.search === "?seed=777" &&
      nojs.hash === "" &&
      (nojs.h1 ?? "").includes("Explorer"),
    JSON.stringify({ formReady, drawPt, nojs }),
  );
}

export async function l11IgnoresQuery({ evaluate, send, check, PORT, seedShown }: LandfallKit): Promise<void> {
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/` });
  const bareSeed = await seedShown();
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/?seed=777` });
  const querySeed = await seedShown();
  const queryKept = await evaluate<string>(`location.search`);
  check(
    "L11 with scripts on the Explorer ignores the query and degrades to today's world: the ?seed=777 visit draws the same seed the bare visit does",
    bareSeed !== null && querySeed === bareSeed && queryKept === "?seed=777",
    JSON.stringify({ bareSeed, querySeed, queryKept }),
  );
}
