import type { ReactNode } from "react";
import type { BT, Thread, TrieNode } from "../../domain/ds/trees";

export { PlayerBar, Tabs, usePlayer } from "../daa/unit1/shared";
export type StepProps = { onSteps?: (k: number) => void };

/* Colours with a fixed meaning across every Data Structures visual; each is also named in text. */
export const DC = {
  node: "#13273a",
  edge: "#2f4560",
  stroke: "#1ea0ca",
  active: "#f4c56a",
  done: "#1aab80",
  bad: "#ff8b9a",
  fresh: "#b8a5ff",
  muted: "#60748c",
  text: "#f0f8ff",
};

/** Standard explorer card: kicker, title, short intro and an icon. */
export function Panel({
  kicker,
  title,
  intro,
  icon,
  children,
}: {
  kicker: string;
  title: string;
  intro: ReactNode;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="kicker">{kicker}</span>
          <h2>{title}</h2>
          <p>{intro}</p>
        </div>
        <span className="panel-icon">{icon}</span>
      </div>
      {children}
    </section>
  );
}

export function Explain({
  title,
  text,
}: {
  title: ReactNode;
  text: ReactNode;
}) {
  return (
    <div className="stage-explanation" aria-live="polite">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

export function Stats({
  items,
}: {
  items: { label: string; value: ReactNode; note?: ReactNode }[];
}) {
  return (
    <div className="u2-stats">
      {items.map((it) => (
        <div key={it.label}>
          <small>{it.label}</small>
          <strong>{it.value}</strong>
          {it.note && <span>{it.note}</span>}
        </div>
      ))}
    </div>
  );
}

/** A row of memory cells with an index (and optional address) under each one. */
export function MemoryRow({
  values,
  label,
  hi,
  marks,
  done,
  sub,
  pointers,
}: {
  values: (string | number | null)[];
  label?: string;
  hi?: number | null;
  marks?: number[];
  done?: (i: number) => boolean;
  sub?: (i: number) => ReactNode;
  /** Named pointers drawn above cells, e.g. { FRONT: 2, REAR: 5 }. */
  pointers?: Record<string, number | undefined>;
}) {
  const ptrs = Object.entries(pointers ?? {}).filter(
    ([, i]) => i !== undefined && i >= 0,
  );
  return (
    <div className="ds-memory">
      {label && <small className="ds-label">{label}</small>}
      <div className="ds-memory-row">
        {values.map((v, i) => {
          const names = ptrs.filter(([, at]) => at === i).map(([n]) => n);
          return (
            <div
              key={i}
              className={`ds-cell ${i === hi ? "hi" : ""} ${marks?.includes(i) ? "mark" : ""} ${done?.(i) ? "done" : ""} ${v === null || v === "" ? "empty" : ""}`}
            >
              <span className="ds-ptr">{names.join(" · ")}</span>
              <b>{v ?? ""}</b>
              <i>{sub ? sub(i) : i}</i>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Binary tree diagram ---------- */

type Placed = { n: BT; x: number; d: number; parent?: Placed };

function placeTree(root: BT | null) {
  const out: Placed[] = [];
  let col = 0;
  const walk = (n: BT | null, d: number, parent?: Placed) => {
    if (!n) return;
    const me: Placed = { n, x: 0, d, parent };
    walk(n.left, d + 1, me);
    me.x = col++;
    out.push(me);
    walk(n.right, d + 1, me);
  };
  walk(root, 0);
  return out;
}

export function TreeView({
  root,
  active,
  visited,
  values,
  external,
  threads,
  ariaLabel,
}: {
  root: BT | null;
  active?: number;
  visited?: Set<number>;
  /** Value computed at a node, drawn under it. */
  values?: Map<number, number>;
  /** Draw a square external node for every empty subtree (extended binary tree). */
  external?: boolean;
  threads?: Thread[];
  ariaLabel?: string;
}) {
  if (!root)
    return (
      <div className="empty-state">
        <p>The tree is empty.</p>
      </div>
    );
  const placed = placeTree(root);
  const byId = new Map(placed.map((p) => [p.n.id, p]));
  const cols = placed.length;
  const depth = Math.max(...placed.map((p) => p.d)) + 1 + (external ? 1 : 0);
  const dx = 50,
    dy = 66,
    pad = 30;
  const W = Math.max(cols * dx + pad * 2, 220),
    H = depth * dy + (values ? 20 : 6);
  const X = (x: number) => pad + x * dx + dx / 2,
    Y = (d: number) => 26 + d * dy;
  const ext: { x: number; y: number; px: number; py: number }[] = [];
  if (external)
    placed.forEach((p) => {
      if (!p.n.left)
        ext.push({
          x: X(p.x) - dx / 2.6,
          y: Y(p.d + 1) - 8,
          px: X(p.x),
          py: Y(p.d),
        });
      if (!p.n.right)
        ext.push({
          x: X(p.x) + dx / 2.6,
          y: Y(p.d + 1) - 8,
          px: X(p.x),
          py: Y(p.d),
        });
    });
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="u1-svg"
      style={{ maxWidth: Math.min(880, W * 1.5) }}
      role="img"
      aria-label={ariaLabel ?? `Binary tree with ${cols} nodes`}
    >
      <defs>
        <marker
          id="ds-thread-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" fill={DC.fresh} />
        </marker>
      </defs>
      {placed
        .filter((p) => p.parent)
        .map((p) => (
          <line
            key={`e${p.n.id}`}
            x1={X(p.parent!.x)}
            y1={Y(p.parent!.d)}
            x2={X(p.x)}
            y2={Y(p.d)}
            stroke={DC.edge}
            strokeWidth={1.5}
          />
        ))}
      {ext.map((e, i) => (
        <g key={`x${i}`}>
          <line
            x1={e.px}
            y1={e.py}
            x2={e.x}
            y2={e.y}
            stroke={DC.edge}
            strokeDasharray="3 3"
          />
          <rect
            x={e.x - 7}
            y={e.y - 7}
            width={14}
            height={14}
            rx={2}
            fill="#0d1521"
            stroke={DC.muted}
          />
        </g>
      ))}
      {threads?.map((t, i) => {
        const a = byId.get(t.from);
        const b = t.to === null ? undefined : byId.get(t.to);
        if (!a) return null;
        const x1 = X(a.x) + (t.side === "left" ? -10 : 10),
          y1 = Y(a.d) + 12;
        if (!b)
          return (
            <text
              key={`t${i}`}
              x={x1 + (t.side === "left" ? -14 : 4)}
              y={y1 + 18}
              fontSize="9"
              fill={DC.muted}
            >
              ∅
            </text>
          );
        const x2 = X(b.x),
          y2 = Y(b.d) + 17;
        const mx = (x1 + x2) / 2,
          my = Math.max(y1, y2) + 34;
        return (
          <path
            key={`t${i}`}
            d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`}
            fill="none"
            stroke={DC.fresh}
            strokeDasharray="4 3"
            strokeWidth={1.3}
            markerEnd="url(#ds-thread-arrow)"
          />
        );
      })}
      {placed.map((p) => {
        const isA = p.n.id === active,
          isV = visited?.has(p.n.id);
        const v = values?.get(p.n.id);
        return (
          <g key={p.n.id}>
            <circle
              cx={X(p.x)}
              cy={Y(p.d)}
              r={17}
              fill={isV ? "#123a32" : DC.node}
              stroke={isA ? DC.active : isV ? DC.done : DC.stroke}
              strokeWidth={isA ? 3.5 : 1.6}
            />
            <text
              x={X(p.x)}
              y={Y(p.d) + 4}
              fontSize="12"
              textAnchor="middle"
              fill={DC.text}
            >
              {p.n.label}
            </text>
            {v !== undefined && (
              <text
                x={X(p.x)}
                y={Y(p.d) + 32}
                fontSize="10"
                textAnchor="middle"
                fill={DC.active}
                fontFamily="DM Mono, monospace"
              >
                ={Number.isInteger(v) ? v : v.toFixed(2)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Trie (n-ary tree) diagram ---------- */

export function TrieView({
  root,
  path,
  hidden,
}: {
  root: TrieNode;
  /** Highlighted node ids (root first). */
  path?: number[];
  /** Node ids not drawn yet (used while a new word is being inserted). */
  hidden?: Set<number>;
}) {
  type P = { n: TrieNode; x: number; d: number; parent?: P };
  const out: P[] = [];
  let leaf = 0;
  const walk = (n: TrieNode, d: number, parent?: P): number => {
    const kids = n.children.filter((c) => !hidden?.has(c.id));
    const me: P = { n, x: 0, d, parent };
    out.push(me);
    if (!kids.length) me.x = leaf++;
    else {
      const xs = kids.map((c) => walk(c, d + 1, me));
      me.x = (xs[0] + xs[xs.length - 1]) / 2;
    }
    return me.x;
  };
  walk(root, 0);
  const depth = Math.max(...out.map((p) => p.d)) + 1;
  const dx = 38,
    dy = 52,
    pad = 24;
  const W = Math.max(leaf * dx + pad * 2, 200),
    H = depth * dy + 10;
  const X = (x: number) => pad + x * dx + dx / 2,
    Y = (d: number) => 22 + d * dy;
  const on = new Set(path);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="u1-svg"
      style={{ maxWidth: Math.min(880, W * 1.5) }}
      role="img"
      aria-label="Trie"
    >
      {out
        .filter((p) => p.parent)
        .map((p) => (
          <line
            key={`e${p.n.id}`}
            x1={X(p.parent!.x)}
            y1={Y(p.parent!.d)}
            x2={X(p.x)}
            y2={Y(p.d)}
            stroke={
              on.has(p.n.id) && on.has(p.parent!.n.id) ? DC.active : DC.edge
            }
            strokeWidth={on.has(p.n.id) ? 2.5 : 1.4}
          />
        ))}
      {out.map((p) => (
        <g key={p.n.id}>
          <circle
            cx={X(p.x)}
            cy={Y(p.d)}
            r={14}
            fill={p.n.end ? "#123a32" : DC.node}
            stroke={on.has(p.n.id) ? DC.active : p.n.end ? DC.done : DC.stroke}
            strokeWidth={on.has(p.n.id) ? 3 : 1.5}
          />
          <text
            x={X(p.x)}
            y={Y(p.d) + 4}
            fontSize="12"
            textAnchor="middle"
            fill={DC.text}
          >
            {p.d === 0 ? "•" : p.n.ch}
          </text>
        </g>
      ))}
    </svg>
  );
}
