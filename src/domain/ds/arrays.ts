/* Unit I — data-structure basics, arrays, searching and sparse matrices.
 * Every function is pure and deterministic; visualizers replay the frames they return. */

/* ---------- Basic terminology: operation costs and the time–space trade-off ---------- */

export type Structure = "array" | "sorted" | "linked";
export type Operation =
  "traverse" | "search" | "insert-front" | "insert-end" | "delete" | "sort";

/** Worst-case element visits / moves for one operation on n items (unit-cost model). */
export function opCost(s: Structure, op: Operation, n: number): number {
  const log = Math.max(1, Math.ceil(Math.log2(n + 1)));
  const nlogn = Math.ceil(n * Math.log2(Math.max(2, n)));
  const table: Record<Structure, Record<Operation, number>> = {
    array: {
      traverse: n,
      search: n,
      "insert-front": n,
      "insert-end": 1,
      delete: n,
      sort: nlogn,
    },
    sorted: {
      traverse: n,
      search: log,
      "insert-front": n,
      "insert-end": n,
      delete: n,
      sort: 0,
    },
    linked: {
      traverse: n,
      search: n,
      "insert-front": 1,
      "insert-end": n,
      delete: n,
      sort: nlogn,
    },
  };
  return table[s][op];
}

/** q primality queries for numbers ≤ N: trial division every time vs one sieve table. */
export function primeTradeoff(N: number, q: number) {
  return {
    compute: { time: Math.ceil(q * Math.sqrt(N)), space: 1 },
    table: {
      time:
        Math.ceil(N * Math.log2(Math.max(2, Math.log2(Math.max(2, N))))) + q,
      space: N,
    },
  };
}

/* ---------- Representation of arrays in memory ---------- */

export type Bound = { lb: number; ub: number };
export type Order = "row" | "col";

export const extent = (b: Bound) => b.ub - b.lb + 1;

/** LOC(A[k]) = Base + w·(k − LB). */
export const address1D = (base: number, w: number, lb: number, k: number) =>
  base + w * (k - lb);

/**
 * Address of A[i₁, …, iₖ] for any number of dimensions.
 * Row-major varies the last index fastest; column-major varies the first fastest.
 */
export function addressND(
  base: number,
  w: number,
  dims: Bound[],
  idx: number[],
  order: Order,
) {
  const ds = order === "row" ? dims : [...dims].reverse();
  const is = order === "row" ? idx : [...idx].reverse();
  let offset = 0;
  ds.forEach((d, k) => {
    offset = offset * extent(d) + (is[k] - d.lb);
  });
  return { offset, address: base + w * offset };
}

/** Every index tuple in the order it is laid out in memory. */
export function layout(dims: Bound[], order: Order): number[][] {
  const out: number[][] = [];
  const rec = (k: number, cur: number[]) => {
    if (k === dims.length) {
      out.push([...cur]);
      return;
    }
    const d = order === "row" ? dims[k] : dims[dims.length - 1 - k];
    for (let i = d.lb; i <= d.ub; i++) {
      if (order === "row") cur[k] = i;
      else cur[dims.length - 1 - k] = i;
      rec(k + 1, cur);
    }
  };
  rec(0, new Array(dims.length).fill(0));
  return out;
}

/* ---------- Traversal, insertion and deletion ---------- */

export type Cell = number | null;
export type ArrayFrame = {
  a: Cell[];
  /** Index being read or written. */
  hi?: number;
  /** An element sliding from one index to another. */
  move?: [number, number];
  moves: number;
  title: string;
  text: string;
};

