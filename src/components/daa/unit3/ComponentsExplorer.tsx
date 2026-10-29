import { useMemo, useState } from "react";
import { CircleHelp, Boxes } from "lucide-react";
import { components, kosaraju } from "../../../domain/daa/unit3/algos";
import { presets } from "../../../domain/daa/unit3/graphs";
import { PlayerBar, Tabs, usePlayer } from "../unit1/shared";
import { DSPanel, GraphView, groupColor } from "./GraphView";

export function ComponentsExplorer({
  onSteps,
}: {
  onSteps?: (k: number) => void;
}) {
  const [mode, setMode] = useState<"cc" | "scc">("cc");
  const g = mode === "cc" ? presets.islands : presets.scc;
  const run = useMemo(
    () => (mode === "cc" ? components(g) : kosaraju(g)),
    [mode],
  );
  const p = usePlayer(run.frames.length, mode, onSteps);
  const f = run.frames[p.step];
  const groups = Array.from({ length: run.count }, (_, c) =>
    g.labels.filter((_, i) => f.comp?.[i] === c),
  );
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="kicker">CONNECTED COMPONENTS</span>
          <h2>Which vertices can reach each other?</h2>
          <p>
            {mode === "cc"
              ? "In an undirected graph, start a BFS (or DFS) from every vertex that has no label yet; everything it reaches gets the same label. The number of searches started is the number of components."
              : "In a directed graph, reachability is one-way. A strongly connected component (SCC) is a maximal set where every vertex reaches every other. Kosaraju’s algorithm finds them with two DFS passes."}
          </p>
        </div>
        <span className="panel-icon">
          <Boxes size={19} />
        </span>
      </div>
      <Tabs
        value={mode}
        onChange={setMode}
        options={[
          { id: "cc", label: "Connected components (undirected)" },
          { id: "scc", label: "Strongly connected components (directed)" },
        ]}
      />
      <div className="u3-stage">
        <div className="u3-canvas">
          <GraphView g={g} f={f} />
        </div>
        <DSPanel ds={f.ds} out={f.out} outLabel="Finish order (pass 1)" />
      </div>
      <div className="stage-explanation">
        <strong>{f.title}</strong>
        <p>{f.text}</p>
      </div>
      <PlayerBar p={p} />
      <span className="u1-label">COMPONENTS SO FAR</span>
      <div className="u3-groups">
        {groups.map((m, c) =>
          m.length ? (
            <div key={c} style={{ borderColor: groupColor(c) }}>
              <b style={{ background: groupColor(c) }}>
                {mode === "cc" ? `#${c + 1}` : `SCC ${c + 1}`}
              </b>
              {m.map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
          ) : null,
        )}
        {!groups.some((m) => m.length) && (
          <em className="u1-small">None yet.</em>
        )}
      </div>
      {mode === "scc" && p.step === p.last && <Condensation comp={run.comp} />}
      <div className="callout">
        <CircleHelp size={16} />
        <p>
          {mode === "cc"
            ? "Applications: counting islands in a map, checking whether a network is connected, and grouping pixels in an image. Each vertex and edge is handled once: Θ(V + E)."
            : 'Why it works: the vertex that finishes last in pass 1 lies in a "source" SCC of the component graph. In the reversed graph, a DFS from it can only reach its own SCC. Repeating in decreasing finish order peels off one SCC at a time.'}
        </p>
      </div>
    </section>
  );
}

/** The component graph: one node per SCC, an edge when any edge joins two SCCs. It is always a DAG. */
function Condensation({ comp }: { comp: number[] }) {
  const g = presets.scc,
    k = Math.max(...comp) + 1;
  const members = Array.from({ length: k }, (_, c) =>
    g.labels.filter((_, i) => comp[i] === c).join(","),
  );
  const edges = new Set<string>();
  g.edges.forEach((e) => {
    if (comp[e.u] !== comp[e.v]) edges.add(`${comp[e.u]}>${comp[e.v]}`);
  });
  const x = (c: number) => 70 + (c * 520) / Math.max(1, k - 1);
  return (
    <div className="u3-layers">
      <span className="u1-label">
        COMPONENT GRAPH (CONDENSATION): ALWAYS A DAG
      </span>
      <svg
        viewBox="0 -10 660 140"
        className="u1-svg"
        style={{ maxWidth: 700 }}
        role="img"
        aria-label="Component graph of the SCCs"
      >
        {[...edges].map((e) => {
          const [a, b] = e.split(">").map(Number);
          if (Math.abs(a - b) === 1) {
            const x1 = x(a) + 44,
              x2 = x(b) - 46;
            return (
              <g key={e}>
                <line
                  x1={x1}
                  y1={65}
                  x2={x2}
                  y2={65}
                  stroke="#4d6a84"
                  strokeWidth={1.8}
                />
                <polygon
                  points={`${x2 + 4},65 ${x2 - 6},60 ${x2 - 6},70`}
                  fill="#4d6a84"
                />
              </g>
            );
          }
          const xa = x(a) + 18,
            xb = x(b) - 18,
            lift = 10 + 6 * Math.abs(a - b);
          return (
            <g key={e}>
              <path
                d={`M${xa},45 Q${(xa + xb) / 2},${-lift} ${xb},41`}
                fill="none"
                stroke="#4d6a84"
                strokeWidth={1.8}
              />
              <polygon
                points={`${xb},45 ${xb - 6},36 ${xb + 4},37`}
                fill="#4d6a84"
              />
            </g>
          );
        })}
        {members.map((m, c) => (
          <g key={c}>
            <rect
              x={x(c) - 44}
              y={45}
              width={88}
              height={40}
              rx={10}
              fill={`${groupColor(c)}22`}
              stroke={groupColor(c)}
              strokeWidth={2}
            />
            <text
              x={x(c)}
              y={62}
              fontSize="10"
              textAnchor="middle"
              fill="#9fb2c6"
            >
              SCC {c + 1}
            </text>
            <text
              x={x(c)}
              y={77}
              fontSize="11"
              textAnchor="middle"
              fill="#f0f8ff"
            >{`{${m}}`}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
