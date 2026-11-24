import assert from "node:assert/strict";

export const settle = <T>(p: Promise<T>): Promise<{ value?: T; error?: Error }> =>
  p.then(
    (value) => ({ value }),
    (error: unknown) => {
      assert.ok(error instanceof Error, `the launch rejected with ${String(error)}, which is not an Error`);
      return { error };
    },
  );

export async function settleWithin<T>(ms: number, p: Promise<T>): Promise<{ value?: T; error?: Error }> {
  let timer: NodeJS.Timeout | undefined;
  const late = new Promise<{ error: Error }>((done) => {
    timer = setTimeout(() => done({ error: new Error(`never settled in ${ms} ms`) }), ms);
  });
  try {
    return await Promise.race([settle(p), late]);
  } finally {
    clearTimeout(timer);
  }
}