export function traverseFrames(a: Cell[], n: number): ArrayFrame[] {
  const frames: ArrayFrame[] = [
    {
      a: [...a],
      moves: 0,
      title: "Start: K = LB",
      text: "Traversal visits every element exactly once, from the lower bound to the upper bound.",
    },
  ];
  let sum = 0;
  for (let k = 0; k < n; k++) {
    sum += a[k] ?? 0;
    frames.push({
      a: [...a],
      hi: k,
      moves: 0,
      title: `Visit A[${k}] = ${a[k]}`,
      text: `Apply PROCESS to A[${k}] (here: add it to a running sum, now ${sum}).`,
    });
  }
  frames.push({
    a: [...a],
    moves: 0,
    title: `Done after ${n} visits`,
    text: `Traversal is Θ(n): every one of the ${n} elements was processed once. Sum = ${sum}.`,
  });
  return frames;
}

export function insertFrames(
  a: Cell[],
  n: number,
  pos: number,
  value: number,
): { frames: ArrayFrame[]; result: Cell[]; n: number } {
  const cur = [...a];
  const frames: ArrayFrame[] = [];
  if (n >= cur.length) {
    frames.push({
      a: cur,
      moves: 0,
      title: "Overflow",
      text: `The array is full (capacity ${cur.length}), so nothing can be inserted without allocating a larger block.`,
    });
    return { frames, result: cur, n };
  }
  const p = Math.max(0, Math.min(pos, n));
  frames.push({
    a: [...cur],
    hi: p,
    moves: 0,
    title: `Insert ${value} at index ${p}`,
    text: `Elements ${p}…${n - 1} must each move one place right to open a gap.`,
  });
  let moves = 0;
  for (let j = n - 1; j >= p; j--) {
    cur[j + 1] = cur[j];
    cur[j] = null;
    moves++;
    frames.push({
      a: [...cur],
      move: [j, j + 1],
      moves,
      title: `Shift A[${j}] → A[${j + 1}]`,
      text: "Shift from the right end first, so no value is overwritten before it moves.",
    });
  }
  cur[p] = value;
  frames.push({
    a: [...cur],
    hi: p,
    moves,
    title: `Write ${value} into A[${p}]`,
    text: `Done with ${moves} shifts. Inserting at the front costs n shifts, at the end 0.`,
  });
  return { frames, result: cur, n: n + 1 };
}

export function deleteFrames(
  a: Cell[],
  n: number,
  pos: number,
): { frames: ArrayFrame[]; result: Cell[]; n: number } {
  const cur = [...a];
  const frames: ArrayFrame[] = [];
  if (n === 0) {
    frames.push({
      a: cur,
      moves: 0,
      title: "Underflow",
      text: "The array is empty: there is nothing to delete.",
    });
    return { frames, result: cur, n };
  }
  const p = Math.max(0, Math.min(pos, n - 1));
  frames.push({
    a: [...cur],
    hi: p,
    moves: 0,
    title: `Delete A[${p}] = ${cur[p]}`,
    text: `Elements ${p + 1}…${n - 1} each move one place left to close the gap.`,
  });
  cur[p] = null;
  let moves = 0;
  for (let j = p + 1; j < n; j++) {
    cur[j - 1] = cur[j];
    cur[j] = null;
    moves++;
    frames.push({
      a: [...cur],
      move: [j, j - 1],
      moves,
      title: `Shift A[${j}] → A[${j - 1}]`,
      text: "Shift from the left, so each value lands in the slot just freed.",
    });
  }
  frames.push({
    a: [...cur],
    moves,
    title: `Done: ${moves} shifts`,
    text: "Deleting the last element needs no shifts; deleting the first needs n − 1.",
  });
  return { frames, result: cur, n: n - 1 };
}

/* ---------- Linear and binary search ---------- */

export type SearchFrame = {
  i?: number;
  lo?: number;
  hi?: number;
  mid?: number;
  found?: number;
  comparisons: number;
  title: string;
  text: string;
};

