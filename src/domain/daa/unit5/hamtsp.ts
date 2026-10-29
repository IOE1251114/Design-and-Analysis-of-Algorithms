/* Unit 5 — Hamiltonian cycle (backtracking search, the Euler contrast, HAM-CYCLE ≤p TSP)
 * and the travelling salesperson problem (brute force, nearest neighbour, MST 2-approximation).
 * Neighbours are tried in increasing order and cities come from a seeded generator, so results never change. */
import { adjacency, type Graph } from "../unit3/graphs";
import type { EState, VState } from "../unit3/algos";

const mk = (
  labels: string[],
  pos: [number, number][],
  pairs: [number, number][],
): Graph => ({
  labels,
  pos,
  directed: false,
  weighted: false,
  edges: pairs.map(([u, v]) => ({ u, v, w: 1 })),
});
const key = (u: number, v: number) => `${Math.min(u, v)}-${Math.max(u, v)}`;

const pent = (cx: number, cy: number, r: number, k: number) =>
  Array.from(
    { length: k },
    (_, i) =>
      [
        cx + r * Math.cos(-Math.PI / 2 + (2 * Math.PI * i) / k),
        cy + r * Math.sin(-Math.PI / 2 + (2 * Math.PI * i) / k),
      ] as [number, number],
  );
export const hamPresets: Record<string, { label: string; g: Graph }> = {
  cube: {
    label: "Cube (has a cycle)",
    g: mk(
      ["A", "B", "C", "D", "E", "F", "G", "H"],
      [
        [140, 45],
        [520, 45],
        [520, 305],
        [140, 305],
        [250, 130],
        [410, 130],
        [410, 220],
        [250, 220],
      ],
      [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 4],
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7],
      ],
    ),
  },
  seven: {
    label: "7 vertices (has a cycle)",
    g: mk(
      ["A", "B", "C", "D", "E", "F", "G"],
      [
        [330, 40],
        [190, 140],
        [470, 140],
        [190, 300],
        [470, 300],
        [330, 220],
        [600, 220],
      ],
      [
        [0, 1],
        [0, 2],
        [1, 2],
        [1, 3],
        [1, 5],
        [2, 5],
        [3, 5],
        [5, 4],
        [3, 4],
        [2, 6],
        [4, 6],
      ],
    ),
  },
  bowtie: {
    label: "Bow tie (no cycle: cut vertex)",
    g: mk(
      ["A", "B", "C", "D", "E"],
      [
        [120, 70],
        [120, 290],
        [330, 180],
        [540, 70],
        [540, 290],
      ],
      [
        [0, 1],
        [0, 2],
        [1, 2],
        [2, 3],
        [2, 4],
        [3, 4],
      ],
    ),
  },
  petersen: {
    label: "Petersen graph (no cycle)",
    g: mk(
      ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
      [...pent(330, 182, 150, 5), ...pent(330, 182, 72, 5)],
      [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 0],
        [0, 5],
        [1, 6],
        [2, 7],
        [3, 8],
        [4, 9],
        [5, 7],
        [7, 9],
        [9, 6],
        [6, 8],
        [8, 5],
      ],
    ),
  },
};

