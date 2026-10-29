/* Unit IV — binary-tree properties and traversals, extended trees, expression trees,
 * general trees (left-child right-sibling), threaded trees and tries. */

export type BT = {
  id: number;
  label: string;
  left: BT | null;
  right: BT | null;
};

let uid = 0;
const mk = (
  label: string,
  left: BT | null = null,
  right: BT | null = null,
): BT => ({
  id: uid++,
  label,
  left,
  right,
});

/** Build from a level-order list; null (or "-") marks a missing child. */
export function fromLevelOrder(labels: (string | null)[]): BT | null {
  const clean = labels.map((l) =>
    l === null || l === "-" || l === "" ? null : l,
  );
  if (!clean.length || clean[0] === null) return null;
  const root = mk(clean[0]);
  const queue: BT[] = [root];
  let i = 1;
  while (queue.length && i < clean.length) {
    const n = queue.shift()!;
    for (const side of ["left", "right"] as const) {
      if (i >= clean.length) break;
      const l = clean[i++];
      if (l !== null) {
        n[side] = mk(l);
        queue.push(n[side]!);
      }
    }
  }
  return root;
}

export type Traversal = "pre" | "in" | "post" | "level";

export function traverse(root: BT | null, kind: Traversal): BT[] {
  const out: BT[] = [];
  if (kind === "level") {
    const q = root ? [root] : [];
    while (q.length) {
      const n = q.shift()!;
      out.push(n);
      if (n.left) q.push(n.left);
      if (n.right) q.push(n.right);
    }
    return out;
  }
  const rec = (n: BT | null) => {
    if (!n) return;
    if (kind === "pre") out.push(n);
    rec(n.left);
    if (kind === "in") out.push(n);
    rec(n.right);
    if (kind === "post") out.push(n);
  };
  rec(root);
  return out;
}

/** Depth of every node (root = 0). */
export function depths(root: BT | null): Map<number, number> {
  const d = new Map<number, number>();
  const rec = (n: BT | null, k: number) => {
    if (!n) return;
    d.set(n.id, k);
    rec(n.left, k + 1);
    rec(n.right, k + 1);
  };
  rec(root, 0);
  return d;
}

export function treeProps(root: BT | null) {
  const all = traverse(root, "pre");
  const d = depths(root);
  const levels = all.length ? Math.max(...d.values()) + 1 : 0;
  const leaves = all.filter((n) => !n.left && !n.right).length;
  const strict = all.every((n) => !!n.left === !!n.right);
  // Complete: in level order, once a missing child is seen, no node may follow.
  let complete = true,
    gap = false;
  for (const n of traverse(root, "level")) {
    for (const c of [n.left, n.right]) {
      if (!c) gap = true;
      else if (gap) complete = false;
    }
  }
  const internalPath = [...d.values()].reduce((a, b) => a + b, 0);
  return {
    nodes: all.length,
    leaves,
    internal: all.length - leaves,
    levels,
    maxNodes: 2 ** levels - 1,
    minLevels: Math.ceil(Math.log2(all.length + 1)),
    strict,
    complete,
    /** Extended tree: every empty subtree becomes an external node. */
    external: all.length + 1,
    internalPath,
    externalPath: internalPath + 2 * all.length,
  };
}

/* ---------- Expression trees ---------- */

const OPS = new Set(["+", "-", "*", "/", "^"]);

/** Build an expression tree from postfix tokens (stack of subtrees). */
export function treeFromPostfix(postfix: string[]): BT | null {
  const st: BT[] = [];
  for (const t of postfix) {
    if (OPS.has(t)) {
      const r = st.pop() ?? null,
        l = st.pop() ?? null;
      st.push(mk(t, l, r));
    } else st.push(mk(t));
  }
  return st.length === 1 ? st[0] : null;
}

export type ExprFrame = {
  id: number;
  values: Map<number, number>;
  title: string;
  text: string;
};

/** Evaluate bottom-up (post-order): each operator node combines its two children. */
export function evalTreeFrames(
  root: BT | null,
  vars: Record<string, number>,
): ExprFrame[] {
  const frames: ExprFrame[] = [];
  const values = new Map<number, number>();
  for (const n of traverse(root, "post")) {
    let v: number;
    if (OPS.has(n.label)) {
      const a = values.get(n.left!.id)!,
        b = values.get(n.right!.id)!;
      v =
        n.label === "+"
          ? a + b
          : n.label === "-"
            ? a - b
            : n.label === "*"
              ? a * b
              : n.label === "/"
                ? a / b
                : a ** b;
      values.set(n.id, v);
      frames.push({
        id: n.id,
        values: new Map(values),
        title: `${fmt(a)} ${n.label} ${fmt(b)} = ${fmt(v)}`,
        text: "Both subtrees are already evaluated (post-order), so this operator can combine them.",
      });
    } else {
      v = /^\d+$/.test(n.label) ? Number(n.label) : (vars[n.label] ?? 0);
      values.set(n.id, v);
      frames.push({
        id: n.id,
        values: new Map(values),
        title: `Leaf ${n.label} = ${fmt(v)}`,
        text: "Operands are leaves: their value is known immediately.",
      });
    }
  }
  return frames;
}

