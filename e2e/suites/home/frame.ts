import { dropExpectedCancellations } from "../../support/console.ts";
import type { SuiteContext } from "../../types.ts";
import type { HomeKit } from "./kit.ts";
import { controlGold } from "./reads.ts";

export async function h0Loads({ evaluate, check, sleep }: SuiteContext) {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    let ok = null;
    try { ok = await evaluate<boolean>(`document.readyState === "complete" && !!document.getElementById("seed-form")`); } catch {}
    if (ok) { ready = true; break; }
    await sleep(75);
  }
  check("H0 the homepage loads with the seed form present", ready, "readyState complete + #seed-form");
  return ready;
}

export async function hVeilDown({ evaluate, sleep, pressKey }: HomeKit, ready: boolean): Promise<void> {
  // First arrival raises the veil (H7 proves it); settle it with a REAL key so H1-H5 and their plates measure the page. Synthetic .click() dispatches no pointerdown, and a key thrown before the module arms the skip hits nothing, so press until it lands.
  if (ready) {
    for (let i = 0; i < 40; i++) {
      await pressKey("Escape", "Escape", 27);
      await sleep(150);
      let up = true;
      try { up = await evaluate<boolean>(`!!document.getElementById("lf-veil")`); } catch {}
      if (!up) break;
    }
  }
}

export async function h1CornerForm({ evaluate, check }: SuiteContext, ready: boolean): Promise<void> {
  const frame = ready ? await evaluate<{ pos: string; right: number; top: number; inside: boolean; gold: string | null; doorsHidden: boolean } | null>(`(() => {
    const form = document.getElementById("seed-form");
    const stage = document.getElementById("lf-stage");
    if (!form || !stage) return null;
    const f = form.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    const cs = getComputedStyle(form);
    const btn = form.querySelector("button.primary");
    return { pos: cs.position, right: s.right - f.right, top: f.top - s.top,
      inside: f.left > s.left && f.right < s.right + 1 && f.top > s.top && f.bottom < s.bottom,
      gold: btn ? getComputedStyle(btn).backgroundColor : null,
      doorsHidden: ["explorer", "reading-room", "atlas", "gallery"].every((id) => {
        const c = document.getElementById("lf-card-" + id);
        return c !== null && c.offsetParent === null;
      }) };
  })()`) : null;
  check(
    "H1 the seed form floats as the mockup's corner chrome: absolute in the stage's top-right, the gold Draw it, and no door slip showing on a healthy load",
    !!frame && frame.pos === "absolute" && frame.inside && frame.right > 10 && frame.right < 60
      && frame.top > 10 && frame.top < 60 && controlGold(frame.gold) && frame.doorsHidden,
    JSON.stringify(frame),
  );
}

export async function h2Hook({ evaluate, check, shoot }: SuiteContext, ready: boolean): Promise<void> {
  const hero = ready ? await evaluate<{ hook: string | null; seed: string | null; lineStyle: string | null }>(`(() => {
    const hook = document.querySelector(".lf-seed .seed-hook");
    const input = document.getElementById("seed-input");
    const line = document.querySelector(".lf-seed .seed-gloss");
    return { hook: hook ? hook.innerText : null, seed: input ? input.value : null,
      lineStyle: line ? getComputedStyle(line).fontStyle : null };
  })()`) : null;
  check(
    "H2 the hook reads as ratified, the seed input is prefilled 42, the gloss is italic",
    // @ts-expect-error a hook the page never seated reads null, and a pattern test reads null as the text "null", so H2 reads false and reds by name
    !!hero && /Give Vellum a number\./.test(hero.hook) && /It gives you back a world\./.test(
      // @ts-expect-error the same hook, which the pattern test before has already read false for if it is null
      hero.hook) && hero.seed === "42" && hero.lineStyle === "italic",
    JSON.stringify(hero),
  );
  await shoot("home-seed-chrome.png");
}

export async function h3Narrow({ evaluate, send, check, shoot, sleep, setMobileViewport, clearMobile, PORT }: SuiteContext): Promise<void> {
  await setMobileViewport(390, 900);
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let mobileReady = false;
  for (let i = 0; i < 100; i++) {
    let ok = null;
    try { ok = await evaluate<boolean>(`document.readyState === "complete" && !!document.getElementById("seed-form")`); } catch {}
    if (ok) { mobileReady = true; break; }
    await sleep(75);
  }
  const mobile = mobileReady ? await evaluate<{ innerWidth: number; scrollW: number; inViewport: boolean; glossShown: string; inputInsidePanel: boolean; drawItLines: number } | null>(`(() => {
    const form = document.getElementById("seed-form");
    const gloss = document.querySelector(".lf-seed .seed-gloss");
    const input = document.getElementById("seed-input");
    const btn = form ? form.querySelector("button.primary") : null;
    if (!form || !gloss || !input || !btn) return null;
    const f = form.getBoundingClientRect();
    const i = input.getBoundingClientRect();
    const r = new Range();
    r.selectNodeContents(btn);
    return { innerWidth: window.innerWidth, scrollW: document.documentElement.scrollWidth,
      inViewport: f.left >= 0 && f.right <= 390.5, glossShown: getComputedStyle(gloss).display,
      inputInsidePanel: i.left >= f.left - 0.5 && i.right <= f.right + 0.5,
      drawItLines: r.getClientRects().length };
  })()`) : null;
  check(
    "H3 at 390px the corner form stays whole in the viewport, its controls whole inside the panel, Draw it on one line, the gloss stood down, nothing scrolling sideways",
    !!mobile && mobile.innerWidth === 390 && mobile.scrollW === 390 && mobile.inViewport
      && mobile.inputInsidePanel && mobile.drawItLines === 1 && mobile.glossShown === "none",
    JSON.stringify(mobile),
  );
  await shoot("home-seed-chrome-390.png");
  await clearMobile();
}

