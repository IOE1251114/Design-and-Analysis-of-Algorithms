/* Unit 1 — algorithm analysis.
 * Every visual in Unit 1 is drawn from these pure, deterministic functions (no randomness),
 * so the same input always produces the same trace, chart and count.
 * unit1.test.ts checks each trace against its closed-form formula. */

/* ---------- Growth classes (shared by every chart; colour follows the class) ---------- */
export type GrowthId = "one" | "log" | "n" | "nlogn" | "n2" | "exp";
export const growthOrder: GrowthId[] = [
  "one",
  "log",
  "n",
  "nlogn",
  "n2",
  "exp",
];
export const growth: Record<
  GrowthId,
  { label: string; theta: string; f: (n: number) => number; doubling: string }
> = {
  one: { label: "1", theta: "Θ(1)", f: () => 1, doubling: "stays the same" },
  log: {
    label: "log₂ n",
    theta: "Θ(log n)",
    f: (n) => Math.log2(n),
    doubling: "grows by +1",
  },
  n: { label: "n", theta: "Θ(n)", f: (n) => n, doubling: "doubles (×2)" },
  nlogn: {
    label: "n log₂ n",
    theta: "Θ(n log n)",
    f: (n) => n * Math.log2(n),
    doubling: "slightly more than doubles",
  },
  n2: {
    label: "n²",
    theta: "Θ(n²)",
    f: (n) => n * n,
    doubling: "quadruples (×4)",
  },
  exp: { label: "2ⁿ", theta: "Θ(2ⁿ)", f: (n) => 2 ** n, doubling: "squares" },
};

/* ---------- RAM model: line-by-line cost traces ---------- */
export type RamProgramId = "constant" | "linear" | "quadratic";
export interface RamLine {
  code: string;
  cost: number;
  why: string;
}
export interface RamStep {
  line: number;
  cost: number;
  total: number;
  vars: Record<string, number | string>;
  arr: number[];
  active: number[];
  note: string;
}
export interface RamProgram {
  title: string;
  growth: GrowthId;
  lines: RamLine[];
  formula: string;
  count: (n: number) => number;
}

export const RAM_MAX_N = 20;
export const ramInput = (n: number) =>
  [7, 3, 9, 2, 8, 4, 6, 1, 5, 10, 12, 11, 15, 13, 18, 14, 20, 16, 19, 17].slice(
    0,
    Math.max(1, Math.min(RAM_MAX_N, n)),
  );

export const ramPrograms: Record<RamProgramId, RamProgram> = {
  constant: {
    title: "Swap first and last",
    growth: "one",
    formula: "T(n) = 2 + 2 + 2 = 6",
    count: () => 6,
    lines: [
      { code: "t ← A[1]", cost: 2, why: "read A[1], assign t" },
      { code: "A[1] ← A[n]", cost: 2, why: "read A[n], write A[1]" },
      { code: "A[n] ← t", cost: 2, why: "read t, write A[n]" },
    ],
  },
  linear: {
    title: "Sum an array",
    growth: "n",
    formula: "T(n) = 1 + (n+1) + 3n + 1 = 4n + 3",
    count: (n) => 4 * n + 3,
    lines: [
      { code: "s ← 0", cost: 1, why: "one assignment" },
      {
        code: "for i ← 1 to n",
        cost: 1,
        why: "one test of i ≤ n (runs n+1 times)",
      },
      { code: "    s ← s + A[i]", cost: 3, why: "read A[i], add, assign" },
      { code: "return s", cost: 1, why: "one return" },
    ],
  },
  quadratic: {
    title: "Visit every pair",
    growth: "n2",
    formula: "T(n) = 1 + (n+1) + n(n+1) + 2n² + 1 = 3n² + 2n + 3",
    count: (n) => 3 * n * n + 2 * n + 3,
    lines: [
      { code: "c ← 0", cost: 1, why: "one assignment" },
      {
        code: "for i ← 1 to n",
        cost: 1,
        why: "one test of i ≤ n (runs n+1 times)",
      },
      {
        code: "    for j ← 1 to n",
        cost: 1,
        why: "one test of j ≤ n (n+1 times per i)",
      },
      { code: "        c ← c + 1", cost: 2, why: "add, assign" },
      { code: "return c", cost: 1, why: "one return" },
    ],
  },
};

