import { TOUCH_PRIMARY } from "../shared/chart-touch.ts";
import { prefersReduce } from "../shared/reduced-motion.ts";
import { clearSeals, readSeals } from "../shared/primer/seals.ts";
import { roomOnArrival, type ArrivalRoom, type Only } from "./arrival.ts";
import { SEALED } from "./words.ts";

const ONLY: ReadonlySet<string> = new Set(["touch", "motion"]);
const device = (): Storage => localStorage;

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
  const open = (id: string): void => {
    for (const room of rooms) {
      const on = idOf(room) === id;
      room.classList.toggle("folded", !on);
      const body = room.querySelector<HTMLElement>(".room-body");
      const press = room.querySelector<HTMLElement>(".unfold");
      if (body !== null) body.hidden = !on;
      if (press !== null) {
        press.hidden = on;
        press.setAttribute("aria-expanded", String(on));
      }
    }
  };
  const roomOf = (id: string): string | null => {
    if (id === "") return null;
    const room = doc.getElementById(id)?.closest("section.room");
    return room ? idOf(room) : null;
  };
  const drawSeals = (): ReadonlySet<string> => {
    const sealed = readSeals(device);
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
    return sealed;
  };
  const show = (id: string): void => doc.getElementById(id)?.scrollIntoView({ block: "start", inline: "nearest" });

  const hash = decodeURIComponent(location.hash.slice(1));
  const target = roomOf(hash);
  const sealed = drawSeals();
  const first = roomOnArrival(arrival, target, sealed, {
    touch: matchMedia(TOUCH_PRIMARY).matches,
    motion: !prefersReduce(),
  });
  if (first !== null) {
    open(first);
    if (target !== null) show(hash);
    else if (first !== arrival[0]?.id) show(first);
  }

  doc.addEventListener("click", (e) => {
    const el = e.target instanceof Element ? e.target : null;
    const press = el?.closest(".unfold");
    if (press) {
      const room = press.closest("section.room");
      if (room) {
        open(idOf(room));
        show(idOf(room));
      }
      return;
    }
    const link = el?.closest<HTMLAnchorElement>('a[href^="#"]');
    const room = link ? roomOf(decodeURIComponent(link.hash.slice(1))) : null;
    if (room !== null) open(room);
  });
  window.addEventListener("hashchange", () => {
    const room = roomOf(decodeURIComponent(location.hash.slice(1)));
    if (room !== null) open(room);
  });
  primer.querySelector(".wipe")?.addEventListener("click", () => {
    clearSeals(device);
    drawSeals();
    const home = arrival[0]?.id;
    if (home !== undefined) {
      open(home);
      show(home);
    }
  });
  primer.setAttribute("data-bound", "");
}
