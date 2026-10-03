import type { SuiteContext } from "../../types.ts";
import type { RunningHeadKit } from "./kit.ts";
import { APP, CHART, CLUSTER_NORMAL, expectedHead, FOLIO, HEAD_LEADED, HEAD_READ, matches, MEMBERS, near, PROSE, SHELLED } from "./reads.ts";
import type { Bad, Head, Heads } from "./reads.ts";

const poolAlpha = (color: string) => Number((String(color).match(/\/\s*([\d.]+)\)/) || String(color).match(/rgba\([^)]*,\s*([\d.]+)\)/) || [])[1] ?? "0");

export async function rhSweep({ evaluate, shoot, visit }: RunningHeadKit) {
  const heads: Record<string, Head | undefined> = {};
  const unreachable: string[] = [];
  for (const route of SHELLED) {
    if (!(await visit(route))) { unreachable.push(route); continue; }
    heads[route] = JSON.parse(await evaluate(HEAD_READ)) as Head;
    if (route === "/") await shoot("running-head-home.png");
    if (route === PROSE) await shoot("running-head-room.png");
  }
  return { heads, unreachable };
}

export function rh0OneH1({ check }: SuiteContext, heads: Heads, unreachable: string[], bad: Bad): void {
  const manyH1 = bad((h, r) => h.h1s.length === 1 && (r === "/" ? h.h1s[0]!.inHeader : h.h1s[0]!.inMain));
  check(
    "RH0 every shelled page delivers exactly one h1: home's in the cluster, a room's standing in the page (#461 ruling 1)",
    unreachable.length === 0 && manyH1.length === 0,
    unreachable.length
      ? `unreachable: ${unreachable.join(", ")}`
      : manyH1.map((r) => `${r}: ${JSON.stringify(heads[r]?.h1s)}`).join(" | ") || `${SHELLED.length}/${SHELLED.length} pages, one h1 each, placed right`,
  );
}

export function rh1NamesPage({ check }: SuiteContext, heads: Heads, bad: Bad): void {
  const wrongH1 = bad((h, r) => h.h1s.length === 1 && h.h1s[0]!.classes.includes(r === "/" ? "wordmark" : "room-name"));
  check(
    "RH1 the h1 names the page: the wordmark on home, the room name on every room page",
    wrongH1.length === 0,
    wrongH1.map((r) => `${r}: ${JSON.stringify(heads[r]?.h1s)}`).join(" | ") || `home=wordmark, ${SHELLED.length - 1} rooms=room-name`,
  );
}

export function rh2Members({ check }: SuiteContext, heads: Heads): void {
  const offenders: string[] = [];
  let pinned = 0;
  for (const route of SHELLED) {
    const h = heads[route];
    if (!h) { offenders.push(`${route}: unreachable`); continue; }
    for (const m of MEMBERS) {
      const want = expectedHead(route)[m];
      if (want !== null) pinned++;
      if (!matches(h[m], want)) offenders.push(`${route} ${m}: ${JSON.stringify(h[m])}`);
    }
  }
  check(
    "RH2 every head member resolves its measured tag, weight, size, tracking and face, on every shelled page",
    offenders.length === 0,
    offenders.join(" | ") || `${pinned} members pinned across ${SHELLED.length} pages`,
  );
}

export function rh3Fixed({ check }: SuiteContext, heads: Heads, bad: Bad): void {
  const unfixed = bad((h, r) =>
    (r === "/" ? h.chromePosition === "absolute" && h.bandClip === null
               : CHART.includes(r) ? h.chromePosition === "fixed" && h.bandClip === null
               : h.chromePosition === "fixed" &&
                 typeof h.bandClip === "string" && h.bandClip.includes("169.6px") &&
                 typeof h.chromeBottom === "number" && h.chromeBottom <= 169.6));
  check(
    "RH3 the cluster is fixed inside the reserved band on rooms; on home it is bandless and RIDES the page; a chart room is bandless too, the chart running under a fixed cluster (#461 rulings 1+5; #472's ride; #462 ruling 7)",
    unfixed.length === 0,
    unfixed.map((r) => `${r}: chrome=${heads[r]?.chromePosition} bottom=${heads[r]?.chromeBottom} band=${heads[r]?.bandClip}`).join(" | ") ||
      `chrome fixed x${SHELLED.length - 1}, cluster inside the 169.6px band x${SHELLED.length - 1 - CHART.length}, home and the chart room bandless`,
  );
}

