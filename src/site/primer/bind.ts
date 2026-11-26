import { TOUCH_PRIMARY } from "../shared/chart-touch.ts";
import { prefersReduce } from "../shared/reduced-motion.ts";
import { clearSeals, readSeals } from "../shared/primer/seals.ts";
import type { Device, Only } from "../shared/primer/hand-steps.ts";
import type { ArrivalRoom } from "./arrival.ts";
import { inkChart, lightChart } from "./chart-ink.ts";
import { landing, stepAfter, stepBefore, type Aim } from "./walk.ts";
import { buildDone, buildRow } from "./walk-row.ts";
import { SEALED, WALK_OPENING } from "./words.ts";

const ONLY: ReadonlySet<string> = new Set(["touch", "motion"]);
const device = (): Storage => localStorage;
const NONE: Aim = { kind: "none" };

export function bindPrimer(doc: Document = document): void {
  const primer = doc.querySelector<HTMLElement>(".primer");
  if (primer === null) return;
  const rooms = [...primer.querySelectorAll<HTMLElement>("section.room")];
  const idOf = (room: Element): string => room.querySelector("h2[id]")?.id ?? "";
  const arrival: ArrivalRoom[] = rooms.map((room) => ({
    id: idOf(room),
    steps: [...room.querySelectorAll<HTMLElement>("li.step")].map((li) => {
      const only = li.dataset["only"];
      return only !== undefined && ONLY.has(only) ? { id: li.id, only: only as Only } : { id: li.id };
    }),
  }));
  const here: Device = { touch: matchMedia(TOUCH_PRIMARY).matches, motion: !prefersReduce() };
  const chart = primer.querySelector(".col-chart");
  const chartNode = chart?.closest("nav.col-head") ?? chart;
  const closing = primer.querySelector(".closing");
  let sealed: ReadonlySet<string> = new Set();
  let openId = "";
  let shown: string | null = null;
  const lessons = [...doc.querySelectorAll<HTMLElement>("#index .index > li[data-sec]")].flatMap((row) => {
    const list = row.querySelector<HTMLElement>(".entries");
    return list === null ? [] : [{ id: row.dataset["sec"] ?? "", list }];
  });
  const open = (id: string): void => {
    openId = id;
    for (const l of lessons) l.list.hidden = l.id !== id;
    for (const room of rooms) {
      const on = idOf(room) === id;
      room.classList.toggle("folded", !on);
      const body = room.querySelector<HTMLElement>(".room-body");
      if (body !== null) body.hidden = !on;
    }
    if (chart !== null)
      lightChart(
        chart,
        arrival.find((r) => r.id === id),
        sealed,
        here,
      );
  };
  const aimOf = (id: string): Aim => {
    const el = id === "" ? null : doc.getElementById(id);
    const room = el === null ? null : el.closest("section.room");
    if (el === null || room === null) return NONE;
    if (el.matches("li.step")) return { kind: "step", room: idOf(room), step: el.id };
    if (el.matches("section.lesson")) {
      return { kind: "lesson", room: idOf(room), first: el.querySelector("li.step")?.id ?? "" };
    }
    return { kind: "room", room: idOf(room) };
  };
  const drawSeals = (): void => {
    sealed = readSeals(device);
    for (const li of primer.querySelectorAll<HTMLElement>("li.step")) {
      const on = sealed.has(li.id);
      li.classList.toggle("sealed", on);
      const num = li.querySelector(".num");
      if (num === null) continue;
      if (on) {
        num.setAttribute("title", SEALED);
        num.setAttribute("role", "img");
        num.setAttribute("aria-label", `${num.textContent}, ${SEALED}`);
      } else {
        for (const name of ["title", "role", "aria-label"]) num.removeAttribute(name);
      }
    }
    if (chart !== null) inkChart(chart, arrival, sealed, here);
  };
  const clearDone = (): void => {
    for (const line of [...primer.querySelectorAll(".walk-done")]) line.remove();
  };
  const show = (step: string | null): void => {
    shown = step;
    for (const el of [...primer.querySelectorAll(".now, .walk")]) {
      if (el.classList.contains("walk")) el.remove();
      else el.classList.remove("now");
    }
    primer.classList.toggle("room-end", step === null);
    const li = step === null ? null : doc.getElementById(step);
    const lesson = li?.closest("section.lesson") ?? null;
    const list = li?.closest("ol") ?? null;
    if (step !== null && li !== null && lesson !== null && list !== null) {
      li.classList.add("now");
      lesson.classList.add("now");
      const title = lesson.querySelector("h3")?.childNodes[1]?.textContent?.trim() ?? "";
      const siblings = [...lesson.querySelectorAll("li.step")].map((s) => s.id);
      const first = arrival.find((r) => r.id === openId)?.steps[0]?.id === step;
      list.after(buildRow(doc, title, siblings, step, sealed, first));
    }
    if (chart !== null)
      lightChart(
        chart,
        arrival.find((r) => r.id === openId),
        sealed,
        here,
        step,
      );
  };
  const land = (aim: Aim, top: boolean): void => {
    const l = landing(arrival, aim, sealed, here);
    if (l === null) return;
    open(l.room);
    clearDone();
    primer.classList.toggle("walk-end", l.end);
    if (chartNode !== null && closing !== null) {
      if (l.end) closing.after(chartNode);
      else closing.before(chartNode);
    }
    show(l.step);
    const done = l.done === null ? null : doc.getElementById(l.done);
    const body = rooms.find((r) => idOf(r) === l.room)?.querySelector(".room-body");
    if (done !== null && body !== null && body !== undefined) {
      body.prepend(
        buildDone(
          doc,
          done.querySelector(".num")?.textContent.trim() ?? "",
          done.querySelector(".act")?.textContent.trim() ?? "",
        ),
      );
    }
    if (top) window.scrollTo(0, 0);
  };
  const landAt = (hash: string): void => {
    const aim = aimOf(hash);
    if (aim.kind !== "none") land(aim, true);
  };

  primer.classList.add("walking");
  const opening = primer.querySelector(".opening p:not(.lede)");
  if (opening !== null) opening.textContent = WALK_OPENING;
  drawSeals();
  const aim = aimOf(location.hash.slice(1));
  land(aim, aim.kind !== "none");

  doc.addEventListener("click", (e) => {
    const el = e.target instanceof Element ? e.target : null;
    const press = el?.closest(".walk button");
    if (press) {
      const room = arrival.find((r) => r.id === openId);
      if (room === undefined || shown === null) return;
      clearDone();
      show(press.classList.contains("walk-skip") ? stepAfter(room, shown) : stepBefore(room, shown));
      return;
    }
    const href = el?.closest('a[href^="#"]')?.getAttribute("href") ?? "";
    const aim = aimOf(href.slice(1));
    if (aim.kind === "none") return;
    e.preventDefault();
    window.history.pushState(null, "", href);
    land(aim, true);
  });
  window.addEventListener("hashchange", () => landAt(location.hash.slice(1)));
  window.addEventListener("popstate", () => landAt(location.hash.slice(1)));
  primer.querySelector(".wipe")?.addEventListener("click", () => {
    clearSeals(device);
    drawSeals();
    land(NONE, true);
  });
  primer.setAttribute("data-bound", "");
}
