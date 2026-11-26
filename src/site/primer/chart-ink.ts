import { applies, type Device, type Only } from "../shared/primer/hand-steps.ts";
import type { ArrivalRoom } from "./arrival.ts";

const onlyOf = (value: string | null): Only | undefined =>
  value === "touch" || value === "motion" ? value : undefined;

export function nextStepIn(room: ArrivalRoom, sealed: ReadonlySet<string>, device: Device): string | null {
  return room.steps.find((s) => !sealed.has(s.id) && applies(s.only, device))?.id ?? null;
}

export function inkChart(
  chart: Element,
  rooms: readonly ArrivalRoom[],
  sealed: ReadonlySet<string>,
  device: Device,
): void {
  for (const mark of chart.querySelectorAll("[data-step]")) {
    const done = sealed.has(mark.getAttribute("data-step") ?? "");
    mark.classList.toggle("sealed", done);
    mark.classList.toggle("elsewhere", !done && !applies(onlyOf(mark.getAttribute("data-only")), device));
  }
  const held = new Set(rooms.filter((r) => r.steps.some((s) => sealed.has(s.id))).map((r) => r.id));
  for (const road of chart.querySelectorAll("[data-rooms]")) {
    road.classList.toggle(
      "inked",
      (road.getAttribute("data-rooms") ?? "").split(" ").some((id) => held.has(id)),
    );
  }
}

export function lightChart(
  chart: Element,
  room: ArrivalRoom | undefined,
  sealed: ReadonlySet<string>,
  device: Device,
  shown?: string | null,
): void {
  for (const light of chart.querySelectorAll("[data-halo]")) {
    light.classList.toggle("lit", room !== undefined && light.getAttribute("data-halo") === room.id);
  }
  const hand = chart.querySelector(".col-next");
  if (hand === null) return;
  const step = shown !== undefined ? shown : room === undefined ? null : nextStepIn(room, sealed, device);
  const mark = step === null ? null : chart.querySelector(`[data-step="${step}"]`);
  hand.classList.toggle("on", mark !== null);
  if (mark === null) return;
  hand.setAttribute("transform", mark.getAttribute("data-hand") ?? "");
  hand.classList.toggle("west", mark.getAttribute("data-hand-side") === "west");
}
