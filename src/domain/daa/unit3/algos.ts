/* Unit 3 — graph algorithms that record one frame per meaningful step.
 * A frame says how to colour every vertex and edge, what the data structure (queue, stack, priority
 * queue) holds, and what to print under each vertex, so the visual never computes anything itself. */
import { adjacency, edgeKey, transpose, type Graph } from "./graphs";

export type VState = "unseen" | "frontier" | "active" | "done" | "ap" | "bad";
export type EState =
  | "tree"
  | "back"
  | "forward"
  | "cross"
  | "checked"
  | "removed"
  | "relaxed"
  | "sp"
  | "bridge"
  | "focus";
export interface GFrame {
  title: string;
  text: string;
  vstate: VState[];
  estate: Record<string, EState>;
  focusEdge?: string;
  under: string[]; // label printed under each vertex
  ds?: { name: string; items: string[] };
  comp?: (number | null)[]; // component index per vertex (for colouring groups)
  ecomp?: Record<string, number>; // component index per edge (biconnected components)
  out?: string[]; // an output sequence (visit order, topological order…)
  counters: Record<string, number>;
}
type Base = Omit<
  GFrame,
  "vstate" | "estate" | "under" | "counters" | "comp" | "out" | "ecomp"
>;

function recorder(g: Graph) {
  const n = g.labels.length;
  const vstate: VState[] = Array(n).fill("unseen"),
    estate: Record<string, EState> = {},
    under: string[] = Array(n).fill(""),
    counters: Record<string, number> = {};
  let comp: (number | null)[] | undefined, out: string[] | undefined;
  const ecomp: Record<string, number> = {};
  const frames: GFrame[] = [];
  return {
    vstate,
    estate,
    under,
    counters,
    frames,
    ecomp,
    setComp: (c: (number | null)[]) => {
      comp = c;
    },
    setOut: (o: string[]) => {
      out = o;
    },
    snap: (f: Base) =>
      frames.push({
        ...f,
        vstate: [...vstate],
        estate: { ...estate },
        under: [...under],
        counters: { ...counters },
        comp: comp ? [...comp] : undefined,
        out: out ? [...out] : undefined,
        ecomp: Object.keys(ecomp).length ? { ...ecomp } : undefined,
      }),
  };
}
const L = (g: Graph, i: number) => g.labels[i];
const fmtD = (d: number) => (d === Infinity ? "∞" : String(d));

/* ---------- Breadth-first search ---------- */
export function bfs(g: Graph, s: number) {
  const adj = adjacency(g),
    R = recorder(g),
    n = g.labels.length;
  const dist = Array(n).fill(Infinity),
    parent = Array(n).fill(-1),
    order: string[] = [];
  R.counters.vertices = 0;
  R.counters.edges = 0;
  dist[s] = 0;
  R.vstate[s] = "frontier";
  R.under[s] = "d=0";
  const q = [s];
  R.setOut(order);
  R.snap({
    title: `Start at ${L(g, s)}`,
    text: `Mark ${L(g, s)} discovered with distance 0 and put it in the queue.`,
    ds: { name: "Queue (front → back)", items: q.map((x) => L(g, x)) },
  });
  while (q.length) {
    const u = q.shift()!;
    R.vstate[u] = "active";
    R.counters.vertices++;
    order.push(L(g, u));
    R.setOut(order);
    R.snap({
      title: `Dequeue ${L(g, u)} (distance ${dist[u]})`,
      text: `Examine every neighbour of ${L(g, u)}.`,
      ds: { name: "Queue (front → back)", items: q.map((x) => L(g, x)) },
    });
    for (const { v } of adj[u]) {
      R.counters.edges++;
      const k = edgeKey(g, u, v);
      if (dist[v] === Infinity) {
        dist[v] = dist[u] + 1;
        parent[v] = u;
        q.push(v);
        R.vstate[v] = "frontier";
        R.under[v] = `d=${dist[v]}`;
        R.estate[k] = "tree";
        R.snap({
          title: `${L(g, v)} is new`,
          text: `Discover ${L(g, v)}: distance ${dist[v]}, parent ${L(g, u)}. Enqueue it.`,
          focusEdge: k,
          ds: { name: "Queue (front → back)", items: q.map((x) => L(g, x)) },
        });
      } else {
        if (!R.estate[k]) R.estate[k] = "checked";
        R.snap({
          title: `${L(g, v)} already discovered`,
          text: `${L(g, v)} was discovered earlier (distance ${dist[v]}); ignore this edge.`,
          focusEdge: k,
          ds: { name: "Queue (front → back)", items: q.map((x) => L(g, x)) },
        });
      }
    }
    R.vstate[u] = "done";
  }
  R.snap({
    title: "BFS finished",
    text: `Visited ${order.length} vertices and examined ${R.counters.edges} edge ends: O(V + E). Green edges form the BFS tree, which gives shortest paths in number of edges.`,
    ds: { name: "Queue (front → back)", items: [] },
  });
  return { frames: R.frames, dist, parent, order };
}