export function linearSearchFrames(a: number[], key: number): SearchFrame[] {
  const frames: SearchFrame[] = [];
  for (let i = 0; i < a.length; i++) {
    const hit = a[i] === key;
    frames.push({
      i,
      comparisons: i + 1,
      found: hit ? i : undefined,
      title: hit ? `Found ${key} at index ${i}` : `A[${i}] = ${a[i]} ≠ ${key}`,
      text: hit
        ? `Linear search stops at the first match after ${i + 1} comparisons.`
        : "Move to the next element. Linear search needs no ordering.",
    });
    if (hit) return frames;
  }
  frames.push({
    comparisons: a.length,
    title: `${key} is not in the array`,
    text: `Every one of the ${a.length} elements was compared: the worst case, Θ(n).`,
  });
  return frames;
}

export function binarySearchFrames(a: number[], key: number): SearchFrame[] {
  const frames: SearchFrame[] = [];
  let lo = 0,
    hi = a.length - 1,
    c = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    c++;
    if (a[mid] === key) {
      frames.push({
        lo,
        hi,
        mid,
        found: mid,
        comparisons: c,
        title: `A[${mid}] = ${key}: found`,
        text: `Found after ${c} comparisons; ⌈log₂(n + 1)⌉ = ${Math.ceil(Math.log2(a.length + 1))} is the worst case for n = ${a.length}.`,
      });
      return frames;
    }
    const goRight = a[mid] < key;
    frames.push({
      lo,
      hi,
      mid,
      comparisons: c,
      title: `A[${mid}] = ${a[mid]} ${goRight ? "<" : ">"} ${key}`,
      text: goRight
        ? `The key can only be right of mid: set BEG = ${mid + 1}. Half the range is discarded.`
        : `The key can only be left of mid: set END = ${mid - 1}. Half the range is discarded.`,
    });
    if (goRight) lo = mid + 1;
    else hi = mid - 1;
  }
  frames.push({
    lo,
    hi,
    comparisons: c,
    title: `${key} is not present`,
    text: `BEG > END after ${c} comparisons: the range is empty.`,
  });
  return frames;
}

/* ---------- Sparse matrices: triplets, transpose, fast transpose, multiplication ---------- */

export type Triplet = [row: number, col: number, value: number];
export type Sparse = { rows: number; cols: number; terms: Triplet[] };

export function toSparse(m: number[][]): Sparse {
  const terms: Triplet[] = [];
  m.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v !== 0) terms.push([r, c, v]);
    }),
  );
  return { rows: m.length, cols: m[0]?.length ?? 0, terms };
}

export function toDense(s: Sparse): number[][] {
  const m = Array.from({ length: s.rows }, () => new Array(s.cols).fill(0));
  for (const [r, c, v] of s.terms) m[r][c] += v;
  return m;
}

export type TransposeFrame = {
  /** Index into the source triplets being looked at. */
  scan?: number;
  /** Index in the result being written. */
  write?: number;
  out: (Triplet | null)[];
  rowTerms?: number[];
  startPos?: number[];
  steps: number;
  title: string;
  text: string;
};

/** Simple transpose: for each column, scan all terms — Θ(cols · terms). */
export function simpleTranspose(s: Sparse): TransposeFrame[] {
  const out: (Triplet | null)[] = new Array(s.terms.length).fill(null);
  const frames: TransposeFrame[] = [];
  let k = 0,
    steps = 0;
  for (let c = 0; c < s.cols; c++) {
    for (let i = 0; i < s.terms.length; i++) {
      steps++;
      const [r, col, v] = s.terms[i];
      const hit = col === c;
      if (hit) out[k] = [col, r, v];
      frames.push({
        scan: i,
        write: hit ? k : undefined,
        out: [...out],
        steps,
        title: `Column ${c}: term ${i} is (${r}, ${col}, ${v})`,
        text: hit
          ? `Its column is ${c}, so it becomes row ${c} of the transpose: write (${col}, ${r}, ${v}).`
          : `Column ${col} ≠ ${c}: skip it. Every column rescans the whole list.`,
      });
      if (hit) k++;
    }
  }
  frames.push({
    out: [...out],
    steps,
    title: `Done after ${steps} term inspections`,
    text: `cols × terms = ${s.cols} × ${s.terms.length} = ${s.cols * s.terms.length}. Fine for a few columns, slow for wide matrices.`,
  });
  return frames;
}