export function ramTrace(id: RamProgramId, n: number): RamStep[] {
  const arr = ramInput(n),
    len = arr.length,
    lines = ramPrograms[id].lines;
  const steps: RamStep[] = [];
  let total = 0;
  const push = (
    line: number,
    vars: Record<string, number | string>,
    a: number[],
    active: number[],
    note: string,
  ) => {
    total += lines[line].cost;
    steps.push({
      line,
      cost: lines[line].cost,
      total,
      vars: { ...vars },
      arr: [...a],
      active,
      note,
    });
  };
  if (id === "constant") {
    const a = [...arr];
    const t = a[0];
    push(0, { t }, a, [0], `Copy A[1] = ${t} into t.`);
    a[0] = a[len - 1];
    push(1, { t }, a, [0, len - 1], `Overwrite A[1] with A[n] = ${a[0]}.`);
    a[len - 1] = t;
    push(
      2,
      { t },
      a,
      [len - 1],
      `Write t = ${t} into A[n]. The cost never depended on n.`,
    );
  } else if (id === "linear") {
    let s = 0;
    push(0, { s }, arr, [], "Initialise the running sum.");
    for (let i = 1; ; i++) {
      const ok = i <= len;
      push(
        1,
        { s, i },
        arr,
        [],
        ok
          ? `Test ${i} ≤ ${len}: true, enter the body.`
          : `Test ${i} ≤ ${len}: false, leave the loop.`,
      );
      if (!ok) break;
      s += arr[i - 1];
      push(
        2,
        { s, i },
        arr,
        [i - 1],
        `Add A[${i}] = ${arr[i - 1]}; s is now ${s}.`,
      );
    }
    push(3, { s }, arr, [], `Return ${s}.`);
  } else {
    let c = 0;
    push(0, { c }, arr, [], "Initialise the counter.");
    for (let i = 1; ; i++) {
      const okI = i <= len;
      push(
        1,
        { c, i },
        arr,
        [],
        okI
          ? `Test ${i} ≤ ${len}: true, start row i = ${i}.`
          : `Test ${i} ≤ ${len}: false, leave the outer loop.`,
      );
      if (!okI) break;
      for (let j = 1; ; j++) {
        const okJ = j <= len;
        push(
          2,
          { c, i, j },
          arr,
          okJ ? [i - 1, j - 1] : [],
          okJ
            ? `Test ${j} ≤ ${len}: true, visit pair (${i}, ${j}).`
            : `Test ${j} ≤ ${len}: false, row i = ${i} done.`,
        );
        if (!okJ) break;
        c++;
        push(
          3,
          { c, i, j },
          arr,
          [i - 1, j - 1],
          `Count pair (${i}, ${j}); c = ${c}.`,
        );
      }
    }
    push(4, { c }, arr, [], `Return ${c} = n².`);
  }
  return steps;
}

/* ---------- Asymptotic bounds: find the real n₀ for f(n) ≤ c·g(n) or f(n) ≥ c·g(n) ---------- */
export type BoundG = "n" | "n2" | "n3";
export const boundG: Record<
  BoundG,
  { label: string; f: (n: number) => number }
> = {
  n: { label: "n", f: (n) => n },
  n2: { label: "n²", f: (n) => n * n },
  n3: { label: "n³", f: (n) => n ** 3 },
};
export interface Quad {
  a: number;
  b: number;
  c: number;
}
export const quad = (q: Quad) => (n: number) => q.a * n * n + q.b * n + q.c;
/** The difference is a polynomial whose real roots lie below ~1 + 50/0.5 = 101 for the slider ranges,
 *  so scanning to 2000 and testing at 10⁶ gives the exact eventual behaviour and the exact smallest n₀. */
