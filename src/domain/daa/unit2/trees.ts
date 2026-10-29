/* Unit 2 — search trees. Every operation records frames that each hold a full snapshot of the tree,
 * so the visual at any step is exactly the tree the algorithm had at that moment. */

export interface TNode {
  key: number;
  left: TNode | null;
  right: TNode | null;
  color?: "R" | "B";
  height?: number;
}
export interface TreeFrame {
  root: TNode | null;
  visit?: number;
  focus?: number[];
  rotate?: string;
  text: string;
  title: string;
  kind:
    | "compare"
    | "insert"
    | "rotate"
    | "recolor"
    | "found"
    | "missing"
    | "delete"
    | "info";
}

export const height = (t: TNode | null): number =>
  t ? 1 + Math.max(height(t.left), height(t.right)) : 0;
export const size = (t: TNode | null): number =>
  t ? 1 + size(t.left) + size(t.right) : 0;
export const inorder = (t: TNode | null): number[] =>
  t ? [...inorder(t.left), t.key, ...inorder(t.right)] : [];

/* ---------- Binary search tree ---------- */
type M = {
  key: number;
  left: M | null;
  right: M | null;
  color?: "R" | "B";
  height?: number;
  parent?: M | null;
};
const clone = (t: M | null | undefined): TNode | null =>
  t
    ? {
        key: t.key,
        left: clone(t.left),
        right: clone(t.right),
        color: t.color,
        height: t.height,
      }
    : null;

export function bstOps(
  keys: number[],
  op?: { kind: "search" | "delete"; key: number },
) {
  let root: M | null = null;
  const frames: TreeFrame[] = [];
  const snap = (f: Omit<TreeFrame, "root">) =>
    frames.push({ ...f, root: clone(root) });
  for (const k of keys) {
    if (!root) {
      root = { key: k, left: null, right: null };
      snap({
        kind: "insert",
        visit: k,
        title: `Insert ${k}`,
        text: `The tree is empty, so ${k} becomes the root.`,
      });
      continue;
    }
    let cur: M = root;
    for (;;) {
      if (k === cur.key) {
        snap({
          kind: "info",
          visit: cur.key,
          title: `${k} already present`,
          text: "Duplicate keys are ignored.",
        });
        break;
      }
      const dir = k < cur.key ? "left" : "right";
      snap({
        kind: "compare",
        visit: cur.key,
        title: `Insert ${k}: compare with ${cur.key}`,
        text: `${k} ${k < cur.key ? "<" : ">"} ${cur.key}, go ${dir}.`,
      });
      if (!cur[dir]) {
        cur[dir] = { key: k, left: null, right: null };
        snap({
          kind: "insert",
          visit: k,
          title: `Insert ${k}`,
          text: `Empty ${dir} child of ${cur.key}: ${k} is attached as a new leaf.`,
        });
        break;
      }
      cur = cur[dir]!;
    }
  }
  if (op) {
    let cur = root,
      parent: M | null = null;
    while (cur && cur.key !== op.key) {
      snap({
        kind: "compare",
        visit: cur.key,
        title: `${op.kind === "search" ? "Search" : "Delete"} ${op.key}: compare with ${cur.key}`,
        text: `${op.key} ${op.key < cur.key ? "<" : ">"} ${cur.key}, go ${op.key < cur.key ? "left" : "right"}.`,
      });
      parent = cur;
      cur = op.key < cur.key ? cur.left : cur.right;
    }
    if (!cur)
      snap({
        kind: "missing",
        title: `${op.key} not found`,
        text: "Reached an empty child: the key is not in the tree.",
      });
    else if (op.kind === "search")
      snap({
        kind: "found",
        visit: cur.key,
        title: `Found ${op.key}`,
        text: `Found after following one root-to-node path, so the cost is O(h), where h is the height.`,
      });
    else {
      const replace = (p: M | null, old: M, nu: M | null) => {
        if (!p) root = nu;
        else if (p.left === old) p.left = nu;
        else p.right = nu;
      };
      if (!cur.left || !cur.right) {
        const child = cur.left ?? cur.right;
        snap({
          kind: "delete",
          visit: cur.key,
          title: `Delete ${op.key}: ${child ? "one child" : "leaf"}`,
          text: child
            ? `${op.key} has one child (${child.key}); splice it out by linking its parent straight to ${child.key}.`
            : `${op.key} is a leaf; simply remove it.`,
        });
        replace(parent, cur, child);
      } else {
        let sp: M = cur,
          s: M = cur.right;
        while (s.left) {
          sp = s;
          s = s.left;
        }
        snap({
          kind: "delete",
          visit: cur.key,
          focus: [s.key],
          title: `Delete ${op.key}: two children`,
          text: `Replace ${op.key} with its in-order successor ${s.key} (smallest key in the right subtree), then remove the successor from its old place.`,
        });
        if (sp === cur) sp.right = s.right;
        else sp.left = s.right;
        cur.key = s.key;
      }
      snap({
        kind: "info",
        title: `Deleted ${op.key}`,
        text: `In-order traversal is still sorted: ${inorder(clone(root)).join(", ")}.`,
      });
    }
  }
  return frames;
}

