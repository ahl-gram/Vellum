// The kit's dress across the sweep's rooms (Issue #779 part 2h): the status pill's fade, the house roles worn, the control idiom and the house primary.
import { SAY_FADE_MS } from "../../../src/site/shared/announce.ts";
import { nearRgba, tokenRgba } from "../../support/pixel.ts";
import type { SuiteContext } from "../../types.ts";
import { PORTFOLIO } from "./gestures.ts";
import { DISPLAY_FACE, FLOURISH_FACE } from "./reads.ts";
import type { KitSample, Role } from "./room.ts";

const PILL_ROOMS = [
  "/explorer/",
  "/print-room/",
  "/prospect/",
  "/ribbon/",
  "/reading-room/",
  "/seed-of-the-day/",
  "/specimen/",
  "/writing-room/",
  PORTFOLIO,
];

export function rh26Pill(check: SuiteContext["check"], kits: Record<string, KitSample | undefined>): void {
  const wrong: string[] = [];
  for (const route of PILL_ROOMS) {
    const p = kits[route]?.pill;
    if (!p) {
      wrong.push(`${route}: no status pill in the stage`);
      continue;
    }
    if (!p.prop.split(",").some((v) => v.trim() === "opacity")) wrong.push(`${route}: transition ${p.prop}`);
    if (Math.round(p.ms) !== SAY_FADE_MS) wrong.push(`${route}: ${p.ms}ms, want ${SAY_FADE_MS}`);
    if (p.rest !== "1") wrong.push(`${route}: at rest ${p.rest}`);
    if (p.faded !== "0") wrong.push(`${route}: under the class ${p.faded}`);
  }
  check(
    "RH26 every chart room's status pill fades: an opacity transition the announcer's own length, at rest 1 and 0 under the class",
    wrong.length === 0,
    JSON.stringify(wrong),
  );
}

function roleWear(kits: Record<string, KitSample | undefined>): string[] {
  const wrong: string[] = [];
  const at = (route: string, sel: string): Role | undefined => kits[route]?.roles[sel];
  const rem = (route: string): number => kits[route]?.rem ?? 16;
  const near = (route: string, got: number, want: number): boolean => Math.abs(got - want) <= 0.01 * rem(route);
  const want = (route: string, sel: string, ok: boolean): void => {
    if (!ok) wrong.push(`${route} ${sel}: ${JSON.stringify(at(route, sel))}`);
  };
  const home = at("/", "#seed-form button[type=submit]");
  want(
    "/",
    "#seed-form button[type=submit]",
    !!home && nearRgba(home.bg, tokenRgba("--control-gold")) && DISPLAY_FACE.test(home.family),
  );
  const seed = at("/", "#seed-input");
  want(
    "/",
    "#seed-input",
    !!seed && near("/", seed.width, 6.2 * rem("/")) && nearRgba(seed.bg, tokenRgba("--chart-ink", 0.45)),
  );
  const hunt = at("/seed-of-the-day/", ".hunt-intro");
  want(
    "/seed-of-the-day/",
    ".hunt-intro",
    !!hunt &&
      hunt.style === "italic" &&
      FLOURISH_FACE.test(hunt.family) &&
      nearRgba(hunt.color, tokenRgba("--ink-brown")),
  );
  return wrong;
}

function roleHeads(kits: Record<string, KitSample | undefined>): string[] {
  const wrong: string[] = [];
  const at = (route: string, sel: string): Role | undefined => kits[route]?.roles[sel];
  const rem = (route: string): number => kits[route]?.rem ?? 16;
  // The 0.01 rem of 2026-10-13 (Issue #779 part 2h): these are computed lengths, exact products of the root size, and a used width snaps to 1/64px (0.016px against 0.16px), so the headroom is tenfold; the guard prover's steps were 0.02 rem (the head's size), 0.041 rem (its spacing), 0.04 rem (a dateline's size, the seed input's width). The sweep's payload prints no lengths, so there is no measured worst case.
  const near = (route: string, got: number, want: number): boolean => Math.abs(got - want) <= 0.01 * rem(route);
  const want = (route: string, sel: string, ok: boolean): void => {
    if (!ok) wrong.push(`${route} ${sel}: ${JSON.stringify(at(route, sel))}`);
  };
  const datelines: ReadonlyArray<readonly [string, string]> = [
    ["/seed-of-the-day/", "#dateline"],
    ["/faq/", ".folio-room .dateline"],
  ];
  for (const [route, sel] of datelines) {
    const d = at(route, sel);
    want(
      route,
      sel,
      !!d &&
        d.caps === "small-caps" &&
        near(route, d.size, 0.85 * rem(route)) &&
        nearRgba(d.color, tokenRgba("--parchment")),
    );
  }
  for (const sel of ["#grp-land", "#grp-hand"]) {
    const head = at("/explorer/", sel);
    want(
      "/explorer/",
      sel,
      !!head &&
        near("/explorer/", head.size, 0.82 * rem("/explorer/")) &&
        head.spacing !== null &&
        near("/explorer/", head.spacing, 0.18 * 0.82 * rem("/explorer/")) &&
        head.weight === "600" &&
        head.transform === "uppercase" &&
        nearRgba(head.color, tokenRgba("--ink-faded")),
    );
  }
  const find = at("/glossary/", ".find input[type=search]");
  want(
    "/glossary/",
    ".find input[type=search]",
    !!find &&
      near("/glossary/", find.width, 11 * rem("/glossary/")) &&
      nearRgba(find.bg, tokenRgba("--chart-ink", 0.45)),
  );
  return wrong;
}

export function rh27Roles(check: SuiteContext["check"], kits: Record<string, KitSample | undefined>): void {
  const wrong = [...roleWear(kits), ...roleHeads(kits)];
  check("RH27 the house roles are worn where the pages author them", wrong.length === 0, JSON.stringify(wrong));
}

export function rh28Idiom(check: SuiteContext["check"], kits: Record<string, KitSample | undefined>): void {
  const wrong: string[] = [];
  const rem = kits["/explorer/"]?.rem ?? 16;
  const type = kits["/explorer/"]?.roles["#type"];
  if (!type) wrong.push("/explorer/ #type: absent");
  else {
    if (!nearRgba(type.bg, tokenRgba("--control-cream"))) wrong.push(`#type background ${JSON.stringify(type.bg)}`);
    if (type.bs !== "solid") wrong.push(`#type border style ${type.bs}`);
    if (!nearRgba(type.bc, tokenRgba("--ink-dark"))) wrong.push(`#type border colour ${JSON.stringify(type.bc)}`);
    if (type.radius !== "4px") wrong.push(`#type radius ${type.radius}`);
    if (Math.abs(type.size - 0.95 * rem) > 0.05 * rem) wrong.push(`#type size ${type.size}`);
  }
  const report = kits["/specimen/"]?.roles["#sb-report"];
  if (!report) wrong.push("/specimen/ #sb-report: absent");
  else {
    if (!nearRgba(report.bg, tokenRgba("--ink-dark"))) wrong.push(`#sb-report background ${JSON.stringify(report.bg)}`);
    if (!nearRgba(report.color, tokenRgba("--chart-paper")))
      wrong.push(`#sb-report colour ${JSON.stringify(report.color)}`);
  }
  check(
    "RH28 the control idiom as the house dresses a plain control and a plain primary",
    wrong.length === 0,
    JSON.stringify({ wrong, type, report }),
  );
}
