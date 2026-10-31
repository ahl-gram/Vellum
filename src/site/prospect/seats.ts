// The Prospect's chart-room seats: the plate as the sheet's one face, the Glass on it, the fit at the plate's own aspect, the folio's lines and the engraver's note on the slip. app.ts stays the conductor.
import type { Room } from "../shared/room.ts";
import { bindZoomRoom } from "../shared/zoom-room.ts";
import { contentsRow } from "../shared/contents-row.ts";
import { PLATE_W, PLATE_H } from "../../prospect/geometry.ts";
import { eraLine, prospectTitle, subLine, whereLine } from "./note-lines.ts";
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
  const { zoom, room } = bindZoomRoom({
    frame: roomEls.stage,
    sheet: roomEls.sheet,
    viewport: roomEls.viewport,
    target: roomEls.map,
    aspect: () => PLATE_W / PLATE_H,
  });
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
