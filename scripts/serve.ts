/**
 * Local static server for the docs/ showcase site.
 *
 * Zero dependencies — mirrors the e2e harness server (scripts/e2e/harness.mjs):
 * MIME-aware, path-traversal guarded, rewrites directory URLs to index.html.
 * Serving over HTTP (rather than opening docs/index.html with a file:// URL)
 * lets the Explorer's Web Worker load, so you test the real page.
 *
 *   npm run serve            # serve docs/ on http://localhost:8000/
 *   npm run serve -- 4000    # pick a port
 *   PORT=4000 npm run serve  # or via env
 *
 * This only serves; it never rebuilds. Run `npm run site` first (or use
 * `npm run dev`) when engine or seeded-chart changes need to be regenerated.
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, sep, extname } from "node:path";

const MIME: Record<string, string> = {
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

const SITE = resolve("docs");
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 8000);

if (!existsSync(SITE)) {
  console.error(`No docs/ directory at ${SITE}. Run \`npm run site\` first.`);
  process.exit(1);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    let pathname = decodeURIComponent(url.pathname);
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
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Vellum site → http://localhost:${PORT}/`);
  console.log(`Explorer    → http://localhost:${PORT}/explorer/`);
  console.log("Ctrl+C to stop.");
});
