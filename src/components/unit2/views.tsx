import type { TNode, BNode } from "../../domain/unit2/trees";
import { SERIES } from "../unit1/shared";

/* Shared drawings for Unit 2. Colours carry a meaning that is always also named in a legend or label. */
export const C = {
  base: "#1d4f6e",
  region: "#1ea0ca",
  other: "#ce7b2c",
  pivot: "#9582db",
  done: "#1aab80",
  idle: "#2a3b50",
  compare: "#f4c56a",
  swap: "#ff8b9a",
};

export type BarState = "base" | "le" | "gt" | "pivot" | "done" | "idle";
const fill: Record<BarState, string> = {
  base: C.base,
  le: C.region,
  gt: C.other,
  pivot: C.pivot,
  done: C.done,
  idle: C.idle,
};

/** Array as bars. `ring` marks compared (gold) or swapped (rose) positions. */
export function ArrayBars({
  a,
  state,
  compare,
  swap,
  height = 170,
}: {
  a: number[];
  state: (i: number) => BarState;
  compare?: [number, number];
  swap?: [number, number];
  height?: number;
}) {
  const n = a.length,
    bw = 34,
    gap = 8,
    W = n * (bw + gap) + gap,
    top = 18,
    max = Math.max(...a, 1);
  return (
    <svg
      viewBox={`0 0 ${W} ${height + 34}`}
      className="u1-svg"
      style={{ maxWidth: Math.min(760, W * 1.6) }}
      role="img"
      aria-label={`Array: ${a.join(", ")}`}
    >
      {a.map((v, i) => {
        const x = gap + i * (bw + gap),
          h = Math.max(14, ((height - top) * v) / max),
          y = height - h;
        const ring = swap?.includes(i)
          ? C.swap
          : compare?.includes(i)
            ? C.compare
            : null;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={bw}
              height={h}
              rx={5}
              fill={fill[state(i)]}
              stroke={ring ?? "none"}
              strokeWidth={ring ? 3 : 0}
            />
            <text
              x={x + bw / 2}
              y={y - 5}
              fontSize="11"
              textAnchor="middle"
              fill="#e7f4ff"
            >
              {v}
            </text>
            <text
              x={x + bw / 2}
              y={height + 16}
              fontSize="9"
              textAnchor="middle"
              fill={ring ? "#f2d99d" : "#6d839c"}
            >
              {i}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Row of labelled cells (used by counting/radix/heap/hash views). */
export function Cells({
  label,
  values,
  hi,
  mark,
  dim,
  sub,
}: {
  label?: string;
  values: (string | number | null)[];
  hi?: number | null;
  mark?: number[];
  dim?: (i: number) => boolean;
  sub?: (i: number) => string;
}) {
  return (
    <div className="u2-cells">
      {label && <small>{label}</small>}
      <div>
        {values.map((v, i) => (
          <span
            key={i}
            className={`${i === hi ? "hi" : ""} ${mark?.includes(i) ? "mark" : ""} ${dim?.(i) ? "dim" : ""} ${v === null || v === "" ? "empty" : ""}`}
          >
            <b>{v ?? ""}</b>
            <i>{sub ? sub(i) : i}</i>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Binary trees ---------- */
type Placed = {
  key: number;
  x: number;
  y: number;
  node: TNode;
  parent?: { x: number; y: number };
};
function place(root: TNode | null) {
  const out: Placed[] = [];
  let idx = 0;
  const walk = (
    t: TNode | null,
    d: number,
    parent?: { x: number; y: number },
  ) => {
    if (!t) return;
    const me = { key: t.key, x: 0, y: d, node: t, parent };
    walk(t.left, d + 1, me);
    me.x = idx++;
    out.push(me);
    walk(t.right, d + 1, me);
  };
  walk(root, 0);
  return { out, count: idx, depth: Math.max(0, ...out.map((p) => p.y)) + 1 };
}
export function BinaryTree({
  root,
  visit,
  focus,
  mode = "plain",
}: {
  root: TNode | null;
  visit?: number;
  focus?: number[];
  mode?: "plain" | "avl" | "rb";
}) {
  if (!root)
    return (
      <div className="empty-state">
        <p>The tree is empty.</p>
      </div>
    );
  const { out, count, depth } = place(root);
  const dx = 46,
    dy = 64,
    pad = 28,
    W = Math.max(count * dx + pad * 2, 200),
    H = depth * dy + 20;
  const X = (i: number) => pad + i * dx + dx / 2,
    Y = (d: number) => 26 + d * dy;
  const ht = (t: TNode | null): number =>
    t ? 1 + Math.max(ht(t.left), ht(t.right)) : 0;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="u1-svg"
      style={{ maxWidth: Math.min(860, W * 1.5) }}
      role="img"
      aria-label={`Binary tree, in-order keys ${out.map((p) => p.key).join(", ")}`}
    >
      {out
        .filter((p) => p.parent)
        .map((p) => (
          <line
            key={`e${p.key}`}
            x1={X(p.parent!.x)}
            y1={Y(p.parent!.y)}
            x2={X(p.x)}
            y2={Y(p.y)}
            stroke="#2f4560"
            strokeWidth={1.5}
          />
        ))}
      {out.map((p) => {
        const isV = p.key === visit,
          isF = focus?.includes(p.key);
        const rb = mode === "rb",
          red = p.node.color === "R";
        const bf = ht(p.node.left) - ht(p.node.right);
        return (
          <g key={p.key}>
            <circle
              cx={X(p.x)}
              cy={Y(p.y)}
              r={17}
              fill={rb ? (red ? "#8e2c3e" : "#151b24") : "#13273a"}
              stroke={
                isV
                  ? C.compare
                  : isF
                    ? "#e7f4ff"
                    : rb
                      ? red
                        ? "#ff8b9a"
                        : "#8a9bb0"
                      : SERIES[0]
              }
              strokeWidth={isV ? 3.5 : isF ? 2.5 : 1.5}
              strokeDasharray={isF && !isV ? "4 3" : undefined}
            />
            <text
              x={X(p.x)}
              y={Y(p.y) + 4}
              fontSize="11.5"
              textAnchor="middle"
              fill="#f0f8ff"
            >
              {p.key}
            </text>
            {mode === "avl" && (
              <text
                x={X(p.x) + 20}
                y={Y(p.y) - 13}
                fontSize="9"
                fill={Math.abs(bf) > 1 ? "#ff8b9a" : "#8fa3b9"}
              >
                {bf > 0 ? `+${bf}` : bf}
              </text>
            )}
            {rb && (
              <text
                x={X(p.x) + 20}
                y={Y(p.y) - 13}
                fontSize="9"
                fill={red ? "#ff8b9a" : "#8fa3b9"}
              >
                {red ? "R" : "B"}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- B-trees ---------- */
export function BTree({
  root,
  focus,
  split,
}: {
  root: BNode;
  focus?: number[];
  split?: number;
}) {
  if (!root.keys.length)
    return (
      <div className="empty-state">
        <p>The tree is empty.</p>
      </div>
    );
  const kw = 30,
    gap = 16,
    rowH = 70;
  type P = { b: BNode; x: number; w: number; d: number; kids: P[] };
  let cursor = 0;
  const lay = (b: BNode, d: number): P => {
    const w = b.keys.length * kw + 10;
    if (!b.children.length) {
      const p = { b, x: cursor, w, d, kids: [] };
      cursor += w + gap;
      return p;
    }
    const kids = b.children.map((c) => lay(c, d + 1));
    const mid =
      (kids[0].x + kids[kids.length - 1].x + kids[kids.length - 1].w) / 2;
    return { b, x: mid - w / 2, w, d, kids };
  };
  const tree = lay(root, 0);
  const all: P[] = [];
  const collect = (p: P) => {
    all.push(p);
    p.kids.forEach(collect);
  };
  collect(tree);
  const minX = Math.min(...all.map((p) => p.x)),
    W = Math.max(...all.map((p) => p.x + p.w)) - minX + 20,
    H = (Math.max(...all.map((p) => p.d)) + 1) * rowH;
  const ox = 10 - minX;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="u1-svg"
      style={{ maxWidth: Math.min(900, W * 1.5) }}
      role="img"
      aria-label="B-tree"
    >
      {all.flatMap((p) =>
        p.kids.map((k, i) => (
          <line
            key={`${p.b.keys.join()}-${i}`}
            x1={p.x + ox + 5 + i * kw}
            y1={p.d * rowH + 40}
            x2={k.x + ox + k.w / 2}
            y2={k.d * rowH + 12}
            stroke="#2f4560"
            strokeWidth={1.4}
          />
        )),
      )}
      {all.map((p, n) => (
        <g key={n}>
          <rect
            x={p.x + ox}
            y={p.d * rowH + 12}
            width={p.w}
            height={28}
            rx={6}
            fill="#13273a"
            stroke={
              p.b.keys.some((k) => focus?.includes(k)) ? C.compare : SERIES[0]
            }
            strokeWidth={p.b.keys.some((k) => focus?.includes(k)) ? 2.5 : 1.3}
          />
          {p.b.keys.map((k, i) => (
            <g key={k}>
              {i > 0 && (
                <line
                  x1={p.x + ox + 5 + i * kw}
                  y1={p.d * rowH + 15}
                  x2={p.x + ox + 5 + i * kw}
                  y2={p.d * rowH + 37}
                  stroke="#2f4560"
                />
              )}
              <text
                x={p.x + ox + 5 + i * kw + kw / 2}
                y={p.d * rowH + 30}
                fontSize="11"
                textAnchor="middle"
                fill={
                  k === split
                    ? "#f4c56a"
                    : focus?.includes(k)
                      ? "#fff3d6"
                      : "#e7f4ff"
                }
                fontWeight={k === split ? 700 : 400}
              >
                {k}
              </text>
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

/* ---------- Heap: complete binary tree + its array ---------- */
export function HeapTree({
  a,
  compare,
  swap,
  focus,
  size,
}: {
  a: number[];
  compare?: [number, number];
  swap?: [number, number];
  focus?: number;
  size?: number;
}) {
  if (!a.length)
    return (
      <div className="empty-state">
        <p>The heap is empty.</p>
      </div>
    );
  const levels = Math.floor(Math.log2(a.length)) + 1,
    W = 640,
    rowH = 58,
    H = levels * rowH + 10;
  const pos = (i: number) => {
    const d = Math.floor(Math.log2(i + 1)),
      k = i - (2 ** d - 1);
    return { x: (W * (k + 0.5)) / 2 ** d, y: 24 + d * rowH };
  };
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="u1-svg"
      style={{ maxWidth: 720 }}
      role="img"
      aria-label={`Heap as a tree: ${a.join(", ")}`}
    >
      {a.map(
        (_, i) =>
          i > 0 && (
            <line
              key={`e${i}`}
              x1={pos((i - 1) >> 1).x}
              y1={pos((i - 1) >> 1).y}
              x2={pos(i).x}
              y2={pos(i).y}
              stroke={size !== undefined && i >= size ? "#1d2a3a" : "#2f4560"}
              strokeWidth={1.4}
            />
          ),
      )}
      {a.map((v, i) => {
        const p = pos(i),
          out = size !== undefined && i >= size,
          ring = swap?.includes(i)
            ? C.swap
            : compare?.includes(i)
              ? C.compare
              : i === focus
                ? "#e7f4ff"
                : null;
        return (
          <g key={i} opacity={out ? 0.45 : 1}>
            <circle
              cx={p.x}
              cy={p.y}
              r={17}
              fill={out ? "#10302a" : "#13273a"}
              stroke={ring ?? (out ? C.done : SERIES[0])}
              strokeWidth={ring ? 3 : 1.4}
            />
            <text
              x={p.x}
              y={p.y + 4}
              fontSize="11.5"
              textAnchor="middle"
              fill="#f0f8ff"
            >
              {v}
            </text>
            <text x={p.x + 19} y={p.y + 16} fontSize="8.5" fill="#6d839c">
              {i}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
