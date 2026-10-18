import type { AstroIntegration } from "astro";
import { fileURLToPath } from "node:url";

export type ServedSource = { readonly dir: string; readonly types: Readonly<Record<string, string>> };

export const STYLES = "src/styles";
export const STATIC = "src/static";
export const SERVED_SOURCES: readonly ServedSource[] = [{ dir: STYLES, types: { ".css": "text/css; charset=utf-8" } }];
export const REPO: string = fileURLToPath(new URL("..", import.meta.url));

export const sourceFor = (
  repo: string,
  sources: readonly ServedSource[],
  pathname: string,
): { readonly file: string; readonly type: string } | null => null;

export const copySources = async (
  repo: string,
  sources: readonly ServedSource[],
  to: string,
): Promise<readonly string[]> => [];

export const servedSources = (
  repo: string = REPO,
  sources: readonly ServedSource[] = SERVED_SOURCES,
): AstroIntegration => ({
  name: "vellum-served-sources",
  hooks: {},
});