const SCAN = 2000;
export function witness(
  q: Quad,
  g: BoundG,
  k: number,
  kind: "upper" | "lower",
): { holds: boolean; n0: number | null } {
  const f = quad(q),
    gf = boundG[g].f;
  const ok = (n: number) =>
    kind === "upper" ? f(n) <= k * gf(n) : f(n) >= k * gf(n);
  if (!ok(1e6)) return { holds: false, n0: null };
  let n0 = 1;
  for (let n = SCAN; n >= 1; n--)
    if (!ok(n)) {
      n0 = n + 1;
      break;
    }
  return { holds: true, n0 };
}

/* ---------- Loop patterns: every iteration as a cell, in execution order ---------- */
export type PatternId =
  "constant" | "linear" | "log" | "triangular" | "nlogn" | "quadratic";
export interface Pattern {
  label: string;
  code: string[];
  growth: GrowthId;
  sum: string;
  closed: string;
  count: (n: number) => number;
}
const lg = (n: number) => Math.floor(Math.log2(n)) + 1; // iterations of "while i ≥ 1: i ← ⌊i/2⌋" starting at n
export const patterns: Record<PatternId, Pattern> = {
  constant: {
    label: "Constant",
    growth: "one",
    code: ["x ← A[1]", "y ← A[2]", "z ← x + y"],
    sum: "1 + 1 + 1",
    closed: "3",
    count: () => 3,
  },
  linear: {
    label: "Linear",
    growth: "n",
    code: ["for i ← 1 to n", "    work()"],
    sum: "Σᵢ₌₁ⁿ 1",
    closed: "n",
    count: (n) => n,
  },
  log: {
    label: "Logarithmic",
    growth: "log",
    code: ["i ← n", "while i ≥ 1", "    work()", "    i ← ⌊i / 2⌋"],
    sum: "1 per halving",
    closed: "⌊log₂ n⌋ + 1",
    count: lg,
  },
  triangular: {
    label: "Triangular",
    growth: "n2",
    code: ["for i ← 1 to n", "    for j ← 1 to i", "        work()"],
    sum: "Σᵢ₌₁ⁿ i",
    closed: "n(n+1)/2",
    count: (n) => (n * (n + 1)) / 2,
  },
  nlogn: {
    label: "Linearithmic",
    growth: "nlogn",
    code: [
      "for i ← 1 to n",
      "    j ← n",
      "    while j ≥ 1",
      "        work(); j ← ⌊j / 2⌋",
    ],
    sum: "Σᵢ₌₁ⁿ (⌊log₂ n⌋ + 1)",
    closed: "n(⌊log₂ n⌋ + 1)",
    count: (n) => n * lg(n),
  },
  quadratic: {
    label: "Quadratic",
    growth: "n2",
    code: ["for i ← 1 to n", "    for j ← 1 to n", "        work()"],
    sum: "Σᵢ₌₁ⁿ n",
    closed: "n²",
    count: (n) => n * n,
  },
};
/** Iterations in execution order. row/col place each one on the grid; label says which loop values it ran with. */
export function patternCells(
  id: PatternId,
  n: number,
): { row: number; col: number; label: string }[] {
  const out: { row: number; col: number; label: string }[] = [];
  if (id === "constant")
    for (let k = 0; k < 3; k++)
      out.push({ row: 0, col: k, label: `statement ${k + 1}` });
  if (id === "linear")
    for (let i = 1; i <= n; i++)
      out.push({ row: 0, col: i - 1, label: `i = ${i}` });
  if (id === "log") {
    let r = 0;
    for (let i = n; i >= 1; i = Math.floor(i / 2))
      out.push({ row: r++, col: 0, label: `i = ${i}` });
  }
  if (id === "triangular")
    for (let i = 1; i <= n; i++)
      for (let j = 1; j <= i; j++)
        out.push({ row: i - 1, col: j - 1, label: `i = ${i}, j = ${j}` });
  if (id === "quadratic")
    for (let i = 1; i <= n; i++)
      for (let j = 1; j <= n; j++)
        out.push({ row: i - 1, col: j - 1, label: `i = ${i}, j = ${j}` });
  if (id === "nlogn")
    for (let i = 1; i <= n; i++) {
      let r = 0;
      for (let j = n; j >= 1; j = Math.floor(j / 2))
        out.push({ row: r++, col: i - 1, label: `i = ${i}, j = ${j}` });
    }
  return out;
}

