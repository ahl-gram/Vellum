import { LANDFALL_HOLD_MS } from "../../../src/site/home/ceremony.ts";
import { veilMarkup } from "../../../src/site/home/veil.ts";
import { dropExpectedCancellations } from "../../support/console.ts";
import { readCam, atLandfall } from "../../support/home.ts";
import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import type { HomeKit } from "./kit.ts";
import { anchored } from "./reads.ts";
import { bounce } from "../../support/nav.ts";

export async function h7aVeil({ evaluate, send, check, shoot, sleep, PORT }: SuiteContext): Promise<void> {
  await evaluate(`sessionStorage.clear()`);
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let veiled = null;
  for (let i = 0; i < 100; i++) {
    try {
      veiled = await evaluate<{ status: string | null; rose: boolean; wordmark: string | null } | null>(`(() => {
        const v = document.getElementById("lf-veil");
        if (!v) return null;
        return {
          status: v.querySelector(".veil-status")?.textContent ?? null,
          rose: !!v.querySelector(".veil-rose .rose-needle"),
          wordmark: v.querySelector(".veil-wordmark")?.textContent ?? null,
        };
      })()`);
      if (veiled !== null && /^Sounding · \d+ fathom$/.test(veiled.status ?? "")) break;
    } catch {}
    await sleep(60);
  }
  check(
    "H7a a first arrival raises the veil: wordmark, rose, and the sounding line counting fathoms",
    veiled !== null &&
      veiled.rose &&
      veiled.wordmark === "Vellum" &&
      /^Sounding · \d+ fathom$/.test(veiled.status ?? ""),
    JSON.stringify(veiled),
  );
  await shoot("home-veil.png");
}

type Adopted = { veils: number; id: string | null; adopted: boolean; shape: boolean };

// The status line ticks while it is read, so the veil's shape and words are compared with that one line set aside.
const ADOPTED: Payload<Adopted> = `(() => {
  const veils = [...document.querySelectorAll(".veil")], v = veils[0];
  const want = new DOMParser().parseFromString(${JSON.stringify(veilMarkup())}, "text/html").body;
  const shape = (root) => [...root.querySelectorAll("*")].filter((e) => !e.classList.contains("veil-status")).map((e) => e.tagName + "." + (e.getAttribute("class") ?? "") + ":" + (e.children.length ? "" : e.textContent.trim()));
  return { veils: veils.length, id: v ? v.id : null, adopted: !!v && v.dataset.adopted !== undefined, shape: !!v && JSON.stringify(shape(v)) === JSON.stringify(shape(want)) };
})()`;

