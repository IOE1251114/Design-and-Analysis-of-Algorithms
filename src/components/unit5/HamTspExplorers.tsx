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
import { CircleHelp, Map as MapIcon, Route } from "lucide-react";
import {
  bruteForceTSP,
  eulerCheck,
  hamiltonSearch,
  hamPresets,
  hamToTsp,
  heldKarp,
  makeCities,
  mstApprox,
  nearestNeighbour,
  type Cities,
} from "../../domain/unit5/hamtsp";
import {
  Legend,
  PlayerBar,
  SERIES,
  Tabs,
  axis,
  compact,
  grid,
  tooltipStyle,
  usePlayer,
} from "../unit1/shared";
import { DSPanel, ECOL, GraphView, VCOL } from "../unit3/GraphView";

/* ---------- Hamiltonian cycle ---------- */
export function HamiltonExplorer({
  onSteps,
}: {
  onSteps?: (k: number) => void;
}) {
  const [pid, setPid] = useState("cube");
  const g = hamPresets[pid].g;
  const run = useMemo(() => hamiltonSearch(g), [pid]);
  const p = usePlayer(run.frames.length, pid, onSteps);
  const f = run.frames[p.step];
  const eu = eulerCheck(g);
  const red = useMemo(() => hamToTsp(g), [pid]);
  const summary = useMemo(
    () =>
      Object.entries(hamPresets).map(([k, v]) => ({
        k,
        label: v.label.replace(/ \(.*\)/, ""),
        e: eulerCheck(v.g),
        h: !!hamiltonSearch(v.g).found,
      })),
    [],
  );
  return (
    <>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="kicker">HAMILTONIAN CYCLE</span>
            <h2>Visit every vertex exactly once and come back</h2>
            <p>
              HAM-CYCLE asks whether a graph has a cycle through all its
              vertices. A proposed cycle is easy to check, so it is in NP; it is
              NP-complete, and the best known exact methods are exponential.
              Below, backtracking grows a path and undoes steps at dead ends.
            </p>
          </div>
          <span className="panel-icon">
            <Route size={19} />
          </span>
        </div>
        <Tabs
          value={pid}
          onChange={setPid}
          options={Object.entries(hamPresets).map(([k, v]) => ({
            id: k,
            label: v.label,
          }))}
        />
        <Legend
          items={[
            {
              id: "p",
              label: "Current path (#k = position)",
              color: ECOL.tree.c,
            },
            { id: "a", label: "End of the path", color: VCOL.active.stroke },
            {
              id: "b",
              label: "Just removed (backtrack)",
              color: VCOL.bad.stroke,
            },
            { id: "c", label: "Hamiltonian cycle", color: ECOL.sp.c },
          ]}
        />
        <div className="u3-stage">
          <div className="u3-canvas">
            <GraphView g={g} f={f} />
          </div>
          <DSPanel
            ds={{
              name: "PATH (STACK OF CHOICES)",
              items: f.path.map((i) => g.labels[i]),
            }}
          />
        </div>
        <div className="stage-explanation">
          <strong>{f.title}</strong>
          <p>{f.text}</p>
        </div>
        <PlayerBar p={p} />
        <div className="u2-stats">
          <div>
            <small>PATH EXTENSIONS</small>
            <strong>{f.nodes}</strong>
            <span>total for this graph: {run.nodes}</span>
          </div>
          <div>
            <small>BACKTRACKS</small>
            <strong>{f.backtracks}</strong>
            <span>total: {run.backtracks}</span>
          </div>
          <div>
            <small>ANSWER</small>
            <strong>{run.found ? "YES" : "NO"}</strong>
            <span>worst case O(n!) orders to try</span>
          </div>
        </div>
        <div className="callout">
          <CircleHelp size={16} />
          <p>
            Certificate check: given an ordering of the n vertices, confirm each
            appears once and consecutive vertices (and last→first) are adjacent:
            O(n) edge look-ups with an adjacency matrix. Finding the ordering is
            the hard part.
          </p>
        </div>
      </section>
      <section className="panel u1-gap">
        <div className="panel-heading">
          <div>
            <span className="kicker">A SURPRISING CONTRAST</span>
            <h2>
              Euler circuit (every <i>edge</i> once) is easy
            </h2>
            <p>
              Euler proved a connected graph has a closed walk using every edge
              exactly once if and only if every vertex has even degree. That
              check is O(V + E). No such simple test is known for visiting every{" "}
              <i>vertex</i> once.
            </p>
          </div>
        </div>
        <div className="u5-deg">
          {g.labels.map((l, i) => (
            <span key={l} className={eu.deg[i] % 2 ? "odd" : "even"}>
              <b>{l}</b>deg {eu.deg[i]}
            </span>
          ))}
        </div>
        <div className="u1-table-wrap u1-gap">
          <table className="u1-table">
            <thead>
              <tr>
                <th>Graph</th>
                <th>Euler circuit (polynomial test)</th>
                <th>Hamiltonian cycle (search)</th>
              </tr>
            </thead>
            <tbody>
              {summary.map(({ k, label, e, h }) => (
                <tr key={k} className={k === pid ? "u2-row-on" : ""}>
                  <td>{label}</td>
                  <td>
                    {e.euler
                      ? "Yes"
                      : `No (${e.deg.filter((d) => d % 2).length} odd-degree vertices)`}
                  </td>
                  <td>{h ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel u1-gap">
        <div className="panel-heading">
          <div>
            <span className="kicker">HAM-CYCLE ≤p TSP</span>
            <h2>
              The same question, asked as a travelling salesperson problem
            </h2>
            <p>
              Build a complete graph on the same vertices: cost 1 where G has an
              edge, cost 2 where it does not. G has a Hamiltonian cycle exactly
              when there is a tour of total cost ≤ n = {g.labels.length}.
              Building the matrix takes O(n²), so TSP is at least as hard as
              HAM-CYCLE.
            </p>
          </div>
        </div>
        <div className="u4-grid-wrap">
          <table className="u4-grid">
            <thead>
              <tr>
                <th className="corner">cost</th>
                {g.labels.map((l) => (
                  <th key={l}>{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {red.D.map((row, i) => (
                <tr key={i}>
                  <th>{g.labels[i]}</th>
                  {row.map((d, j) => (
                    <td
                      key={j}
                      className={i === j ? "na" : d === 1 ? "path" : ""}
                    >
                      {i === j ? "" : <b>{d}</b>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="u2-stats u1-gap">
          <div>
            <small>CHEAPEST TOUR</small>
            <strong>{red.cost}</strong>
            <span>
              {red.tour.map((i) => g.labels[i]).join(" → ")} →{" "}
              {g.labels[red.tour[0]]}
            </span>
          </div>
          <div>
            <small>BOUND k</small>
            <strong>{red.k}</strong>
          </div>
          <div>
            <small>TSP ANSWER = HAM ANSWER</small>
            <strong>{red.yes ? "YES" : "NO"}</strong>
            <span>
              {red.yes
                ? "every tour edge is a real edge of G"
                : "every tour must use a cost-2 non-edge"}
            </span>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------- Travelling salesperson ---------- */
export function TSPExplorer({ onSteps }: { onSteps?: (k: number) => void }) {
  const [n, setN] = useState(6);
  const [seed, setSeed] = useState(3);
  const [algo, setAlgo] = useState<"brute" | "nn" | "mst">("brute");
  const c = useMemo(() => makeCities(n, seed), [n, seed]);
  const opt = useMemo(() => heldKarp(c.D), [c]);
  const runs = useMemo(
    () => ({
      brute: bruteForceTSP(c),
      nn: nearestNeighbour(c),
      mst: mstApprox(c),
    }),
    [c],
  );
  const frames = runs[algo].frames;
  const p = usePlayer(frames.length, `${n}-${seed}-${algo}`, onSteps);
  const f = frames[p.step];
  const nn = runs.nn.cost,
    ma = runs.mst.cost,
    mstW = runs.mst.mstW;
  const maxV = Math.max(nn, ma, opt.cost) * 1.05;
  const fact = (k: number) => {
    let r = 1;
    for (let i = 2; i <= k; i++) r *= i;
    return r;
  };
  const chart = Array.from({ length: 18 }, (_, i) => {
    const m = i + 3;
    return { n: m, tours: fact(m - 1) / 2, hk: m * m * 2 ** m, nn: m * m };
  });
  return (
    <>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="kicker">TRAVELLING SALESPERSON</span>
            <h2>The cheapest tour through every city</h2>
            <p>
              Given distances between n cities, find the shortest closed tour
              visiting each city once. The decision version (“is there a tour of
              cost ≤ k?”) is NP-complete. Compare exhaustive search with two
              fast heuristics.
            </p>
          </div>
          <span className="panel-icon">
            <MapIcon size={19} />
          </span>
        </div>
        <div className="u1-controls">
          <label className="u1-select">
            cities
            <select value={n} onChange={(e) => setN(Number(e.target.value))}>
              {[4, 5, 6, 7, 8].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <Tabs
            value={String(seed)}
            onChange={(v) => setSeed(Number(v))}
            options={[
              { id: "3", label: "Map 1" },
              { id: "11", label: "Map 2" },
              { id: "29", label: "Map 3" },
            ]}
          />
          <Tabs
            value={algo}
            onChange={setAlgo}
            options={[
              { id: "brute", label: "Brute force (exact)" },
              { id: "nn", label: "Nearest neighbour" },
              { id: "mst", label: "MST 2-approximation" },
            ]}
          />
        </div>
        <Legend
          items={
            algo === "brute"
              ? [
                  {
                    id: "c",
                    label: "Tour being checked",
                    color: "#8da1b7",
                    dash: true,
                  },
                  { id: "b", label: "Best tour so far", color: SERIES[2] },
                ]
              : algo === "nn"
                ? [{ id: "t", label: "Tour built so far", color: SERIES[0] }]
                : [
                    {
                      id: "m",
                      label: "Minimum spanning tree",
                      color: SERIES[1],
                      dash: true,
                    },
                    {
                      id: "t",
                      label: "Preorder walk / final tour",
                      color: SERIES[0],
                    },
                  ]
          }
        />
        <CityMap
          c={c}
          f={f}
          algo={algo}
          closed={algo === "brute" || p.step === p.last}
        />
        <div className="stage-explanation">
          <strong>{f.title}</strong>
          <p>{f.text}</p>
        </div>
        <PlayerBar p={p} />
        <span className="u1-label">
          TOUR COST BY METHOD (this map, n = {n})
        </span>
        <div className="u1-strat-bars u5-bars">
          <div className={algo === "brute" ? "on" : ""}>
            <span>
              Optimal (brute force, {runs.brute.checked.toLocaleString()} tours)
            </span>
            <i>
              <b
                style={{
                  width: `${(100 * opt.cost) / maxV}%`,
                  background: SERIES[2],
                }}
              />
            </i>
            <em>{opt.cost}</em>
          </div>
          <div className={algo === "nn" ? "on" : ""}>
            <span>Nearest neighbour, Θ(n²)</span>
            <i>
              <b
                style={{
                  width: `${(100 * nn) / maxV}%`,
                  background: SERIES[0],
                }}
              />
            </i>
            <em>
              {nn} ({((100 * (nn - opt.cost)) / opt.cost).toFixed(0)}% over)
            </em>
          </div>
          <div className={algo === "mst" ? "on" : ""}>
            <span>MST 2-approximation, O(n²)</span>
            <i>
              <b
                style={{
                  width: `${(100 * ma) / maxV}%`,
                  background: SERIES[3],
                }}
              />
            </i>
            <em>
              {ma} ({((100 * (ma - opt.cost)) / opt.cost).toFixed(0)}% over)
            </em>
          </div>
          <div>
            <span>MST weight: a lower bound</span>
            <i>
              <b
                style={{
                  width: `${(100 * mstW) / maxV}%`,
                  background: SERIES[1],
                }}
              />
            </i>
            <em>{mstW} ≤ optimum</em>
          </div>
        </div>
        <div className="callout">
          <CircleHelp size={16} />
          <p>
            Brute force fixes the start city and tries every order of the rest,
            counting each tour and its reverse once: (n − 1)!/2 tours. The MST
            method is guaranteed to be within 2× the optimum when distances
            satisfy the triangle inequality; nearest neighbour has no constant
            guarantee. Distances are straight-line lengths rounded to whole
            units.
          </p>
        </div>
      </section>
      <section className="panel u1-gap">
        <div className="panel-heading">
          <div>
            <span className="kicker">WHY EXACT SEARCH STOPS SCALING</span>
            <h2>Work for n cities (log scale)</h2>
            <p>
              Brute force grows as (n − 1)!/2. Held–Karp dynamic programming is
              exact in Θ(n²·2ⁿ): far better, still exponential. Heuristics are
              polynomial but give no exact guarantee.
            </p>
          </div>
        </div>
        <Legend
          items={[
            {
              id: "t",
              label: "Brute force (n − 1)!/2 tours",
              color: SERIES[5],
            },
            { id: "h", label: "Held–Karp n²·2ⁿ", color: SERIES[1] },
            { id: "n", label: "Nearest neighbour n²", color: SERIES[0] },
          ]}
        />
        <div className="u1-chart" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chart}
              margin={{ top: 10, right: 16, bottom: 6, left: 0 }}
            >
              <CartesianGrid {...grid} />
              <XAxis dataKey="n" {...axis} />
              <YAxis
                scale="log"
                domain={[1, 1e16]}
                allowDataOverflow
                ticks={[1, 1e4, 1e8, 1e12, 1e16]}
                {...axis}
                width={48}
                tickFormatter={compact}
              />
              <Tooltip
                {...tooltipStyle}
                labelFormatter={(v) => `n = ${v} cities`}
                formatter={(v: number, k: string) => [
                  v.toExponential(2),
                  k === "tours"
                    ? "Brute-force tours"
                    : k === "hk"
                      ? "Held–Karp steps"
                      : "Nearest-neighbour steps",
                ]}
              />
              <ReferenceLine
                y={1e9}
                stroke="#f4c56a"
                strokeDasharray="4 3"
                label={{
                  value: "≈ 1 second",
                  fill: "#e7d3a6",
                  fontSize: 10,
                  position: "insideTopLeft",
                }}
              />
              <Line
                dataKey="tours"
                stroke={SERIES[5]}
                strokeWidth={2.2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                dataKey="hk"
                stroke={SERIES[1]}
                strokeWidth={2.2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                dataKey="nn"
                stroke={SERIES[0]}
                strokeWidth={2.2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  );
}
function CityMap({
  c,
  f,
  algo,
  closed,
}: {
  c: Cities;
  f: ReturnType<typeof bruteForceTSP>["frames"][number];
  algo: "brute" | "nn" | "mst";
  closed: boolean;
}) {
  const pts = (t: number[], close: boolean) =>
    [...t, ...(close && t.length > 1 ? [t[0]] : [])]
      .map((i) => c.pos[i].join(","))
      .join(" ");
  return (
    <div className="u3-canvas">
      <svg
        viewBox="0 0 660 350"
        className="u1-svg u3-graph"
        style={{ maxWidth: 760 }}
        role="img"
        aria-label={`Map of ${c.labels.length} cities`}
      >
        {algo === "mst" &&
          f.extra?.map(([a, b], i) => (
            <line
              key={i}
              x1={c.pos[a][0]}
              y1={c.pos[a][1]}
              x2={c.pos[b][0]}
              y2={c.pos[b][1]}
              stroke={SERIES[1]}
              strokeWidth={2}
              strokeDasharray="6 4"
            />
          ))}
        {algo === "brute" && f.best.length > 1 && (
          <polyline
            points={pts(f.best, true)}
            fill="none"
            stroke={SERIES[2]}
            strokeWidth={4}
            strokeOpacity={0.85}
            strokeLinejoin="round"
          />
        )}
        {f.tour.length > 1 && (
          <polyline
            points={pts(f.tour, closed)}
            fill="none"
            stroke={algo === "brute" ? "#8da1b7" : SERIES[0]}
            strokeWidth={algo === "brute" ? 1.6 : 3}
            strokeDasharray={algo === "brute" ? "5 4" : undefined}
            strokeLinejoin="round"
          />
        )}
        {c.pos.map(([x, y], i) => {
          const k = f.tour.indexOf(i),
            on = k >= 0;
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={17}
                fill={i === 0 ? "#2a2412" : on ? "#11304a" : "#121c28"}
                stroke={i === 0 ? "#f4c56a" : on ? "#67d9ff" : "#3a5068"}
                strokeWidth={2}
              />
              <text
                x={x}
                y={y + 4}
                fontSize="12"
                textAnchor="middle"
                fill="#f0f8ff"
                fontWeight={600}
              >
                {c.labels[i]}
              </text>
              {algo !== "brute" && on && (
                <text x={x + 20} y={y - 14} fontSize="9.5" fill="#9be4ff">
                  {k + 1}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