/* ---------- Recursion trees and the Master Theorem (T(n) = a·T(n/2) + n^d, T(1) = 1) ---------- */
export interface Recurrence {
  id: string;
  a: number;
  d: 0 | 1 | 2;
  name: string;
  example: string;
}
export const recurrences: Recurrence[] = [
  {
    id: "bsearch",
    a: 1,
    d: 0,
    name: "T(n) = T(n/2) + 1",
    example: "Binary search",
  },
  {
    id: "halve",
    a: 1,
    d: 1,
    name: "T(n) = T(n/2) + n",
    example: "Halve, then scan",
  },
  {
    id: "tree",
    a: 2,
    d: 0,
    name: "T(n) = 2T(n/2) + 1",
    example: "Tree traversal / max of array",
  },
  {
    id: "merge",
    a: 2,
    d: 1,
    name: "T(n) = 2T(n/2) + n",
    example: "Merge sort",
  },
  {
    id: "mult",
    a: 4,
    d: 1,
    name: "T(n) = 4T(n/2) + n",
    example: "Naive divide-and-conquer multiply",
  },
  {
    id: "sq",
    a: 2,
    d: 2,
    name: "T(n) = 2T(n/2) + n²",
    example: "Quadratic combine step",
  },
];
const pow = (d: number) =>
  d === 0 ? "1" : d === 1 ? "n" : `n${d === 2 ? "²" : "³"}`;
export function recursionTree(r: Recurrence, n: number) {
  const depth = Math.round(Math.log2(n));
  const levels = Array.from({ length: depth + 1 }, (_, k) => {
    const nodes = r.a ** k,
      size = n / 2 ** k,
      perNode = size ** r.d;
    return { k, nodes, size, perNode, total: nodes * perNode };
  });
  const total = levels.reduce((s, l) => s + l.total, 0);
  const crit = Math.log2(r.a); // log_b a with b = 2
  const caseNo = r.d < crit ? 1 : r.d === crit ? 2 : 3;
  const theta =
    caseNo === 1
      ? `Θ(${pow(crit)})`
      : caseNo === 2
        ? r.d === 0
          ? "Θ(log n)"
          : `Θ(${pow(r.d)} log n)`
        : `Θ(${pow(r.d)})`;
  const shape =
    caseNo === 1
      ? "Level costs grow toward the leaves: the leaves dominate."
      : caseNo === 2
        ? "Every level costs the same: total = (one level) × (number of levels)."
        : "Level costs shrink toward the leaves: the root dominates.";
  return {
    levels,
    total,
    crit,
    critLabel: pow(crit),
    caseNo,
    theta,
    shape,
    fLabel: pow(r.d),
  };
}

