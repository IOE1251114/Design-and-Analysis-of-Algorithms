/* Unit 4 — greedy algorithms: MSTs (Kruskal, Prim), Dijkstra with an array vs a binary heap,
 * fractional knapsack and Huffman coding. Every run is deterministic and records frames. */
import { adjacency, edgeKey, type Graph } from "../unit3/graphs";
import type { EState, VState } from "../unit3/algos";

const mk = (
  labels: string[],
  pos: [number, number][],
  list: [string, string, number][],
): Graph => ({
  labels,
  pos,
  directed: false,
  weighted: true,
  edges: list.map(([a, b, w]) => ({
    u: labels.indexOf(a),
    v: labels.indexOf(b),
    w,
  })),
});
/** The standard textbook MST example (9 vertices, 14 edges, MST weight 37). */
export const mstGraph = mk(
  ["a", "b", "c", "d", "e", "f", "g", "h", "i"],
  [
    [45, 175],
    [165, 65],
    [330, 65],
    [495, 65],
    [615, 175],
    [495, 290],
    [330, 290],
    [165, 290],
    [250, 175],
  ],
  [
    ["a", "b", 4],
    ["a", "h", 8],
    ["b", "c", 8],
    ["b", "h", 11],
    ["c", "d", 7],
    ["c", "f", 4],
    ["c", "i", 2],
    ["d", "e", 9],
    ["d", "f", 14],
    ["e", "f", 10],
    ["f", "g", 2],
    ["g", "h", 1],
    ["g", "i", 6],
    ["h", "i", 7],
  ],
);

export interface MFrame {
  title: string;
  text: string;
  vstate: VState[];
  estate: Record<string, EState>;
  under: string[];
  comp?: (number | null)[];
  focusEdge?: string;
  ds: { name: string; items: string[] };
  total: number;
  chosen: number;
}

/* ---------- Kruskal with union-find (union by rank + path compression) ---------- */
export function kruskal(g: Graph) {
  const n = g.labels.length,
    parent = g.labels.map((_, i) => i),
    rank = Array(n).fill(0),
    frames: MFrame[] = [];
  const estate: Record<string, EState> = {};
  const find = (x: number): number =>
    parent[x] === x ? x : (parent[x] = find(parent[x]));
  const sorted = [...g.edges].sort(
    (a, b) => a.w - b.w || a.u - b.u || a.v - b.v,
  );
  let total = 0,
    chosen = 0;
  const L = (i: number) => g.labels[i];
  const sets = () => {
    const roots = [...new Set(g.labels.map((_, i) => find(i)))].sort(
      (a, b) => a - b,
    );
    return roots.map(
      (r) => `{${g.labels.filter((_, i) => find(i) === r).join(",")}}`,
    );
  };
  const comp = () => {
    const roots = [...new Set(g.labels.map((_, i) => find(i)))].sort(
      (a, b) => a - b,
    );
    return g.labels.map((_, i) =>
      g.labels.filter((_, j) => find(j) === find(i)).length > 1
        ? roots.indexOf(find(i))
        : null,
    );
  };
  const snap = (title: string, text: string, focusEdge?: string) =>
    frames.push({
      title,
      text,
      focusEdge,
      vstate: g.labels.map((_, i) => (comp()[i] !== null ? "done" : "unseen")),
      estate: { ...estate },
      under: Array(n).fill(""),
      comp: comp(),
      ds: { name: "Disjoint sets (union-find)", items: sets() },
      total,
      chosen,
    });
  snap(
    "Sort the edges by weight",
    `Order: ${sorted.map((e) => `${L(e.u)}${L(e.v)}(${e.w})`).join(", ")}. Every vertex starts in its own set.`,
  );
  for (const e of sorted) {
    const k = edgeKey(g, e.u, e.v),
      ru = find(e.u),
      rv = find(e.v);
    if (ru !== rv) {
      if (rank[ru] < rank[rv]) parent[ru] = rv;
      else if (rank[ru] > rank[rv]) parent[rv] = ru;
      else {
        parent[rv] = ru;
        rank[ru]++;
      }
      estate[k] = "tree";
      total += e.w;
      chosen++;
      snap(
        `Take ${L(e.u)}–${L(e.v)} (weight ${e.w})`,
        `${L(e.u)} and ${L(e.v)} are in different sets, so this is the lightest edge joining two trees: union the sets. Tree weight so far ${total}.`,
        k,
      );
      if (chosen === n - 1) {
        snap(
          "Done: V − 1 edges chosen",
          `The MST has ${chosen} edges and total weight ${total}. The remaining edges need not be examined.`,
        );
        break;
      }
    } else {
      estate[k] = "removed";
      snap(
        `Skip ${L(e.u)}–${L(e.v)} (weight ${e.w})`,
        `find(${L(e.u)}) = find(${L(e.v)}): both ends are already in one tree, so this edge would close a cycle.`,
        k,
      );
    }
  }
  return {
    frames,
    total,
    edges: Object.keys(estate).filter((k) => estate[k] === "tree"),
  };
}

