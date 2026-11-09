// The Prospect as the browser built it (Issue #779 part 2g): what the boot does before and after the first plate, and the table's two homes.
import { countLine } from "../../../src/site/explorer/chart-drawer.ts";
import { parseTableValue } from "../../../src/site/shared/table-address.ts";
import { makeSettle } from "../../support/settle.ts";
import type { Payload } from "../../types.ts";
import { STORE, type ProspectKit } from "./kit.ts";
import { FETCHED_PLACES, PLACE_PATH } from "../render/place.ts";
import { bounce } from "../../support/nav.ts";

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

const WATCH = `(() => { const make = URL.createObjectURL.bind(URL), revoke = URL.revokeObjectURL.bind(URL); window.__pb17 = { first: null, revoked: [] };
  URL.createObjectURL = (b) => { if (!window.__pb17.first) { const r = document.getElementById("pp-ribbon-link"), l = document.getElementById("pp-lay"); window.__pb17.first = [r && r.style.display, l && l.style.display]; } return make(b); };
  URL.revokeObjectURL = (u) => { window.__pb17.revoked.push(u); return revoke(u); }; })();`;
type Seat = string[];
const SEAT = `(() => { const s = document.getElementById("sheet").style; return [document.querySelector(".legend").style.left, document.querySelector(".stage").style.getPropertyValue("--reserve-bottom"), s.width, s.height]; })()`;
const RESEAT: Payload<{ before: Seat; planted: Seat; after: Seat }> =
  `(() => { const before = ${SEAT}, l = document.querySelector(".legend").style, st = document.querySelector(".stage").style, sh = document.getElementById("sheet").style, px = (v) => parseFloat(v) + 1 + "px";
  l.left = px(l.left); st.setProperty("--reserve-bottom", px(st.getPropertyValue("--reserve-bottom"))); sh.width = px(sh.width); sh.height = px(sh.height);
  const planted = ${SEAT}; window.dispatchEvent(new Event("resize")); return { before, planted, after: ${SEAT} }; })()`;

export async function pb17Boot(k: ProspectKit): Promise<void> {
  const { evaluate, send, check, sleep, goto, opened } = k;
  const { identifier } = await send<{ identifier: string }>("Page.addScriptToEvaluateOnNewDocument", { source: WATCH });
  try {
    await goto("#seed=42&i=0");
    const st = await opened("the capital, watched from boot");
    const first = await evaluate<{ first: string[] | null; src: string }>(
      `({ first: window.__pb17.first, src: document.getElementById("pp-plate").src })`,
    );
    const seat = await evaluate(RESEAT);
    await evaluate(
      `(() => { document.getElementById("pp-year").value = "${st.presentYear - 300}"; document.getElementById("pp-year-form").requestSubmit(); return true; })()`,
    );
    const after = await makeSettle({ evaluate, sleep })<{
      src: string;
      year: number | null;
      status: string;
      revoked: string[];
    }>(
      `({ src: document.getElementById("pp-plate").src, year: window.__vellumProspectState() && window.__vellumProspectState().year, status: document.getElementById("pp-status").textContent, revoked: window.__pb17.revoked })`,
      (d) => d.year === st.presentYear - 300 && d.status === "",
      "prospect-year-engraved",
      200,
    );
    check(
      "PB17 the boot: until the first plate the Ribbon road and the filing press stand down, the refit runs after the folio is written so a fresh refit takes a planted legend, reserve and sheet away and leaves each where it put it, and engraving another year revokes the first plate's blob",
      same(first.first, ["none", "none"]) &&
        same(seat.before, seat.after) &&
        seat.planted.every((v, i) => v !== seat.before[i]) &&
        after.src !== first.src &&
        after.revoked.includes(first.src),
      JSON.stringify({ first, seat, after }),
    );
  } finally {
    await send("Page.removeScriptToEvaluateOnNewDocument", { identifier });
  }
}