/* ---------- Divide and conquer: merge sort, one comparison per frame ---------- */
export interface MsNode {
  lo: number;
  hi: number;
  depth: number;
  key: string;
}
export interface MsFrame {
  phase: "divide" | "merge";
  visibleDepth: number;
  /** Node currently being merged (merge phase only). */
  node?: string;
  left?: number[];
  right?: number[];
  i?: number;
  j?: number;
  out?: number[];
  /** Sorted contents of every node whose merge has finished. */
  done: Record<string, number[]>;
  comparisons: number;
  title: string;
  detail: string;
}
export function mergeSortTrace(input: number[]) {
  const nodes: MsNode[] = [];
  const build = (lo: number, hi: number, depth: number) => {
    nodes.push({ lo, hi, depth, key: `${lo}-${hi}` });
    if (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      build(lo, m, depth + 1);
      build(m, hi, depth + 1);
    }
  };
  build(0, input.length, 0);
  const maxDepth = Math.max(...nodes.map((x) => x.depth));
  const frames: MsFrame[] = [];
  const done: Record<string, number[]> = {};
  for (let i = 0; i < input.length; i++) done[`${i}-${i + 1}`] = [input[i]];
  let comparisons = 0;
  for (let d = 0; d <= maxDepth; d++)
    frames.push({
      phase: "divide",
      visibleDepth: d,
      done: {},
      comparisons: 0,
      title:
        d === 0
          ? "Divide: the whole input is one problem"
          : d === maxDepth
            ? `Divide: level ${d} reaches the base case`
            : `Divide: level ${d}`,
      detail:
        d === 0
          ? `One unsorted problem of size n = ${input.length}.`
          : d === maxDepth
            ? "Every piece has size 1. A single element is already sorted, so the recursion stops here."
            : `Split every piece at its middle: ${2 ** d} subproblems of size about n/${2 ** d}. Dividing costs only O(1) per piece.`,
    });
  const sorted = (lo: number, hi: number): number[] => {
    if (hi - lo <= 1) return input.slice(lo, hi);
    const m = (lo + hi) >> 1,
      L = sorted(lo, m),
      R = sorted(m, hi),
      key = `${lo}-${hi}`,
      out: number[] = [];
    let i = 0,
      j = 0;
    const snap = (title: string, detail: string, ii = i, jj = j) =>
      frames.push({
        phase: "merge",
        visibleDepth: maxDepth,
        node: key,
        left: L,
        right: R,
        i: ii,
        j: jj,
        out: [...out],
        done: { ...done },
        comparisons,
        title,
        detail,
      });
    while (i < L.length && j < R.length) {
      comparisons++;
      const takeLeft = L[i] <= R[j],
        ii = i,
        jj = j;
      out.push(takeLeft ? L[i++] : R[j++]);
      snap(
        `Combine [${L.join(", ")}] + [${R.join(", ")}]`,
        `Compare ${L[ii]} with ${R[jj]}: ${takeLeft ? `${L[ii]} ≤ ${R[jj]}, take ${L[ii]} from the left run` : `${R[jj]} < ${L[ii]}, take ${R[jj]} from the right run`}.`,
        ii,
        jj,
      );
    }
    const rest = [...L.slice(i), ...R.slice(j)];
    if (rest.length) {
      out.push(...rest);
      snap(
        `Combine [${L.join(", ")}] + [${R.join(", ")}]`,
        `One run is empty, so copy the rest (${rest.join(", ")}) without comparing.`,
        L.length,
        R.length,
      );
    }
    done[key] = [...out];
    frames.push({
      phase: "merge",
      visibleDepth: maxDepth,
      node: key,
      left: L,
      right: R,
      i: L.length,
      j: R.length,
      out: [...out],
      done: { ...done },
      comparisons,
      title: `Merged [${out.join(", ")}]`,
      detail: `This piece of ${hi - lo} elements is sorted. Merging it took at most ${hi - lo - 1} comparisons.`,
    });
    return out;
  };
  const result = sorted(0, input.length);
  return { nodes, maxDepth, frames, result, comparisons };
}

/* ---------- Greedy: coin change, greedy vs optimal ---------- */
export function greedyCoins(coins: number[], amount: number): number[] {
  const out: number[] = [];
  let left = amount;
  for (const c of [...coins].sort((a, b) => b - a))
    while (left >= c) {
      out.push(c);
      left -= c;
    }
  return left === 0 ? out : [];
}
/** Greedy, one irrevocable choice per step: which coin was taken, the amount before and after, and the larger coins skipped. */
export function greedySteps(coins: number[], amount: number) {
  const desc = [...coins].sort((a, b) => b - a),
    steps: {
      coin: number;
      before: number;
      after: number;
      skipped: number[];
    }[] = [];
  let left = amount;
  while (left > 0) {
    const coin = desc.find((c) => c <= left)!;
    steps.push({
      coin,
      before: left,
      after: left - coin,
      skipped: desc.filter((c) => c > left),
    });
    left -= coin;
  }
  return steps;
}
export function optimalCoins(coins: number[], amount: number): number[] {
  const best: (number[] | null)[] = Array(amount + 1).fill(null);
  best[0] = [];
  for (let v = 1; v <= amount; v++)
    for (const c of coins) {
      const prev = v >= c ? best[v - c] : null;
      if (prev && (!best[v] || prev.length + 1 < best[v]!.length))
        best[v] = [...prev, c].sort((x, y) => y - x);
    }
  return best[amount] ?? [];
}

