import { useMemo, useState } from "react";
import { Binary, GitFork, SpellCheck, TreePine } from "lucide-react";
import { toPostfixFrames, tokenize } from "../../../domain/ds/stacksQueues";
import {
  buildTrie,
  evalTreeFrames,
  fromLevelOrder,
  inorderThreads,
  parseGeneral,
  toBinary,
  traverse,
  treeFromPostfix,
  treeInfix,
  treeProps,
  trieSize,
  walkTrie,
  wordsWithPrefix,
  type GT,
  type Traversal,
} from "../../../domain/ds/trees";
import {
  DC,
  Explain,
  Panel,
  PlayerBar,
  Stats,
  Tabs,
  TreeView,
  TrieView,
  usePlayer,
  type StepProps,
} from "../kit";

const parseLevels = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .map((x) => (x === "-" || x === "" ? null : x));

/* ======================= Binary trees: traversals, properties, extended trees ======================= */

const treePresets = [
  { label: "Example", value: "A, B, C, D, E, -, F, -, -, G" },
  { label: "Complete", value: "A, B, C, D, E, F, G, H" },
  { label: "Skewed", value: "A, B, -, C, -, D" },
  { label: "Full (strict)", value: "A, B, C, -, -, D, E" },
];
const travNames: Record<Traversal, string> = {
  pre: "Preorder (N L R)",
  in: "Inorder (L N R)",
  post: "Postorder (L R N)",
  level: "Level order",
};

