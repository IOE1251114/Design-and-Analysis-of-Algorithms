/* Unit 3 — graph model and the preset graphs used by every visual.
 * Vertex positions are fixed (hand-placed), and neighbours are always visited in increasing vertex
 * order, so every traversal, numbering and result is the same on every run. */

export interface Edge {
  u: number;
  v: number;
  w: number;
}
export interface Graph {
  labels: string[];
  pos: [number, number][];
  edges: Edge[];
  directed: boolean;
  weighted: boolean;
}

export const edgeKey = (g: Graph, u: number, v: number) =>
  g.directed ? `${u}>${v}` : `${Math.min(u, v)}-${Math.max(u, v)}`;

/** Out-neighbours of each vertex (both directions for undirected graphs), sorted by vertex index. */
export function adjacency(g: Graph): { v: number; w: number }[][] {
  const adj: { v: number; w: number }[][] = g.labels.map(() => []);
  for (const e of g.edges) {
    adj[e.u].push({ v: e.v, w: e.w });
    if (!g.directed) adj[e.v].push({ v: e.u, w: e.w });
  }
  adj.forEach((a) => a.sort((x, y) => x.v - y.v));
  return adj;
}
export const transpose = (g: Graph): Graph => ({
  ...g,
  edges: g.edges.map((e) => ({ u: e.v, v: e.u, w: e.w })),
});

const mk = (
  labels: string[],
  pos: [number, number][],
  list: [string, string, number?][],
  directed: boolean,
  weighted = false,
): Graph => {
  const id = (s: string) => labels.indexOf(s);
  return {
    labels,
    pos,
    directed,
    weighted,
    edges: list.map(([a, b, w]) => ({ u: id(a), v: id(b), w: w ?? 1 })),
  };
};

export const presets = {
  campus: mk(
    ["A", "B", "C", "D", "E", "F", "G", "H"],
    [
      [80, 80],
      [220, 50],
      [120, 250],
      [270, 180],
      [400, 170],
      [540, 70],
      [450, 300],
      [590, 240],
    ],
    [
      ["A", "B"],
      ["A", "C"],
      ["B", "D"],
      ["C", "D"],
      ["D", "E"],
      ["E", "F"],
      ["E", "G"],
      ["F", "H"],
      ["G", "H"],
    ],
    false,
  ),
  campusDirected: mk(
    ["A", "B", "C", "D", "E", "F", "G", "H"],
    [
      [80, 80],
      [220, 50],
      [120, 250],
      [270, 180],
      [400, 170],
      [540, 70],
      [450, 300],
      [590, 240],
    ],
    [
      ["A", "B"],
      ["A", "C"],
      ["B", "D"],
      ["C", "D"],
      ["D", "A"],
      ["D", "E"],
      ["E", "F"],
      ["E", "G"],
      ["F", "H"],
      ["G", "H"],
      ["H", "E"],
    ],
    true,
  ),
  islands: mk(
    ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
    [
      [70, 80],
      [190, 60],
      [150, 190],
      [60, 290],
      [330, 90],
      [430, 170],
      [330, 270],
      [520, 60],
      [600, 170],
      [560, 300],
    ],
    [
      ["A", "B"],
      ["B", "C"],
      ["C", "A"],
      ["C", "D"],
      ["E", "F"],
      ["F", "G"],
      ["H", "I"],
    ],
    false,
  ),
  scc: mk(
    ["a", "b", "c", "d", "e", "f", "g", "h"],
    [
      [80, 90],
      [230, 90],
      [380, 90],
      [530, 90],
      [80, 270],
      [230, 270],
      [380, 270],
      [530, 270],
    ],
    [
      ["a", "b"],
      ["b", "c"],
      ["b", "e"],
      ["b", "f"],
      ["c", "d"],
      ["c", "g"],
      ["d", "c"],
      ["d", "h"],
      ["e", "a"],
      ["e", "f"],
      ["f", "g"],
      ["g", "f"],
      ["g", "h"],
    ],
    true,
  ),
  courses: mk(
    ["Prog", "Disc", "DS", "OS", "Algo", "DB", "Comp", "ML"],
    [
      [70, 80],
      [70, 280],
      [230, 80],
      [240, 200],
      [400, 230],
      [400, 70],
      [570, 140],
      [570, 300],
    ],
    [
      ["Prog", "DS"],
      ["Prog", "OS"],
      ["DS", "Algo"],
      ["Disc", "Algo"],
      ["DS", "DB"],
      ["OS", "Comp"],
      ["Algo", "Comp"],
      ["Algo", "ML"],
      ["Disc", "ML"],
    ],
    true,
  ),
  bcc: mk(
    ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
    [
      [60, 90],
      [170, 180],
      [60, 280],
      [290, 180],
      [400, 90],
      [400, 280],
      [510, 70],
      [610, 130],
      [520, 210],
      [610, 300],
    ],
    [
      ["A", "B"],
      ["B", "C"],
      ["C", "A"],
      ["B", "D"],
      ["D", "E"],
      ["E", "F"],
      ["F", "D"],
      ["E", "G"],
      ["G", "H"],
      ["H", "I"],
      ["I", "G"],
      ["I", "J"],
    ],
    false,
  ),
  dijkstra: mk(
    ["s", "t", "x", "y", "z"],
    [
      [70, 180],
      [250, 70],
      [450, 70],
      [250, 290],
      [450, 290],
    ],
    [
      ["s", "t", 10],
      ["s", "y", 5],
      ["t", "x", 1],
      ["t", "y", 2],
      ["x", "z", 4],
      ["y", "t", 3],
      ["y", "x", 9],
      ["y", "z", 2],
      ["z", "s", 7],
      ["z", "x", 6],
    ],
    true,
    true,
  ),
  negative: mk(
    ["s", "t", "x", "y", "z"],
    [
      [70, 180],
      [250, 70],
      [450, 70],
      [250, 290],
      [450, 290],
    ],
    [
      ["s", "t", 6],
      ["s", "y", 7],
      ["t", "x", 5],
      ["t", "y", 8],
      ["t", "z", -4],
      ["x", "t", -2],
      ["y", "x", -3],
      ["y", "z", 9],
      ["z", "s", 2],
      ["z", "x", 7],
    ],
    true,
    true,
  ),
  negCycle: mk(
    ["s", "t", "x", "y", "z"],
    [
      [70, 180],
      [250, 70],
      [450, 70],
      [250, 290],
      [450, 290],
    ],
    [
      ["s", "t", 6],
      ["s", "y", 7],
      ["t", "x", 5],
      ["t", "y", 8],
      ["t", "z", -4],
      ["x", "t", -2],
      ["y", "x", -3],
      ["y", "z", 9],
      ["z", "s", 2],
      ["z", "x", -7],
    ],
    true,
    true,
  ),
  dag: mk(
    ["r", "s", "t", "x", "y", "z"],
    [
      [50, 210],
      [160, 110],
      [270, 240],
      [380, 100],
      [490, 240],
      [600, 120],
    ],
    [
      ["r", "s", 5],
      ["r", "t", 3],
      ["s", "t", 2],
      ["s", "x", 6],
      ["t", "x", 7],
      ["t", "y", 4],
      ["t", "z", 2],
      ["x", "y", -1],
      ["x", "z", 1],
      ["y", "z", -2],
    ],
    true,
    true,
  ),
};
export type PresetId = keyof typeof presets;
export const withCycle = (g: Graph): Graph => ({
  ...g,
  edges: [
    ...g.edges,
    { u: g.labels.indexOf("Algo"), v: g.labels.indexOf("DS"), w: 1 },
  ],
});