export async function pb19PlaceLink(k: ProspectKit): Promise<void> {
  const { evaluate, check, goto, opened } = k;
  await goto("#seed=42&style=antique&type=island&outline=ne-1159315211&i=1");
  const st = await opened("a real place's plate");
  const fetched = await evaluate(FETCHED_PLACES);
  check(
    "PB19 a place's link reaches the Prospect, which engraves from that place",
    st.status === "" && st.blob && fetched.length === 1 && fetched[0] === PLACE_PATH,
    JSON.stringify({ status: st.status, blob: st.blob, fetched }),
  );
}

const S = (seat: string) => `k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.${seat}`;
const CAP = "k-p.seed-42.style-antique.i-0.year-1059";
const S1 = S("rung-2.lx-17.ly-13");
const S2 = S("rung-1.lx-4.ly-4");
const S3 = S("rung-2.lx-5.ly-5");
const counted = (table: string): string => countLine(parseTableValue(table));
type Home = {
  path: string;
  marker: string | null;
  nav: string | undefined;
  table: string | null;
  count: string | null;
  dim: boolean;
  drawn: boolean;
};
const HOME: Payload<Home> = `(() => { const p = document.getElementById("pp-lay"), st = window.__vellumProspectState && window.__vellumProspectState();
  return { path: location.pathname, marker: window.__pb18 ?? null, nav: performance.getEntriesByType("navigation")[0] && performance.getEntriesByType("navigation")[0].type,
    table: new URLSearchParams(location.hash.slice(1)).get("table"), count: (document.getElementById("pp-lay-count") || {}).textContent ?? null, dim: !!p && p.classList.contains("dim"), drawn: !!st }; })()`;

export async function backHome(k: ProspectKit, marker: string, unload: boolean): Promise<Home> {
  const { evaluate, sleep } = k;
  await evaluate(
    `(() => { window.__pb18 = "${marker}"; ${unload ? `window.addEventListener("unload", () => {});` : ""} setTimeout(() => { location.href = "/faq/"; }, 0); return true; })()`,
  );
  type Away = { path: string; ready: string };
  const away = makeSettle({ evaluate, sleep, tolerant: true });
  const home = makeSettle({ evaluate, sleep, tolerant: true });
  await away<Away>(
    `({ path: location.pathname, ready: document.readyState })`,
    (d) => d.path === "/faq/" && d.ready === "complete",
    "prospect-to-faq",
  );
  await evaluate(`(() => { setTimeout(() => history.back(), 0); return true; })()`);
  return home(
    HOME,
    (d, last) => d.path === "/prospect/" && d.drawn && !!last && JSON.stringify(d) === JSON.stringify(last),
    "prospect-back",
    200,
  );
}

export async function pb18TableHomes(k: ProspectKit): Promise<void> {
  const { evaluate, send, check, opened, page } = k;
  try {
    await evaluate(`localStorage.setItem(${STORE}, ${JSON.stringify(`${S1}_${S1}_${S2}`)})`);
    await bounce(send, page(`#seed=42&i=0&table=${CAP}_${CAP}`));
    await opened("the capital, handed a table");
    const linked = await evaluate(HOME);
    const cached = await backHome(k, "warm", false);
    await evaluate(`localStorage.setItem(${STORE}, ${JSON.stringify(`${S1}_${S2}_${S3}`)})`);
    const cold = await backHome(k, "cold", true);
    check(
      "PB18 the table's two homes on the Prospect: a link beats the device and the boot seats it through the gate (two copies arrive as one, already on the table); a cached Back re-seats the device's table (the page restored, not reloaded); a cold Back reads the device at boot (#634, ruled 2026-09-19)",
      linked.count === counted(CAP) &&
        linked.dim &&
        cached.marker === "warm" &&
        cached.table === `${S1}_${S2}` &&
        cached.count === counted(`${S1}_${S2}`) &&
        !cached.dim &&
        cold.marker === null &&
        cold.nav === "back_forward" &&
        cold.count === counted(`${S1}_${S2}_${S3}`),
      JSON.stringify({
        linked,
        cached,
        cold,
        want: [counted(CAP), counted(`${S1}_${S2}`), counted(`${S1}_${S2}_${S3}`)],
      }),
    );
  } finally {
    await k.forget();
  }
}