/* ---------- Backtracking: N-Queens search trace (stops at the first solution) ---------- */
export type QueenEvent = {
  kind: "place" | "reject" | "backtrack" | "solved";
  row: number;
  col: number;
  queens: number[];
  attackers: number[];
};
export function queensTrace(N: number): QueenEvent[] {
  const ev: QueenEvent[] = [],
    q: number[] = [];
  const attackers = (r: number, c: number) =>
    q
      .map((qc, qr) =>
        qc === c || Math.abs(qc - c) === Math.abs(qr - r) ? qr : -1,
      )
      .filter((x) => x >= 0);
  const solve = (r: number): boolean => {
    if (r === N) {
      ev.push({
        kind: "solved",
        row: r - 1,
        col: q[r - 1],
        queens: [...q],
        attackers: [],
      });
      return true;
    }
    for (let c = 0; c < N; c++) {
      const at = attackers(r, c);
      if (at.length) {
        ev.push({
          kind: "reject",
          row: r,
          col: c,
          queens: [...q],
          attackers: at,
        });
        continue;
      }
      q.push(c);
      ev.push({ kind: "place", row: r, col: c, queens: [...q], attackers: [] });
      if (solve(r + 1)) return true;
      q.pop();
      ev.push({
        kind: "backtrack",
        row: r,
        col: c,
        queens: [...q],
        attackers: [],
      });
    }
    return false;
  };
  solve(0);
  return ev;
}
/** The state-space tree that the search above explores. Each node remembers when it appeared and when it died,
 *  so the tree can be drawn exactly as it stood at any step. x is a leaf-order layout position. */
export interface QNode {
  id: number;
  parent: number;
  depth: number;
  col: number;
  kind: "root" | "place" | "reject";
  born: number;
  died: number | null;
  solution: boolean;
  x: number;
  children: number[];
}
export function queensTree(events: QueenEvent[]) {
  const nodes: QNode[] = [
    {
      id: 0,
      parent: -1,
      depth: 0,
      col: -1,
      kind: "root",
      born: -1,
      died: null,
      solution: false,
      x: 0,
      children: [],
    },
  ];
  let cur = 0;
  const current: number[] = [];
  events.forEach((e, k) => {
    if (e.kind === "place" || e.kind === "reject") {
      const id = nodes.length;
      nodes.push({
        id,
        parent: cur,
        depth: nodes[cur].depth + 1,
        col: e.col,
        kind: e.kind,
        born: k,
        died: e.kind === "reject" ? k : null,
        solution: false,
        x: 0,
        children: [],
      });
      nodes[cur].children.push(id);
      if (e.kind === "place") cur = id;
    } else if (e.kind === "backtrack") {
      nodes[cur].died = k;
      cur = nodes[cur].parent;
    } else {
      for (let n = cur; n > 0; n = nodes[n].parent) nodes[n].solution = true;
    }
    current.push(cur);
  });
  let slot = 0;
  const lay = (id: number) => {
    const n = nodes[id];
    if (!n.children.length) {
      n.x = slot++;
      return;
    }
    n.children.forEach(lay);
    n.x =
      (nodes[n.children[0]].x + nodes[n.children[n.children.length - 1]].x) / 2;
  };
  lay(0);
  return { nodes, leaves: slot, current };
}

/* ---------- Branch and bound: 0/1 knapsack with the fractional (greedy) upper bound ----------
 * One frame per node taken from the live-node list. The strategy only decides WHICH live node is expanded next:
 * LIFO = stack (depth-first), FIFO = queue (breadth-first), LC = largest bound first (best-first). */