/** Fast transpose: count terms per column, prefix-sum into start positions, place each term once. */
export function fastTranspose(s: Sparse): TransposeFrame[] {
  const out: (Triplet | null)[] = new Array(s.terms.length).fill(null);
  const rowTerms = new Array(s.cols).fill(0);
  const frames: TransposeFrame[] = [];
  let steps = 0;
  s.terms.forEach(([, c], i) => {
    rowTerms[c]++;
    steps++;
    frames.push({
      scan: i,
      out: [...out],
      rowTerms: [...rowTerms],
      steps,
      title: `Count: column ${c} gets one more term`,
      text: "Pass 1 counts how many terms each column has; these become row lengths of the transpose.",
    });
  });
  const startPos = new Array(s.cols).fill(0);
  for (let c = 1; c < s.cols; c++) {
    startPos[c] = startPos[c - 1] + rowTerms[c - 1];
    steps++;
  }
  frames.push({
    out: [...out],
    rowTerms: [...rowTerms],
    startPos: [...startPos],
    steps,
    title: "Starting positions",
    text: "startPos[c] = startPos[c − 1] + rowTerms[c − 1]: where row c of the transpose begins.",
  });
  const next = [...startPos];
  s.terms.forEach(([r, c, v], i) => {
    const j = next[c]++;
    out[j] = [c, r, v];
    steps++;
    frames.push({
      scan: i,
      write: j,
      out: [...out],
      rowTerms: [...rowTerms],
      startPos: [...next],
      steps,
      title: `Place (${r}, ${c}, ${v}) at position ${j}`,
      text: `Its column ${c} says exactly where it goes; then startPos[${c}] moves on by one.`,
    });
  });
  frames.push({
    out: [...out],
    rowTerms: [...rowTerms],
    startPos: [...next],
    steps,
    title: `Done after ${steps} steps`,
    text: `Θ(cols + terms) = ${s.cols} + ${s.terms.length} work, instead of cols × terms.`,
  });
  return frames;
}

export type MultiplyFrame = {
  a?: number;
  b?: number;
  cell?: [number, number];
  acc: number[][];
  products: number;
  title: string;
  text: string;
};

/** C = A·B using only non-zero terms: each A(i,k) meets each B(k,j) with the same k. */
export function sparseMultiply(A: Sparse, B: Sparse): MultiplyFrame[] {
  const acc = Array.from({ length: A.rows }, () => new Array(B.cols).fill(0));
  const frames: MultiplyFrame[] = [];
  let products = 0;
  if (A.cols !== B.rows) {
    frames.push({
      acc,
      products,
      title: "Incompatible sizes",
      text: `A has ${A.cols} columns but B has ${B.rows} rows.`,
    });
    return frames;
  }
  A.terms.forEach(([i, k, va], ai) => {
    B.terms.forEach(([k2, j, vb], bi) => {
      if (k2 !== k) return;
      acc[i][j] += va * vb;
      products++;
      frames.push({
        a: ai,
        b: bi,
        cell: [i, j],
        acc: acc.map((r) => [...r]),
        products,
        title: `A(${i},${k}) × B(${k},${j}) = ${va} × ${vb}`,
        text: `Add ${va * vb} to C(${i},${j}), now ${acc[i][j]}. Zeros are never touched.`,
      });
    });
  });
  frames.push({
    acc: acc.map((r) => [...r]),
    products,
    title: `Done: ${products} multiplications`,
    text: `A dense product would need ${A.rows} × ${A.cols} × ${B.cols} = ${A.rows * A.cols * B.cols} multiplications.`,
  });
  return frames;
}
