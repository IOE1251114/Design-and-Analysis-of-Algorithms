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
import { CircleHelp, GitFork, Scale3d, SearchCheck } from "lucide-react";
import {
  growthFns,
  largestN,
  problemCatalog,
  redEdges,
  redNodes,
  spread,
  subsetSumSearch,
  verifySubset,
  type PClass,
} from "../../../domain/daa/unit5/np";
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

export const CLS: Record<PClass, { label: string; color: string }> = {
  P: { label: "P", color: SERIES[2] },
  NP: { label: "NP (status unknown)", color: SERIES[0] },
  NPC: { label: "NP-complete", color: SERIES[1] },
  NPH: { label: "NP-hard, not in NP", color: SERIES[4] },
};

/* ---------- P vs NP: solving vs verifying ---------- */
const ssPresets: Record<
  string,
  { label: string; nums: number[]; target: number }
> = {
  yes: { label: "6 numbers, target 9", nums: [3, 34, 4, 12, 5, 2], target: 9 },
  big: {
    label: "8 numbers, target 53",
    nums: [11, 6, 23, 17, 2, 31, 14, 8],
    target: 53,
  },
  no: { label: "NO instance", nums: [2, 4, 6, 8, 10], target: 15 },
};
export function PvsNPExplorer({ onSteps }: { onSteps?: (k: number) => void }) {
  const [pid, setPid] = useState("yes");
  const [mode, setMode] = useState<"solve" | "verify">("solve");
  const P = ssPresets[pid],
    n = P.nums.length;
  const [chosen, setChosen] = useState<number[]>([0, 2, 5]);
  const search = useMemo(() => subsetSumSearch(P.nums, P.target), [pid]);
  const verify = useMemo(
    () => verifySubset(P.nums, P.target, chosen),
    [pid, chosen.join()],
  );
  const total = mode === "solve" ? search.frames.length : verify.length;
  const p = usePlayer(total, `${pid}-${mode}-${chosen.join()}`, onSteps);
  const sf = search.frames[Math.min(p.step, search.frames.length - 1)],
    vf = verify[Math.min(p.step, verify.length - 1)];
  const inSet = (i: number) =>
    mode === "solve"
      ? sf.sum >= 0 && (sf.mask & (1 << i)) !== 0
      : chosen.includes(i);
  const chart = Array.from({ length: 25 }, (_, i) => {
    const m = i + 1,
      o: Record<string, number> = { n: m };
    growthFns.forEach((g) => {
      o[g.id] = g.f(m);
    });
    return o;
  });
  const budgets = [
    { label: "1 second", b: 1e9 },
    { label: "1 day", b: 8.64e13 },
    { label: "1 year", b: 3.15e16 },
  ];
  return (
    <>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="kicker">SOLVING VS VERIFYING</span>
            <h2>Finding an answer can be far harder than checking one</h2>
            <p>
              SUBSET-SUM: is there a subset of the numbers that adds up exactly
              to the target? Finding one may mean trying all 2ⁿ subsets.
              Checking a proposed subset (a <b>certificate</b>) takes one pass.
              Problems whose YES answers can be checked in polynomial time form
              the class <b>NP</b>.
            </p>
          </div>
          <span className="panel-icon">
            <SearchCheck size={19} />
          </span>
        </div>
        <div className="u1-controls">
          <Tabs
            value={pid}
            onChange={(v) => {
              setPid(v);
              setChosen(
                v === "yes" ? [0, 2, 5] : v === "big" ? [0, 2, 3, 4] : [0, 1],
              );
            }}
            options={Object.entries(ssPresets).map(([k, v]) => ({
              id: k,
              label: v.label,
            }))}
          />
          <Tabs
            value={mode}
            onChange={setMode}
            options={[
              { id: "solve", label: "Solve: search all subsets" },
              { id: "verify", label: "Verify: check one certificate" },
            ]}
          />
        </div>
        <div className="u5-nums">
          {P.nums.map((x, i) => (
            <button
              key={i}
              disabled={mode === "solve"}
              className={`${inSet(i) ? "on" : ""} ${mode === "verify" && vf.i === i ? "cur" : ""}`}
              onClick={() =>
                setChosen((c) =>
                  c.includes(i)
                    ? c.filter((j) => j !== i)
                    : [...c, i].sort((a, b) => a - b),
                )
              }
            >
              <b>{x}</b>
              <i>
                {mode === "solve" ? (sf.mask >> i) & 1 : inSet(i) ? "1" : "0"}
              </i>
            </button>
          ))}
          <span className="u5-target">
            target <b>{P.target}</b>
          </span>
        </div>
        {mode === "verify" && (
          <p className="u1-small">
            Click numbers to change the certificate, then step through the
            check.
          </p>
        )}
        <div className="u5-meter">
          <div>
            <small>
              {mode === "solve" ? "SUBSETS CHECKED" : "VERIFIER STEPS"}
            </small>
            <strong>
              {mode === "solve" ? sf.checked : Math.max(0, p.step)}
            </strong>
            <span>
              {mode === "solve"
                ? `of 2^${n} = ${2 ** n}`
                : `of ${verify.length - 1}: O(n)`}
            </span>
          </div>
          <div>
            <small>{mode === "solve" ? "CURRENT SUM" : "RUNNING SUM"}</small>
            <strong>
              {mode === "solve" ? (sf.sum < 0 ? "—" : sf.sum) : vf.running}
            </strong>
            <span>target {P.target}</span>
          </div>
          <div
            className={
              (mode === "solve" ? sf.found : vf.ok)
                ? "good"
                : (mode === "verify" && vf.done) ||
                    (mode === "solve" && p.step === p.last && !sf.found)
                  ? "bad"
                  : ""
            }
          >
            <small>ANSWER</small>
            <strong>
              {mode === "solve"
                ? sf.found
                  ? "YES"
                  : p.step === p.last
                    ? "NO"
                    : "…"
                : vf.done
                  ? vf.ok
                    ? "ACCEPT"
                    : "REJECT"
                  : "…"}
            </strong>
          </div>
        </div>
        {mode === "solve" && (
          <div className="u5-bits" title="Share of all subsets checked">
            <i style={{ width: `${(100 * sf.checked) / 2 ** n}%` }} />
          </div>
        )}
        <div className="stage-explanation">
          <strong>{mode === "solve" ? sf.title : vf.title}</strong>
          <p>{mode === "solve" ? sf.text : vf.text}</p>
        </div>
        <PlayerBar p={p} />
        <div className="callout">
          <CircleHelp size={16} />
          <p>
            <b>P</b> = decision problems <i>solvable</i> in polynomial time.{" "}
            <b>NP</b> = decision problems whose YES instances have a certificate{" "}
            <i>checkable</i> in polynomial time. Every problem in P is in NP
            (the verifier can ignore the certificate and solve). Whether P = NP
            is the most famous open question in computer science.
          </p>
        </div>
      </section>
      <section className="panel u1-gap">
        <div className="panel-heading">
          <div>
            <span className="kicker">WHY “POLYNOMIAL” IS THE LINE</span>
            <h2>Steps needed as n grows (log scale)</h2>
            <p>
              At 10⁹ simple steps per second, polynomial algorithms handle huge
              inputs. Exponential and factorial ones hit a wall at a few dozen
              items, and faster hardware barely moves it.
            </p>
          </div>
        </div>
        <Legend
          items={growthFns.map((g, i) => ({
            id: g.id,
            label: g.label,
            color: [SERIES[2], SERIES[0], SERIES[1], SERIES[5]][i],
          }))}
        />
        <div className="u1-chart" style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chart}
              margin={{ top: 10, right: 16, bottom: 6, left: 0 }}
            >
              <CartesianGrid {...grid} />
              <XAxis dataKey="n" {...axis} />
              <YAxis
                scale="log"
                domain={[1, 1e18]}
                allowDataOverflow
                ticks={[1, 1e3, 1e6, 1e9, 1e12, 1e15, 1e18]}
                {...axis}
                width={48}
                tickFormatter={compact}
              />
              <Tooltip
                {...tooltipStyle}
                labelFormatter={(v) => `n = ${v}`}
                formatter={(v: number, k: string) => [
                  v.toExponential(2),
                  growthFns.find((g) => g.id === k)?.label ?? k,
                ]}
              />
              <ReferenceLine
                y={1e9}
                stroke="#f4c56a"
                strokeDasharray="4 3"
                label={{
                  value: "10⁹ steps ≈ 1 second",
                  fill: "#e7d3a6",
                  fontSize: 10,
                  position: "insideTopLeft",
                }}
              />
              {growthFns.map((g, i) => (
                <Line
                  key={g.id}
                  dataKey={g.id}
                  stroke={[SERIES[2], SERIES[0], SERIES[1], SERIES[5]][i]}
                  strokeWidth={2.2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="u1-table-wrap u1-gap">
          <table className="u1-table">
            <thead>
              <tr>
                <th>Running time</th>
                {budgets.map((b) => (
                  <th key={b.label}>Largest n in {b.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {growthFns.map((g) => (
                <tr key={g.id}>
                  <td>{g.label}</td>
                  {budgets.map((b) => (
                    <td key={b.label}>{largestN(g.f, b.b).toLocaleString()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <ClassMap />
    </>
  );
}

/** Euler diagram of the classes; click a problem to see why it sits there. */
function ClassMap() {
  const [world, setWorld] = useState<"neq" | "eq">("neq");
  const [sel, setSel] = useState("sat");
  const col: Record<PClass, { x: number[]; y0: number; dy: number }> = {
    P: { x: [150], y0: 115, dy: 34 },
    NP: { x: [338], y0: 160, dy: 40 },
    NPC: { x: [487], y0: 99, dy: 31 },
    NPH: { x: [700], y0: 160, dy: 40 },
  };
  const placed = problemCatalog.map((pr) => {
    const list = problemCatalog.filter((q) => q.cls === pr.cls),
      k = list.indexOf(pr),
      c = col[pr.cls],
      cols = c.x.length;
    return { ...pr, x: c.x[k % cols], y: c.y0 + Math.floor(k / cols) * c.dy };
  });
  const info = problemCatalog.find((p) => p.id === sel)!;
  const eq = world === "eq";
  const chipColor = (c: PClass) =>
    eq && c !== "NPH" ? CLS.P.color : CLS[c].color;
  return (
    <section className="panel u1-gap">
      <div className="panel-heading">
        <div>
          <span className="kicker">THE MAP OF CLASSES</span>
          <h2>Where well-known problems sit</h2>
          <p>
            NP-complete problems are the hardest problems in NP: every NP
            problem reduces to each of them. NP-hard problems are at least that
            hard but need not be in NP at all. Click any problem.
          </p>
        </div>
        <span className="panel-icon">
          <Scale3d size={19} />
        </span>
      </div>
      <Tabs
        value={world}
        onChange={setWorld}
        options={[
          { id: "neq", label: "If P ≠ NP (widely believed)" },
          { id: "eq", label: "If P = NP" },
        ]}
      />
      <div className="u5-map">
        <svg
          viewBox="0 0 800 360"
          className="u1-svg"
          role="img"
          aria-label="Diagram of the classes P, NP, NP-complete and NP-hard"
        >
          <ellipse
            cx={612}
            cy={185}
            rx={182}
            ry={165}
            fill={`${CLS.NPH.color}1f`}
            stroke={CLS.NPH.color}
            strokeWidth={1.6}
          />
          <ellipse
            cx={290}
            cy={185}
            rx={265}
            ry={167}
            fill={`${CLS.NP.color}1c`}
            stroke={CLS.NP.color}
            strokeWidth={1.6}
          />
          {!eq && (
            <ellipse
              cx={150}
              cy={185}
              rx={102}
              ry={120}
              fill={`${CLS.P.color}26`}
              stroke={CLS.P.color}
              strokeWidth={1.6}
            />
          )}
          <text
            x={eq ? 70 : 140}
            y={eq ? 75 : 90}
            fontSize="12"
            fill={CLS.P.color}
            fontWeight={600}
          >
            {eq ? "P = NP" : "P"}
          </text>
          {!eq && (
            <text
              x={55}
              y={80}
              fontSize="12"
              fill={CLS.NP.color}
              fontWeight={600}
            >
              NP
            </text>
          )}
          <text
            x={700}
            y={58}
            fontSize="12"
            fill={CLS.NPH.color}
            fontWeight={600}
          >
            NP-hard
          </text>
          <text
            x={487}
            y={52}
            fontSize="11"
            fill={CLS.NPC.color}
            fontWeight={600}
            textAnchor="middle"
          >
            {eq ? "NP-complete (now also in P)" : "NP-complete = NP ∩ NP-hard"}
          </text>
          {placed.map((p) => {
            const w = p.name.length * 6.5 + 18,
              on = p.id === sel;
            return (
              <g
                key={p.id}
                onClick={() => setSel(p.id)}
                style={{ cursor: "pointer" }}
                role="button"
                aria-label={p.name}
              >
                <rect
                  x={p.x - w / 2}
                  y={p.y - 11}
                  width={w}
                  height={22}
                  rx={11}
                  fill={on ? chipColor(p.cls) : "#0b1420"}
                  stroke={chipColor(p.cls)}
                  strokeWidth={on ? 2 : 1.2}
                />
                <text
                  x={p.x}
                  y={p.y + 4}
                  fontSize="10.5"
                  textAnchor="middle"
                  fill={on ? "#06121b" : "#e2f2ff"}
                  fontWeight={on ? 600 : 400}
                >
                  {p.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="stage-explanation">
        <strong>
          {info.name}:{" "}
          {eq && info.cls !== "NPH"
            ? "in P (in this world)"
            : CLS[info.cls].label}
        </strong>
        <p>
          {info.why}
          {eq && (info.cls === "NPC" || info.cls === "NP")
            ? " If P = NP, a polynomial-time algorithm would exist for it."
            : ""}
        </p>
      </div>
      <div className="callout">
        <CircleHelp size={16} />
        <p>
          {eq
            ? "If any single NP-complete problem had a polynomial-time algorithm, every problem in NP would too, and the P, NP and NP-complete regions would merge (NP-hard problems outside NP, such as the halting problem, would stay hard)."
            : "Nobody has proved P ≠ NP. The evidence is practical: thousands of NP-complete problems, decades of effort, and no polynomial algorithm for any of them."}
        </p>
      </div>
    </section>
  );
}

/* ---------- NP-completeness: how hardness travels along reductions ---------- */
export function NPCExplorer({ onSteps }: { onSteps?: (k: number) => void }) {
  const [dir, setDir] = useState<"down" | "up">("down");
  const [start, setStart] = useState("sat");
  const [info, setInfo] = useState("clique");
  const layers = useMemo(() => spread(start, dir), [start, dir]);
  const p = usePlayer(layers.length, `${start}-${dir}`, onSteps);
  const lit = new Set(layers.slice(0, p.step + 1).flat());
  const color = dir === "down" ? SERIES[5] : SERIES[2];
  const node = (id: string) => redNodes.find((n) => n.id === id)!;
  const cur = layers[p.step];
  const collapse = dir === "up" && lit.has("np");
  const shown = node(info);
  return (
    <>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="kicker">NP-COMPLETENESS</span>
            <h2>A chain of reductions</h2>
            <p>
              An arrow A → B means A ≤p B: any instance of A can be turned, in
              polynomial time, into an instance of B with the same answer. So B
              is at least as hard as A. Cook and Levin showed every NP problem
              reduces to SAT; the rest of the tree follows from known
              reductions.
            </p>
          </div>
          <span className="panel-icon">
            <GitFork size={19} />
          </span>
        </div>
        <div className="u1-controls">
          <Tabs
            value={dir}
            onChange={(v) => {
              setDir(v);
              setStart(v === "down" ? "sat" : "tsp");
            }}
            options={[
              { id: "down", label: "Hardness flows down the arrows" },
              { id: "up", label: "A fast algorithm flows up" },
            ]}
          />
          <label className="u1-select">
            start from
            <select value={start} onChange={(e) => setStart(e.target.value)}>
              {redNodes
                .filter((n) => n.id !== "np")
                .map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
            </select>
          </label>
        </div>
        <Legend
          items={[
            {
              id: "a",
              label:
                dir === "down"
                  ? "Proved NP-hard"
                  : "Would be solvable in polynomial time",
              color,
            },
            { id: "b", label: "Reduction A ≤p B", color: "#4d6a84" },
          ]}
        />
        <div className="u5-tree">
          <svg
            viewBox="0 0 660 450"
            className="u1-svg"
            style={{ maxWidth: 640 }}
            role="img"
            aria-label="Reduction tree from SAT to other NP-complete problems"
          >
            <defs>
              <marker
                id="u5arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto"
              >
                <path d="M0,0 L10,5 L0,10 z" fill="#4d6a84" />
              </marker>
            </defs>
            {redEdges.map(([a, b]) => {
              const A = node(a),
                B = node(b),
                hot = lit.has(a) && lit.has(b);
              return (
                <line
                  key={a + b}
                  x1={A.x}
                  y1={A.y + 15}
                  x2={B.x}
                  y2={B.y - 17}
                  stroke={hot ? color : "#4d6a84"}
                  strokeWidth={hot ? 2.4 : 1.5}
                  markerEnd="url(#u5arrow)"
                />
              );
            })}
            {redNodes.map((n) => {
              const on = lit.has(n.id),
                now = cur.includes(n.id),
                w = n.name.length * 7.6 + 26;
              return (
                <g
                  key={n.id}
                  onClick={() => setInfo(n.id)}
                  style={{ cursor: "pointer" }}
                  role="button"
                  aria-label={n.name}
                >
                  <rect
                    x={n.x - w / 2}
                    y={n.y - 15}
                    width={w}
                    height={30}
                    rx={8}
                    fill={on ? `${color}33` : "#0f1b29"}
                    stroke={now ? "#f4c56a" : on ? color : "#2f4560"}
                    strokeWidth={now ? 2.6 : 1.5}
                  />
                  <text
                    x={n.x}
                    y={n.y + 4}
                    fontSize="11.5"
                    textAnchor="middle"
                    fill="#f0f8ff"
                    fontWeight={info === n.id ? 700 : 500}
                  >
                    {n.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="stage-explanation">
          <strong>
            {p.step === 0
              ? dir === "down"
                ? `${node(start).name} is NP-hard`
                : `Suppose ${node(start).name} had a polynomial-time algorithm`
              : `Step ${p.step}: ${cur.map((c) => node(c).name).join(", ")}`}
          </strong>
          <p>
            {dir === "down"
              ? p.step === 0
                ? "Follow the arrows: anything this problem reduces to inherits its hardness."
                : `${cur.map((c) => node(c).name).join(" and ")} ${cur.length > 1 ? "are" : "is"} at least as hard, so NP-hard; each is also in NP, so NP-complete.`
              : collapse
                ? "The chain reaches “any NP problem”: every problem in NP would be solvable in polynomial time, so P = NP."
                : p.step === 0
                  ? "Reverse the arrows: if B is easy and A ≤p B, then A is easy (transform, then run B’s algorithm)."
                  : `${cur.map((c) => node(c).name).join(" and ")} would also become polynomial.`}
          </p>
        </div>
        <PlayerBar p={p} />
        <div className="u5-info">
          <small>CLICK A BOX: HOW THIS REDUCTION WORKS</small>
          <strong>{shown.name}</strong>
          <p>{shown.how}</p>
        </div>
      </section>
      <section className="panel u1-gap">
        <div className="panel-heading">
          <div>
            <span className="kicker">THE PROOF RECIPE</span>
            <h2>How to prove a new problem X is NP-complete</h2>
            <p>
              Worked for CLIQUE: “does graph G contain k vertices that are all
              pairwise adjacent?”
            </p>
          </div>
        </div>
        <ol className="u5-recipe">
          <li>
            <b>Show X ∈ NP.</b>
            <span>
              Certificate: the k vertices. The verifier checks all k(k − 1)/2
              pairs are edges: O(k²) ⊆ polynomial.
            </span>
          </li>
          <li>
            <b>Pick a known NP-complete problem Y.</b>
            <span>
              Here Y = 3-SAT. Direction matters: reduce Y <i>to</i> X (Y ≤p X),
              never X to Y.
            </span>
          </li>
          <li>
            <b>Give a transformation f.</b>
            <span>
              One vertex per literal in each clause; join two literals if they
              are in different clauses and are not x and ¬x. Set k = number of
              clauses.
            </span>
          </li>
          <li>
            <b>Show f runs in polynomial time.</b>
            <span>
              For m clauses there are 3m vertices and O(m²) candidate edges.
            </span>
          </li>
          <li>
            <b>Prove: φ satisfiable ⇔ f(φ) has a k-clique.</b>
            <span>
              ⇒ choose one true literal per clause; they are pairwise
              compatible. ⇐ a k-clique has one literal per clause and never x
              with ¬x; set those literals true.
            </span>
          </li>
        </ol>
        <div className="callout">
          <CircleHelp size={16} />
          <p>
            NP-hard needs only steps 2–5. NP-complete = NP-hard <b>and</b> in
            NP, so step 1 is also required. The Reductions topic animates the
            closely related reduction CNF-SAT ≤p INDEPENDENT-SET.
          </p>
        </div>
      </section>
    </>
  );
}