export interface HFrame {
  title: string;
  text: string;
  vstate: VState[];
  estate: Record<string, EState>;
  under: string[];
  focusEdge?: string;
  path: number[];
  nodes: number;
  backtracks: number;
}
export function hamiltonSearch(g: Graph, start = 0, cap = 2500) {
  const n = g.labels.length,
    adj = adjacency(g).map((a) => a.map((x) => x.v)),
    frames: HFrame[] = [];
  const path = [start],
    on = Array(n).fill(false);
  on[start] = true;
  let nodes = 1,
    backtracks = 0,
    found = null as number[] | null,
    truncated = false;
  const snap = (
    title: string,
    text: string,
    extra: { dead?: number; focus?: string; cycle?: boolean } = {},
  ) => {
    if (frames.length >= cap) {
      truncated = true;
      return;
    }
    const vstate: VState[] = g.labels.map((_, i) =>
      i === path[path.length - 1] ? "active" : on[i] ? "done" : "unseen",
    );
    if (extra.dead !== undefined) vstate[extra.dead] = "bad";
    const estate: Record<string, EState> = {};
    for (let i = 1; i < path.length; i++)
      estate[key(path[i - 1], path[i])] = extra.cycle ? "sp" : "tree";
    if (extra.cycle) estate[key(path[path.length - 1], path[0])] = "sp";
    frames.push({
      title,
      text,
      vstate,
      estate,
      under: g.labels.map((_, i) => {
        const k = path.indexOf(i);
        return k >= 0 ? `#${k + 1}` : "";
      }),
      focusEdge: extra.focus,
      path: [...path],
      nodes,
      backtracks,
    });
  };
  const L = (i: number) => g.labels[i];
  snap(
    `Start the path at ${L(start)}`,
    "A Hamiltonian cycle visits every vertex exactly once and returns to the start. Grow a path one vertex at a time; when stuck, undo the last step (backtrack).",
  );
  const extend = (): boolean => {
    const u = path[path.length - 1];
    if (path.length === n) {
      const closes = adj[u].includes(start);
      if (closes) {
        found = [...path];
        snap(
          `Close the cycle ${L(u)} → ${L(start)}`,
          `All ${n} vertices are on the path and ${L(u)}–${L(start)} is an edge: Hamiltonian cycle ${[...path, start].map(L).join(" → ")}.`,
          { cycle: true },
        );
        return true;
      }
      snap(
        `All vertices used, but ${L(u)}–${L(start)} is not an edge`,
        "The path is Hamiltonian but cannot be closed into a cycle. Backtrack.",
        { focus: undefined },
      );
      return false;
    }
    const options = adj[u].filter((v) => !on[v]);
    if (!options.length) {
      snap(
        `Dead end at ${L(u)}`,
        `Every neighbour of ${L(u)} is already on the path. Backtrack.`,
      );
      return false;
    }
    for (const v of options) {
      path.push(v);
      on[v] = true;
      nodes++;
      snap(
        `Extend ${L(u)} → ${L(v)}`,
        `Path so far: ${path.map(L).join(" → ")} (${path.length} of ${n} vertices).`,
        { focus: key(u, v) },
      );
      if (extend()) return true;
      path.pop();
      on[v] = false;
      backtracks++;
      snap(
        `Backtrack: remove ${L(v)}`,
        `No cycle extends ${[...path, v].map(L).join(" → ")}. Try the next neighbour of ${L(u)}.`,
        { dead: v },
      );
    }
    return false;
  };
  const ok = extend();
  const wasCut = truncated;
  if (wasCut || !ok) {
    frames.length = Math.min(frames.length, cap - 1);
    if (ok)
      snap(
        `Hamiltonian cycle ${[...path, start].map(L).join(" → ")}`,
        `Found after ${nodes} path extensions and ${backtracks} backtracks (only the first ${cap - 1} steps are shown).`,
        { cycle: true },
      );
    else
      snap(
        "No Hamiltonian cycle",
        `Every possible path from ${L(start)} was tried (${nodes} path extensions, ${backtracks} backtracks) and none closes into a cycle.${wasCut ? ` Only the first ${cap - 1} steps are shown.` : ""}`,
      );
  }
  return { frames, found, nodes, backtracks, truncated: wasCut };
}

/** Euler circuit test: connected (ignoring isolated vertices) and every degree even. Polynomial, unlike Hamiltonicity. */
export function eulerCheck(g: Graph) {
  const deg = g.labels.map(
    (_, i) => g.edges.filter((e) => e.u === i || e.v === i).length,
  );
  const adj = adjacency(g),
    seen = new Set([0]),
    st = [0];
  while (st.length) {
    const u = st.pop()!;
    for (const { v } of adj[u])
      if (!seen.has(v)) {
        seen.add(v);
        st.push(v);
      }
  }
  const connected = seen.size === g.labels.length;
  return { deg, connected, euler: connected && deg.every((d) => d % 2 === 0) };
}

/** HAM-CYCLE ≤p TSP: complete graph, cost 1 on edges of G and 2 on non-edges, bound k = n. */
export function hamToTsp(g: Graph) {
  const n = g.labels.length,
    D = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) =>
        i === j
          ? 0
          : g.edges.some(
                (e) => (e.u === i && e.v === j) || (e.u === j && e.v === i),
              )
            ? 1
            : 2,
      ),
    );
  const { cost, tour } = heldKarp(D);
  return { D, k: n, cost, tour, yes: cost <= n };
}