/* ---------- Depth-first search with discovery/finish times and edge classes ---------- */
export function dfs(g: Graph, s: number) {
  const adj = adjacency(g),
    R = recorder(g),
    n = g.labels.length;
  const color = Array(n).fill(0),
    d = Array(n).fill(0),
    f = Array(n).fill(0),
    parent = Array(n).fill(-1);
  let time = 0;
  const stack: number[] = [],
    order: string[] = [];
  R.counters.edges = 0;
  R.setOut(order);
  const label = (u: number) => {
    R.under[u] = f[u] ? `${d[u]}/${f[u]}` : `${d[u]}/–`;
  };
  const visit = (u: number) => {
    color[u] = 1;
    d[u] = ++time;
    stack.push(u);
    R.vstate[u] = "active";
    label(u);
    order.push(L(g, u));
    R.setOut(order);
    R.snap({
      title: `Discover ${L(g, u)} at time ${d[u]}`,
      text: `${L(g, u)} turns grey (on the recursion stack). Explore its neighbours in order.`,
      ds: {
        name: "Recursion stack (bottom → top)",
        items: stack.map((x) => L(g, x)),
      },
    });
    for (const { v } of adj[u]) {
      if (!g.directed && v === parent[u]) continue;
      R.counters.edges++;
      const k = edgeKey(g, u, v);
      if (color[v] === 0) {
        R.estate[k] = "tree";
        parent[v] = u;
        R.snap({
          title: `Tree edge ${L(g, u)} → ${L(g, v)}`,
          text: `${L(g, v)} is white (undiscovered): go deeper.`,
          focusEdge: k,
          ds: {
            name: "Recursion stack (bottom → top)",
            items: stack.map((x) => L(g, x)),
          },
        });
        R.vstate[u] = "frontier";
        visit(v);
        R.vstate[u] = "active";
      } else if (color[v] === 1) {
        R.estate[k] = "back";
        R.snap({
          title: `Back edge ${L(g, u)} → ${L(g, v)}`,
          text: `${L(g, v)} is grey: it is an ancestor still on the stack, so this edge closes a cycle.`,
          focusEdge: k,
          ds: {
            name: "Recursion stack (bottom → top)",
            items: stack.map((x) => L(g, x)),
          },
        });
      } else if (g.directed) {
        const fwd = d[u] < d[v];
        R.estate[k] = fwd ? "forward" : "cross";
        R.snap({
          title: `${fwd ? "Forward" : "Cross"} edge ${L(g, u)} → ${L(g, v)}`,
          text: fwd
            ? `${L(g, v)} is black and a descendant of ${L(g, u)} (d[${L(g, u)}] = ${d[u]} < d[${L(g, v)}] = ${d[v]}).`
            : `${L(g, v)} is black and not a descendant: it was finished in an earlier branch or tree.`,
          focusEdge: k,
          ds: {
            name: "Recursion stack (bottom → top)",
            items: stack.map((x) => L(g, x)),
          },
        });
      }
    }
    color[u] = 2;
    f[u] = ++time;
    stack.pop();
    R.vstate[u] = "done";
    label(u);
    R.snap({
      title: `Finish ${L(g, u)} at time ${f[u]}`,
      text: `All neighbours explored; ${L(g, u)} turns black and is popped.`,
      ds: {
        name: "Recursion stack (bottom → top)",
        items: stack.map((x) => L(g, x)),
      },
    });
  };
  const roots = [s, ...g.labels.map((_, i) => i).filter((i) => i !== s)];
  for (const r of roots)
    if (color[r] === 0) {
      if (r !== s)
        R.snap({
          title: `New DFS tree from ${L(g, r)}`,
          text: `${L(g, r)} was not reached, so start a new tree in the DFS forest.`,
          ds: { name: "Recursion stack (bottom → top)", items: [] },
        });
      visit(r);
    }
  R.snap({
    title: "DFS finished",
    text: `Each vertex shows discovery/finish time. Intervals [d, f] are properly nested (the parenthesis theorem). Total work O(V + E).`,
    ds: { name: "Recursion stack (bottom → top)", items: [] },
  });
  return { frames: R.frames, d, f, parent, edgeClass: R.estate };
}

