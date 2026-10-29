import { useMemo, useState } from "react";
import { Link2, Sigma } from "lucide-react";
import {
  addPolyFrames,
  formatPoly,
  gAtoms,
  gDepth,
  gFormat,
  gLength,
  listOp,
  makeList,
  multiplyPolyFrames,
  parseGList,
  parsePoly,
  type GNode,
  type ListFrame,
  type ListKind,
  type ListOp,
  type Term,
} from "../../../domain/ds/lists";
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

/* ======================= Linked lists ======================= */

const start = [8, 15, 23, 42];

export function LinkedListExplorer({ onSteps }: StepProps) {
  const [kind, setKind] = useState<ListKind | "general">("singly");
  const [state, setState] = useState(() => ({
    list: makeList(start),
    op: { kind: "search", value: 23 } as ListOp,
    id: 0,
  }));
  const [value, setValue] = useState(30);
  const [pos, setPos] = useState(2);
  const listKind: ListKind = kind === "general" ? "singly" : kind;
  const run = useMemo(
    () => listOp(state.list, state.op, listKind),
    [state, listKind],
  );
  const p = usePlayer(run.frames.length, `${state.id}-${kind}`, onSteps);
  const f = run.frames[p.step];
  const apply = (op: ListOp) =>
    setState((s) => ({ list: run.result, op, id: s.id + 1 }));
  return (
    <Panel
      kicker="UNIT II · LINKED LISTS"
      title="Nodes joined by pointers"
      intro="Each node stores its data and the address of the next node. Inserting or deleting changes a couple of pointers; nothing moves in memory."
      icon={<Link2 size={19} />}
    >
      <div className="u1-controls">
        <Tabs
          value={kind}
          onChange={setKind}
          options={[
            { id: "singly", label: "Singly" },
            { id: "doubly", label: "Doubly" },
            { id: "circular", label: "Circular" },
            { id: "general", label: "Generalized list" },
          ]}
        />
      </div>
      {kind === "general" ? (
        <GeneralizedList />
      ) : (
        <>
          <div className="ds-inputs">
            <label className="u1-select">
              Value
              <input
                className="u2-small-input ds-tiny"
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
              />
            </label>
            <label className="u1-select">
              Position
              <input
                className="u2-small-input ds-tiny"
                type="number"
                min={0}
                value={pos}
                onChange={(e) => setPos(Number(e.target.value))}
              />
            </label>
            <button
              className="btn btn-primary"
              onClick={() => apply({ kind: "insert-head", value })}
            >
              Insert at head
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => apply({ kind: "insert-tail", value })}
            >
              Insert at tail
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => apply({ kind: "insert-at", value, pos })}
            >
              Insert at position
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => apply({ kind: "delete", value })}
            >
              Delete value
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => apply({ kind: "search", value })}
            >
              Search
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => apply({ kind: "reverse" })}
            >
              Reverse
            </button>
          </div>
          <ListDiagram f={f} kind={listKind} />
          <Explain title={f.title} text={f.text} />
          <PlayerBar p={p} />
          <Stats
            items={[
              { label: "NODES", value: f.nodes.length },
              { label: "POINTER STEPS", value: f.steps },
              {
                label: "EXTRA SPACE PER NODE",
                value: listKind === "doubly" ? "2 pointers" : "1 pointer",
                note:
                  listKind === "doubly"
                    ? "but can walk backwards and delete in Θ(1) given the node"
                    : "cheaper, but only forwards",
              },
            ]}
          />
        </>
      )}
    </Panel>
  );
}

