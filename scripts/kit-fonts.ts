import { cp } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Issue #706 ruling C: the design kit is the source of truth for the house faces, so `npm run astro:generate` copies `design/kit/fonts/` into the generated `public/fonts/` and every other reader takes `KIT_FONTS`. */

export const KIT_FONTS = fileURLToPath(new URL("../design/kit/fonts", import.meta.url));

export async function copyKitFonts(root: string, from: string = KIT_FONTS): Promise<void> {
  await cp(from, join(root, "fonts"), { recursive: true });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(process.argv[2] ?? "public");
  copyKitFonts(root).catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  });
}
