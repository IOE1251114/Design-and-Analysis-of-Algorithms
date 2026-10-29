import { useMemo, useState } from "react";
import { CircleHelp, ListOrdered } from "lucide-react";
import { topoDFS, topoKahn } from "../../../domain/daa/unit3/algos";
import { presets, withCycle } from "../../../domain/daa/unit3/graphs";
import { Legend, PlayerBar, SERIES, Tabs, usePlayer } from "../unit1/shared";
import { DSPanel, ECOL, GraphView, VCOL } from "./GraphView";

export function TopoExplorer({ onSteps }: { onSteps?: (k: number) => void }) {
  const [method, setMethod] = useState<"kahn" | "dfs">("kahn");
  const [cycle, setCycle] = useState(false);
  const g = cycle ? withCycle(presets.courses) : presets.courses;
  const run = useMemo(
    () => (method === "kahn" ? topoKahn(g) : topoDFS(g)),
    [method, cycle],
  );
  const p = usePlayer(run.frames.length, `${method}-${cycle}`, onSteps);
  const f = run.frames[p.step];
  const done = p.step === p.last && !run.cyclic;
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="kicker">TOPOLOGICAL SORTING OF DAGS</span>
          <h2>In what order can the courses be taken?</h2>
          <p>
            An edge X → Y means “X is a prerequisite of Y”. A topological order
            lists every vertex so that all edges point forward. It exists
            exactly when the graph has no directed cycle (a DAG).
          </p>
        </div>
        <span className="panel-icon">
          <ListOrdered size={19} />
        </span>
      </div>
      <div className="u1-controls">
        <Tabs
          value={method}
          onChange={setMethod}
          options={[
            { id: "kahn", label: "Kahn's algorithm (in-degrees)" },
            { id: "dfs", label: "DFS finishing order" },
          ]}
        />
        <Tabs
          value={cycle ? "c" : "a"}
          onChange={(v) => setCycle(v === "c")}
          options={[
            { id: "a", label: "Valid DAG" },
            { id: "c", label: "Add edge Algo → DS (makes a cycle)" },
          ]}
        />
      </div>
      <Legend
        items={
          method === "kahn"
            ? [
                {
                  id: "q",
                  label: "In-degree 0, queued",
                  color: VCOL.frontier.stroke,
                },
                { id: "d", label: "Output", color: VCOL.done.stroke },
                {
                  id: "r",
                  label: "Removed edge",
                  color: "#5d738b",
                  dash: true,
                },
                { id: "b", label: "Stuck on a cycle", color: VCOL.bad.stroke },
              ]
            : [
                {
                  id: "a",
                  label: "On the DFS stack",
                  color: VCOL.active.stroke,
                },
                { id: "d", label: "Finished", color: VCOL.done.stroke },
                { id: "t", label: "Tree edge", color: ECOL.tree.c },
                {
                  id: "b",
                  label: "Back edge = cycle",
                  color: ECOL.back.c,
                  dash: true,
                },
              ]
        }
      />
      <div className="u3-stage">
        <div className="u3-canvas">
          <GraphView g={g} f={f} />
        </div>
        <DSPanel
          ds={f.ds}
          out={method === "kahn" ? f.out : undefined}
          outLabel="Topological order"
        />
      </div>
      <div
        className={`stage-explanation ${run.cyclic && p.step === p.last ? "u2-warn" : ""}`}
      >
        <strong>{f.title}</strong>
        <p>{f.text}</p>
      </div>
      <PlayerBar p={p} />
      {done && <OrderLine order={run.order} />}
      <div className="callout">
        <CircleHelp size={16} />
        <p>
          The order is usually not unique: Prog and Disc can come in either
          order, and so can DB and OS. Uses include build systems (compile
          dependencies first), course planning, spreadsheet recalculation and
          task scheduling. Both methods run in Θ(V + E).
        </p>
      </div>
    </section>
  );
}

/** The final order drawn on a line: every prerequisite arc points to the right. */
function OrderLine({ order }: { order: string[] }) {
  const g = presets.courses,
    W = 660,
    x = (i: number) => 45 + (i * (W - 90)) / (order.length - 1);
  const at = (label: string) => order.indexOf(label);
  return (
    <div className="u3-layers">
      <span className="u1-label">
        THE SAME GRAPH LAID OUT IN TOPOLOGICAL ORDER: EVERY EDGE POINTS RIGHT
      </span>
      <div className="u1-tree-scroll">
        <svg
          viewBox={`0 0 ${W} 150`}
          className="u1-svg"
          style={{ minWidth: 560, maxWidth: 780 }}
          role="img"
          aria-label={`Topological order ${order.join(", ")}`}
        >
          {g.edges.map((e, i) => {
            const a = x(at(g.labels[e.u])),
              b = x(at(g.labels[e.v])),
              h = Math.min(70, 18 + (b - a) * 0.22);
            return (
              <g key={i}>
                <path
                  d={`M${a},105 Q${(a + b) / 2},${105 - h * 1.6} ${b - 6},96`}
                  fill="none"
                  stroke={SERIES[0]}
                  strokeWidth={1.6}
                />
                <polygon
                  points={`${b - 3},93 ${b - 12},94 ${b - 7},101`}
                  fill={SERIES[0]}
                />
              </g>
            );
          })}
          {order.map((l, i) => (
            <g key={l}>
              <rect
                x={x(i) - 28}
                y={104}
                width={56}
                height={26}
                rx={7}
                fill="#10302a"
                stroke={SERIES[2]}
              />
              <text
                x={x(i)}
                y={121}
                fontSize="10.5"
                textAnchor="middle"
                fill="#f0f8ff"
              >
                {l}
              </text>
              <text
                x={x(i)}
                y={145}
                fontSize="8.5"
                textAnchor="middle"
                fill="#6d839c"
              >
                {i + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
