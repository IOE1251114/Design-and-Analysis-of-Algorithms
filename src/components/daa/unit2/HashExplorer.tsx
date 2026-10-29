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
import { CircleHelp, Hash } from "lucide-react";
import {
  expectedProbes,
  hashInfo,
  hashTrace,
  type HashMethod,
} from "../../../domain/daa/unit2/heapHash";
import {
  Legend,
  PlayerBar,
  SERIES,
  Tabs,
  axis,
  grid,
  tooltipStyle,
  usePlayer,
} from "../unit1/shared";

const methods: HashMethod[] = ["chaining", "linear", "quadratic", "double"];
const parse = (s: string) =>
  [
    ...new Set(
      s
        .split(/[\s,]+/)
        .map(Number)
        .filter((x) => Number.isInteger(x) && x >= 0 && x < 1000),
    ),
  ].slice(0, 13);

export function HashExplorer({ onSteps }: { onSteps?: (k: number) => void }) {
  const [method, setMethod] = useState<HashMethod>("linear");
  const [m, setM] = useState(11);
  const [text, setText] = useState("10, 22, 31, 4, 15, 28, 17, 88, 59");
  const [search, setSearch] = useState<number | "">(59);
  const keys = parse(text);
  const run = useMemo(
    () => hashTrace(keys, m, method, search === "" ? undefined : search),
    [text, m, method, search],
  );
  const p = usePlayer(
    run.frames.length,
    `${text}-${m}-${method}-${search}`,
    onSteps,
  );
  const f = run.frames[p.step];
  const order = new Map<number, number>();
  f.probes.forEach((s, i) => {
    if (!order.has(s)) order.set(s, i + 1);
  });
  const placedSoFar =
    method === "chaining"
      ? f.chains.reduce((s, c) => s + c.length, 0)
      : f.table.filter((x) => x !== null).length;
  const alpha = placedSoFar / m;
  // longest run of occupied consecutive slots (primary clustering)
  let longest = 0,
    cur = 0;
  for (const x of [...f.table, ...f.table]) {
    cur = x === null ? 0 : cur + 1;
    longest = Math.max(longest, Math.min(cur, m));
  }
  const curve = useMemo(
    () =>
      Array.from({ length: 19 }, (_, i) => {
        const a = (i + 1) * 0.05;
        const e = expectedProbes(a);
        return {
          alpha: +a.toFixed(2),
          chaining: +e.chaining.toFixed(2),
          linear: +e.linear.toFixed(2),
          uniform: +e.uniform.toFixed(2),
        };
      }),
    [],
  );
  return (
    <>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="kicker">HASH TABLE LAB</span>
            <h2>Where does each key land, and what happens on a collision?</h2>
            <p>
              Keys are hashed with h(k) = k mod m. The default keys are a
              standard textbook exercise; change the method and compare where
              they end up.
            </p>
          </div>
          <span className="panel-icon">
            <Hash size={19} />
          </span>
        </div>
        <Tabs
          value={method}
          onChange={setMethod}
          options={methods.map((x) => ({ id: x, label: hashInfo[x].name }))}
        />
        <div className="u2-input">
          <label>
            Keys to insert (up to 13)
            <input value={text} onChange={(e) => setText(e.target.value)} />
          </label>
          <label className="u1-select">
            table size m
            <select value={m} onChange={(e) => setM(Number(e.target.value))}>
              {[7, 11, 13].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="u1-select">
            then search for
            <input
              className="u2-small-input"
              type="number"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </label>
        </div>
        <div className="formula-card u2-inline-formula">
          <small>PROBE SEQUENCE</small>
          <strong>{hashInfo[method].probe}</strong>
        </div>
        <div className="u2-hash-key">
          <span>Current key</span>
          <b>{f.key}</b>
          <span>
            h({f.key}) = {f.key} mod {m} = <b>{f.key % m}</b>
          </span>
          {method === "double" && (
            <span>
              h₂({f.key}) = 1 + ({f.key} mod {m - 1}) ={" "}
              <b>{1 + (f.key % (m - 1))}</b>
            </span>
          )}
        </div>
        {method === "chaining" ? (
          <div className="u2-chains">
            {f.chains.map((c, i) => (
              <div
                key={i}
                className={
                  f.probes.includes(i)
                    ? f.status === "missing"
                      ? "miss"
                      : "on"
                    : ""
                }
              >
                <small>{i}</small>
                {c.map((k, j) => (
                  <span key={j} className={k === f.key ? "key" : ""}>
                    {k}
                  </span>
                ))}
                {!c.length && <em>—</em>}
              </div>
            ))}
          </div>
        ) : (
          <div className="u2-slots">
            {f.table.map((k, i) => {
              const o = order.get(i),
                isSlot = f.slot === i;
              return (
                <div
                  key={i}
                  className={`${isSlot ? (f.status === "found" ? "found" : "placed") : o ? "probed" : ""} ${k === null ? "empty" : ""}`}
                >
                  <b>{k ?? ""}</b>
                  <i>{i}</i>
                  {o && <em>{o}</em>}
                </div>
              );
            })}
          </div>
        )}
        <p className="u1-small">
          {method === "chaining"
            ? "Each slot holds a linked list; the highlighted chain is the one being used."
            : "Numbers in the corner give the probe order: 1 is h(k), 2 is the first alternative, and so on."}
        </p>
        <div
          className={`stage-explanation ${f.status === "failed" || f.status === "missing" ? "u2-warn" : ""}`}
        >
          <strong>{f.title}</strong>
          <p>{f.text}</p>
        </div>
        <PlayerBar p={p} />
        <div className="u2-stats">
          <div>
            <small>LOAD FACTOR α = n / m</small>
            <strong>
              {placedSoFar} / {m} = {alpha.toFixed(2)}
            </strong>
          </div>
          <div>
            <small>AVG PROBES PER INSERT</small>
            <strong>{run.avgProbes.toFixed(2)}</strong>
            <span>all {keys.length} keys</span>
          </div>
          {method !== "chaining" && (
            <div>
              <small>LONGEST CLUSTER</small>
              <strong>{longest} slots</strong>
              <span>
                {method === "linear"
                  ? "linear probing builds long runs (primary clustering)"
                  : "runs of occupied slots"}
              </span>
            </div>
          )}
          {method === "chaining" && (
            <div>
              <small>LONGEST CHAIN</small>
              <strong>{Math.max(...f.chains.map((c) => c.length))}</strong>
              <span>expected length α</span>
            </div>
          )}
        </div>
      </section>
      <section className="panel u1-gap">
        <div className="panel-heading">
          <div>
            <span className="kicker">COST VS LOAD FACTOR</span>
            <h2>Expected probes for an unsuccessful search</h2>
            <p>
              Classical results, assuming keys hash uniformly. The dashed line
              is the load factor of your table right now.
            </p>
          </div>
        </div>
        <Legend
          items={[
            { id: "c", label: "Chaining: 1 + α", color: SERIES[0] },
            {
              id: "u",
              label: "Double hashing ≈ uniform: 1/(1 − α)",
              color: SERIES[2],
            },
            {
              id: "l",
              label: "Linear probing: ½(1 + 1/(1 − α)²)",
              color: SERIES[5],
            },
          ]}
        />
        <div className="u1-chart" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={curve}
              margin={{ top: 10, right: 16, bottom: 6, left: -6 }}
            >
              <CartesianGrid {...grid} />
              <XAxis
                dataKey="alpha"
                type="number"
                domain={[0.05, 0.95]}
                ticks={[0.1, 0.3, 0.5, 0.7, 0.9]}
                {...axis}
              />
              <YAxis {...axis} width={40} domain={[0, 30]} allowDataOverflow />
              <Tooltip
                {...tooltipStyle}
                labelFormatter={(v) => `α = ${v}`}
                formatter={(v: number, k: string) => [
                  `${v} probes`,
                  k === "chaining"
                    ? "Chaining"
                    : k === "uniform"
                      ? "Double hashing"
                      : "Linear probing",
                ]}
              />
              {alpha > 0.05 && alpha < 0.95 && (
                <ReferenceLine
                  x={+alpha.toFixed(2)}
                  stroke="#f4c56a"
                  strokeDasharray="4 3"
                  label={{
                    value: `your α = ${alpha.toFixed(2)}`,
                    fill: "#e7d3a6",
                    fontSize: 10,
                    position: "insideTopLeft",
                  }}
                />
              )}
              <Line
                dataKey="chaining"
                stroke={SERIES[0]}
                strokeWidth={2.2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                dataKey="uniform"
                stroke={SERIES[2]}
                strokeWidth={2.2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                dataKey="linear"
                stroke={SERIES[5]}
                strokeWidth={2.2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="callout">
          <CircleHelp size={16} />
          <p>
            With chaining, α can exceed 1 and the cost grows gently. With open
            addressing α must stay below 1, and the cost explodes as the table
            fills. Linear probing suffers first because its clusters merge. That
            is why real tables resize (rehash into a table about twice as large)
            once α passes a threshold such as 0.5–0.75.
          </p>
        </div>
      </section>
    </>
  );
}
