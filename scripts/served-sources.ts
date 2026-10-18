import type { AstroIntegration } from "astro";
import { constants, statSync } from "node:fs";
import { copyFile, mkdir, readdir, readFile } from "node:fs/promises";
import { dirname, extname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

export type ServedSource = { readonly dir: string; readonly types: Readonly<Record<string, string>> };

export const STYLES = "src/styles";
export const STATIC = "src/static";
export const SERVED_SOURCES: readonly ServedSource[] = [
  { dir: STYLES, types: { ".css": "text/css; charset=utf-8" } },
  { dir: STATIC, types: { ".svg": "image/svg+xml", ".png": "image/png" } },
];
export const REPO: string = fileURLToPath(new URL("..", import.meta.url));

const isFile = (path: string): boolean => {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
};

export const sourceFor = (
  repo: string,
  sources: readonly ServedSource[],
  pathname: string,
): { readonly file: string; readonly type: string } | null => {
  if (pathname.includes("..")) return null;
  const extension = extname(pathname);
  for (const source of sources) {
    if (!Object.hasOwn(source.types, extension)) continue;
    const file = join(repo, source.dir, pathname);
    const type = source.types[extension];
    if (type !== undefined && isFile(file)) return { file, type };
  }
  return null;
};

export const copySources = async (
  repo: string,
  sources: readonly ServedSource[],
  to: string,
): Promise<readonly string[]> => {
  const copied: string[] = [];
  for (const source of sources) {
    const from = join(repo, source.dir);
    const entries = await readdir(from, { recursive: true, withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile() && Object.hasOwn(source.types, extname(entry.name)))
      .map((entry) => relative(from, join(entry.parentPath, entry.name)))
      .sort();
    for (const file of files) {
      await mkdir(dirname(join(to, file)), { recursive: true });
      await copyFile(join(from, file), join(to, file), constants.COPYFILE_EXCL);
      copied.push(file.split(sep).join("/"));
    }
  }
  return copied.sort();
};

export const servedSources = (
  repo: string = REPO,
  sources: readonly ServedSource[] = SERVED_SOURCES,
): AstroIntegration => ({
  name: "vellum-served-sources",
  hooks: {
    "astro:server:setup": ({ server }) => {
      server.middlewares.use((req, res, next) => {
        const found = sourceFor(repo, sources, (req.url ?? "").split("?")[0] ?? "");
        if (found === null) {
          next();
          return;
        }
        readFile(found.file).then(
          (body) => {
            res.setHeader("Content-Type", found.type);
            res.end(body);
          },
          (error: unknown) => {
            next(error);
          },
        );
      });
    },
    "astro:build:done": async ({ dir }) => {
      await copySources(repo, sources, fileURLToPath(dir));
    },
  },
});