/* ---------- Connected components (undirected) ---------- */
export function components(g: Graph) {
  const adj = adjacency(g),
    R = recorder(g),
    n = g.labels.length,
    comp: (number | null)[] = Array(n).fill(null);
  let c = -1;
  for (let s = 0; s < n; s++) {
    if (comp[s] !== null) continue;
    c++;
    comp[s] = c;
    R.setComp(comp);
    R.vstate[s] = "active";
    R.under[s] = `#${c + 1}`;
    R.snap({
      title: `Component ${c + 1}: start BFS at ${L(g, s)}`,
      text: `${L(g, s)} has no label yet, so it starts a new component.`,
      ds: {
        name: "Components found",
        items: Array.from({ length: c + 1 }, (_, i) => `#${i + 1}`),
      },
    });
    const q = [s];
    while (q.length) {
      const u = q.shift()!;
      for (const { v } of adj[u])
        if (comp[v] === null) {
          comp[v] = c;
          q.push(v);
          R.vstate[v] = "active";
          R.under[v] = `#${c + 1}`;
          R.estate[edgeKey(g, u, v)] = "tree";
          R.setComp(comp);
          R.snap({
            title: `Label ${L(g, v)} with component ${c + 1}`,
            text: `${L(g, v)} is reachable from ${L(g, s)} (through ${L(g, u)}).`,
            focusEdge: edgeKey(g, u, v),
            ds: {
              name: "Components found",
              items: Array.from({ length: c + 1 }, (_, i) => `#${i + 1}`),
            },
          });
        }
    }
    for (let i = 0; i < n; i++) if (comp[i] === c) R.vstate[i] = "done";
  }
  R.snap({
    title: `${c + 1} connected component${c ? "s" : ""}`,
    text: "Every vertex has a label, and two vertices are connected exactly when their labels match. One pass over all vertices and edges: O(V + E).",
    ds: {
      name: "Components found",
      items: Array.from({ length: c + 1 }, (_, i) => `#${i + 1}`),
    },
  });
  return { frames: R.frames, comp: comp as number[], count: c + 1 };
}

