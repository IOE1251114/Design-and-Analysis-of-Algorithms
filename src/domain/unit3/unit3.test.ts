import { describe, expect, it } from "vitest";
import {
  adjacency,
  edgeKey,
  presets,
  randomGraph,
  withCycle,
  type Graph,
} from "./graphs";
import {
  bellmanFord,
  bfs,
  biconnected,
  components,
  dagShortest,
  dfs,
  dijkstra,
  kosaraju,
  topoDFS,
  topoKahn,
} from "./algos";

const reach = (g: Graph, s: number, skip = -1) => {
  const adj = adjacency(g),
    seen = new Set([s]),
    st = [s];
  while (st.length) {
    const u = st.pop()!;
    for (const { v } of adj[u])
      if (v !== skip && !seen.has(v)) {
        seen.add(v);
        st.push(v);
      }
  }
  return seen;
};
const countComps = (g: Graph, skip = -1) => {
  let c = 0;
  const all = new Set<number>();
  g.labels.forEach((_, i) => {
    if (i !== skip && !all.has(i)) {
      c++;
      reach(g, i, skip).forEach((x) => all.add(x));
    }
  });
  return c;
};
const floyd = (g: Graph) => {
  const n = g.labels.length,
    d = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)),
    );
  for (const e of g.edges) {
    d[e.u][e.v] = Math.min(d[e.u][e.v], e.w);
    if (!g.directed) d[e.v][e.u] = Math.min(d[e.v][e.u], e.w);
  }
  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
  return d;
};
const randoms = Array.from({ length: 12 }, (_, i) =>
  randomGraph(9 + (i % 4), 12 + i, 77 + i),
);

describe("traversal", () => {
  it("BFS distances equal shortest edge counts", () => {
    for (const g of [presets.campus, ...randoms]) {
      const r = bfs(g, 0),
        unit = floyd({ ...g, edges: g.edges.map((e) => ({ ...e, w: 1 })) });
      r.dist.forEach((d, v) => expect(d).toBe(unit[0][v]));
    }
  });
  it("BFS order on the campus graph is deterministic", () =>
    expect(bfs(presets.campus, 0).order).toEqual([
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
    ]));
  it("DFS intervals nest (parenthesis theorem) and classify edges", () => {
    for (const g of [
      presets.campus,
      presets.campusDirected,
      presets.scc,
      ...randoms,
    ]) {
      const { d, f } = dfs(g, 0);
      for (let a = 0; a < d.length; a++)
        for (let b = 0; b < d.length; b++)
          if (a !== b) {
            const disjoint = f[a] < d[b] || f[b] < d[a],
              nested =
                (d[a] < d[b] && f[b] < f[a]) || (d[b] < d[a] && f[a] < f[b]);
            expect(disjoint || nested).toBe(true);
          }
    }
    const cls = Object.values(dfs(presets.campusDirected, 0).edgeClass);
    expect(cls).toContain("back");
  });
});

describe("components", () => {
  it("connected components match reachability", () => {
    expect(components(presets.islands).count).toBe(4);
    for (const g of randoms) {
      const r = components(g);
      expect(r.count).toBe(countComps(g));
      for (const e of g.edges) expect(r.comp[e.u]).toBe(r.comp[e.v]);
    }
  });
  it("Kosaraju gives the textbook SCCs {a,b,e} {c,d} {f,g} {h}", () => {
    const r = kosaraju(presets.scc),
      L = presets.scc.labels;
    const groups = new Map<number, string[]>();
    r.comp.forEach((c, i) => groups.set(c, [...(groups.get(c) ?? []), L[i]]));
    expect([...groups.values()].map((x) => x.sort().join("")).sort()).toEqual([
      "abe",
      "cd",
      "fg",
      "h",
    ]);
  });
  it("SCCs equal mutual reachability on random digraphs", () => {
    for (let i = 0; i < 10; i++) {
      const g = randomGraph(8, 14, 300 + i, true),
        r = kosaraju(g),
        R = g.labels.map((_, s) => reach(g, s));
      for (let a = 0; a < 8; a++)
        for (let b = 0; b < 8; b++)
          expect(r.comp[a] === r.comp[b]).toBe(R[a].has(b) && R[b].has(a));
    }
  });
});

