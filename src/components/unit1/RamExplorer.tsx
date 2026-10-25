import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CircleHelp, Cpu } from "lucide-react";
import {
  RAM_MAX_N,
  growth,
  ramPrograms,
  ramTrace,
  type RamProgramId,
} from "../../domain/unit1";
import {
  Legend,
  PlayerBar,
  Tabs,
  axis,
  grid,
  growthColor,
  tooltipStyle,
  usePlayer,
} from "./shared";

const ids: RamProgramId[] = ["constant", "linear", "quadratic"];

export function RamExplorer({ onSteps }: { onSteps?: (k: number) => void }) {
  const [prog, setProg] = useState<RamProgramId>("linear");
  const [n, setN] = useState(5);
  const [reveal, setReveal] = useState(false);
  const P = ramPrograms[prog];
  const trace = useMemo(() => ramTrace(prog, n), [prog, n]);
  const p = usePlayer(trace.length, `${prog}-${n}`, onSteps);
  const cur = trace[p.step];
  const execCount = useMemo(() => {
    const c = P.lines.map(() => 0);
    for (let k = 0; k <= p.step; k++) c[trace[k].line]++;
    return c;
  }, [trace, p.step, P]);
  const finalTotal = trace[trace.length - 1].total;
  const chartData = useMemo(
    () =>
      Array.from({ length: RAM_MAX_N }, (_, i) => ({
        n: i + 1,
        constant: ramPrograms.constant.count(i + 1),
        linear: ramPrograms.linear.count(i + 1),
        quadratic: ramPrograms.quadratic.count(i + 1),
      })),
    [],
  );
  const colour = (id: RamProgramId) => growthColor[ramPrograms[id].growth];
  const doubling = (id: RamProgramId) =>
    ramPrograms[id].count(2 * n) / ramPrograms[id].count(n);

  return (
    <section className="workspace-grid">
      <div className="panel">
        <div className="panel-heading">
          <div>
            <span className="kicker">RAM MODEL TRACER</span>
            <h2>Watch the machine pay for each step</h2>
            <p>
              Each line is charged the number of primitive operations it
              performs. Step through the program and see the cost add up line by
              line.
            </p>
          </div>
          <span className="panel-icon">
            <Cpu size={19} />
          </span>
        </div>
        <Tabs
          value={prog}
          onChange={setProg}
          options={ids.map((id) => ({
            id,
            label: `${ramPrograms[id].title} · ${growth[ramPrograms[id].growth].theta}`,
          }))}
        />
        <div className="input-row">
          <label>
            Input size n <strong>{n}</strong>
          </label>
          <input
            type="range"
            min="1"
            max={RAM_MAX_N}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
          />
        </div>

        <div className="u1-ram">
          <div className="u1-code" aria-label="Pseudocode with cost per line">
            <div className="u1-code-head">
              <span>PSEUDOCODE</span>
              <span>COST</span>
              <span>RUNS</span>
            </div>
            {P.lines.map((l, i) => (
              <div
                key={i}
                className={`u1-code-line ${cur.line === i ? "on" : ""}`}
                title={l.why}
              >
                <code>
                  <b>{i + 1}</b>
                  {l.code}
                </code>
                <span className="u1-cost">{l.cost}</span>
                <span className="u1-runs">×{execCount[i]}</span>
              </div>
            ))}
          </div>
          <div className="u1-machine">
            <small className="u1-label">MEMORY · A[1…{n}]</small>
            <div className="u1-cells">
              {cur.arr.map((v, i) => (
                <div key={i} className={cur.active.includes(i) ? "on" : ""}>
                  <span>{v}</span>
                  <small>{i + 1}</small>
                </div>
              ))}
            </div>
            <small className="u1-label">REGISTERS</small>
            <div className="u1-vars">
              {Object.entries(cur.vars).map(([k, v]) => (
                <span key={k}>
                  <b>{k}</b>
                  {v}
                </span>
              ))}
              {!Object.keys(cur.vars).length && (
                <span>
                  <b>—</b>empty
                </span>
              )}
            </div>
            <small className="u1-label">COST SO FAR</small>
            <div className="u1-meter">
              <i
                style={{
                  width: `${(cur.total / finalTotal) * 100}%`,
                  background: colour(prog),
                }}
              />
            </div>
            <div className="u1-meter-text">
              <strong>{cur.total}</strong>
              <span>
                of {finalTotal} units · this step +{cur.cost}
              </span>
            </div>
          </div>
        </div>

        <div className="stage-explanation">
          <strong>
            Line {cur.line + 1}: {P.lines[cur.line].code.trim()}
          </strong>
          <p>
            {cur.note}{" "}
            <em>
              ({P.lines[cur.line].why}, {cur.cost} unit{cur.cost > 1 ? "s" : ""}
              .)
            </em>
          </p>
        </div>
        <PlayerBar p={p} />
        <div className="formula-card">
          <small>WHERE THE TOTAL COMES FROM</small>
          <strong>{P.formula}</strong>
          <span>
            At n = {n}: {P.count(n)} units. The trace above adds up to exactly{" "}
            {finalTotal}.
          </span>
        </div>
      </div>

      <div className="panel side-insight">
        <span className="kicker">COST AS n GROWS</span>
        <h3>Total units T(n), n = 1…{RAM_MAX_N}</h3>
        <Legend
          items={ids.map((id) => ({
            id,
            label: `${ramPrograms[id].title} (${growth[ramPrograms[id].growth].label})`,
            color: colour(id),
          }))}
        />
        <div className="u1-chart" style={{ height: 230 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 12, bottom: 4, left: -8 }}
            >
              <CartesianGrid {...grid} />
              <XAxis
                dataKey="n"
                {...axis}
                label={{
                  value: "n",
                  position: "insideBottomRight",
                  offset: -2,
                  fill: "#8498ae",
                  fontSize: 10,
                }}
              />
              <YAxis {...axis} width={44} />
              <Tooltip
                {...tooltipStyle}
                labelFormatter={(v) => `n = ${v}`}
                formatter={(v: number, key: string) => [
                  `${v} units`,
                  ramPrograms[key as RamProgramId].title,
                ]}
              />
              <ReferenceLine x={n} stroke="#3a5975" strokeDasharray="3 3" />
              {ids.map((id) => (
                <Line
                  key={id}
                  dataKey={id}
                  type="monotone"
                  stroke={colour(id)}
                  strokeWidth={id === prog ? 2.5 : 1.5}
                  strokeOpacity={id === prog ? 1 : 0.55}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
              <ReferenceDot
                x={n}
                y={P.count(n)}
                r={5}
                fill={colour(prog)}
                stroke="#0b1420"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <h3>What happens when n doubles?</h3>
        <div className="u1-doubling">
          {ids.map((id) => (
            <div key={id} className={id === prog ? "on" : ""}>
              <i style={{ background: colour(id) }} />
              <span>{ramPrograms[id].title}</span>
              <b>×{doubling(id).toFixed(2)}</b>
            </div>
          ))}
        </div>
        <p className="u1-small">
          From n = {n} to n = {2 * n}. As n grows these ratios settle at ×1, ×2
          and ×4: that settling value is what Θ(1), Θ(n) and Θ(n²) describe.
        </p>
        <div className="callout">
          <CircleHelp size={16} />
          <p>
            <strong>Model assumption:</strong> arithmetic, comparison,
            assignment and indexed access each cost one unit. Real hardware adds
            caches and memory effects; the RAM model ignores them on purpose so
            we can compare algorithms, not machines.
          </p>
        </div>
        <h3>Quick check</h3>
        <p>
          In “Visit every pair”, how many times does line 3 (the inner loop
          test) run?
        </p>
        <div className="answer-reveal">
          <button onClick={() => setReveal((v) => !v)}>
            {reveal ? "Hide answer" : "Reveal answer"}
          </button>
          {reveal && (
            <strong>n(n + 1): n + 1 tests for each of the n rows</strong>
          )}
        </div>
      </div>
    </section>
  );
}