/* ---------- Strongly connected components (Kosaraju: DFS on G, then DFS on Gᵀ by decreasing finish time) ---------- */
export function kosaraju(g: Graph) {
  const n = g.labels.length,
    adj = adjacency(g),
    adjT = adjacency(transpose(g)),
    R = recorder(g);
  const seen = Array(n).fill(false),
    finish: number[] = [];
  const d1 = (u: number) => {
    seen[u] = true;
    R.vstate[u] = "frontier";
    for (const { v } of adj[u])
      if (!seen[v]) {
        R.estate[edgeKey(g, u, v)] = "tree";
        d1(v);
      }
    finish.push(u);
    R.vstate[u] = "done";
    R.under[u] = `f#${finish.length}`;
    R.setOut(finish.map((x) => L(g, x)));
    R.snap({
      title: `Pass 1: ${L(g, u)} finishes (#${finish.length})`,
      text: "First DFS on G records the order in which vertices finish.",
      ds: { name: "Finish order", items: finish.map((x) => L(g, x)) },
    });
  };
  for (let i = 0; i < n; i++) if (!seen[i]) d1(i);
  for (const k of Object.keys(R.estate)) delete R.estate[k];
  for (let i = 0; i < n; i++) {
    R.vstate[i] = "unseen";
  }
  R.snap({
    title: "Pass 2: reverse every edge (Gᵀ)",
    text: "An SCC stays the same when all edges are reversed, but edges between different SCCs now point the other way, which stops the DFS from leaking into other components.",
    ds: {
      name: "Process in decreasing finish",
      items: [...finish].reverse().map((x) => L(g, x)),
    },
  });
  const comp: (number | null)[] = Array(n).fill(null);
  let c = -1;
  const d2 = (u: number) => {
    comp[u] = c;
    R.setComp(comp);
    R.vstate[u] = "done";
    R.under[u] = `SCC ${c + 1}`;
    R.snap({
      title: `Pass 2: ${L(g, u)} joins SCC ${c + 1}`,
      text: `Reached ${L(g, u)} in Gᵀ from the current root without leaving the component.`,
      ds: {
        name: "Process in decreasing finish",
        items: [...finish]
          .reverse()
          .filter((x) => comp[x] === null)
          .map((x) => L(g, x)),
      },
    });
    for (const { v } of adjT[u]) if (comp[v] === null) d2(v);
  };
  for (const u of [...finish].reverse())
    if (comp[u] === null) {
      c++;
      d2(u);
    }
  R.snap({
    title: `${c + 1} strongly connected components`,
    text: "Inside one SCC every vertex can reach every other. Two DFS passes plus a transpose: Θ(V + E).",
    ds: { name: "Process in decreasing finish", items: [] },
  });
  return { frames: R.frames, comp: comp as number[], count: c + 1 };
}

/* ---------- Topological sort: Kahn (in-degree queue) and DFS (reverse finishing order) ---------- */
export function topoKahn(g: Graph) {
  const n = g.labels.length,
    adj = adjacency(g),
    R = recorder(g),
    indeg = Array(n).fill(0);
  for (const e of g.edges) indeg[e.v]++;
  for (let i = 0; i < n; i++) R.under[i] = `in=${indeg[i]}`;
  const q = indeg.map((x, i) => (x === 0 ? i : -1)).filter((i) => i >= 0),
    order: string[] = [];
  q.forEach((i) => {
    R.vstate[i] = "frontier";
  });
  R.setOut(order);
  R.snap({
    title: "Count in-degrees",
    text: `Vertices with in-degree 0 have no prerequisites: ${q.map((i) => L(g, i)).join(", ")}. Queue them.`,
    ds: { name: "Queue (in-degree 0)", items: q.map((x) => L(g, x)) },
  });
  while (q.length) {
    const u = q.shift()!;
    order.push(L(g, u));
    R.vstate[u] = "done";
    R.setOut(order);
    R.snap({
      title: `Output ${L(g, u)}`,
      text: `${L(g, u)} has no remaining incoming edges, so it can go next. Remove its outgoing edges.`,
      ds: { name: "Queue (in-degree 0)", items: q.map((x) => L(g, x)) },
    });
    for (const { v } of adj[u]) {
      indeg[v]--;
      R.under[v] = `in=${indeg[v]}`;
      R.estate[edgeKey(g, u, v)] = "removed";
      if (indeg[v] === 0) {
        q.push(v);
        R.vstate[v] = "frontier";
      }
      R.snap({
        title: `Remove ${L(g, u)} → ${L(g, v)}`,
        text: `In-degree of ${L(g, v)} drops to ${indeg[v]}.${indeg[v] === 0 ? ` ${L(g, v)} is now free: enqueue it.` : ""}`,
        focusEdge: edgeKey(g, u, v),
        ds: { name: "Queue (in-degree 0)", items: q.map((x) => L(g, x)) },
      });
    }
  }
  const cyclic = order.length < n;
  if (cyclic)
    for (let i = 0; i < n; i++) if (R.vstate[i] !== "done") R.vstate[i] = "bad";
  R.snap({
    title: cyclic ? "Not a DAG: cycle detected" : "Topological order found",
    text: cyclic
      ? `Only ${order.length} of ${n} vertices could be output. The rest (red) still have incoming edges from each other: they lie on or behind a cycle, so no topological order exists.`
      : `Every edge goes from earlier to later in ${order.join(" → ")}. Kahn's algorithm runs in Θ(V + E).`,
    ds: { name: "Queue (in-degree 0)", items: [] },
  });
  return { frames: R.frames, order, cyclic };
}
export function topoDFS(g: Graph) {
  const n = g.labels.length,
    adj = adjacency(g),
    R = recorder(g),
    color = Array(n).fill(0),
    list: number[] = [];
  let time = 0,
    cyclic = false;
  const visit = (u: number) => {
    color[u] = 1;
    R.vstate[u] = "active";
    R.under[u] = `d=${++time}`;
    R.snap({
      title: `Visit ${L(g, u)}`,
      text: "DFS goes deep first; a vertex can only finish after everything it points to has finished.",
      ds: {
        name: "Order so far (finished vertices, prepended)",
        items: list.map((x) => L(g, x)),
      },
    });
    for (const { v } of adj[u]) {
      const k = edgeKey(g, u, v);
      if (color[v] === 0) {
        R.estate[k] = "tree";
        visit(v);
      } else if (color[v] === 1) {
        cyclic = true;
        R.estate[k] = "back";
        R.vstate[v] = "bad";
        R.snap({
          title: `Back edge ${L(g, u)} → ${L(g, v)}: cycle!`,
          text: "An edge to a grey vertex means a cycle. A graph with a cycle has no topological order.",
          focusEdge: k,
          ds: {
            name: "Order so far (finished vertices, prepended)",
            items: list.map((x) => L(g, x)),
          },
        });
      }
    }
    color[u] = 2;
    list.unshift(u);
    R.vstate[u] = (R.vstate[u] as VState) === "bad" ? "bad" : "done";
    R.under[u] = `f=${++time}`;
    R.setOut(list.map((x) => L(g, x)));
    R.snap({
      title: `Finish ${L(g, u)}: put it at the front`,
      text: `Everything reachable from ${L(g, u)} is already in the list, so ${L(g, u)} goes before all of it.`,
      ds: {
        name: "Order so far (finished vertices, prepended)",
        items: list.map((x) => L(g, x)),
      },
    });
  };
  for (let i = 0; i < n; i++) if (color[i] === 0) visit(i);
  R.snap({
    title: cyclic ? "Not a DAG" : "Topological order = decreasing finish time",
    text: cyclic
      ? "A back edge was found, so the order above is not valid."
      : `${list.map((x) => L(g, x)).join(" → ")}. Θ(V + E).`,
    ds: {
      name: "Order so far (finished vertices, prepended)",
      items: list.map((x) => L(g, x)),
    },
  });
  return { frames: R.frames, order: list.map((x) => L(g, x)), cyclic };
}