describe("topological sort", () => {
  const valid = (g: Graph, order: string[]) =>
    g.edges.every(
      (e) => order.indexOf(g.labels[e.u]) < order.indexOf(g.labels[e.v]),
    );
  it("Kahn and DFS orders respect every edge", () => {
    for (const g of [presets.courses, presets.dag]) {
      const a = topoKahn(g),
        b = topoDFS(g);
      expect(a.cyclic).toBe(false);
      expect(b.cyclic).toBe(false);
      expect(valid(g, a.order)).toBe(true);
      expect(valid(g, b.order)).toBe(true);
      expect(a.order).toHaveLength(g.labels.length);
    }
  });
  it("a cycle is detected by both methods", () => {
    const g = withCycle(presets.courses);
    expect(topoKahn(g).cyclic).toBe(true);
    expect(topoDFS(g).cyclic).toBe(true);
  });
});

describe("biconnected components", () => {
  it("textbook-style graph: cut vertices B, D, E, G, I and bridges BD, EG, IJ", () => {
    const g = presets.bcc,
      r = biconnected(g);
    expect(r.aps.map((i) => g.labels[i])).toEqual(["B", "D", "E", "G", "I"]);
    expect(
      r.bridges.map((k) =>
        k
          .split("-")
          .map(Number)
          .map((i) => g.labels[i])
          .join(""),
      ),
    ).toEqual(expect.arrayContaining(["BD", "EG", "IJ"]));
    expect(r.bridges).toHaveLength(3);
    expect(r.bccs).toHaveLength(6);
  });
  it("articulation points and bridges match brute force on random graphs", () => {
    for (const g of randoms) {
      const r = biconnected(g),
        base = countComps(g);
      const brute = g.labels
        .map((_, v) => v)
        .filter((v) => countComps(g, v) > base);
      expect(r.aps).toEqual(brute);
      const bridgeBrute = g.edges
        .filter(
          (e) =>
            countComps({ ...g, edges: g.edges.filter((x) => x !== e) }) > base,
        )
        .map((e) => edgeKey(g, e.u, e.v))
        .sort();
      expect([...r.bridges].sort()).toEqual(bridgeBrute);
      const edgeCount = r.frames[r.frames.length - 1].ecomp
        ? Object.keys(r.frames[r.frames.length - 1].ecomp!).length
        : 0;
      expect(edgeCount).toBe(g.edges.length); // every edge lands in exactly one BCC
    }
  });
});

describe("shortest paths", () => {
  it("Dijkstra on the textbook graph: s0 t8 x9 y5 z7", () =>
    expect(dijkstra(presets.dijkstra, 0).dist).toEqual([0, 8, 9, 5, 7]));
  it("Bellman–Ford with negative edges: s0 t2 x4 y7 z−2", () => {
    const r = bellmanFord(presets.negative, 0);
    expect(r.negCycle).toBe(false);
    expect(r.dist).toEqual([0, 2, 4, 7, -2]);
  });
  it("Bellman–Ford detects a negative cycle", () =>
    expect(bellmanFord(presets.negCycle, 0).negCycle).toBe(true));
  it("DAG shortest paths from s: r∞ s0 t2 x6 y5 z3", () =>
    expect(dagShortest(presets.dag, 1).dist).toEqual([
      Infinity,
      0,
      2,
      6,
      5,
      3,
    ]));
  it("Dijkstra = Bellman–Ford = Floyd on random non-negative graphs", () => {
    for (let i = 0; i < 10; i++) {
      const g = randomGraph(9, 18, 500 + i, true, true),
        fl = floyd(g);
      expect(dijkstra(g, 0).dist).toEqual(fl[0]);
      expect(bellmanFord(g, 0).dist).toEqual(fl[0]);
    }
  });
  it("Dijkstra goes wrong on negative edges where Bellman–Ford does not", () => {
    const dj = dijkstra(presets.negative, 0).dist,
      bf = bellmanFord(presets.negative, 0).dist;
    expect(dj).not.toEqual(bf);
  });
});
