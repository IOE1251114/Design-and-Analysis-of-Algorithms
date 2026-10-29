import { useMemo, useState } from "react";
import { Crown, Repeat } from "lucide-react";
import {
  factorialFrames,
  fibTree,
  queensFrames,
} from "../../../domain/ds/recursion";
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

/* ======================= Recursion: call stack and recursion tree ======================= */

export function RecursionExplorer({ onSteps }: StepProps) {
  const [tab, setTab] = useState<"stack" | "tree">("stack");
  const [n, setN] = useState(5);
  const [fn, setFn] = useState(5);
  const stackFrames = useMemo(() => factorialFrames(n), [n]);
  const tree = useMemo(() => fibTree(fn), [fn]);
  const total = tab === "stack" ? stackFrames.length : tree.length;
  const p = usePlayer(total, `${tab}-${n}-${fn}`, onSteps);
  return (
    <Panel
      kicker="UNIT II · RECURSION"
      title="A function that calls itself"
      intro="Every call that cannot finish yet waits on the call stack. Watch the stack grow to the base case and unwind, then see how a recursion tree can repeat work."
      icon={<Repeat size={19} />}
    >
      <div className="u1-controls">
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { id: "stack", label: "Call stack: n!" },
            { id: "tree", label: "Recursion tree: Fibonacci" },
          ]}
        />
        {tab === "stack" ? (
          <label className="u1-select ds-range">
            n = {n}
            <input
              type="range"
              min={0}
              max={8}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
            />
          </label>
        ) : (
          <label className="u1-select ds-range">
            n = {fn}
            <input
              type="range"
              min={2}
              max={7}
              value={fn}
              onChange={(e) => setFn(Number(e.target.value))}
            />
          </label>
        )}
      </div>
      {tab === "stack" ? (
        <CallStack n={n} step={p.step} frames={stackFrames} />
      ) : (
        <FibTree nodes={tree} step={p.step} />
      )}
      <PlayerBar p={p} />
    </Panel>
  );
}

function CallStack({
  frames,
  step,
  n,
}: {
  frames: ReturnType<typeof factorialFrames>;
  step: number;
  n: number;
}) {
  const f = frames[step];
  return (
    <>
      <div className="ds-callstack-wrap">
        <div className="ds-code-block">
          <code>{"fact(n):"}</code>
          <code className={f.phase === "base" ? "on" : ""}>
            {"  if n ≤ 1: return 1        ← base case"}
          </code>
          <code
            className={
              f.phase === "call" ? "on" : f.phase === "return" ? "ret" : ""
            }
          >
            {"  return n × fact(n − 1)    ← recursive case"}
          </code>
        </div>
        <div className="ds-callstack" aria-label="Call stack, top first">
          <small className="ds-label">CALL STACK (top first)</small>
          {[...f.stack].reverse().map((s, i) => (
            <div key={s} className={`ds-frame ${i === 0 ? "top" : ""}`}>
              {s}
              <span>
                {i === 0
                  ? f.phase === "base"
                    ? "base case"
                    : "running"
                  : "waiting"}
              </span>
            </div>
          ))}
          {!f.stack.length && (
            <div className="ds-frame empty">
              empty — the result is {f.returned}
            </div>
          )}
        </div>
      </div>
      <Explain title={f.title} text={f.text} />
      <Stats
        items={[
          {
            label: "STACK DEPTH NOW",
            value: f.stack.length,
            note: `max ${n === 0 ? 1 : n} frames`,
          },
          { label: "LAST RETURNED", value: f.returned ?? "—" },
          { label: "SPACE", value: "Θ(n)", note: "one frame per pending call" },
        ]}
      />
    </>
  );
}

