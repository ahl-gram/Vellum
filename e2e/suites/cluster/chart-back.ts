import type { Payload } from "../../types.ts";
import { arrive, BIG, centre, FOLD, NAMES, PANEL, polled, pressAt, PRESS, RECT, sized } from "./chart.ts";
import type { Rect } from "./chart.ts";
import type { TrailKit } from "./trail.ts";

type Ride = { open: boolean; press: Rect; panel: Rect; scrollX: number; scrollY: number };
const RIDE: Payload<Ride> = `({ open: ${FOLD}.open, press: ${RECT}(${PRESS}), panel: ${RECT}(${PANEL}), scrollX, scrollY })`;

async function rides(k: TrailKit, page: string, sideways: boolean): Promise<string | null> {
  const before = await polled(k, RIDE, `AT7 rest ${page}`);
  await pressAt(k, centre(before.press).x, centre(before.press).y);
  const opened = await polled(k, RIDE, `AT7 open ${page}`);
  const to = sideways ? `left: document.documentElement.scrollWidth, top: 0` : `left: 0, top: 400`;
  await k.evaluate(`scrollTo({ ${to}, behavior: "instant" })`);
  const axis = sideways ? "scrollX" : "scrollY";
  const after = await k.settle(
    RIDE,
    (d, last) => d[axis] > 0 && last !== null && d[axis] === last[axis],
    `AT7 scrolled ${page}`,
  );
  const moved = (a: Rect, b: Rect, f: "x" | "y") => b[f] - a[f];
  const f = sideways ? "x" : "y";
  const by = -(after[axis] - opened[axis]);
  const good =
    opened.open &&
    after[axis] > 0 &&
    [moved(opened.press, after.press, f), moved(opened.panel, after.panel, f)].every((m) => Math.abs(m - by) <= 0.5) &&
    Math.abs(moved(opened.press, after.press, sideways ? "y" : "x")) <= 0.5 &&
    Math.abs(moved(opened.panel, after.panel, sideways ? "y" : "x")) <= 0.5;
  return good ? null : JSON.stringify({ opened, after });
}

export async function at7Rides(k: TrailKit): Promise<void> {
  const rows: string[] = [];
  try {
    await arrive(k, "/", BIG);
    rows.push(`1280 /: ${(await rides(k, "/", false)) ?? "ok"}`);
    await k.setNarrowViewport(640, 800);
    for (const page of ["/", "/explorer/", "/faq/"]) {
      await k.goto(page);
      rows.push(`640 ${page}: ${(await rides(k, page, true)) ?? "ok"}`);
    }
  } finally {
    await k.clearMobile();
    await sized(k, BIG);
  }
  k.check(
    NAMES.at7,
    rows.every((r) => r.endsWith(": ok")),
    rows.join(" | "),
  );
}

export async function at8Back(k: TrailKit): Promise<void> {
  const state: Payload<{ path: string; ready: string; warm: unknown; open: boolean | null }> =
    `({ path: location.pathname, ready: document.readyState, warm: window.__at8 ?? null, open: ${FOLD}?.open ?? null })`;
  try {
    await arrive(k, "/faq/", BIG);
    await k.evaluate(`window.__at8 = "warm"`);
    const press = await k.evaluate<Rect>(`${RECT}(${PRESS})`);
    await pressAt(k, centre(press).x, centre(press).y);
    await polled(k, state, "AT8 open");
    const glossary = await k.evaluate<Rect>(`${RECT}(${PANEL}.querySelector('a[href="/glossary/"] text'))`);
    await pressAt(k, centre(glossary).x, centre(glossary).y);
    await k.settle(state, (d) => d.path === "/glossary/" && d.ready === "complete", "AT8 at the Glossary");
    await k.evaluate<undefined>(`history.back()`).catch(() => undefined);
    const back = await k.settle(state, (d) => d.path === "/faq/" && d.ready === "complete", "AT8 back at the Q & A");
    k.check(NAMES.at8, back.warm === "warm" && back.open === false, JSON.stringify(back));
  } finally {
    await sized(k, BIG);
  }
}
