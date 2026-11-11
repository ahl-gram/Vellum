import type { TestContext } from "node:test";

export const isAlive = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

export async function goneWithin(pid: number, ms: number): Promise<boolean> {
  const until = performance.now() + ms;
  while (isAlive(pid) && performance.now() < until) await new Promise((r) => setTimeout(r, 20));
  return !isAlive(pid);
}

export async function withTTY<T>(value: boolean, body: () => Promise<T>): Promise<T> {
  const own = Object.getOwnPropertyDescriptor(process.stdout, "isTTY");
  Object.defineProperty(process.stdout, "isTTY", { value, configurable: true });
  try {
    return await body();
  } finally {
    if (own) Object.defineProperty(process.stdout, "isTTY", own);
    else Reflect.deleteProperty(process.stdout, "isTTY");
  }
}

export const noExit = (t: TestContext): void => {
  t.mock.method(process, "exit", () => {
    throw new Error("process.exit was reached inside a unit test, which would erase this file's tally");
  });
};
