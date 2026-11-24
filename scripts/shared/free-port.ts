import { createServer } from "node:net";

export const freePort = (): Promise<number> =>
  new Promise((res, rej) => {
    const server = createServer();
    server.once("error", rej);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address !== null ? address.port : 0;
      server.close(() => res(port));
    });
  });

export async function freePorts(): Promise<[number, number]> {
  const a = await freePort();
  let b = await freePort();
  while (b === a) b = await freePort();
  return [a, b];
}
