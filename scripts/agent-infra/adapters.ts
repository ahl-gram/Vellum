export type Adapter = { readonly slots: ReadonlyMap<string, string>; readonly appendix: string };

export function parseAdapter(_text: string, _where: string): Adapter {
  return { slots: new Map(), appendix: "" };
}

export const slotsUsedIn = (_body: string): readonly string[] => [];

export function fillSlots(body: string, _adapter: Adapter, _where: string, _adapterWhere: string): string {
  return body;
}