export function rh4OneDress({ check }: SuiteContext, heads: Heads): Head | undefined {
  const home = heads["/"];
  const prose = heads[PROSE];
  check(
    "RH4 the cluster is ONE dress: home's wordmark and footer resolve identical to a room's (the folio's grander-home literals retired, #461)",
    !!home && !!prose &&
      near(home.wordmark?.size, prose.wordmark?.size) && home.wordmark?.tracking === prose.wordmark?.tracking &&
      near(home.footer?.size, prose.footer?.size) && home.footer?.tracking === prose.footer?.tracking &&
      home.wordmark?.tag === "H1" && prose.wordmark?.tag === "P",
    home && prose
      ? `wordmark home=${home.wordmark?.tag}/${home.wordmark?.size} ${PROSE}=${prose.wordmark?.tag}/${prose.wordmark?.size}; footer ${home.footer?.size} vs ${prose.footer?.size}`
      : "a page was unreachable",
  );
  return prose;
}

export function rh5Leading({ check }: SuiteContext, heads: Heads): void {
  const misleaded = SHELLED.flatMap((r) => {
    const h = heads[r];
    if (!h) return [`${r}: unreachable`];
    const out: string[] = [];
    if (!h.wordmark || Math.abs(h.wordmark.ratio - 1.15) > 0.005) out.push(`${r} wordmark ratio ${h.wordmark?.ratio}`);
    for (const m of CLUSTER_NORMAL) {
      if (expectedHead(r)[m] === null) continue;
      if (h[m]?.lineHeight !== "normal") out.push(`${r} ${m} leading ${h[m]?.lineHeight}`);
    }
    if (FOLIO.includes(r)) {
      // The folio corner is chrome: its name pins the mockup's 1.2 and its tagline the corner's normal, so neither inherits the page's reading leading.
      if (!h.roomName || Math.abs(h.roomName.ratio - 1.2) > 0.005) out.push(`${r} roomName ratio ${h.roomName?.ratio}`);
      if (h.roomTagline?.lineHeight !== "normal") out.push(`${r} roomTagline leading ${h.roomTagline?.lineHeight}`);
    } else if (r !== "/") {
      for (const m of HEAD_LEADED) {
        if (!h[m] || Math.abs(h[m].ratio - 1.6) > 0.005) out.push(`${r} ${m} ratio ${h[m]?.ratio}`);
      }
    }
    return out;
  });
  check(
    "RH5 the cluster pins its own leading (wordmark 1.15, the rest normal) and the room head pins its own: 1.6 on the sheet, the corner's 1.2 and normal in a folio (#461 addendum; #462)",
    misleaded.length === 0,
    misleaded.join(", ") || `cluster + room head leading pinned across ${SHELLED.length} pages`,
  );
}

export function rh6Differ({ check }: SuiteContext, heads: Heads, prose: Head | undefined): void {
  const app = heads[APP];
  check(
    `RH6 the pages really do differ underneath: ${APP} leaves body leading unset where ${PROSE} sets it`,
    !!app && !!prose && app.bodyLineHeight === "normal" && app.bodyLineHeight !== prose.bodyLineHeight,
    app && prose ? `body leading ${APP}=${app.bodyLineHeight} vs ${PROSE}=${prose.bodyLineHeight}` : "a page was unreachable",
  );
}

export function rh9ContrastPins({ check }: SuiteContext, heads: Heads, bad: Bad): void {
  // Both pins rest on the 2026-08-26 plate read (out/461-plate/contrast-v2.json): line-tan on the deep 4.03 < 4.5, and home's bandless cluster at 1280x800 over the close-in chart as low as 1.17; Alex's calls the same day on Issue #461.
  const PARCHMENT = "rgb(239, 230, 207)";
  const dimTaglines = bad((h) => h.tagline?.color === PARCHMENT);
  check(
    "RH9a the tagline resolves parchment sitewide: line-tan measured 4.03 on the deep, under the 4.5 bar (#461, 2026-08-26 call)",
    dimTaglines.length === 0,
    dimTaglines.map((r) => `${r} tagline ${heads[r]?.tagline?.color}`).join(" | ") || `tagline parchment x${SHELLED.length}`,
  );

  // Issue #464: the Gallery joins home, the two pages whose content scrolls or rides under the cluster (a pale plate measured the tagline at 2.26:1 without the pool).
  const POOLED = ["/", "/gallery/"];
  const washWrong = bad((h, r) =>
    POOLED.includes(r) ? !!h.chromeWash && h.chromeWash.content !== "none" && /blur\(/.test(h.chromeWash.filter) && poolAlpha(h.chromeWash.backgroundColor) >= 0.8
              : !!h.chromeWash && h.chromeWash.content === "none");
  check(
    "RH9b home's chrome carries its wash, a blurred pool of the chart ink since #480, the Gallery's too since #464 (its plates scroll under the cluster), and every other room's carries none, the band or the fitted stage being its ground (#461, 2026-08-26 call)",
    washWrong.length === 0,
    washWrong.map((r) => `${r} wash ${JSON.stringify(heads[r]?.chromeWash)}`).join(" | ") || "wash on home and the Gallery alone",
  );
}
