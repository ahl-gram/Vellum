const NEIGHBOURS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

type FlowNet = {
  addEdge(from: number, to: number, capacity: number): void;
  saturate(source: number, sink: number): void;
  reachable(source: number): Uint8Array;
};

type Edges = { readonly head: Int32Array; readonly to: number[]; readonly cap: number[]; readonly next: number[] };

function residualSearch(g: Edges, source: number): { readonly seen: Uint8Array; readonly via: Int32Array } {
  const seen = new Uint8Array(g.head.length);
  const via = new Int32Array(g.head.length).fill(-1);
  const queue = [source];
  seen[source] = 1;
  for (let q = 0; q < queue.length; q++) {
    const u = queue[q] as number;
    for (let e = g.head[u] as number; e !== -1; e = g.next[e] as number) {
      const v = g.to[e] as number;
      if (seen[v] === 1 || (g.cap[e] as number) <= 0) continue;
      seen[v] = 1;
      via[v] = e;
      queue.push(v);
    }
  }
  return { seen, via };
}

function createFlowNet(nodes: number): FlowNet {
  const g: Edges = { head: new Int32Array(nodes).fill(-1), to: [], cap: [], next: [] };
  return {
    addEdge(from, target, capacity) {
      for (const [a, b, c] of [
        [from, target, capacity],
        [target, from, 0],
      ] as const) {
        g.to.push(b);
        g.cap.push(c);
        g.next.push(g.head[a] as number);
        g.head[a] = g.to.length - 1;
      }
    },
    saturate(source, sink) {
      for (;;) {
        const { seen, via } = residualSearch(g, source);
        if (seen[sink] !== 1) return;
        const path: number[] = [];
        for (let v = sink; v !== source; v = g.to[(via[v] as number) ^ 1] as number) path.push(via[v] as number);
        const along = Math.min(...path.map((e) => g.cap[e] as number));
        for (const e of path) {
          g.cap[e] = (g.cap[e] as number) - along;
          g.cap[e ^ 1] = (g.cap[e ^ 1] as number) + along;
        }
      }
    },
    reachable(source) {
      return residualSearch(g, source).seen;
    },
  };
}

function shoresOf(i: number, coarseIds: Int32Array, w: number, h: number): number[] {
  const x = i % w;
  const y = (i / w) | 0;
  const out: number[] = [];
  for (const [dx, dy] of NEIGHBOURS) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
    const id = coarseIds[nx + ny * w] as number;
    if (id !== -1 && !out.includes(id)) out.push(id);
  }
  return out;
}

function partingOrder(touch: ReadonlyArray<ReadonlyArray<number>>): number[] {
  const contact = new Map<number, number>();
  for (const ids of touch) for (const id of ids) contact.set(id, (contact.get(id) ?? 0) + 1);
  return [...contact.keys()].sort((a, b) => (contact.get(a) as number) - (contact.get(b) as number) || a - b);
}

function wireCutNet(
  cells: ReadonlyArray<number>,
  live: Uint8Array,
  touch: ReadonlyArray<ReadonlyArray<number>>,
  shore: number,
  others: ReadonlySet<number>,
  w: number,
  h: number,
): FlowNet {
  const m = cells.length;
  const inf = m + 1;
  const net = createFlowNet(2 * m + 2);
  const local = new Int32Array(w * h).fill(-1);
  for (let k = 0; k < m; k++) if (live[k] === 1) local[cells[k] as number] = k;
  for (let k = 0; k < m; k++) {
    if (live[k] !== 1) continue;
    const ids = touch[k] as ReadonlyArray<number>;
    net.addEdge(2 * k, 2 * k + 1, 1);
    if (ids.includes(shore)) net.addEdge(2 * m, 2 * k, inf);
    if (ids.some((id) => others.has(id))) net.addEdge(2 * k + 1, 2 * m + 1, inf);
    const x = (cells[k] as number) % w;
    const y = ((cells[k] as number) / w) | 0;
    for (const [dx, dy] of NEIGHBOURS) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const j = local[nx + ny * w] as number;
      if (j !== -1) net.addEdge(2 * k + 1, 2 * j, inf);
    }
  }
  return net;
}

function isolate(
  cells: ReadonlyArray<number>,
  live: Uint8Array,
  touch: ReadonlyArray<ReadonlyArray<number>>,
  shore: number,
  others: ReadonlySet<number>,
  w: number,
  h: number,
): number[] {
  const m = cells.length;
  const net = wireCutNet(cells, live, touch, shore, others, w, h);
  net.saturate(2 * m, 2 * m + 1);
  const reach = net.reachable(2 * m);
  const cut: number[] = [];
  for (let k = 0; k < m; k++) if (live[k] === 1 && reach[2 * k] === 1 && reach[2 * k + 1] !== 1) cut.push(k);
  return cut;
}

export function neckCut(cells: ReadonlyArray<number>, coarseIds: Int32Array, w: number, h: number): number[] {
  const touch = cells.map((i) => shoresOf(i, coarseIds, w, h));
  const order = partingOrder(touch);
  const live = new Uint8Array(cells.length).fill(1);
  const sunk: number[] = [];
  for (let t = 0; t < order.length - 1; t++) {
    const cut = isolate(cells, live, touch, order[t] as number, new Set(order.slice(t + 1)), w, h);
    for (const k of cut) {
      live[k] = 0;
      sunk.push(cells[k] as number);
    }
  }
  return sunk;
}
