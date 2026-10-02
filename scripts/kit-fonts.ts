import { fileURLToPath } from "node:url";

export const KIT_FONTS = fileURLToPath(new URL("../public/fonts/", import.meta.url));

export function copyKitFonts(_root: string, _from: string = KIT_FONTS): Promise<void> {
  return Promise.resolve();
}
