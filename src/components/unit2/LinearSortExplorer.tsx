import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CircleHelp, Rows3 } from "lucide-react";
import {
  bucketSortTrace,
  countingSortTrace,
  radixSortTrace,
} from "../../domain/unit2/sorts";
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
import { Cells } from "./views";

type Tab = "counting" | "radix" | "bucket" | "bound";
const parseInts = (s: string, lo: number, hi: number, max = 12) =>
  s
    .split(/[\s,]+/)
    .map(Number)
    .filter((x) => Number.isInteger(x) && x >= lo && x <= hi)
    .slice(0, max);

export function LinearSortExplorer({
  onSteps,
}: {
  onSteps?: (k: number) => void;
}) {
  const [tab, setTab] = useState<Tab>("counting");
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="kicker">SORTING IN LINEAR TIME</span>
          <h2>Beat n log n by not comparing keys</h2>
          <p>
            Comparison sorts can never beat Ω(n log n) (see the last tab).
            Counting, radix and bucket sort escape that bound because they use
            the key values themselves as positions, under assumptions about what
            the keys look like.
          </p>
        </div>
        <span className="panel-icon">
          <Rows3 size={19} />
        </span>
      </div>
      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { id: "counting", label: "Counting sort" },
          { id: "radix", label: "Radix sort" },
          { id: "bucket", label: "Bucket sort" },
          { id: "bound", label: "Why Ω(n log n) for comparisons" },
        ]}
      />
      {tab === "counting" && <Counting onSteps={onSteps} />}
      {tab === "radix" && <Radix onSteps={onSteps} />}
      {tab === "bucket" && <Bucket onSteps={onSteps} />}
      {tab === "bound" && <LowerBound />}
    </section>
  );
}

function Counting({ onSteps }: { onSteps?: (k: number) => void }) {
  const [text, setText] = useState("2, 5, 3, 0, 2, 3, 0, 3");
  const A = parseInts(text, 0, 9);
  const k = Math.max(0, ...A);
  const frames = useMemo(
    () => countingSortTrace(A.length ? A : [0], k),
    [text],
  );
  const p = usePlayer(frames.length, text, onSteps);
  const f = frames[p.step];
  // Tag equal keys a, b, c… so stability is visible: equal keys keep their input order in B.
  const tags = A.map((x, i) =>
    String.fromCharCode(97 + A.slice(0, i).filter((y) => y === x).length),
  );
  const placedTag: (string | null)[] = Array(A.length).fill(null);
  frames.slice(0, p.step + 1).forEach((fr) => {
    if (fr.phase === "place" && fr.i !== undefined && fr.bi !== undefined)
      placedTag[fr.bi] = tags[fr.i];
  });
  return (
    <div className="u1-demo">
      <div className="u2-input">
        <label>
          Keys (0–9, up to 12)
          <input value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <span>
          n = {A.length}, k = {k}
        </span>
      </div>
      <div className="u1-phases">
        {(["count", "prefix", "place"] as const).map((ph, i) => (
          <span key={ph} className={f.phase === ph ? "on" : ""}>
            <b>{i + 1}</b>
            {ph === "count"
              ? "Count each key"
              : ph === "prefix"
                ? "Prefix sums: C[v] = #keys ≤ v"
                : "Place from right to left"}
          </span>
        ))}
      </div>
      <div className="u2-rows">
        <Cells
          label="INPUT A"
          values={A}
          hi={f.i ?? null}
          sub={(i) => `${i}·${tags[i]}`}
        />
        <Cells label={`COUNT ARRAY C[0…${k}]`} values={f.C} hi={f.ci ?? null} />
        <Cells
          label="OUTPUT B"
          values={f.B.map((v, i) =>
            v === null ? null : `${v}${placedTag[i] ? placedTag[i] : ""}`,
          )}
          hi={f.bi ?? null}
        />
      </div>
      <div className="stage-explanation">
        <strong>
          {f.phase === "done"
            ? "Sorted"
            : f.phase === "count"
              ? "Phase 1: count"
              : f.phase === "prefix"
                ? "Phase 2: prefix sums"
                : "Phase 3: place"}
        </strong>
        <p>
          {f.text}{" "}
          {f.phase === "done"
            ? "Letters show equal keys kept their original order: counting sort is stable."
            : ""}
        </p>
      </div>
      <PlayerBar p={p} />
      <div className="u2-stats">
        <div>
          <small>TIME</small>
          <strong className="u2-mono">Θ(n + k)</strong>
        </div>
        <div>
          <small>EXTRA SPACE</small>
          <strong className="u2-mono">Θ(n + k)</strong>
        </div>
        <div>
          <small>STABLE</small>
          <strong className="u2-mono">yes</strong>
        </div>
        <div>
          <small>WORKS WHEN</small>
          <strong className="u2-mono">k = O(n)</strong>
        </div>
      </div>
    </div>
  );
}

