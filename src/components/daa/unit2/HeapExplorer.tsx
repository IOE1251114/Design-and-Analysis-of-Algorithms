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
import { CircleHelp, Layers, Plus, Trash2, Wrench } from "lucide-react";
import {
  buildStudy,
  heapOp,
  type HeapKind,
  type HeapOp,
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
import { C, Cells, HeapTree } from "./views";

const startKeys = [4, 1, 3, 2, 16, 9, 10, 14, 8, 7];

export function HeapExplorer({ onSteps }: { onSteps?: (k: number) => void }) {
  const [kind, setKind] = useState<HeapKind>("max");
  const [state, setState] = useState<{
    base: number[];
    op: HeapOp;
    id: number;
  }>({ base: [], op: { kind: "build", keys: startKeys }, id: 0 });
  const [key, setKey] = useState(15);
  const [log, setLog] = useState<string[]>(["build-heap from 10 keys"]);
  const run = useMemo(() => heapOp(state.base, state.op, kind), [state, kind]);
  const p = usePlayer(run.frames.length, `${state.id}-${kind}`, onSteps);
  const f = run.frames[p.step];
  const apply = (op: HeapOp, label: string) => {
    setState((s) => ({ base: run.result, op, id: s.id + 1 }));
    setLog((l) => [label, ...l].slice(0, 8));
  };
  const switchKind = (k: HeapKind) => {
    setKind(k);
    setState((s) => ({
      base: [],
      op: { kind: "build", keys: startKeys },
      id: s.id + 1,
    }));
    setLog([`build-heap (${k}) from 10 keys`]);
  };
  const word = kind === "max" ? "max" : "min";
  const idx = f.focus ?? (f.swap ? f.swap[1] : f.compare ? f.compare[0] : null);
  return (
    <>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="kicker">BINARY HEAP · PRIORITY QUEUE</span>
            <h2>One array, seen as a tree</h2>
            <p>
              A heap is a complete binary tree stored level by level in an
              array. Node i has children 2i + 1 and 2i + 2 and parent ⌊(i −
              1)/2⌋, so no pointers are needed. Run operations and watch both
              views change together.
            </p>
          </div>
          <span className="panel-icon">
            <Layers size={19} />
          </span>
        </div>
        <div className="u1-controls">
          <Tabs
            value={kind}
            onChange={switchKind}
            options={[
              { id: "max", label: "Max-heap (parent ≥ children)" },
              { id: "min", label: "Min-heap (parent ≤ children)" },
            ]}
          />
        </div>
        <div className="u2-heap-actions">
          <label className="u1-select">
            key
            <input
              className="u2-small-input"
              type="number"
              value={key}
              onChange={(e) => setKey(Number(e.target.value))}
            />
          </label>
          <button
            className="btn btn-primary"
            onClick={() => apply({ kind: "insert", key }, `insert ${key}`)}
          >
            <Plus size={14} /> Insert
          </button>
          <button
            className="btn btn-secondary"
            disabled={!run.result.length}
            onClick={() =>
              apply({ kind: "extract" }, `extract-${word} → ${run.result[0]}`)
            }
          >
            <Trash2 size={14} /> Extract-{word}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() =>
              apply(
                { kind: "build", keys: startKeys },
                `build-heap from 10 keys`,
              )
            }
          >
            <Wrench size={14} /> Build from 4, 1, 3, 2, 16, 9, 10, 14, 8, 7
          </button>
        </div>
        <p className="u1-small" style={{ marginTop: 6 }}>
          Each new operation starts from the heap that the previous one left
          behind. Play it, or press Next to go step by step.
        </p>
        <Legend
          items={[
            { id: "c", label: "Compared", color: C.compare, dash: true },
            { id: "s", label: "Swapped", color: C.swap, dash: true },
            {
              id: "f",
              label: "Current position",
              color: "#e7f4ff",
              dash: true,
            },
          ]}
        />
        <div className="u2-tree-stage">
          <HeapTree a={f.a} compare={f.compare} swap={f.swap} focus={f.focus} />
        </div>
        <Cells
          label="ARRAY (index below each key)"
          values={f.a}
          hi={idx}
          mark={[...(f.compare ?? []), ...(f.swap ?? [])]}
        />
        {idx !== null && idx !== undefined && idx < f.a.length && (
          <p className="u1-small">
            Index {idx}: parent{" "}
            {idx > 0
              ? `${(idx - 1) >> 1} (${f.a[(idx - 1) >> 1]})`
              : "— (root)"}
            , children{" "}
            {2 * idx + 1 < f.a.length
              ? `${2 * idx + 1} (${f.a[2 * idx + 1]})`
              : "—"}
            {2 * idx + 2 < f.a.length
              ? ` and ${2 * idx + 2} (${f.a[2 * idx + 2]})`
              : ""}
            .
          </p>
        )}
        <div className="stage-explanation">
          <strong>{f.title}</strong>
          <p>{f.text}</p>
        </div>
        <PlayerBar p={p} />
        <div className="u2-stats">
          <div>
            <small>THIS OPERATION</small>
            <strong>
              {f.comparisons} comparisons · {f.swaps} swaps
            </strong>
          </div>
          <div>
            <small>HEAP SIZE · HEIGHT</small>
            <strong>
              {f.a.length} ·{" "}
              {f.a.length ? Math.floor(Math.log2(f.a.length)) : 0}
            </strong>
            <span>height = ⌊log₂ n⌋</span>
          </div>
          <div>
            <small>OPERATION LOG (newest first)</small>
            <strong className="u2-log">{log.join(" · ")}</strong>
          </div>
        </div>
        <div className="u1-table-wrap u1-gap">
          <table className="u1-table">
            <thead>
              <tr>
                <th>Priority-queue operation</th>
                <th>How</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{word === "max" ? "Maximum" : "Minimum"}()</td>
                <td>Read the root a[0]</td>
                <td>Θ(1)</td>
              </tr>
              <tr>
                <td>Insert(x)</td>
                <td>Append at the end, sift up</td>
                <td>O(log n)</td>
              </tr>
              <tr>
                <td>Extract-{word}()</td>
                <td>Move the last key to the root, sift down</td>
                <td>O(log n)</td>
              </tr>
              <tr>
                <td>{word === "max" ? "Increase" : "Decrease"}-key(i, x)</td>
                <td>Change the key, sift up</td>
                <td>O(log n)</td>
              </tr>
              <tr>
                <td>Build-heap(A)</td>
                <td>Sift down every internal node, bottom-up</td>
                <td>Θ(n)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <BuildStudy />
    </>
  );
}

