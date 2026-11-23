export interface TopEls {
  readonly sheet: HTMLElement;
  readonly title: HTMLElement;
  readonly sub: HTMLElement;
  readonly coords: HTMLElement;
}

export interface TopLines {
  readonly svg: string;
  readonly title: string;
  readonly sub: string;
  readonly coords: string;
}

export function paintTop(roomEls: TopEls, lines: TopLines, layout: () => void): void {
  layout();
  roomEls.sheet.innerHTML = lines.svg;
  roomEls.title.textContent = lines.title;
  roomEls.sub.textContent = lines.sub;
  roomEls.coords.textContent = lines.coords;
}