function Radix({ onSteps }: { onSteps?: (k: number) => void }) {
  const [text, setText] = useState("170, 45, 75, 90, 802, 24, 2, 66");
  const A = parseInts(text, 0, 999);
  const frames = useMemo(() => radixSortTrace(A.length ? A : [0]), [text]);
  const p = usePlayer(frames.length, text, onSteps);
  const f = frames[p.step],
    d = Math.max(...A.map((x) => String(x).length), 1);
  const digitOf = (x: number) => Math.floor(x / f.digitPlace) % 10;
  return (
    <div className="u1-demo">
      <div className="u2-input">
        <label>
          Keys (0–999, up to 12)
          <input value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <span>
          d = {d} digit{d > 1 ? "s" : ""}, base 10
        </span>
      </div>
      <div className="u1-phases">
        {Array.from({ length: d }, (_, i) => (
          <span
            key={i}
            className={f.pass === i + 1 && f.phase !== "done" ? "on" : ""}
          >
            <b>{i + 1}</b>
            {["Ones", "Tens", "Hundreds"][i]} digit
          </span>
        ))}
      </div>
      <div className="u2-radix-row">
        {f.A.map((x, i) => {
          const s = String(x).padStart(d, "0"),
            pos = d - 1 - Math.round(Math.log10(f.digitPlace));
          return (
            <span key={i} className={i === f.i ? "hi" : ""}>
              {s.split("").map((c, j) => (
                <b
                  key={j}
                  className={j === pos && f.phase !== "done" ? "dig" : ""}
                >
                  {c}
                </b>
              ))}
            </span>
          );
        })}
      </div>
      <div className="u2-buckets">
        {f.buckets.map((b, i) => (
          <div
            key={i}
            className={
              f.i !== undefined &&
              digitOf(f.A[f.i]) === i &&
              f.phase === "distribute"
                ? "on"
                : ""
            }
          >
            <small>{i}</small>
            {b.map((x, j) => (
              <span key={j}>{x}</span>
            ))}
          </div>
        ))}
      </div>
      <div className="stage-explanation">
        <strong>
          {f.phase === "done"
            ? "Sorted"
            : `Pass ${f.pass}: ${f.phase === "distribute" ? "distribute by digit" : "collect buckets 0→9"}`}
        </strong>
        <p>{f.text}</p>
      </div>
      <PlayerBar p={p} />
      <div className="callout">
        <CircleHelp size={16} />
        <p>
          Radix sort starts from the <strong>least</strong> significant digit,
          and each pass must be stable. After pass i the keys are sorted by
          their last i digits, and stability keeps that order whenever the next
          digit ties.
        </p>
      </div>
    </div>
  );
}

