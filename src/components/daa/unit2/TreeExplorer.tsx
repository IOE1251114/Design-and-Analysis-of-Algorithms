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
import { CircleHelp, GitFork, TrendingUp } from "lucide-react";
import {
  avlInsert,
  bHeight,
  bKeys,
  bTreeInsert,
  bstOps,
  height,
  heightStudy,
  rbBlackHeight,
  rbInsert,
  size,
} from "../../../domain/daa/unit2/trees";
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
import { BTree, BinaryTree } from "./views";

type Kind = "bst" | "avl" | "rb" | "btree";
const presets: Record<Kind, { label: string; keys: string }[]> = {
  bst: [
    { label: "Mixed", keys: "50, 30, 70, 20, 40, 60, 80, 35, 45, 65" },
    { label: "Sorted (worst case)", keys: "10, 20, 30, 40, 50, 60, 70" },
  ],
  avl: [
    { label: "All four rotations", keys: "30, 20, 10, 40, 50, 25, 27, 60, 55" },
    {
      label: "Sorted 1–15",
      keys: "1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15",
    },
  ],
  rb: [
    { label: "Textbook", keys: "41, 38, 31, 12, 19, 8" },
    {
      label: "Sorted 1–15",
      keys: "1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15",
    },
  ],
  btree: [
    {
      label: "Mixed",
      keys: "10, 20, 5, 6, 12, 30, 7, 17, 3, 4, 2, 25, 28, 35",
    },
    {
      label: "Sorted 1–20",
      keys: "1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20",
    },
  ],
};
const props: Record<Kind, { title: string; rules: string[]; cost: string }> = {
  bst: {
    title: "Binary search tree",
    rules: [
      "Every key in the left subtree is smaller than the node; every key in the right subtree is larger.",
      "An in-order traversal lists the keys in sorted order.",
      "Search, insert and delete follow one root-to-leaf path: O(h).",
      "h can be anything from ⌊log₂ n⌋ (balanced) to n − 1 (keys inserted in sorted order).",
    ],
    cost: "O(h): Θ(log n) average for random insertions, Θ(n) worst case",
  },
  avl: {
    title: "AVL tree",
    rules: [
      "A BST in which every node has balance factor h(left) − h(right) ∈ {−1, 0, +1}.",
      "After an insertion, walk back up; the first node with |balance| = 2 is fixed by one single (LL, RR) or double (LR, RL) rotation.",
      "Rotations take O(1) and keep the in-order order of keys.",
      "Height < 1.44·log₂(n + 2), so every operation is O(log n) in the worst case.",
    ],
    cost: "O(log n) worst case for search, insert, delete",
  },
  rb: {
    title: "Red-black tree",
    rules: [
      "Every node is red or black; the root and the empty leaves (NIL) are black.",
      "A red node never has a red child.",
      "Every path from a node down to a NIL leaf has the same number of black nodes (the black-height).",
      "Together these force height ≤ 2·log₂(n + 1). Insertion fixes at most O(log n) recolourings and at most 2 rotations.",
    ],
    cost: "O(log n) worst case; fewer rotations than AVL",
  },
  btree: {
    title: "B-tree (minimum degree t)",
    rules: [
      "Every node except the root holds between t − 1 and 2t − 1 keys; the root holds at least 1.",
      "An internal node with k keys has k + 1 children, and its keys separate their key ranges.",
      "All leaves are at the same depth. The tree grows only at the root, by splitting it.",
      "Height ≤ log_t((n + 1)/2): very short and wide, so few disk reads. Used in databases and file systems.",
    ],
    cost: "O(log_t n) node reads; O(t·log_t n) CPU time",
  },
};