/** Six vertices on a hexagon, for the editable representation lab. */
export function hexGraph(pairs: [number, number][], directed: boolean): Graph {
  const pos = Array.from(
    { length: 6 },
    (_, i) =>
      [
        320 + 140 * Math.cos(-Math.PI / 2 + (i * Math.PI) / 3),
        175 + 140 * Math.sin(-Math.PI / 2 + (i * Math.PI) / 3),
      ] as [number, number],
  );
  return {
    labels: ["0", "1", "2", "3", "4", "5"],
    pos,
    directed,
    weighted: false,
    edges: pairs.map(([u, v]) => ({ u, v, w: 1 })),
  };
}

/** Seeded random graphs for the "O(V + E)" and shortest-path cost charts. */
export function randomGraph(
  V: number,
  E: number,
  seed: number,
  directed = false,
  weighted = false,
): Graph {
  let s = seed;
  const r = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const seen = new Set<string>(),
    edges: Edge[] = [];
  for (let i = 1; i < V && edges.length < E; i++) {
    const j = Math.floor(r() * i);
    seen.add(directed ? `${j}>${i}` : `${j}-${i}`);
    edges.push({ u: j, v: i, w: 1 + Math.floor(r() * 9) });
  }
  while (edges.length < E) {
    const a = Math.floor(r() * V),
      b = Math.floor(r() * V);
    if (a === b) continue;
    const k = directed ? `${a}>${b}` : `${Math.min(a, b)}-${Math.max(a, b)}`;
    if (seen.has(k)) continue;
    seen.add(k);
    edges.push({ u: a, v: b, w: 1 + Math.floor(r() * 9) });
  }
  return {
    labels: Array.from({ length: V }, (_, i) => String(i)),
    pos: [],
    edges,
    directed,
    weighted,
  };
}