/* ---------- Prim with key values (grow one tree from a start vertex) ---------- */
export function prim(g: Graph, s = 0) {
  const n = g.labels.length,
    adj = adjacency(g),
    key = Array(n).fill(Infinity),
    par = Array(n).fill(-1),
    inT = Array(n).fill(false),
    frames: MFrame[] = [];
  const estate: Record<string, EState> = {};
  let total = 0,
    chosen = 0;
  const L = (i: number) => g.labels[i];
  const pq = () => ({
    name: "Priority queue (key = cheapest edge to the tree)",
    items: g.labels
      .map((_, i) => i)
      .filter((i) => !inT[i] && key[i] < Infinity)
      .sort((a, b) => key[a] - key[b] || a - b)
      .map((i) => `${L(i)}:${key[i]}`),
  });
  const snap = (title: string, text: string, cur = -1, focusEdge?: string) =>
    frames.push({
      title,
      text,
      focusEdge,
      vstate: g.labels.map((_, i) =>
        i === cur
          ? "active"
          : inT[i]
            ? "done"
            : key[i] < Infinity
              ? "frontier"
              : "unseen",
      ),
      estate: { ...estate },
      under: key.map((k) => (k === Infinity ? "∞" : String(k))),
      ds: pq(),
      total,
      chosen,
    });
  key[s] = 0;
  snap(
    `Start at ${L(s)}`,
    `key[${L(s)}] = 0; every other key is ∞. Keys are the weight of the cheapest edge joining a vertex to the growing tree.`,
  );
  for (let it = 0; it < n; it++) {
    let u = -1;
    for (let i = 0; i < n; i++)
      if (!inT[i] && key[i] < Infinity && (u < 0 || key[i] < key[u])) u = i;
    if (u < 0) break;
    inT[u] = true;
    if (par[u] >= 0) {
      estate[edgeKey(g, par[u], u)] = "tree";
      total += key[u];
      chosen++;
    }
    snap(
      `Extract-min: add ${L(u)}${par[u] >= 0 ? ` via ${L(par[u])}–${L(u)} (${key[u]})` : ""}`,
      par[u] >= 0
        ? `This is the lightest edge crossing the cut between the tree and the rest (cut property), so it is safe. Tree weight ${total}.`
        : "The start vertex joins the tree.",
      u,
      par[u] >= 0 ? edgeKey(g, par[u], u) : undefined,
    );
    for (const { v, w } of adj[u]) {
      if (inT[v]) continue;
      const k = edgeKey(g, u, v);
      if (w < key[v]) {
        const old = key[v];
        key[v] = w;
        par[v] = u;
        snap(
          `Update key[${L(v)}]: ${old === Infinity ? "∞" : old} → ${w}`,
          `Edge ${L(u)}–${L(v)} (${w}) is a cheaper way to connect ${L(v)} to the tree (decrease-key).`,
          u,
          k,
        );
      }
    }
  }
  snap(
    "Done",
    `The MST has ${chosen} edges and total weight ${total}, the same weight Kruskal finds (the tree itself can differ when weights tie).`,
  );
  return { frames, total, edges: Object.keys(estate) };
}

