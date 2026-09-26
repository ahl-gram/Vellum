// The Prospect's chart-room seats: the plate as the sheet's one face, the Glass on it, the fit at the plate's own aspect, the folio's lines and the engraver's note on the slip. app.ts stays the conductor.
import { createZoomController } from "../shared/zoom-controller.ts";
import { bindGlassKeys } from "../shared/glass-keys.ts";
import { bindRoom, type Room } from "../shared/room.ts";
import { contentsRow } from "../shared/contents-row.ts";
import { cameraFromTransform, transformFromCamera } from "../explorer/camera.ts";
import { PLATE_W, PLATE_H } from "../../prospect/geometry.ts";
import { eraLine, subLine, whereLine } from "./note-lines.ts";
import { prospectTitle } from "../explorer/prospect-job.ts";
import type { PlateDress, ProspectPlateResult } from "../explorer/prospect-job.ts";

export interface RoomFurniture {
  readonly stage: HTMLElement;
  readonly sheet: HTMLElement;
  readonly viewport: HTMLElement;
  readonly map: HTMLElement;
  readonly plate: HTMLImageElement;
  readonly noteTitle: HTMLElement;
  readonly noteWhere: HTMLElement;
  readonly noteProse: HTMLElement;
  readonly keyHead: HTMLElement;
  readonly key: HTMLElement;
  readonly era: HTMLElement;
  readonly folioTitle: HTMLElement;
  readonly folioSub: HTMLElement;
  readonly pressed: HTMLElement;
}

export interface Sheet {
  readonly room: Room;
  readonly rebase: () => void;
}

export function bindProspectRoom(roomEls: RoomFurniture): Sheet {
  const zoom = createZoomController({
    viewportEl: roomEls.viewport,
    targetEl: roomEls.map,
    scaleExtent: [1, 8],
    glideMs: () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--glide")),
  });
  zoom.attach();
  bindGlassKeys(roomEls.viewport, zoom);
  const box = () => ({ W: roomEls.viewport.clientWidth || 1, H: roomEls.viewport.clientHeight || 1 });
  const room = bindRoom({ frame: roomEls.stage, sheet: roomEls.sheet, aspect: () => PLATE_W / PLATE_H, camera: {
    hold: () => { const { W, H } = box(); return cameraFromTransform(zoom.getState(), W, H); },
    restore: (cam) => { const { W, H } = box(); zoom.refit(transformFromCamera(cam, W, H)); },
  } });
  return { room, rebase: () => zoom.rebase() };
}

type Facts = Omit<ProspectPlateResult, "svg">;

export function showPlate(roomEls: RoomFurniture, res: Pick<Facts, "name">, seed: number, url: string): void {
  roomEls.plate.src = url;
  roomEls.plate.alt = `The prospect of ${res.name}, chart ${seed}`;
  roomEls.plate.hidden = false;
}

export function writeFolio(roomEls: RoomFurniture, res: Facts, seed: number, dress: PlateDress, ms: number): void {
  roomEls.folioTitle.textContent = `${prospectTitle(res.name)} · Chart № ${seed}`;
  roomEls.folioSub.textContent = subLine(res);
  roomEls.pressed.textContent = `pressed in ${ms}ms · ${dress}`;
}

const row = (num: string, text: string): HTMLLIElement => {
  const li = document.createElement("li");
  li.append(...contentsRow(num, [text]));
  return li;
};

export function writeNote(roomEls: RoomFurniture, res: Facts): void {
  roomEls.noteTitle.textContent = res.name;
  roomEls.noteWhere.textContent = whereLine(res);
  roomEls.noteProse.textContent = res.note;
  roomEls.key.replaceChildren(...res.key.map((k) => row(k.letter, k.label)));
  roomEls.keyHead.hidden = res.key.length === 0;
  roomEls.era.textContent = eraLine(res);
}