function Bucket({ onSteps }: { onSteps?: (k: number) => void }) {
  const A = [0.78, 0.17, 0.39, 0.26, 0.72, 0.94, 0.21, 0.12, 0.23, 0.68];
  const frames = useMemo(() => bucketSortTrace(A), []);
  const p = usePlayer(frames.length, "bucket", onSteps);
  const f = frames[p.step];
  return (
    <div className="u1-demo">
      <Cells
        label="INPUT (uniform in [0, 1))"
        values={A.map((x) => x.toFixed(2))}
        hi={f.i ?? null}
      />
      <div className="u2-bucket-list">
        {f.buckets.map((b, i) => (
          <div key={i} className={f.b === i ? "on" : ""}>
            <small>
              [{(i / 10).toFixed(1)}, {((i + 1) / 10).toFixed(1)})
            </small>
            <div>
              {b.map((x, j) => (
                <span key={j}>{x.toFixed(2)}</span>
              ))}
              {!b.length && <em>empty</em>}
            </div>
          </div>
        ))}
      </div>
      <Cells
        label="OUTPUT (buckets concatenated)"
        values={[
          ...f.out.map((x) => x.toFixed(2)),
          ...Array(A.length - f.out.length).fill(null),
        ]}
      />
      <div className="stage-explanation">
        <strong>
          {f.phase === "distribute"
            ? "Distribute"
            : f.phase === "sort"
              ? "Sort each bucket"
              : f.phase === "concat"
                ? "Concatenate"
                : "Sorted"}
        </strong>
        <p>{f.text}</p>
      </div>
      <PlayerBar p={p} />
      <div className="callout">
        <CircleHelp size={16} />
        <p>
          Expected time Θ(n) assumes the keys are spread uniformly. If every key
          landed in one bucket, the insertion sort inside it would make the
          worst case Θ(n²).
        </p>
      </div>
    </div>
  );
}