const fmt = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(2));

/** Fully parenthesised infix from an expression tree (in-order). */
export function treeInfix(n: BT | null): string {
  if (!n) return "";
  if (!n.left && !n.right) return n.label;
  return `(${treeInfix(n.left)} ${n.label} ${treeInfix(n.right)})`;
}

/* ---------- General trees and their binary (left-child, right-sibling) form ---------- */

export type GT = { label: string; children: GT[] };

/** Parse "A(B(E,F),C,D(G))". */
export function parseGeneral(src: string): GT {
  const s = src.replace(/\s+/g, "");
  let i = 0;
  const node = (): GT => {
    const m = s.slice(i).match(/^[A-Za-z0-9]+/);
    if (!m) throw new Error(`Expected a label at position ${i + 1}`);
    i += m[0].length;
    const children: GT[] = [];
    if (s[i] === "(") {
      i++;
      while (s[i] !== ")") {
        if (i >= s.length) throw new Error("Missing )");
        children.push(node());
        if (s[i] === ",") i++;
      }
      i++;
    }
    return { label: m[0], children };
  };
  const out = node();
  if (i !== s.length) throw new Error("Extra characters after the tree");
  return out;
}

/** Left pointer = first child, right pointer = next sibling. */
export function toBinary(g: GT): BT {
  const conv = (n: GT, siblings: GT[]): BT => {
    const [first, ...rest] = n.children;
    const [nextSib, ...after] = siblings;
    return mk(
      n.label,
      first ? conv(first, rest) : null,
      nextSib ? conv(nextSib, after) : null,
    );
  };
  return conv(g, []);
}

/* ---------- In-order threaded binary trees ---------- */

export type Thread = {
  from: number;
  to: number | null;
  side: "left" | "right";
};

/** Every empty left pointer → in-order predecessor; every empty right pointer → successor. */
export function inorderThreads(root: BT | null): Thread[] {
  const order = traverse(root, "in");
  const threads: Thread[] = [];
  order.forEach((n, i) => {
    if (!n.left)
      threads.push({ from: n.id, to: order[i - 1]?.id ?? null, side: "left" });
    if (!n.right)
      threads.push({ from: n.id, to: order[i + 1]?.id ?? null, side: "right" });
  });
  return threads;
}

/* ---------- Tries ---------- */

export type TrieNode = {
  id: number;
  ch: string;
  end: boolean;
  children: TrieNode[];
};

export function buildTrie(words: string[]): TrieNode {
  let id = 0;
  const root: TrieNode = { id: id++, ch: "", end: false, children: [] };
  for (const w of words) {
    let cur = root;
    for (const ch of w.toLowerCase()) {
      let next = cur.children.find((c) => c.ch === ch);
      if (!next) {
        next = { id: id++, ch, end: false, children: [] };
        cur.children.push(next);
        cur.children.sort((a, b) => a.ch.localeCompare(b.ch));
      }
      cur = next;
    }
    cur.end = true;
  }
  return root;
}

export type TrieWalk = {
  /** Node ids along the path, root first. */
  path: number[];
  /** Characters matched before the walk stopped. */
  matched: number;
  /** "word": the whole key is stored; "prefix": only as a prefix; "missing": falls off. */
  result: "word" | "prefix" | "missing";
};

export function walkTrie(root: TrieNode, word: string): TrieWalk {
  const path = [root.id];
  let cur = root,
    matched = 0;
  for (const ch of word.toLowerCase()) {
    const next = cur.children.find((c) => c.ch === ch);
    if (!next) return { path, matched, result: "missing" };
    path.push(next.id);
    cur = next;
    matched++;
  }
  return { path, matched, result: cur.end ? "word" : "prefix" };
}

/** All stored words that start with `prefix`, in alphabetical order. */
export function wordsWithPrefix(root: TrieNode, prefix: string): string[] {
  const w = walkTrie(root, prefix);
  if (w.result === "missing") return [];
  let node = root;
  for (const ch of prefix.toLowerCase())
    node = node.children.find((c) => c.ch === ch)!;
  const out: string[] = [];
  const rec = (n: TrieNode, acc: string) => {
    if (n.end) out.push(acc);
    n.children.forEach((c) => rec(c, acc + c.ch));
  };
  rec(node, prefix.toLowerCase());
  return out;
}

export const trieSize = (n: TrieNode): number =>
  1 + n.children.reduce((s, c) => s + trieSize(c), 0);