/* ---------- Dijkstra: array (linear scan) vs binary heap (decrease-key), counting basic operations ---------- */
export interface DFrame {
  title: string;
  text: string;
  dist: number[];
  settled: boolean[];
  scan?: number[];
  current?: number;
  heap?: { v: number; d: number }[];
  touched?: number[];
  ops: number;
}
export function dijkstraImpl(
  g: Graph,
  s: number,
  impl: "array" | "heap",
  record = true,
) {
  const n = g.labels.length,
    adj = adjacency(g),
    dist = Array(n).fill(Infinity),
    settled = Array(n).fill(false),
    frames: DFrame[] = [];
  let ops = 0;
  const L = (i: number) => g.labels[i];
  dist[s] = 0;
  // binary min-heap of vertices keyed by dist, with a position map for decrease-key
  const heap: number[] = [],
    pos = Array(n).fill(-1);
  const less = (a: number, b: number) =>
    dist[a] < dist[b] || (dist[a] === dist[b] && a < b);
  const swap = (i: number, j: number) => {
    [heap[i], heap[j]] = [heap[j], heap[i]];
    pos[heap[i]] = i;
    pos[heap[j]] = j;
  };
  const up = (i: number, path: number[]) => {
    while (i > 0) {
      const p = (i - 1) >> 1;
      ops++;
      if (less(heap[i], heap[p])) {
        swap(i, p);
        path.push(p);
        i = p;
      } else break;
    }
  };
  const down = (i: number, path: number[]) => {
    for (;;) {
      const l = 2 * i + 1,
        r = l + 1;
      let m = i;
      if (l < heap.length) {
        ops++;
        if (less(heap[l], heap[m])) m = l;
      }
      if (r < heap.length) {
        ops++;
        if (less(heap[r], heap[m])) m = r;
      }
      if (m === i) return;
      swap(i, m);
      path.push(m);
      i = m;
    }
  };
  const hsnap = () => heap.map((v) => ({ v, d: dist[v] }));
  const push = (f: Omit<DFrame, "dist" | "settled" | "ops">) => {
    if (record)
      frames.push({ ...f, dist: [...dist], settled: [...settled], ops });
  };
  if (impl === "heap") {
    for (let v = 0; v < n; v++) {
      pos[v] = heap.length;
      heap.push(v);
    }
    const p: number[] = [];
    up(pos[s], p);
  }
  push({
    title:
      impl === "array"
        ? "Distances kept in a plain array"
        : "Distances kept in a binary min-heap",
    text:
      impl === "array"
        ? "Extract-min will scan every unsettled entry: Θ(V) each time, Θ(V²) in total. Decrease-key is just an array write: Θ(1)."
        : "Extract-min removes the root and sifts down: O(log V). Decrease-key sifts the vertex up: O(log V).",
    heap: impl === "heap" ? hsnap() : undefined,
  });
  for (let it = 0; it < n; it++) {
    let u = -1;
    if (impl === "array") {
      const scan: number[] = [];
      for (let i = 0; i < n; i++)
        if (!settled[i]) {
          scan.push(i);
          ops++;
          if (u < 0 || dist[i] < dist[u]) u = i;
        }
      if (u < 0 || dist[u] === Infinity) break;
      settled[u] = true;
      push({
        title: `Scan ${scan.length} entries → extract ${L(u)} (d = ${dist[u]})`,
        text: `Linear scan over all unsettled vertices: ${scan.length} comparisons.`,
        scan,
        current: u,
      });
    } else {
      if (!heap.length || dist[heap[0]] === Infinity) break;
      u = heap[0];
      const last = heap.pop()!;
      pos[u] = -1;
      const path: number[] = [];
      if (heap.length) {
        heap[0] = last;
        pos[last] = 0;
        down(0, path);
      }
      settled[u] = true;
      push({
        title: `Extract-min → ${L(u)} (d = ${dist[u]})`,
        text: `Take the root, move the last element to the top and sift it down (${path.length} swap${path.length === 1 ? "" : "s"}).`,
        current: u,
        heap: hsnap(),
        touched: path,
      });
    }
    for (const { v, w } of adj[u]) {
      if (settled[v]) continue;
      ops++;
      if (dist[u] + w < dist[v]) {
        const old = dist[v];
        dist[v] = dist[u] + w;
        if (impl === "array")
          push({
            title: `Decrease d[${L(v)}]: ${old === Infinity ? "∞" : old} → ${dist[v]}`,
            text: "One array write, Θ(1).",
            current: u,
            scan: [v],
          });
        else {
          const path: number[] = [];
          up(pos[v], path);
          push({
            title: `Decrease-key ${L(v)}: ${old === Infinity ? "∞" : old} → ${dist[v]}`,
            text: `Sift ${L(v)} up the heap (${path.length} swap${path.length === 1 ? "" : "s"}): O(log V).`,
            current: u,
            heap: hsnap(),
            touched: [pos[v], ...path],
          });
        }
      }
    }
  }
  push({
    title: "Done",
    text: `${ops} basic operations (comparisons in extract-min and decrease-key, plus edge checks).`,
    heap: impl === "heap" ? hsnap() : undefined,
  });
  return { frames, dist, ops };
}

