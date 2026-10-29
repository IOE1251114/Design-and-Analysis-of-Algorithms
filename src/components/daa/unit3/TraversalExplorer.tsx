import { useMemo, useState } from "react";
import { Route } from "lucide-react";
import { bfs, dfs } from "../../../domain/daa/unit3/algos";
import { presets } from "../../../domain/daa/unit3/graphs";
import { Legend, PlayerBar, SERIES, Tabs, usePlayer } from "../unit1/shared";
import { DSPanel, ECOL, GraphView, VCOL } from "./GraphView";

export function TraversalExplorer({
  onSteps,
}: {
  onSteps?: (k: number) => void;
}) {
  const [algo, setAlgo] = useState<"bfs" | "dfs">("bfs");
  const [dir, setDir] = useState<"u" | "d">("u");
  const [s, setS] = useState(0);
  const g = dir === "u" ? presets.campus : presets.campusDirected;
  const run = useMemo(
    () => (algo === "bfs" ? bfs(g, s) : dfs(g, s)),
    [algo, dir, s],
  );
  const p = usePlayer(run.frames.length, `${algo}-${dir}-${s}`, onSteps);
  const f = run.frames[p.step];
  const edgeLegend =
    algo === "bfs"
      ? [
          {
            id: "t",
            label: "Tree edge (discovered a vertex)",
            color: ECOL.tree.c,
          },
          {
            id: "c",
            label: "Non-tree edge (already seen)",
            color: ECOL.checked.c,
          },
        ]
      : [
          { id: "t", label: "Tree", color: ECOL.tree.c },
          { id: "b", label: "Back (cycle)", color: ECOL.back.c, dash: true },
          ...(g.directed
            ? [
                {
                  id: "f",
                  label: "Forward",
                  color: ECOL.forward.c,
                  dash: true,
                },
                { id: "x", label: "Cross", color: ECOL.cross.c, dash: true },
              ]
            : []),
        ];
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="kicker">BFS AND DFS</span>
          <h2>Queue versus stack: two ways to explore</h2>
          <p>
            Both visit every reachable vertex in O(V + E). BFS uses a queue and
            spreads out in layers, giving shortest edge-count distances. DFS
            uses a stack (recursion) and dives deep, giving discovery/finish
            times and edge classes.
          </p>
        </div>
        <span className="panel-icon">
          <Route size={19} />
        </span>
      </div>
      <div className="u1-controls">
        <Tabs
          value={algo}
          onChange={setAlgo}
          options={[
            { id: "bfs", label: "Breadth-first search" },
            { id: "dfs", label: "Depth-first search" },
          ]}
        />
        <Tabs
          value={dir}
          onChange={setDir}
          options={[
            { id: "u", label: "Undirected graph" },
            { id: "d", label: "Directed graph" },
          ]}
        />
        <label className="u1-select">
          start
          <select value={s} onChange={(e) => setS(Number(e.target.value))}>
            {g.labels.map((l, i) => (
              <option key={l} value={i}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Legend
        items={[
          {
            id: "fr",
            label: algo === "bfs" ? "In queue" : "On stack (grey)",
            color: VCOL.frontier.stroke,
          },
          { id: "ac", label: "Current", color: VCOL.active.stroke },
          {
            id: "dn",
            label: algo === "bfs" ? "Done" : "Finished (black)",
            color: VCOL.done.stroke,
          },
          ...edgeLegend,
        ]}
      />
      <div className="u3-stage">
        <div className="u3-canvas">
          <GraphView g={g} f={f} />
        </div>
        <DSPanel
          ds={f.ds}
          out={f.out}
          outLabel={algo === "bfs" ? "Visit order" : "Discovery order"}
        />
      </div>
      <div className="stage-explanation">
        <strong>{f.title}</strong>
        <p>{f.text}</p>
      </div>
      <PlayerBar p={p} />
      {algo === "bfs" ? (
        <BfsLayers
          dist={(run as ReturnType<typeof bfs>).dist}
          labels={g.labels}
          visible={f.vstate.map((v) => v !== "unseen")}
        />
      ) : (
        <DfsTimeline
          d={(run as ReturnType<typeof dfs>).d}
          fin={(run as ReturnType<typeof dfs>).f}
          labels={g.labels}
          under={f.under}
        />
      )}
    </section>
  );
}

function BfsLayers({
  dist,
  labels,
  visible,
}: {
  dist: number[];
  labels: string[];
  visible: boolean[];
}) {
  const max = Math.max(...dist.filter((d) => d < Infinity));
  return (
    <div className="u3-layers">
      <span className="u1-label">
        BFS LAYERS: VERTICES GROUPED BY DISTANCE FROM THE START
      </span>
      <div>
        {Array.from({ length: max + 1 }, (_, d) => (
          <div key={d}>
            <small>distance {d}</small>
            {labels.map((l, i) =>
              dist[i] === d ? (
                <span key={l} className={visible[i] ? "on" : ""}>
                  {visible[i] ? l : "?"}
                </span>
              ) : null,
            )}
          </div>
        ))}
        {dist.some((d) => d === Infinity) && (
          <div>
            <small>unreachable</small>
            {labels.map((l, i) =>
              dist[i] === Infinity ? <span key={l}>{l}</span> : null,
            )}
          </div>
        )}
      </div>
      <p className="u1-small">
        Every edge joins vertices in the same layer or in adjacent layers, never
        two layers apart. That is exactly why BFS distances are shortest edge
        counts.
      </p>
    </div>
  );
}

function DfsTimeline({
  d,
  fin,
  labels,
  under,
}: {
  d: number[];
  fin: number[];
  labels: string[];
  under: string[];
}) {
  const T = Math.max(...fin),
    W = 600,
    row = 22,
    H = labels.length * row + 26;
  const x = (t: number) => 40 + ((t - 0.5) / T) * (W - 50);
  return (
    <div className="u3-layers">
      <span className="u1-label">
        PARENTHESIS STRUCTURE: EACH VERTEX'S INTERVAL [DISCOVER, FINISH]
      </span>
      <div className="u1-tree-scroll">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="u1-svg"
          style={{ maxWidth: 760 }}
          role="img"
          aria-label="DFS discovery and finish intervals"
        >
          {Array.from({ length: T }, (_, t) => (
            <text
              key={t}
              x={x(t + 1)}
              y={12}
              fontSize="8.5"
              textAnchor="middle"
              fill="#6d839c"
            >
              {t + 1}
            </text>
          ))}
          {labels.map((l, i) => {
            const seen = under[i] !== "",
              done = seen && !under[i].includes("–"),
              y = 20 + i * row;
            return (
              <g key={l}>
                <text x={6} y={y + 13} fontSize="10" fill="#c9dcef">
                  {l}
                </text>
                {seen && (
                  <rect
                    x={x(d[i]) - 6}
                    y={y + 3}
                    width={Math.max(
                      10,
                      (done ? x(fin[i]) : x(d[i]) + 8) - x(d[i]) + 12,
                    )}
                    height={14}
                    rx={7}
                    fill={done ? "#10302a" : "#2a2412"}
                    stroke={done ? SERIES[2] : "#f4c56a"}
                  />
                )}
                {seen && (
                  <text
                    x={x(d[i])}
                    y={y + 13.5}
                    fontSize="8.5"
                    textAnchor="middle"
                    fill="#e7f4ff"
                  >
                    {d[i]}
                  </text>
                )}
                {done && (
                  <text
                    x={x(fin[i])}
                    y={y + 13.5}
                    fontSize="8.5"
                    textAnchor="middle"
                    fill="#e7f4ff"
                  >
                    {fin[i]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="u1-small">
        Any two intervals are either disjoint or one sits completely inside the
        other (the parenthesis theorem). v lies inside u's interval exactly when
        v is a descendant of u in the DFS forest.
      </p>
    </div>
  );
}