/* ---------- AVL tree ---------- */
const h = (t: M | null) => t?.height ?? 0;
const fix = (t: M) => {
  t.height = 1 + Math.max(h(t.left), h(t.right));
};
export const balance = (t: TNode | null) =>
  t ? height(t.left) - height(t.right) : 0;
export function avlInsert(keys: number[]) {
  let root: M | null = null;
  const frames: TreeFrame[] = [];
  let pending: Omit<TreeFrame, "root"> | null = null;
  const snap = (f: Omit<TreeFrame, "root">) =>
    frames.push({ ...f, root: clone(root) });
  const rotR = (y: M) => {
    const x = y.left!;
    y.left = x.right;
    x.right = y;
    fix(y);
    fix(x);
    return x;
  };
  const rotL = (x: M) => {
    const y = x.right!;
    x.right = y.left;
    y.left = x;
    fix(x);
    fix(y);
    return y;
  };
  const ins = (t: M | null, k: number): M => {
    if (!t) {
      return { key: k, left: null, right: null, height: 1 };
    }
    if (k === t.key) return t;
    snap({
      kind: "compare",
      visit: t.key,
      title: `Insert ${k}: compare with ${t.key}`,
      text: `${k} ${k < t.key ? "<" : ">"} ${t.key}, go ${k < t.key ? "left" : "right"}.`,
    });
    const wasNew = !(k < t.key ? t.left : t.right);
    if (k < t.key) t.left = ins(t.left, k);
    else t.right = ins(t.right, k);
    if (wasNew)
      snap({
        kind: "insert",
        visit: k,
        title: `Insert ${k}`,
        text: `${k} is attached as a leaf. Now walk back up and check balance factors.`,
      });
    if (pending) {
      snap(pending);
      pending = null;
    }
    fix(t);
    const bf = h(t.left) - h(t.right);
    if (bf > 1 || bf < -1) {
      const kind =
        bf > 1
          ? k < t.left!.key
            ? "LL"
            : "LR"
          : k > t.right!.key
            ? "RR"
            : "RL";
      const desc =
        kind === "LL"
          ? `right rotation at ${t.key}`
          : kind === "RR"
            ? `left rotation at ${t.key}`
            : kind === "LR"
              ? `left rotation at ${t.left!.key}, then right rotation at ${t.key}`
              : `right rotation at ${t.right!.key}, then left rotation at ${t.key}`;
      snap({
        kind: "rotate",
        visit: t.key,
        rotate: kind,
        title: `Unbalanced at ${t.key} (balance ${bf > 0 ? "+" : ""}${bf})`,
        text: `${k} went into the ${kind === "LL" ? "left subtree of the left child" : kind === "RR" ? "right subtree of the right child" : kind === "LR" ? "right subtree of the left child" : "left subtree of the right child"}: ${kind} case → ${desc}.`,
      });
      let nu: M;
      if (kind === "LL") nu = rotR(t);
      else if (kind === "RR") nu = rotL(t);
      else if (kind === "LR") {
        t.left = rotL(t.left!);
        nu = rotR(t);
      } else {
        t.right = rotR(t.right!);
        nu = rotL(t);
      }
      pending = {
        kind: "rotate",
        visit: nu.key,
        rotate: kind,
        title: `${kind} rotation done`,
        text: `${nu.key} is now the root of this subtree. Every balance factor is back in −1…+1, and the in-order order of keys is unchanged.`,
      };
      return nu;
    }
    return t;
  };
  for (const k of keys) {
    if (!root) {
      root = { key: k, left: null, right: null, height: 1 };
      snap({
        kind: "insert",
        visit: k,
        title: `Insert ${k}`,
        text: `${k} becomes the root.`,
      });
      continue;
    }
    root = ins(root, k);
    if (pending) {
      snap(pending);
      pending = null;
    }
  }
  snap({
    kind: "info",
    title: "Done",
    text: `${size(clone(root))} keys, height ${height(clone(root))}. An AVL tree of n keys has height < 1.44·log₂(n + 2).`,
  });
  return frames;
}