function BuildStudy() {
  const data = useMemo(() => buildStudy(), []);
  return (
    <section className="panel u1-gap">
      <div className="panel-heading">
        <div>
          <span className="kicker">WHY BUILD-HEAP IS LINEAR</span>
          <h2>Bottom-up heapify vs n separate inserts</h2>
          <p>
            Comparisons counted for building a max-heap from keys 1…n in
            ascending order (each insert then climbs all the way to the root).
          </p>
        </div>
      </div>
      <Legend
        items={[
          { id: "a", label: "n inserts, one at a time", color: SERIES[5] },
          { id: "b", label: "Bottom-up build-heap", color: SERIES[2] },
          { id: "c", label: "2n", color: "#8fa3b9", dash: true },
        ]}
      />
      <div className="u1-chart" style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 16, bottom: 6, left: -6 }}
          >
            <CartesianGrid {...grid} />
            <XAxis dataKey="n" {...axis} />
            <YAxis {...axis} width={44} />
            <Tooltip
              {...tooltipStyle}
              labelFormatter={(v) => `n = ${v}`}
              formatter={(v: number, k: string) => [
                `${v} comparisons`,
                k === "inserts"
                  ? "n inserts"
                  : k === "bottomUp"
                    ? "bottom-up"
                    : "2n",
              ]}
            />
            <Line
              dataKey="inserts"
              stroke={SERIES[5]}
              strokeWidth={2.2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="bottomUp"
              stroke={SERIES[2]}
              strokeWidth={2.2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="twoN"
              stroke="#8fa3b9"
              strokeWidth={1.5}
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
          Half of the nodes are leaves and never move. A quarter can sink at
          most 1 level, an eighth at most 2, and so on. The total work is Σ
          (n/2^(h+1))·h ≤ n·Σ h/2^h = 2n, so bottom-up build-heap is Θ(n).
          Inserting one key at a time can cost log n per key, Θ(n log n) in
          total.
        </p>
      </div>
    </section>
  );
}
