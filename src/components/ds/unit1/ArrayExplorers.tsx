import { useMemo, useState } from "react";
import {
  Cpu,
  Database,
  LayoutGrid,
  MoveHorizontal,
  Search,
} from "lucide-react";
import {
  addressND,
  binarySearchFrames,
  deleteFrames,
  extent,
  fastTranspose,
  insertFrames,
  layout,
  linearSearchFrames,
  opCost,
  primeTradeoff,
  simpleTranspose,
  sparseMultiply,
  toSparse,
  traverseFrames,
  type Bound,
  type Cell,
  type Operation,
  type Order,
  type Sparse,
  type Structure,
} from "../../../domain/ds/arrays";
import {
  Explain,
  MemoryRow,
  Panel,
  PlayerBar,
  Stats,
  Tabs,
  usePlayer,
  type StepProps,
} from "../kit";

/* ======================= Basic terminology ======================= */

const records = [
  { roll: 101, first: "Asha", last: "Rao", dept: "CSE", marks: 86 },
  { roll: 102, first: "Kabir", last: "Sen", dept: "ECE", marks: 74 },
  { roll: 103, first: "Meera", last: "Iyer", dept: "CSE", marks: 91 },
  { roll: 104, first: "Dev", last: "Malik", dept: "ME", marks: 68 },
];
type FieldId = "roll" | "name" | "dept" | "marks";
const fields: { id: FieldId; label: string; note: string }[] = [
  {
    id: "roll",
    label: "Roll no",
    note: "Primary key: its value is unique in every record, so it identifies the record.",
  },
  {
    id: "name",
    label: "Name",
    note: "A group item: it splits into the elementary items First and Last.",
  },
  {
    id: "dept",
    label: "Dept",
    note: "A secondary key: many records share it, so it groups records rather than identifying one.",
  },
  {
    id: "marks",
    label: "Marks",
    note: "An elementary data item: it cannot be broken down further.",
  },
];

const structures: { id: Structure; label: string }[] = [
  { id: "array", label: "Unsorted array" },
  { id: "sorted", label: "Sorted array" },
  { id: "linked", label: "Linked list" },
];
const ops: { id: Operation; label: string }[] = [
  { id: "traverse", label: "Traverse" },
  { id: "search", label: "Search" },
  { id: "insert-front", label: "Insert at front" },
  { id: "insert-end", label: "Insert at end" },
  { id: "delete", label: "Delete" },
  { id: "sort", label: "Sort" },
];

