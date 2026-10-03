import { createServer } from "node:http";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

export const STAND_IN_BROWSER = fileURLToPath(import.meta.url);
export const STAND_IN_SILENT_VAR = "VELLUM_STAND_IN_SILENT";
export const STAND_IN_COUNTER = "stand-in-launches";
const LIFETIME_MS = 60_000;

export const standInTarget = (port: number, launch: number): string => `ws://127.0.0.1:${port}/devtools/page/stand-in-${launch}`;

const flag = (name: string): string | undefined => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);

function main(): void {
  const port = Number(flag("remote-debugging-port"));
  const counter = join(tmpdir(), STAND_IN_COUNTER);
  const launch = (existsSync(counter) ? Number(readFileSync(counter, "utf8")) : 0) + 1;
  writeFileSync(counter, String(launch));
  process.stderr.write(`stand-in launch ${launch} on port ${port}\n`);
  setTimeout(() => process.exit(0), LIFETIME_MS);
  if (launch <= Number(process.env[STAND_IN_SILENT_VAR] ?? "0")) return;
  createServer((req, res) => {
    const body = req.url === "/json" ? [{ type: "page", webSocketDebuggerUrl: standInTarget(port, launch) }] : {};
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(body));
  }).listen(port, "127.0.0.1");
}

if (process.argv[1] === STAND_IN_BROWSER) main();