function FibTree({
  nodes,
  step,
}: {
  nodes: ReturnType<typeof fibTree>;
  step: number;
}) {
  // Lay leaves out left to right in call order; parents sit above their children.
  const pos = new Map<number, { x: number; y: number }>();
  let leaf = 0;
  const kids = (id: number) => nodes.filter((m) => m.parent === id);
  const place = (id: number): number => {
    const k = kids(id);
    const node = nodes[id];
    const x = k.length
      ? k.map((c) => place(c.id)).reduce((a, b) => a + b, 0) / k.length
      : leaf++;
    pos.set(id, { x, y: node.depth });
    return x;
  };
  place(0);
  const depth = Math.max(...nodes.map((m) => m.depth)) + 1;
  const dx = 34,
    dy = 52,
    W = Math.max(leaf * dx + 40, 240),
    H = depth * dy + 10;
  const X = (x: number) => 20 + x * dx + dx / 2,
    Y = (d: number) => 22 + d * dy;
  const shown = nodes.filter((m) => m.order <= step);
  const cur = nodes.find((m) => m.order === step)!;
  const repeats = shown.filter((m) => m.repeat).length;
  return (
    <>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="u1-svg"
        style={{ maxWidth: Math.min(900, W * 1.4) }}
        role="img"
        aria-label="Fibonacci recursion tree"
      >
        {shown
          .filter((m) => m.parent !== null)
          .map((m) => {
            const a = pos.get(m.parent!)!,
              b = pos.get(m.id)!;
            return (
              <line
                key={`e${m.id}`}
                x1={X(a.x)}
                y1={Y(a.y)}
                x2={X(b.x)}
                y2={Y(b.y)}
                stroke={DC.edge}
                strokeWidth={1.3}
              />
            );
          })}
        {shown.map((m) => {
          const q = pos.get(m.id)!;
          return (
            <g key={m.id}>
              <circle
                cx={X(q.x)}
                cy={Y(q.y)}
                r={13}
                fill={m.repeat ? "#3a1c27" : DC.node}
                stroke={
                  m.id === cur.id ? DC.active : m.repeat ? DC.bad : DC.stroke
                }
                strokeWidth={m.id === cur.id ? 3 : 1.4}
              />
              <text
                x={X(q.x)}
                y={Y(q.y) + 4}
                fontSize="10"
                textAnchor="middle"
                fill={DC.text}
              >
                {m.n}
              </text>
            </g>
          );
        })}
      </svg>
      <Explain
        title={`Call ${cur.order + 1}: fib(${cur.n})${cur.repeat ? " — computed before!" : ""}`}
        text={
          cur.repeat
            ? `fib(${cur.n}) was already worked out earlier in the tree, but plain recursion recomputes it anyway. Rose nodes are repeated work.`
            : cur.n < 2
              ? `Base case: fib(${cur.n}) = ${cur.n}.`
              : `fib(${cur.n}) = fib(${cur.n - 1}) + fib(${cur.n - 2}): two recursive calls.`
        }
      />
      <Stats
        items={[
          {
            label: "CALLS SO FAR",
            value: shown.length,
            note: `${nodes.length} in total`,
          },
          { label: "REPEATED CALLS", value: repeats, note: "rose nodes" },
          {
            label: "DISTINCT SUBPROBLEMS",
            value: nodes[0].n + 1,
            note: "storing answers would need only these",
          },
        ]}
      />
    </>
  );
}

/* ======================= Backtracking: N-Queens ======================= */

export function BacktrackingExplorer({ onSteps }: StepProps) {
  const [n, setN] = useState(5);
  const frames = useMemo(() => queensFrames(n), [n]);
  const p = usePlayer(frames.length, n, onSteps);
  const f = frames[p.step];
  const upto = frames.slice(0, p.step + 1);
  return (
    <Panel
      kicker="UNIT II · BACKTRACKING"
      title="Try, check, and undo"
      intro="Place one queen per row. If a square is attacked, skip it; if a row has no safe square, go back and move the queen above."
      icon={<Crown size={19} />}
    >
      <div className="u1-controls">
        <label className="u1-select ds-range">
          Board {n} × {n}
          <input
            type="range"
            min={4}
            max={7}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
          />
        </label>
      </div>
      <div
        className="ds-board"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(30px, 46px))` }}
        role="img"
        aria-label={`Chess board with ${f.queens.length} queens`}
      >
        {Array.from({ length: n * n }, (_, k) => {
          const r = Math.floor(k / n),
            c = k % n;
          const queen = f.queens[r] === c;
          const tryHere = f.try && f.try[0] === r && f.try[1] === c;
          const attacker =
            f.attackedBy && f.attackedBy[0] === r && f.attackedBy[1] === c;
          return (
            <span
              key={k}
              className={`${(r + c) % 2 ? "dark" : ""} ${queen ? "queen" : ""} ${tryHere ? (f.action === "conflict" ? "conflict" : "undo") : ""} ${attacker ? "attacker" : ""} ${f.action === "solution" && queen ? "solved" : ""}`}
            >
              {queen
                ? "♛"
                : tryHere
                  ? f.action === "conflict"
                    ? "✕"
                    : "↶"
                  : ""}
            </span>
          );
        })}
      </div>
      <Explain title={f.title} text={f.text} />
      <PlayerBar p={p} />
      <Stats
        items={[
          {
            label: "PLACEMENTS",
            value: upto.filter((x) => x.action === "place").length,
          },
          {
            label: "PRUNED SQUARES",
            value: upto.filter((x) => x.action === "conflict").length,
            note: "never explored further",
          },
          {
            label: "BACKTRACKS",
            value: upto.filter((x) => x.action === "backtrack").length,
          },
        ]}
      />
    </Panel>
  );
}