/* ---------- TSP ---------- */
function mulberry(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export interface Cities {
  labels: string[];
  pos: [number, number][];
  D: number[][];
}
export function makeCities(n: number, seed: number): Cities {
  const r = mulberry(seed),
    pos: [number, number][] = [];
  let guard = 0;
  while (pos.length < n && guard++ < 5000) {
    const p: [number, number] = [55 + r() * 550, 45 + r() * 260];
    if (pos.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > 85))
      pos.push([Math.round(p[0]), Math.round(p[1])]);
  }
  const D = pos.map((a) =>
    pos.map((b) => Math.round(Math.hypot(a[0] - b[0], a[1] - b[1]) / 5)),
  );
  return { labels: pos.map((_, i) => String.fromCharCode(65 + i)), pos, D };
}
export const tourCost = (D: number[][], t: number[]) =>
  t.reduce((s, v, i) => s + D[v][t[(i + 1) % t.length]], 0);

export interface TFrame {
  tour: number[];
  cost: number;
  best: number[];
  bestCost: number;
  checked: number;
  title: string;
  text: string;
  extra?: number[][];
}
/** Every tour that starts at city 0, each undirected tour once ((n−1)!/2 of them), in lexicographic order. */
export function bruteForceTSP(c: Cities) {
  const n = c.D.length,
    frames: TFrame[] = [];
  let best: number[] = [],
    bestCost = Infinity,
    checked = 0;
  const rest = Array.from({ length: n - 1 }, (_, i) => i + 1);
  const perm = (arr: number[], k: number, out: number[][]) => {
    if (k === arr.length) {
      out.push([...arr]);
      return;
    }
    for (let i = k; i < arr.length; i++) {
      [arr[k], arr[i]] = [arr[i], arr[k]];
      perm(arr, k + 1, out);
      [arr[k], arr[i]] = [arr[i], arr[k]];
    }
  };
  const all: number[][] = [];
  perm(rest, 0, all);
  all.sort((a, b) => {
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
    return 0;
  });
  for (const p of all) {
    if (n > 2 && p[0] > p[p.length - 1]) continue; // the reverse of a tour already seen
    const t = [0, ...p],
      cost = tourCost(c.D, t);
    checked++;
    const better = cost < bestCost;
    if (better) {
      bestCost = cost;
      best = t;
    }
    frames.push({
      tour: t,
      cost,
      best: [...best],
      bestCost,
      checked,
      title: `Tour ${checked}: ${[...t, 0].map((i) => c.labels[i]).join(" → ")} = ${cost}`,
      text: better
        ? `New best tour (cost ${cost}).`
        : `Not better than the best so far (${bestCost}).`,
    });
  }
  frames.push({
    tour: best,
    cost: bestCost,
    best,
    bestCost,
    checked,
    title: `Optimal tour: cost ${bestCost}`,
    text: `Checked all ${checked} distinct tours: (n − 1)!/2 for n = ${n}. Each costs Θ(n) to add up, so Θ(n!) in total.`,
  });
  return { frames, best, bestCost, checked };
}
/** Held–Karp dynamic programming, Θ(n² 2ⁿ): the exact optimum used to check the other methods. */
export function heldKarp(D: number[][]) {
  const n = D.length,
    full = 1 << n;
  if (n === 1) return { cost: 0, tour: [0] };
  const dp: number[][] = Array.from({ length: full }, () =>
      Array(n).fill(Infinity),
    ),
    par: number[][] = Array.from({ length: full }, () => Array(n).fill(-1));
  dp[1][0] = 0;
  for (let m = 1; m < full; m++) {
    if (!(m & 1)) continue;
    for (let j = 0; j < n; j++) {
      if (!(m & (1 << j)) || dp[m][j] === Infinity) continue;
      for (let k = 0; k < n; k++) {
        if (m & (1 << k)) continue;
        const nm = m | (1 << k),
          c = dp[m][j] + D[j][k];
        if (c < dp[nm][k]) {
          dp[nm][k] = c;
          par[nm][k] = j;
        }
      }
    }
  }
  let cost = Infinity,
    last = -1;
  for (let j = 1; j < n; j++) {
    const c = dp[full - 1][j] + D[j][0];
    if (c < cost) {
      cost = c;
      last = j;
    }
  }
  const tour: number[] = [];
  let m = full - 1,
    j = last;
  while (j > 0) {
    tour.push(j);
    const p = par[m][j];
    m ^= 1 << j;
    j = p;
  }
  tour.push(0);
  tour.reverse();
  return { cost, tour };
}
export function nearestNeighbour(c: Cities, s = 0) {
  const n = c.D.length,
    t = [s],
    used = new Set([s]),
    frames: TFrame[] = [];
  const L = (i: number) => c.labels[i];
  frames.push({
    tour: [...t],
    cost: 0,
    best: [],
    bestCost: 0,
    checked: 0,
    title: `Start at ${L(s)}`,
    text: "Always move to the closest city not yet visited. Θ(n²), but no guarantee of optimality.",
  });
  while (t.length < n) {
    const u = t[t.length - 1];
    let v = -1;
    for (let x = 0; x < n; x++)
      if (!used.has(x) && (v < 0 || c.D[u][x] < c.D[u][v])) v = x;
    t.push(v);
    used.add(v);
    frames.push({
      tour: [...t],
      cost: tourCost(c.D, t) - c.D[v][t[0]],
      best: [],
      bestCost: 0,
      checked: 0,
      title: `${L(u)} → ${L(v)} (distance ${c.D[u][v]})`,
      text: `${L(v)} is the closest unvisited city to ${L(u)}.`,
    });
  }
  const cost = tourCost(c.D, t);
  frames.push({
    tour: t,
    cost,
    best: t,
    bestCost: cost,
    checked: 0,
    title: `Return to ${L(s)}: tour cost ${cost}`,
    text: "Greedy choices early on can force long edges at the end.",
  });
  return { frames, tour: t, cost };
}
/** Metric TSP 2-approximation: MST (Prim from city 0), preorder walk, shortcut repeated cities. */
export function mstApprox(c: Cities) {
  const n = c.D.length,
    inT = Array(n).fill(false),
    key = Array(n).fill(Infinity),
    par = Array(n).fill(-1),
    frames: TFrame[] = [];
  key[0] = 0;
  const mstEdges: number[][] = [];
  const L = (i: number) => c.labels[i];
  frames.push({
    tour: [],
    cost: 0,
    best: [],
    bestCost: 0,
    checked: 0,
    extra: [],
    title: "Step 1: build a minimum spanning tree",
    text: "Removing one edge from the optimal tour leaves a spanning tree, so MST weight ≤ optimal tour cost.",
  });
  for (let it = 0; it < n; it++) {
    let u = -1;
    for (let v = 0; v < n; v++)
      if (!inT[v] && (u < 0 || key[v] < key[u])) u = v;
    inT[u] = true;
    if (par[u] >= 0) {
      mstEdges.push([par[u], u]);
      frames.push({
        tour: [],
        cost: 0,
        best: [],
        bestCost: 0,
        checked: 0,
        extra: mstEdges.map((e) => [...e]),
        title: `MST edge ${L(par[u])}–${L(u)} (${c.D[par[u]][u]})`,
        text: "Prim adds the cheapest edge leaving the tree.",
      });
    }
    for (let v = 0; v < n; v++)
      if (!inT[v] && c.D[u][v] < key[v]) {
        key[v] = c.D[u][v];
        par[v] = u;
      }
  }
  const mstW = mstEdges.reduce((s, [a, b]) => s + c.D[a][b], 0);
  const kids: number[][] = Array.from({ length: n }, () => []);
  mstEdges.forEach(([a, b]) => kids[a].push(b));
  kids.forEach((k) => k.sort((x, y) => x - y));
  const order: number[] = [];
  const walk = (u: number) => {
    order.push(u);
    kids[u].forEach(walk);
  };
  walk(0);
  for (let k = 1; k <= n; k++)
    frames.push({
      tour: order.slice(0, k),
      cost: 0,
      best: [],
      bestCost: 0,
      checked: 0,
      extra: mstEdges,
      title: `Step 2: preorder walk, visit ${L(order[k - 1])}`,
      text: "Walk the tree depth-first and list cities the first time they are reached. Skipping repeats is a shortcut, which never adds length when distances obey the triangle inequality.",
    });
  const cost = tourCost(c.D, order);
  frames.push({
    tour: order,
    cost,
    best: order,
    bestCost: cost,
    checked: 0,
    extra: mstEdges,
    title: `Tour cost ${cost} ≤ 2 × MST = ${2 * mstW}`,
    text: `The full walk costs exactly 2 × MST = ${2 * mstW}; shortcuts only shorten it. Since MST ≤ OPT, this tour is at most twice the optimum.`,
  });
  return { frames, tour: order, cost, mstW };
}