/* ---------- Red-black tree (CLRS insertion and fix-up) ---------- */
export function rbInsert(keys: number[]) {
  let root: M | null = null;
  const frames: TreeFrame[] = [];
  const snap = (f: Omit<TreeFrame, "root">) =>
    frames.push({ ...f, root: clone(root) });
  const color = (x: M | null | undefined) => x?.color ?? "B";
  const rotL = (x: M) => {
    const y = x.right!;
    x.right = y.left;
    if (y.left) y.left.parent = x;
    y.parent = x.parent;
    if (!x.parent) root = y;
    else if (x === x.parent.left) x.parent.left = y;
    else x.parent.right = y;
    y.left = x;
    x.parent = y;
  };
  const rotR = (x: M) => {
    const y = x.left!;
    x.left = y.right;
    if (y.right) y.right.parent = x;
    y.parent = x.parent;
    if (!x.parent) root = y;
    else if (x === x.parent.right) x.parent.right = y;
    else x.parent.left = y;
    y.right = x;
    x.parent = y;
  };
  for (const k of keys) {
    let p: M | null = null,
      cur = root,
      dup = false;
    while (cur) {
      if (k === cur.key) {
        dup = true;
        break;
      }
      snap({
        kind: "compare",
        visit: cur.key,
        title: `Insert ${k}: compare with ${cur.key}`,
        text: `${k} ${k < cur.key ? "<" : ">"} ${cur.key}, go ${k < cur.key ? "left" : "right"}.`,
      });
      p = cur;
      cur = k < cur.key ? cur.left : cur.right;
    }
    if (dup) continue;
    let z: M = { key: k, left: null, right: null, color: "R", parent: p };
    if (!p) root = z;
    else if (k < p.key) p.left = z;
    else p.right = z;
    snap({
      kind: "insert",
      visit: k,
      title: `Insert ${k} as a red leaf`,
      text: 'New nodes are red so that black-heights do not change. The only rule that can break is "a red node has no red child".',
    });
    while (color(z.parent) === "R") {
      const par = z.parent!,
        g = par.parent!,
        left = par === g.left,
        u = left ? g.right : g.left;
      if (color(u) === "R") {
        par.color = "B";
        u!.color = "B";
        g.color = "R";
        snap({
          kind: "recolor",
          visit: g.key,
          focus: [par.key, u!.key],
          title: "Case 1: uncle is red → recolor",
          text: `Parent ${par.key} and uncle ${u!.key} turn black, grandparent ${g.key} turns red. The problem may move up to ${g.key}.`,
        });
        z = g;
        continue;
      }
      if (left ? z === par.right : z === par.left) {
        snap({
          kind: "rotate",
          visit: par.key,
          title: `Case 2: ${k === z.key ? k : z.key} is an inner ("triangle") child`,
          text: `Rotate ${left ? "left" : "right"} at parent ${par.key} to turn the triangle into a line (case 3).`,
        });
        z = par;
        left ? rotL(z) : rotR(z);
        snap({
          kind: "rotate",
          visit: z.parent!.key,
          title: "Case 2 rotation done",
          text: "Now the red child and red parent lie in a straight line.",
        });
      }
      const p2 = z.parent!,
        g2 = p2.parent!;
      p2.color = "B";
      g2.color = "R";
      snap({
        kind: "recolor",
        visit: p2.key,
        focus: [g2.key],
        title: "Case 3: line → recolor",
        text: `Parent ${p2.key} turns black and grandparent ${g2.key} turns red, then rotate ${left ? "right" : "left"} at ${g2.key}.`,
      });
      left ? rotR(g2) : rotL(g2);
      snap({
        kind: "rotate",
        visit: p2.key,
        title: "Case 3 rotation done",
        text: `${p2.key} (black) now sits above two red children: no red-red violation remains.`,
      });
    }
    if (root!.color === "R") {
      root!.color = "B";
      snap({
        kind: "recolor",
        visit: root!.key,
        title: "Color the root black",
        text: "The root is always black.",
      });
    }
  }
  snap({
    kind: "info",
    title: "Done",
    text: `${size(clone(root))} keys, height ${height(clone(root))}. A red-black tree has height ≤ 2·log₂(n + 1).`,
  });
  return frames;
}
/** Checks the red-black rules; returns the black-height, or −1 if a rule is broken. */
export function rbBlackHeight(t: TNode | null): number {
  if (!t) return 1;
  if (t.color === "R" && (t.left?.color === "R" || t.right?.color === "R"))
    return -1;
  const l = rbBlackHeight(t.left),
    r = rbBlackHeight(t.right);
  if (l < 0 || r < 0 || l !== r) return -1;
  return l + (t.color === "B" ? 1 : 0);
}