function ListDiagram({ f, kind }: { f: ListFrame; kind: ListKind }) {
  const n = f.nodes.length;
  const dbl = kind === "doubly";
  const bw = dbl ? 92 : 74,
    gap = 34,
    top = 66,
    bh = 34;
  const freshAt = f.fresh?.at;
  const W = Math.max(60 + n * (bw + gap) + 70 + (f.fresh ? bw : 0), 320);
  const H = kind === "circular" ? 170 : 140;
  const x0 = (i: number) => 54 + i * (bw + gap);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="u1-svg ds-list-svg"
      style={{ maxWidth: Math.min(940, W * 1.3) }}
      role="img"
      aria-label={`Linked list: ${f.nodes.map((x) => x.value).join(" → ")}`}
    >
      <defs>
        <marker
          id="ds-arrow"
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
      <text
        x={8}
        y={top + bh / 2 + 4}
        fontSize="10"
        fill={DC.active}
        fontFamily="DM Mono, monospace"
      >
        HEAD
      </text>
      {n > 0 && (
        <line
          x1={40}
          y1={top + bh / 2}
          x2={x0(0) - 3}
          y2={top + bh / 2}
          stroke="#7fa6c4"
          markerEnd="url(#ds-arrow)"
        />
      )}
      {f.nodes.map((node, i) => {
        const x = x0(i);
        const removing = f.removing === i;
        const rev = f.reversed !== undefined && i < f.reversed;
        const stroke =
          f.found === i
            ? DC.done
            : f.cur === i
              ? DC.active
              : removing
                ? DC.bad
                : DC.stroke;
        const labels = [f.cur === i ? "CUR" : "", f.prev === i ? "PREV" : ""]
          .filter(Boolean)
          .join(" · ");
        return (
          <g key={node.id} opacity={removing ? 0.55 : 1}>
            <rect
              x={x}
              y={top}
              width={bw}
              height={bh}
              rx={5}
              fill={removing ? "#3a1c27" : DC.node}
              stroke={stroke}
              strokeWidth={f.cur === i || f.found === i ? 2.6 : 1.4}
            />
            {dbl && (
              <line
                x1={x + 22}
                y1={top}
                x2={x + 22}
                y2={top + bh}
                stroke={DC.edge}
              />
            )}
            <line
              x1={x + bw - 22}
              y1={top}
              x2={x + bw - 22}
              y2={top + bh}
              stroke={DC.edge}
            />
            <text
              x={dbl ? x + (bw - 22 + 22) / 2 : x + (bw - 22) / 2}
              y={top + bh / 2 + 4}
              fontSize="13"
              textAnchor="middle"
              fill={DC.text}
            >
              {node.value}
            </text>
            <circle cx={x + bw - 11} cy={top + bh / 2} r={2.5} fill="#7fa6c4" />
            {dbl && (
              <circle cx={x + 11} cy={top + bh / 2} r={2.5} fill="#7fa6c4" />
            )}
            {labels && (
              <text
                x={x + bw / 2}
                y={top - 10}
                fontSize="10"
                textAnchor="middle"
                fill={DC.active}
                fontFamily="DM Mono, monospace"
              >
                {labels}
              </text>
            )}
            {/* next pointer to the following node (or backwards if already reversed) */}
            {i < n - 1 && !rev && (
              <line
                x1={x + bw - 11}
                y1={top + bh / 2}
                x2={x0(i + 1) - 3}
                y2={top + bh / 2}
                stroke="#7fa6c4"
                markerEnd="url(#ds-arrow)"
              />
            )}
            {rev && i > 0 && (
              <path
                d={`M${x + bw - 11} ${top + bh / 2} C ${x + bw} ${top + bh + 26}, ${x0(i - 1) + bw - 20} ${top + bh + 26}, ${x0(i - 1) + bw - 6} ${top + bh + 2}`}
                fill="none"
                stroke={DC.fresh}
                markerEnd="url(#ds-arrow)"
              />
            )}
            {dbl && i > 0 && (
              <line
                x1={x + 11}
                y1={top + bh / 2 + 9}
                x2={x0(i - 1) + bw + 3}
                y2={top + bh / 2 + 9}
                stroke="#5d7f9c"
                strokeDasharray="3 2"
                markerEnd="url(#ds-arrow)"
              />
            )}
          </g>
        );
      })}
      {n > 0 &&
        kind !== "circular" &&
        (f.reversed === undefined || f.reversed < n) && (
          <text
            x={x0(n - 1) + bw + 8}
            y={top + bh / 2 + 4}
            fontSize="10"
            fill={DC.muted}
            fontFamily="DM Mono, monospace"
          >
            NULL
          </text>
        )}
      {n > 1 && kind === "circular" && (
        <path
          d={`M${x0(n - 1) + bw - 11} ${top + bh / 2} C ${x0(n - 1) + bw + 40} ${top + bh + 60}, ${x0(0) - 40} ${top + bh + 60}, ${x0(0) + 14} ${top + bh + 2}`}
          fill="none"
          stroke={DC.done}
          strokeDasharray="5 3"
          markerEnd="url(#ds-arrow)"
        />
      )}
      {f.fresh && (
        <g>
          <rect
            x={freshAt! === 0 ? x0(0) - 10 : x0(freshAt!) - gap / 2 - bw / 2}
            y={4}
            width={bw}
            height={bh - 4}
            rx={5}
            fill="#241e3d"
            stroke={DC.fresh}
            strokeWidth={2}
          />
          <text
            x={
              (freshAt! === 0 ? x0(0) - 10 : x0(freshAt!) - gap / 2 - bw / 2) +
              bw / 2 -
              (dbl ? 0 : 10)
            }
            y={24}
            fontSize="12"
            textAnchor="middle"
            fill={DC.text}
          >
            {f.fresh.value}
          </text>
          <text
            x={
              (freshAt! === 0 ? x0(0) - 10 : x0(freshAt!) - gap / 2 - bw / 2) -
              4
            }
            y={20}
            fontSize="9"
            textAnchor="end"
            fill={DC.fresh}
            fontFamily="DM Mono, monospace"
          >
            NEW
          </text>
        </g>
      )}
    </svg>
  );
}

