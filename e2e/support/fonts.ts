import type { Payload } from "../types.ts";

export type WithFonts<T> = { readonly read: T; readonly fonts: string };

export const withFonts = <T>(read: Payload<T>): Payload<WithFonts<T>> =>
  `(() => { const fonts = document.fonts.status; return { read: (${read}), fonts }; })()`;