/* ---------- Biconnected components, articulation points and bridges (Tarjan, low-link values) ---------- */
export function biconnected(g: Graph) {
  const n = g.labels.length,
    adj = adjacency(g),
    R = recorder(g);
  const disc = Array(n).fill(0),
    low = Array(n).fill(0),
    parent = Array(n).fill(-1);
  const aps = new Set<number>(),
    bridges: string[] = [],
    bccs: number[][] = [],
    estack: [number, number][] = [];
  let time = 0;
  const lab = (u: number) => {
    R.under[u] = `${disc[u]}/${low[u]}`;
  };
  const ds = () => ({
    name: "Edge stack (bottom → top)",
    items: estack.map(([a, b]) => `${L(g, a)}${L(g, b)}`),
  });
  const visit = (u: number) => {
    disc[u] = low[u] = ++time;
    R.vstate[u] = "active";
    lab(u);
    let children = 0;
    R.snap({
      title: `Discover ${L(g, u)}: disc = low = ${disc[u]}`,
      text: "low[u] will become the smallest discovery time reachable from u’s subtree using at most one back edge.",
      ds: ds(),
    });
    for (const { v } of adj[u]) {
      const k = edgeKey(g, u, v);
      if (!disc[v]) {
        children++;
        parent[v] = u;
        estack.push([u, v]);
        R.estate[k] = "tree";
        visit(v);
        low[u] = Math.min(low[u], low[v]);
        lab(u);
        const isRoot = parent[u] === -1,
          cut = low[v] >= disc[u];
        R.snap({
          title: `Back at ${L(g, u)} from ${L(g, v)}: low[${L(g, u)}] = ${low[u]}`,
          text: `low[${L(g, v)}] = ${low[v]} ${cut ? `≥ disc[${L(g, u)}] = ${disc[u]}: nothing in ${L(g, v)}’s subtree climbs above ${L(g, u)}.` : `< disc[${L(g, u)}] = ${disc[u]}: ${L(g, v)}’s subtree has a back edge above ${L(g, u)}.`}`,
          focusEdge: k,
          ds: ds(),
        });
        if (low[v] > disc[u]) {
          R.estate[k] = "bridge";
          bridges.push(k);
        }
        if (cut) {
          if (!isRoot || children > 1) {
            aps.add(u);
            R.vstate[u] = "ap";
          }
          const part: number[] = [];
          let e: [number, number];
          do {
            e = estack.pop()!;
            R.ecomp[edgeKey(g, e[0], e[1])] = bccs.length;
            for (const x of e) if (!part.includes(x)) part.push(x);
          } while (!(e[0] === u && e[1] === v));
          bccs.push(part);
          R.snap({
            title: `Biconnected component #${bccs.length}: {${part.map((x) => L(g, x)).join(", ")}}`,
            text: `Pop edges down to ${L(g, u)}${L(g, v)}.${low[v] > disc[u] ? ` low[${L(g, v)}] > disc[${L(g, u)}], so ${L(g, u)}–${L(g, v)} is a bridge.` : ""}${aps.has(u) ? ` ${L(g, u)} is an articulation point: removing it disconnects ${L(g, v)}’s subtree.` : isRoot ? ` ${L(g, u)} is the root with ${children} child so far; a root is a cut vertex only with ≥ 2 DFS children.` : ""}`,
            ds: ds(),
          });
        }
      } else if (v !== parent[u] && disc[v] < disc[u]) {
        estack.push([u, v]);
        R.estate[k] = "back";
        low[u] = Math.min(low[u], disc[v]);
        lab(u);
        R.snap({
          title: `Back edge ${L(g, u)} – ${L(g, v)}`,
          text: `${L(g, v)} is an ancestor (disc ${disc[v]}), so low[${L(g, u)}] = min(low, ${disc[v]}) = ${low[u]}.`,
          focusEdge: k,
          ds: ds(),
        });
      }
    }
    if (R.vstate[u] !== "ap") R.vstate[u] = "done";
  };
  for (let i = 0; i < n; i++) if (!disc[i]) visit(i);
  R.snap({
    title: `${bccs.length} biconnected components, ${aps.size} articulation points, ${bridges.length} bridges`,
    text: `Articulation points: ${[...aps].map((x) => L(g, x)).join(", ") || "none"}. One DFS: O(V + E).`,
    ds: ds(),
  });
  return {
    frames: R.frames,
    aps: [...aps].sort((a, b) => a - b),
    bridges,
    bccs,
    disc,
    low,
  };
}

