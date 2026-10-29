import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CircleHelp, Network } from "lucide-react";
import { adjacency, hexGraph } from "../../../domain/daa/unit3/graphs";
import {
  Legend,
  SERIES,
  Tabs,
  axis,
  compact,
  grid,
  tooltipStyle,
} from "../unit1/shared";
import { GraphView } from "./GraphView";

const start: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 2],
  [1, 3],
  [2, 4],
  [3, 4],
  [3, 5],
  [4, 5],
];

export function RepresentationExplorer() {
  const [directed, setDirected] = useState(false);
  const [pairs, setPairs] = useState<[number, number][]>(start);
  const [sel, setSel] = useState<number | null>(1);
  const g = useMemo(() => hexGraph(pairs, directed), [pairs, directed]);
  const adj = adjacency(g),
    V = 6,
    E = pairs.length;
  const has = (u: number, v: number) =>
    pairs.some(
      ([a, b]) => (a === u && b === v) || (!directed && a === v && b === u),
    );
  const toggle = (u: number, v: number) => {
    if (u === v) return;
    setPairs((ps) =>
      has(u, v)
        ? ps.filter(
            ([a, b]) =>
              !((a === u && b === v) || (!directed && a === v && b === u)),
          )
        : [...ps, [u, v]],
    );
  };
  const maxE = directed ? V * (V - 1) : (V * (V - 1)) / 2;
  const listEntries = directed ? E : 2 * E;
  const chart = useMemo(() => {
    const n = 100,
      max = (n * (n - 1)) / 2;
    return Array.from({ length: 21 }, (_, i) => {
      const e = Math.round((max * i) / 20);
      return { e, list: n + 2 * e, matrix: n * n, edge: 2 * e };
    });
  }, []);
  const focus = {
    vstate: g.labels.map((_, i) =>
      i === sel ? ("active" as const) : ("unseen" as const),
    ),
    estate: Object.fromEntries(
      g.edges
        .filter((e) => e.u === sel || (!directed && e.v === sel))
        .map((e) => [
          directed
            ? `${e.u}>${e.v}`
            : `${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}`,
          "tree" as const,
        ]),
    ),
  };
  return (
    <>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="kicker">GRAPH REPRESENTATIONS</span>
            <h2>One graph, three ways to store it</h2>
            <p>
              Click a cell of the matrix to add or remove that edge, and every
              view updates together. Click a vertex to highlight its row, its
              list and its edges.
            </p>
          </div>
          <span className="panel-icon">
            <Network size={19} />
          </span>
        </div>
        <div className="u1-controls">
          <Tabs
            value={directed ? "d" : "u"}
            onChange={(v) => {
              setDirected(v === "d");
              setPairs(start);
            }}
            options={[
              { id: "u", label: "Undirected" },
              { id: "d", label: "Directed" },
            ]}
          />
          <button className="btn btn-secondary" onClick={() => setPairs(start)}>
            Reset edges
          </button>
          <button className="btn btn-secondary" onClick={() => setPairs([])}>
            Remove all
          </button>
        </div>
        <div className="u3-rep">
          <div className="u3-canvas">
            <GraphView
              g={g}
              f={focus}
              onNode={(i) => setSel(i === sel ? null : i)}
              selected={sel}
              maxWidth={520}
            />
          </div>
          <div>
            <span className="u1-label">
              ADJACENCY MATRIX A[u][v] (click to toggle)
            </span>
            <table className="u3-matrix">
              <thead>
                <tr>
                  <th />
                  {g.labels.map((l) => (
                    <th key={l} className={sel === +l ? "on" : ""}>
                      {l}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {g.labels.map((l, u) => (
                  <tr key={l}>
                    <th className={sel === u ? "on" : ""}>{l}</th>
                    {g.labels.map((_, v) => (
                      <td
                        key={v}
                        className={`${has(u, v) ? "one" : ""} ${sel === u || (!directed && sel === v) ? "hl" : ""} ${u === v ? "diag" : ""}`}
                      >
                        <button
                          disabled={u === v}
                          onClick={() => toggle(u, v)}
                          aria-label={`Toggle edge ${u} to ${v}`}
                        >
                          {has(u, v) ? 1 : 0}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="u1-small">
              {directed
                ? "Row u, column v is 1 when there is an edge u → v. The matrix is generally not symmetric."
                : "Undirected: A[u][v] = A[v][u], so the matrix is symmetric and the diagonal is 0."}
            </p>
          </div>
        </div>
        <div className="u3-rep2">
          <div>
            <span className="u1-label">ADJACENCY LIST</span>
            <div className="u3-adjlist">
              {adj.map((a, u) => (
                <div key={u} className={sel === u ? "on" : ""}>
                  <b>{u}</b>
                  <span>→</span>
                  {a.length ? a.map((x) => <i key={x.v}>{x.v}</i>) : <em>∅</em>}
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="u1-label">
              EDGE LIST ({E} edge{E === 1 ? "" : "s"})
            </span>
            <div className="u3-edgelist">
              {pairs.length ? (
                pairs.map(([a, b], i) => (
                  <span
                    key={i}
                    className={
                      sel === a || (!directed && sel === b) ? "on" : ""
                    }
                  >
                    ({a}, {b})
                  </span>
                ))
              ) : (
                <em>no edges</em>
              )}
            </div>
          </div>
        </div>
        <div className="u2-stats">
          <div>
            <small>V · E · DENSITY</small>
            <strong>
              {V} · {E} · {(E / maxE).toFixed(2)}
            </strong>
            <span>E / max possible ({maxE})</span>
          </div>
          <div>
            <small>MATRIX CELLS</small>
            <strong>V² = {V * V}</strong>
            <span>always, whatever E is</span>
          </div>
          <div>
            <small>LIST ENTRIES</small>
            <strong>
              V + {directed ? "E" : "2E"} = {V + listEntries}
            </strong>
            <span>
              {directed ? "one entry per edge" : "each edge appears twice"}
            </span>
          </div>
          {sel !== null && (
            <div>
              <small>DEGREE OF {sel}</small>
              <strong>
                {directed
                  ? `out ${adj[sel].length} · in ${pairs.filter(([, b]) => b === sel).length}`
                  : adj[sel].length}
              </strong>
              <span>
                {directed ? "row sum · column sum" : "row sum = list length"}
              </span>
            </div>
          )}
        </div>
        <div className="u1-table-wrap u1-gap">
          <table className="u1-table">
            <thead>
              <tr>
                <th>Operation</th>
                <th>Adjacency matrix</th>
                <th>Adjacency list</th>
                <th>Edge list</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Space</td>
                <td>Θ(V²)</td>
                <td>Θ(V + E)</td>
                <td>Θ(E)</td>
              </tr>
              <tr>
                <td>Is (u, v) an edge?</td>
                <td>Θ(1)</td>
                <td>O(deg u)</td>
                <td>O(E)</td>
              </tr>
              <tr>
                <td>List all neighbours of u</td>
                <td>Θ(V)</td>
                <td>Θ(deg u)</td>
                <td>O(E)</td>
              </tr>
              <tr>
                <td>Visit every edge (BFS/DFS)</td>
                <td>Θ(V²)</td>
                <td>Θ(V + E)</td>
                <td>Θ(E)</td>
              </tr>
              <tr>
                <td>Best for</td>
                <td>Dense graphs, quick edge tests</td>
                <td>Sparse graphs, traversals</td>
                <td>Kruskal (sort the edges)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel u1-gap">
        <div className="panel-heading">
          <div>
            <span className="kicker">SPACE VS DENSITY</span>
            <h2>Memory for a 100-vertex undirected graph</h2>
            <p>
              Storage entries as the number of edges grows from 0 to the
              complete graph (4,950 edges).
            </p>
          </div>
        </div>
        <Legend
          items={[
            { id: "m", label: "Adjacency matrix: V²", color: SERIES[5] },
            { id: "l", label: "Adjacency list: V + 2E", color: SERIES[0] },
            {
              id: "e",
              label: "Edge list: 2 per edge",
              color: SERIES[2],
              dash: true,
            },
          ]}
        />
        <div className="u1-chart" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chart}
              margin={{ top: 10, right: 16, bottom: 6, left: 0 }}
            >
              <CartesianGrid {...grid} />
              <XAxis
                dataKey="e"
                type="number"
                domain={[0, 4950]}
                ticks={[0, 1000, 2000, 3000, 4000, 4950]}
                {...axis}
                tickFormatter={compact}
              />
              <YAxis {...axis} width={48} tickFormatter={compact} />
              <Tooltip
                {...tooltipStyle}
                labelFormatter={(v) => `E = ${v}`}
                formatter={(v: number, k: string) => [
                  compact(v),
                  k === "matrix"
                    ? "Matrix"
                    : k === "list"
                      ? "Adjacency list"
                      : "Edge list",
                ]}
              />
              <ReferenceLine
                x={99}
                stroke="#f4c56a"
                strokeDasharray="4 3"
                label={{
                  value: "a tree: E = V − 1",
                  fill: "#e7d3a6",
                  fontSize: 10,
                  position: "insideTopLeft",
                }}
              />
              <Line
                dataKey="matrix"
                stroke={SERIES[5]}
                strokeWidth={2.2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                dataKey="list"
                stroke={SERIES[0]}
                strokeWidth={2.2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                dataKey="edge"
                stroke={SERIES[2]}
                strokeWidth={1.6}
                strokeDasharray="6 4"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="callout">
          <CircleHelp size={16} />
          <p>
            Most real graphs (road maps, social networks, the web) are sparse: E
            is close to V, far below V². Lists then need hundreds of entries
            where a matrix needs ten thousand. In a dense graph the two are
            comparable, and the matrix's constant-time edge test wins (a matrix
            entry can also be a single bit).
          </p>
        </div>
      </section>
    </>
  );
}