export type BBStrategy = "lifo" | "fifo" | "lc";
export interface BBItem {
  name: string;
  w: number;
  v: number;
}
export interface BBLive {
  id: string;
  bound: number | null;
}
export interface BBNode {
  id: string;
  depth: number;
  path: number[];
  w: number;
  v: number;
  bound: number;
  status: "expanded" | "pruned" | "infeasible" | "leaf";
  incumbent: number;
  note: string;
  live: BBLive[];
}
export const bbItems: BBItem[] = [
  { name: "Item 1", w: 2, v: 12 },
  { name: "Item 2", w: 3, v: 20 },
  { name: "Item 3", w: 4, v: 24 },
  { name: "Item 4", w: 5, v: 25 },
];
export function branchAndBound(
  items: BBItem[],
  cap: number,
  strategy: BBStrategy = "lifo",
) {
  const order = items
    .map((it, i) => ({ ...it, i }))
    .sort((a, b) => b.v / b.w - a.v / a.w || a.i - b.i);
  const bound = (depth: number, w: number, v: number) => {
    let b = v,
      room = cap - w;
    for (let k = depth; k < order.length && room > 0; k++) {
      const take = Math.min(1, room / order[k].w);
      b += take * order[k].v;
      room -= take * order[k].w;
    }
    return b;
  };
  type Live = {
    depth: number;
    path: number[];
    w: number;
    v: number;
    bound: number | null;
    seq: number;
  };
  let seq = 0;
  const make = (depth: number, path: number[], w: number, v: number): Live => ({
    depth,
    path,
    w,
    v,
    bound: w > cap ? null : bound(depth, w, v),
    seq: seq++,
  });
  const live: Live[] = [make(0, [], 0, 0)];
  const take = (): Live => {
    if (strategy === "lifo") return live.pop()!;
    if (strategy === "fifo") return live.shift()!;
    let k = 0;
    for (let m = 1; m < live.length; m++) {
      const a = live[m].bound ?? -1,
        b = live[k].bound ?? -1;
      if (a > b || (a === b && live[m].seq < live[k].seq)) k = m;
    }
    return live.splice(k, 1)[0];
  };
  const snapshot = (): BBLive[] => {
    const xs = live.map((x) => ({
      id: x.path.join("") || "root",
      bound: x.bound,
      seq: x.seq,
    }));
    const ordered =
      strategy === "lifo"
        ? [...xs].reverse()
        : strategy === "fifo"
          ? xs
          : [...xs].sort(
              (a, b) => (b.bound ?? -1) - (a.bound ?? -1) || a.seq - b.seq,
            );
    return ordered.map(({ id, bound }) => ({ id, bound }));
  };
  const visited: BBNode[] = [];
  let best = 0,
    bestPath: number[] = [];
  while (live.length) {
    const n = take(),
      id = n.path.join("") || "root",
      base = { id, depth: n.depth, path: n.path, w: n.w, v: n.v };
    if (n.bound === null) {
      visited.push({
        ...base,
        bound: 0,
        status: "infeasible",
        incumbent: best,
        note: `Weight ${n.w} > capacity ${cap}: infeasible, discard.`,
        live: snapshot(),
      });
      continue;
    }
    if (n.depth === order.length) {
      const improved = n.v > best;
      if (improved) {
        best = n.v;
        bestPath = n.path;
      }
      visited.push({
        ...base,
        bound: n.v,
        status: "leaf",
        incumbent: best,
        note: improved
          ? `Complete solution worth ${n.v}: new best.`
          : `Complete solution worth ${n.v}: not better than ${best}.`,
        live: snapshot(),
      });
      continue;
    }
    if (n.bound <= best) {
      visited.push({
        ...base,
        bound: n.bound,
        status: "pruned",
        incumbent: best,
        note: `Bound ${fmt(n.bound)} ≤ best ${best}: no completion can win, prune.`,
        live: snapshot(),
      });
      continue;
    }
    const it = order[n.depth];
    const yes = make(n.depth + 1, [...n.path, 1], n.w + it.w, n.v + it.v),
      no = make(n.depth + 1, [...n.path, 0], n.w, n.v);
    if (strategy === "lifo") live.push(no, yes);
    else live.push(yes, no); // the "take it" child is always examined first
    visited.push({
      ...base,
      bound: n.bound,
      status: "expanded",
      incumbent: best,
      note: `Bound ${fmt(n.bound)} > best ${best}: branch on ${it.name}, adding both children to the live list.`,
      live: snapshot(),
    });
  }
  return {
    order,
    visited,
    best,
    bestPath,
    fullTree: 2 ** (order.length + 1) - 1,
  };
}
const fmt = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1));