/* ---------- Single-source shortest paths ---------- */
const pathTo = (parent: number[], v: number) => {
  const p: number[] = [];
  for (let x = v; x !== -1; x = parent[x]) {
    p.unshift(x);
    if (p.length > parent.length) break;
  }
  return p;
};
function finishSP(
  g: Graph,
  R: ReturnType<typeof recorder>,
  dist: number[],
  parent: number[],
) {
  for (const k of Object.keys(R.estate))
    if (R.estate[k] === "relaxed" || R.estate[k] === "sp") delete R.estate[k];
  parent.forEach((p, v) => {
    if (p >= 0) R.estate[edgeKey(g, p, v)] = "sp";
  });
  return { dist, parent, paths: dist.map((_, v) => pathTo(parent, v)) };
}
export function dijkstra(g: Graph, s: number) {
  const n = g.labels.length,
    adj = adjacency(g),
    R = recorder(g),
    dist = Array(n).fill(Infinity),
    parent = Array(n).fill(-1),
    done = Array(n).fill(false);
  R.counters.relaxations = 0;
  R.counters.extracts = 0;
  dist[s] = 0;
  dist.forEach((d, i) => {
    R.under[i] = fmtD(d);
  });
  const pq = () => ({
    name: "Priority queue (by distance)",
    items: dist
      .map((d, i) => ({ d, i }))
      .filter((x) => !done[x.i] && x.d < Infinity)
      .sort((a, b) => a.d - b.d || a.i - b.i)
      .map((x) => `${L(g, x.i)}:${x.d}`),
  });
  R.vstate[s] = "frontier";
  R.snap({
    title: `Initialise: d[${L(g, s)}] = 0, all others ∞`,
    text: "Repeatedly settle the unsettled vertex with the smallest distance.",
    ds: pq(),
  });
  for (;;) {
    let u = -1;
    for (let i = 0; i < n; i++)
      if (!done[i] && dist[i] < Infinity && (u < 0 || dist[i] < dist[u])) u = i;
    if (u < 0) break;
    done[u] = true;
    R.vstate[u] = "active";
    R.counters.extracts++;
    R.snap({
      title: `Extract-min: settle ${L(g, u)} with d = ${dist[u]}`,
      text: "With non-negative weights no later path can be shorter, so d[u] is now final.",
      ds: pq(),
    });
    for (const { v, w } of adj[u]) {
      const k = edgeKey(g, u, v);
      R.counters.relaxations++;
      if (dist[u] + w < dist[v]) {
        const old = dist[v];
        dist[v] = dist[u] + w;
        parent[v] = v === s ? -1 : u;
        R.under[v] = fmtD(dist[v]);
        if (!done[v]) R.vstate[v] = "frontier";
        R.estate[k] = "relaxed";
        R.snap({
          title: `Relax ${L(g, u)} → ${L(g, v)}: ${fmtD(old)} → ${dist[v]}`,
          text: `d[${L(g, u)}] + w = ${dist[u]} + ${w} = ${dist[v]} < ${fmtD(old)}: update d[${L(g, v)}] and its parent.`,
          focusEdge: k,
          ds: pq(),
        });
      } else
        R.snap({
          title: `Relax ${L(g, u)} → ${L(g, v)}: no change`,
          text: `${dist[u]} + ${w} = ${dist[u] + w} ≥ d[${L(g, v)}] = ${fmtD(dist[v])}.`,
          focusEdge: k,
          ds: pq(),
        });
    }
    R.vstate[u] = "done";
  }
  const res = finishSP(g, R, dist, parent);
  R.snap({
    title: "Dijkstra finished",
    text: `Green edges form the shortest-path tree. ${R.counters.relaxations} relaxations (one per edge). With a binary heap the time is O((V + E) log V).`,
    ds: pq(),
  });
  return { frames: R.frames, ...res };
}
export function bellmanFord(g: Graph, s: number) {
  const n = g.labels.length,
    R = recorder(g),
    dist = Array(n).fill(Infinity),
    parent = Array(n).fill(-1);
  R.counters.relaxations = 0;
  R.counters.passes = 0;
  dist[s] = 0;
  dist.forEach((d, i) => {
    R.under[i] = fmtD(d);
  });
  R.vstate[s] = "frontier";
  const edgeList = () => ({
    name: "Edge order (every pass)",
    items: g.edges.map((e) => `${L(g, e.u)}${L(g, e.v)}`),
  });
  R.snap({
    title: `Initialise: d[${L(g, s)}] = 0`,
    text: `Relax every edge, in a fixed order, |V| − 1 = ${n - 1} times.`,
    ds: edgeList(),
  });
  for (let pass = 1; pass < n; pass++) {
    R.counters.passes = pass;
    let changed = false;
    for (const e of g.edges) {
      const k = edgeKey(g, e.u, e.v);
      R.counters.relaxations++;
      if (dist[e.u] !== Infinity && dist[e.u] + e.w < dist[e.v]) {
        const old = dist[e.v];
        dist[e.v] = dist[e.u] + e.w;
        parent[e.v] = e.u;
        R.under[e.v] = fmtD(dist[e.v]);
        R.vstate[e.v] = "frontier";
        R.estate[k] = "relaxed";
        changed = true;
        R.snap({
          title: `Pass ${pass}: relax ${L(g, e.u)} → ${L(g, e.v)} (w = ${e.w})`,
          text: `${dist[e.u]} + (${e.w}) = ${dist[e.v]} < ${fmtD(old)}: update.`,
          focusEdge: k,
          ds: edgeList(),
        });
      } else
        R.snap({
          title: `Pass ${pass}: ${L(g, e.u)} → ${L(g, e.v)} (w = ${e.w})`,
          text:
            dist[e.u] === Infinity
              ? `d[${L(g, e.u)}] is still ∞: nothing to propagate yet.`
              : `${dist[e.u]} + (${e.w}) = ${dist[e.u] + e.w} ≥ ${fmtD(dist[e.v])}: no change.`,
          focusEdge: k,
          ds: edgeList(),
        });
    }
    if (!changed) {
      R.snap({
        title: `Pass ${pass} changed nothing: stop early`,
        text: "Distances are final once a full pass makes no update.",
        ds: edgeList(),
      });
      break;
    }
  }
  let negCycle = false;
  for (const e of g.edges)
    if (dist[e.u] !== Infinity && dist[e.u] + e.w < dist[e.v]) {
      negCycle = true;
      R.estate[edgeKey(g, e.u, e.v)] = "back";
      R.vstate[e.v] = "bad";
    }
  const res = negCycle
    ? { dist, parent, paths: [] as number[][] }
    : finishSP(g, R, dist, parent);
  R.snap({
    title: negCycle
      ? "Negative-weight cycle detected"
      : "No negative cycle: distances are final",
    text: negCycle
      ? "After |V| − 1 passes an edge can still be relaxed (red). A reachable negative cycle means shortest paths are undefined: you could loop forever to make paths cheaper."
      : `One extra check pass found nothing to relax. Total O(V·E): here ${R.counters.relaxations} edge relaxations.`,
    ds: edgeList(),
  });
  return { frames: R.frames, ...res, negCycle };
}
export function dagShortest(g: Graph, s: number) {
  const n = g.labels.length,
    adj = adjacency(g),
    R = recorder(g),
    order = topoKahn(g).order.map((l) => g.labels.indexOf(l));
  const dist = Array(n).fill(Infinity),
    parent = Array(n).fill(-1);
  R.counters.relaxations = 0;
  dist[s] = 0;
  dist.forEach((d, i) => {
    R.under[i] = fmtD(d);
  });
  R.setOut(order.map((i) => L(g, i)));
  R.snap({
    title: "Topologically sort, then relax in that order",
    text: `Order: ${order.map((i) => L(g, i)).join(" → ")}. Each vertex is processed once, after all edges into it.`,
    ds: { name: "Topological order", items: order.map((i) => L(g, i)) },
  });
  for (const u of order) {
    R.vstate[u] = "active";
    R.snap({
      title: `Process ${L(g, u)} (d = ${fmtD(dist[u])})`,
      text:
        dist[u] === Infinity
          ? `${L(g, u)} is unreachable from ${L(g, s)}; its edges change nothing.`
          : `Relax every edge leaving ${L(g, u)}.`,
      ds: { name: "Topological order", items: order.map((i) => L(g, i)) },
    });
    for (const { v, w } of adj[u]) {
      const k = edgeKey(g, u, v);
      R.counters.relaxations++;
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        const old = dist[v];
        dist[v] = dist[u] + w;
        parent[v] = u;
        R.under[v] = fmtD(dist[v]);
        R.estate[k] = "relaxed";
        R.snap({
          title: `Relax ${L(g, u)} → ${L(g, v)}: ${fmtD(old)} → ${dist[v]}`,
          text: `${dist[u]} + (${w}) = ${dist[v]}. Negative weights are fine here because there are no cycles.`,
          focusEdge: k,
          ds: { name: "Topological order", items: order.map((i) => L(g, i)) },
        });
      }
    }
    R.vstate[u] = "done";
  }
  const res = finishSP(g, R, dist, parent);
  R.snap({
    title: "DAG shortest paths finished",
    text: `Θ(V + E): every edge relaxed exactly once (${R.counters.relaxations} relaxations).`,
    ds: { name: "Topological order", items: order.map((i) => L(g, i)) },
  });
  return { frames: R.frames, ...res };
}

/** Cost study on seeded random graphs: BFS work vs V + E, and Dijkstra vs Bellman–Ford relaxations. */
export { randomGraph } from "./graphs";