/* ---------- Fractional knapsack ---------- */
export interface KItem {
  name: string;
  w: number;
  v: number;
}
export type KRule = "ratio" | "value" | "weight";
export function fractionalKnapsack(
  items: KItem[],
  cap: number,
  rule: KRule = "ratio",
) {
  const order = items
    .map((it, i) => ({ ...it, i }))
    .sort((a, b) =>
      rule === "ratio"
        ? b.v / b.w - a.v / a.w || a.i - b.i
        : rule === "value"
          ? b.v - a.v || a.i - b.i
          : a.w - b.w || a.i - b.i,
    );
  const taken: { i: number; frac: number }[] = [],
    frames: {
      taken: { i: number; frac: number }[];
      room: number;
      value: number;
      title: string;
      text: string;
      consider?: number;
    }[] = [];
  let room = cap,
    value = 0;
  frames.push({
    taken: [],
    room,
    value,
    title: `Sort by ${rule === "ratio" ? "value per unit weight" : rule === "value" ? "value (largest first)" : "weight (lightest first)"}`,
    text: `Order: ${order.map((o) => `${o.name} (${rule === "ratio" ? (o.v / o.w).toFixed(2) : rule === "value" ? o.v : o.w})`).join(", ")}.`,
  });
  for (const it of order) {
    if (room <= 0) break;
    const frac = Math.min(1, room / it.w);
    taken.push({ i: it.i, frac });
    room -= frac * it.w;
    value += frac * it.v;
    frames.push({
      taken: taken.map((t) => ({ ...t })),
      room,
      value,
      consider: it.i,
      title:
        frac === 1
          ? `Take all of ${it.name}`
          : `Take ${(frac * 100).toFixed(0)}% of ${it.name}`,
      text:
        frac === 1
          ? `${it.name} fits completely (+${it.v}). Room left ${+room.toFixed(2)}.`
          : `Only ${+(frac * it.w).toFixed(2)} of ${it.w} fits: add ${+(frac * it.v).toFixed(2)} value. The knapsack is now full.`,
    });
  }
  frames.push({
    taken: taken.map((t) => ({ ...t })),
    room,
    value,
    title: `Total value ${+value.toFixed(2)}`,
    text:
      rule === "ratio"
        ? "Greedy by value/weight is optimal for the fractional problem (exchange argument)."
        : "This rule is not guaranteed optimal; compare it with the value/weight rule.",
  });
  return { frames, value, taken };
}

/* ---------- Huffman coding (min-priority queue; ties broken by creation order) ---------- */
export interface HNode {
  id: number;
  f: number;
  sym?: string;
  left?: HNode;
  right?: HNode;
}
export function huffman(freqs: [string, number][]) {
  let seq = 0;
  const mkLeaf = (s: string, f: number): HNode => ({ id: seq++, f, sym: s });
  let pq: HNode[] = freqs.map(([s, f]) => mkLeaf(s, f));
  const sortPQ = () => pq.sort((a, b) => a.f - b.f || a.id - b.id);
  sortPQ();
  const frames: {
    forest: HNode[];
    picked?: [HNode, HNode];
    made?: HNode;
    title: string;
    text: string;
  }[] = [];
  frames.push({
    forest: [...pq],
    title: "One leaf per symbol in a min-priority queue",
    text: `Keys are frequencies: ${pq.map((x) => `${x.sym}:${x.f}`).join(", ")}.`,
  });
  while (pq.length > 1) {
    const x = pq.shift()!,
      y = pq.shift()!,
      z: HNode = { id: seq++, f: x.f + y.f, left: x, right: y };
    pq.push(z);
    sortPQ();
    frames.push({
      forest: [...pq],
      picked: [x, y],
      made: z,
      title: `Merge ${name(x)} (${x.f}) + ${name(y)} (${y.f}) = ${z.f}`,
      text: "Extract the two least frequent trees, make them children of a new node (left = 0, right = 1), and insert it back.",
    });
  }
  const root = pq[0],
    codes: Record<string, string> = {};
  const walk = (t: HNode, c: string) => {
    if (t.sym !== undefined) {
      codes[t.sym] = c || "0";
      return;
    }
    walk(t.left!, c + "0");
    walk(t.right!, c + "1");
  };
  walk(root, "");
  const total = freqs.reduce((s, [sym, f]) => s + f * codes[sym].length, 0),
    count = freqs.reduce((s, [, f]) => s + f, 0);
  const fixed = Math.max(1, Math.ceil(Math.log2(freqs.length)));
  const entropy = -freqs.reduce(
    (s, [, f]) => s + (f / count) * Math.log2(f / count),
    0,
  );
  return {
    frames,
    root,
    codes,
    total,
    fixedTotal: fixed * count,
    fixed,
    count,
    entropy,
  };
}
const name = (t: HNode): string => t.sym ?? `[${collect(t).join("")}]`;
export const collect = (t: HNode): string[] =>
  t.sym !== undefined ? [t.sym] : [...collect(t.left!), ...collect(t.right!)];
export function freqsFromText(s: string): [string, number][] {
  const m = new Map<string, number>();
  for (const ch of s) m.set(ch, (m.get(ch) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
}
