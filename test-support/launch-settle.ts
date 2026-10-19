import assert from "node:assert/strict";

export const settle = <T>(p: Promise<T>): Promise<{ value?: T; error?: Error }> =>
  p.then(
    (value) => ({ value }),
    (error: unknown) => {
      assert.ok(error instanceof Error, `the launch rejected with ${String(error)}, which is not an Error`);
      return { error };
    },
  );