function GeneralizedList() {
  const [src, setSrc] = useState("(a, (b, c), d, (e, (f)))");
  let g: GNode | null = null,
    error = "";
  try {
    g = parseGList(src);
    if (g.tag !== "list")
      throw new Error("A generalized list must start with (");
  } catch (e) {
    error = (e as Error).message;
  }
  return (
    <>
      <div className="ds-inputs">
        <label className="u1-select ds-wide">
          List
          <input
            className="u2-small-input ds-text"
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            aria-label="Generalized list"
          />
        </label>
        {["(a, b, c)", "(a, (b, c), d, (e, (f)))", "((a, b), ((c)))"].map(
          (x) => (
            <button
              key={x}
              className="btn btn-secondary"
              onClick={() => setSrc(x)}
            >
              {x}
            </button>
          ),
        )}
      </div>
      {g && g.tag === "list" ? (
        <>
          <div className="ds-glist">
            <GRow items={g.items} />
          </div>
          <Explain
            title={gFormat(g)}
            text="Each node has a tag: 0 means the node holds an atom, 1 means its data field points down to a sublist. A list can therefore contain lists, like nested parentheses."
          />
          <Stats
            items={[
              {
                label: "LENGTH",
                value: gLength(g),
                note: "elements at the top level",
              },
              { label: "DEPTH", value: gDepth(g), note: "levels of nesting" },
              { label: "ATOMS", value: gAtoms(g) },
            ]}
          />
        </>
      ) : (
        <Explain title="Cannot read that list" text={error} />
      )}
    </>
  );
}

function GRow({ items }: { items: GNode[] }) {
  return (
    <div className="ds-grow">
      <div className="ds-grow-nodes">
        {items.map((it, i) => (
          <div key={i} className="ds-gnode-wrap">
            <span className={`ds-gnode ${it.tag}`}>
              <i>{it.tag === "atom" ? 0 : 1}</i>
              <b>{it.tag === "atom" ? it.value : "↓"}</b>
              <em>{i < items.length - 1 ? "→" : "∅"}</em>
            </span>
            {it.tag === "list" && (
              <div className="ds-gsub">
                {it.items.length ? (
                  <GRow items={it.items} />
                ) : (
                  <span className="ds-gnode empty">( )</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ======================= Polynomials ======================= */

function TermList({
  terms,
  hi,
  label,
  touched,
}: {
  terms: Term[];
  hi?: number;
  label: string;
  touched?: number;
}) {
  return (
    <div className="ds-terms">
      <small className="ds-label">{label}</small>
      <div>
        {terms.map((t, i) => (
          <span
            key={`${t.e}-${i}`}
            className={`ds-term ${i === hi ? "hi" : ""} ${i === touched ? "fresh" : ""}`}
          >
            <b>{t.c}</b>
            <i>x^{t.e}</i>
            <em>{i < terms.length - 1 ? "→" : "∅"}</em>
          </span>
        ))}
        {!terms.length && <span className="ds-term empty">empty</span>}
      </div>
    </div>
  );
}

export function PolynomialExplorer({ onSteps }: StepProps) {
  const [mode, setMode] = useState<"add" | "multiply">("add");
  const [ps, setPs] = useState("5x^4 + 3x^2 - 2x + 7");
  const [qs, setQs] = useState("2x^3 - 3x^2 + 4");
  const P = useMemo(() => parsePoly(ps), [ps]);
  const Q = useMemo(() => parsePoly(qs), [qs]);
  const frames = useMemo(
    () => (mode === "add" ? addPolyFrames(P, Q) : multiplyPolyFrames(P, Q)),
    [mode, P, Q],
  );
  const p = usePlayer(frames.length, `${mode}-${ps}-${qs}`, onSteps);
  const f = frames[p.step];
  return (
    <Panel
      kicker="UNIT II · POLYNOMIAL ARITHMETIC"
      title="Polynomials as lists of terms"
      intro="Each node holds a coefficient and an exponent, in decreasing order of exponent. Addition walks both lists once, like merging; multiplication pairs every term with every other."
      icon={<Sigma size={19} />}
    >
      <div className="u1-controls">
        <Tabs
          value={mode}
          onChange={setMode}
          options={[
            { id: "add", label: "P + Q" },
            { id: "multiply", label: "P × Q" },
          ]}
        />
      </div>
      <div className="ds-inputs">
        <label className="u1-select ds-wide">
          P(x)
          <input
            className="u2-small-input ds-text"
            value={ps}
            onChange={(e) => setPs(e.target.value)}
          />
        </label>
        <label className="u1-select ds-wide">
          Q(x)
          <input
            className="u2-small-input ds-text"
            value={qs}
            onChange={(e) => setQs(e.target.value)}
          />
        </label>
      </div>
      <TermList terms={P} hi={f.p} label={`P = ${formatPoly(P)}`} />
      <TermList terms={Q} hi={f.q} label={`Q = ${formatPoly(Q)}`} />
      <TermList
        terms={f.result}
        touched={f.touched}
        label={`RESULT = ${formatPoly(f.result)}`}
      />
      <Explain title={f.title} text={f.text} />
      <PlayerBar p={p} />
      <Stats
        items={[
          { label: "TERMS IN P · Q", value: `${P.length} · ${Q.length}` },
          { label: "RESULT TERMS", value: f.result.length },
          {
            label: "COST",
            value: mode === "add" ? "Θ(m + n)" : "O(m·n·(m + n))",
            note:
              mode === "add"
                ? "one pass over each list"
                : "each product inserted in order",
          },
        ]}
      />
    </Panel>
  );
}
