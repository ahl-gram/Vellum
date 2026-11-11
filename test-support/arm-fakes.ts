/** A held-open frame: `afterPaint` queues, `paint()` releases everything queued so far. */
export function paintQueue() {
  const queued: Array<() => void> = [];
  return {
    afterPaint: (run: () => void): void => {
      queued.push(run);
    },
    paint: (): void => {
      for (const run of queued.splice(0)) run();
    },
  };
}

/** Primes whose promises the test releases. `settle()` resolves EVERY one outstanding, which is what lets two arms be caught waiting at once. */
export function heldPrime() {
  const waiting: Array<() => void> = [];
  let calls = 0;
  return {
    calls: () => calls,
    prime: (): Promise<void> => {
      calls++;
      return new Promise<void>((resolve) => {
        waiting.push(resolve);
      });
    },
    settle: (): void => {
      for (const r of waiting.splice(0)) r();
    },
    flush: (): Promise<void> =>
      Promise.resolve()
        .then(() => {})
        .then(() => {}),
  };
}

export function fakeBox() {
  let handler: (() => void) | null = null;
  const box = {
    checked: false,
    addEventListener: (type: string, fn: () => void): void => {
      if (type === "change") handler = fn;
    },
  };
  return {
    box,
    change: (to: boolean): void => {
      box.checked = to;
      if (handler) handler();
    },
  };
}