export async function h7cAdopted({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  let a = await evaluate(ADOPTED);
  for (let i = 0; i < 40 && !a.adopted; i++) {
    await sleep(60);
    a = await evaluate(ADOPTED);
  }
  check(
    "H7c the module adopts the pre-paint veil rather than raising a twin, and marks it adopted so the inline safety release stands down: one veil stands, the pre-paint one, its markup the one veilMarkup() writes (#457)",
    a.veils === 1 && a.id === "lf-veil" && a.adopted && a.shape,
    JSON.stringify(a),
  );
}

export async function h7bLandfall({ evaluate, check, shoot, sleep }: SuiteContext): Promise<void> {
  let landed7 = null;
  for (let i = 0; i < 160; i++) {
    try {
      landed7 = await evaluate(readCam);
    } catch {}
    if (atLandfall(landed7)) break;
    await sleep(75);
  }
  check(
    "H7b the veil lifts on its own and the flight settles on the isle at the landfall scale",
    atLandfall(landed7),
    JSON.stringify(landed7),
  );
  await shoot("home-landfall.png");
}

// 2026-10-26: the skip lands inside the key's own handler (veil.ts calls land(0) synchronously), so 4 tries keep the 120 ms the old pause allowed.
const SKIP_TRIES = 4;

export async function h8KeySkip({ evaluate, send, check, sleep, PORT, pressKey }: HomeKit): Promise<void> {
  // H8's teeth: before the key the camera provably sits at the wide anchorage (0.78 of fit), so the jump to the landfall scale can only come from the skip's land(0). The poll waits for the ANCHORAGE, not merely the veil: the pre-paint veil stands before the module boots, and a key in that window has no skip listener to hit (CI caught exactly that).
  await evaluate(`sessionStorage.clear()`);
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let before8 = null;
  for (let i = 0; i < 150; i++) {
    try {
      before8 = await evaluate(readCam);
    } catch {}
    if (anchored(before8)) break;
    await sleep(60);
  }
  const anchored8 = anchored(before8);
  const settle = makeSettle({ evaluate, sleep });
  await pressKey("Escape", "Escape", 27);
  const skipped = await settle(
    readCam,
    (d) => !anchored(d),
    "H8 the key moved the camera off the anchorage",
    SKIP_TRIES,
  );
  check(
    "H8 a real key skips the sounding: the veil is gone at once and the camera jumps from the anchorage to its destination",
    anchored8 && atLandfall(skipped),
    JSON.stringify({ before8, skipped }),
  );
}

export async function h8bHoldSkip({ evaluate, send, check, sleep, PORT, pressKey }: HomeKit): Promise<void> {
  await evaluate(`sessionStorage.clear()`);
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let at8b = null;
  for (let i = 0; i < 400; i++) {
    try {
      at8b = await evaluate(readCam);
    } catch {}
    if (at8b !== null && at8b.veil && at8b.status === "Landfall") break;
    await sleep(25);
  }
  const held8b = at8b !== null && at8b.veil && at8b.status === "Landfall" && !at8b.lifting;
  const settle = makeSettle({ evaluate, sleep });
  await pressKey("Escape", "Escape", 27);
  const after8b = await settle(
    readCam,
    (d) => !anchored(d),
    "H8b the key moved the camera off the anchorage",
    SKIP_TRIES,
  );
  // The skip must CANCEL the armed hold timer, not just close the veil: move the camera with a real "+" zoom, then prove no phantom lift flies it back (guard-prover round 2: land(0)'s deletion went red here, but an uncancelled holdTimer escaped, because its stray flight targets the destination the camera already holds and only a moved camera can see it).
  await evaluate(`document.getElementById("lf-stage").focus()`);
  await pressKey("+", "Equal", 187);
  await sleep(LANDFALL_HOLD_MS + 900, "window: past the hold, where a phantom lift would fly the camera");
  let zoomed8b = null;
  try {
    zoomed8b = await evaluate(readCam);
  } catch {}
  const zoomHeld = zoomed8b !== null && !zoomed8b.veil && Math.abs(zoomed8b.scale - zoomed8b.expected * 1.5) < 1e-3;
  check(
    "H8b a real key during the Landfall hold jumps straight to the settled view, and the cancelled ceremony never steals the camera back from a later gesture",
    held8b && atLandfall(after8b) && zoomHeld,
    JSON.stringify({ at8b, after8b, zoomed8b }),
  );
}

export async function h9CeremonyStandsDown({ evaluate, send, check, sleep, PORT }: SuiteContext): Promise<void> {
  // H9/H10 poll for the settled state rather than reading once after a fixed sleep (a one-shot read caught a still-loading page on a busy CI lane and saw transform none), and their teeth move to the invariant that NO sample ever sees the veil. The about:blank bounce (the suite-zoom Z13 idiom) keeps the first samples off the previous page, which already sits at the landfall scale.
  await bounce(send, `http://127.0.0.1:${PORT}/`);
  let returning = null;
  let sawVeil9 = false;
  for (let i = 0; i < 200; i++) {
    try {
      returning = await evaluate(readCam);
    } catch {}
    if (returning !== null && returning.veil) sawVeil9 = true;
    if (atLandfall(returning)) break;
    await sleep(75);
  }
  check(
    "H9 within a sitting the ceremony stands down: no sample ever sees a veil and the camera settles straight on the isle",
    atLandfall(returning) && !sawVeil9,
    JSON.stringify({ returning, sawVeil9 }),
  );

  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await evaluate(`sessionStorage.clear()`);
  await bounce(send, `http://127.0.0.1:${PORT}/`);
  let reduced10 = null;
  let sawVeil10 = false;
  for (let i = 0; i < 200; i++) {
    try {
      reduced10 = await evaluate(readCam);
    } catch {}
    if (reduced10 !== null && reduced10.veil) sawVeil10 = true;
    if (atLandfall(reduced10)) break;
    await sleep(75);
  }
  await send("Emulation.setEmulatedMedia", { features: [] });
  check(
    "H10 reduced motion asks for no ceremony at all: no sample ever sees a veil, the camera settles straight on the isle (#457)",
    atLandfall(reduced10) && !sawVeil10,
    JSON.stringify({ reduced10, sawVeil10 }),
  );
}

// Installed before the page, so a veil the inline script raises is counted however soon the module's boot takes it down, which a polled sample can miss.
const VEIL_WATCH = `window.__lfVeils = 0; new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n.id === "lf-veil") window.__lfVeils++; }).observe(document, { childList: true, subtree: true });`;

async function veilsRaised({ evaluate, send, sleep, PORT }: SuiteContext): Promise<number> {
  await bounce(send, `http://127.0.0.1:${PORT}/`);
  for (let i = 0; i < 200; i++) {
    const n = await evaluate<number | null>(
      `location.pathname === "/" && document.querySelector("#lf-stage.cam") ? window.__lfVeils : null`,
    ).catch(() => null);
    if (n !== null) return n;
    await sleep(50);
  }
  throw new Error("H10b: home never booted");
}

export async function h10bInlinePredicate(ctx: SuiteContext): Promise<void> {
  const { evaluate, send, check } = ctx;
  const watch = await send<{ identifier: string }>("Page.addScriptToEvaluateOnNewDocument", { source: VEIL_WATCH });
  let counts: number[];
  try {
    await evaluate(`sessionStorage.clear()`);
    const first = await veilsRaised(ctx);
    const returning = await veilsRaised(ctx);
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    await evaluate(`sessionStorage.clear()`);
    counts = [first, returning, await veilsRaised(ctx)];
  } finally {
    await send("Emulation.setEmulatedMedia", { features: [] });
    await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: watch.identifier });
  }
  check(
    "H10b the pre-paint script raises its veil on a first arrival alone: a return within the sitting and a reduced-motion first arrival each raise none, counted by an observer installed before the page, the plain first arrival raising one, the same run's control (#457)",
    JSON.stringify(counts) === JSON.stringify([1, 0, 0]),
    JSON.stringify({ first: counts[0], returning: counts[1], reduced: counts[2] }),
  );
}

export function h11Clean(ctx: SuiteContext, errBase2: number, httpBase2: number): void {
  const { check, consoleErrors, http4xx } = ctx;
  const errDelta2 = dropExpectedCancellations(consoleErrors.slice(errBase2));
  const httpDelta2 = http4xx.slice(httpBase2).filter((u) => !/favicon/i.test(u));
  check(
    "H11 the ceremony flow is clean (no console errors, no new 4xx)",
    errDelta2.length === 0 && httpDelta2.length === 0,
    [...errDelta2, ...httpDelta2].join(" | ") || "clean",
  );
}