export async function h4DrawIt({ evaluate, send, check, shoot, sleep, PORT }: SuiteContext): Promise<void> {
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let ready = false;
  for (let i = 0; i < 100; i++) {
    let ok = null;
    try { ok = await evaluate<boolean>(`document.readyState === "complete" && !!document.getElementById("seed-form")`); } catch {}
    if (ok) { ready = true; break; }
    await sleep(75);
  }

  if (ready) {
    await evaluate(`(() => {
      const i = document.getElementById("seed-input");
      i.value = "777";
      document.querySelector("#seed-form button").click();
    })()`);
  }
  // The Explorer canonicalizes a bare #seed=N on boot, so accept any hash keeping seed=777; the intercept itself is proven by the SEARCH staying empty (a ?seed= GET would mean the inline script never ran).
  let landed = null;
  let drew = false;
  for (let i = 0; i < 200; i++) {
    try {
      landed = await evaluate<string>(`location.pathname + location.search + location.hash`);
      if (/^\/explorer\/#(.*&)?seed=777(&|$)/.test(landed)) {
        drew = await evaluate<boolean>(`(() => {
          const svg = document.querySelector("#map svg");
          const status = document.getElementById("status");
          return !!svg && !!status && status.textContent === "" && svg.textContent.includes("CHART № 777");
        })()`);
        if (drew) break;
      }
    } catch {}
    await sleep(75);
  }
  check(
    "H4 Draw it lands on explorer/#seed=777 (hash form, no ?seed= GET) and that exact world is drawn",
    !!landed && /^\/explorer\/#(.*&)?seed=777(&|$)/.test(landed) && drew,
    `landed at ${landed}`,
  );
  await shoot("home-drawit-777.png");
}

export async function h5Home({ evaluate, send, sleep, PORT }: SuiteContext) {
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let backHome = false;
  for (let i = 0; i < 100; i++) {
    let ok = null;
    try { ok = await evaluate<boolean>(`document.readyState === "complete" && !!document.getElementById("seed-form")`); } catch {}
    if (ok) { backHome = true; break; }
    await sleep(75);
  }
  return backHome;
}

export async function h5aRefused({ evaluate, check, sleep }: SuiteContext, backHome: boolean): Promise<void> {
  // Navigation never commits inside the click's own task, so the "stayed" read must come AFTER a settle or the check is vacuous.
  let refused = null;
  if (backHome) {
    try {
      refused = await evaluate<{ flagged: boolean }>(`(() => {
        const i = document.getElementById("seed-input");
        i.value = "not a seed";
        document.querySelector("#seed-form button").click();
        return { flagged: !i.validity.valid };
      })()`);
      await sleep(600);
      const stayed = await evaluate<boolean>(`location.pathname === "/" && !!document.getElementById("seed-form")`);
      refused = refused ? { ...refused, stayed } : null; // eslint-disable-line @typescript-eslint/no-unnecessary-condition
    } catch { refused = null; }
  }
  check(
    "H5a garbage input is refused in place by the pattern (native hint, no navigation)",
    !!refused && refused.stayed && refused.flagged,
    JSON.stringify(refused),
  );
}

export async function h5bEmptySeed({ evaluate, check, sleep }: SuiteContext, backHome: boolean): Promise<void> {
  let degraded = null;
  if (backHome) {
    try {
      await evaluate(`(() => {
        const i = document.getElementById("seed-input");
        i.value = "";
        document.querySelector("#seed-form button").click();
      })()`);
    } catch {}
    for (let i = 0; i < 100; i++) {
      try {
        degraded = await evaluate<string>(`location.pathname + location.search + location.hash`);
        if (degraded.startsWith("/explorer/")) break;
      } catch {}
      await sleep(75);
    }
  }
  check(
    "H5b an empty seed reaches the intercept and degrades to the bare Explorer (no ?seed= GET)",
    !!degraded && degraded.startsWith("/explorer/") && !degraded.includes("?"),
    `landed at ${degraded}`,
  );
}

export function h6Clean(ctx: SuiteContext, errBase: number, httpBase: number): void {
  const { check, consoleErrors, http4xx } = ctx;
  const errDelta = dropExpectedCancellations(consoleErrors.slice(errBase));
  const httpDelta = http4xx.slice(httpBase).filter((u) => !/favicon/i.test(u));
  check(
    "H6 the home flow is clean (no console errors, no new 4xx)",
    errDelta.length === 0 && httpDelta.length === 0,
    [...errDelta, ...httpDelta].join(" | ") || "clean",
  );
}
