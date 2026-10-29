import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDown, GitBranch, Layers3 } from "lucide-react";
import {
  growth,
  patternCells,
  patterns,
  recurrences,
  recursionTree,
  type PatternId,
} from "../../../domain/daa/unit1/analysis";
import {
  PlayerBar,
  SERIES,
  Tabs,
  axis,
  compact,
  grid,
  growthColor,
  tooltipStyle,
  usePlayer,
} from "./shared";

const patternIds: PatternId[] = [
  "constant",
  "log",
  "linear",
  "nlogn",
  "triangular",
  "quadratic",
];

export function ComplexityExplorer({
  onSteps,
}: {
  onSteps?: (k: number) => void;
}) {
  return (
    <>
      <LoopCounter onSteps={onSteps} />
      <RecursionTree onSteps={onSteps} />
    </>
  );
}

function LoopCounter({ onSteps }: { onSteps?: (k: number) => void }) {
  const [id, setId] = useState<PatternId>("triangular");
  const [n, setN] = useState(8);
  const P = patterns[id],
    col = growthColor[P.growth];
  const cells = useMemo(() => patternCells(id, n), [id, n]);
  const p = usePlayer(cells.length + 1, `${id}-${n}`, onSteps); // frame 0 = nothing run yet
  const done = p.step;
  const cur = done > 0 ? cells[done - 1] : null;
  const rows = Math.max(...cells.map((c) => c.row)) + 1,
    cols = Math.max(...cells.map((c) => c.col)) + 1;
  const series = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => {
        const m = i + 1,
          g = growth[P.growth].f(m);
        return {
          n: m,
          T: P.count(m),
          ratio: m >= 2 && g > 0 ? P.count(m) / g : null,
        };
      }),
    [id],
  );
  const limit = {
    constant: "3",
    log: "1",
    linear: "1",
    nlogn: "1",
    triangular: "½",
    quadratic: "1",
  }[id];

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="kicker">COUNTING WORKBENCH</span>
          <h2>Every square is one execution of work()</h2>
          <p>
            Pick a loop shape and press play. Squares light up in the exact
            order the loops run them, so the area you see <em>is</em> the
            operation count.
          </p>
        </div>
        <span className="panel-icon">
          <Layers3 size={19} />
        </span>
      </div>
      <Tabs
        value={id}
        onChange={setId}
        options={patternIds.map((x) => ({ id: x, label: patterns[x].label }))}
      />
      <div className="input-row">
        <label>
          Input size n <strong>{n}</strong>
        </label>
        <input
          type="range"
          min="1"
          max="20"
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
        />
      </div>

      <div className="u1-loop">
        <div className="u1-code u1-code-small">
          <div className="u1-code-head">
            <span>LOOP</span>
          </div>
          {P.code.map((l, i) => (
            <div key={i} className="u1-code-line">
              <code>
                <b>{i + 1}</b>
                {l}
              </code>
            </div>
          ))}
          <div className="u1-counter">
            <span>work() executed</span>
            <strong style={{ color: "#e7f4ff" }}>{done}</strong>
            <span>of {cells.length}</span>
          </div>
          <div className="u1-counter-cur">
            {cur ? `Now: ${cur.label}` : "Press play or Next to start"}
          </div>
        </div>
        <div className="u1-grid-wrap">
          {id === "log" ? (
            <svg
              viewBox={`0 0 320 ${rows * 26}`}
              className="u1-svg"
              role="img"
              aria-label="Halving loop: each bar is one iteration, bar length is the current value of i"
            >
              {cells.map((c, k) => {
                const i = n / 2 ** c.row,
                  w = Math.max(4, (300 * Math.floor(i)) / n);
                return (
                  <g key={k}>
                    <rect
                      x={0}
                      y={c.row * 26 + 3}
                      width={w}
                      height={18}
                      rx={4}
                      fill={k < done ? col : "#152338"}
                      stroke={k === done - 1 ? "#e7f4ff" : "none"}
                      strokeWidth={1.5}
                    >
                      <title>{c.label}</title>
                    </rect>
                    <text
                      x={w + 6}
                      y={c.row * 26 + 16}
                      fontSize="10"
                      fill="#9fb2c6"
                    >
                      {c.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            <svg
              viewBox={`0 0 ${cols * 22} ${rows * 22}`}
              className="u1-svg"
              style={{ maxWidth: Math.min(420, cols * 30) }}
              role="img"
              aria-label={`${cells.length} iterations laid out as a grid`}
            >
              {cells.map((c, k) => (
                <rect
                  key={k}
                  x={c.col * 22 + 1}
                  y={c.row * 22 + 1}
                  width={20}
                  height={20}
                  rx={4}
                  fill={k < done ? col : "#152338"}
                  stroke={k === done - 1 ? "#e7f4ff" : "#1f3045"}
                  strokeWidth={k === done - 1 ? 1.5 : 1}
                >
                  <title>{c.label}</title>
                </rect>
              ))}
            </svg>
          )}
          <div className="u1-axis-note">
            {id === "quadratic" || id === "triangular"
              ? "rows = i, columns = j"
              : id === "nlogn"
                ? "columns = i, rows = halvings of j"
                : id === "log"
                  ? "each bar = one iteration, length = i"
                  : "one square per iteration"}
          </div>
        </div>
      </div>
      <PlayerBar p={p} label={`${done} / ${cells.length} executed`} />

      <div className="u1-derive">
        <div>
          <small>COUNT</small>
          <strong>{P.sum}</strong>
        </div>
        <ArrowDown size={16} />
        <div>
          <small>CLOSED FORM</small>
          <strong>
            {P.closed} = {P.count(n)} at n = {n}
          </strong>
        </div>
        <ArrowDown size={16} />
        <div>
          <small>DOMINANT TERM</small>
          <strong style={{ color: "#e7f4ff" }}>{growth[P.growth].theta}</strong>
        </div>
      </div>

      <div className="u1-two-charts">
        <div>
          <span className="u1-label">T(n) FOR n = 1…32</span>
          <div className="u1-chart" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={series}
                margin={{ top: 8, right: 12, bottom: 4, left: -6 }}
              >
                <CartesianGrid {...grid} />
                <XAxis dataKey="n" {...axis} />
                <YAxis {...axis} width={44} tickFormatter={compact} />
                <Tooltip
                  {...tooltipStyle}
                  labelFormatter={(v) => `n = ${v}`}
                  formatter={(v: number) => [compact(v), "T(n)"]}
                />
                <Line
                  dataKey="T"
                  stroke={col}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <ReferenceDot
                  x={n}
                  y={P.count(n)}
                  r={5}
                  fill={col}
                  stroke="#0b1420"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <span className="u1-label">
            T(n) ÷ {growth[P.growth].label} → {limit}
          </span>
          <div className="u1-chart" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={series.filter((d) => d.ratio !== null)}
                margin={{ top: 8, right: 12, bottom: 4, left: -6 }}
              >
                <CartesianGrid {...grid} />
                <XAxis dataKey="n" {...axis} />
                <YAxis
                  {...axis}
                  width={44}
                  domain={[0, "auto"]}
                  tickFormatter={(v) => (+v).toFixed(1)}
                />
                <Tooltip
                  {...tooltipStyle}
                  labelFormatter={(v) => `n = ${v}`}
                  formatter={(v: number) => [v.toFixed(3), "ratio"]}
                />
                <Line
                  dataKey="ratio"
                  stroke={col}
                  strokeWidth={2}
                  dot={false}
                  type="stepAfter"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <p className="u1-small">
        The right chart is the meaning of Θ: divide the count by the claimed
        growth function and the ratio stays trapped between two positive
        constants.{" "}
        {id === "triangular"
          ? "Here it settles at ½, so n(n+1)/2 is Θ(n²) even though it does half the work of n²."
          : id === "log" || id === "nlogn"
            ? "The floor ⌊log₂ n⌋ makes it jump, but it never escapes a band, and it approaches 1."
            : ""}
      </p>
    </section>
  );
}

function RecursionTree({ onSteps }: { onSteps?: (k: number) => void }) {
  const [rid, setRid] = useState("merge");
  const [n, setN] = useState(16);
  const r = recurrences.find((x) => x.id === rid)!;
  const t = useMemo(() => recursionTree(r, n), [r, n]);
  const p = usePlayer(t.levels.length, `${rid}-${n}`, onSteps);
  const shown = t.levels.slice(0, p.step + 1);
  const maxLevel = Math.max(...t.levels.map((l) => l.total));
  const W = 660,
    H = t.levels.length * 54 + 14,
    treeW = 420,
    barX = 450,
    barW = 150;
  const rad = (k: number) =>
    Math.min(13, Math.max(3, treeW / t.levels[k].nodes / 2 - 2));
  const bar = SERIES[0];
  const xOf = (k: number, i: number) => (treeW * (i + 0.5)) / t.levels[k].nodes;
  const fn = (s: number) =>
    r.d === 0 ? "1" : r.d === 1 ? String(s) : String(s * s);

  return (
    <section className="panel u1-gap">
      <div className="panel-heading">
        <div>
          <span className="kicker">RECURSION TREE</span>
          <h2>Where does a recursive algorithm spend its time?</h2>
          <p>
            Unroll T(n) = a·T(n/2) + f(n) one level at a time. Each node is a
            subproblem labelled with its own non-recursive work; the bars add
            each level up.
          </p>
        </div>
        <span className="panel-icon">
          <GitBranch size={19} />
        </span>
      </div>
      <Tabs
        value={rid}
        onChange={setRid}
        options={recurrences.map((x) => ({ id: x.id, label: x.example }))}
      />
      <div className="u1-controls">
        <div className="formula-card u1-inline-card">
          <small>RECURRENCE</small>
          <strong>{r.name}, T(1) = 1</strong>
        </div>
        <label className="u1-select">
          n
          <select value={n} onChange={(e) => setN(Number(e.target.value))}>
            {[8, 16, 32].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="u1-tree-scroll">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="u1-svg u1-tree"
          style={{ maxWidth: 820 }}
          role="img"
          aria-label={`Recursion tree with ${t.levels.length} levels; total work ${t.total}`}
        >
          <text
            x={treeW / 2}
            y={10}
            fontSize="9"
            fill="#7c92aa"
            textAnchor="middle"
            letterSpacing="1"
          >
            SUBPROBLEMS (size → work)
          </text>
          <text x={barX} y={10} fontSize="9" fill="#7c92aa" letterSpacing="1">
            WORK PER LEVEL
          </text>
          {shown.map((l) => {
            const y = 22 + l.k * 54,
              drawn = l.nodes <= 32;
            const r0 = rad(l.k);
            return (
              <g key={l.k}>
                {drawn &&
                  l.k > 0 &&
                  t.levels[l.k - 1].nodes <= 32 &&
                  Array.from({ length: l.nodes }, (_, i) => (
                    <line
                      key={i}
                      x1={xOf(l.k - 1, Math.floor(i / r.a))}
                      y1={y - 54 + 14 + rad(l.k - 1)}
                      x2={xOf(l.k, i)}
                      y2={y + 14 - r0}
                      stroke="#2a3d52"
                      strokeWidth={1}
                    />
                  ))}
                {drawn ? (
                  Array.from({ length: l.nodes }, (_, i) => (
                    <g key={i}>
                      <circle
                        cx={xOf(l.k, i)}
                        cy={y + 14}
                        r={r0}
                        fill="#13273a"
                        stroke={bar}
                        strokeWidth={1}
                      >
                        <title>{`size ${l.size}, work ${fn(l.size)}`}</title>
                      </circle>
                      {r0 >= 10 && (
                        <text
                          x={xOf(l.k, i)}
                          y={y + 17.5}
                          fontSize="9"
                          textAnchor="middle"
                          fill="#dff1ff"
                        >
                          {l.size}
                        </text>
                      )}
                    </g>
                  ))
                ) : (
                  <g>
                    <rect
                      x={4}
                      y={y + 6}
                      width={treeW - 8}
                      height={16}
                      rx={4}
                      fill="#13273a"
                      stroke={bar}
                      strokeWidth={1}
                    />
                    <text
                      x={treeW / 2}
                      y={y + 18}
                      fontSize="10"
                      textAnchor="middle"
                      fill="#dff1ff"
                    >
                      {l.nodes} subproblems of size {l.size}
                    </text>
                  </g>
                )}
                <text x={barX} y={y + 36} fontSize="9" fill="#8fa3b9">
                  level {l.k}: {l.nodes} × f({l.size}) = {l.nodes} ×{" "}
                  {fn(l.size)}
                </text>
                <rect
                  x={barX}
                  y={y + 6}
                  width={Math.max(3, (barW * l.total) / maxLevel)}
                  height={16}
                  rx={4}
                  fill={bar}
                >
                  <title>{`level ${l.k}: ${l.total}`}</title>
                </rect>
                <text
                  x={barX + Math.max(3, (barW * l.total) / maxLevel) + 6}
                  y={y + 18}
                  fontSize="11"
                  fill="#e7f4ff"
                >
                  {l.total}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <PlayerBar
        p={p}
        nextLabel="Next level"
        label={`Level ${p.step} of ${t.levels.length - 1}${p.step === p.last ? " (leaves)" : ""}`}
      />
      <div className="graph-state-grid">
        <div>
          <small>TOTAL SO FAR</small>
          <strong>
            {shown.reduce((s, l) => s + l.total, 0)}
            {p.step === p.last ? ` = T(${n})` : ""}
          </strong>
        </div>
        <div>
          <small>COMPARE n^(log₂ a) WITH f(n)</small>
          <strong>
            {t.critLabel} vs {t.fLabel}
          </strong>
        </div>
        <div>
          <small>MASTER THEOREM · CASE {t.caseNo}</small>
          <strong>T(n) = {t.theta}</strong>
        </div>
      </div>
      <div className="stage-explanation">
        <strong>{t.shape}</strong>
        <p>
          {t.caseNo === 1
            ? `The ${t.levels[t.levels.length - 1].nodes} leaves alone cost Θ(${t.critLabel}), which outweighs everything above them.`
            : t.caseNo === 2
              ? `${t.levels.length} levels × ${t.levels[0].total} per level ≈ ${t.fLabel === "1" ? "log n" : `${t.fLabel} log n`}.`
              : `The root's ${t.levels[0].total} is a constant fraction of the whole total ${t.total}.`}{" "}
          Bars that grow, stay level, or shrink are the three Master Theorem
          cases.
        </p>
      </div>
    </section>
  );
}