/* Decision tree for sorting ⟨a₁, a₂, a₃⟩ by insertion sort (the standard textbook figure). */
type DNode = { q?: [number, number]; leaf?: number[]; yes?: DNode; no?: DNode };
const dtree: DNode = {
  q: [1, 2],
  yes: {
    q: [2, 3],
    yes: { leaf: [1, 2, 3] },
    no: { q: [1, 3], yes: { leaf: [1, 3, 2] }, no: { leaf: [3, 1, 2] } },
  },
  no: {
    q: [1, 3],
    yes: { leaf: [2, 1, 3] },
    no: { q: [2, 3], yes: { leaf: [2, 3, 1] }, no: { leaf: [3, 2, 1] } },
  },
};
function LowerBound() {
  const perms = [
    [1, 2, 3],
    [1, 3, 2],
    [2, 1, 3],
    [2, 3, 1],
    [3, 1, 2],
    [3, 2, 1],
  ];
  const [pi, setPi] = useState(4);
  const v = perms[pi].map((x) => x * 10); // a₁, a₂, a₃
  const path = new Set<DNode>();
  {
    let t: DNode | undefined = dtree;
    while (t) {
      path.add(t);
      t = t.q ? (v[t.q[0] - 1] <= v[t.q[1] - 1] ? t.yes : t.no) : undefined;
    }
  }
  const nodes: {
    n: DNode;
    x: number;
    y: number;
    px?: number;
    py?: number;
    yes?: boolean;
  }[] = [];
  const lay = (
    t: DNode,
    x: number,
    y: number,
    w: number,
    px?: number,
    py?: number,
    yes?: boolean,
  ) => {
    nodes.push({ n: t, x, y, px, py, yes });
    if (t.q) {
      lay(t.yes!, x - w, y + 70, w / 2, x, y, true);
      lay(t.no!, x + w, y + 70, w / 2, x, y, false);
    }
  };
  lay(dtree, 320, 26, 150);
  const chart = Array.from({ length: 20 }, (_, i) => {
    const n = i + 1;
    let lf = 0;
    for (let k = 2; k <= n; k++) lf += Math.log2(k);
    return {
      n,
      logfact: +lf.toFixed(2),
      nlogn: +(n * Math.log2(n)).toFixed(2),
      n1: n,
    };
  });
  return (
    <div className="u1-demo">
      <p className="u1-small" style={{ marginTop: 0 }}>
        Any comparison sort is a decision tree: each internal node asks "aᵢ ≤
        aⱼ?", and each leaf is one possible output order. Pick the input order
        and follow its path.
      </p>
      <Tabs
        value={String(pi)}
        onChange={(v) => setPi(Number(v))}
        options={perms.map((pm, i) => ({
          id: String(i),
          label: `a = ⟨${pm.map((x) => x * 10).join(", ")}⟩`,
        }))}
      />
      <div className="u1-tree-scroll">
        <svg
          viewBox="0 0 640 260"
          className="u1-svg"
          style={{ maxWidth: 760 }}
          role="img"
          aria-label="Decision tree for sorting three keys"
        >
          {nodes
            .filter((x) => x.px !== undefined)
            .map((x, i) => (
              <g key={`e${i}`}>
                <line
                  x1={x.px}
                  y1={x.py! + 14}
                  x2={x.x}
                  y2={x.y - 14}
                  stroke={path.has(x.n) ? SERIES[1] : "#2f4560"}
                  strokeWidth={path.has(x.n) ? 2.5 : 1.3}
                />
                <text
                  x={(x.px! + x.x) / 2 + (x.yes ? -10 : 10)}
                  y={(x.py! + x.y) / 2}
                  fontSize="9"
                  textAnchor={x.yes ? "end" : "start"}
                  fill="#8fa3b9"
                >
                  {x.yes ? "≤" : ">"}
                </text>
              </g>
            ))}
          {nodes.map((x, i) =>
            x.n.q ? (
              <g key={i}>
                <rect
                  x={x.x - 26}
                  y={x.y - 14}
                  width={52}
                  height={28}
                  rx={14}
                  fill="#13273a"
                  stroke={path.has(x.n) ? SERIES[1] : SERIES[0]}
                  strokeWidth={path.has(x.n) ? 2.5 : 1.3}
                />
                <text
                  x={x.x}
                  y={x.y + 4}
                  fontSize="11"
                  textAnchor="middle"
                  fill="#e7f4ff"
                >
                  {x.n.q[0]}:{x.n.q[1]}
                </text>
              </g>
            ) : (
              <g key={i}>
                <rect
                  x={x.x - 30}
                  y={x.y - 13}
                  width={60}
                  height={26}
                  rx={5}
                  fill={path.has(x.n) ? "#10302a" : "#0f1b29"}
                  stroke={path.has(x.n) ? SERIES[2] : "#2f4560"}
                  strokeWidth={path.has(x.n) ? 2.5 : 1}
                />
                <text
                  x={x.x}
                  y={x.y + 4}
                  fontSize="10"
                  textAnchor="middle"
                  fill="#e7f4ff"
                >
                  ⟨{x.n.leaf!.join(",")}⟩
                </text>
              </g>
            ),
          )}
        </svg>
      </div>
      <p className="u1-small">
        Leaf ⟨i, j, k⟩ means the sorted order is aᵢ ≤ aⱼ ≤ aₖ. Three keys have
        3! = 6 orders, so the tree needs 6 leaves, and a binary tree with 6
        leaves has height at least ⌈log₂ 6⌉ = 3. Some input therefore needs 3
        comparisons.
      </p>
      <div className="formula-card">
        <small>THE LOWER BOUND</small>
        <strong>
          height ≥ log₂(n!) ≥ log₂((n/2)^(n/2)) = (n/2)·log₂(n/2) = Ω(n log n)
        </strong>
        <span>
          Every comparison sort needs Ω(n log n) comparisons in the worst case,
          so merge sort and heap sort are asymptotically optimal among
          comparison sorts.
        </span>
      </div>
      <span className="u1-label">log₂(n!) GROWS LIKE n log₂ n</span>
      <Legend
        items={[
          { id: "a", label: "log₂(n!): minimum comparisons", color: SERIES[0] },
          { id: "b", label: "n log₂ n", color: SERIES[3], dash: true },
          {
            id: "c",
            label: "n (what linear sorts pay)",
            color: SERIES[2],
            dash: true,
          },
        ]}
      />
      <div className="u1-chart" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chart}
            margin={{ top: 8, right: 16, bottom: 4, left: -6 }}
          >
            <CartesianGrid {...grid} />
            <XAxis dataKey="n" {...axis} />
            <YAxis {...axis} width={44} tickFormatter={compact} />
            <Tooltip
              {...tooltipStyle}
              labelFormatter={(v) => `n = ${v}`}
              formatter={(v: number, k: string) => [
                v,
                k === "logfact" ? "log₂(n!)" : k === "nlogn" ? "n log₂ n" : "n",
              ]}
            />
            <Line
              dataKey="logfact"
              stroke={SERIES[0]}
              strokeWidth={2.2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="nlogn"
              stroke={SERIES[3]}
              strokeWidth={1.6}
              strokeDasharray="6 4"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="n1"
              stroke={SERIES[2]}
              strokeWidth={1.6}
              strokeDasharray="6 4"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
