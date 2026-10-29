import { useMemo, useState } from "react";
import { ArrowDownWideNarrow, HardDrive, Share2 } from "lucide-react";
import {
  classifyGraph,
  countMatrix,
  degrees,
  elementarySort,
  externalSort,
  multiKeySort,
  type Edge,
  type Elementary,
  type KeyName,
  type Rec,
} from "../../../domain/ds/sortGraph";
import { ArrayBars } from "../../daa/unit2/views";
import {
  DC,
  Explain,
  Panel,
  PlayerBar,
  Stats,
  Tabs,
  usePlayer,
  type StepProps,
} from "../kit";

/* ======================= Bubble, selection, insertion ======================= */

const inputs = {
  random: [29, 10, 14, 37, 13, 5, 41, 22, 18],
  sorted: [5, 10, 13, 14, 18, 22, 29, 37, 41],
  reversed: [41, 37, 29, 22, 18, 14, 13, 10, 5],
};
const sortNames: Record<Elementary, string> = {
  bubble: "Bubble sort",
  selection: "Selection sort",
  insertion: "Insertion sort",
};

export function ElementarySortExplorer({ onSteps }: StepProps) {
  const [kind, setKind] = useState<Elementary>("bubble");
  const [input, setInput] = useState<keyof typeof inputs>("random");
  const a = inputs[input];
  const frames = useMemo(() => elementarySort(a, kind), [a, kind]);
  const p = usePlayer(frames.length, `${kind}-${input}`, onSteps);
  const f = frames[p.step];
  const done = new Set(f.done);
  const totals = (["bubble", "selection", "insertion"] as Elementary[]).map(
    (k) => {
      const last = elementarySort(a, k).slice(-1)[0];
      return { k, c: last.comparisons, s: last.swaps };
    },
  );
  return (
    <Panel
      kicker="UNIT V · ELEMENTARY SORTING"
      title="Three simple ways to sort"
      intro="Bubble sort swaps neighbours, selection sort picks the minimum, insertion sort grows a sorted prefix. Try each on random, sorted and reversed input."
      icon={<ArrowDownWideNarrow size={19} />}
    >
      <div className="u1-controls">
        <Tabs
          value={kind}
          onChange={setKind}
          options={(Object.keys(sortNames) as Elementary[]).map((k) => ({
            id: k,
            label: sortNames[k],
          }))}
        />
        <Tabs
          value={input}
          onChange={setInput}
          options={[
            { id: "random", label: "Random" },
            { id: "sorted", label: "Already sorted" },
            { id: "reversed", label: "Reversed" },
          ]}
        />
      </div>
      <div className="ds-bars-stage">
        <ArrayBars
          a={f.a}
          state={(i) => (done.has(i) ? "done" : f.min === i ? "pivot" : "base")}
          compare={f.compare}
          swap={f.swap}
        />
      </div>
      <div className="ds-legend">
        <span className="compare">compared</span>
        <span className="swap">swapped</span>
        <span className="sorted">in final place</span>
        {kind === "selection" && <span className="min">current minimum</span>}
      </div>
      <Explain title={f.title} text={f.text} />
      <PlayerBar p={p} />
      <div className="u1-table-wrap u1-gap">
        <table className="u1-table">
          <thead>
            <tr>
              <th>On this input</th>
              <th>Comparisons</th>
              <th>Swaps</th>
              <th>Best · worst</th>
              <th>Stable?</th>
            </tr>
          </thead>
          <tbody>
            {totals.map((t) => (
              <tr key={t.k} className={t.k === kind ? "on" : ""}>
                <td>{sortNames[t.k]}</td>
                <td>{t.c}</td>
                <td>{t.s}</td>
                <td>
                  {t.k === "selection" ? "Θ(n²) · Θ(n²)" : "Θ(n) · Θ(n²)"}
                </td>
                <td>{t.k === "selection" ? "No" : "Yes"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ======================= Sorting on keys and external sorting ======================= */

const people: Rec[] = [
  { name: "Ravi", dept: "CSE", marks: 78 },
  { name: "Anu", dept: "ECE", marks: 91 },
  { name: "Bela", dept: "CSE", marks: 91 },
  { name: "Om", dept: "ME", marks: 66 },
  { name: "Tara", dept: "ECE", marks: 78 },
  { name: "Ishan", dept: "CSE", marks: 66 },
];
const keyLabels: Record<KeyName, string> = {
  name: "Name (A→Z)",
  dept: "Dept (A→Z)",
  marks: "Marks (high→low)",
};
const fileData = [38, 12, 71, 5, 49, 26, 93, 17, 60, 33, 8, 84, 21, 55, 67, 2];

export function KeysExternalExplorer({ onSteps }: StepProps) {
  const [tab, setTab] = useState<"keys" | "external">("keys");
  const [primary, setPrimary] = useState<KeyName>("dept");
  const [secondary, setSecondary] = useState<KeyName>("marks");
  const [mem, setMem] = useState(4);
  const passes = useMemo(
    () => multiKeySort(people, [primary, secondary]),
    [primary, secondary],
  );
  const ext = useMemo(() => externalSort(fileData, mem), [mem]);
  const p = usePlayer(
    tab === "keys" ? passes.length + 1 : ext.length,
    `${tab}-${primary}-${secondary}-${mem}`,
    onSteps,
  );
  const shown =
    p.step === 0 ? people : passes[Math.min(p.step, passes.length) - 1].result;
  const ef = ext[Math.min(p.step, ext.length - 1)];
  return (
    <Panel
      kicker="UNIT V · SORTING ON KEYS · EXTERNAL SORTING"
      title="More than one key, more than memory can hold"
      intro="Records are often sorted on a primary key, with ties broken by a secondary key. And when a file is too big for memory, it is sorted in pieces and merged."
      icon={<HardDrive size={19} />}
    >
      <div className="u1-controls">
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { id: "keys", label: "Sorting on different keys" },
            { id: "external", label: "External sorting" },
          ]}
        />
      </div>
      {tab === "keys" ? (
        <>
          <div className="ds-inputs">
            <label className="u1-select">
              Primary key
              <select
                value={primary}
                onChange={(e) => setPrimary(e.target.value as KeyName)}
              >
                {(Object.keys(keyLabels) as KeyName[]).map((k) => (
                  <option key={k} value={k}>
                    {keyLabels[k]}
                  </option>
                ))}
              </select>
            </label>
            <label className="u1-select">
              Secondary key
              <select
                value={secondary}
                onChange={(e) => setSecondary(e.target.value as KeyName)}
              >
                {(Object.keys(keyLabels) as KeyName[])
                  .filter((k) => k !== primary)
                  .map((k) => (
                    <option key={k} value={k}>
                      {keyLabels[k]}
                    </option>
                  ))}
              </select>
            </label>
          </div>
          <div className="u1-table-wrap">
            <table className="u1-table ds-records">
              <thead>
                <tr>
                  {(["name", "dept", "marks"] as KeyName[]).map((k) => (
                    <th
                      key={k}
                      className={
                        k === primary
                          ? "primary"
                          : k === secondary
                            ? "secondary"
                            : ""
                      }
                    >
                      {k}
                      {k === primary
                        ? " · primary"
                        : k === secondary
                          ? " · secondary"
                          : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.name}>
                    <td>{r.name}</td>
                    <td>{r.dept}</td>
                    <td>{r.marks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Explain
            title={
              p.step === 0
                ? "Unsorted file"
                : `Pass ${p.step}: stable sort on ${passes[Math.min(p.step, passes.length) - 1].key}`
            }
            text={
              p.step === 0
                ? "Sort on the least significant key first, then on the most significant one, with a stable sort each time."
                : p.step === 1
                  ? "After this pass, records are ordered by the secondary key."
                  : "The final stable pass orders by the primary key and keeps the secondary order inside every tie — exactly what we want."
            }
          />
          <PlayerBar p={p} />
        </>
      ) : (
        <>
          <div className="u1-controls">
            <label className="u1-select ds-range">
              Memory holds {mem} records
              <input
                type="range"
                min={2}
                max={8}
                value={mem}
                onChange={(e) => setMem(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="ds-runs">
            <small className="ds-label">
              {ef.phase === "runs"
                ? "PHASE 1 · SORTED RUNS ON DISK"
                : ef.phase === "merge"
                  ? `PHASE 2 · MERGE PASS ${ef.pass}`
                  : "SORTED FILE"}
            </small>
            {ef.runs.map((r, i) => (
              <div
                key={i}
                className={`ds-run ${ef.merging && ef.merging[0] === i ? "hi" : ""}`}
              >
                <i>run {i + 1}</i>
                {r.map((v, k) => (
                  <span key={k}>{v}</span>
                ))}
              </div>
            ))}
          </div>
          <Explain title={ef.title} text={ef.text} />
          <PlayerBar p={p} />
          <Stats
            items={[
              {
                label: "FILE SIZE · MEMORY",
                value: `${fileData.length} · ${mem}`,
              },
              {
                label: "INITIAL RUNS",
                value: Math.ceil(fileData.length / mem),
              },
              {
                label: "MERGE PASSES",
                value: Math.ceil(Math.log2(Math.ceil(fileData.length / mem))),
                note: "⌈log₂ runs⌉",
              },
              { label: "RECORDS READ SO FAR", value: ef.reads },
            ]}
          />
        </>
      )}
    </Panel>
  );
}

/* ======================= Digraphs and multigraphs ======================= */

const V = 4;
const vpos = [
  { x: 80, y: 60 },
  { x: 280, y: 60 },
  { x: 280, y: 210 },
  { x: 80, y: 210 },
];
const graphPresets: Record<string, { edges: Edge[]; directed: boolean }> = {
  "Simple graph": {
    directed: false,
    edges: [
      { u: 0, v: 1 },
      { u: 1, v: 2 },
      { u: 2, v: 3 },
      { u: 3, v: 0 },
      { u: 0, v: 2 },
    ],
  },
  Multigraph: {
    directed: false,
    edges: [
      { u: 0, v: 1 },
      { u: 0, v: 1 },
      { u: 1, v: 2 },
      { u: 2, v: 3 },
      { u: 2, v: 3 },
      { u: 2, v: 3 },
    ],
  },
  "With loops": {
    directed: false,
    edges: [
      { u: 0, v: 1 },
      { u: 1, v: 1 },
      { u: 1, v: 2 },
      { u: 3, v: 3 },
      { u: 2, v: 3 },
    ],
  },
  Digraph: {
    directed: true,
    edges: [
      { u: 0, v: 1 },
      { u: 1, v: 2 },
      { u: 2, v: 0 },
      { u: 2, v: 3 },
      { u: 3, v: 2 },
    ],
  },
};

export function MultigraphExplorer() {
  const [edges, setEdges] = useState<Edge[]>(graphPresets["Multigraph"].edges);
  const [directed, setDirected] = useState(false);
  const [u, setU] = useState(0);
  const [v, setV] = useState(1);
  const m = countMatrix(V, edges, directed);
  const d = degrees(V, edges);
  const cls = classifyGraph(edges, directed);
  const name = (i: number) => String.fromCharCode(65 + i);
  // Index of each edge among the edges joining the same pair, to fan parallel edges apart.
  const fan = edges.map((e, i) => {
    const same = edges.filter(
      (x, j) =>
        j < i &&
        ((x.u === e.u && x.v === e.v) ||
          (!directed && x.u === e.v && x.v === e.u)),
    );
    return same.length;
  });
  return (
    <Panel
      kicker="UNIT V · DIGRAPHS & MULTIGRAPHS"
      title="Direction, loops and parallel edges"
      intro="Add edges between four vertices and watch the adjacency matrix (now counting edges), the degrees and the type of graph change. A loop adds 2 to its vertex's degree."
      icon={<Share2 size={19} />}
    >
      <div className="u1-controls">
        <Tabs
          value={directed ? "d" : "u"}
          onChange={(x) => setDirected(x === "d")}
          options={[
            { id: "u", label: "Undirected" },
            { id: "d", label: "Directed (digraph)" },
          ]}
        />
      </div>
      <div className="ds-inputs">
        {Object.keys(graphPresets).map((k) => (
          <button
            key={k}
            className="btn btn-secondary"
            onClick={() => {
              setEdges(graphPresets[k].edges);
              setDirected(graphPresets[k].directed);
            }}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="ds-inputs">
        <label className="u1-select">
          From
          <select value={u} onChange={(e) => setU(Number(e.target.value))}>
            {Array.from({ length: V }, (_, i) => (
              <option key={i} value={i}>
                {name(i)}
              </option>
            ))}
          </select>
        </label>
        <label className="u1-select">
          To
          <select value={v} onChange={(e) => setV(Number(e.target.value))}>
            {Array.from({ length: V }, (_, i) => (
              <option key={i} value={i}>
                {name(i)}
              </option>
            ))}
          </select>
        </label>
        <button
          className="btn btn-primary"
          onClick={() => setEdges((es) => [...es, { u, v }])}
        >
          Add edge {name(u)}
          {directed ? "→" : "–"}
          {name(v)}
        </button>
        <button
          className="btn btn-secondary"
          disabled={!edges.length}
          onClick={() => setEdges((es) => es.slice(0, -1))}
        >
          Remove last edge
        </button>
      </div>
      <div className="ds-split">
        <svg
          viewBox="0 0 360 270"
          className="u1-svg"
          style={{ maxWidth: 420 }}
          role="img"
          aria-label={`${cls.kind} with ${edges.length} edges`}
        >
          <defs>
            <marker
              id="ds-garrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L10 5 L0 10 z" fill="#7fa6c4" />
            </marker>
          </defs>
          {edges.map((e, i) => {
            const a = vpos[e.u],
              b = vpos[e.v];
            if (e.u === e.v) {
              const r = 16 + fan[i] * 8;
              const ox = a.x < 180 ? -1 : 1;
              return (
                <circle
                  key={i}
                  cx={a.x + ox * (18 + r * 0.6)}
                  cy={a.y - (a.y < 130 ? 1 : -1) * (18 + r * 0.6)}
                  r={r}
                  fill="none"
                  stroke={DC.fresh}
                  strokeWidth={1.6}
                />
              );
            }
            const dx = b.x - a.x,
              dy = b.y - a.y,
              len = Math.hypot(dx, dy);
            const k = fan[i];
            const off = k === 0 ? 0 : (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 26;
            const mx = (a.x + b.x) / 2 + (-dy / len) * off,
              my = (a.y + b.y) / 2 + (dx / len) * off;
            const ex = b.x - (dx / len) * 22,
              ey = b.y - (dy / len) * 22;
            return (
              <path
                key={i}
                d={`M${a.x} ${a.y} Q${mx} ${my} ${directed ? ex : b.x} ${directed ? ey : b.y}`}
                fill="none"
                stroke={fan[i] ? DC.active : "#7fa6c4"}
                strokeWidth={1.6}
                markerEnd={directed ? "url(#ds-garrow)" : undefined}
              />
            );
          })}
          {vpos.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={19}
                fill={DC.node}
                stroke={DC.stroke}
                strokeWidth={1.8}
              />
              <text
                x={p.x}
                y={p.y + 5}
                textAnchor="middle"
                fontSize="14"
                fill={DC.text}
              >
                {name(i)}
              </text>
            </g>
          ))}
        </svg>
        <div>
          <small className="ds-label">
            ADJACENCY MATRIX (entries count edges)
          </small>
          <div className="u1-table-wrap">
            <table className="u1-table ds-adj">
              <thead>
                <tr>
                  <th />
                  {Array.from({ length: V }, (_, i) => (
                    <th key={i}>{name(i)}</th>
                  ))}
                  <th>{directed ? "out" : "deg"}</th>
                </tr>
              </thead>
              <tbody>
                {m.map((row, i) => (
                  <tr key={i}>
                    <th>{name(i)}</th>
                    {row.map((x, j) => (
                      <td key={j} className={x > 1 ? "multi" : x ? "one" : ""}>
                        {x}
                      </td>
                    ))}
                    <td>{directed ? d.outD[i] : d.deg[i]}</td>
                  </tr>
                ))}
                {directed && (
                  <tr>
                    <th>in</th>
                    {d.inD.map((x, j) => (
                      <td key={j}>{x}</td>
                    ))}
                    <td />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Explain
        title={`This is a ${cls.kind}`}
        text={
          cls.loops
            ? `It has ${cls.loops} loop(s)${cls.parallel ? ` and ${cls.parallel} parallel edge(s)` : ""}. Graphs with loops are called pseudographs.`
            : cls.parallel
              ? `${cls.parallel} edge(s) repeat a pair of vertices already joined (gold). A matrix entry above 1 shows them.`
              : directed
                ? "Every edge has a direction, so the matrix need not be symmetric."
                : "No loops and no repeated pairs: the matrix is symmetric with 0s and 1s."
        }
      />
      <Stats
        items={[
          { label: "EDGES |E|", value: edges.length },
          directed
            ? {
                label: "Σ IN = Σ OUT = |E|",
                value: `${d.inD.reduce((a, b) => a + b, 0)} = ${d.outD.reduce((a, b) => a + b, 0)}`,
              }
            : {
                label: "Σ DEGREES = 2|E|",
                value: `${d.deg.reduce((a, b) => a + b, 0)} = ${2 * edges.length}`,
              },
          {
            label: "PARALLEL · LOOPS",
            value: `${cls.parallel} · ${cls.loops}`,
          },
        ]}
      />
    </Panel>
  );
}