export function TreeExplorer({ onSteps }: { onSteps?: (k: number) => void }) {
  const [kind, setKind] = useState<Kind>("bst");
  return (
    <>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="kicker">SEARCH TREES</span>
            <h2>Build the tree yourself and watch every decision</h2>
            <p>
              Type keys or choose a preset. Each frame shows the whole tree at
              that moment: the comparison path in gold, and the nodes involved
              in a rotation, recolouring or split highlighted.
            </p>
          </div>
          <span className="panel-icon">
            <GitFork size={19} />
          </span>
        </div>
        <Tabs
          value={kind}
          onChange={setKind}
          options={[
            { id: "bst", label: "Binary search tree" },
            { id: "avl", label: "AVL tree" },
            { id: "rb", label: "Red-black tree" },
            { id: "btree", label: "B-tree" },
          ]}
        />
        <TreeLab key={kind} kind={kind} onSteps={onSteps} />
      </section>
      <HeightStudy />
    </>
  );
}

const parse = (s: string) =>
  [
    ...new Set(
      s
        .split(/[\s,]+/)
        .map(Number)
        .filter((x) => Number.isInteger(x) && x > 0 && x < 1000),
    ),
  ].slice(0, 24);

function TreeLab({
  kind,
  onSteps,
}: {
  kind: Kind;
  onSteps?: (k: number) => void;
}) {
  const [text, setText] = useState(presets[kind][0].keys);
  const [op, setOp] = useState<"none" | "search" | "delete">("none");
  const [opKey, setOpKey] = useState(40);
  const [t, setT] = useState(2);
  const keys = parse(text);
  const frames = useMemo(
    () =>
      kind === "bst"
        ? bstOps(keys, op === "none" ? undefined : { kind: op, key: opKey })
        : kind === "avl"
          ? avlInsert(keys)
          : kind === "rb"
            ? rbInsert(keys)
            : null,
    [kind, text, op, opKey],
  );
  const bframes = useMemo(
    () => (kind === "btree" ? bTreeInsert(keys, t) : null),
    [kind, text, t],
  );
  const total = (frames ?? bframes)!.length;
  const p = usePlayer(total, `${kind}-${text}-${op}-${opKey}-${t}`, onSteps);
  const P = props[kind];
  const f = frames?.[Math.min(p.step, frames.length - 1)],
    bf = bframes?.[Math.min(p.step, bframes.length - 1)];
  const kindLabel = f
    ? {
        compare: "Compare",
        insert: "Insert",
        rotate: "Rotate",
        recolor: "Recolour",
        found: "Found",
        missing: "Not found",
        delete: "Delete",
        info: "Info",
      }[f.kind]
    : bf
      ? { descend: "Descend", split: "Split", insert: "Insert", info: "Info" }[
          bf.kind
        ]
      : "";
  return (
    <div className="u1-demo">
      <div className="u2-input">
        <label>
          Keys to insert, in order (1–999)
          <input value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <div className="u2-presets">
          {presets[kind].map((pr) => (
            <button
              key={pr.label}
              className="btn btn-secondary"
              onClick={() => setText(pr.keys)}
            >
              {pr.label}
            </button>
          ))}
        </div>
      </div>
      {kind === "bst" && (
        <div className="u1-controls">
          <Tabs
            value={op}
            onChange={setOp}
            options={[
              { id: "none", label: "Insert only" },
              { id: "search", label: "Then search" },
              { id: "delete", label: "Then delete" },
            ]}
          />
          {op !== "none" && (
            <label className="u1-select">
              key
              <input
                className="u2-small-input"
                type="number"
                value={opKey}
                onChange={(e) => setOpKey(Number(e.target.value))}
              />
            </label>
          )}
        </div>
      )}
      {kind === "btree" && (
        <div className="u1-controls">
          <Tabs
            value={String(t)}
            onChange={(v) => setT(Number(v))}
            options={[
              { id: "2", label: "t = 2 (2-3-4 tree: 1–3 keys per node)" },
              { id: "3", label: "t = 3 (2–5 keys per node)" },
            ]}
          />
        </div>
      )}
      {kind === "rb" && (
        <Legend
          items={[
            { id: "r", label: "Red node (R)", color: "#ff8b9a" },
            { id: "b", label: "Black node (B)", color: "#8a9bb0" },
            { id: "v", label: "Current node", color: "#f4c56a", dash: true },
          ]}
        />
      )}
      {kind === "avl" && (
        <p className="u1-small" style={{ marginTop: 0 }}>
          The small number beside each node is its balance factor h(left) −
          h(right); it turns rose when it reaches ±2.
        </p>
      )}
      <div className="u2-tree-stage">
        {f ? (
          <BinaryTree
            root={f.root}
            visit={f.visit}
            focus={f.focus}
            mode={kind === "avl" ? "avl" : kind === "rb" ? "rb" : "plain"}
          />
        ) : (
          bf && <BTree root={bf.root} focus={bf.focus} split={bf.split} />
        )}
      </div>
      <div className="stage-explanation">
        <strong>
          <em className="u2-tag">
            {kindLabel}
            {f?.rotate ? ` · ${f.rotate}` : ""}
          </em>
          {(f ?? bf)!.title}
        </strong>
        <p>{(f ?? bf)!.text}</p>
      </div>
      <PlayerBar p={p} />
      <div className="u2-stats">
        <div>
          <small>KEYS</small>
          <strong>{f ? size(f.root) : bf ? bKeys(bf.root).length : 0}</strong>
        </div>
        <div>
          <small>HEIGHT</small>
          <strong>{f ? height(f.root) : bf ? bHeight(bf.root) : 0}</strong>
          <span>levels of nodes</span>
        </div>
        {kind === "rb" && f && (
          <div>
            <small>BLACK-HEIGHT</small>
            <strong>
              {rbBlackHeight(f.root) > 0
                ? rbBlackHeight(f.root) - 1
                : "fixing…"}
            </strong>
            <span>black nodes on every path</span>
          </div>
        )}
        <div>
          <small>COST OF AN OPERATION</small>
          <strong className="u2-mono">{P.cost}</strong>
        </div>
      </div>
      <div className="u2-rules">
        <strong>{P.title}: the rules</strong>
        <ul>
          {P.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function HeightStudy() {
  const data = useMemo(() => heightStudy(31), []);
  const series = [
    { id: "bstSorted", label: "BST, keys in sorted order", color: SERIES[5] },
    {
      id: "bstRandom",
      label: "BST, random order (mean of 20)",
      color: SERIES[1],
    },
    { id: "rb", label: "Red-black, sorted order", color: SERIES[4] },
    { id: "avl", label: "AVL, sorted order", color: SERIES[2] },
    {
      id: "log",
      label: "⌊log₂ n⌋ + 1 (perfectly balanced)",
      color: "#8fa3b9",
      dash: true,
    },
  ];
  return (
    <section className="panel u1-gap">
      <div className="panel-heading">
        <div>
          <span className="kicker">WHY BALANCE MATTERS</span>
          <h2>Tree height after inserting n keys</h2>
          <p>
            Every operation costs O(height). These heights come from actually
            inserting keys 1…n into each tree.
          </p>
        </div>
        <span className="panel-icon">
          <TrendingUp size={19} />
        </span>
      </div>
      <Legend items={series} />
      <div className="u1-chart" style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 16, bottom: 6, left: -6 }}
          >
            <CartesianGrid {...grid} />
            <XAxis dataKey="n" {...axis} />
            <YAxis {...axis} width={40} allowDecimals={false} />
            <Tooltip
              {...tooltipStyle}
              labelFormatter={(v) => `n = ${v} keys`}
              formatter={(v: number, k: string) => [
                `height ${v}`,
                series.find((s) => s.id === k)!.label,
              ]}
            />
            {series.map((s) => (
              <Line
                key={s.id}
                dataKey={s.id}
                type={s.id === "bstRandom" ? "monotone" : "stepAfter"}
                stroke={s.color}
                strokeWidth={s.dash ? 1.5 : 2.2}
                strokeDasharray={s.dash ? "6 4" : undefined}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="callout">
        <CircleHelp size={16} />
        <p>
          Sorted input turns a plain BST into a linked list: height n, so search
          becomes Θ(n). Random order keeps it near 2·ln n on average, but
          nothing guarantees that. AVL and red-black trees rebalance as they go
          and stay within a small constant of log₂ n for every insertion order.
          AVL is the more tightly balanced of the two.
        </p>
      </div>
    </section>
  );
}