/* ---------- B-tree (CLRS, minimum degree t; split full nodes on the way down) ---------- */
export interface BNode {
  keys: number[];
  children: BNode[];
}
export interface BFrame {
  root: BNode;
  focus?: number[];
  split?: number;
  text: string;
  title: string;
  kind: "descend" | "split" | "insert" | "info";
}
const bclone = (b: BNode): BNode => ({
  keys: [...b.keys],
  children: b.children.map(bclone),
});
export function bTreeInsert(keys: number[], t: number) {
  let root: BNode = { keys: [], children: [] };
  const frames: BFrame[] = [],
    max = 2 * t - 1;
  const snap = (f: Omit<BFrame, "root">) =>
    frames.push({ ...f, root: bclone(root) });
  const splitChild = (x: BNode, i: number) => {
    const y = x.children[i],
      mid = y.keys[t - 1];
    const z: BNode = { keys: y.keys.slice(t), children: y.children.slice(t) };
    y.keys = y.keys.slice(0, t - 1);
    y.children = y.children.slice(0, t);
    x.keys.splice(i, 0, mid);
    x.children.splice(i + 1, 0, z);
    return mid;
  };
  for (const k of keys) {
    if (contains(root, k)) continue;
    if (root.keys.length === max) {
      const s: BNode = { keys: [], children: [root] };
      snap({
        kind: "split",
        focus: [...root.keys],
        title: `Insert ${k}: the root is full`,
        text: `The root holds 2t − 1 = ${max} keys. Split it before descending; this is the only way a B-tree grows taller.`,
      });
      root = s;
      const mid = splitChild(s, 0);
      snap({
        kind: "split",
        split: mid,
        focus: [mid],
        title: `Root split: ${mid} moves up`,
        text: `The median ${mid} becomes the new root; the height grows by one at the top, so all leaves stay at the same depth.`,
      });
    }
    let x = root;
    for (;;) {
      let i = x.keys.findIndex((v) => k < v);
      if (i < 0) i = x.keys.length;
      if (!x.children.length) {
        x.keys.splice(i, 0, k);
        snap({
          kind: "insert",
          focus: [k],
          title: `Insert ${k} into a leaf`,
          text: `The leaf had room (fewer than ${max} keys), so ${k} is placed in sorted position.`,
        });
        break;
      }
      snap({
        kind: "descend",
        focus: [...x.keys],
        title: `Insert ${k}: descend from [${x.keys.join(", ")}]`,
        text: `${k} belongs in child ${i} (${i === 0 ? `before ${x.keys[0]}` : i === x.keys.length ? `after ${x.keys[i - 1]}` : `between ${x.keys[i - 1]} and ${x.keys[i]}`}).`,
      });
      if (x.children[i].keys.length === max) {
        const full = [...x.children[i].keys];
        const mid = splitChild(x, i);
        snap({
          kind: "split",
          split: mid,
          focus: [mid],
          title: `Child [${full.join(", ")}] is full: split`,
          text: `Split it before descending, so a later split never has to travel back up. The median ${mid} moves into the parent.`,
        });
        if (k > mid) i++;
      }
      x = x.children[i];
    }
  }
  snap({
    kind: "info",
    title: "Done",
    text: `Minimum degree t = ${t}: every node except the root holds ${t - 1}…${max} keys, and all leaves are at the same depth.`,
  });
  return frames;
}
const contains = (b: BNode, k: number): boolean =>
  b.keys.includes(k) || b.children.some((c) => contains(c, k));
export const bHeight = (b: BNode): number =>
  b.children.length ? 1 + bHeight(b.children[0]) : b.keys.length ? 1 : 0;
export const bKeys = (b: BNode): number[] =>
  b.children.length
    ? b.children.flatMap((c, i) => [
        ...bKeys(c),
        ...(i < b.keys.length ? [b.keys[i]] : []),
      ])
    : [...b.keys];

/** Heights after inserting keys 1..n in sorted order (the BST worst case) and in random order, for each tree. */
export function heightStudy(maxN = 31) {
  const finalTree = (fr: TreeFrame[]) => fr[fr.length - 1].root;
  return Array.from({ length: maxN }, (_, i) => {
    const n = i + 1,
      sorted = Array.from({ length: n }, (_, k) => k + 1);
    let rnd = 0;
    for (let s = 0; s < 20; s++) {
      const r = mulberry(50 + s),
        p = [...sorted];
      for (let a = p.length - 1; a > 0; a--) {
        const b = Math.floor(r() * (a + 1));
        [p[a], p[b]] = [p[b], p[a]];
      }
      rnd += height(finalTree(bstOps(p)));
    }
    return {
      n,
      bstSorted: height(finalTree(bstOps(sorted))),
      bstRandom: +(rnd / 20).toFixed(2),
      avl: height(finalTree(avlInsert(sorted))),
      rb: height(finalTree(rbInsert(sorted))),
      log: Math.floor(Math.log2(n)) + 1,
    };
  });
}
function mulberry(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
