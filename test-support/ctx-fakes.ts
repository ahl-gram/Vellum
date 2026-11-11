export type CheckedCode = { code: string; ok: boolean };

export const checkInto =
  (checked: CheckedCode[]) =>
  (name: string, ok: unknown): void =>
    void checked.push({ code: name.split(" ")[0]!, ok: !!ok });

export const checkIntoMap =
  (checked: Map<string, boolean>) =>
  (name: string, ok: unknown): void =>
    void checked.set(name.split(" ")[0]!, !!ok);

export const answering =
  (answer: (expression: string) => unknown) =>
  (expression: string): Promise<unknown> => {
    const a = answer(expression);
    return a instanceof Error ? Promise.reject(a) : Promise.resolve(a);
  };
