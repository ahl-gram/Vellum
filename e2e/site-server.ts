import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { dirname, resolve, sep, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { E2E_PORT_VAR } from "../../src/cli/e2e-ports.ts";

const MIME: Record<string, string | undefined> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

// blockWorker 404s the ONE shared Vite-emitted worker chunk (since the #208 fold both pages spawn it), so the inline fallback is exercised without mutating the working tree.
export const serverState = { blockWorker: false };
const BLOCKED_WORKERS = new Set(["/explorer/worker.bundle.js"]);

// In-page oracle: suites import engine modules IN THE BROWSER (same JS engine, no cross-engine float drift); since #260 the harness answers /explorer/engine/*.js by type-stripping src/*.ts on demand and rewriting .ts specifiers. e2e-only serving.
const SRC_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "src");
const ENGINE_MODULE = /^\/explorer\/engine\/(.+)\.js$/;
function serveEngineModule(pathname: string, res: import("node:http").ServerResponse): boolean | Promise<boolean> {
  const m = pathname.match(ENGINE_MODULE);
  if (!m) return false;
  const tsPath = resolve(SRC_DIR, `${m[1]}.ts`);
  if (!tsPath.startsWith(SRC_DIR + sep) || !existsSync(tsPath)) {
    res.writeHead(404).end("no such engine module");
    return true;
  }
  return readFile(tsPath, "utf8").then((source) => {
    const js = stripTypeScriptTypes(source, { mode: "strip" }).replace(
      /(["'])(\.\.?\/[^"']+)\.ts\1/g,
      "$1$2.js$1",
    );
    res.writeHead(200, { "content-type": MIME[".js"] }).end(js);
    return true;
  });
}

export function startServer(SITE: string, PORT: number): Promise<import("node:http").Server> {
  const server = createServer((req, res) => { void (async () => {
    try {
      // @ts-expect-error a server-side request always carries its url, which Node types as possibly undefined
      const url = new URL(req.url, "http://127.0.0.1");
      let pathname = decodeURIComponent(url.pathname);
      if (serverState.blockWorker && BLOCKED_WORKERS.has(pathname)) {
        res.writeHead(404).end("worker blocked for fallback test");
        return;
      }
      if (await serveEngineModule(pathname, res)) return;
      if (pathname.endsWith("/")) pathname += "index.html";
      const filePath = resolve(SITE, "." + pathname);
      if (filePath !== SITE && !filePath.startsWith(SITE + sep)) {
        res.writeHead(403).end("forbidden");
        return;
      }
      if (!existsSync(filePath)) {
        res.writeHead(404).end("not found");
        return;
      }
      const body = await readFile(filePath);
      res.writeHead(200, { "content-type": MIME[extname(filePath)] ?? "application/octet-stream" });
      res.end(body);
    } catch (err) {
      res.writeHead(500).end(String(err));
    }
  })(); });
  return new Promise((res, rej) => {
    server.on("error", (err: NodeJS.ErrnoException) =>
      rej(
        err.code === "EADDRINUSE"
          ? new Error(
              `port ${PORT} is already in use, so this run cannot serve the site. ` +
                `Another e2e run or dev server likely holds it; set ${E2E_PORT_VAR}=<free port> to run beside it.`,
            )
          : err,
      ),
    );
    server.listen(PORT, "127.0.0.1", () => res(server));
  });
}
