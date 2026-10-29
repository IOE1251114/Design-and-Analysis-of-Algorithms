/* Unit II (recursion, backtracking) and Unit III (Tower of Hanoi). Pure frame generators. */

/* ---------- Call stack for factorial ---------- */

export type StackFrame = {
  stack: string[];
  /** Value being returned from the frame that just popped. */
  returned?: number;
  phase: "call" | "base" | "return";
  title: string;
  text: string;
};

export function factorialFrames(n: number): StackFrame[] {
  const frames: StackFrame[] = [];
  const stack: string[] = [];
  const deepest = Math.min(n, 1);
  for (let k = n; k >= deepest; k--) {
    stack.push(`fact(${k})`);
    const base = k === deepest;
    frames.push({
      stack: [...stack],
      phase: base ? "base" : "call",
      title: base ? `fact(${k}) hits the base case` : `Call fact(${k})`,
      text: base
        ? "The base case returns 1 without calling itself, so the calls stop growing."
        : `fact(${k}) = ${k} × fact(${k - 1}) cannot finish yet: push a frame and recurse.`,
    });
  }
  let value = 1;
  for (let k = deepest; k <= n; k++) {
    if (k > 1) value *= k;
    stack.pop();
    frames.push({
      stack: [...stack],
      returned: value,
      phase: "return",
      title:
        k > 1
          ? `fact(${k}) returns ${k} × ${value / k} = ${value}`
          : `fact(${k}) returns 1`,
      text:
        k < n
          ? "Its frame is popped and the caller resumes where it left off."
          : `The stack held ${n - deepest + 1} frames at its deepest: recursion uses Θ(n) memory.`,
    });
  }
  return frames;
}

/* ---------- Recursion tree for Fibonacci ---------- */

export type FibNode = {
  id: number;
  n: number;
  parent: number | null;
  depth: number;
  /** Order in which the call was made. */
  order: number;
  /** True if fib(n) was already computed earlier in the tree. */
  repeat: boolean;
  value: number;
};

export function fibTree(n: number): FibNode[] {
  const nodes: FibNode[] = [];
  const seen = new Set<number>();
  let order = 0;
  const rec = (k: number, parent: number | null, depth: number): number => {
    const id = nodes.length;
    const node: FibNode = {
      id,
      n: k,
      parent,
      depth,
      order: order++,
      repeat: seen.has(k),
      value: 0,
    };
    nodes.push(node);
    node.value =
      k < 2 ? k : rec(k - 1, id, depth + 1) + rec(k - 2, id, depth + 1);
    seen.add(k);
    return node.value;
  };
  rec(n, null, 0);
  return nodes;
}

/* ---------- Backtracking: N-Queens ---------- */

export type QueensFrame = {
  /** queens[r] = column of the queen in row r (only rows placed so far). */
  queens: number[];
  try?: [number, number];
  attackedBy?: [number, number];
  action: "try" | "place" | "conflict" | "backtrack" | "solution";
  solutions: number;
  title: string;
  text: string;
};

export function queensFrames(n: number, limit = 600): QueensFrame[] {
  const frames: QueensFrame[] = [];
  const q: number[] = [];
  let solutions = 0;
  const attacker = (r: number, c: number): [number, number] | undefined => {
    for (let i = 0; i < r; i++)
      if (q[i] === c || Math.abs(q[i] - c) === r - i) return [i, q[i]];
  };
  const rec = (r: number): boolean => {
    if (frames.length >= limit) return true;
    if (r === n) {
      solutions++;
      frames.push({
        queens: [...q],
        action: "solution",
        solutions,
        title: `Solution ${solutions}`,
        text: "All rows hold a queen and none attack each other. Stop at the first solution.",
      });
      return true;
    }
    for (let c = 0; c < n; c++) {
      const hit = attacker(r, c);
      if (hit) {
        frames.push({
          queens: [...q],
          try: [r, c],
          attackedBy: hit,
          action: "conflict",
          solutions,
          title: `(${r}, ${c}) is attacked`,
          text: `The queen in row ${hit[0]} attacks it ${hit[1] === c ? "along the column" : "on a diagonal"}. Prune: try the next column.`,
        });
        continue;
      }
      q.push(c);
      frames.push({
        queens: [...q],
        action: "place",
        solutions,
        title: `Place a queen at (${r}, ${c})`,
        text: `Row ${r} is safe here. Recurse to row ${r + 1}.`,
      });
      if (rec(r + 1)) return true;
      q.pop();
      frames.push({
        queens: [...q],
        try: [r, c],
        action: "backtrack",
        solutions,
        title: `Backtrack from (${r}, ${c})`,
        text: `No column in row ${r + 1} worked, so undo this choice and try the next column in row ${r}.`,
      });
    }
    return false;
  };
  rec(0);
  if (!solutions)
    frames.push({
      queens: [],
      action: "backtrack",
      solutions,
      title: "No solution",
      text: `Every branch was pruned: ${n} queens cannot be placed on a ${n} × ${n} board.`,
    });
  return frames;
}

/* ---------- Tower of Hanoi ---------- */

export type Peg = "A" | "B" | "C";
export type HanoiMove = { disk: number; from: Peg; to: Peg; depth: number };

export function hanoiMoves(n: number): HanoiMove[] {
  const moves: HanoiMove[] = [];
  const rec = (k: number, from: Peg, via: Peg, to: Peg, depth: number) => {
    if (k === 0) return;
    rec(k - 1, from, to, via, depth + 1);
    moves.push({ disk: k, from, to, depth });
    rec(k - 1, via, from, to, depth + 1);
  };
  rec(n, "A", "B", "C", 0);
  return moves;
}

/** Peg contents (bottom → top) after the first `k` moves. */
export function hanoiState(n: number, moves: HanoiMove[], k: number) {
  const pegs: Record<Peg, number[]> = {
    A: Array.from({ length: n }, (_, i) => n - i),
    B: [],
    C: [],
  };
  for (let i = 0; i < k; i++) {
    const m = moves[i];
    pegs[m.to].push(pegs[m.from].pop()!);
  }
  return pegs;
}
