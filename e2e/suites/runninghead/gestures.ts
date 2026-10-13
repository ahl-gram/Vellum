// The kit's gestures and paper state across the sweep (Issue #779 part 2h): the printed read RH29 judges, the house ring and a nav link's rise.
import { sendKey } from "../../support/home.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import type { RunningHeadKit } from "./kit.ts";
import { SHELLED } from "./reads.ts";
import type { KitSample } from "./room.ts";

export const PORTFOLIO = "/explorer/portfolio/";

export const PRINTED_READ: Payload<string> = `(() => { const cs = (e, p) => getComputedStyle(e, p);
  const pathOf = (el) => el.tagName + (el.id ? "#" + el.id : "") + (el.classList.length ? "." + [...el.classList].join(".") : "");
  const corner = document.querySelector(".corner.tr"); let dom = null;
  if (corner) { const offenders = [];
    for (const el of [corner, ...corner.querySelectorAll("*")]) for (const pseudo of ["::before", "::after"]) {
      const c = cs(el, pseudo).content; if (c && c !== "none") offenders.push([pathOf(el), pseudo, c]); }
    dom = { offenders }; }
  const walk = { sheets: 0, unreadable: 0, kitArms: 0, offenders: [] };
  const visitSheet = (sheet) => { walk.sheets++; let rules; try { rules = sheet.cssRules; } catch { walk.unreadable++; return; }
    visit(rules, false, sheet.href || "inline"); };
  const screenOnly = (rule) => !!(rule.media && /^(only )?screen( and .*)?$/i.test(rule.media.mediaText));
  const visit = (rules, screen, href) => { for (const rule of rules) {
    if (rule.styleSheet) { visitSheet(rule.styleSheet); continue; }
    if (rule.cssRules && rule.cssRules.length) visit(rule.cssRules, screen || screenOnly(rule), href);
    if (rule.selectorText && /:{1,2}(before|after)\\b/i.test(rule.selectorText) && /\\.(tr|folio-room)\\b/i.test(rule.selectorText)) {
      const c = rule.style.getPropertyValue("content");
      if (c && c !== "none") { if (screen) walk.kitArms++; else walk.offenders.push([href, rule.selectorText, c]); } } } };
  for (const sheet of document.styleSheets) visitSheet(sheet);
  return JSON.stringify({ dom, walk });
})()`;

export function rh29Printed(check: SuiteContext["check"], kits: Record<string, KitSample | undefined>): void {
  const wrong: string[] = [];
  for (const route of [...SHELLED.filter((r) => r !== "/"), PORTFOLIO]) {
    const s = kits[route];
    if (!s) {
      wrong.push(`${route}: unreachable`);
      continue;
    }
    const p = s.printed;
    if (!p) {
      wrong.push(`${route}: no printed read`);
      continue;
    }
    if (!p.dom) wrong.push(`${route}: no corner to read`);
    else if (p.dom.offenders.length) wrong.push(`${route}: ${JSON.stringify(p.dom.offenders)}`);
    if (p.walk.offenders.length) wrong.push(`${route} walk: ${JSON.stringify(p.walk.offenders)}`);
    if (p.walk.unreadable !== 0) wrong.push(`${route}: ${p.walk.unreadable} sheet(s) unreadable`);
    if (p.walk.kitArms < 1) wrong.push(`${route}: the walk saw no kit arm in force on screen`);
  }
  const control = kits["/gallery/"]?.before;
  check(
    "RH29 on paper no room paints its folio's panel, in the state it stands in or in any other, and the screen still does where the kit says so (blind spot: a sheet no served page links, a rule a script inserts after the read, a nested rule that reaches the corner through & rather than naming it, and a rule that names the corner by an attribute selector rather than a dotted .tr or .folio-room; each errs toward a miss)",
    wrong.length === 0 && control === '""',
    JSON.stringify({ wrong, control }),
  );
}

const RING: Payload<{ visible: boolean; width: string; style: string } | null> =
  `(() => { const a = document.querySelector(".sheet a"); if (!a) return null;
  a.focus(); const cs = getComputedStyle(a), r = { visible: a.matches(":focus-visible"), width: cs.outlineWidth, style: cs.outlineStyle }; a.blur(); return r; })()`;

export async function rh30Ring({ evaluate, send, check, visit }: RunningHeadKit): Promise<void> {
  if (!(await visit("/faq/"))) throw new Error("RH30: the Q & A never loaded");
  // A key first, so the browser takes the focus that follows as keyboard focus and :focus-visible applies (RH12's idiom).
  await sendKey(send, "Shift", "ShiftLeft", 16);
  try {
    const r = await evaluate(RING);
    check(
      "RH30 the house ring is 2px and solid on a keyboard-focused paper link",
      !!r && r.visible && r.width === "2px" && r.style === "solid",
      JSON.stringify(r),
    );
  } finally {
    await evaluate(`document.activeElement instanceof HTMLElement && document.activeElement.blur()`);
  }
}

type Link = { x: number; y: number; reach: boolean; hover: boolean; moving: number; t: string; probe: string } | null;
const LINK = (
  at: 0 | -1,
): Payload<Link> => `(() => { const a = [...document.querySelectorAll("header.chrome nav.rooms a:not([aria-current])")].at(${at}); if (!a) return null;
  const r = a.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, e = document.elementFromPoint(x, y);
  const probe = document.createElement("div"); probe.style.transform = "translateY(var(--raise))"; document.body.appendChild(probe);
  const p = getComputedStyle(probe).transform; probe.remove();
  return { x, y, reach: !!e && (e === a || a.contains(e)), hover: a.matches(":hover"), moving: a.getAnimations().length,
    t: getComputedStyle(a).transform, probe: p }; })()`;

const fOf = (m: string): number | null => {
  const v = /^matrix\(([^)]+)\)$/.exec(m)?.[1]?.split(", ").map(Number);
  return v && v.length === 6 ? v[5]! : null;
};

async function raised({ evaluate, send, sleep }: RunningHeadKit, at: 0 | -1): Promise<Link> {
  let last = await evaluate(LINK(at));
  if (last) await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: last.x, y: last.y });
  for (let i = 0; i < 20 && last; i++) {
    last = await evaluate(LINK(at));
    if (last && last.hover && last.moving === 0) break;
    await sleep(50);
  }
  return last;
}

export async function rh31Raise(k: RunningHeadKit): Promise<void> {
  if (!(await k.visit("/faq/"))) throw new Error("RH31: the Q & A never loaded");
  try {
    const reads = [await raised(k, 0), await raised(k, -1)];
    const rises = reads.every((r) => {
      const f = r ? fOf(r.t) : null;
      return !!r && r.reach && r.hover && f !== null && f === fOf(r.probe) && f !== 0;
    });
    k.check(
      "RH31 the first and the last nav link each rise by the house raise under the hand",
      rises,
      JSON.stringify(reads),
    );
  } finally {
    await k.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 700 });
  }
}
