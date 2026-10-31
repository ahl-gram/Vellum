import vm from "node:vm";

export type FakeNode = {
  readonly rect?: readonly [number, number, number, number];
  readonly anims?: readonly string[];
  readonly classes?: readonly string[];
  readonly vars?: Readonly<Record<string, string>>;
};
export type FakeFrame = {
  readonly nodes: Readonly<Record<string, FakeNode>>;
  readonly inner?: readonly [number, number];
  readonly zoom?: { readonly x: number; readonly y: number; readonly k: number };
};
export type Asked = { readonly selector: string; readonly anims: readonly string[] };
export type FakePage = {
  readonly evaluate: (expression: string) => Promise<unknown>;
  readonly said: string[];
  readonly asked: Asked[];
};

const element = (selector: string, node: FakeNode, asked: Asked[], clicked: (selector: string) => void) => ({
  getBoundingClientRect: () => {
    const [x, y, width, height] = node.rect ?? [0, 0, 0, 0];
    return { x, y, width, height, left: x, top: y, right: x + width, bottom: y + height };
  },
  getAnimations: () => {
    asked.push({ selector, anims: node.anims ?? [] });
    return (node.anims ?? []).map((playState) => ({ playState }));
  },
  classList: { contains: (name: string) => (node.classes ?? []).includes(name) },
  style: { getPropertyValue: (name: string) => node.vars?.[name] ?? "" },
  click: () => clicked(selector),
});

export function fakePage(
  frame: (clock: number) => FakeFrame,
  clicked: (selector: string) => void = () => {},
): FakePage {
  const said: string[] = [];
  const asked: Asked[] = [];
  const evaluate = (expression: string): Promise<unknown> => {
    said.push(expression);
    const now = frame(said.length);
    const node = (selector: string) => {
      const found = now.nodes[selector];
      return found ? element(selector, found, asked, clicked) : null;
    };
    const [innerWidth, innerHeight] = now.inner ?? [1280, 800];
    const context = {
      document: {
        readyState: "complete",
        querySelector: node,
        querySelectorAll: (selector: string) => {
          const found = node(selector);
          return found === null ? [] : [found];
        },
        getElementById: (id: string) => node(`#${id}`),
      },
      getComputedStyle: () => ({ display: "block" }),
      innerWidth,
      innerHeight,
      window: { scrollTo: () => {}, __vellumZoomState: () => ({ ...(now.zoom ?? { x: 0, y: 0, k: 1 }) }) },
    };
    try {
      return Promise.resolve(vm.runInNewContext(expression, context));
    } catch (err) {
      return Promise.reject(err instanceof Error ? err : new Error(String(err)));
    }
  };
  return { evaluate, said, asked };
}
