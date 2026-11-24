import type { Payload } from "../types.ts";

export type WithFonts<T> = { readonly read: T; readonly fonts: string };

export const withFonts = <T>(read: Payload<T>): Payload<WithFonts<T>> =>
  `(() => { const measured = (${read}); return { read: measured, fonts: document.fonts.status }; })()`;
