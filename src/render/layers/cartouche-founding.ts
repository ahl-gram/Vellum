export const FOUNDING_LINE_UNITS = 48;

export function widthUnits(text: string): number {
  return Array.from(text).length;
}

export function foundingLines(text: string, max: number = FOUNDING_LINE_UNITS): string[] {
  return text === "" || max < 1 ? [] : [text];
}
