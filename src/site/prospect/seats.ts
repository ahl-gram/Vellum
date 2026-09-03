// The Prospect's chart-room seats (#463 part 4/4): the plate as the sheet's one face, the Glass on it, the fit at the plate's own aspect, the folio's lines and the engraver's note on the slip. app.ts stays the conductor.
import { createZoomController } from "../shared/zoom-controller.ts";
import { bindGlassKeys } from "../shared/glass-keys.ts";
import { bindRoom, type Room } from "../shared/room.ts";
import { contentsRow } from "../shared/contents-row.ts";
import { cameraFromTransform, transformFromCamera } from "../explorer/camera.ts";
import { PLATE_W, PLATE_H } from "../../prospect/geometry.ts";
import { eraLine, subLine, whereLine } from "./note-lines.ts";
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

export function bindProspectRoom(f: RoomFurniture): Sheet {
  const zoom = createZoomController({
    viewportEl: f.viewport,
    targetEl: f.map,
    scaleExtent: [1, 8],
    glideMs: () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--glide")),
  });
  zoom.attach();
  bindGlassKeys(f.viewport, zoom);
  const box = () => ({ W: f.viewport.clientWidth || 1, H: f.viewport.clientHeight || 1 });
  const room = bindRoom({ frame: f.stage, sheet: f.sheet, aspect: () => PLATE_W / PLATE_H, camera: {
    hold: () => { const { W, H } = box(); return cameraFromTransform(zoom.getState(), W, H); },
    restore: (cam) => { const { W, H } = box(); zoom.refit(transformFromCamera(cam, W, H)); },
  } });
  return { room, rebase: () => zoom.rebase() };
}

type Facts = Omit<ProspectPlateResult, "svg">;

export function showPlate(f: RoomFurniture, res: Pick<Facts, "name">, seed: number, url: string): void {
  f.plate.src = url;
  f.plate.alt = `The prospect of ${res.name}, chart ${seed}`;
  f.plate.hidden = false;
}

export function writeFolio(f: RoomFurniture, res: Facts, seed: number, dress: PlateDress, ms: number): void {
  f.folioTitle.textContent = `The Prospect of ${res.name} · Chart № ${seed}`;
  f.folioSub.textContent = subLine(res);
  f.pressed.textContent = `pressed in ${ms}ms · ${dress}`;
}

const row = (num: string, text: string): HTMLLIElement => {
  const li = document.createElement("li");
  li.append(...contentsRow(num, [text]));
  return li;
};

export function writeNote(f: RoomFurniture, res: Facts): void {
  f.noteTitle.textContent = res.name;
  f.noteWhere.textContent = whereLine(res);
  f.noteProse.textContent = res.note;
  f.key.replaceChildren(...res.key.map((k) => row(k.letter, k.label)));
  f.keyHead.hidden = res.key.length === 0;
  f.era.textContent = eraLine(res);
}
