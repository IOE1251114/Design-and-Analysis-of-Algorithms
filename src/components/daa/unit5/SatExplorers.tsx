import { useEffect, useMemo, useRef, useState } from "react";
import { CircleHelp, Shuffle, ToggleRight } from "lucide-react";
import {
  bruteForceSAT,
  clauseState,
  dpll,
  litVal,
  parseCNF,
  satPresets,
  satToIS,
  type CNF,
  type DNode,
} from "../../../domain/daa/unit5/sat";
import { hexGraph } from "../../../domain/daa/unit3/graphs";
import { Legend, PlayerBar, SERIES, Tabs, usePlayer } from "../unit1/shared";
import { ECOL, GraphView, VCOL } from "../unit3/GraphView";

/** The formula as clause chips: green literal = true, red = false, plain = unassigned. */
export function FormulaView({
  cnf,
  assign,
}: {
  cnf: CNF;
  assign: (boolean | null)[];
}) {
  return (
    <div className="u5-formula">
      {cnf.clauses.map((c, i) => {
        const st = clauseState(c, assign);
        return (
          <span key={i} className={`cl ${st}`}>
            <small>C{i + 1}</small>
            {c.map((l, k) => {
              const v = litVal(l, assign);
              return (
                <span key={k} className="lit">
                  {k > 0 && <em>∨</em>}
                  <b className={v === null ? "" : v ? "t" : "f"}>
                    {l.neg ? "¬" : ""}
                    {cnf.vars[l.v]}
                  </b>
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
}

/* ---------- SAT ---------- */
export function SATExplorer({ onSteps }: { onSteps?: (k: number) => void }) {
  const [text, setText] = useState(satPresets.small.text);
  const [mode, setMode] = useState<"check" | "brute" | "dpll">("check");
  const parsed = parseCNF(text);
  const cnf = parsed.cnf ?? parseCNF(satPresets.small.text).cnf!;
  const sig =
    cnf.clauses
      .map((c) => c.map((l) => `${l.neg ? "-" : ""}${l.v}`).join(","))
      .join("|") + cnf.vars.join();
  const brute = useMemo(() => bruteForceSAT(cnf), [sig]);
  const search = useMemo(() => dpll(cnf), [sig]);
  const [cert, setCert] = useState<Record<string, boolean>>({});
  const certA = cnf.vars.map((v) => cert[v] ?? true);
  const total =
    mode === "brute"
      ? brute.frames.length
      : mode === "dpll"
        ? search.frames.length
        : 1;
  const p = usePlayer(total, `${sig}-${mode}`, onSteps);
  const bf = brute.frames[Math.min(p.step, brute.frames.length - 1)],
    df = search.frames[Math.min(p.step, search.frames.length - 1)];
  const assign: (boolean | null)[] =
    mode === "check" ? certA : mode === "brute" ? bf.assign : df.assign;
  const states = cnf.clauses.map((c) => clauseState(c, assign));
  const ok = states.every((s) => s === "sat");
  const presetId =
    Object.entries(satPresets).find(([, v]) => v.text === text)?.[0] ?? "";
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="kicker">BOOLEAN SATISFIABILITY</span>
          <h2>Can every clause be made true at once?</h2>
          <p>
            A CNF formula is an AND of clauses, each an OR of literals (a
            variable or its negation). SAT asks whether some true/false
            assignment satisfies every clause. Checking one assignment is fast;
            finding one may need exponential search. SAT was the first problem
            proved NP-complete.
          </p>
        </div>
        <span className="panel-icon">
          <ToggleRight size={19} />
        </span>
      </div>
      <div className="u1-controls">
        <Tabs
          value={presetId}
          onChange={(v) => setText(satPresets[v].text)}
          options={Object.entries(satPresets).map(([k, v]) => ({
            id: k,
            label: v.label,
          }))}
        />
      </div>
      <div className="u2-input">
        <label>
          Formula (use ∨ or |, ∧ or &amp;, ¬ or ~; up to 6 variables and 10
          clauses)
          <input value={text} onChange={(e) => setText(e.target.value)} />
        </label>
      </div>
      {parsed.error && (
        <p className="u5-error">
          {parsed.error} Showing the first preset instead.
        </p>
      )}
      <Tabs
        value={mode}
        onChange={setMode}
        options={[
          { id: "check", label: "Check a certificate" },
          { id: "brute", label: "Brute force: all 2ⁿ rows" },
          { id: "dpll", label: "DPLL: backtracking search" },
        ]}
      />
      <Legend
        items={[
          { id: "t", label: "Literal true", color: SERIES[2] },
          { id: "f", label: "Literal false", color: SERIES[5] },
          {
            id: "s",
            label: "Clause satisfied (green border)",
            color: "#1aab80",
          },
          { id: "u", label: "Clause false (red border)", color: "#de657a" },
        ]}
      />
      <FormulaView cnf={cnf} assign={assign} />
      {mode === "check" && (
        <>
          <div className="variable-controls">
            {cnf.vars.map((v, i) => (
              <button
                key={v}
                className={`variable-card ${certA[i] ? "var-true" : ""}`}
                onClick={() => setCert((c) => ({ ...c, [v]: !certA[i] }))}
              >
                <small>VARIABLE {v}</small>
                <strong>{certA[i] ? "TRUE" : "FALSE"}</strong>
                <span>Click to toggle</span>
              </button>
            ))}
          </div>
          <div className={`sat-result ${ok ? "sat-yes" : "sat-no"}`}>
            <strong>
              {ok
                ? "Certificate accepted: every clause is true"
                : `Rejected: clause ${states.indexOf("unsat") + 1} is false`}
            </strong>
            <span>
              The verifier looks at each of the {cnf.clauses.flat().length}{" "}
              literals once: O(size of the formula). That is why SAT ∈ NP.
            </span>
          </div>
        </>
      )}
      {mode === "brute" && (
        <>
          <TruthTable cnf={cnf} frames={brute.frames} step={p.step} />
          <div className="stage-explanation">
            <strong>{bf.title}</strong>
            <p>{bf.text}</p>
          </div>
          <PlayerBar p={p} />
        </>
      )}
      {mode === "dpll" && (
        <>
          <SearchTree nodes={df.nodes} cur={df.cur} />
          <div className="stage-explanation">
            <strong>{df.title}</strong>
            <p>{df.text}</p>
          </div>
          <PlayerBar p={p} />
        </>
      )}
      <span className="u1-label">WORK FOR THIS FORMULA</span>
      <div className="u1-strat-bars u5-bars">
        <div className={mode === "brute" ? "on" : ""}>
          <span>Brute force: assignments tried</span>
          <i>
            <b style={{ width: "100%", background: SERIES[3] }} />
          </i>
          <em>
            {brute.rows} rows ({brute.count} satisfy)
          </em>
        </div>
        <div className={mode === "dpll" ? "on" : ""}>
          <span>DPLL: search-tree nodes</span>
          <i>
            <b
              style={{
                width: `${Math.min(100, (100 * search.nodes) / brute.rows)}%`,
                background: SERIES[0],
              }}
            />
          </i>
          <em>
            {search.nodes} ({search.decisions} guesses, {search.units} forced)
          </em>
        </div>
        <div className={mode === "check" ? "on" : ""}>
          <span>Verifier: literals read</span>
          <i>
            <b
              style={{
                width: `${Math.min(100, (100 * cnf.clauses.flat().length) / brute.rows)}%`,
                background: SERIES[2],
              }}
            />
          </i>
          <em>{cnf.clauses.flat().length}</em>
        </div>
      </div>
      <div className="callout">
        <CircleHelp size={16} />
        <p>
          Answer for this formula:{" "}
          <b>{search.sat ? "satisfiable" : "unsatisfiable"}</b>. DPLL prunes a
          branch as soon as one clause becomes false and follows forced (unit)
          assignments for free, so it is usually much faster than the truth
          table, but its worst case is still exponential. 2-SAT is in P; 3-SAT
          is already NP-complete.
        </p>
      </div>
    </section>
  );
}
function TruthTable({
  cnf,
  frames,
  step,
}: {
  cnf: CNF;
  frames: ReturnType<typeof bruteForceSAT>["frames"];
  step: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current,
      row = el?.querySelector<HTMLElement>("tr.cur");
    if (el && row)
      el.scrollTop = Math.max(0, row.offsetTop - el.clientHeight / 2);
  }, [step]);
  return (
    <div className="u5-tt" ref={box}>
      <table className="u1-table">
        <thead>
          <tr>
            <th>#</th>
            {cnf.vars.map((v) => (
              <th key={v}>{v}</th>
            ))}
            {cnf.clauses.map((_, i) => (
              <th key={i}>C{i + 1}</th>
            ))}
            <th>φ</th>
          </tr>
        </thead>
        <tbody>
          {frames.map((f, r) => {
            const seen = r <= step;
            return (
              <tr
                key={r}
                className={`${r === step ? "cur" : ""} ${seen && f.ok ? "yes" : ""}`}
              >
                <td>{r + 1}</td>
                {f.assign.map((a, i) => (
                  <td key={i}>{a ? "T" : "F"}</td>
                ))}
                {f.states.map((s, i) => (
                  <td
                    key={i}
                    className={seen ? (s === "sat" ? "ok" : "no") : ""}
                  >
                    {seen ? (s === "sat" ? "✓" : "✗") : ""}
                  </td>
                ))}
                <td className={seen ? (f.ok ? "ok" : "no") : ""}>
                  {seen ? (f.ok ? "T" : "F") : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
function SearchTree({ nodes, cur }: { nodes: DNode[]; cur: number }) {
  const kids = new Map<number, number[]>();
  nodes.forEach((n) => {
    if (n.parent !== null)
      kids.set(n.parent, [...(kids.get(n.parent) ?? []), n.id]);
  });
  const pos = new Map<number, { x: number; y: number }>();
  let slot = 0;
  const lay = (id: number, d: number): number => {
    const ch = kids.get(id) ?? [];
    const x = ch.length
      ? ch
          .map((c) => lay(c, d + 1))
          .reduce((a, b, _, arr) => a + b / arr.length, 0)
      : 40 + slot++ * 62;
    pos.set(id, { x, y: 24 + d * 50 });
    return x;
  };
  lay(0, 0);
  const W = Math.max(320, slot * 62 + 20),
    H = Math.max(...[...pos.values()].map((p) => p.y)) + 30;
  const fill = (n: DNode) =>
    n.status === "conflict"
      ? "#2a1520"
      : n.status === "sat"
        ? "#10302a"
        : "#13273a";
  const stroke = (n: DNode) =>
    n.id === cur
      ? "#f4c56a"
      : n.status === "conflict"
        ? SERIES[5]
        : n.status === "sat"
          ? SERIES[2]
          : n.kind === "unit"
            ? SERIES[1]
            : SERIES[0];
  return (
    <>
      <Legend
        items={[
          { id: "g", label: "Guess (branch)", color: SERIES[0] },
          {
            id: "u",
            label: "Forced by a unit clause",
            color: SERIES[1],
            dash: true,
          },
          { id: "c", label: "Conflict", color: SERIES[5] },
          { id: "s", label: "Satisfied", color: SERIES[2] },
        ]}
      />
      <div className="u1-tree-scroll">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W > 700 ? W : undefined}
          className="u1-svg"
          style={W > 700 ? undefined : { maxWidth: Math.min(760, W * 1.4) }}
          role="img"
          aria-label="DPLL search tree"
        >
          {nodes
            .filter((n) => n.parent !== null)
            .map((n) => {
              const a = pos.get(n.parent!)!,
                b = pos.get(n.id)!;
              return (
                <line
                  key={`e${n.id}`}
                  x1={a.x}
                  y1={a.y + 13}
                  x2={b.x}
                  y2={b.y - 13}
                  stroke="#2f4560"
                  strokeWidth={1.4}
                />
              );
            })}
          {nodes.map((n) => {
            const q = pos.get(n.id)!;
            return (
              <g key={n.id}>
                <rect
                  x={q.x - 27}
                  y={q.y - 13}
                  width={54}
                  height={26}
                  rx={n.kind === "root" ? 13 : 6}
                  fill={fill(n)}
                  stroke={stroke(n)}
                  strokeWidth={n.id === cur ? 2.6 : 1.4}
                  strokeDasharray={n.kind === "unit" ? "4 2" : undefined}
                />
                <text
                  x={q.x}
                  y={q.y + 4}
                  fontSize="10.5"
                  textAnchor="middle"
                  fill="#f0f8ff"
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </>
  );
}

/* ---------- Reductions: CNF-SAT ≤p INDEPENDENT-SET, and IS ↔ VC ↔ CLIQUE ---------- */
export function ReductionExplorer({
  onSteps,
}: {
  onSteps?: (k: number) => void;
}) {
  const [pid, setPid] = useState("small");
  const cnf = parseCNF(satPresets[pid].text).cnf!;
  const red = useMemo(() => satToIS(cnf), [pid]);
  const p = usePlayer(red.frames.length, pid, onSteps);
  const f = red.frames[p.step];
  const nConf = red.kinds.filter((k) => k === "conflict").length;
  return (
    <>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="kicker">POLYNOMIAL-TIME REDUCTION</span>
            <h2>Turn a formula into a graph: CNF-SAT ≤p INDEPENDENT-SET</h2>
            <p>
              A reduction f maps every instance x of problem A to an instance
              f(x) of problem B, in polynomial time, so that x is a YES instance
              exactly when f(x) is. Here the formula becomes a graph, and
              “satisfiable?” becomes “is there an independent set (no two
              vertices adjacent) of size k = number of clauses?”.
            </p>
          </div>
          <span className="panel-icon">
            <Shuffle size={19} />
          </span>
        </div>
        <Tabs
          value={pid}
          onChange={setPid}
          options={Object.entries(satPresets).map(([k, v]) => ({
            id: k,
            label: v.label,
          }))}
        />
        <FormulaView cnf={cnf} assign={cnf.vars.map(() => null)} />
        <Legend
          items={[
            { id: "c", label: "Edge inside a clause", color: ECOL.tree.c },
            {
              id: "x",
              label: "Conflict edge x — ¬x",
              color: ECOL.back.c,
              dash: true,
            },
            { id: "a", label: "Clause being built", color: VCOL.active.stroke },
            {
              id: "s",
              label: "Chosen independent set",
              color: VCOL.done.stroke,
            },
          ]}
        />
        <div className="u3-canvas u1-gap">
          <GraphView g={red.g} f={{ vstate: f.vstate, estate: f.estate }} />
        </div>
        <div className="stage-explanation">
          <strong>{f.title}</strong>
          <p>{f.text}</p>
        </div>
        <PlayerBar p={p} />
        <div className="u2-stats">
          <div>
            <small>VERTICES</small>
            <strong>{red.g.labels.length}</strong>
            <span>one per literal occurrence</span>
          </div>
          <div>
            <small>EDGES</small>
            <strong>{red.g.edges.length}</strong>
            <span>
              {red.g.edges.length - nConf} inside clauses + {nConf} conflicts
            </span>
          </div>
          <div>
            <small>TARGET k</small>
            <strong>{red.k}</strong>
            <span>largest set found: {red.best.length}</span>
          </div>
          <div>
            <small>ANSWER (BOTH SIDES)</small>
            <strong>{red.isSat ? "YES" : "NO"}</strong>
          </div>
        </div>
        <div className="callout">
          <CircleHelp size={16} />
          <p>
            The construction is polynomial: for L literals it builds L vertices
            and at most L² edges. Correctness both ways: a satisfying assignment
            gives one true literal per clause, and these are never x with ¬x, so
            they form an independent set of size k. Conversely, an independent
            set of size k must take exactly one literal from each clause and
            never both x and ¬x, which defines a satisfying assignment.
          </p>
        </div>
      </section>
      <TriangleOfReductions />
    </>
  );
}

const G6 = hexGraph(
  [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 0],
    [0, 3],
  ],
  false,
);
const has6 = (a: number, b: number) =>
  G6.edges.some((e) => (e.u === a && e.v === b) || (e.u === b && e.v === a));
const comp6 = {
  ...G6,
  edges: [0, 1, 2, 3, 4, 5].flatMap((a) =>
    [0, 1, 2, 3, 4, 5]
      .filter((b) => b > a && !has6(a, b))
      .map((b) => ({ u: a, v: b, w: 1 })),
  ),
};
/** Three views of one choice of vertices S: independent in G ⇔ V − S covers G ⇔ S is a clique in the complement. */
function TriangleOfReductions() {
  const [S, setS] = useState<number[]>([1, 3, 5]);
  const toggle = (i: number) =>
    setS((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i].sort()));
  const indep = S.every((a) => S.every((b) => a === b || !has6(a, b)));
  const cover = G6.edges.every((e) => !S.includes(e.u) || !S.includes(e.v));
  const clique = S.every((a) => S.every((b) => a === b || !has6(a, b)));
  const k = (u: number, v: number) => `${Math.min(u, v)}-${Math.max(u, v)}`;
  const vs = (pick: (i: number) => boolean) =>
    G6.labels.map((_, i) =>
      pick(i) ? ("done" as const) : ("unseen" as const),
    );
  const badG = Object.fromEntries(
    G6.edges
      .filter((e) => S.includes(e.u) && S.includes(e.v))
      .map((e) => [k(e.u, e.v), "bridge" as const]),
  );
  const coverE = Object.fromEntries(
    G6.edges.map((e) => [
      k(e.u, e.v),
      !S.includes(e.u) || !S.includes(e.v)
        ? ("tree" as const)
        : ("bridge" as const),
    ]),
  );
  const cliqueE = Object.fromEntries(
    comp6.edges
      .filter((e) => S.includes(e.u) && S.includes(e.v))
      .map((e) => [k(e.u, e.v), "tree" as const]),
  );
  const Tag = ({ ok, yes, no }: { ok: boolean; yes: string; no: string }) => (
    <span className={`u5-tag ${ok ? "ok" : "no"}`}>{ok ? yes : no}</span>
  );
  return (
    <section className="panel u1-gap">
      <div className="panel-heading">
        <div>
          <span className="kicker">THREE PROBLEMS, ONE ANSWER</span>
          <h2>Independent set ↔ vertex cover ↔ clique</h2>
          <p>
            Click vertices in any picture to change the set S. S is independent
            in G exactly when the other vertices V − S touch every edge (a
            vertex cover), and exactly when S is a clique in the complement
            graph Ḡ. So each problem reduces to the others with a trivial
            transformation.
          </p>
        </div>
      </div>
      <Legend
        items={[
          { id: "s", label: "Vertices in the set", color: VCOL.done.stroke },
          { id: "g", label: "Good edge", color: ECOL.tree.c },
          {
            id: "b",
            label: "Edge breaking the property",
            color: ECOL.bridge.c,
          },
        ]}
      />
      <div className="u5-three">
        <div>
          <small>G: S = {`{${S.join(", ")}}`} independent?</small>
          <GraphView
            g={G6}
            f={{ vstate: vs((i) => S.includes(i)), estate: badG }}
            onNode={toggle}
            view="170 12 300 326"
          />
          <Tag
            ok={indep}
            yes={`Yes, size ${S.length}`}
            no="No: red edge inside S"
          />
        </div>
        <div>
          <small>
            G: V − S ={" "}
            {`{${G6.labels.filter((_, i) => !S.includes(i)).join(", ")}}`} a
            vertex cover?
          </small>
          <GraphView
            g={G6}
            f={{ vstate: vs((i) => !S.includes(i)), estate: coverE }}
            onNode={toggle}
            view="170 12 300 326"
          />
          <Tag
            ok={cover}
            yes={`Yes, size ${6 - S.length}`}
            no="No: red edge uncovered"
          />
        </div>
        <div>
          <small>Ḡ (complement): S a clique?</small>
          <GraphView
            g={comp6}
            f={{ vstate: vs((i) => S.includes(i)), estate: cliqueE }}
            onNode={toggle}
            view="170 12 300 326"
          />
          <Tag
            ok={clique}
            yes={`Yes, size ${S.length}`}
            no="No: a pair in S is not joined"
          />
        </div>
      </div>
      <div className="callout">
        <CircleHelp size={16} />
        <p>
          Reductions: IS(G, k) ⇔ VC(G, |V| − k) ⇔ CLIQUE(Ḡ, k). Building Ḡ takes
          O(V²) time, so all three are polynomially equivalent: one has a
          polynomial algorithm exactly when all of them do.
        </p>
      </div>
    </section>
  );
}