export function BasicsExplorer() {
  const [tab, setTab] = useState<"org" | "ops" | "trade">("org");
  const [field, setField] = useState<FieldId>("roll");
  const [row, setRow] = useState<number | null>(null);
  const [n, setN] = useState(1000);
  const [N, setNN] = useState(100000);
  const [q, setQ] = useState(5000);
  const t = primeTradeoff(N, q);
  const maxT = Math.max(t.compute.time, t.table.time);
  return (
    <Panel
      kicker="UNIT I · BASIC TERMINOLOGY"
      title="How data is organised and what it costs"
      intro="Data items form fields, fields form records, and records form files. The structure you choose decides which operations are cheap."
      icon={<Database size={19} />}
    >
      <div className="u1-controls">
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { id: "org", label: "Data organisation" },
            { id: "ops", label: "Operations" },
            { id: "trade", label: "Time–space trade-off" },
          ]}
        />
      </div>

      {tab === "org" && (
        <>
          <div className="ds-hierarchy" aria-label="Data hierarchy">
            <span className={row === null ? "" : "on"}>Data item</span>→
            <span className="on">Field</span>→
            <span className={row !== null ? "on" : ""}>Record</span>→
            <span>File</span>
          </div>
          <div className="u1-table-wrap">
            <table className="u1-table ds-file">
              <thead>
                <tr>
                  {fields.map((f) => (
                    <th key={f.id}>
                      <button
                        className={field === f.id ? "on" : ""}
                        onClick={() => setField(f.id)}
                      >
                        {f.label}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr
                    key={r.roll}
                    className={row === i ? "on" : ""}
                    onClick={() => setRow(row === i ? null : i)}
                  >
                    <td className={field === "roll" ? "col" : ""}>{r.roll}</td>
                    <td className={field === "name" ? "col" : ""}>
                      {r.first} <i>·</i> {r.last}
                    </td>
                    <td className={field === "dept" ? "col" : ""}>{r.dept}</td>
                    <td className={field === "marks" ? "col" : ""}>
                      {r.marks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Explain
            title={
              row === null
                ? `Field: ${fields.find((f) => f.id === field)!.label}`
                : `Record ${row + 1}: ${records[row].first} ${records[row].last}`
            }
            text={
              row === null
                ? fields.find((f) => f.id === field)!.note
                : "A record is the collection of field values for one entity. The whole table of records is a file. Click a column header to inspect a field, or a row again to deselect it."
            }
          />
        </>
      )}

      {tab === "ops" && (
        <>
          <label className="u1-select ds-range">
            n = {n.toLocaleString()} items
            <input
              type="range"
              min={10}
              max={100000}
              step={10}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
            />
          </label>
          <div className="u1-table-wrap">
            <table className="u1-table ds-costs">
              <thead>
                <tr>
                  <th>Operation</th>
                  {structures.map((s) => (
                    <th key={s.id}>{s.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ops.map((o) => {
                  const costs = structures.map((s) => opCost(s.id, o.id, n));
                  const best = Math.min(...costs);
                  const max = Math.max(...costs, 1);
                  return (
                    <tr key={o.id}>
                      <td>{o.label}</td>
                      {costs.map((c, k) => (
                        <td key={k} className={c === best ? "best" : ""}>
                          <span
                            className="ds-bar"
                            style={{
                              width: `${Math.max(2, (100 * Math.log10(c + 1)) / Math.log10(max + 1))}%`,
                            }}
                          />
                          {o.id === "sort" && structures[k].id === "sorted"
                            ? "already sorted"
                            : `${c.toLocaleString()} steps`}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="u1-small">
            Worst-case element visits or moves on a log scale; green marks the
            cheapest structure. No structure wins every row, which is why we
            pick one for the operations we do most.
          </p>
        </>
      )}

      {tab === "trade" && (
        <>
          <p className="u1-small">
            Answer q questions “is k prime?” for numbers up to N. Either test
            each one by trial division (no extra memory), or build a sieve table
            once and look every answer up.
          </p>
          <div className="ds-two-ranges">
            <label className="u1-select ds-range">
              N = {N.toLocaleString()}
              <input
                type="range"
                min={1000}
                max={1000000}
                step={1000}
                value={N}
                onChange={(e) => setNN(Number(e.target.value))}
              />
            </label>
            <label className="u1-select ds-range">
              q = {q.toLocaleString()} queries
              <input
                type="range"
                min={1}
                max={100000}
                step={1}
                value={q}
                onChange={(e) => setQ(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="ds-compare">
            {[
              { k: "Recompute (trial division)", v: t.compute },
              { k: "Store a table (sieve)", v: t.table },
            ].map(({ k, v }) => (
              <div
                key={k}
                className={
                  v.time === Math.min(t.compute.time, t.table.time) ? "win" : ""
                }
              >
                <strong>{k}</strong>
                <small>TIME</small>
                <span className="ds-meter">
                  <i style={{ width: `${(100 * v.time) / maxT}%` }} />
                </span>
                <b>{v.time.toLocaleString()} steps</b>
                <small>EXTRA SPACE</small>
                <b>{v.space.toLocaleString()} cells</b>
              </div>
            ))}
          </div>
          <Explain
            title={
              t.table.time < t.compute.time
                ? "Memory buys time here"
                : "Here the table is not worth it"
            }
            text={
              t.table.time < t.compute.time
                ? `With ${q.toLocaleString()} queries, spending ${N.toLocaleString()} cells on a table makes the total work ${(t.compute.time / t.table.time).toFixed(1)}× smaller.`
                : `With only ${q.toLocaleString()} queries, building a ${N.toLocaleString()}-cell table costs more than simply testing each number.`
            }
          />
        </>
      )}
    </Panel>
  );
}

/* ======================= Arrays in memory ======================= */

type Dim = 1 | 2 | 3;
const defaultBounds: Record<Dim, Bound[]> = {
  1: [{ lb: 0, ub: 7 }],
  2: [
    { lb: 0, ub: 2 },
    { lb: 0, ub: 3 },
  ],
  3: [
    { lb: 0, ub: 1 },
    { lb: 0, ub: 1 },
    { lb: 0, ub: 2 },
  ],
};

export function ArrayMemoryExplorer() {
  const [dim, setDim] = useState<Dim>(2);
  const [order, setOrder] = useState<Order>("row");
  const [base, setBase] = useState(1000);
  const [w, setW] = useState(4);
  const [bounds, setBounds] = useState<Bound[]>(defaultBounds[2]);
  const [sel, setSel] = useState<number[]>([1, 2]);
  const switchDim = (d: Dim) => {
    setDim(d);
    setBounds(defaultBounds[d]);
    setSel(defaultBounds[d].map((b) => Math.min(b.ub, b.lb + 1)));
  };
  const setBound = (k: number, key: "lb" | "ub", v: number) =>
    setBounds((bs) => {
      const next = bs.map((b, i) => (i === k ? { ...b, [key]: v } : b));
      if (next[k].ub < next[k].lb || extent(next[k]) > 8) return bs;
      setSel((s) =>
        s.map((x, i) => Math.max(next[i].lb, Math.min(next[i].ub, x))),
      );
      return next;
    });
  const order2 = useMemo(() => layout(bounds, order), [bounds, order]);
  const { offset, address } = addressND(base, w, bounds, sel, order);
  const same = (t: number[]) => t.every((x, i) => x === sel[i]);
  const names = ["i", "j", "k"];
  const ext = bounds.map(extent);
  const formula =
    dim === 1
      ? `${base} + ${w} × (${sel[0]} − ${bounds[0].lb})`
      : order === "row"
        ? dim === 2
          ? `${base} + ${w} × [${ext[1]} × (${sel[0]} − ${bounds[0].lb}) + (${sel[1]} − ${bounds[1].lb})]`
          : `${base} + ${w} × [(${sel[0]} − ${bounds[0].lb}) × ${ext[1]} × ${ext[2]} + (${sel[1]} − ${bounds[1].lb}) × ${ext[2]} + (${sel[2]} − ${bounds[2].lb})]`
        : dim === 2
          ? `${base} + ${w} × [${ext[0]} × (${sel[1]} − ${bounds[1].lb}) + (${sel[0]} − ${bounds[0].lb})]`
          : `${base} + ${w} × [(${sel[2]} − ${bounds[2].lb}) × ${ext[1]} × ${ext[0]} + (${sel[1]} − ${bounds[1].lb}) × ${ext[0]} + (${sel[0]} − ${bounds[0].lb})]`;

  const grid = (pageIdx?: number) => {
    const rows =
      dim === 1
        ? [0]
        : Array.from(
            { length: ext[dim === 3 ? 1 : 0] },
            (_, r) => r + bounds[dim === 3 ? 1 : 0].lb,
          );
    const colsB = bounds[dim - 1];
    return (
      <div
        className="ds-grid"
        style={{
          gridTemplateColumns: `repeat(${extent(colsB)}, minmax(38px, 54px))`,
        }}
      >
        {rows.flatMap((r) =>
          Array.from({ length: extent(colsB) }, (_, c) => {
            const cIdx = c + colsB.lb;
            const tuple =
              dim === 1 ? [cIdx] : dim === 2 ? [r, cIdx] : [pageIdx!, r, cIdx];
            const pos = order2.findIndex((t) =>
              t.every((x, i) => x === tuple[i]),
            );
            return (
              <button
                key={tuple.join(",")}
                className={same(tuple) ? "on" : ""}
                onClick={() => setSel(tuple)}
                aria-label={`Select A[${tuple.join(", ")}]`}
              >
                <b>[{tuple.join(",")}]</b>
                <i>#{pos}</i>
              </button>
            );
          }),
        )}
      </div>
    );
  };

  return (
    <Panel
      kicker="UNIT I · REPRESENTATION OF ARRAYS"
      title="Where does A[i, j] live?"
      intro="Memory is one long row of cells, so a multi-dimensional array is stored in a fixed order. Pick an element to compute its address."
      icon={<Cpu size={19} />}
    >
      <div className="u1-controls">
        <Tabs
          value={String(dim) as "1" | "2" | "3"}
          onChange={(v) => switchDim(Number(v) as Dim)}
          options={[
            { id: "1", label: "1-D" },
            { id: "2", label: "2-D" },
            { id: "3", label: "3-D" },
          ]}
        />
        {dim > 1 && (
          <Tabs
            value={order}
            onChange={setOrder}
            options={[
              { id: "row", label: "Row-major" },
              { id: "col", label: "Column-major" },
            ]}
          />
        )}
      </div>
      <div className="ds-inputs">
        <label className="u1-select">
          Base
          <input
            className="u2-small-input"
            type="number"
            value={base}
            onChange={(e) => setBase(Number(e.target.value) || 0)}
          />
        </label>
        <label className="u1-select">
          w (bytes)
          <input
            className="u2-small-input"
            type="number"
            min={1}
            value={w}
            onChange={(e) => setW(Math.max(1, Number(e.target.value) || 1))}
          />
        </label>
        {bounds.map((b, k) => (
          <span key={k} className="u1-select">
            {names[k]}:
            <input
              className="u2-small-input ds-tiny"
              type="number"
              value={b.lb}
              onChange={(e) => setBound(k, "lb", Number(e.target.value))}
              aria-label={`Lower bound of ${names[k]}`}
            />
            ..
            <input
              className="u2-small-input ds-tiny"
              type="number"
              value={b.ub}
              onChange={(e) => setBound(k, "ub", Number(e.target.value))}
              aria-label={`Upper bound of ${names[k]}`}
            />
          </span>
        ))}
      </div>
      <div className="ds-pages">
        {dim === 3
          ? Array.from({ length: ext[0] }, (_, p) => (
              <div key={p}>
                <small className="ds-label">PAGE i = {p + bounds[0].lb}</small>
                {grid(p + bounds[0].lb)}
              </div>
            ))
          : grid()}
      </div>
      <MemoryRow
        label={`MEMORY (${order === "row" ? "row" : "column"}-major order) · address under each cell`}
        values={order2.map((t) => t.join(","))}
        hi={offset}
        sub={(i) => base + w * i}
      />
      <Explain
        title={`LOC(A[${sel.join(", ")}]) = ${address}`}
        text={
          <>
            <code className="ds-code">
              {formula} = {address}
            </code>
            <br />
            The element is {offset} cells after the base.{" "}
            {dim > 1 &&
              (order === "row"
                ? "Row-major keeps each row together (C, Java)."
                : "Column-major keeps each column together (Fortran, MATLAB).")}
          </>
        }
      />
    </Panel>
  );
}

/* ======================= Traversal, insertion and deletion ======================= */

const CAP = 10;
const startArray: Cell[] = [12, 25, 31, 47, 58, 63, null, null, null, null];

export function ArrayOpsExplorer({ onSteps }: StepProps) {
  const [state, setState] = useState({ a: startArray, n: 6, id: 0 });
  const [op, setOp] = useState<{
    kind: "traverse" | "insert" | "delete";
    pos: number;
    value: number;
  }>({ kind: "traverse", pos: 0, value: 0 });
  const [pos, setPos] = useState(2);
  const [value, setValue] = useState(40);
  const run = useMemo(() => {
    if (op.kind === "traverse")
      return {
        frames: traverseFrames(state.a, state.n),
        result: state.a,
        n: state.n,
      };
    return op.kind === "insert"
      ? insertFrames(state.a, state.n, op.pos, op.value)
      : deleteFrames(state.a, state.n, op.pos);
  }, [state, op]);
  const p = usePlayer(
    run.frames.length,
    `${state.id}-${op.kind}-${op.pos}-${op.value}`,
    onSteps,
  );
  const f = run.frames[p.step];
  const go = (kind: "traverse" | "insert" | "delete") => {
    setState((s) => ({ a: run.result, n: run.n, id: s.id + 1 }));
    setOp({ kind, pos, value });
  };
  return (
    <Panel
      kicker="UNIT I · ARRAY OPERATIONS"
      title="Every insertion shifts the tail"
      intro="An array keeps its elements contiguous. To insert or delete in the middle, every later element must move one place."
      icon={<MoveHorizontal size={19} />}
    >
      <div className="ds-inputs">
        <label className="u1-select">
          Position
          <input
            className="u2-small-input ds-tiny"
            type="number"
            min={0}
            max={CAP - 1}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
          />
        </label>
        <label className="u1-select">
          Value
          <input
            className="u2-small-input ds-tiny"
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />
        </label>
        <button className="btn btn-primary" onClick={() => go("insert")}>
          Insert
        </button>
        <button className="btn btn-secondary" onClick={() => go("delete")}>
          Delete at position
        </button>
        <button className="btn btn-secondary" onClick={() => go("traverse")}>
          Traverse
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            setState((s) => ({ a: startArray, n: 6, id: s.id + 1 }));
            setOp({ kind: "traverse", pos: 0, value: 0 });
          }}
        >
          Reset array
        </button>
      </div>
      <p className="u1-small">
        Each operation starts from the array the previous one left. Capacity is{" "}
        {CAP}.
      </p>
      <MemoryRow
        label="ARRAY A (index below each cell)"
        values={f.a}
        hi={f.hi ?? (f.move ? f.move[1] : undefined)}
        marks={f.move ? [f.move[0]] : undefined}
      />
      <Explain title={f.title} text={f.text} />
      <PlayerBar p={p} />
      <Stats
        items={[
          { label: "ELEMENTS N · CAPACITY", value: `${run.n} · ${CAP}` },
          {
            label: "SHIFTS SO FAR",
            value: f.moves,
            note: "insertion at k shifts N − k elements",
          },
          {
            label: "COST",
            value: op.kind === "traverse" ? "Θ(n)" : "O(n)",
            note: "access by index is Θ(1)",
          },
        ]}
      />
    </Panel>
  );
}

/* ======================= Linear vs binary search ======================= */

const sortedData = [4, 9, 13, 18, 22, 27, 31, 38, 42, 47, 53, 59, 64, 71, 78];

export function SearchExplorer({ onSteps }: StepProps) {
  const [key, setKey] = useState(59);
  const lin = useMemo(() => linearSearchFrames(sortedData, key), [key]);
  const bin = useMemo(() => binarySearchFrames(sortedData, key), [key]);
  const p = usePlayer(Math.max(lin.length, bin.length), key, onSteps);
  const lf = lin[Math.min(p.step, lin.length - 1)];
  const bf = bin[Math.min(p.step, bin.length - 1)];
  return (
    <Panel
      kicker="UNIT I · SEARCHING"
      title="Scan every element, or halve the range?"
      intro="Both searches run on the same sorted array, one comparison per step. Binary search throws away half of what is left each time."
      icon={<Search size={19} />}
    >
      <div className="ds-inputs">
        <label className="u1-select">
          Key
          <input
            className="u2-small-input ds-tiny"
            type="number"
            value={key}
            onChange={(e) => setKey(Number(e.target.value))}
          />
        </label>
        {[4, 42, 78, 50].map((k) => (
          <button
            key={k}
            className="btn btn-secondary"
            onClick={() => setKey(k)}
          >
            {k === 50 ? "Try a missing key (50)" : `Search ${k}`}
          </button>
        ))}
      </div>
      <div className="ds-split">
        <div>
          <small className="ds-label">
            LINEAR SEARCH · {lf.comparisons} comparisons
          </small>
          <MemoryRow
            values={sortedData}
            hi={lf.i}
            done={(i) => lf.found === i}
            marks={
              lf.i !== undefined
                ? Array.from({ length: lf.i }, (_, k) => k)
                : []
            }
          />
          <Explain title={lf.title} text={lf.text} />
        </div>
        <div>
          <small className="ds-label">
            BINARY SEARCH · {bf.comparisons} comparisons
          </small>
          <MemoryRow
            values={sortedData}
            hi={bf.mid}
            done={(i) => bf.found === i}
            marks={sortedData
              .map((_, i) => i)
              .filter(
                (i) => bf.lo === undefined || i < bf.lo || i > (bf.hi ?? -1),
              )}
            pointers={{ BEG: bf.lo, MID: bf.mid, END: bf.hi }}
          />
          <Explain title={bf.title} text={bf.text} />
        </div>
      </div>
      <PlayerBar p={p} />
      <Stats
        items={[
          {
            label: "WORST CASE, n = 15",
            value: "15 vs 4",
            note: "n vs ⌈log₂(n + 1)⌉",
          },
          { label: "n = 1,000,000", value: "1,000,000 vs 20" },
          {
            label: "BINARY SEARCH NEEDS",
            value: "sorted + random access",
            note: "so it does not suit linked lists",
          },
        ]}
      />
    </Panel>
  );
}

/* ======================= Sparse matrices ======================= */

const mA = [
  [0, 0, 3, 0, 0],
  [0, 0, 0, 0, 7],
  [2, 0, 0, 0, 0],
  [0, 6, 0, 0, 0],
  [0, 0, 0, 9, 0],
];
const mB = [
  [0, 1, 0],
  [0, 0, 4],
  [5, 0, 0],
  [0, 0, 2],
  [0, 3, 0],
];

function Dense({
  m,
  hi,
  label,
}: {
  m: number[][];
  hi?: [number, number];
  label: string;
}) {
  return (
    <div>
      <small className="ds-label">{label}</small>
      <div
        className="ds-matrix"
        style={{ gridTemplateColumns: `repeat(${m[0].length}, 30px)` }}
      >
        {m.flatMap((row, r) =>
          row.map((v, c) => (
            <span
              key={`${r}-${c}`}
              className={`${v ? "nz" : ""} ${hi && hi[0] === r && hi[1] === c ? "hi" : ""}`}
            >
              {v}
            </span>
          )),
        )}
      </div>
    </div>
  );
}

function TripletTable({
  s,
  label,
  hi,
  rows,
}: {
  s: Sparse;
  label: string;
  hi?: number;
  rows?: (readonly [number, number, number] | null)[];
}) {
  const list = rows ?? s.terms;
  return (
    <div className="u1-table-wrap">
      <small className="ds-label">{label}</small>
      <table className="u1-table ds-triplets">
        <thead>
          <tr>
            <th>#</th>
            <th>row</th>
            <th>col</th>
            <th>value</th>
          </tr>
        </thead>
        <tbody>
          <tr className="meta">
            <td>0</td>
            <td>{rows ? s.cols : s.rows}</td>
            <td>{rows ? s.rows : s.cols}</td>
            <td>{s.terms.length}</td>
          </tr>
          {list.map((t, i) => (
            <tr key={i} className={i === hi ? "on" : ""}>
              <td>{i + 1}</td>
              <td>{t?.[0] ?? ""}</td>
              <td>{t?.[1] ?? ""}</td>
              <td>{t?.[2] ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SparseExplorer({ onSteps }: StepProps) {
  const [tab, setTab] = useState<"simple" | "fast" | "multiply">("fast");
  const A = useMemo(() => toSparse(mA), []);
  const B = useMemo(() => toSparse(mB), []);
  const tFrames = useMemo(
    () => (tab === "simple" ? simpleTranspose(A) : fastTranspose(A)),
    [tab, A],
  );
  const mFrames = useMemo(() => sparseMultiply(A, B), [A, B]);
  const total = tab === "multiply" ? mFrames.length : tFrames.length;
  const p = usePlayer(total, tab, onSteps);
  const tf = tFrames[Math.min(p.step, tFrames.length - 1)];
  const mf = mFrames[Math.min(p.step, mFrames.length - 1)];
  const scanned = tab !== "multiply" ? tf.scan : undefined;
  return (
    <Panel
      kicker="UNIT I · SPARSE MATRICES"
      title="Store only what is not zero"
      intro={`A has ${A.terms.length} non-zero entries out of ${A.rows * A.cols}. The triplet list (row, col, value) keeps just those, with a header row giving the size and count.`}
      icon={<LayoutGrid size={19} />}
    >
      <div className="u1-controls">
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { id: "simple", label: "Transpose" },
            { id: "fast", label: "Fast transpose" },
            { id: "multiply", label: "Multiply A × B" },
          ]}
        />
      </div>
      {tab !== "multiply" ? (
        <>
          <div className="ds-split three">
            <Dense
              m={mA}
              label="MATRIX A (5 × 5)"
              hi={
                scanned !== undefined
                  ? [A.terms[scanned][0], A.terms[scanned][1]]
                  : undefined
              }
            />
            <TripletTable s={A} label="A AS TRIPLETS" hi={scanned} />
            <TripletTable
              s={A}
              label="TRANSPOSE (being filled)"
              hi={tf.write}
              rows={tf.out}
            />
          </div>
          {tf.rowTerms && (
            <div className="ds-split">
              <MemoryRow
                label="rowTerms[c] — terms in column c"
                values={tf.rowTerms}
              />
              {tf.startPos && (
                <MemoryRow
                  label="startPos[c] — next free slot for column c"
                  values={tf.startPos}
                />
              )}
            </div>
          )}
          <Explain title={tf.title} text={tf.text} />
          <PlayerBar p={p} />
          <Stats
            items={[
              { label: "STEPS SO FAR", value: tf.steps },
              {
                label: "SIMPLE TRANSPOSE",
                value: `${A.cols} × ${A.terms.length} = ${A.cols * A.terms.length}`,
                note: "cols × terms",
              },
              {
                label: "FAST TRANSPOSE",
                value: `≈ ${A.cols} + 2 × ${A.terms.length}`,
                note: "cols + terms",
              },
            ]}
          />
        </>
      ) : (
        <>
          <div className="ds-split three">
            <Dense
              m={mA}
              label="A (5 × 5)"
              hi={
                mf.a !== undefined
                  ? [A.terms[mf.a][0], A.terms[mf.a][1]]
                  : undefined
              }
            />
            <Dense
              m={mB}
              label="B (5 × 3)"
              hi={
                mf.b !== undefined
                  ? [B.terms[mf.b][0], B.terms[mf.b][1]]
                  : undefined
              }
            />
            <Dense m={mf.acc} label="C = A × B" hi={mf.cell} />
          </div>
          <Explain title={mf.title} text={mf.text} />
          <PlayerBar p={p} />
          <Stats
            items={[
              { label: "MULTIPLICATIONS", value: mf.products },
              { label: "DENSE METHOD", value: 5 * 5 * 3 },
              { label: "RESULT TERMS", value: toSparse(mf.acc).terms.length },
            ]}
          />
        </>
      )}
    </Panel>
  );
}