export function TreeBasicsExplorer({ onSteps }: StepProps) {
  const [tab, setTab] = useState<"traverse" | "props" | "extended">("traverse");
  const [src, setSrc] = useState(treePresets[0].value);
  const [kind, setKind] = useState<Traversal>("in");
  const root = useMemo(() => fromLevelOrder(parseLevels(src)), [src]);
  const order = useMemo(() => traverse(root, kind), [root, kind]);
  const props = useMemo(() => treeProps(root), [root]);
  const p = usePlayer(order.length + 1, `${src}-${kind}-${tab}`, onSteps);
  const visited = new Set(order.slice(0, p.step).map((n) => n.id));
  const cur = p.step > 0 ? order[p.step - 1] : undefined;
  return (
    <Panel
      kicker="UNIT IV · BINARY TREES"
      title="Shape, walks and path lengths"
      intro="Type a tree in level order (use - for a missing child). Traverse it, check its mathematical properties, or extend it with external nodes."
      icon={<TreePine size={19} />}
    >
      <div className="u1-controls">
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { id: "traverse", label: "Traversals" },
            { id: "props", label: "Properties" },
            { id: "extended", label: "Extended tree & path length" },
          ]}
        />
      </div>
      <div className="ds-inputs">
        <label className="u1-select ds-wide">
          Level order
          <input
            className="u2-small-input ds-text"
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            aria-label="Tree in level order"
          />
        </label>
        {treePresets.map((t) => (
          <button
            key={t.label}
            className="btn btn-secondary"
            onClick={() => setSrc(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "traverse" && (
        <>
          <div className="u1-controls">
            <Tabs
              value={kind}
              onChange={setKind}
              options={(Object.keys(travNames) as Traversal[]).map((k) => ({
                id: k,
                label: travNames[k],
              }))}
            />
          </div>
          <div className="u2-tree-stage">
            <TreeView root={root} active={cur?.id} visited={visited} />
          </div>
          <div className="ds-tokens">
            {order.map((n, i) => (
              <span
                key={n.id}
                className={`${i === p.step - 1 ? "hi" : ""} ${i < p.step - 1 ? "done" : ""}`}
              >
                {n.label}
              </span>
            ))}
          </div>
          <Explain
            title={cur ? `Visit ${cur.label}` : travNames[kind]}
            text={
              kind === "level"
                ? "Level order uses a queue: visit a node, then enqueue its left and right children."
                : kind === "pre"
                  ? "Visit the node first, then its whole left subtree, then its right subtree."
                  : kind === "in"
                    ? "Finish the left subtree, visit the node, then do the right subtree. On a BST this gives sorted order."
                    : "Visit both subtrees before the node itself — the order used to evaluate expression trees or free memory."
            }
          />
          <PlayerBar p={p} />
        </>
      )}
      {tab === "props" && (
        <>
          <div className="u2-tree-stage">
            <TreeView root={root} />
          </div>
          <Stats
            items={[
              {
                label: "NODES n · EDGES",
                value: `${props.nodes} · ${Math.max(0, props.nodes - 1)}`,
                note: "a tree with n nodes has n − 1 edges",
              },
              {
                label: "LEVELS (DEPTH)",
                value: props.levels,
                note: `at least ⌈log₂(n + 1)⌉ = ${props.minLevels}`,
              },
              {
                label: "LEAVES · INTERNAL",
                value: `${props.leaves} · ${props.internal}`,
              },
              {
                label: "MAX NODES IN THIS DEPTH",
                value: props.maxNodes,
                note: "2ᵈ − 1",
              },
              {
                label: "COMPLETE?",
                value: props.complete ? "Yes" : "No",
                note: "every level full except possibly the last, filled from the left",
              },
              {
                label: "STRICT (FULL)?",
                value: props.strict ? "Yes" : "No",
                note: "every node has 0 or 2 children",
              },
            ]}
          />
          <p className="u1-small">
            Level l holds at most 2ˡ nodes. A complete tree can be stored in an
            array: node k has children 2k and 2k + 1 (1-based).
          </p>
        </>
      )}
      {tab === "extended" && (
        <>
          <div className="u2-tree-stage">
            <TreeView root={root} external />
          </div>
          <Explain
            title={`E = I + 2n → ${props.externalPath} = ${props.internalPath} + 2 × ${props.nodes}`}
            text="Replace every empty subtree by a square external node. The original n nodes become internal nodes, and there are always n + 1 external nodes. I sums the depths of internal nodes, E those of external nodes."
          />
          <Stats
            items={[
              { label: "INTERNAL NODES n", value: props.nodes },
              { label: "EXTERNAL NODES", value: props.external, note: "n + 1" },
              { label: "INTERNAL PATH LENGTH I", value: props.internalPath },
              { label: "EXTERNAL PATH LENGTH E", value: props.externalPath },
            ]}
          />
        </>
      )}
    </Panel>
  );
}

/* ======================= Expression trees ======================= */

export function ExpressionTreeExplorer({ onSteps }: StepProps) {
  const [expr, setExpr] = useState("(A + B) * (C - D / E)");
  const [vals, setVals] = useState<Record<string, number>>({
    A: 3,
    B: 5,
    C: 10,
    D: 8,
    E: 4,
  });
  const tokens = useMemo(() => tokenize(expr), [expr]);
  const postfix = useMemo(() => {
    const f = toPostfixFrames(tokens);
    return f[f.length - 1].output;
  }, [tokens]);
  const root = useMemo(() => treeFromPostfix(postfix), [postfix]);
  const frames = useMemo(() => evalTreeFrames(root, vals), [root, vals]);
  const p = usePlayer(
    Math.max(1, frames.length),
    `${expr}-${JSON.stringify(vals)}`,
    onSteps,
  );
  const f = frames[p.step];
  const letters = [...new Set(tokens.filter((t) => /^[A-Za-z]$/.test(t)))];
  const lab = (k: Traversal) =>
    traverse(root, k)
      .map((n) => n.label)
      .join(" ");
  return (
    <Panel
      kicker="UNIT IV · EXPRESSION EVALUATION"
      title="An expression is a tree"
      intro="Operators become internal nodes and operands become leaves. Evaluating the tree bottom-up (post-order) gives the value; its three traversals give prefix, infix and postfix."
      icon={<Binary size={19} />}
    >
      <div className="ds-inputs">
        <label className="u1-select ds-wide">
          Expression
          <input
            className="u2-small-input ds-text"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            aria-label="Infix expression"
          />
        </label>
        {letters.map((l) => (
          <label key={l} className="u1-select">
            {l} =
            <input
              className="u2-small-input ds-tiny"
              type="number"
              value={vals[l] ?? 0}
              onChange={(e) =>
                setVals((v) => ({ ...v, [l]: Number(e.target.value) }))
              }
            />
          </label>
        ))}
      </div>
      {root && f ? (
        <>
          <div className="u2-tree-stage">
            <TreeView
              root={root}
              active={f.id}
              values={f.values}
              visited={new Set(f.values.keys())}
            />
          </div>
          <Explain title={f.title} text={f.text} />
          <PlayerBar p={p} />
          <Stats
            items={[
              { label: "PREORDER → PREFIX", value: lab("pre") },
              { label: "INORDER → INFIX", value: treeInfix(root) },
              { label: "POSTORDER → POSTFIX", value: lab("post") },
            ]}
          />
        </>
      ) : (
        <Explain
          title="Not a valid expression"
          text="Use letters or numbers joined by + − * / ^ and balanced parentheses."
        />
      )}
    </Panel>
  );
}

/* ======================= General trees and threaded trees ======================= */

function GeneralView({ g }: { g: GT }) {
  type P = { g: GT; x: number; d: number; parent?: P; key: string };
  const out: P[] = [];
  let leaf = 0;
  const walk = (n: GT, d: number, key: string, parent?: P): number => {
    const me: P = { g: n, x: 0, d, parent, key };
    out.push(me);
    if (!n.children.length) me.x = leaf++;
    else {
      const xs = n.children.map((c, i) => walk(c, d + 1, `${key}.${i}`, me));
      me.x = (xs[0] + xs[xs.length - 1]) / 2;
    }
    return me.x;
  };
  walk(g, 0, "0");
  const depth = Math.max(...out.map((p) => p.d)) + 1;
  const dx = 46,
    dy = 58,
    W = Math.max(leaf * dx + 40, 200),
    H = depth * dy + 6;
  const X = (x: number) => 20 + x * dx + dx / 2,
    Y = (d: number) => 24 + d * dy;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="u1-svg"
      style={{ maxWidth: Math.min(520, W * 1.5) }}
      role="img"
      aria-label="General tree"
    >
      {out
        .filter((p) => p.parent)
        .map((p) => (
          <line
            key={`e${p.key}`}
            x1={X(p.parent!.x)}
            y1={Y(p.parent!.d)}
            x2={X(p.x)}
            y2={Y(p.d)}
            stroke={DC.edge}
            strokeWidth={1.5}
          />
        ))}
      {out.map((p) => (
        <g key={p.key}>
          <circle
            cx={X(p.x)}
            cy={Y(p.d)}
            r={16}
            fill={DC.node}
            stroke={DC.stroke}
            strokeWidth={1.5}
          />
          <text
            x={X(p.x)}
            y={Y(p.d) + 4}
            fontSize="12"
            textAnchor="middle"
            fill={DC.text}
          >
            {p.g.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function GeneralThreadedExplorer({ onSteps }: StepProps) {
  const [tab, setTab] = useState<"general" | "threaded">("general");
  const [gsrc, setGsrc] = useState("A(B(E,F),C,D(G,H,I))");
  const [tsrc, setTsrc] = useState("D, B, F, A, C, E, G");
  const { general, binary, err } = useMemo(() => {
    try {
      const g = parseGeneral(gsrc);
      return { general: g, binary: toBinary(g), err: "" };
    } catch (e) {
      return { general: null, binary: null, err: (e as Error).message };
    }
  }, [gsrc]);
  const troot = useMemo(() => fromLevelOrder(parseLevels(tsrc)), [tsrc]);
  const threads = useMemo(() => inorderThreads(troot), [troot]);
  const inorder = useMemo(() => traverse(troot, "in"), [troot]);
  const p = usePlayer(inorder.length + 1, `${tab}-${tsrc}`, onSteps);
  const cur = p.step > 0 ? inorder[p.step - 1] : undefined;
  const prev = p.step > 1 ? inorder[p.step - 2] : undefined;
  return (
    <Panel
      kicker="UNIT IV · GENERAL & THREADED TREES"
      title="Any tree as a binary tree, and pointers that are never wasted"
      intro="A node of a general tree may have any number of children. Using the left pointer for the first child and the right pointer for the next sibling turns it into a binary tree. Threading fills empty pointers with in-order neighbours."
      icon={<GitFork size={19} />}
    >
      <div className="u1-controls">
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { id: "general", label: "General → binary" },
            { id: "threaded", label: "Threaded binary tree" },
          ]}
        />
      </div>
      {tab === "general" ? (
        <>
          <div className="ds-inputs">
            <label className="u1-select ds-wide">
              Tree
              <input
                className="u2-small-input ds-text"
                value={gsrc}
                onChange={(e) => setGsrc(e.target.value)}
                aria-label="General tree, e.g. A(B,C)"
              />
            </label>
            {["A(B(E,F),C,D(G,H,I))", "R(A(D,E,F),B,C(G))"].map((x) => (
              <button
                key={x}
                className="btn btn-secondary"
                onClick={() => setGsrc(x)}
              >
                {x}
              </button>
            ))}
          </div>
          {general && binary ? (
            <>
              <div className="ds-split">
                <div>
                  <small className="ds-label">GENERAL TREE</small>
                  <GeneralView g={general} />
                </div>
                <div>
                  <small className="ds-label">
                    BINARY FORM (left = first child, right = next sibling)
                  </small>
                  <TreeView root={binary} />
                </div>
              </div>
              <Explain
                title="Left-child, right-sibling"
                text="Every node keeps exactly two pointers however many children it has. The root never has a right sibling, so its right subtree is always empty. Preorder of the binary form equals preorder of the general tree."
              />
              <Stats
                items={[
                  {
                    label: "PREORDER (both trees)",
                    value: traverse(binary, "pre")
                      .map((n) => n.label)
                      .join(" "),
                  },
                  {
                    label: "POINTERS PER NODE",
                    value: 2,
                    note: "instead of one per possible child",
                  },
                ]}
              />
            </>
          ) : (
            <Explain title="Cannot read that tree" text={err} />
          )}
        </>
      ) : (
        <>
          <div className="ds-inputs">
            <label className="u1-select ds-wide">
              Level order
              <input
                className="u2-small-input ds-text"
                value={tsrc}
                onChange={(e) => setTsrc(e.target.value)}
                aria-label="Tree in level order"
              />
            </label>
          </div>
          <div className="u2-tree-stage">
            <TreeView
              root={troot}
              threads={threads}
              active={cur?.id}
              visited={new Set(inorder.slice(0, p.step).map((n) => n.id))}
            />
          </div>
          <Explain
            title={
              cur
                ? `In-order visit ${p.step}: ${cur.label}`
                : "Threads (dashed purple)"
            }
            text={
              !cur
                ? `${threads.length} of the ${2 * inorder.length} pointers were empty; each now points to the in-order predecessor (left) or successor (right). ∅ marks the two ends.`
                : !prev
                  ? "Start at the leftmost node: follow left pointers from the root."
                  : prev.right
                    ? `${prev.label} has a right child: go right once, then left as far as possible.`
                    : `${prev.label}'s right pointer is a thread, so follow it straight to ${cur.label} — no stack needed.`
            }
          />
          <PlayerBar p={p} />
        </>
      )}
    </Panel>
  );
}

/* ======================= Trie ======================= */

const startWords = ["tree", "trie", "try", "to", "toy", "data", "date"];

export function TrieExplorer({ onSteps }: StepProps) {
  const [words, setWords] = useState(startWords);
  const [word, setWord] = useState("trial");
  const [action, setAction] = useState<{
    kind: "insert" | "search" | "prefix";
    word: string;
    id: number;
  }>({ kind: "search", word: "tri", id: 0 });
  const before = useMemo(
    () =>
      buildTrie(
        action.kind === "insert"
          ? words.filter((w) => w !== action.word)
          : words,
      ),
    [words, action],
  );
  const trie = useMemo(() => buildTrie(words), [words]);
  const walk = useMemo(() => walkTrie(trie, action.word), [trie, action]);
  const p = usePlayer(walk.path.length + 1, action.id, onSteps);
  // While inserting, nodes created for the new word appear one by one.
  const oldIds = new Set<number>();
  const collect = (
    n: ReturnType<typeof buildTrie>,
    nb: ReturnType<typeof buildTrie> | undefined,
  ) => {
    if (nb) oldIds.add(n.id);
    n.children.forEach((c) =>
      collect(
        c,
        nb?.children.find((x) => x.ch === c.ch),
      ),
    );
  };
  collect(trie, before);
  const shownPath = walk.path.slice(0, Math.min(p.step, walk.path.length));
  const hidden = new Set<number>();
  if (action.kind === "insert")
    walk.path.forEach(
      (id, i) => !oldIds.has(id) && i >= p.step && hidden.add(id),
    );
  const done = p.step >= walk.path.length;
  const matches =
    action.kind === "prefix" && done ? wordsWithPrefix(trie, action.word) : [];
  const run = (kind: "insert" | "search" | "prefix") => {
    const w = word
      .trim()
      .toLowerCase()
      .replace(/[^a-z]/g, "");
    if (!w) return;
    if (kind === "insert" && !words.includes(w)) setWords((ws) => [...ws, w]);
    setAction((a) => ({ kind, word: w, id: a.id + 1 }));
  };
  const chars = action.word.slice(0, Math.max(0, p.step - 1));
  return (
    <Panel
      kicker="UNIT IV · TRIE"
      title="A tree of prefixes"
      intro="Each edge is one letter; words that share a beginning share a path. Green nodes end a stored word. Lookup costs one step per letter, however many words are stored."
      icon={<SpellCheck size={19} />}
    >
      <div className="ds-inputs">
        <label className="u1-select">
          Word
          <input
            className="u2-small-input ds-text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            aria-label="Word"
          />
        </label>
        <button className="btn btn-primary" onClick={() => run("insert")}>
          Insert
        </button>
        <button className="btn btn-secondary" onClick={() => run("search")}>
          Search
        </button>
        <button className="btn btn-secondary" onClick={() => run("prefix")}>
          Words with this prefix
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            setWords(startWords);
            setAction((a) => ({ kind: "search", word: "tri", id: a.id + 1 }));
          }}
        >
          Reset
        </button>
      </div>
      <div className="u2-tree-stage">
        <TrieView root={trie} path={shownPath} hidden={hidden} />
      </div>
      <Explain
        title={
          !done
            ? `${action.kind === "insert" ? "Insert" : "Look up"} “${action.word}”: matched “${chars}”`
            : action.kind === "insert"
              ? `Inserted “${action.word}”`
              : walk.result === "word"
                ? `“${action.word}” is stored`
                : walk.result === "prefix"
                  ? `“${action.word}” is only a prefix`
                  : `“${action.word}” is not in the trie`
        }
        text={
          !done
            ? "Follow the child edge labelled with the next letter."
            : action.kind === "prefix"
              ? matches.length
                ? `Every word below this node: ${matches.join(", ")}.`
                : "No stored word starts with this prefix."
              : walk.result === "word"
                ? "The walk used every letter and ended on a node marked as the end of a word."
                : walk.result === "prefix"
                  ? "The letters exist as a path, but the last node does not mark the end of a word."
                  : `The walk fell off after ${walk.matched} letter(s): no edge for “${action.word[walk.matched]}”.`
        }
      />
      <PlayerBar p={p} />
      <Stats
        items={[
          {
            label: "WORDS STORED",
            value: words.length,
            note: words.join(", "),
          },
          {
            label: "TRIE NODES",
            value: trieSize(trie),
            note: `vs ${words.join("").length} letters in total`,
          },
          {
            label: "LOOKUP COST",
            value: `${action.word.length} steps`,
            note: "length of the key",
          },
        ]}
      />
    </Panel>
  );
}
